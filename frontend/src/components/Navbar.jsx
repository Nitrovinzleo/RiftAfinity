import React from 'react';
import Logo from './Logo';

export default function Navbar({ onReset }) {
  return (
    <header className="w-full border-b border-slate-800/80 bg-[#090a12]/80 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        
        {/* Logo & Main Brand Title */}
        <div 
          onClick={onReset}
          className="flex items-center gap-3.5 cursor-pointer group"
        >
          {/* Logo Officiel RiftAffinity */}
          <Logo size="md" className="group-hover:scale-105 transition-transform" />

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

      </div>
    </header>
  );
}
