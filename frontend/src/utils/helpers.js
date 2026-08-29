/**
  Convertit un nom de champion League of Legends en nom d'image officiel DataDragon CDN.
  Ex: Wukong -> MonkeyKing, Fiddlesticks -> Fiddlesticks, etc.
 */
export function getChampionIconUrl(championName) {
  if (!championName || championName === "Unknown") {
    return 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Square.png';
  }

  let cleanName = championName.replace(/['\s.]/g, '');

  const MAPPINGS = {
    "Wukong": "MonkeyKing",
    "Fiddlesticks": "Fiddlesticks",
    "FiddleSticks": "Fiddlesticks",
    "KogMaw": "KogMaw",
    "RekSai": "RekSai",
    "VelKoz": "Velkoz",
    "BelVeth": "Belveth",
    "LeBlanc": "Leblanc",
    "KhaZix": "Khazix",
    "Nunu&Willump": "Nunu",
    "Nunu": "Nunu",
    "RenataGlasc": "Renata",
    "ChoGath": "Chogath"
  };

  cleanName = MAPPINGS[cleanName] || cleanName;

  return `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/${cleanName}.png`;
}
