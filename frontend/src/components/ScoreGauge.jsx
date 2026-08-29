import React, { useEffect, useState } from 'react';
import { Heart } from 'lucide-react';
import { translations } from '../utils/translations';

export default function ScoreGauge({ score, breakdown, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;
  const [displayScore, setDisplayScore] = useState(0);

  useEffect(() => {
    let start = 0;
    const duration = 1400;
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

  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (displayScore / 100) * circumference;

  return (
    <div className="flex flex-col items-center justify-center p-6 glass-panel-vibrant relative">
      
      <div className="relative w-48 h-48 flex items-center justify-center">
        {/* SVG Gauge Pink-Cyan Gradient */}
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
          <defs>
            <linearGradient id="pinkCyanGaugeGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#ff2a85" />
              <stop offset="50%" stopColor="#a855f7" />
              <stop offset="100%" stopColor="#00f0ff" />
            </linearGradient>
          </defs>

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
            stroke="url(#pinkCyanGaugeGrad)"
            className="fill-none transition-all duration-1000 ease-out drop-shadow-[0_0_15px_rgba(255,42,133,0.6)]"
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
          <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff2a85] mt-1 flex items-center gap-1">
            <Heart className="w-3 h-3 fill-[#ff2a85] inline" />
            <span>Score Duo</span>
          </span>
        </div>
      </div>

      {/* Détail de la répartition des points */}
      <div className="w-full grid grid-cols-2 gap-2.5 mt-6 pt-4 border-t border-slate-800/60 text-xs">
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t.winrate}</span>
          <span className="font-bold text-slate-200">{breakdown?.winrateScore ?? 0} <span className="text-slate-500 font-normal">/35 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t.synergy}</span>
          <span className="font-bold text-slate-200">{breakdown?.synergyScore ?? 0} <span className="text-slate-500 font-normal">/30 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t.roles}</span>
          <span className="font-bold text-slate-200">{breakdown?.roleScore ?? 0} <span className="text-slate-500 font-normal">/20 pts</span></span>
        </div>
        <div className="p-2.5 rounded-lg bg-slate-900/70 border border-slate-800">
          <span className="block text-[10px] text-slate-400 uppercase font-semibold">{t.volume}</span>
          <span className="font-bold text-slate-200">{breakdown?.volumeScore ?? 0} <span className="text-slate-500 font-normal">/15 pts</span></span>
        </div>
      </div>

    </div>
  );
}
