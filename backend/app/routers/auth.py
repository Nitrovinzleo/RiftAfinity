import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
import secrets
from datetime import datetime, timedelta
from typing import Optional
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.db_models import User, DiscordPendingLink
from app.models.schemas import UserRegisterRequest, UserLoginRequest, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from app.services.riot_api import RiotApiClient
from app.routers.profile import perform_full_riot_sync


logger = logging.getLogger("riftaffinity.auth")
router = APIRouter(tags=["Authentification"])

def parse_riot_id(riot_id_str: str):
    trimmed = riot_id_str.strip()
    if "#" in trimmed:
        idx = trimmed.rfind("#")
        return trimmed[:idx].strip(), trimmed[idx+1:].strip()
    return trimmed, "EUW"

@router.post("/register", response_model=dict)
async def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    game_name, tag_line = parse_riot_id(req.riotId)
    if not game_name or not tag_line:
        raise HTTPException(status_code=400, detail="Veuillez fournir un Riot ID valide au format Pseudo#TAG.")

    # Tentative optionnelle de récupération du PUUID
    puuid = None
    try:
        riot_client = RiotApiClient()
        regional_cluster = "europe"
        if req.region in ["na1", "br1", "la1", "la2"]:
            regional_cluster = "americas"
        elif req.region in ["kr", "jp1"]:
            regional_cluster = "asia"
            
        account_data = await riot_client.get_puuid_by_riot_id(game_name, tag_line, regional_cluster)
        puuid = account_data.get("puuid")
    except Exception as e:
        logger.warning(f"Impossible de résoudre le PUUID à l'inscription: {e}")

    # Vérification si l'adresse e-mail existe déjà
    existing_user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Un compte avec cette adresse e-mail existe déjà. Veuillez vous connecter."
        )


    new_user = User(
        email=req.email.strip().lower(),
        hashed_password=hash_password(req.password),
        game_name=game_name,
        tag_line=tag_line,
        region=req.region,
        puuid=puuid
    )
    
    try:
        db.add(new_user)
        db.commit()
        db.refresh(new_user)
        # Synchronisation automatique initiale (Rang, Avatar LoL, Icone, Main Champ)
        await perform_full_riot_sync(new_user, riot_client, db)
    except Exception as e:
        logger.warning(f"Erreur lors de la synchronisation initiale post-inscription: {e}")


    token = create_access_token({"sub": str(new_user.id), "email": new_user.email})

    return {
        "token": token,
        "user": new_user.to_dict()
    }

