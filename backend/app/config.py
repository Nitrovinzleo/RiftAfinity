import os
from typing import Dict
from dotenv import load_dotenv

# Chargement des variables d'environnement à partir du fichier .env
load_dotenv()

class Settings:
    """
    Configuration globale de l'application FastAPI backend DuoSync.
    Gère la clé API Riot, les associations de régions et les paramètres de cache.
    """
    # Clé API Riot Games (obtenue sur https://developer.riotgames.com/)
    RIOT_API_KEY: str = os.getenv("RIOT_API_KEY", "RGAPI-demo-key-placeholder")

    # URL ou chaîne de connexion Redis (Optionnel, Upstash Redis par exemple)
    REDIS_URL: str = os.getenv("REDIS_URL", "")

    # Durée de rétention du cache en secondes (par défaut : 2 heures = 7200s)
    CACHE_TTL: int = int(os.getenv("CACHE_TTL", "7200"))

    # Limite maximale de matchs à analyser par joueur (pour optimiser l'historique et les quotas)
    MAX_MATCHES_TO_FETCH: int = int(os.getenv("MAX_MATCHES_TO_FETCH", "300"))

    # Mapping des serveurs de jeu (Platform IDs) vers les régions globales d'API Riot (Regional Routing IDs)
    # L'API Account-V1 et Match-V5 nécessitent le routage régional (americas, europe, asia, sea)
    REGION_ROUTING_MAP: Dict[str, str] = {
        "euw1": "europe",
        "eun1": "europe",
        "tr1": "europe",
        "ru": "europe",
        "na1": "americas",
        "br1": "americas",
        "la1": "americas",
        "la2": "americas",
        "kr": "asia",
        "jp1": "asia",
        "oc1": "sea",
        "ph2": "sea",
        "sg2": "sea",
        "th2": "sea",
        "tw2": "sea",
        "vn2": "sea"
    }

    @classmethod
    def get_regional_routing(cls, platform_region: str) -> str:
        """
        Convertit une région de plateforme (ex: 'euw1', 'na1') en cluster régional Riot API (ex: 'europe', 'americas').
        """
        region_clean = platform_region.lower().strip()
        return cls.REGION_ROUTING_MAP.get(region_clean, "europe")

settings = Settings()
