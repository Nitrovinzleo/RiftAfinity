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
    Hachage sécurisé du mot de passe avec SHA-256 et sel unique (sans espaces parasite).
    """
    salt = "riftaffinity_secure_salt_2026"
    clean_pwd = password.strip() if password else ""
    return hashlib.sha256((clean_pwd + salt).encode('utf-8')).hexdigest()

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Vérifie le mot de passe fourni par rapport au hash stocké.
    """
    if not plain_password or not hashed_password:
        return False
    # Vérification avec ou sans strip pour éviter tout piège d'espace au clavier
    clean_hash = hash_password(plain_password)
    raw_hash = hashlib.sha256((plain_password + "riftaffinity_secure_salt_2026").encode('utf-8')).hexdigest()
    return clean_hash == hashed_password or raw_hash == hashed_password

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
