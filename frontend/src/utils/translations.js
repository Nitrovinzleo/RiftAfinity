export const translations = {
  fr: {
    navbar: {
      subtitle: "Compatibilité Invocateur LoL",
      langSwitch: "English 🇬🇧"
    },
    form: {
      tagline: "Testeur d'Affinité Invocateur",
      title: "Mesurez Votre Compatibilité",
      subtitle: "Entrez les Riot IDs des deux joueurs (ex: Pseudo#TAG) pour analyser leur complicité.",
      p1Label: "Premier Invocateur",
      p2Label: "Second Invocateur",
      p1Placeholder: "ex: Faker#KR1",
      p2Placeholder: "ex: Keria#T1",
      regionLabel: "Serveur de Jeu (Région Riot)",
      advancedOptions: "Options avancées (Clé API Riot optionnelle)",
      advancedHide: "Masquer la clé API",
      apiKeyNotice: "Si le serveur n'a pas de clé API valide configurée, saisissez votre clé de développement Riot.",
      submitBtn: "Analyser notre Compatibilité",
      validationErr: "Veuillez renseigner le pseudo et le tag au format Pseudo#TAG (ex: Faker#KR1)."
    },
    loading: {
      title: "Analyse de Votre Compatibilité...",
      steps: [
        "Conversion des Riot IDs via ACCOUNT-V1...",
        "Récupération de l'historique complet MATCH-V5...",
        "Optimisation par intersection de matchs...",
        "Vérification des équipes communes et duos...",
        "Calcul des scores de winrate et de synergie...",
        "Génération de votre profil d'affinité..."
      ]
    },
    dashboard: {
      newSearch: "Autre Duo",
      scoreTitle: "Score d'Affinité",
      winrate: "Taux de Victoire",
      synergy: "Synergie Elimin.",
      roles: "Rôles & Champions",
      volume: "Volume & Exp.",
      archetypeLabel: "Profil d'Affinité",
      statsTitle: "Statistiques du Duo",
      gamesAnalyzed: "partie(s) analysée(s)",
      winrateDuo: "Winrate Duo",
      sharedKills: "Kills Partagés",
      favoriteLane: "Voies Duo",
      favoriteChamps: "Duo Champions",
      avgDuration: "Durée moy.",
      perfTitle: "Performances Individuelles en Duo",
      kdaRatio: "Ratio KDA",
      matchHistoryTitle: "Dernières Parties Jouées Ensemble",
      win: "Victoire",
      loss: "Défaite",
      sharedElims: "éliminations conjointes",
      shareCardBtn: "Télécharger la Carte",
      copyLinkBtn: "Partager le Lien",
      copiedMsg: "Lien copié !",
      cardScoreLabel: "Score Global",
      cardArchetypeLabel: "Profil Attribué",
      cardTitle: "Carte d'Affinité Invocateur"
    },
    error: {
      title: "Clé API Riot Indisponible ou Expirée",
      howToFix: "💡 Comment résoudre cela ?",
      step1: "Les clés gratuites de développement Riot s'expirent toutes les 24h.",
      step2: "Générez une nouvelle clé gratuite sur developer.riotgames.com.",
      retryBtn: "Modifier les Pseudos / Clé API"
    }
  },
  en: {
    navbar: {
      subtitle: "LoL Summoner Compatibility",
      langSwitch: "Français 🇫🇷"
    },
    form: {
      tagline: "Summoner Affinity Tester",
      title: "Check Your Compatibility",
      subtitle: "Enter Riot IDs for both players (e.g. Name#TAG) to analyze your duo history & chemistry.",
      p1Label: "First Summoner",
      p2Label: "Second Summoner",
      p1Placeholder: "e.g. Faker#KR1",
      p2Placeholder: "e.g. Keria#T1",
      regionLabel: "Game Server (Riot Region)",
      advancedOptions: "Advanced options (Optional Riot API Key)",
      advancedHide: "Hide API key option",
      apiKeyNotice: "If the server key is missing, enter your developer Riot API key.",
      submitBtn: "Calculate Our Compatibility",
      validationErr: "Please enter Riot IDs in Name#TAG format (e.g. Faker#KR1)."
    },
    loading: {
      title: "Calculating Your Duo Affinity...",
      steps: [
        "Resolving Riot IDs via ACCOUNT-V1...",
        "Fetching match history via MATCH-V5...",
        "Calculating common match intersection...",
        "Verifying same-team duo games...",
        "Computing winrate & synergy scores...",
        "Generating your affinity archetype..."
      ]
    },
    dashboard: {
      newSearch: "New Match",
      scoreTitle: "Affinity Score",
      winrate: "Win Rate",
      synergy: "Kill Synergy",
      roles: "Roles & Synergy",
      volume: "Duo Volume",
      archetypeLabel: "Affinity Archetype",
      statsTitle: "Duo Stats & Chemistry",
      gamesAnalyzed: "games analyzed",
      winrateDuo: "Duo Winrate",
      sharedKills: "Shared Kills",
      favoriteLane: "Favorite Lane",
      favoriteChamps: "Duo Champions",
      avgDuration: "Avg Duration",
      perfTitle: "Individual Duo Performance",
      kdaRatio: "KDA Ratio",
      matchHistoryTitle: "Recent Matches Played Together",
      win: "Victory",
      loss: "Defeat",
      sharedElims: "shared eliminations",
      shareCardBtn: "Download Card",
      copyLinkBtn: "Share Link",
      copiedMsg: "Link Copied!",
      cardScoreLabel: "Global Score",
      cardArchetypeLabel: "Assigned Archetype",
      cardTitle: "Summoner Affinity Card"
    },
    error: {
      title: "Riot API Key Expired or Invalid",
      howToFix: "💡 How to resolve this?",
      step1: "Free developer Riot API keys expire automatically every 24 hours.",
      step2: "Generate a new free key on developer.riotgames.com.",
      retryBtn: "Edit Pseudos / API Key"
    }
  }
};
