import hashlib
import os
import jwt
from datetime import datetime, timedelta
from typing import Optional

SECRET_KEY = os.environ.get("JWT_SECRET_KEY", "riftaffinity_secret_key_987654321_secure")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 30

def hash_password(password: str) -> str:
    """
    Hachage sécurisé du mot de passe avec SHA-256 et sel unique.
    """
    salt = "riftaffinity_secure_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie le mot de passe fourni par rapport au hash stocké.
    """
    return hash_password(plain_password) == hashed_password

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    """
    Génère un jeton JWT d'authentification pour la session utilisateur.
    """
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS)
    
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

def decode_access_token(token: str) -> Optional[dict]:
    """
    Décode et valide un jeton JWT.
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None
