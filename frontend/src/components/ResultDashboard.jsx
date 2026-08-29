import React from 'react';
import { ArrowLeft, Sparkles, RefreshCw } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import ArchetypeCard from './ArchetypeCard';
import StatCard from './StatCard';
import MatchHistoryList from './MatchHistoryList';
import ShareableCard from './ShareableCard';

export default function ResultDashboard({ result, onReset }) {
  if (!result) return null;

  const { overallScore, scoreBreakdown, archetype, duoStats, player1Summary, player2Summary, commonMatches, isDemoData } = result;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-10 animate-fadeIn">
      
      {/* Barre Supérieure du Tableau de Bord */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl glass-panel border border-slate-800">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title="Nouvelle recherche"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-white">
                {player1Summary.gameName} & {player2Summary.gameName}
              </h2>
              {isDemoData && (
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/40">
                  Mode Démo
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              Rapport complet d'affinité Invocateur
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Analyser un Autre Duo</span>
        </button>
      </div>

      {/* Rangée Principale : Jauge de Score & Archétype */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-5">
          <ScoreGauge score={overallScore} breakdown={scoreBreakdown} />
        </div>
        <div className="lg:col-span-7">
          <ArchetypeCard archetype={archetype} />
        </div>
      </div>

      {/* Grille de Statistiques Duo */}
      <StatCard
        duoStats={duoStats}
        player1Summary={player1Summary}
        player2Summary={player2Summary}
      />

      {/* Liste des parties communes */}
      <MatchHistoryList matches={commonMatches} />

      {/* Carte Téléchargeable d'Exportation */}
      <div className="pt-6">
        <ShareableCard result={result} />
      </div>

    </div>
  );
}
