import asyncio
import urllib.parse
from typing import List, Dict, Any, Optional, Tuple
import httpx
import logging

from app.config import settings
from app.services.cache import cache_service

logger = logging.getLogger("riftaffinity.riot_api")

class RiotApiError(Exception):
    """Exception personnalisée pour les erreurs liées à l'API Riot Games."""
    def __init__(self, status_code: int, message: str):
        self.status_code = status_code
        self.message = message
        super().__init__(f"Riot API Error [{status_code}]: {message}")

class RiotApiClient:
    """
    Client asynchrone ultra-performant pour interagir avec les endpoints Account-V1 et Match-V5
    de Riot Games avec gestion de rate limit, retries automatiques et intersection de matchs.
    """
    def __init__(self, api_key: Optional[str] = None):
        # Utilise la clé API transmise ou la clé de configuration par défaut
        self.api_key = api_key if (api_key and api_key.strip()) else settings.RIOT_API_KEY
        # Sémaphore pour limiter le nombre de requêtes simultanées (évite le burst rate limit)
        self._semaphore = asyncio.Semaphore(5)

    def _get_headers(self) -> Dict[str, str]:
        return {
            "X-Riot-Token": self.api_key,
            "Accept-Language": "fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7",
            "User-Agent": "RiftAffinity/1.0"
        }

    async def _make_request(self, url: str) -> Any:
        """
        Effectue une requête HTTP GET vers l'API Riot avec gestion transparente du Rate Limit (429).
        """
        cache_key = f"riot_req_{url}"
        cached_res = await cache_service.get(cache_key)
        if cached_res is not None:
            return cached_res

        headers = self._get_headers()
        max_retries = 3

        async with self._semaphore:
            async with httpx.AsyncClient(timeout=15.0) as client:
                for attempt in range(max_retries):
                    try:
                        response = await client.get(url, headers=headers)
                        
                        # Gestion du quota (HTTP 429 Too Many Requests)
                        if response.status_code == 429:
                            retry_after = int(response.headers.get("Retry-After", "2"))
                            logger.warning(f"Rate Limit atteint sur {url}. Attente de {retry_after} secondes...")
                            await asyncio.sleep(retry_after + 0.5)
                            continue

                        if response.status_code == 404:
                            raise RiotApiError(404, "Ressource non trouvée (pseudo introuvable ou match n'existant pas).")
                        elif response.status_code == 401 or response.status_code == 403:
                            raise RiotApiError(response.status_code, "Clé API Riot invalide ou expirée. Les clés gratuites de développement expirent toutes les 24h. Veuillez renouveler votre clé sur developer.riotgames.com ou utiliser le Mode Démo !")
                        elif response.status_code != 200:
                            raise RiotApiError(response.status_code, f"Erreur API Riot: {response.text}")

                        data = response.json()
                        # Mettre en cache la réponse réussie (Match details sont immuables -> TTL long)
                        ttl = 86400 if "/matches/EUW1_" in url or "/matches/" in url else 3600
                        await cache_service.set(cache_key, data, ttl=ttl)
                        return data

                    except httpx.RequestError as exc:
                        if attempt == max_retries - 1:
                            logger.error(f"Erreur réseau vers Riot API ({url}): {exc}")
                            raise RiotApiError(503, "Impossible d'atteindre les serveurs de Riot Games.")
                        await asyncio.sleep(1.0)

        raise RiotApiError(500, "Nombre maximal de tentatives de requête dépassé.")

    async def get_puuid_by_riot_id(self, game_name: str, tag_line: str, regional_cluster: str) -> Dict[str, Any]:
        """
        Étape 1 : Récupération du PUUID unique via ACCOUNT-V1.
        Gère l'encodage des caractères spéciaux (ex: '8ï8', '#EUW', espaces, emojis).
        """
        # Nettoyage et suppression du '#' initial si l'utilisateur l'a saisi
        clean_tag = tag_line.strip().lstrip("#")
        clean_name = game_name.strip()

        # Encodage URL sécurisé pour les caractères spéciaux Unicode (comme ï, é, etc.)
        encoded_name = urllib.parse.quote(clean_name)
        encoded_tag = urllib.parse.quote(clean_tag)

        url = f"https://{regional_cluster}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/{encoded_name}/{encoded_tag}"
        logger.info(f"Recherche PUUID pour {clean_name}#{clean_tag} sur le cluster {regional_cluster}")
        
        try:
            account_data = await self._make_request(url)
            return account_data
        except RiotApiError as e:
            if e.status_code == 404:
                raise RiotApiError(404, f"Le compte Riot ID '{clean_name}#{clean_tag}' n'a pas été trouvé sur la région sélectionnée.")
            raise e

    async def get_all_match_ids_for_puuid(self, puuid: str, regional_cluster: str, max_matches: int = 300) -> List[str]:
        """
        Étape 2 : Récupération de l'historique complet des matchs par pagination MATCH-V5.
        Effectue des boucles successives par paquets de 100 matchs (start=0, start=100, etc.)
        jusqu'à recevoir une liste vide ou atteindre max_matches.
        """
        all_match_ids: List[str] = []
        count_per_page = 100
        start_index = 0

        while start_index < max_matches:
            url = (
                f"https://{regional_cluster}.api.riotgames.com/lol/match/v5/matches/by-puuid/{puuid}/ids"
                f"?start={start_index}&count={count_per_page}"
            )
            
            match_page = await self._make_request(url)
            
            if not isinstance(match_page, list) or len(match_page) == 0:
                # Plus de matchs disponibles dans l'historique
                break

            all_match_ids.extend(match_page)
            
            if len(match_page) < count_per_page:
                # Dernière page atteinte
                break
                
            start_index += count_per_page

        logger.info(f"Récupéré {len(all_match_ids)} matchs au total pour le PUUID {puuid[:10]}...")
        return all_match_ids

    async def get_common_matches_details(
        self, 
        puuid1: str, 
        puuid2: str, 
        regional_cluster: str,
        max_search: int = 300
    ) -> List[Dict[str, Any]]:
        """
        Étape 2 Suite : Optimisation par intersection d'ensembles.
        1. Récupère la liste des matchs des deux joueurs.
        2. Fait l'intersection des IDs avec set(matches_p1) & set(matches_p2).
        3. Récupère uniquement les détails de ces matchs communs.
        4. Ne conserve que les matchs où les deux joueurs étaient DANS LA MÊME ÉQUIPE.
        """
        # Récupération asynchrone simultanée des IDs de matchs des deux joueurs
        match_ids_p1_task = self.get_all_match_ids_for_puuid(puuid1, regional_cluster, max_matches=max_search)
        match_ids_p2_task = self.get_all_match_ids_for_puuid(puuid2, regional_cluster, max_matches=max_search)
        
        match_ids_p1, match_ids_p2 = await asyncio.gather(match_ids_p1_task, match_ids_p2_task)

        # Intersection des ensembles Python (set(matches_j1) & set(matches_j2))
        common_match_ids = list(set(match_ids_p1) & set(match_ids_p2))
        logger.info(f"Trouvé {len(common_match_ids)} matchs communs potentiels via l'intersection.")

        if not common_match_ids:
            return []

        # Limiter à 50 matchs récents joués ensemble pour l'analyse détaillée
        common_match_ids = common_match_ids[:50]

        # Téléchargement asynchrone parallèle des détails de chaque match commun
        match_detail_tasks = [
            self._make_request(f"https://{regional_cluster}.api.riotgames.com/lol/match/v5/matches/{m_id}")
            for m_id in common_match_ids
        ]
        
        all_raw_details = await asyncio.gather(*match_detail_tasks, return_exceptions=True)

        verified_duo_matches = []
        for match_data in all_raw_details:
            if isinstance(match_data, Exception) or not match_data:
                continue

            info = match_data.get("info", {})
            participants = info.get("participants", [])

            # Extraction des participants correspondant à nos deux joueurs
            p1_data = next((p for p in participants if p.get("puuid") == puuid1), None)
            p2_data = next((p for p in participants if p.get("puuid") == puuid2), None)

            # Vérification : Les deux joueurs doivent être trouvés ET dans la même équipe
            if p1_data and p2_data and p1_data.get("teamId") == p2_data.get("teamId"):
                verified_duo_matches.append({
                    "metadata": match_data.get("metadata", {}),
                    "info": info,
                    "player1_participant": p1_data,
                    "player2_participant": p2_data,
                })

        logger.info(f"Retenu {len(verified_duo_matches)} matchs où les joueurs étaient réellement coéquipiers.")
        return verified_duo_matches

    async def get_summoner_by_puuid(self, puuid: str, platform_region: str) -> Dict[str, Any]:
        """
        Récupère les informations de l'invocateur (y compris profileIconId et summonerId) via SUMMONER-V4.
        """
        url = f"https://{platform_region}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/{puuid}"
        return await self._make_request(url)

    async def get_league_entries_by_summoner_id(self, summoner_id: str, platform_region: str) -> List[Dict[str, Any]]:
        """
        Récupère les classements et le rang (Tier, Rank, LP, Winrate) de l'invocateur via LEAGUE-V4.
        """
        url = f"https://{platform_region}.api.riotgames.com/lol/league/v4/entries/by-summoner/{summoner_id}"
        try:
            return await self._make_request(url)
        except Exception as e:
            logger.warning(f"Impossible de récupérer le classement pour summoner_id {summoner_id}: {e}")
            return []

    async def get_account_by_puuid(self, puuid: str, regional_cluster: str) -> Dict[str, Any]:
        """
        Récupère le pseudo et tagLine à jour par PUUID via ACCOUNT-V1.
        S'adapte automatiquement si le joueur change de pseudo sur League of Legends !
        """
        url = f"https://{regional_cluster}.api.riotgames.com/riot/account/v1/accounts/by-puuid/{puuid}"
        return await self._make_request(url)

    async def get_top_champion_masteries(self, puuid: str, platform_region: str) -> List[Dict[str, Any]]:
        """
        Récupère les champions les plus joués (Maîtrise de Champion) via CHAMPION-MASTERY-V4.
        """
        url = f"https://{platform_region}.api.riotgames.com/lol/champion-mastery/v4/champion-masteries/by-puuid/{puuid}/top?count=3"
        try:
            return await self._make_request(url)
        except Exception as e:
            logger.warning(f"Impossible de récupérer les maîtrises de champions pour {puuid}: {e}")
            return []

    async def get_champion_name_from_id(self, champion_id: int) -> str:
        """
        Convertit un Champion ID numérique (ex: 157) en Nom de Champion (ex: Yasuo) via DataDragon.
        """
        url = "https://ddragon.leagueoflegends.com/cdn/14.10.1/data/fr_FR/champion.json"
        try:
            dd_data = await self._make_request(url)
            champs = dd_data.get("data", {})
            for c_name, c_data in champs.items():
                if c_data.get("key") == str(champion_id):
                    return c_data.get("name", c_name)
        except Exception as e:
            logger.warning(f"Erreur lors de la résolution du nom de champion pour ID {champion_id}: {e}")
        return f"Champion #{champion_id}"
