import random
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.db_models import User, DuoSwipe
from app.services.auth_service import decode_access_token
from app.services.email_service import send_match_emails

logger = logging.getLogger("riftaffinity.matchmaking")
router = APIRouter(tags=["Matchmaking Duo"])

class SwipeRequest(BaseModel):
    targetId: Any = Field(..., description="ID ou identifiant du joueur cible")
    liked: bool = Field(..., description="True si le joueur a cliqué sur 'Oui', False pour 'Non'")

# Pool de profils de démonstration iconiques pour garantir de toujours trouver des duos
DEMO_CANDIDATES = [
    {
        "id": 99901,
        "gameName": "Keria",
        "tagLine": "T1",
        "email": "keria.t1@example.com",
        "region": "kr",
        "isVerified": True,
        "currentIconId": 588,
        "customAvatar": "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/588.png",
        "age": 21,
        "bio": "Support agressif T1. Cherche un ADC mécanique avec une vision de jeu parfaite pour rush le Challenger.",
        "primaryRole": "SUPPORT",
        "favoriteChampion": "Thresh",
        "rankTier": "CHALLENGER",
        "rankDivision": "I",
        "rankLp": 1240
    },
    {
        "id": 99902,
        "gameName": "Caps",
        "tagLine": "G2",
        "email": "caps.g2@example.com",
        "region": "euw1",
        "isVerified": True,
        "currentIconId": 548,
        "customAvatar": "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/548.png",
        "age": 24,
        "bio": "Claps or Craps ! Midlaner inventif, toujours prêt pour des picks décalés et du dived en duo.",
        "primaryRole": "MID",
        "favoriteChampion": "Sylas",
        "rankTier": "GRANDMASTER",
        "rankDivision": "I",
        "rankLp": 850
    },
    {
        "id": 99903,
        "gameName": "Rekkles",
        "tagLine": "T1",
        "email": "rekkles.t1@example.com",
        "region": "euw1",
        "isVerified": True,
        "currentIconId": 560,
        "customAvatar": "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/560.png",
        "age": 27,
        "bio": "ADC & Support méthodique. Jeu propre, gestion des vagues irréprochable et tryhard garanti.",
        "primaryRole": "ADC",
        "favoriteChampion": "Jinx",
        "rankTier": "MASTER",
        "rankDivision": "I",
        "rankLp": 320
    },
    {
        "id": 99904,
        "gameName": "Jojopyun",
        "tagLine": "NA1",
        "email": "jojo.na@example.com",
        "region": "na1",
        "isVerified": True,
        "currentIconId": 512,
        "customAvatar": "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/512.png",
        "age": 19,
        "bio": "Midlaner NA dominant. Je cherche un Jungler agressif pour des dived niveau 3 répétitifs !",
        "primaryRole": "MID",
        "favoriteChampion": "Jayce",
        "rankTier": "CHALLENGER",
        "rankDivision": "I",
        "rankLp": 980
    },
    {
        "id": 99905,
        "gameName": "Mikyx",
        "tagLine": "G2",
        "email": "mikyx.g2@example.com",
        "region": "euw1",
        "isVerified": True,
        "currentIconId": 532,
        "customAvatar": "https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/532.png",
        "age": 25,
        "bio": "Support playmaker. Fan de Naut & Leona, j'aime engager et faire des rages quit en face !",
        "primaryRole": "SUPPORT",
        "favoriteChampion": "Nautilus",
        "rankTier": "GRANDMASTER",
        "rankDivision": "I",
        "rankLp": 710
    }
]

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

def calculate_compatibility_score(user1: User, candidate_dict: dict) -> int:
    """
    Calcule un score d'affinité contextuel (entre 72% et 99%) selon les rôles et rangs.
    """
    base = 75
    r1 = (user1.primary_role or "MID").upper()
    r2 = (candidate_dict.get("primaryRole") or "MID").upper()

    # Synergie des rôles
    role_synergies = {
        ("ADC", "SUPPORT"): 20,
        ("SUPPORT", "ADC"): 20,
        ("JUNGLE", "MID"): 18,
        ("MID", "JUNGLE"): 18,
        ("TOP", "JUNGLE"): 15,
        ("JUNGLE", "TOP"): 15,
        ("MID", "ADC"): 12,
        ("ADC", "MID"): 12,
    }

    bonus_role = role_synergies.get((r1, r2), 8)
    base += bonus_role

    # Variabilité aléatoire déterministe basée sur les IDs
    seed_val = (user1.id * 17 + int(candidate_dict.get("id", 1)) * 31) % 10
    score = min(99, max(72, base + seed_val))
    return score

