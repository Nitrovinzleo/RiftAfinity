import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Détection automatique de l'environnement Vercel / Serverless (lecture seule sur /var/task)
if os.environ.get("VERCEL") or os.name != 'nt':
    # Sur Vercel Serverless (Linux), utiliser le dossier /tmp autorisé en écriture
    DB_PATH = os.path.join(tempfile.gettempdir(), "riftaffinity.db")
else:
    # En développement local Windows
    DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "riftaffinity.db")

SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"

# Utilisation des requêtes paramétrées via l'ORM SQLAlchemy pour une protection intégrale contre les injections SQL
engine = create_engine(
    SQLALCHEMY_DATABASE_URL, 
    connect_args={"check_same_thread": False}
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# Dépendance FastAPI pour obtenir une session de base de données
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
