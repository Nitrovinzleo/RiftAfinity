import logging
from fastapi import APIRouter, Depends, HTTPException, Header, Query
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.db_models import User, DuoSwipe, DiscordPendingLink
from app.models.schemas import ProfileUpdateRequest, ChangePasswordRequest, ChangeEmailRequest
from app.services.auth_service import decode_access_token, hash_password, verify_password, create_access_token
from app.services.riot_api import RiotApiClient, RiotApiError

logger = logging.getLogger("riftaffinity.profile")
router = APIRouter(tags=["Profil & Vérification Riot"])

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

async def perform_full_riot_sync(user: User, riot_client: RiotApiClient, db: Session):
    """
    Synchronisation complète depuis l'API Riot Games :
    1. Pseudo & Tag (ACCOUNT-V1 par PUUID)
    2. Photo de profil / Icône active (SUMMONER-V4)
    3. Statut de vérification d'icône
    4. Classement Rank Solo/Duo & Flex (LEAGUE-V4)
    5. Main Champion favori (CHAMPION-MASTERY-V4)
    """
    regional_cluster = "europe"
    if user.region in ["na1", "br1", "la1", "la2"]:
        regional_cluster = "americas"
    elif user.region in ["kr", "jp1"]:
        regional_cluster = "asia"

    # 1. PUUID
    if not user.puuid:
        try:
            account_data = await riot_client.get_puuid_by_riot_id(user.game_name, user.tag_line, regional_cluster)
            user.puuid = account_data.get("puuid")
            db.commit()
        except Exception as e:
            logger.warning(f"Impossible de résoudre le PUUID: {e}")

    # 2. Pseudo & Tag# à jour
    if user.puuid:
        try:
            account = await riot_client.get_account_by_puuid(user.puuid, regional_cluster)
            new_name = account.get("gameName")
            new_tag = account.get("tagLine")
            if new_name and new_tag:
                user.game_name = new_name
                user.tag_line = new_tag
        except Exception as e:
            logger.warning(f"Impossible de synchroniser le pseudo: {e}")

    # 3. Icône Invocateur, Summoner ID & Photo de profil LoL
    if user.puuid:
        try:
            summoner_data = await riot_client.get_summoner_by_puuid(user.puuid, user.region)
            icon_id = summoner_data.get("profileIconId")
            user.current_icon_id = icon_id
            user.summoner_id = summoner_data.get("id")

            # Met automatiquement à jour la photo de profil avec l'icône LoL active
            if icon_id:
                user.custom_avatar = f"https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/{icon_id}.png"

            # Statut vérification icône
            if user.current_icon_id == user.target_icon_id:
                user.is_verified = True
        except Exception as e:
            logger.warning(f"Impossible de synchroniser l'icône invocateur: {e}")

    # 4. Classement Rank Solo/Duo & Flex via PUUID / Summoner ID
    if user.puuid:
        try:
            entries = await riot_client.get_league_entries_by_puuid(user.puuid, user.region, summoner_id=user.summoner_id)
            solo_entry = next((e for e in entries if e.get("queueType") == "RANKED_SOLO_5x5"), None)
            flex_entry = next((e for e in entries if e.get("queueType") == "RANKED_FLEX_SR"), None)
            
            target_entry = solo_entry or flex_entry
            if target_entry:
                user.rank_tier = target_entry.get("tier")
                user.rank_division = target_entry.get("rank")
                user.rank_lp = target_entry.get("leaguePoints")
                user.rank_wins = target_entry.get("wins")
                user.rank_losses = target_entry.get("losses")
            else:
                user.rank_tier = "UNRANKED"
                user.rank_division = ""
                user.rank_lp = 0
        except Exception as e:
            logger.warning(f"Erreur lors de la récupération du classement par PUUID: {e}")


    # 5. Champion Favori (#1 Maîtrise)
    if user.puuid:
        try:
            top_masteries = await riot_client.get_top_champion_masteries(user.puuid, user.region)
            if top_masteries:
                top_champ_id = top_masteries[0].get("championId")
                if top_champ_id:
                    top_champ_name = await riot_client.get_champion_name_from_id(top_champ_id)
                    user.favorite_champion = top_champ_name
        except Exception as e:
            logger.warning(f"Erreur lors de la récupération des maîtrises: {e}")

    db.commit()
    db.refresh(user)

