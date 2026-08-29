import React from 'react';
import { Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full border-t border-slate-800/60 bg-[#06070d] py-8 mt-20 text-slate-500 text-xs">
      <div className="max-w-7xl mx-auto px-4 text-center space-y-3">
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
