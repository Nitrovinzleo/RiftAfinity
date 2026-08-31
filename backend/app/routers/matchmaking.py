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
    targetId: Optional[Any] = Field(None, description="ID numérique du joueur cible")
    targetUserId: Optional[Any] = Field(None, description="ID numérique du joueur cible")

    def get_target_id(self):
        val = self.targetId if self.targetId is not None else self.targetUserId
        if val is None:
            raise HTTPException(status_code=400, detail="Identifiant du joueur cible manquant.")
        return val


RANK_TIER_ORDER = {
    "IRON": 1,
    "BRONZE": 2,
    "SILVER": 3,
    "GOLD": 4,
    "PLATINUM": 5,
    "EMERALD": 6,
    "DIAMOND": 7,
    "MASTER": 8,
    "GRANDMASTER": 9,
    "CHALLENGER": 10,
}

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
    Calcule un score d'affinité multi-facteurs dynamique (entre 45% et 99%)
    basé sur la synergie des rôles, la proximité des rangs, les langues et la région.
    """
    score = 0

    # 1. Synergie des rôles (max 35 pts)
    r1 = (user1.primary_role or "MID").upper()
    r2 = (candidate_dict.get("primaryRole") or "MID").upper()

    role_synergies = {
        ("ADC", "SUPPORT"): 35,
        ("SUPPORT", "ADC"): 35,
        ("JUNGLE", "MID"): 32,
        ("MID", "JUNGLE"): 32,
        ("TOP", "JUNGLE"): 28,
        ("JUNGLE", "TOP"): 28,
        ("MID", "ADC"): 25,
        ("ADC", "MID"): 25,
        ("TOP", "MID"): 22,
        ("MID", "TOP"): 22,
    }
    if r1 == r2:
        role_pts = 15
    else:
        role_pts = role_synergies.get((r1, r2), 20)

    score += role_pts

    # 2. Proximité des rangs Solo/Duo (max 30 pts)
    tier1 = RANK_TIER_ORDER.get((user1.rank_tier or "GOLD").upper(), 4)
    tier2 = RANK_TIER_ORDER.get((candidate_dict.get("rankTier") or "GOLD").upper(), 4)

    tier_diff = abs(tier1 - tier2)
    if tier_diff == 0:
        rank_pts = 30
    elif tier_diff == 1:
        rank_pts = 25
    elif tier_diff == 2:
        rank_pts = 18
    elif tier_diff == 3:
        rank_pts = 12
    else:
        rank_pts = 5

    score += rank_pts

    # 3. Langues parlées en commun (max 20 pts)
    langs1 = set(l.strip().upper() for l in (user1.spoken_languages or "FR,EN").split(","))
    langs2 = set(l.strip().upper() for l in (candidate_dict.get("spokenLanguages") or "FR,EN").split(","))
    shared = langs1.intersection(langs2)

    if len(shared) >= 2:
        lang_pts = 20
    elif len(shared) == 1:
        lang_pts = 15
    else:
        lang_pts = 5

    score += lang_pts

    # 4. Région & Bio (max 15 pts)
    reg1 = (user1.region or "euw1").lower()
    reg2 = (candidate_dict.get("region") or "euw1").lower()

    if reg1 == reg2:
        score += 10
    else:
        score += 3

    if candidate_dict.get("bio"):
        score += 5

    return min(99, max(45, score))

def sanitize_candidate_for_public(cand_dict: dict) -> dict:
    """
    Protection de la vie privée : Supprime l'adresse e-mail avant de renvoyer le profil au frontend.
    L'e-mail est utilisé uniquement par le serveur pour l'envoi de la notification.
    """
    clean = dict(cand_dict)
    clean.pop("email", None)
    return clean

@router.get("/candidates", response_model=List[dict])
async def get_matchmaking_candidates(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Retourne la liste des profils d'autres joueurs réels pour le matchmaking Duo.
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

    # Chercher d'autres utilisateurs réels enregistrés et vérifiés uniquement (sans profils de test)
    db_candidates = db.query(User).filter(
        User.id != user.id,
        User.is_verified == True
    ).all()

    candidates = []

    for c in db_candidates:
        if c.id not in swiped_ids:
            c_dict = c.to_dict()
            c_dict["compatibilityScore"] = calculate_compatibility_score(user, c_dict)
            candidates.append(sanitize_candidate_for_public(c_dict))

    # Mélanger les profils réels
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
    Si le choix est réciproque (les deux utilisateurs se sont likés), déclenche le Match,
    débloque les contacts et envoie un e-mail de mise en relation aux deux joueurs !
    """
    user = get_current_user_from_token(authorization, db)

    if not user.is_verified:
        raise HTTPException(status_code=403, detail="Compte non vérifié.")

    try:
        target_id = int(req.get_target_id())
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="ID de joueur cible invalide.")

    # Vérifier l'existence de l'utilisateur cible en base
    target_user = db.query(User).filter(User.id == target_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Joueur cible introuvable.")

    # Enregistrer ou mettre à jour le swipe
    existing_swipe = db.query(DuoSwipe).filter(
        DuoSwipe.swiper_id == user.id,
        DuoSwipe.target_id == target_id
    ).first()

    if existing_swipe:
        existing_swipe.liked = req.liked
    else:
        new_swipe = DuoSwipe(
            swiper_id=user.id,
            target_id=target_id,
            liked=req.liked
        )
        db.add(new_swipe)
    
    db.commit()

    # Si le swipe actuel est un "Like", vérifier si l'utilisateur cible a également liké l'utilisateur actuel
    if req.liked:
        reciprocal_swipe = db.query(DuoSwipe).filter(
            DuoSwipe.swiper_id == target_id,
            DuoSwipe.target_id == user.id,
            DuoSwipe.liked == True
        ).first()

        if reciprocal_swipe:
            # Marquer le match
            if existing_swipe:
                existing_swipe.is_match = True
            else:
                db.query(DuoSwipe).filter(
                    DuoSwipe.swiper_id == user.id,
                    DuoSwipe.target_id == target_id
                ).update({"is_match": True})
            
            reciprocal_swipe.is_match = True
            db.commit()

            target_dict = target_user.to_dict()
            user_dict = user.to_dict()

            # Envoi asynchrone des 2 e-mails de notification en arrière-plan
            background_tasks.add_task(send_match_emails, user_dict, target_dict)

            return {
                "isMatch": True,
                "matchedUser": sanitize_candidate_for_public(target_dict),
                "message": "🎉 C'est un MATCH !"
            }

    return {"isMatch": False, "message": "Swipe enregistré avec succès."}

@router.get("/matches", response_model=List[dict])
async def get_user_matches(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Retourne la liste complète de tous les matchs de l'utilisateur avec les profils et réseaux sociaux débloqués.
    """
    user = get_current_user_from_token(authorization, db)

    # Récupérer tous les swipes réciproques où is_match est Vrai
    matched_swipes = db.query(DuoSwipe).filter(
        ((DuoSwipe.swiper_id == user.id) | (DuoSwipe.target_id == user.id)),
        DuoSwipe.is_match == True
    ).all()

    # Extraire les IDs des partenaires de match uniques
    matched_user_ids = set()
    for s in matched_swipes:
        partner_id = s.target_id if s.swiper_id == user.id else s.swiper_id
        matched_user_ids.add(partner_id)

    if not matched_user_ids:
        return []

    matched_users = db.query(User).filter(User.id.in_(matched_user_ids)).all()

    result = []
    for u in matched_users:
        u_dict = u.to_dict()
        u_dict["compatibilityScore"] = calculate_compatibility_score(user, u_dict)
        result.append(sanitize_candidate_for_public(u_dict))

    return result