@router.post("/login", response_model=dict)
async def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    try:
        email_clean = req.email.strip().lower()
        
        # Recherche exacte puis insensible à la casse sur PostgreSQL
        user = db.query(User).filter(User.email == email_clean).first()
        if not user:
            user = db.query(User).filter(User.email.ilike(email_clean)).first()
        
        if not user:
            raise HTTPException(
                status_code=400, 
                detail="Aucun compte trouvé avec cette adresse email. Veuillez cliquer sur 'Créer votre Compte' !"
            )

        pwd_clean = req.password.strip()
        if not verify_password(pwd_clean, user.hashed_password) and not verify_password(req.password, user.hashed_password):
            raise HTTPException(status_code=400, detail="Mot de passe incorrect. Veuillez vérifier la saisie.")

        token = create_access_token({"sub": str(user.id), "email": user.email})

        return {
            "token": token,
            "user": user.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur serveur durant la connexion: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur lors de la connexion: {str(e)}")

@router.get("/me", response_model=dict)
async def get_current_user(authorization: Optional[str] = Header(None), db: Session = Depends(get_db)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Jeton d'authentification manquant.")
    
    token = authorization.split(" ")[1]
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Jeton d'authentification invalide ou expiré.")

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable.")

    # Détection automatique du changement de pseudo LoL par PUUID permanent
    if user.puuid:
        try:
            regional_cluster = "europe"
            if user.region in ["na1", "br1", "la1", "la2"]:
                regional_cluster = "americas"
            elif user.region in ["kr", "jp1"]:
                regional_cluster = "asia"

            riot_client = RiotApiClient()
            account = await riot_client.get_account_by_puuid(user.puuid, regional_cluster)
            new_name = account.get("gameName")
            new_tag = account.get("tagLine")
            if new_name and new_tag and (new_name != user.game_name or new_tag != user.tag_line):
                logger.info(f"Nouveau pseudo détecté pour le PUUID permanent {user.puuid}: {new_name}#{new_tag}")
                user.game_name = new_name
                user.tag_line = new_tag
                db.commit()
                db.refresh(user)
        except Exception as e:
            logger.warning(f"Impossible de vérifier le changement de pseudo: {e}")

    return user.to_dict()


class DiscordLinkRequest(BaseModel):
    discordId: str = Field(..., description="ID numérique Discord de l'utilisateur")
    discordTag: Optional[str] = Field(None, description="Nom d'utilisateur / Tag Discord")
    riotId: str = Field(..., description="Riot ID au format GameName#TagLine")
    region: Optional[str] = Field("euw1", description="Région LoL (ex: euw1)")


@router.post("/discord-link", response_model=dict)
async def link_discord_account(req: DiscordLinkRequest, db: Session = Depends(get_db)):
    """
    Associe un identifiant Discord à un compte utilisateur / Riot ID dans la base de données.
    """
    game_name, tag_line = parse_riot_id(req.riotId)
    if not game_name or not tag_line:
        raise HTTPException(status_code=400, detail="Riot ID invalide. Format attendu : Pseudo#TAG")

    discord_id_str = str(req.discordId).strip()
    
    # 1. Vérifier si un utilisateur a déjà cet ID Discord
    user = db.query(User).filter(User.discord_id == discord_id_str).first()

    if not user:
        # 2. Chercher par game_name + tag_line (insensible à la casse si possible)
        user = db.query(User).filter(
            User.game_name.ilike(game_name),
            User.tag_line.ilike(tag_line)
        ).first()

    # 3. Récupération PUUID optionnelle via Riot API
    puuid = None
    try:
        riot_client = RiotApiClient()
        regional_cluster = "europe"
        reg = req.region.lower() if req.region else "euw1"
        if reg in ["na1", "br1", "la1", "la2"]:
            regional_cluster = "americas"
        elif reg in ["kr", "jp1"]:
            regional_cluster = "asia"

        acc = await riot_client.get_puuid_by_riot_id(game_name, tag_line, regional_cluster)
        puuid = acc.get("puuid")
        if acc.get("gameName"):
            game_name = acc.get("gameName")
        if acc.get("tagLine"):
            tag_line = acc.get("tagLine")
    except Exception as e:
        logger.warning(f"Impossible de vérifier le PUUID pour l'association Discord: {e}")

    if user:
        user.discord_id = discord_id_str
        if req.discordTag:
            user.discord_tag = req.discordTag
        user.game_name = game_name
        user.tag_line = tag_line
        user.region = req.region or user.region or "euw1"
        if puuid:
            user.puuid = puuid
        db.commit()
        db.refresh(user)
        return {
            "message": f"Compte Discord lié avec succès au Riot ID {user.full_riot_id}",
            "user": user.to_dict()
        }

    # Création d'un nouveau compte lié Discord
    dummy_email = f"discord_{discord_id_str}@riftaffinity.app"
    new_user = User(
        email=dummy_email,
        hashed_password=hash_password("discord_linked_account"),
        game_name=game_name,
        tag_line=tag_line,
        region=req.region or "euw1",
        puuid=puuid,
        discord_id=discord_id_str,
        discord_tag=req.discordTag
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "message": f"Nouveau compte créé et lié au compte Discord pour {new_user.full_riot_id}",
        "user": new_user.to_dict()
    }


@router.get("/discord-user/{discord_id}", response_model=dict)
async def get_user_by_discord_id(discord_id: str, db: Session = Depends(get_db)):
    """
    Retrouve le profil et le Riot ID associé à un identifiant Discord (ID numérique ou Tag).
    """
    clean_id = str(discord_id).strip()
    user = db.query(User).filter(User.discord_id == clean_id).first()

    if not user and "#" in clean_id:
        user = db.query(User).filter(User.discord_tag == clean_id).first()

    if not user:
        raise HTTPException(
            status_code=404, 
            detail=f"Aucun compte Riot n'est associé à l'utilisateur Discord ID '{clean_id}'."
        )

    return {
        "discordId": user.discord_id,
        "discordTag": user.discord_tag,
        "gameName": user.game_name,
        "tagLine": user.tag_line,
        "fullRiotId": user.full_riot_id,
        "region": user.region,
        "puuid": user.puuid,
        "user": user.to_dict()
    }


@router.delete("/discord-link/{discord_id}", response_model=dict)
async def unlink_discord_account(discord_id: str, db: Session = Depends(get_db)):
    """
    Délie un identifiant Discord du compte utilisateur associé.
    """
    clean_id = str(discord_id).strip()
    user = db.query(User).filter(User.discord_id == clean_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Aucun compte trouvé avec cet ID Discord.")

    user.discord_id = None
    db.commit()
    return {"message": "Le compte Discord a été délié avec succès."}


class CreateDiscordTokenRequest(BaseModel):
    discordId: str = Field(..., description="ID Discord numérique")
    discordTag: Optional[str] = Field(None, description="Nom d'utilisateur / Tag Discord")

class ConfirmDiscordLinkRequest(BaseModel):
    token: str = Field(..., description="Jeton temporaire de liaison")


@router.post("/discord-token", response_model=dict)
async def generate_discord_link_token(req: CreateDiscordTokenRequest, db: Session = Depends(get_db)):
    """
    Génère un jeton temporaire (valide 15 min) pour envoyer un lien DM de confirmation d'association.
    """
    discord_id_str = str(req.discordId).strip()
    
    # Nettoyage des anciens jetons pour cet utilisateur
    db.query(DiscordPendingLink).filter(DiscordPendingLink.discord_id == discord_id_str).delete()

    token_str = secrets.token_urlsafe(32)
    expires_at = datetime.utcnow() + timedelta(minutes=15)

    pending = DiscordPendingLink(
        token=token_str,
        discord_id=discord_id_str,
        discord_tag=req.discordTag,
        expires_at=expires_at
    )
    db.add(pending)
    db.commit()

    return {
        "token": token_str,
        "expiresInMinutes": 15
    }


@router.get("/discord-token/{token}", response_model=dict)
async def check_discord_link_token(token: str, db: Session = Depends(get_db)):
    """
    Vérifie la validité d'un jeton temporaire d'association Discord.
    """
    pending = db.query(DiscordPendingLink).filter(DiscordPendingLink.token == token.strip()).first()
    if not pending:
        raise HTTPException(status_code=404, detail="Ce lien d'association Discord est invalide ou expiré.")

    if datetime.utcnow() > pending.expires_at:
        db.delete(pending)
        db.commit()
        raise HTTPException(status_code=400, detail="Ce lien d'association Discord a expiré. Veuillez relancer /link sur Discord.")

    return {
        "valid": True,
        "discordId": pending.discord_id,
        "discordTag": pending.discord_tag,
        "expiresAt": pending.expires_at.isoformat()
    }


@router.post("/confirm-discord-link", response_model=dict)
async def confirm_discord_link(
    req: ConfirmDiscordLinkRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Validation finale de l'association Discord par un utilisateur connecté sur le site web.
    """
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(status_code=401, detail="Veuillez vous connecter à votre compte RiftAffinity sur le site pour valider la liaison.")

    token_jwt = authorization.split(" ")[1]
    payload = decode_access_token(token_jwt)
    if not payload or "sub" not in payload:
        raise HTTPException(status_code=401, detail="Session expirée, veuillez vous reconnecter.")

    user_id = int(payload["sub"])
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="Compte utilisateur introuvable.")

    pending = db.query(DiscordPendingLink).filter(DiscordPendingLink.token == req.token.strip()).first()
    if not pending:
        raise HTTPException(status_code=404, detail="Le jeton d'association est invalide ou a déjà été utilisé.")

    if datetime.utcnow() > pending.expires_at:
        db.delete(pending)
        db.commit()
        raise HTTPException(status_code=400, detail="Le jeton d'association a expiré. Veuillez relancer /link sur Discord.")

    # 1. Vérifier si l'ID Discord est déjà utilisé par un autre utilisateur
    other_user = db.query(User).filter(User.discord_id == pending.discord_id, User.id != user.id).first()
    if other_user:
        other_user.discord_id = None

    # 2. Associer au compte actuel
    user.discord_id = pending.discord_id
    if pending.discord_tag:
        user.discord_tag = pending.discord_tag

    db.delete(pending)
    db.commit()
    db.refresh(user)

    return {
        "message": f"Félicitations ! Votre compte Discord <@{user.discord_id}> a été lié à votre profil {user.full_riot_id}.",
        "user": user.to_dict()
    }


