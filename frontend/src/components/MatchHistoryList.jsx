import React from 'react';
import { Gamepad2, ShieldCheck, Flame, Clock } from 'lucide-react';

export default function MatchHistoryList({ matches }) {
  if (!matches || matches.length === 0) {
    return (
      <div className="p-6 rounded-2xl glass-panel text-center text-slate-400 text-sm">
        Aucune partie commune récente enregistrée dans l'historique d'analyse.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Gamepad2 className="w-5 h-5 text-hextech-cyan" />
          <span>Dernières Parties Jouées Ensemble</span>
        </h3>
        <span className="text-xs text-slate-400">
          {matches.length} match{matches.length > 1 ? 's' : ''} retenu{matches.length > 1 ? 's' : ''}
        </span>
      </div>

      <div className="space-y-3">
        {matches.map((match) => {
          const isWin = match.win;
          const durationMin = Math.floor(match.gameDurationSeconds / 60);
          const durationSec = match.gameDurationSeconds % 60;

          return (
            <div
              key={match.matchId}
              className={`p-4 rounded-xl border transition-all ${
                isWin
                  ? 'bg-emerald-950/20 border-emerald-500/30 hover:border-emerald-500/50'
                  : 'bg-rose-950/20 border-rose-500/30 hover:border-rose-500/50'
              } flex flex-col sm:flex-row sm:items-center justify-between gap-4`}
            >
              {/* Badge Résultat & Durée */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-lg font-bold text-xs flex flex-col items-center justify-center shrink-0 uppercase tracking-wider ${
                    isWin ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                  }`}
                >
                  <span>{isWin ? 'Victoire' : 'Défaite'}</span>
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
                  <div className="text-[11px] text-hextech-gold mt-0.5 flex items-center gap-1 font-medium">
                    <Flame className="w-3 h-3 text-hextech-pink" />
                    <span>{match.sharedKillsCount} éliminations conjointes dans la partie</span>
                  </div>
                </div>
              </div>

              {/* Champions & KDA des 2 Joueurs */}
              <div className="flex items-center gap-6 text-xs border-t sm:border-t-0 sm:border-l border-slate-800/80 pt-3 sm:pt-0 sm:pl-6">
                
                {/* Joueur 1 */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 uppercase text-[11px]">
                    {match.player1.championName.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{match.player1.championName}</div>
                    <div className="text-[10px] text-slate-400">
                      {match.player1.kills}/{match.player1.deaths}/{match.player1.assists}
                    </div>
                  </div>
                </div>

                <span className="text-slate-600 font-bold">+</span>

                {/* Joueur 2 */}
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-slate-200 uppercase text-[11px]">
                    {match.player2.championName.substring(0, 2)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-200">{match.player2.championName}</div>
                    <div className="text-[10px] text-slate-400">
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
