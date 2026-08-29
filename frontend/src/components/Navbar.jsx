import React from 'react';
import { Heart, Sparkles } from 'lucide-react';

export default function Navbar({ onDemoClick, onReset }) {
  return (
    <header className="w-full border-b border-slate-800/80 bg-[#090a12]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Main Brand Title */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          {/* Logo Officiel RiftAffinity (Carré arrondi, bordure dégradée Rose -> Cyan, Cœur Néon) */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-gradient-to-br from-[#ff2a85] via-[#a855f7] to-[#00f0ff] p-[2.5px] shadow-[0_0_20px_rgba(255,42,133,0.4)] group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#0b0813] rounded-[13px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-[#ff2a85] stroke-[2.5] drop-shadow-[0_0_8px_rgba(255,42,133,0.8)] group-hover:scale-110 transition-transform" />
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-black text-2xl tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff2a85]">
                RiftAffinity
              </h1>
              <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-[#ff2a85]/15 text-[#ff2a85] border border-[#ff2a85]/30">
                LoL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Calculateur d'affinité Invocateur
            </p>
          </div>
        </div>

        {/* Actions & Bouton Démo */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDemoClick}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-purple-950/70 to-slate-900 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all text-xs sm:text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-hextech-gold animate-pulse" />
            <span>Mode Démo</span>
          </button>
        </div>

      </div>
    </header>
  );
}
