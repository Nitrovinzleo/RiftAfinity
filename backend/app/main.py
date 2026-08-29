import logging
from fastapi import FastAPI, HTTPException, status, Query
from fastapi.middleware.cors import CORSMiddleware

from app.config import settings
from app.models.schemas import CompatibilityRequest, CompatibilityResponse
from app.services.riot_api import RiotApiClient, RiotApiError
from app.services.score_calculator import AffinityScoreCalculator

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

# Configuration CORS pour autoriser l'accès depuis le Frontend React (Vercel ou local)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # En production, vous pouvez restreindre à l'URL de votre Vercel
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

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
