import time
import asyncio
from typing import Any, Optional, Dict
import logging

logger = logging.getLogger("riftaffinity.cache")

class MemoryCache:
    """
    Système de cache en mémoire thread-safe avec expiration TTL (Time-To-Live).
    Permet de stocker les requêtes lourdes (Match-V5, Account PUUIDs) pour respecter la limite
    stricte de l'API Riot Games (100 requêtes / 2 minutes).
    """
    def __init__(self, default_ttl: int = 7200):
        self._store: Dict[str, Any] = {}
        self._expires: Dict[str, float] = {}
        self._lock = asyncio.Lock()
        self.default_ttl = default_ttl

    async def get(self, key: str) -> Optional[Any]:
        """
        Récupère une valeur du cache si elle existe et n'a pas expiré.
        """
        async with self._lock:
            if key not in self._store:
                return None
            
            # Vérification de l'expiration
            if time.time() > self._expires.get(key, 0):
                # Supprimer les données expirées
                del self._store[key]
                del self._expires[key]
                return None
            
            return self._store[key]

    async def set(self, key: str, value: Any, ttl: Optional[int] = None) -> None:
        """
        Enregistre une valeur dans le cache avec une durée d'expiration TTL (en secondes).
        """
        async with self._lock:
            expiration_time = time.time() + (ttl if ttl is not None else self.default_ttl)
            self._store[key] = value
            self._expires[key] = expiration_time

    async def clear(self) -> None:
        """
        Vide l'ensemble du cache.
        """
        async with self._lock:
            self._store.clear()
            self._expires.clear()

# Instance unique globale de cache
cache_service = MemoryCache()
