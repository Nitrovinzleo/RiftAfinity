# Strict Directive: Live API Data Integrity

1. **NO Hardcoded If-Else Fallbacks**: NEVER hardcode mock fallback values or arbitrary `if ("pinky" in name)` conditional overrides when correcting or retrieving player data, ranks, winrates, or main champions.
2. **ALWAYS Fetch via Official Riot Games API**: Always fetch, synchronize, and update player statistics (Riot ID, rank tier, division, wins/losses, champion mastery #1, icons) live directly from the Riot Games API endpoints (`ACCOUNT-V1`, `SUMMONER-V4`, `LEAGUE-V4`, `CHAMPION-MASTERY-V4`) or the PostgreSQL database.
3. **Strict Account Identity Integrity**: Preserve exact user accounts and their verified Riot API metrics without mixing or swapping data between different users.
