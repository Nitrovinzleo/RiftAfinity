import React from 'react';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import ScoreGauge from './ScoreGauge';
import ArchetypeCard from './ArchetypeCard';
import StatCard from './StatCard';
import MatchHistoryList from './MatchHistoryList';
import ShareableCard from './ShareableCard';
import { translations } from '../utils/translations';

export default function ResultDashboard({ result, onReset, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;

  if (!result) return null;

  const { overallScore, scoreBreakdown, archetype, duoStats, player1Summary, player2Summary, commonMatches, isDemoData } = result;

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 animate-fadeIn">
      
      {/* Barre Supérieure du Tableau de Bord */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl clean-card">
        <div className="flex items-center gap-3">
          <button
            onClick={onReset}
            className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-300 hover:text-white transition-all"
            title={t.newSearch}
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-display font-bold text-xl text-white">
                {player1Summary.gameName} & {player2Summary.gameName}
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              RiftAffinity LoL Report
            </p>
          </div>
        </div>

        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-200 font-medium text-xs border border-slate-700 transition-all"
        >
          <RefreshCw className="w-4 h-4" />
          <span>{t.newSearch}</span>
        </button>
      </div>

      {/* Rangée Principale : Jauge de Score & Archétype */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        <div className="lg:col-span-5">
          <ScoreGauge score={overallScore} breakdown={scoreBreakdown} currentLang={currentLang} />
        </div>
        <div className="lg:col-span-7">
          <ArchetypeCard archetype={archetype} currentLang={currentLang} />
        </div>
      </div>

      {/* Grille de Statistiques Duo */}
      <StatCard
        duoStats={duoStats}
        player1Summary={player1Summary}
        player2Summary={player2Summary}
        currentLang={currentLang}
      />

      {/* Liste des parties communes avec les VRAIES Icônes DataDragon */}
      <MatchHistoryList matches={commonMatches} currentLang={currentLang} />

      {/* Carte Téléchargeable d'Exportation */}
      <div className="pt-4">
        <ShareableCard result={result} currentLang={currentLang} />
      </div>

    </div>
  );
}
