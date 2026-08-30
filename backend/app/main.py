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
            for col in ["custom_avatar", "birth_date"]:
                try:
                    conn.execute(text(f"ALTER TABLE users ADD COLUMN {col} VARCHAR"))
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
