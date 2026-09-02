import React from 'react';
import { Heart, Bot, Sparkles, Info } from 'lucide-react';
import { translations } from '../utils/translations';

export default function Footer({ onOpenDiscordGuide, onOpenAboutUs, currentLang = 'fr' }) {
  const t = translations[currentLang]?.footer || translations.fr.footer;

  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#06070d] py-8 mt-20 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-4">
        
        {/* Liens Footer : Bot Discord & À Propos */}
        <div className="flex items-center justify-center gap-3 flex-wrap">
          <button
            onClick={onOpenDiscordGuide}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-950/70 hover:bg-indigo-900 border border-indigo-500/50 text-indigo-300 hover:text-white font-bold text-xs shadow-md transition-all active:scale-95 group"
          >
            <Bot className="w-4 h-4 text-indigo-400 group-hover:rotate-12 transition-transform" />
            <span>{t.discordBotBtn}</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </button>

          <button
            onClick={onOpenAboutUs}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-[#ff2a85] text-slate-300 hover:text-white font-bold text-xs shadow-md transition-all active:scale-95 group"
          >
            <Info className="w-4 h-4 text-[#ff2a85] group-hover:scale-110 transition-transform" />
            <span>{t.aboutUsBtn}</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <span>{t.builtWith}</span>
          <Heart className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]" />
          <span>{t.forCommunity}</span>
        </div>

        <p className="max-w-2xl mx-auto text-slate-500 leading-relaxed">
          {t.disclaimer}
        </p>

        <p className="text-slate-600">
          © {new Date().getFullYear()} {t.rights}
        </p>
      </div>
    </footer>
  );
}
