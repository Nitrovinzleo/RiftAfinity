import os
import sys

# Résolution des chemins sys.path pour Vercel Python Serverless
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

for path in [root_dir, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Importation directe au niveau supérieur (Top-level declaration pour l'analyseur Vercel)
from backend.app.main import app as app

# Alias explicites pour la compatibilité Vercel Serverless
handler = app
application = app

__all__ = ["app", "handler", "application"]
