import React from 'react';
import { Trophy, Flame, Crosshair, Award } from 'lucide-react';
import { translations } from '../utils/translations';
import { getChampionIconUrl } from '../utils/helpers';

export default function StatCard({ duoStats, player1Summary, player2Summary, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;

  if (!duoStats) return null;

  return (
    <div className="space-y-6">
      
      {/* Entête Grille de Stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff6036]" />
          <span>{t.statsTitle}</span>
        </h3>
        <span className="text-xs text-slate-400">
          {duoStats.totalGamesTogether} {t.gamesAnalyzed}
        </span>
      </div>

      {/* Grille des Cartes Statistiques Tinder Style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Taux de Victoire */}
        <div className="p-4 rounded-2xl tinder-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.winrateDuo}</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.winratePercent}%
          </div>
          <p className="text-[11px] text-slate-500">
            {duoStats.winsTogether}W - {duoStats.lossesTogether}L
          </p>
        </div>

        {/* Participation aux Kills */}
        <div className="p-4 rounded-2xl tinder-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.sharedKills}</span>
            <Flame className="w-4 h-4 text-[#fd267d]" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.jointKillParticipationPercent}%
          </div>
          <p className="text-[11px] text-slate-500">
            {duoStats.sharedKillsAssistsTotal} {t.sharedElims}
          </p>
        </div>

        {/* Voie Préférée */}
        <div className="p-4 rounded-2xl tinder-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.favoriteLane}</span>
            <Crosshair className="w-4 h-4 text-[#ff6036]" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.favoriteLaneCombo}
          </div>
          <p className="text-[11px] text-slate-500">
            Lane Synergy
          </p>
        </div>

        {/* Champions Préférés */}
        <div className="p-4 rounded-2xl tinder-card border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.favoriteChamps}</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.topChampionDuo || "Varied Champions"}
          </div>
          <p className="text-[11px] text-slate-500">
            {t.avgDuration} {duoStats.avgDurationMinutes} min
          </p>
        </div>

      </div>

      {/* Comparatif des 2 Joueurs */}
      {player1Summary && player2Summary && (
        <div className="p-5 rounded-2xl tinder-card border border-slate-800/80">
          <h4 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider">
            {t.perfTitle}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Joueur 1 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player1Summary.gameName}#{player1Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {player1Summary.totalKills}K / {player1Summary.totalDeaths}D / {player1Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">{t.kdaRatio}</span>
                <span className="font-bold text-[#fd267d] text-base">{player1Summary.kdaRatio}</span>
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player2Summary.gameName}#{player2Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {player2Summary.totalKills}K / {player2Summary.totalDeaths}D / {player2Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">{t.kdaRatio}</span>
                <span className="font-bold text-[#ff6036] text-base">{player2Summary.kdaRatio}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
