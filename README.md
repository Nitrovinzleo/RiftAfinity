# 💖 RiftAffinity — Calculateur d'Affinité Invocateur League of Legends

🌐 **Site Web Officiel en Ligne** : [https://riftaffinity.vercel.app](https://riftaffinity.vercel.app)  
📦 **Dépôt GitHub** : [https://github.com/Nitrovinzleo/RiftAfinity](https://github.com/Nitrovinzleo/RiftAfinity)

**RiftAffinity** est une application web moderne et gratuite permettant d'analyser et de mesurer la compatibilité amoureuse et amicale entre deux joueurs de League of Legends en interrogeant l'API officielle **Riot Games**.

---

## 🌟 Fonctionnalités Clés

- 🔍 **Recherche Riot ID Unifiée (ACCOUNT-V1)** : Prise en charge intégrale du nouveau format `gameName#tagLine` avec support des caractères spéciaux Unicode (ex: `8ï8`, `#EUW`, espaces).
- ⚡ **Optimisation par Intersection de Matchs (MATCH-V5)** : Pagination automatique par paquets de 100 matchs, puis intersection des historiques avec `set(matches_j1) & set(matches_j2)` pour limiter drastiquement les requêtes HTTP.
- 🛡️ **Gestion des Quotas (Rate Limiting 429)** : Interception du code HTTP 429 avec attente automatique (`Retry-After`) et système de sémaphore asynchrone pour respecter le quota développeur gratuit (100 requêtes / 2 min).
- 🧮 **Algorithme d'Affinité Pondéré (0-100 Points)** :
  - **Taux de victoire en duo (max 35 pts)**
  - **Participation conjointe aux éliminations & KDA (max 30 pts)**
  - **Complémentarité des rôles & champions (max 20 pts)** (Bonus Botlane ADC/Support, Mid/Jungle, duos légendaires comme Lucian & Nami, Xayah & Rakan)
  - **Volume & expérience duo (max 15 pts)**
- 🏆 **Générateur d'Archétypes Thématiques** : Attribution d'un profil psychologique (*Âmes Sœurs de la Botlane*, *Le Tandem Explosif*, *Protecteur & Carry*, *Duo Toxique & Passionné*...).
- 🎨 **Interface Hextech & Cyber-Romance (React / Vite)** : Logo officiel à contour dégradé néon, jauge radiale animée en SVG, animations luminescentes, statistiques détaillées et historique des parties communes.
- 📸 **Exportation Visuelle Téléchargeable (PNG)** : Génération en un clic d'une carte d'affinité haute définition prête à être partagée sur Discord, Twitter ou Instagram.
- 🧪 **Mode Démo Intégré** : Possibilité d'essayer instantanément l'application sans clé API Riot.

---

## 🏗️ Architecture Technique (Stack 100 % Gratuite)

- **Backend** : FastAPI (Python 3.10+) avec client asynchrone `httpx`, Pydantic v2 et cache mémoire TTL. Hébergé gratuitement sur **Render**.
- **Frontend** : React 18 + Vite + TailwindCSS + Lucide Icons + `html-to-image`. Hébergé gratuitement sur **Vercel**.
- **API** : Riot Games Developer API (Account-V1, Match-V5).

```
RIFT AFINITY/
├── backend/
│   ├── app/
│   │   ├── main.py                  # Serveur FastAPI & routes API (/api/compatibility, /api/demo)
│   │   ├── config.py                # Configuration & mapping des régions Riot API
│   │   ├── services/
│   │   │   ├── riot_api.py          # Client Riot API async (Account-V1, Match-V5, Rate Limit, Pagination)
│   │   │   ├── score_calculator.py  # Algorithme d'affinité (100 pts) & générateur d'archétypes
│   │   │   └── cache.py             # Cache mémoire TTL thread-safe
│   │   └── models/
│   │       └── schemas.py           # Modèles Pydantic pour requêtes/réponses
│   ├── requirements.txt
│   ├── render.yaml                  # Config Déploiement Render
│   └── .env.example
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx            # En-tête avec Logo Officiel et raccourci Démo
│   │   │   ├── RiotForm.jsx          # Formulaire avec validation des 2 Riot IDs
│   │   │   ├── LoadingScreen.jsx     # Écran de chargement dynamique étape par étape
│   │   │   ├── ResultDashboard.jsx   # Tableau de bord général des résultats
│   │   │   ├── ScoreGauge.jsx        # Jauge radiale de score animée (SVG)
│   │   │   ├── ArchetypeCard.jsx     # Badge d'archétype & analyse du duo
│   │   │   ├── StatCard.jsx          # Grille des statistiques cumulées
│   │   │   ├── MatchHistoryList.jsx  # Cartes des parties jouées ensemble
│   │   │   └── ShareableCard.jsx     # Carte d'exportation PNG téléchargeable
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   ├── package.json
│   ├── vite.config.js
│   └── vercel.json                  # Config Déploiement Vercel
└── README.md
```

---

## 🚀 Guide de Démarrage Rapide en Local

### 1. Prérequis
- **Python 3.10+**
- **Node.js 18+** et **npm**
- Une clé API Riot Games gratuite (sur [developer.riotgames.com](https://developer.riotgames.com/))

---

### 2. Lancement du Backend (FastAPI)

```bash
# Se placer dans le dossier backend
cd backend

# Installer les dépendances
python -m pip install -r requirements.txt

# Lancer le serveur backend en mode développement
python -m uvicorn app.main:app --reload --port 8000
```
Le serveur backend est accessible sur : `http://localhost:8000` (Documentation Swagger interactive sur `http://localhost:8000/docs`).

---

### 3. Lancement du Frontend (React / Vite)

Ouvrez un second terminal :

```bash
# Se placer dans le dossier frontend
cd frontend

# Installer les dépendances npm
npm install

# Lancer le serveur de développement Vite
npm run dev
```
L'application web s'ouvre sur : `http://localhost:3000`.

---

## ☁️ Instructions de Déploiement Gratuit

### 1. Déploiement du Backend sur Render
1. Créez un compte gratuit sur [Render.com](https://render.com/).
2. Créez un nouveau **Web Service** et connectez votre dépôt GitHub `Nitrovinzleo/RiftAfinity`.
3. Définissez le dossier racine : `backend`.
4. Renseignez la commande de Build : `pip install -r requirements.txt`.
5. Renseignez la commande de Démarrage : `uvicorn app.main:app --host 0.0.0.0 --port $PORT`.
6. Dans les **Environment Variables**, ajoutez :
   - `RIOT_API_KEY` = *Votre clé RGAPI...*

### 2. Déploiement du Frontend sur Vercel
1. Créez un compte gratuit sur [Vercel.com](https://vercel.com/).
2. Importez votre projet GitHub `Nitrovinzleo/RiftAfinity` et sélectionnez le dossier `frontend`.
3. Vercel détectera automatiquement Vite et configurera les commandes de build (`npm run build`).
4. Ajoutez la variable d'environnement optionnelle `VITE_BACKEND_URL` contenant l'URL de votre backend Render (ex: `https://riftaffinity-backend.onrender.com`).

---

## 📜 Licence & Disclaimer
Ce projet est distribué à des fins éducatives et de divertissement.
League of Legends et Riot Games sont des marques déposées de Riot Games, Inc.
