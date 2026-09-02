import random
from datetime import datetime
from typing import Optional
from sqlalchemy import Column, Integer, String, Boolean, Float, DateTime
from app.database import Base

# Pool d'icônes d'invocateur de base proposées pour la vérification Ori Bot
VERIFICATION_ICON_POOL = [5, 6, 7, 10, 12, 14, 28, 29, 30, 31, 32, 50, 52, 54]

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    
    # Informations LoL / Riot Games
    game_name = Column(String, nullable=False)
    tag_line = Column(String, nullable=False)
    region = Column(String, default="euw1")
    puuid = Column(String, nullable=True, index=True)
    summoner_id = Column(String, nullable=True)
    
    # Vérification d'icône style Ori Bot (Vrai UNIQUEMENT après validation de l'icône)
    is_verified = Column(Boolean, default=False)


    target_icon_id = Column(Integer, default=lambda: random.choice(VERIFICATION_ICON_POOL))
    current_icon_id = Column(Integer, nullable=True)

    # Profil Dating / Matchmaking LoL
    custom_avatar = Column(String, nullable=True)  # URL ou Data URI de la photo importée
    birth_date = Column(String, nullable=True)  # Format YYYY-MM-DD ex: "2002-05-15"
    age = Column(Integer, nullable=True)
    bio = Column(String, nullable=True)
    primary_role = Column(String, nullable=True)  # TOP, JUNGLE, MID, ADC, SUPPORT
    favorite_champion = Column(String, nullable=True)

    # Récupération automatique du Rank Solo/Duo via l'API Riot
    rank_tier = Column(String, nullable=True)  # ex: GOLD, DIAMOND, CHALLENGER
    rank_division = Column(String, nullable=True)  # ex: II, IV
    rank_lp = Column(Integer, nullable=True)  # ex: 45
    rank_wins = Column(Integer, nullable=True)
    rank_losses = Column(Integer, nullable=True)

    # Réseaux Sociaux & Contact Matchmaking
    discord_id = Column(String, unique=True, index=True, nullable=True)
    discord_tag = Column(String, nullable=True)
    instagram_username = Column(String, nullable=True)
    tiktok_username = Column(String, nullable=True)
    twitch_username = Column(String, nullable=True)
    twitter_username = Column(String, nullable=True)

    # Nom / Pseudo d'affichage personnalisé & Langues parlées
    display_name = Column(String, nullable=True)
    spoken_languages = Column(String, nullable=True)  # ex: "FR,EN"

    # Suppression douce (Soft Delete) avec masque de 7 jours
    is_hidden = Column(Boolean, default=False)
    scheduled_deletion_at = Column(DateTime, nullable=True)

    created_at = Column(DateTime, default=datetime.utcnow)

    @property
    def calculated_age(self) -> Optional[int]:
        if not self.birth_date:
            return self.age
        try:
            bdate = datetime.strptime(self.birth_date, "%Y-%m-%d")
            today = datetime.utcnow()
            return today.year - bdate.year - ((today.month, today.day) < (bdate.month, bdate.day))
        except Exception:
            return self.age

    @property
    def full_riot_id(self) -> str:
        return f"{self.game_name}#{self.tag_line}"

    @property
    def calculated_badges(self) -> list:
        badges = []
        tier = (self.rank_tier or "").upper()
        if tier in ["DIAMOND", "MASTER", "GRANDMASTER", "CHALLENGER"]:
            badges.append({"id": "high_elo", "label": "💎 High Elo", "color": "purple"})

        wins = self.rank_wins or 0
        losses = self.rank_losses or 0
        tot = wins + losses
        if tot >= 10 and round((wins / tot) * 100) >= 55:
            badges.append({"id": "climber", "label": "🥇 Climber Duo", "color": "amber"})

        role = (self.primary_role or "").upper()
        if role == "SUPPORT":
            badges.append({"id": "support", "label": "🛡️ Support Main", "color": "blue"})
        elif role in ["JUNGLE", "JUNGLER"]:
            badges.append({"id": "jungle", "label": "🐉 Jungler", "color": "emerald"})
        elif role == "MID":
            badges.append({"id": "mid", "label": "⚡ Carry Mid", "color": "cyan"})
        elif role in ["ADC", "BOTTOM", "BOT"]:
            badges.append({"id": "adc", "label": "🏹 ADC Carry", "color": "pink"})
        elif role == "TOP":
            badges.append({"id": "top", "label": "🔨 Top Raidboss", "color": "orange"})

        return badges

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "email": self.email,
            "gameName": self.game_name,
            "tagLine": self.tag_line,
            "region": self.region,
            "isVerified": self.is_verified,
            "targetIconId": self.target_icon_id,
            "currentIconId": self.current_icon_id,
            "customAvatar": self.custom_avatar or f"https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/{self.current_icon_id or 28}.jpg",
            "birthDate": self.birth_date,
            "age": self.calculated_age,
            "bio": self.bio,
            "primaryRole": self.primary_role,
            "favoriteChampion": self.favorite_champion,
            "rankTier": self.rank_tier,
            "rankDivision": self.rank_division,
            "rankLp": self.rank_lp,
            "badges": self.calculated_badges,
            "discordId": self.discord_id,
            "discordTag": self.discord_tag,
            "instagramUsername": self.instagram_username,
            "tiktokUsername": self.tiktok_username,
            "twitchUsername": self.twitch_username,
            "twitterUsername": self.twitter_username,
            "displayName": self.display_name,
            "spokenLanguages": self.spoken_languages,
            "isHidden": self.is_hidden,
            "scheduledDeletionAt": self.scheduled_deletion_at.isoformat() if self.scheduled_deletion_at else None
        }


class DuoSwipe(Base):
    __tablename__ = "duo_swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_id = Column(Integer, nullable=False, index=True)
    target_id = Column(Integer, nullable=False, index=True)
    liked = Column(Boolean, nullable=False)
    is_match = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class MatchMessage(Base):
    __tablename__ = "match_messages"

    id = Column(Integer, primary_key=True, index=True)
    sender_id = Column(Integer, nullable=False, index=True)
    receiver_id = Column(Integer, nullable=False, index=True)
    content = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    def to_dict(self) -> dict:
        return {
            "id": self.id,
            "senderId": self.sender_id,
            "receiverId": self.receiver_id,
            "content": self.content,
            "createdAt": self.created_at.isoformat() if self.created_at else None,
            "isRead": self.is_read
        }


class DiscordPendingLink(Base):
    __tablename__ = "discord_pending_links"

    id = Column(Integer, primary_key=True, index=True)
    token = Column(String, unique=True, index=True, nullable=False)
    discord_id = Column(String, nullable=False)
    discord_tag = Column(String, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    expires_at = Column(DateTime, nullable=False)


class DuoAffinityHistory(Base):
    __tablename__ = "duo_affinity_history"

    id = Column(Integer, primary_key=True, index=True)
    player1_riot_id = Column(String, nullable=False, index=True)
    player2_riot_id = Column(String, nullable=False, index=True)
    pair_key = Column(String, unique=True, index=True, nullable=False)
    overall_score = Column(Integer, nullable=False)
    archetype_title = Column(String, nullable=True)
    archetype_emoji = Column(String, nullable=True)
    total_games = Column(Integer, default=0)
    win_rate = Column(Float, default=0.0)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)



