import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header
from sqlalchemy.orm import Session
from typing import Optional

from app.database import get_db
from app.models.db_models import User
from app.models.schemas import UserRegisterRequest, UserLoginRequest, UserResponse
from app.services.auth_service import hash_password, verify_password, create_access_token, decode_access_token
from app.services.riot_api import RiotApiClient

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

    # Protection SQLi : L'ORM SQLAlchemy utilise des requêtes SQL paramétrées
    existing_user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing_user:
        # Mise à jour transparente du mot de passe et des données si le compte existe déjà
        existing_user.hashed_password = hash_password(req.password)
        existing_user.game_name = game_name
        existing_user.tag_line = tag_line
        existing_user.region = req.region
        if puuid:
            existing_user.puuid = puuid
        db.commit()
        db.refresh(existing_user)

        token = create_access_token({"sub": str(existing_user.id), "email": existing_user.email})
        return {
            "token": token,
            "user": existing_user.to_dict()
        }

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
    except Exception as e:
        db.rollback()
        logger.error(f"Erreur lors de l'enregistrement en BDD: {e}")
        raise HTTPException(status_code=500, detail="Erreur d'enregistrement du compte en base de données.")

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
            "message": "Connexion réussie !",
            "access_token": token,
            "token_type": "bearer",
            "user": user.to_dict()
        }
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Erreur serveur durant la connexion: {e}")
        raise HTTPException(status_code=500, detail=f"Erreur serveur lors de la connexion: {str(e)}")

@router.get("/admin/users")
async def get_all_users_admin(db: Session = Depends(get_db)):
    """
    Endpoint d'administration pour consulter en direct tous les utilisateurs et comptes créés.
    """
    users = db.query(User).order_by(User.created_at.desc()).all()
    return {
        "total_users": len(users),
        "users": [
            {
                "id": u.id,
                "riotId": f"{u.game_name}#{u.tag_line}",
                "displayName": u.display_name,
                "email": u.email,
                "region": u.region,
                "isVerified": u.is_verified,
                "rankTier": u.rank_tier,
                "rankDivision": u.rank_division,
                "rankLp": u.rank_lp,
                "favoriteChampion": u.favorite_champion,
                "primaryRole": u.primary_role,
                "spokenLanguages": u.spoken_languages,
                "createdAt": u.created_at.strftime("%Y-%m-%d %H:%M:%S") if u.created_at else None
            }
            for u in users
        ]
    }

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
