import os
import sys
import logging

# Résolution des modules sys.path pour Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)

from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.database import engine, Base
from app.models import db_models
from app.models.schemas import CompatibilityRequest, CompatibilityResponse
from app.services.riot_api import RiotApiClient, RiotApiError
from app.services.score_calculator import AffinityScoreCalculator
from app.routers import auth, profile, matchmaking

from sqlalchemy import text

# Initialisation sécurisée des tables et migrations SQLite/PostgreSQL
def init_db():
    try:
        Base.metadata.create_all(bind=engine)
        with engine.connect() as conn:
            columns_to_add = [
                ("custom_avatar", "VARCHAR"),
                ("birth_date", "VARCHAR"),
                ("discord_id", "VARCHAR"),
                ("discord_tag", "VARCHAR"),
                ("instagram_username", "VARCHAR"),
                ("tiktok_username", "VARCHAR"),
                ("twitch_username", "VARCHAR"),
                ("twitter_username", "VARCHAR"),
                ("display_name", "VARCHAR"),
                ("spoken_languages", "VARCHAR"),
                ("is_hidden", "BOOLEAN DEFAULT FALSE"),
                ("scheduled_deletion_at", "TIMESTAMP")
            ]
            for col, col_type in columns_to_add:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} {col_type}"))
                    conn.commit()
                except Exception:
                    pass
    except Exception as e:
        pass


try:
    init_db()
except Exception:
    pass

# Configuration du logger principal
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s"
)
logger = logging.getLogger("riftaffinity.main")

# Instanciation de l'application FastAPI avec documentation OpenAPI personnalisée
app = FastAPI(
    title="RiftAffinity API",
    description="API FastAPI de calcul de compatibilité amoureuse et amicale pour joueurs de League of Legends via l'API Riot Games.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Configuration CORS prioritaire pour autoriser toutes les méthodes (OPTIONS, POST, GET, PUT) depuis Vercel
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi import Request
from fastapi.responses import JSONResponse

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    logger.error(f"Erreur serveur inattendue sur {request.method} {request.url.path}: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": f"Erreur serveur ({type(exc).__name__}): {str(exc)}"}
    )

# Inclusions des routeurs avec préfixes universels (/api/auth et /auth)
app.include_router(auth.router, prefix="/api/auth")
app.include_router(auth.router, prefix="/auth")

app.include_router(profile.router, prefix="/api/profile")
app.include_router(profile.router, prefix="/profile")

app.include_router(matchmaking.router, prefix="/api/matchmaking")
app.include_router(matchmaking.router, prefix="/matchmaking")

@app.get("/api/health", tags=["Système"])
async def health_check():
    """
    Endpoint de santé pour vérifier l'état du serveur FastAPI backend sur Render.
    """
    return {
        "status": "healthy",
        "service": "RiftAffinity Backend",
        "version": "1.0.0"
    }

@app.get("/api/demo", response_model=CompatibilityResponse, tags=["Compatibilité"])
async def get_demo_analysis():
    """
    Retourne des données de démonstration d'analyse d'affinité d'un duo iconique (Lucian & Nami).
    Permet de tester et visualiser l'interface sans clé API Riot.
    """
    logger.info("Génération de la réponse de démonstration (Demo Mode)")
    return AffinityScoreCalculator.get_demo_compatibility()

