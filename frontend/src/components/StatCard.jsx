import React from 'react';
import { Trophy, Flame, Crosshair, Award } from 'lucide-react';
import { translations } from '../utils/translations';

export default function StatCard({ duoStats, player1Summary, player2Summary, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;

  if (!duoStats) return null;

  return (
    <div className="space-y-6">
      
      {/* Entête Grille de Stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-[#ff2a85]" />
          <span>{t.statsTitle}</span>
        </h3>
        <span className="text-xs text-slate-400">
          {duoStats.totalGamesTogether} {t.gamesAnalyzed}
        </span>
      </div>

      {/* Grille des Cartes Statistiques Vibrant Rose & Cyan */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Taux de Victoire */}
        <div className="p-4 rounded-xl glass-panel-vibrant border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.winrateDuo}</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.winratePercent}%
          </div>
          <p className="text-[11px] text-slate-400">
            {duoStats.winsTogether}V - {duoStats.lossesTogether}D
          </p>
        </div>

        {/* Participation aux Kills */}
        <div className="p-4 rounded-xl glass-panel-vibrant border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.sharedKills}</span>
            <Flame className="w-4 h-4 text-[#ff2a85]" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.jointKillParticipationPercent}%
          </div>
          <p className="text-[11px] text-slate-400">
            {duoStats.sharedKillsAssistsTotal} {t.sharedElims}
          </p>
        </div>

        {/* Voie Préférée */}
        <div className="p-4 rounded-xl glass-panel-vibrant border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.favoriteLane}</span>
            <Crosshair className="w-4 h-4 text-[#00f0ff]" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.favoriteLaneCombo}
          </div>
          <p className="text-[11px] text-slate-400">
            Synergie Voies
          </p>
        </div>

        {/* Champions Préférés */}
        <div className="p-4 rounded-xl glass-panel-vibrant border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>{t.favoriteChamps}</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.topChampionDuo || "Champions variés"}
          </div>
          <p className="text-[11px] text-slate-400">
            {t.avgDuration} {duoStats.avgDurationMinutes} min
          </p>
        </div>

      </div>

      {/* Comparatif des 2 Joueurs */}
      {player1Summary && player2Summary && (
        <div className="p-5 rounded-xl glass-panel-vibrant">
          <h4 className="text-xs uppercase font-bold text-slate-400 mb-4 tracking-wider">
            {t.perfTitle}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Joueur 1 */}
            <div className="p-4 rounded-lg bg-[#090b16]/70 border border-[#ff2a85]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player1Summary.gameName}#{player1Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {player1Summary.totalKills}K / {player1Summary.totalDeaths}D / {player1Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t.kdaRatio}</span>
                <span className="font-bold text-[#ff2a85] text-base">{player1Summary.kdaRatio}</span>
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-4 rounded-lg bg-[#090b16]/70 border border-[#00f0ff]/30 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player2Summary.gameName}#{player2Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5 font-mono">
                  {player2Summary.totalKills}K / {player2Summary.totalDeaths}D / {player2Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t.kdaRatio}</span>
                <span className="font-bold text-[#00f0ff] text-base">{player2Summary.kdaRatio}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
