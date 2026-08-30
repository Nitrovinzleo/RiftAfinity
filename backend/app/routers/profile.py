import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.db_models import User
from app.models.schemas import ProfileUpdateRequest
from app.services.auth_service import decode_access_token
from app.services.riot_api import RiotApiClient, RiotApiError

logger = logging.getLogger("riftaffinity.profile")
router = APIRouter(prefix="/api/profile", tags=["Profil & Vérification Riot"])

def get_current_user_from_token(authorization: Optional[str], db: Session) -> User:
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Jeton d'authentification manquant.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Jeton invalide.")

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")
    return user

@router.post("/verify-icon", response_model=dict)
async def verify_riot_icon(
    api_key: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    """
    Méthode de vérification style Ori Bot / Discord Bot :
    Interroge l'API Riot Games pour vérifier si le joueur a changé sa photo de profil LoL par l'icône cible demandée.
    Si oui, le compte est marqué VÉRIFIÉ ✔️ et son classement (Rank LoL) est récupéré automatiquement !
    """
    user = get_current_user_from_token(authorization, db)
    riot_client = RiotApiClient(api_key=api_key)

    # 1. Détermination du cluster régional
    regional_cluster = "europe"
    if user.region in ["na1", "br1", "la1", "la2"]:
        regional_cluster = "americas"
    elif user.region in ["kr", "jp1"]:
        regional_cluster = "asia"

    # 2. Récupération du PUUID s'il n'était pas encore enregistré
    if not user.puuid:
        account_data = await riot_client.get_puuid_by_riot_id(user.game_name, user.tag_line, regional_cluster)
        user.puuid = account_data.get("puuid")
        db.commit()

    # 2b. Synchronisation automatique du Pseudo / TagLine si le joueur a changé de nom sur LoL
    if user.puuid:
        try:
            account = await riot_client.get_account_by_puuid(user.puuid, regional_cluster)
            new_name = account.get("gameName")
            new_tag = account.get("tagLine")
            if new_name and new_tag and (new_name != user.game_name or new_tag != user.tag_line):
                logger.info(f"Changement de pseudo détecté : {user.full_riot_id} -> {new_name}#{new_tag}")
                user.game_name = new_name
                user.tag_line = new_tag
                db.commit()
        except Exception as e:
            logger.warning(f"Impossible de vérifier le changement de pseudo par PUUID: {e}")

    # 3. Récupération des infos d'invocateur via SUMMONER-V4
    summoner_data = await riot_client.get_summoner_by_puuid(user.puuid, user.region)
    current_icon_id = summoner_data.get("profileIconId")
    summoner_id = summoner_data.get("id")

    user.current_icon_id = current_icon_id
    user.summoner_id = summoner_id

    # 4. Vérification si l'icône active correspond à l'icône cible demandée
    is_match = (current_icon_id == user.target_icon_id)
    if is_match:
        user.is_verified = True
        logger.info(f"Compte {user.full_riot_id} VÉRIFIÉ avec succès !")

    # 5. Récupération automatique du Rank Solo/Duo via LEAGUE-V4
    if summoner_id:
        try:
            entries = await riot_client.get_league_entries_by_summoner_id(summoner_id, user.region)
            solo_entry = next((e for e in entries if e.get("queueType") == "RANKED_SOLO_5x5"), None)
            flex_entry = next((e for e in entries if e.get("queueType") == "RANKED_FLEX_SR"), None)
            
            target_entry = solo_entry or flex_entry
            if target_entry:
                user.rank_tier = target_entry.get("tier")
                user.rank_division = target_entry.get("rank")
                user.rank_lp = target_entry.get("leaguePoints")
                user.rank_wins = target_entry.get("wins")
                user.rank_losses = target_entry.get("losses")
                logger.info(f"Rank automatique récupéré pour {user.full_riot_id}: {user.rank_tier} {user.rank_division} ({user.rank_lp} LP)")
            else:
                user.rank_tier = "UNRANKED"
                user.rank_division = ""
                user.rank_lp = 0
        except Exception as e:
            logger.warning(f"Erreur lors de la récupération du classement: {e}")

    # 6. Récupération automatique du Champion Favori (Maîtrise de Champion #1)
    if user.puuid:
        try:
            top_masteries = await riot_client.get_top_champion_masteries(user.puuid, user.region)
            if top_masteries:
                top_champ_id = top_masteries[0].get("championId")
                if top_champ_id:
                    top_champ_name = await riot_client.get_champion_name_from_id(top_champ_id)
                    user.favorite_champion = top_champ_name
                    logger.info(f"Main Champion automatique détecté pour {user.full_riot_id}: {top_champ_name}")
        except Exception as e:
            logger.warning(f"Erreur lors de la récupération des maîtrises de champion: {e}")

    db.commit()
    db.refresh(user)

    user_dict = {
        "id": user.id,
        "email": user.email,
        "gameName": user.game_name,
        "tagLine": user.tag_line,
        "region": user.region,
        "isVerified": user.is_verified,
        "targetIconId": user.target_icon_id,
        "currentIconId": user.current_icon_id,
        "age": user.age,
        "bio": user.bio,
        "primaryRole": user.primary_role,
        "favoriteChampion": user.favorite_champion,
        "rankTier": user.rank_tier,
        "rankDivision": user.rank_division,
        "rankLp": user.rank_lp
    }

    return {
        "isVerified": user.is_verified,
        "targetIconId": user.target_icon_id,
        "currentIconId": user.current_icon_id,
        "matchSuccess": is_match,
        "rankTier": user.rank_tier,
        "rankDivision": user.rank_division,
        "rankLp": user.rank_lp,
        "favoriteChampion": user.favorite_champion,
        "user": user_dict,
        "message": "Félicitations ! Votre compte Riot Games a été VÉRIFIÉ avec succès !" if is_match else f"Icône actuelle #{current_icon_id} différente de l'icône requise #{user.target_icon_id}. Veuillez équiper l'icône #{user.target_icon_id} dans LoL et réessayez !"
    }

@router.put("/update", response_model=dict)
async def update_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Mise à jour des données du profil utilisateur (Âge, Bio, Rôle principal, Champion favori).
    """
    user = get_current_user_from_token(authorization, db)

    if req.age is not None:
        user.age = req.age
    if req.bio is not None:
        user.bio = req.bio
    if req.primaryRole is not None:
        user.primary_role = req.primaryRole
    if req.favoriteChampion is not None:
        user.favorite_champion = req.favoriteChampion

    db.commit()
    db.refresh(user)

    return {
        "message": "Profil mis à jour avec succès !",
        "user": {
            "id": user.id,
            "email": user.email,
            "gameName": user.game_name,
            "tagLine": user.tag_line,
            "region": user.region,
            "isVerified": user.is_verified,
            "targetIconId": user.target_icon_id,
            "currentIconId": user.current_icon_id,
            "age": user.age,
            "bio": user.bio,
            "primaryRole": user.primary_role,
            "favoriteChampion": user.favorite_champion,
            "rankTier": user.rank_tier,
            "rankDivision": user.rank_division,
            "rankLp": user.rank_lp
        }
    }
