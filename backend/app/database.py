import os
import tempfile
import ssl
import re
from dotenv import load_dotenv
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# Chargement automatique des variables .env
load_dotenv()

# 1. Vérification si une URL de base de données Cloud PostgreSQL (Neon.tech / Supabase) est fournie
DATABASE_URL = os.environ.get("DATABASE_URL") or os.environ.get("POSTGRES_URL")

if DATABASE_URL:
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql://", 1)
        
    try:
        import psycopg2
        SQLALCHEMY_DATABASE_URL = DATABASE_URL
        if not SQLALCHEMY_DATABASE_URL.startswith("postgresql+"):
            SQLALCHEMY_DATABASE_URL = SQLALCHEMY_DATABASE_URL.replace("postgresql://", "postgresql+psycopg2://", 1)
        engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
    except Exception:
        # Fallback pour pg8000 sur Vercel Serverless
        ssl_ctx = ssl.create_default_context()
        clean_url = DATABASE_URL
        if not clean_url.startswith("postgresql+"):
            clean_url = clean_url.replace("postgresql://", "postgresql+pg8000://", 1)
        
        # Supprimer le paramètre sslmode qui fait planter pg8000 connect()
        clean_url = re.sub(r"[?&]sslmode=[^&]+", "", clean_url)
        clean_url = re.sub(r"[?&]channel_binding=[^&]+", "", clean_url)
        if "?" not in clean_url and "&" in clean_url:
            clean_url = clean_url.replace("&", "?", 1)

        engine = create_engine(clean_url, connect_args={"ssl_context": ssl_ctx}, pool_pre_ping=True)
else:
    # Mode SQLite fallback (local / tmp)
    if os.environ.get("VERCEL") or os.name != 'nt':
        DB_PATH = os.path.join(tempfile.gettempdir(), "riftaffinity.db")
    else:
        DB_PATH = os.path.join(os.path.dirname(os.path.dirname(__file__)), "riftaffinity.db")

    SQLALCHEMY_DATABASE_URL = f"sqlite:///{DB_PATH}"
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

