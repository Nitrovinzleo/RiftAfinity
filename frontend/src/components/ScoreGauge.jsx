import React, { useEffect, useState } from 'react';
import { Heart, Trophy } from 'lucide-react';

export default function ScoreGauge({ score, breakdown }) {
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    // Animation progressive du score de 0 à score final
    let start = 0;
    const duration = 1500; // ms
    const stepTime = 20;
    const steps = duration / stepTime;
    const increment = score / steps;

    const timer = setInterval(() => {
      start += increment;
      if (start >= score) {
        setDisplayScore(score);
        clearInterval(timer);
      } else {
        setDisplayScore(Math.round(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [score]);

  // Calcul du contour du cercle SVG (Rayon = 70, Circonférence = 2 * PI * 70 = 439.82)
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  // Détermination de la couleur selon le niveau de score
  const getScoreColorClass = (val) => {
    if (val >= 85) return 'text-amber-400 stroke-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]';
    if (val >= 70) return 'text-hextech-pink stroke-hextech-pink drop-shadow-[0_0_15px_rgba(255,42,133,0.6)]';
    if (val >= 50) return 'text-hextech-cyan stroke-hextech-cyan drop-shadow-[0_0_15px_rgba(0,240,255,0.6)]';
    return 'text-indigo-400 stroke-indigo-400';
  };

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel rounded-2xl relative">
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Gauge */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          {/* Cercle d'arrière-plan */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className="stroke-slate-800/80 fill-none"
            strokeWidth="12"
          />
          {/* Cercle de progression animé */}
          <circle
            cx="80"
            cy="80"
            r={radius}
            className={`fill-none transition-all duration-1000 ease-out ${getScoreColorClass(displayScore)}`}
            strokeWidth="12"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>

        {/* Texte du score au centre */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <div className="flex items-baseline justify-center">
            <span className="font-display font-black text-5xl tracking-tight text-white">
              {displayScore}
            </span>
            <span className="text-sm font-semibold text-slate-400 font-sans">/100</span>
          </div>
          <span className="text-[11px] uppercase font-bold tracking-widest text-hextech-gold mt-1 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-hextech-gold inline" />
            <span>Score Duo</span>
          </span>
        </div>
      </div>

      {/* Détail de la répartition des points */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-6 pt-4 border-t border-slate-800/60 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Taux de Victoire</span>
          <span className="font-bold text-slate-200">{breakdown?.winrateScore ?? 0} <span className="text-slate-500 font-normal">/35 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Synergie Elimin.</span>
          <span className="font-bold text-slate-200">{breakdown?.synergyScore ?? 0} <span className="text-slate-500 font-normal">/30 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Rôles & Champions</span>
          <span className="font-bold text-slate-200">{breakdown?.roleScore ?? 0} <span className="text-slate-500 font-normal">/20 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">Volume & Exp.</span>
          <span className="font-bold text-slate-200">{breakdown?.volumeScore ?? 0} <span className="text-slate-500 font-normal">/15 pts</span></span>
        </div>
      </div>

    </div>
  );
}
