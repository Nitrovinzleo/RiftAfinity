import React from 'react';
import { Globe } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../utils/translations';

export default function Navbar({ onReset, currentLang, onToggleLang }) {
  const t = translations[currentLang]?.navbar || translations.fr.navbar;

  return (
    <header className="w-full border-b border-slate-800/60 bg-[#0d0f17]/85 backdrop-blur-xl sticky top-0 z-50">
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
              <h1 className="font-display font-black text-2xl tracking-wide tinder-gradient-text">
                RiftAffinity
              </h1>
              <span className="text-[10px] uppercase font-extrabold px-2 py-0.5 rounded-full bg-[#fd267d]/15 text-[#fd267d] border border-[#fd267d]/30">
                LoL
              </span>
            </div>
            <p className="text-xs text-slate-400 font-sans">
              {t.subtitle}
            </p>
          </div>
        </div>

        {/* Language Switcher (FR 🇫🇷 / EN 🇬🇧) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleLang}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-[#fd267d]/50 text-slate-200 hover:text-white transition-all text-xs font-semibold"
            title="Switch Language"
          >
            <Globe className="w-3.5 h-3.5 text-[#fd267d]" />
            <span>{t.langSwitch}</span>
          </button>
        </div>

      </div>
    </header>
  );
}
