# Project Guidelines & Rules

## 1. User Profile Data Precedence (HIGHEST PRIORITY)
- **User Data First**: Data entered or uploaded directly by the user on their profile (custom uploaded photo/avatar, custom display name, primary role) ALWAYS takes precedence over Riot API data.
- **Riot Summoner Icon as Fallback Only**: Riot summoner profile icons (e.g. icon #7196) must ONLY be used as a fallback when the user has NOT uploaded a custom profile photo. Riot sync MUST NEVER overwrite a user's custom avatar.

## 2. Live Riot Games API Data Integrity
- **Zero Hardcoded Mappings**: When fetching, updating, or displaying League of Legends rank stats (rank, division, winrates, main champions, icons), NEVER use hardcoded `if` statements or mock data overrides.
- **Always Fetch from Live Riot API / Database**: Query live Riot Games API endpoints (`ACCOUNT-V1`, `SUMMONER-V4`, `LEAGUE-V4`, `CHAMPION-MASTERY-V4`) or query the synchronized database.

## 3. Duo Player HD Cards & Spoken Languages
- Display real country flag images via CDN (`https://flagcdn.com/24x18/...`) so flag icons render on Windows PCs and exported HD canvas images.
- Keep card header badges compact and responsive to prevent overflow on mobile.

## 4. Production Deployment
- Always build (`npm run build`) and push changes to `origin main` for automatic Vercel deployment (`https://rift-afinity.vercel.app/`).
