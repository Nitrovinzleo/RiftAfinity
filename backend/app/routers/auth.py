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
router = APIRouter(prefix="/api/auth", tags=["Authentification"])

def parse_riot_id(riot_id_str: str):
    trimmed = riot_id_str.strip()
    if "#" in trimmed:
        idx = trimmed.rfind("#")
        return trimmed[:idx].strip(), trimmed[idx+1:].strip()
    return trimmed, "EUW"

@router.post("/register", response_model=dict)
async def register(req: UserRegisterRequest, db: Session = Depends(get_db)):
    # Protection SQLi : L'ORM SQLAlchemy utilise des requêtes SQL paramétrées
    existing_user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Un compte avec cette adresse email existe déjà.")

    game_name, tag_line = parse_riot_id(req.riotId)
    if not game_name or not tag_line:
        raise HTTPException(status_code=400, detail="Veuillez fournir un Riot ID valide au format Pseudo#TAG.")

    # Tentative optionnelle de récupération du PUUID
    puuid = None
    try:
        riot_client = RiotApiClient()
        # Cluster régional par défaut
        regional_cluster = "europe"
        if req.region in ["na1", "br1", "la1", "la2"]:
            regional_cluster = "americas"
        elif req.region in ["kr", "jp1"]:
            regional_cluster = "asia"
            
        account_data = await riot_client.get_puuid_by_riot_id(game_name, tag_line, regional_cluster)
        puuid = account_data.get("puuid")
    except Exception as e:
        logger.warning(f"Impossible de résoudre le PUUID à l'inscription: {e}")

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
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "gameName": new_user.game_name,
            "tagLine": new_user.tag_line,
            "region": new_user.region,
            "isVerified": new_user.is_verified,
            "targetIconId": new_user.target_icon_id,
            "currentIconId": new_user.current_icon_id,
            "age": new_user.age,
            "bio": new_user.bio,
            "primaryRole": new_user.primary_role,
            "favoriteChampion": new_user.favorite_champion,
            "rankTier": new_user.rank_tier,
            "rankDivision": new_user.rank_division,
            "rankLp": new_user.rank_lp
        }
    }

@router.post("/login", response_model=dict)
async def login(req: UserLoginRequest, db: Session = Depends(get_db)):
    # Protection anti-SQLi via requête ORM paramétrée
    user = db.query(User).filter(User.email == req.email.strip().lower()).first()
    if not user or not verify_password(req.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect.")

    token = create_access_token({"sub": str(user.id), "email": user.email})

    return {
        "token": token,
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

    return {
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
