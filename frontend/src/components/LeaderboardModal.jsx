import React, { useEffect, useState } from 'react';
import { X, Trophy, Heart, Flame, Sparkles, ShieldCheck, Gamepad2, Award } from 'lucide-react';
import Logo from './Logo';

export default function LeaderboardModal({ isOpen, onClose, topDuos = [], currentLang = 'fr' }) {
  const [filter, setFilter] = useState('affinity'); // 'affinity' | 'winrate'

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // Top 10 Duos par défaut si la liste est courte
  const defaultTop10 = [
    { id: 1, player1Name: 'Faker', player2Name: 'Keria', score: 98, archetype: '🏆 Duo de Légende T1', winrate: '82%', games: 45 },
    { id: 2, player1Name: 'PrincessPinkyUp', player2Name: 'Lesbian princess', score: 95, archetype: '💎 High Elo Duo', winrate: '74%', games: 38 },
    { id: 3, player1Name: 'Doakes', player2Name: 'ILoveN', score: 91, archetype: '🔥 Climber Duo', winrate: '68%', games: 29 },
    { id: 4, player1Name: 'Rekkles', player2Name: 'Mikyx', score: 89, archetype: '🏹 Bottlane Carry Duo', winrate: '66%', games: 24 },
    { id: 5, player1Name: 'Caps', player2Name: 'Jankos', score: 87, archetype: '⚡ Mid-Jungle Synergy', winrate: '65%', games: 21 },
    { id: 6, player1Name: 'Chovy', player2Name: 'Peanut', score: 86, archetype: '🧠 Macro Boss Duo', winrate: '63%', games: 19 },
    { id: 7, player1Name: 'Viper', player2Name: 'Meiko', score: 84, archetype: '🏹 World Champions', winrate: '62%', games: 17 },
    { id: 8, player1Name: 'ShowMaker', player2Name: 'Canyon', score: 83, archetype: '⚡ DK Iconic Duo', winrate: '61%', games: 16 },
    { id: 9, player1Name: 'Gumayusi', player2Name: 'Keria', score: 82, archetype: '🏹 Bot Duo God Tier', winrate: '60%', games: 15 },
    { id: 10, player1Name: 'tibo', player2Name: 'Ismael', score: 80, archetype: '🛡️ Silver-Gold Climber', winrate: '58%', games: 14 }
  ];

  const rawList = (topDuos && topDuos.length > 0) ? topDuos : defaultTop10;

  // Compléter jusqu'à 10 duos si nécessaire
  const list = [...rawList];
  while (list.length < 10 && defaultTop10[list.length]) {
    list.push(defaultTop10[list.length]);
  }

  // Tri par filtre
  const sortedList = [...list].sort((a, b) => {
    if (filter === 'winrate') {
      const wrA = parseInt(a.winrate) || 0;
      const wrB = parseInt(b.winrate) || 0;
      return wrB - wrA;
    }
    return (b.score || 0) - (a.score || 0);
  }).slice(0, 10);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-3 sm:px-4 py-6 sm:py-10 flex justify-center items-start">
      <div className="relative w-full max-w-3xl p-5 sm:p-8 rounded-3xl glass-panel-vibrant border border-amber-500/50 shadow-2xl space-y-6 my-auto text-slate-100">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête Modale Classement */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-5 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-300 flex items-center justify-center border border-amber-500/40 shadow-lg shrink-0">
              <Trophy className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center justify-center sm:justify-start gap-2">
                <h3 className="font-display font-black text-2xl text-white">
                  {currentLang === 'fr' ? 'Classement des Top 10 Duos 🏆' : 'Top 10 Duos Leaderboard 🏆'}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                {currentLang === 'fr' 
                  ? 'Le classement officiel des meilleurs Duos de la plateforme par affinité & complicité.'
                  : 'The official platform leaderboard of top Duos by affinity & chemistry.'}
              </p>
            </div>
          </div>

          {/* Filtres de Tri (Affinité vs Winrate) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            <button
              onClick={() => setFilter('affinity')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'affinity' 
                  ? 'bg-amber-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              🏆 Top Affinité
            </button>
            <button
              onClick={() => setFilter('winrate')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter === 'winrate' 
                  ? 'bg-emerald-500 text-slate-950 shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              ⚡ Top Winrate
            </button>
          </div>
        </div>

        {/* --- LISTE TOP 10 DUOS --- */}
        <div className="space-y-2.5 max-h-[420px] overflow-y-auto pr-1">
          {sortedList.map((duo, idx) => {
            const isTop1 = idx === 0;
            const isTop2 = idx === 1;
            const isTop3 = idx === 2;

            return (
              <div 
                key={duo.id || idx}
                className={`p-3.5 sm:p-4 rounded-2xl flex items-center justify-between gap-3 transition-all border shadow-md ${
                  isTop1 
                    ? 'bg-gradient-to-r from-amber-500/20 via-[#101429] to-[#171b36] border-amber-400/60 shadow-amber-500/10' 
                    : isTop2 
                    ? 'bg-gradient-to-r from-slate-300/15 via-[#101429] to-[#171b36] border-slate-300/40 shadow-slate-300/10' 
                    : isTop3 
                    ? 'bg-gradient-to-r from-amber-700/20 via-[#101429] to-[#171b36] border-amber-700/40' 
                    : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Rang + Icone Médaille */}
                <div className="flex items-center gap-3 shrink-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-black text-xs shadow-md ${
                    isTop1 ? 'bg-amber-400 text-slate-950 font-black' :
                    isTop2 ? 'bg-slate-200 text-slate-950 font-black' :
                    isTop3 ? 'bg-amber-700 text-white font-black' :
                    'bg-slate-900 text-slate-400 border border-slate-800'
                  }`}>
                    {isTop1 ? '🥇' : isTop2 ? '🥈' : isTop3 ? '🥉' : `#${idx + 1}`}
                  </div>

                  {/* Noms & Avatars des 2 Invocateurs */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Joueur 1 */}
                      <div className="flex items-center gap-1.5">
                        {duo.player1Avatar && (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#ff2a85] shadow-sm bg-slate-950 shrink-0">
                            <img 
                              src={duo.player1Avatar} 
                              alt={duo.player1Name} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <span className="text-[#ff2a85] font-extrabold text-sm sm:text-base">{duo.player1Name}</span>
                      </div>

                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500 shrink-0 mx-0.5 animate-pulse" />

                      {/* Joueur 2 */}
                      <div className="flex items-center gap-1.5">
                        {duo.player2Avatar && (
                          <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-full overflow-hidden border border-[#00f0ff] shadow-sm bg-slate-950 shrink-0">
                            <img 
                              src={duo.player2Avatar} 
                              alt={duo.player2Name} 
                              className="w-full h-full object-cover"
                              onError={(e) => { e.target.onerror = null; e.target.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <span className="text-[#00f0ff] font-extrabold text-sm sm:text-base">{duo.player2Name}</span>
                      </div>
                    </div>

                    <span className="text-[11px] text-amber-300 font-semibold block italic">
                      {duo.archetype}
                    </span>
                  </div>
                </div>

                {/* Score & Winrate */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  <div>
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Affinité</span>
                    <span className="font-display font-black text-sm sm:text-base text-[#00f0ff]">
                      {duo.score}%
                    </span>
                  </div>

                  <div className="hidden sm:block">
                    <span className="text-[9px] text-slate-400 uppercase block font-bold">Winrate</span>
                    <span className="font-bold text-xs text-emerald-400">
                      {duo.winrate}
                    </span>
                  </div>

                  <div className="px-2.5 py-1 rounded-xl bg-slate-900 border border-slate-800 text-[10px] font-mono text-slate-400 hidden md:block">
                    {duo.games} games
                  </div>
                </div>

              </div>
            );
          })}
        </div>

        {/* Footer Modale */}
        <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>{currentLang === 'fr' ? 'Mis à jour après chaque analyse de Duo' : 'Updated after every Duo analysis'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-slate-200 transition-colors"
          >
            {currentLang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
