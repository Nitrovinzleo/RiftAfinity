import React from 'react';
import { Globe } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../utils/translations';

export default function Navbar({ onReset, currentLang, onToggleLang }) {
  const t = translations[currentLang]?.navbar || translations.fr.navbar;

  return (
    <header className="w-full border-b border-slate-800/80 bg-[#090a12]/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Main Brand Title */}
        <div 
          onClick={onReset}
          className="flex items-center gap-2.5 sm:gap-3.5 cursor-pointer group"
        >
          {/* Logo Officiel RiftAffinity */}
          <Logo size="sm" className="sm:hidden" />
          <Logo size="md" className="hidden sm:block group-hover:scale-105 transition-transform" />

          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <h1 className="font-display font-black text-lg sm:text-2xl tracking-wide gradient-text-vibrant">
                RiftAffinity
              </h1>
              <span className="text-[9px] sm:text-[10px] uppercase font-bold px-1.5 py-0.5 rounded-full bg-[#ff2a85]/15 text-[#ff2a85] border border-[#ff2a85]/30">
                LoL
              </span>
            </div>
            <p className="text-[10px] sm:text-xs text-slate-400 font-sans truncate">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language Switcher (FR 🇫🇷 / EN 🇬🇧) */}
        <div className="flex items-center gap-2">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg sm:rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-[#ff2a85]/50 text-slate-200 hover:text-white transition-all text-xs font-semibold"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#ff2a85]" />
            <span>{t.langSwitch}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