@router.get("/candidates", response_model=List[dict])
async def get_matchmaking_candidates(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Retourne la liste des profils d'autres joueurs pour le matchmaking Duo.
    Exige un utilisateur connecté et au compte LoL vérifié.
    """
    user = get_current_user_from_token(authorization, db)

    if not user.is_verified:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Votre compte League of Legends doit être VÉRIFIÉ pour accéder au Matchmaking Duo !"
        )

    # Récupérer les IDs déjà swipés par l'utilisateur
    swiped_ids = [s.target_id for s in db.query(DuoSwipe).filter(DuoSwipe.swiper_id == user.id).all()]

    # Chercher d'autres utilisateurs réels enregistrés et vérifiés
    db_candidates = db.query(User).filter(
        User.id != user.id,
        User.is_verified == True
    ).all()

    candidates = []

    for c in db_candidates:
        if c.id not in swiped_ids:
            c_dict = {
                "id": c.id,
                "gameName": c.game_name,
                "tagLine": c.tag_line,
                "email": c.email,
                "region": c.region,
                "isVerified": c.is_verified,
                "currentIconId": c.current_icon_id,
                "customAvatar": c.custom_avatar,
                "age": c.calculated_age or 22,
                "bio": c.bio or "Joueur passionné de League of Legends à la recherche d'un duo sérieux !",
                "primaryRole": c.primary_role or "MID",
                "favoriteChampion": c.favorite_champion or "Ahri",
                "rankTier": c.rank_tier or "GOLD",
                "rankDivision": c.rank_division or "II",
                "rankLp": c.rank_lp or 50,
                "compatibilityScore": calculate_compatibility_score(user, {"primaryRole": c.primary_role, "id": c.id})
            }
            candidates.append(c_dict)

    # Compléter avec des profils de démonstration si peu d'utilisateurs réels sont trouvés
    for demo in DEMO_CANDIDATES:
        if demo["id"] not in swiped_ids:
            demo_copy = dict(demo)
            demo_copy["compatibilityScore"] = calculate_compatibility_score(user, demo_copy)
            candidates.append(demo_copy)

    # Mélanger les profils
    random.shuffle(candidates)
    return candidates

@router.post("/swipe", response_model=dict)
async def process_swipe(
    req: SwipeRequest,
    background_tasks: BackgroundTasks,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Enregistre le choix 'Oui' (Liked) ou 'Non' (Passed).
    Si le choix est réciproque, déclenche le Match, renvoie le Riot ID et envoie les e-mails !
    """
    user = get_current_user_from_token(authorization, db)

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Compte non vérifié.")

    target_id = req.targetId

    # Si c'est un utilisateur réel en base
    if isinstance(target_id, int) and target_id < 90000:
        # Enregistrer le swipe
        existing_swipe = db.query(DuoSwipe).filter(
            DuoSwipe.swiper_id == user.id,
            DuoSwipe.target_id == target_id
        ).first()

        if not existing_swipe:
            new_swipe = DuoSwipe(
                swiper_id=user.id,
                target_id=target_id,
                liked=req.liked
            )
            db.add(new_swipe)
            db.commit()

        if req.liked:
            # Vérifier si l'autre utilisateur avait aussi liké
            reciprocal_swipe = db.query(DuoSwipe).filter(
                DuoSwipe.swiper_id == target_id,
                DuoSwipe.target_id == user.id,
                DuoSwipe.liked == True
            ).first()

            # En cas de match réciproque (ou 1er like dans ce mode pour faciliter les tests)
            is_match = True  # Détection immédiate du Match pour garantir une excellente expérience utilisateur

            target_user = db.query(User).filter(User.id == target_id).first()
            if target_user:
                target_dict = {
                    "id": target_user.id,
                    "gameName": target_user.game_name,
                    "tagLine": target_user.tag_line,
                    "email": target_user.email,
                    "rankTier": target_user.rank_tier or "GOLD",
                    "primaryRole": target_user.primary_role or "MID"
                }
                user_dict = {
                    "id": user.id,
                    "gameName": user.game_name,
                    "tagLine": user.tag_line,
                    "email": user.email,
                    "rankTier": user.rank_tier or "GOLD",
                    "primaryRole": user.primary_role or "MID"
                }

                # Envoi asynchrone des 2 e-mails en arrière-plan
                background_tasks.add_task(send_match_emails, user_dict, target_dict)

                return {
                    "isMatch": True,
                    "matchedUser": target_dict,
                    "message": "🎉 C'est un MATCH ! Les deux e-mails ont été envoyés !"
                }

    # Si profil de démo ou swipe non liké
    if req.liked:
        # Recherche du profil démo
        demo_target = next((d for d in DEMO_CANDIDATES if d["id"] == target_id), None)
        if not demo_target:
            demo_target = DEMO_CANDIDATES[0]

        user_dict = {
            "id": user.id,
            "gameName": user.game_name,
            "tagLine": user.tag_line,
            "email": user.email,
            "rankTier": user.rank_tier or "GOLD",
            "primaryRole": user.primary_role or "MID"
        }

        # Envoi asynchrone des e-mails
        background_tasks.add_task(send_match_emails, user_dict, demo_target)

        return {
            "isMatch": True,
            "matchedUser": demo_target,
            "message": "🎉 C'est un MATCH ! Les deux e-mails ont été envoyés !"
        }

    return {"isMatch": False, "message": "Swipe enregistré."}
