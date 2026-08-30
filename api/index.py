import os
import sys

# Obtenir le chemin absolu du dossier racine et du dossier backend
root_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
backend_dir = os.path.join(root_dir, "backend")

# Inclusion dynamique dans sys.path pour Vercel Python Serverless
for path in [root_dir, backend_dir]:
    if path not in sys.path:
        sys.path.insert(0, path)

try:
    from backend.app.main import app
except ImportError:
    try:
        from app.main import app
    except ImportError:
        from main import app

__all__ = ["app"]
