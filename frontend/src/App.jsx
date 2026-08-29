import React, { useState } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RiotForm from './components/RiotForm';
import LoadingScreen from './components/LoadingScreen';
import ResultDashboard from './components/ResultDashboard';
import { AlertCircle, RefreshCw, Sparkles, ExternalLink } from 'lucide-react';

export default function App() {
  const [viewState, setViewState] = useState('form'); // 'form' | 'loading' | 'result' | 'error'
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  // Envoi de la requête au backend FastAPI
  const handleFormSubmit = async (formData) => {
    setViewState('loading');
    setErrorMessage('');

    try {
      // Détermination de l'URL du backend (local ou relatif si même domaine)
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de l\'analyse du duo.');
      }

      setResultData(data);
      setViewState('result');
    } catch (err) {
      console.error('Erreur d\'analyse:', err);
      setErrorMessage(err.message || 'Impossible de se connecter au serveur backend.');
      setViewState('error');
    }
  };

  // Chargement du Mode Démo
  const handleDemoClick = async () => {
    setViewState('loading');
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/demo`);
      
      if (response.ok) {
        const data = await response.json();
        setResultData(data);
        setViewState('result');
        return;
      }
    } catch (err) {
      console.warn('Backend non disponible pour la démo, utilisation du fallback local.');
    }

    // Fallback local au cas où le serveur backend n'est pas encore lancé
    setTimeout(() => {
      setResultData({
        overallScore: 94,
        scoreBreakdown: { winrateScore: 34.5, synergyScore: 28.5, roleScore: 19.5, volumeScore: 11.5 },
        archetype: {
          title: "Âmes Sœurs de la Botlane",
          subtitle: "Harmonie ADC & Support indéboulonnable",
          quote: "« Un bouclier pour te protéger, un arc pour conquérir la Faille. »",
          description: "Vous formez le duo classique et le plus fusionnel de League of Legends. Votre compréhension mutuelle frôle la télépathie : quand l'un décoche une flèche de cristal, l'autre enchaîne instantanément le contrôle. Votre complicité en fait le cauchemar de la Botlane adverse !",
          badgeGradient: "from-pink-500 via-purple-500 to-indigo-600",
          iconName: "duo_sparkles"
        },
        duoStats: {
          totalGamesTogether: 18,
          winsTogether: 14,
          lossesTogether: 4,
          winratePercent: 77.8,
          sharedKillsAssistsTotal: 142,
          jointKillParticipationPercent: 68.4,
          favoriteLaneCombo: "Botlane Duo (ADC & Support)",
          topChampionDuo: "Lucian & Nami",
          avgDurationMinutes: 27.4
        },
        player1Summary: { gameName: "CupidCarry", tagLine: "LOVE", totalKills: 164, totalDeaths: 42, totalAssists: 98, kdaRatio: 6.24 },
        player2Summary: { gameName: "AngelPeel", tagLine: "HEAL", totalKills: 22, totalDeaths: 38, totalAssists: 240, kdaRatio: 6.89 },
        commonMatches: [
          {
            matchId: "EUW1_68492019",
            gameMode: "CLASSIC",
            gameDurationSeconds: 1740,
            gameCreationTimestamp: 1716000000000,
            win: true,
            player1: { puuid: "d1", gameName: "CupidCarry", tagLine: "LOVE", championId: 236, championName: "Lucian", role: "BOTTOM", kills: 14, deaths: 2, assists: 8, win: true, goldEarned: 16400, totalDamageDealtToChampions: 34200 },
            player2: { puuid: "d2", gameName: "AngelPeel", tagLine: "HEAL", championId: 267, championName: "Nami", role: "UTILITY", kills: 2, deaths: 1, assists: 18, win: true, goldEarned: 10800, totalDamageDealtToChampions: 11500 },
            sharedKillsCount: 18
          },
          {
            matchId: "EUW1_68491888",
            gameMode: "CLASSIC",
            gameDurationSeconds: 1620,
            gameCreationTimestamp: 1715980000000,
            win: true,
            player1: { puuid: "d1", gameName: "CupidCarry", tagLine: "LOVE", championId: 498, championName: "Xayah", role: "BOTTOM", kills: 11, deaths: 3, assists: 6, win: true, goldEarned: 14800, totalDamageDealtToChampions: 28900 },
            player2: { puuid: "d2", gameName: "AngelPeel", tagLine: "HEAL", championId: 497, championName: "Rakan", role: "UTILITY", kills: 1, deaths: 2, assists: 14, win: true, goldEarned: 9900, totalDamageDealtToChampions: 8400 },
            sharedKillsCount: 14
          }
        ],
        isDemoData: true
      });
      setViewState('result');
    }, 1500);
  };

  const handleReset = () => {
    setViewState('form');
    setResultData(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Barre de navigation sticky */}
      <Navbar onReset={handleReset} />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Écran Formulaire */}
        {viewState === 'form' && (
          <RiotForm
            onSubmit={handleFormSubmit}
            isLoading={false}
          />
        )}

        {/* Écran Chargement Dynamique */}
        {viewState === 'loading' && <LoadingScreen />}

        {/* Écran Tableau de Bord des Résultats */}
        {viewState === 'result' && (
          <ResultDashboard result={resultData} onReset={handleReset} />
        )}

        {/* Écran d'Erreur */}
        {viewState === 'error' && (
          <div className="max-w-lg mx-auto my-12 p-8 rounded-2xl glass-panel text-center space-y-5 border border-rose-500/40 shadow-2xl">
            <div className="w-12 h-12 rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center mx-auto border border-rose-500/40">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-bold text-2xl text-white">
                Clé API Riot Indisponible ou Expirée
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
              <div className="font-semibold text-hextech-gold">💡 Comment résoudre cela ?</div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>Les clés de développement gratuites Riot (<code className="text-hextech-cyan">RGAPI-...</code>) s'expirent automatiquement toutes les 24h.</li>
                <li>Générez une nouvelle clé gratuite en 1 clic sur <a href="https://developer.riotgames.com/" target="_blank" rel="noreferrer" className="text-hextech-cyan underline font-semibold">developer.riotgames.com</a>.</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>Modifier les Pseudos / Clé API</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Pied de page */}
      <Footer />

    </div>
  );
}
