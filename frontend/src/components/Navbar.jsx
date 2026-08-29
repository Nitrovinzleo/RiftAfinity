import React from 'react';
import { Heart, Sparkles, Gamepad2 } from 'lucide-react';

export default function Navbar({ onDemoClick, onReset }) {
  return (
    <header className="w-full border-b border-slate-800/80 bg-[#090a12]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Title */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-hextech-pink via-purple-600 to-hextech-cyan p-0.5 shadow-love-glow group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#090a12] rounded-[10px] flex items-center justify-center">
              <Heart className="w-6 h-6 text-hextech-pink fill-hextech-pink/20 group-hover:scale-110 transition-transform" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display font-bold text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-hextech-gold to-hextech-pink">
                DuoSync
              </h1>
              <span className="text-[10px] uppercase font-semibold px-2 py-0.5 rounded-full bg-hextech-pink/20 text-hextech-pink border border-hextech-pink/30">
                RiftAffinity
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              Calculateur d'affinité League of Legends
            </p>
          </div>
        </div>

        {/* Actions & Demo Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={onDemoClick}
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-purple-950/60 to-slate-900 border border-purple-500/40 text-purple-200 hover:text-white hover:border-purple-400 hover:shadow-lg hover:shadow-purple-500/20 transition-all text-xs sm:text-sm font-medium"
          >
            <Sparkles className="w-4 h-4 text-hextech-gold animate-pulse" />
            <span>Mode Démo</span>
          </button>
        </div>
      </div>
    </header>
  );
}
