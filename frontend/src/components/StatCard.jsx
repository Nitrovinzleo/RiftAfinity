import React from 'react';
import { Trophy, Swords, Shield, Flame, Users, Clock, Crosshair, Award } from 'lucide-react';

export default function StatCard({ duoStats, player1Summary, player2Summary }) {
  if (!duoStats) return null;

  return (
    <div className="space-y-6">
      
      {/* Entête Grille de Stats */}
      <div className="flex items-center justify-between">
        <h3 className="font-display font-bold text-xl text-white flex items-center gap-2">
          <Trophy className="w-5 h-5 text-hextech-gold" />
          <span>Statistiques du Duo sur la Faille</span>
        </h3>
        <span className="text-xs text-slate-400">
          {duoStats.totalGamesTogether} partie{duoStats.totalGamesTogether > 1 ? 's' : ''} analysée{duoStats.totalGamesTogether > 1 ? 's' : ''}
        </span>
      </div>

      {/* Grille des Cartes Statistiques */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        
        {/* Taux de Victoire */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Winrate Duo</span>
            <Trophy className="w-4 h-4 text-amber-400" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.winratePercent}%
          </div>
          <p className="text-[11px] text-slate-500">
            {duoStats.winsTogether} Victoires - {duoStats.lossesTogether} Défaites
          </p>
        </div>

        {/* Participation aux Kills */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Entraide / Kills Partagés</span>
            <Flame className="w-4 h-4 text-hextech-pink" />
          </div>
          <div className="font-display font-bold text-2xl text-white">
            {duoStats.jointKillParticipationPercent}%
          </div>
          <p className="text-[11px] text-slate-500">
            {duoStats.sharedKillsAssistsTotal} éliminations conjointes
          </p>
        </div>

        {/* Voie Préférée */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Voies Duo</span>
            <Crosshair className="w-4 h-4 text-hextech-cyan" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.favoriteLaneCombo}
          </div>
          <p className="text-[11px] text-slate-500">
            Combinaison la plus jouée
          </p>
        </div>

        {/* Champions Préférés */}
        <div className="p-4 rounded-xl glass-panel border border-slate-800 space-y-1">
          <div className="flex items-center justify-between text-slate-400 text-xs">
            <span>Duo de Champions</span>
            <Award className="w-4 h-4 text-purple-400" />
          </div>
          <div className="font-sans font-bold text-sm text-slate-100 truncate">
            {duoStats.topChampionDuo || "Champions variés"}
          </div>
          <p className="text-[11px] text-slate-500">
            Durée moy. {duoStats.avgDurationMinutes} min
          </p>
        </div>

      </div>

      {/* Comparatif des 2 Joueurs */}
      {player1Summary && player2Summary && (
        <div className="p-5 rounded-xl glass-panel border border-slate-800/80">
          <h4 className="text-xs uppercase font-semibold text-slate-400 mb-4 tracking-wider">
            Performances Individuelles en Duo
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* Joueur 1 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player1Summary.gameName}#{player1Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5">
                  {player1Summary.totalKills}K / {player1Summary.totalDeaths}D / {player1Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ratio KDA</span>
                <span className="font-bold text-hextech-pink text-base">{player1Summary.kdaRatio}</span>
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-3.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center justify-between">
              <div>
                <span className="font-bold text-slate-100 text-sm">{player2Summary.gameName}#{player2Summary.tagLine}</span>
                <div className="text-xs text-slate-400 mt-0.5">
                  {player2Summary.totalKills}K / {player2Summary.totalDeaths}D / {player2Summary.totalAssists}A
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-500 block uppercase font-semibold">Ratio KDA</span>
                <span className="font-bold text-hextech-cyan text-base">{player2Summary.kdaRatio}</span>
              </div>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
