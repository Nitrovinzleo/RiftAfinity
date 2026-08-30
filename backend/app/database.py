import os
import tempfile
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base

# 1. Vérification si une URL de base de données Cloud PostgreSQL (Neon.tech / Supabase) est fournie
DATABASE_URL = os.environ.get("DATABASE_URL")

if DATABASE_URL:
    # Adaptation du schéma vers le pilote pure-Python pg8000 garanti 100% fonctionnel sur Vercel Serverless
    if DATABASE_URL.startswith("postgres://"):
        DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+pg8000://", 1)
    elif DATABASE_URL.startswith("postgresql://") and "+pg8000" not in DATABASE_URL and "+psycopg2" not in DATABASE_URL:
        DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+pg8000://", 1)
    
    SQLALCHEMY_DATABASE_URL = DATABASE_URL
    engine = create_engine(SQLALCHEMY_DATABASE_URL, pool_pre_ping=True)
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
