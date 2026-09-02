import React from 'react';
import { Heart, Bot, Sparkles, Info } from 'lucide-react';

export default function Footer({ onOpenDiscordGuide, onOpenAboutUs }) {
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
            <span>Bot Discord & Guide 🤖</span>
            <Sparkles className="w-3.5 h-3.5 text-pink-400" />
          </button>

          <button
            onClick={onOpenAboutUs}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 hover:border-[#ff2a85] text-slate-300 hover:text-white font-bold text-xs shadow-md transition-all active:scale-95 group"
          >
            <Info className="w-4 h-4 text-[#ff2a85] group-hover:scale-110 transition-transform" />
            <span>À Propos de RiftAffinity ✨</span>
          </button>
        </div>

        <div className="flex items-center justify-center gap-2 text-slate-400">
          <span>Développé avec</span>
          <Heart className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]" />
          <span>pour la communauté League of Legends</span>
        </div>

        <p className="max-w-2xl mx-auto text-slate-500 leading-relaxed">
          RiftAffinity n'est pas approuvé par Riot Games et ne reflète pas les vues ou opinions de Riot Games ou de toute personne officiellement impliquée dans la production ou la gestion des propriétés de League of Legends.
        </p>

        <p className="text-slate-600">
          © {new Date().getFullYear()} RiftAffinity. Propulsé par FastAPI, React et l'API Développeur Riot Games.
        </p>
      </div>
    </footer>
  );
}
