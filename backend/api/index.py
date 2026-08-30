import os
import sys

# Ajout dynamique du répertoire backend dans sys.path pour Vercel Serverless
current_dir = os.path.dirname(os.path.abspath(__file__))
parent_dir = os.path.dirname(current_dir)
if parent_dir not in sys.path:
    sys.path.insert(0, parent_dir)
if current_dir not in sys.path:
    sys.path.insert(0, current_dir)

try:
    from app.main import app
except ImportError:
    from main import app

__all__ = ["app"]
