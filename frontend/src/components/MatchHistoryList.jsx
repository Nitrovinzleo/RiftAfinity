import React from 'react';
import { Gamepad2, Flame, Clock } from 'lucide-react';
import { getChampionIconUrl } from '../utils/helpers';
import { translations } from '../utils/translations';

export default function MatchHistoryList({ matches, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;

  if (!matches || matches.length === 0) {
    return (
      <div className="p-6 rounded-xl glass-panel-vibrant text-center text-slate-400 text-sm">
        Aucune partie commune récente enregistrée dans l'historique d'analyse.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Entête Historique */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-lg sm:text-xl text-white flex items-center gap-2">
          <Gamepad2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#00f0ff]" />
          <span>{t.matchHistoryTitle}</span>
        </h3>
        <span className="text-xs text-slate-400">
          {matches.length} {t.gamesAnalyzed}
        </span>
      </div>

      {/* Liste des Cartes de Matchs avec Icônes de Champions Officiels */}
      <div className="space-y-3">
        {matches.map((match) => {
          const isWin = match.win;
          const durationMin = Math.floor(match.gameDurationSeconds / 60);
          const durationSec = match.gameDurationSeconds % 60;

          const p1Icon = getChampionIconUrl(match.player1.championName);
          const p2Icon = getChampionIconUrl(match.player2.championName);

          return (
            <div
              key={match.matchId}
              className={`p-3.5 sm:p-4 rounded-xl border transition-all ${
                isWin
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4`}
            >
              {/* Badge Résultat & Durée */}
              <div className="flex items-center justify-between sm:justify-start gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 sm:w-12 sm:h-12 rounded-lg font-bold text-[11px] sm:text-xs flex flex-col items-center justify-center shrink-0 uppercase tracking-wider ${
                      isWin 
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' 
                        : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    }`}
                  >
                    <span>{isWin ? t.win : t.loss}</span>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-200 flex items-center gap-2">
                      <span>{match.gameMode}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                        <Clock className="w-3 h-3" />
                        {durationMin}m {durationSec}s
                      </span>
                    </div>
                    <div className="text-[11px] text-[#ff2a85] mt-0.5 flex items-center gap-1 font-medium">
                      <Flame className="w-3.5 h-3.5 text-[#ff2a85]" />
                      <span>{match.sharedKillsCount} {t.sharedElims}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Champions & KDA des 2 Joueurs avec VRAIES Icônes DataDragon */}
              <div className="flex items-center justify-between sm:justify-end gap-3 sm:gap-6 text-xs border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-2.5 sm:pt-0 sm:pl-6">
                
                {/* Joueur 1 */}
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#ff2a85] shadow-md bg-slate-900 shrink-0">
                    <img 
                      src={p1Icon} 
                      alt={match.player1.championName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Square.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">{match.player1.championName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {match.player1.kills}/{match.player1.deaths}/{match.player1.assists}
                    </div>
                  </div>
                </div>

                <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#ff2a85]/20 border border-[#ff2a85]/40 flex items-center justify-center text-[#ff2a85] font-bold text-xs shrink-0">
                  +
                </div>

                {/* Joueur 2 */}
                <div className="flex items-center gap-2">
                  <div className="relative w-9 h-9 sm:w-10 sm:h-10 rounded-full overflow-hidden border-2 border-[#00f0ff] shadow-md bg-slate-900 shrink-0">
                    <img 
                      src={p2Icon} 
                      alt={match.player2.championName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/champion/Square.png';
                      }}
                    />
                  </div>
                  <div>
                    <div className="font-bold text-slate-100 text-xs">{match.player2.championName}</div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      {match.player2.kills}/{match.player2.deaths}/{match.player2.assists}
                    </div>
                  </div>
                </div>

              </div>

            </div>
          );
        })}
      </div>
    </div>
  );
}