@router.post("/refresh-all", response_model=dict)
async def refresh_all_riot_data(
    api_key: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Bouton "Mettre à jour mon profil LoL" :
    Recontrôle et synchronise automatiquement en direct :
    - Le Pseudo & Tag# (si le joueur a changé de nom)
    - La Photo de Profil / Icône d'invocateur LoL
    - Le Classement Solo/Duo & Flex (Tier, Rank, LP)
    - Le Champion Favori n°1 par points de maîtrise Riot Games
    """
    user = get_current_user_from_token(authorization, db)
    riot_client = RiotApiClient(api_key=api_key)

    await perform_full_riot_sync(user, riot_client, db)

    return {
        "message": "Votre profil (Pseudo, Photo de profil, Rank & Champions) a été entièrement synchronisé avec succès !",
        "user": user.to_dict()
    }

@router.post("/verify-icon", response_model=dict)
async def verify_riot_icon(
    api_key: Optional[str] = Query(None),
    authorization: Optional[str] = Header(None), 
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)
    riot_client = RiotApiClient(api_key=api_key)

    await perform_full_riot_sync(user, riot_client, db)

    is_match = (user.current_icon_id == user.target_icon_id)

    return {
        "isVerified": user.is_verified,
        "targetIconId": user.target_icon_id,
        "currentIconId": user.current_icon_id,
        "matchSuccess": is_match,
        "rankTier": user.rank_tier,
        "rankDivision": user.rank_division,
        "rankLp": user.rank_lp,
        "favoriteChampion": user.favorite_champion,
        "user": user.to_dict(),
        "message": "Félicitations ! Votre compte Riot Games a été VÉRIFIÉ avec succès !" if is_match else f"Icône actuelle #{user.current_icon_id} différente de l'icône requise #{user.target_icon_id}. Veuillez équiper l'icône #{user.target_icon_id} dans LoL et réessayez !"
    }

@router.put("/update", response_model=dict)
async def update_profile(
    req: ProfileUpdateRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)

    if req.customAvatar is not None:
        user.custom_avatar = req.customAvatar

    if req.birthDate is not None:
        user.birth_date = req.birthDate
        user.age = user.calculated_age
    elif req.age is not None:
        user.age = req.age

    if req.bio is not None:
        user.bio = req.bio
    if req.primaryRole is not None:
        user.primary_role = req.primaryRole
    if req.favoriteChampion is not None:
        user.favorite_champion = req.favoriteChampion

    if req.discordTag is not None:
        user.discord_tag = req.discordTag
    if req.instagramUsername is not None:
        user.instagram_username = req.instagramUsername
    if req.tiktokUsername is not None:
        user.tiktok_username = req.tiktokUsername
    if req.twitchUsername is not None:
        user.twitch_username = req.twitchUsername
    if req.twitterUsername is not None:
        user.twitter_username = req.twitterUsername
    if req.displayName is not None:
        user.display_name = req.displayName.strip() if req.displayName else None
    if req.spokenLanguages is not None:
        user.spoken_languages = req.spokenLanguages.strip() if req.spokenLanguages else None

    db.commit()
    db.refresh(user)

    return {
        "message": "Profil mis à jour avec succès !",
        "user": user.to_dict()
    }

@router.put("/change-password", response_model=dict)
async def change_password(
    req: ChangePasswordRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)
    
    pwd_clean = req.currentPassword.strip()
    if not verify_password(pwd_clean, user.hashed_password) and not verify_password(req.currentPassword, user.hashed_password):
        raise HTTPException(status_code=400, detail="Le mot de passe actuel est incorrect.")

    if len(req.newPassword.strip()) < 4:
        raise HTTPException(status_code=400, detail="Le nouveau mot de passe doit contenir au moins 4 caractères.")

    user.hashed_password = hash_password(req.newPassword.strip())
    db.commit()
    db.refresh(user)

    return {"message": "Mot de passe mis à jour avec succès !"}

@router.put("/change-email", response_model=dict)
async def change_email(
    req: ChangeEmailRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)

    pwd_clean = req.password.strip()
    if not verify_password(pwd_clean, user.hashed_password) and not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=400, detail="Mot de passe incorrect pour valider le changement d'email.")

    new_email_clean = req.newEmail.strip().lower()
    if "@" not in new_email_clean or "." not in new_email_clean:
        raise HTTPException(status_code=400, detail="Veuillez fournir une adresse e-mail valide.")

    existing = db.query(User).filter(User.email == new_email_clean, User.id != user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Cette adresse e-mail est déjà utilisée par un autre compte.")

    user.email = new_email_clean
    db.commit()
    db.refresh(user)

    new_token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "message": "Adresse e-mail mise à jour avec succès !",
        "token": new_token,
        "user": user.to_dict()
    }

@router.delete("/delete-account", response_model=dict)
async def delete_account(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)

    # Nettoyage des swipes où l'utilisateur est swiper ou cible
    db.query(DuoSwipe).filter((DuoSwipe.swiper_id == user.id) | (DuoSwipe.target_id == user.id)).delete(synchronize_session=False)

    # Nettoyage des pending links discord
    if user.discord_id:
        db.query(DiscordPendingLink).filter(DiscordPendingLink.discord_id == user.discord_id).delete(synchronize_session=False)

    # Suppression du compte
    db.delete(user)
    db.commit()

    return {"message": "Votre compte a été supprimé définitivement."}