@app.post("/api/compatibility", response_model=CompatibilityResponse, tags=["Compatibilité"])
async def analyze_compatibility(payload: CompatibilityRequest):
    """
    Endpoint principal : Analyse la compatibilité entre deux joueurs League of Legends.
    1. Convertit les Riot IDs (gameName#tagLine) en PUUIDs via ACCOUNT-V1.
    2. Récupère l'historique complet via pagination MATCH-V5.
    3. Fait l'intersection des matchs et extrait les détails des parties jouées en équipe.
    4. Calcule le score final sur 100 et génère l'archétype thématique.
    """
    p1 = payload.player1
    p2 = payload.player2

    if not p1.gameName or not p1.tagLine or not p2.gameName or not p2.tagLine:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Les champs gameName et tagLine sont obligatoires pour les deux joueurs."
        )

    # Conversion de la région plateforme (ex: 'euw1') vers le routage régional (ex: 'europe')
    regional_cluster = settings.get_regional_routing(payload.region)
    logger.info(f"Analyse débutée pour {p1.gameName}#{p1.tagLine} et {p2.gameName}#{p2.tagLine} (Cluster: {regional_cluster})")

    # Initialisation du client API Riot avec la clé transmise ou celle du serveur
    client = RiotApiClient(api_key=payload.apiKey)

    try:
        # Étape 1 : Obtenir les PUUIDs des 2 joueurs
        acc1 = await client.get_puuid_by_riot_id(p1.gameName, p1.tagLine, regional_cluster)
        acc2 = await client.get_puuid_by_riot_id(p2.gameName, p2.tagLine, regional_cluster)

        puuid1 = acc1.get("puuid")
        puuid2 = acc2.get("puuid")

        real_game_name_1 = acc1.get("gameName", p1.gameName)
        real_tag_line_1 = acc1.get("tagLine", p1.tagLine)
        real_game_name_2 = acc2.get("gameName", p2.gameName)
        real_tag_line_2 = acc2.get("tagLine", p2.tagLine)

        # Étape 2 : Récupérer les détails des matchs communs
        duo_matches = await client.get_common_matches_details(
            puuid1=puuid1,
            puuid2=puuid2,
            regional_cluster=regional_cluster,
            max_search=settings.MAX_MATCHES_TO_FETCH
        )

        # Étape 3 : Calculer le score et la réponse d'affinité
        response = AffinityScoreCalculator.calculate_duo_affinity(
            player1_name=real_game_name_1,
            player1_tag=real_tag_line_1,
            player2_name=real_game_name_2,
            player2_tag=real_tag_line_2,
            duo_matches=duo_matches,
            puuid1=puuid1,
            puuid2=puuid2
        )

        # Enregistrement automatique dans l'historique du Leaderboard
        try:
            from app.database import SessionLocal
            from app.models.db_models import DuoAffinityHistory
            db_hist = SessionLocal()
            p1_full = f"{real_game_name_1}#{real_tag_line_1}"
            p2_full = f"{real_game_name_2}#{real_tag_line_2}"
            sorted_pair = sorted([p1_full.lower(), p2_full.lower()])
            pair_key = f"{sorted_pair[0]}_{sorted_pair[1]}"

            existing = db_hist.query(DuoAffinityHistory).filter(DuoAffinityHistory.pair_key == pair_key).first()
            if existing:
                existing.overall_score = response.overallScore
                existing.archetype_title = response.archetype.title if response.archetype else None
                existing.total_games = response.duoStats.totalGamesTogether if response.duoStats else 0
                existing.win_rate = response.duoStats.winratePercent if response.duoStats else 0.0
            else:
                new_entry = DuoAffinityHistory(
                    player1_riot_id=p1_full,
                    player2_riot_id=p2_full,
                    pair_key=pair_key,
                    overall_score=response.overallScore,
                    archetype_title=response.archetype.title if response.archetype else None,
                    total_games=response.duoStats.totalGamesTogether if response.duoStats else 0,
                    win_rate=response.duoStats.winratePercent if response.duoStats else 0.0
                )
                db_hist.add(new_entry)
            db_hist.commit()
            db_hist.close()
        except Exception as err_hist:
            logger.warning(f"Erreur d'enregistrement leaderboard: {err_hist}")

        return response

    except RiotApiError as e:
        logger.error(f"Erreur API Riot lors de l'analyse: {e.message}")
        raise HTTPException(status_code=e.status_code, detail=e.message)
    except Exception as e:
        logger.exception("Erreur serveur inattendue lors du traitement.")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Erreur interne lors du traitement de la compatibilité: {str(e)}"
        )


@app.get("/api/compatibility/leaderboard", tags=["Compatibilité"])
async def get_affinity_leaderboard(limit: int = 10):
    """
    Retourne le classement des meilleurs duos calculés (Top Affinités).
    """
    from app.database import SessionLocal
    from app.models.db_models import DuoAffinityHistory

    db = SessionLocal()
    try:
        entries = db.query(DuoAffinityHistory).order_by(
            DuoAffinityHistory.overall_score.desc(),
            DuoAffinityHistory.total_games.desc()
        ).limit(limit).all()

        results = []
        for rank, entry in enumerate(entries, 1):
            results.append({
                "rank": rank,
                "player1": entry.player1_riot_id,
                "player2": entry.player2_riot_id,
                "score": entry.overall_score,
                "archetypeTitle": entry.archetype_title or "Âmes Sœurs de la Faille",
                "totalGames": entry.total_games,
                "winRate": entry.win_rate
            })

        # Si peu d'entrées calculées, ajouter des duos de démo iconiques
        demo_entries = [
            {"player1": "PrincessPinkyUp#8ï8", "player2": "PrincessDarkyUp#8ï8", "score": 84, "archetypeTitle": "Âmes Sœurs de la Botlane", "totalGames": 10, "winRate": 70.0},
            {"player1": "Lucian#LOVE", "player2": "Nami#HEAL", "score": 96, "archetypeTitle": "Duo Iconique Botlane", "totalGames": 18, "winRate": 78.5},
            {"player1": "Keria#T1", "player2": "Gumayusi#T1", "score": 94, "archetypeTitle": "Champions du Monde", "totalGames": 45, "winRate": 72.0},
            {"player1": "Xayah#FEATHER", "player2": "Rakan#DANCE", "score": 92, "archetypeTitle": "Le Tandem Explosif", "totalGames": 14, "winRate": 68.0},
            {"player1": "Caps#G2", "player2": "Jankos#G2", "score": 89, "archetypeTitle": "Les Maîtres du Tempo", "totalGames": 32, "winRate": 65.5},
        ]
        for d in demo_entries:
            if not any(r["player1"].lower() == d["player1"].lower() for r in results):
                d["rank"] = len(results) + 1
                results.append(d)

        # Réorganisation du rang 1..N
        for idx, item in enumerate(results, 1):
            item["rank"] = idx

        return results[:limit]
    finally:
        db.close()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
