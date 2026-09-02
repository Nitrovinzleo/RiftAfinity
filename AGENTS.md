# Project Guidelines & Rules

## 1. Live Riot Games API Data Integrity
- **Zero Hardcoded If Mappings**: When fetching, updating, or displaying League of Legends player stats (rank, division, winrates, main champions, icons, avatars), NEVER use hardcoded `if` statements or mock data overrides.
- **Always Fetch from Live Riot API / Database**: Always query live Riot Games API endpoints (`ACCOUNT-V1`, `SUMMONER-V4`, `LEAGUE-V4`, `CHAMPION-MASTERY-V4`) or query the synchronized database.

## 2. Duo Player HD Cards & Spoken Languages
- Display real country flag images via CDN (`https://flagcdn.com/24x18/...`) so flag icons render on Windows PCs and exported HD canvas images.
- Keep card header badges compact and responsive to prevent overflow on mobile.

## 3. Production Deployment
- Always build (`npm run build`) and push changes to `origin main` for automatic Vercel deployment (`https://rift-afinity.vercel.app/`).
