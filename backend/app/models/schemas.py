from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field

class RiotAccountInput(BaseModel):
    """
    Identifiant d'un joueur League of Legends selon le nouveau format Riot ID.
    Exemple: gameName = "Faker", tagLine = "KR1" ou "8ï8"
    """
    gameName: str = Field(..., description="Nom d'invocateur / Game Name (ex: Faker)")
    tagLine: str = Field(..., description="Tag de l'invocateur (ex: KR1 ou 8ï8)")

class CompatibilityRequest(BaseModel):
    """
    Requête envoyée au serveur pour calculer l'affinité entre deux joueurs.
    """
    player1: RiotAccountInput = Field(..., description="Premier joueur du duo")
    player2: RiotAccountInput = Field(..., description="Second joueur du duo")
    region: str = Field(default="euw1", description="Région/Plateforme de jeu (euw1, na1, kr, etc.)")
    apiKey: Optional[str] = Field(None, description="Clé API Riot optionnelle transmise par l'utilisateur")

class ShareableSummaryCard(BaseModel):
    overallScore: int
    archetypeTitle: str
    archetypeSubtitle: str
    player1Name: str
    player2Name: str
    winratePercent: float
    totalGames: int
    generatedAt: str

# --- Schémas Authentification & Profil Dating LoL ---

class UserRegisterRequest(BaseModel):
    email: str = Field(..., description="Adresse e-mail de l'utilisateur")
    password: str = Field(..., description="Mot de passe sécurisé")
    riotId: str = Field(..., description="Riot ID au format Pseudo#TAG (ex: Faker#KR1)")
    region: str = Field(default="euw1", description="Région LoL (ex: euw1, na1, kr)")

class UserLoginRequest(BaseModel):
    email: str = Field(..., description="Adresse e-mail")
    password: str = Field(..., description="Mot de passe")

class UserResponse(BaseModel):
    id: int
    email: str
    gameName: str
    tagLine: str
    region: str
    isVerified: bool
    targetIconId: int
    currentIconId: Optional[str] = None
    customAvatar: Optional[str] = None
    birthDate: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    primaryRole: Optional[str] = None
    favoriteChampion: Optional[str] = None
    rankTier: Optional[str] = None
    rankDivision: Optional[str] = None
    rankLp: Optional[int] = None
    discordTag: Optional[str] = None
    instagramUsername: Optional[str] = None
    tiktokUsername: Optional[str] = None
    twitchUsername: Optional[str] = None
    twitterUsername: Optional[str] = None
    displayName: Optional[str] = None
    spokenLanguages: Optional[str] = None

class ProfileUpdateRequest(BaseModel):
    customAvatar: Optional[str] = None
    birthDate: Optional[str] = None
    age: Optional[int] = None
    bio: Optional[str] = None
    primaryRole: Optional[str] = None
    favoriteChampion: Optional[str] = None
    discordTag: Optional[str] = None
    instagramUsername: Optional[str] = None
    tiktokUsername: Optional[str] = None
    twitchUsername: Optional[str] = None
    twitterUsername: Optional[str] = None
    displayName: Optional[str] = None
    spokenLanguages: Optional[str] = None

class ChangePasswordRequest(BaseModel):
    currentPassword: str = Field(..., description="Mot de passe actuel")
    newPassword: str = Field(..., description="Nouveau mot de passe")

class ChangeEmailRequest(BaseModel):
    newEmail: str = Field(..., description="Nouvelle adresse e-mail")
    password: str = Field(..., description="Mot de passe actuel pour confirmation")


class PlayerMatchPerformance(BaseModel):
    """
    Statistiques individuelles d'un joueur dans une partie commune.
    """
    puuid: str
    gameName: str
    tagLine: str
    championId: int
    championName: str
    role: str  # TOP, JUNGLE, MIDDLE, BOTTOM, UTILITY
    kills: int
    deaths: int
    assists: int
    win: bool
    goldEarned: int
    totalDamageDealtToChampions: int

class CommonMatchSummary(BaseModel):
    """
    Résumé d'un match joué ensemble par les deux joueurs dans la même équipe.
    """
    matchId: str
    gameMode: str
    gameDurationSeconds: int
    gameCreationTimestamp: int
    win: bool
    player1: PlayerMatchPerformance
    player2: PlayerMatchPerformance
    sharedKillsCount: int  # Nombre de kills/assists partagés dans ce match

class ScoreBreakdown(BaseModel):
    """
    Détail des notes attribuées pour chaque pilier de la compatibilité (total = 100).
    """
    winrateScore: float = Field(..., description="Points sur le taux de victoire en duo (max 35)")
    synergyScore: float = Field(..., description="Points sur l'entraide et participation aux éliminations (max 30)")
    roleScore: float = Field(..., description="Points sur la complémentarité des rôles et champions (max 20)")
    volumeScore: float = Field(..., description="Points sur l'expérience et le volume de parties ensemble (max 15)")

class ArchetypeInfo(BaseModel):
    """
    Informations sur l'archétype attribué au duo.
    """
    title: str = Field(..., description="Nom de l'archétype (ex: Âmes Sœurs de la Botlane)")
    subtitle: str = Field(..., description="Description synthétique")
    quote: str = Field(..., description="Citation thématique League of Legends")
    description: str = Field(..., description="Analyse psychologique et amoureuse/amicale du duo")
    badgeGradient: str = Field(..., description="Classes CSS / Couleurs pour le rendu visuel")
    iconName: str = Field(..., description="Identifiant d'icône pour le frontend")

class DuoStats(BaseModel):
    """
    Statistiques cumulées du duo d'invocateurs.
    """
    totalGamesTogether: int
    winsTogether: int
    lossesTogether: int
    winratePercent: float
    sharedKillsAssistsTotal: int
    jointKillParticipationPercent: float
    favoriteLaneCombo: str  # ex: "Botlane Duo (ADC & Support)"
    topChampionDuo: Optional[str] = None  # ex: "Lucian & Nami"
    avgDurationMinutes: float

class CompatibilityResponse(BaseModel):
    """
    Réponse complète de l'API RiftAffinity contenant le score d'affinité, les stats et l'archétype.
    """
    overallScore: int = Field(..., description="Score final de compatibilité globale entre 0 et 100")
    scoreBreakdown: ScoreBreakdown
    archetype: ArchetypeInfo
    duoStats: DuoStats
    player1Summary: Dict[str, Any]
    player2Summary: Dict[str, Any]
    commonMatches: List[CommonMatchSummary] = Field(default_factory=list)
    isDemoData: bool = Field(default=False, description="Indique si les données proviennent d'une démonstration sans API Riot")
