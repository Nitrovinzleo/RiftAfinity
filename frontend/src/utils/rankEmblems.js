/**
 * Retourne l'URL de l'image de l'emblème / logo du rang League of Legends.
 * Supporte Iron, Bronze, Silver, Gold, Platinum, Emerald, Diamond, Master, Grandmaster, Challenger.
 */
export const getRankEmblemUrl = (tier) => {
  if (!tier) return 'https://opgg-static.akamaized.net/images/medals_new/unranked.png';
  
  const cleanTier = tier.toString().trim().toLowerCase();
  
  const validTiers = [
    'iron', 
    'bronze', 
    'silver', 
    'gold', 
    'platinum', 
    'emerald', 
    'diamond', 
    'master', 
    'grandmaster', 
    'challenger'
  ];

  if (validTiers.includes(cleanTier)) {
    return `https://opgg-static.akamaized.net/images/medals_new/${cleanTier}.png`;
  }

  return 'https://opgg-static.akamaized.net/images/medals_new/unranked.png';
};
