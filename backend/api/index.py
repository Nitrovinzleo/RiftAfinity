import os
import sys

# Résolution des chemins sys.path pour Vercel Python Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
root_dir = os.path.dirname(parent_dir)

for path in [root_dir, parent_dir, current_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

# Importation directe au niveau supérieur (Top-level declaration pour l'analyseur Vercel)
from app.main import app as app

# Alias explicites pour la compatibilité Vercel Serverless
handler = app
application = app

__all__ = ["app", "handler", "application"]
