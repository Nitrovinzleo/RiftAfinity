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
    
    # Vérification d'icône style Ori Bot
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
    discord_tag = Column(String, nullable=True)
    instagram_username = Column(String, nullable=True)
    tiktok_username = Column(String, nullable=True)
    twitch_username = Column(String, nullable=True)
    twitter_username = Column(String, nullable=True)

    # Nom / Pseudo d'affichage personnalisé & Langues parlées
    display_name = Column(String, nullable=True)
    spoken_languages = Column(String, nullable=True)  # ex: "FR,EN"

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
            "customAvatar": self.custom_avatar,
            "birthDate": self.birth_date,
            "age": self.calculated_age,
            "bio": self.bio,
            "primaryRole": self.primary_role,
            "favoriteChampion": self.favorite_champion,
            "rankTier": self.rank_tier,
            "rankDivision": self.rank_division,
            "rankLp": self.rank_lp,
            "discordTag": self.discord_tag,
            "instagramUsername": self.instagram_username,
            "tiktokUsername": self.tiktok_username,
            "twitchUsername": self.twitch_username,
            "twitterUsername": self.twitter_username,
            "displayName": self.display_name,
            "spokenLanguages": self.spoken_languages
        }

class DuoSwipe(Base):
    __tablename__ = "duo_swipes"

    id = Column(Integer, primary_key=True, index=True)
    swiper_id = Column(Integer, nullable=False, index=True)
    target_id = Column(Integer, nullable=False, index=True)
    liked = Column(Boolean, nullable=False)
    is_match = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

