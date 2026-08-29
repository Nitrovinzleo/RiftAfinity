import React, { useState, useEffect } from 'react';
import { Heart, Loader2, Sparkles, Swords, Zap, CheckCircle2 } from 'lucide-react';

const STEPS = [
  { text: "Conversion des Riot IDs via ACCOUNT-V1...", duration: 2000 },
  { text: "Récupération de l'historique complet MATCH-V5...", duration: 3000 },
  { text: "Optimisation par intersection de matchs...", duration: 2500 },
  { text: "Vérification des équipes communes et duos...", duration: 2000 },
  { text: "Calcul des scores de winrate et de synergie...", duration: 2000 },
  { text: "Génération de l'archétype d'affinité...", duration: 1500 }
];

const LEAGUE_QUOTES = [
  "« On ne laisse personne derrière. » — Braum",
  "« Où tu vas, j'apporte la lumière ! » — Lux",
  "« Dans le sang et la gloire ! » — Xayah & Rakan",
  "« Protège le carry, le reste suivra. » — Anonyme de la Botlane"
];

export default function LoadingScreen() {
  const [currentStep, setCurrentStep] = useState(0);
  const [quoteIndex, setQuoteIndex] = useState(0);

  useEffect(() => {
    const stepInterval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, 2200);

    const quoteInterval = setInterval(() => {
      setQuoteIndex((prev) => (prev + 1) % LEAGUE_QUOTES.length);
    }, 4000);

    return () => {
      clearInterval(stepInterval);
      clearInterval(quoteInterval);
    };
  }, []);

  const progressPct = Math.round(((currentStep + 1) / STEPS.length) * 100);

  return (
    <div className="w-full max-w-xl mx-auto py-12 px-4 text-center">
      <div className="glass-panel rounded-3xl p-8 sm:p-12 relative overflow-hidden shadow-love-glow">
        
        {/* Cercles luminescents animés */}
        <div className="relative mx-auto w-28 h-28 mb-8 flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-r from-hextech-pink via-purple-600 to-hextech-cyan animate-spin-slow opacity-80 blur-sm"></div>
          <div className="w-24 h-24 bg-[#090a12] rounded-full flex items-center justify-center relative z-10 border border-hextech-pink/40 shadow-inner">
            <Heart className="w-12 h-12 text-hextech-pink fill-hextech-pink/30 animate-pulse" />
          </div>
        </div>

        {/* Titre */}
        <h3 className="font-display font-bold text-2xl text-white mb-2 tracking-wide">
          Analyse de Votre Compatibilité...
        </h3>
        <p className="text-xs text-hextech-cyan font-mono mb-6 animate-pulse">
          {STEPS[currentStep].text}
        </p>

        {/* Barre de progression */}
        <div className="w-full h-3 bg-slate-900 rounded-full overflow-hidden border border-slate-800 p-0.5 mb-8">
          <div 
            className="h-full bg-gradient-to-r from-hextech-pink via-purple-500 to-hextech-cyan rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progressPct}%` }}
          ></div>
        </div>

        {/* Étapes enregistrées */}
        <div className="space-y-2 text-left max-w-md mx-auto text-xs border-t border-slate-800/80 pt-6">
          {STEPS.map((step, idx) => (
            <div 
              key={idx} 
              className={`flex items-center gap-3 transition-colors duration-300 ${
                idx <= currentStep ? 'text-slate-200 font-medium' : 'text-slate-600'
              }`}
            >
              {idx < currentStep ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              ) : idx === currentStep ? (
                <Loader2 className="w-4 h-4 text-hextech-gold animate-spin shrink-0" />
              ) : (
                <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0"></div>
              )}
              <span>{step.text}</span>
            </div>
          ))}
        </div>

        {/* Citation aléatoire */}
        <div className="mt-8 pt-4 border-t border-slate-800/40 text-[11px] text-slate-400 italic">
          {LEAGUE_QUOTES[quoteIndex]}
        </div>

      </div>
    </div>
  );
}
