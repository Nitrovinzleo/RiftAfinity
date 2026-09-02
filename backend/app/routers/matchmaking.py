import random
import logging
from fastapi import APIRouter, Depends, HTTPException, status, Header, BackgroundTasks
from sqlalchemy.orm import Session
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from app.database import get_db
from app.models.db_models import User, DuoSwipe, MatchMessage
from app.services.auth_service import decode_access_token
from app.services.email_service import send_match_emails, send_test_email

logger = logging.getLogger("riftaffinity.matchmaking")
router = APIRouter(tags=["Matchmaking Duo"])

class SwipeRequest(BaseModel):
    targetId: Optional[Any] = Field(None, description="ID numérique du joueur cible")
    targetUserId: Optional[Any] = Field(None, description="ID numérique du joueur cible")
    liked: bool = Field(True, description="Indique si le joueur aime (True) ou passe (False)")

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
    Protection stricte de la vie privée (Cyber-sécurité) :
    Supprime toutes les données personnelles identifiables et réseaux sociaux
    du JSON brut renvoyé par l'API avant qu'un Match ne soit confirmé.
    """
    clean = dict(cand_dict)
    clean.pop("email", None)
    clean.pop("discordId", None)
    clean.pop("discordTag", None)
    clean.pop("instagramUsername", None)
    clean.pop("tiktokUsername", None)
    clean.pop("twitchUsername", None)
    clean.pop("twitterUsername", None)
    
    # Si un pseudo personnalisé est configuré, ne pas transmettre le Riot ID en clair dans le JSON public
    if clean.get("displayName"):
        clean["gameName"] = None
        clean["tagLine"] = None
        
    return clean

def sanitize_candidate_for_match(cand_dict: dict) -> dict:
    """
    Déblocage des coordonnées uniquement lorsqu'un Match réciproque est confirmé.
    Transmet le Riot ID et les réseaux sociaux tout en gardant l'email privé.
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

    # Récupérer les IDs déjà swipés par l'utilisateur
    swiped_ids = [s.target_id for s in db.query(DuoSwipe).filter(DuoSwipe.swiper_id == user.id).all()]

    # Chercher uniquement les utilisateurs réels enregistrés, vérifiés et non masqués
    db_candidates = db.query(User).filter(
        User.id != user.id,
        User.is_verified == True,
        User.is_hidden != True,
        User.scheduled_deletion_at == None
    ).order_by(User.id.desc()).all()

    # Déduplication par Riot ID unique
    seen_ids = set()
    unique_db_candidates = []
    for c in db_candidates:
        key = f"{c.game_name.lower()}#{c.tag_line.lower()}"
        if key not in seen_ids:
            seen_ids.add(key)
            unique_db_candidates.append(c)

    # Récupérer les IDs des personnes qui ont DÉJÀ liké l'utilisateur actuel
    liker_ids = set([
        s.swiper_id for s in db.query(DuoSwipe).filter(
            DuoSwipe.target_id == user.id,
            DuoSwipe.liked == True,
            DuoSwipe.is_match == False
        ).all()
    ])

    prioritized_candidates = []
    normal_candidates = []

    for c in unique_db_candidates:
        if c.id not in swiped_ids:
            c_dict = c.to_dict()
            c_dict["compatibilityScore"] = calculate_compatibility_score(user, c_dict)
            c_dict["hasLikedYou"] = (c.id in liker_ids)
            sanitized = sanitize_candidate_for_public(c_dict)

            if c.id in liker_ids:
                prioritized_candidates.append(sanitized)
            else:
                normal_candidates.append(sanitized)

    random.shuffle(normal_candidates)
    # Les personnes ayant déjà liké l'utilisateur sont placées TOUT EN HAUT de la pile !
    candidates = prioritized_candidates + normal_candidates
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

    try:
        target_id = int(req.get_target_id())
    except (ValueError, TypeError):
        raise HTTPException(status_code=400, detail="ID de joueur cible invalide.")

    # Vérifier l'existence de l'utilisateur cible en base
    target_user = db.query(User).filter(User.id == target_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Joueur cible introuvable.")

    # 1. Enregistrer ou mettre à jour le swipe de l'utilisateur actuel
    current_swipe = db.query(DuoSwipe).filter(
        DuoSwipe.swiper_id == user.id,
        DuoSwipe.target_id == target_id
    ).first()

    if not current_swipe:
        current_swipe = DuoSwipe(
            swiper_id=user.id,
            target_id=target_id,
            liked=req.liked,
            is_match=False
        )
        db.add(current_swipe)
    else:
        current_swipe.liked = req.liked

    db.commit()
    db.refresh(current_swipe)

    # 2. Si le swipe actuel est un "Like", vérifier si le joueur cible a également liké l'utilisateur actuel
    if req.liked:
        reciprocal_swipe = db.query(DuoSwipe).filter(
            DuoSwipe.swiper_id == target_id,
            DuoSwipe.target_id == user.id,
            DuoSwipe.liked == True
        ).first()

        if reciprocal_swipe:
            # C'est un Match réciproque !
            current_swipe.is_match = True
            reciprocal_swipe.is_match = True
            db.commit()

            target_dict = target_user.to_dict()
            user_dict = user.to_dict()

            # Envoi asynchrone des 2 e-mails de notification en arrière-plan
            background_tasks.add_task(send_match_emails, user_dict, target_dict)

            return {
                "isMatch": True,
                "matchedUser": sanitize_candidate_for_match(target_dict),
                "message": "🎉 C'est un MATCH !"
            }

    return {"isMatch": False, "message": "Swipe enregistré avec succès."}


@router.get("/matches", response_model=List[dict])
async def get_user_matches(
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    user = get_current_user_from_token(authorization, db)

    # Récupérer tous les swipes réciproques de l'utilisateur où is_match est Vrai
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
        result.append(sanitize_candidate_for_match(u_dict))

    return result


@router.delete("/matches/{partner_id}", response_model=dict)
async def delete_user_match(
    partner_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Supprime un match réciproque entre l'utilisateur et partner_id.
    Réinitialise les swipes pour que la personne retourne dans les duos disponibles.
    """
    user = get_current_user_from_token(authorization, db)

    # Récupérer les swipes dans les 2 sens et les supprimer
    swipes = db.query(DuoSwipe).filter(
        ((DuoSwipe.swiper_id == user.id) & (DuoSwipe.target_id == partner_id)) |
        ((DuoSwipe.swiper_id == partner_id) & (DuoSwipe.target_id == user.id))
    ).all()

    for s in swipes:
        db.delete(s)
    
    db.commit()

    return {"success": True, "message": "Match supprimé avec succès. Le profil retourne dans les duos disponibles."}


class SendMessageRequest(BaseModel):
    content: str = Field(..., description="Contenu du message")

@router.get("/matches/{partner_id}/messages", response_model=List[dict])
async def get_match_messages(
    partner_id: int,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Récupère l'historique des messages échangés entre 2 duos matchés.
    """
    user = get_current_user_from_token(authorization, db)

    # Vérifier que le match existe
    match_exists = db.query(DuoSwipe).filter(
        ((DuoSwipe.swiper_id == user.id) & (DuoSwipe.target_id == partner_id) & (DuoSwipe.is_match == True)) |
        ((DuoSwipe.swiper_id == partner_id) & (DuoSwipe.target_id == user.id) & (DuoSwipe.is_match == True))
    ).first()

    if not match_exists:
        raise HTTPException(status_code=403, detail="Vous devez être matché avec cet utilisateur pour accéder au chat.")

    messages = db.query(MatchMessage).filter(
        ((MatchMessage.sender_id == user.id) & (MatchMessage.receiver_id == partner_id)) |
        ((MatchMessage.sender_id == partner_id) & (MatchMessage.receiver_id == user.id))
    ).order_by(MatchMessage.created_at.asc()).all()

    return [m.to_dict() for m in messages]


@router.post("/matches/{partner_id}/messages", response_model=dict)
async def send_match_message(
    partner_id: int,
    req: SendMessageRequest,
    authorization: Optional[str] = Header(None),
    db: Session = Depends(get_db)
):
    """
    Envoie un message direct à un duo matché.
    """
    user = get_current_user_from_token(authorization, db)

    if not req.content or not req.content.strip():
        raise HTTPException(status_code=400, detail="Le message ne peut pas être vide.")

    # Vérifier que le match existe
    match_exists = db.query(DuoSwipe).filter(
        ((DuoSwipe.swiper_id == user.id) & (DuoSwipe.target_id == partner_id) & (DuoSwipe.is_match == True)) |
        ((DuoSwipe.swiper_id == partner_id) & (DuoSwipe.target_id == user.id) & (DuoSwipe.is_match == True))
    ).first()

    if not match_exists:
        raise HTTPException(status_code=403, detail="Vous devez être matché pour envoyer un message.")

    msg = MatchMessage(
        sender_id=user.id,
        receiver_id=partner_id,
        content=req.content.strip()
    )
    db.add(msg)
    db.commit()
    db.refresh(msg)

    return {"success": True, "message": msg.to_dict()}


class TestEmailRequest(BaseModel):
    email: str = Field(..., description="Adresse e-mail destinataire pour le test SMTP")

@router.post("/test-email", response_model=dict)
async def trigger_test_email(req: TestEmailRequest):
    """
    Endpoint utilitaire pour tester l'envoi d'un e-mail SMTP.
    """
    if not req.email or "@" not in req.email:
        raise HTTPException(status_code=400, detail="Adresse e-mail invalide.")
    return send_test_email(req.email)


@router.get("/public-stats", response_model=dict)
async def get_public_stats(db: Session = Depends(get_db)):
    """
    Retourne les statistiques publiques et les vrais joueurs de la plateforme RiftAffinity.
    """
    verified_users = db.query(User).filter(
        User.is_verified == True,
        User.is_hidden != True
    ).order_by(User.id.desc()).all()

    total_count = db.query(User).count()
    total_verified = len(verified_users)

    seen_riot_ids = set()
    cand_list = []
    for u in verified_users:
        riot_id_key = f"{u.game_name.lower()}#{u.tag_line.lower()}"
        if riot_id_key in seen_riot_ids:
            continue
        seen_riot_ids.add(riot_id_key)

        wins = u.rank_wins or 45
        losses = u.rank_losses or 35
        tot_games = wins + losses
        winrate = round((wins / tot_games) * 100) if tot_games > 0 else 62

        avatar_url = u.custom_avatar
        if not avatar_url:
            icon_id = u.current_icon_id or 28
            avatar_url = f"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/{icon_id}.jpg"

        cand_list.append({
            "id": u.id,
            "gameName": u.game_name,
            "tagLine": u.tag_line,
            "displayName": u.display_name,
            "rankTier": u.rank_tier or "GOLD",
            "rankDivision": u.rank_division or "III",
            "primaryRole": u.primary_role or "MID",
            "favoriteChampion": u.favorite_champion or "LoL",
            "customAvatar": avatar_url,
            "currentIconId": u.current_icon_id or 28,
            "badges": u.calculated_badges,
            "region": (u.region or "euw1").upper(),
            "winrate": f"{winrate}%",
            "wins": wins,
            "losses": losses
        })
        if len(cand_list) >= 6:
            break

    total_matches = db.query(DuoSwipe).filter(DuoSwipe.is_match == True).count() // 2

    # Hall of Fame : Récupérer les 10 Duos avec les plus forts scores d'affinité
    top_history = db.query(DuoAffinityHistory).order_by(DuoAffinityHistory.overall_score.desc(), DuoAffinityHistory.updated_at.desc()).limit(10).all()
    top_duos_list = []

    if top_history and len(top_history) > 0:
        for entry in top_history:
            p1_name = entry.player1_riot_id.split('#')[0] if '#' in entry.player1_riot_id else entry.player1_riot_id
            p2_name = entry.player2_riot_id.split('#')[0] if '#' in entry.player2_riot_id else entry.player2_riot_id
            
            p1_avatar = None
            p2_avatar = None
            
            # Recherche si Joueur 1 a un compte inscrit
            if '#' in entry.player1_riot_id:
                g1, t1 = entry.player1_riot_id.split('#', 1)
                u1 = db.query(User).filter(User.game_name.ilike(g1), User.tag_line.ilike(t1)).first()
                if u1:
                    p1_avatar = u1.custom_avatar or f"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/{u1.current_icon_id or 28}.jpg"

            # Recherche si Joueur 2 a un compte inscrit
            if '#' in entry.player2_riot_id:
                g2, t2 = entry.player2_riot_id.split('#', 1)
                u2 = db.query(User).filter(User.game_name.ilike(g2), User.tag_line.ilike(t2)).first()
                if u2:
                    p2_avatar = u2.custom_avatar or f"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/{u2.current_icon_id or 28}.jpg"

            top_duos_list.append({
                "id": entry.id,
                "player1": entry.player1_riot_id,
                "player1Name": p1_name,
                "player1Avatar": p1_avatar,
                "player2": entry.player2_riot_id,
                "player2Name": p2_name,
                "player2Avatar": p2_avatar,
                "score": entry.overall_score,
                "archetype": entry.archetype_title or "Duo Mythique",
                "winrate": f"{round(entry.win_rate or 68)}%",
                "games": entry.total_games or 12
            })
    else:
        # Fallback aux Duos connectés et membres de la communauté
        top_duos_list = [
          { "id": 1, "player1": "PrincessPinkyUp#8ï8", "player1Name": "Julie", "player1Avatar": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/7196.jpg", "player2": "Lesbian princess#UwU", "player2Name": "Alanood", "player2Avatar": "/avatars/alanood.jpg", "score": 96, "archetype": "💎 High Elo Duo", "winrate": "76%", "games": 38 },
          { "id": 2, "player1": "PrincessDarkyUp#8ï8", "player1Name": "Ismael", "player1Avatar": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/6868.jpg", "player2": "PrincessPinkyUp#8ï8", "player2Name": "Julie", "player2Avatar": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/7196.jpg", "score": 93, "archetype": "🔥 Mastermind Duo", "winrate": "70%", "games": 28 },
          { "id": 3, "player1": "Doakes#slice", "player1Name": "tibo", "player1Avatar": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/6024.jpg", "player2": "ILoveN#MOMY", "player2Name": "ILoveN", "player2Avatar": "https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/6926.jpg", "score": 90, "archetype": "⚡ Climber Duo", "winrate": "68%", "games": 24 }
        ]

    return {
        "totalPlayers": total_count,
        "verifiedPlayers": total_verified,
        "onlinePlayers": total_verified,
        "totalMatches": max(5, total_matches),
        "rankTiers": 10,
        "regionsCount": 4,
        "featuredPlayers": cand_list,
        "topDuos": top_duos_list
    }




