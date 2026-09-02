import React, { useEffect } from 'react';
import { X, Heart, ShieldCheck, Sparkles, Users, Trophy, Code, Globe, MessageCircle, Star } from 'lucide-react';
import Logo from './Logo';

export default function AboutUsModal({ isOpen, onClose, currentLang = 'fr' }) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-4 py-8 sm:py-12 flex justify-center items-start">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 shadow-2xl space-y-6 my-auto text-slate-100">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête Modale */}
        <div className="flex flex-col sm:flex-row items-center gap-4 border-b border-slate-800 pb-5 text-center sm:text-left">
          <Logo size="lg" className="shrink-0 animate-float" />
          <div className="space-y-1">
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-display font-black text-2xl text-white">
                {currentLang === 'fr' ? 'À Propos de RiftAffinity ✨' : 'About RiftAffinity ✨'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85]/40 text-[10px] font-black uppercase">
                LoL Matchmaking
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {currentLang === 'fr' 
                ? 'La plateforme ultime pour trouver votre Duo idéal sur League of Legends.'
                : 'The ultimate platform to find your ideal League of Legends Duo partner.'}
            </p>
          </div>
        </div>

        {/* Notre Mission */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-[#ff2a85]/10 via-[#8a2be2]/10 to-[#00f0ff]/10 border border-[#ff2a85]/30 space-y-2 shadow-lg">
          <h4 className="font-bold text-white text-sm flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]" />
            <span>{currentLang === 'fr' ? 'Notre Mission : Finie la Solo Queue Toxique !' : 'Our Mission: No More Toxic Solo Queue!'}</span>
          </h4>
          <p className="text-xs text-slate-300 leading-relaxed">
            {currentLang === 'fr'
              ? 'RiftAffinity a été conçu par des passionnés de League of Legends avec une ambition claire : permettre à chaque joueur de trouver des coéquipiers compatibles, bienveillants et motivés. Fini la frustration de la Solo Queue aléatoire, trouvez le Duo qui partage votre vision du jeu !'
              : 'RiftAffinity was crafted by League of Legends enthusiasts with a clear vision: allow every player to find compatible, friendly, and driven teammates. No more random Solo Queue frustration, find the Duo that matches your playstyle!'}
          </p>
        </div>

        {/* 3 Piliers Fondamentaux (Grille 3 colonnes) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-center sm:text-left shadow-md">
            <div className="w-8 h-8 rounded-xl bg-pink-500/10 text-pink-400 flex items-center justify-center mx-auto sm:mx-0 border border-pink-500/20">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-xs">
              {currentLang === 'fr' ? 'Profils Vérifiés' : 'Verified Profiles'}
            </h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {currentLang === 'fr'
                ? 'Données et rangs synchronisés en direct via l’API officielle Riot Games.'
                : 'Stats and ranks synced live via the official Riot Games API.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-center sm:text-left shadow-md">
            <div className="w-8 h-8 rounded-xl bg-[#00f0ff]/10 text-[#00f0ff] flex items-center justify-center mx-auto sm:mx-0 border border-[#00f0ff]/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-xs">
              {currentLang === 'fr' ? 'Algorithme Synergie' : 'Synergy Algorithm'}
            </h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {currentLang === 'fr'
                ? 'Analyse mathématique de la complémentarité des rôles et des champions.'
                : 'Mathematical analysis of role and champion complementarity.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 text-center sm:text-left shadow-md">
            <div className="w-8 h-8 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mx-auto sm:mx-0 border border-purple-500/20">
              <Users className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-white text-xs">
              {currentLang === 'fr' ? 'Communauté Active' : 'Active Community'}
            </h5>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              {currentLang === 'fr'
                ? 'Des milliers de Duos formés et connectés via notre Bot Discord.'
                : 'Thousands of Duos matched and connected via our Discord Bot.'}
            </p>
          </div>

        </div>

        {/* Section Équipe & Technologie */}
        <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
          <h4 className="font-bold text-white flex items-center gap-1.5">
            <Code className="w-4 h-4 text-[#00f0ff]" />
            <span>{currentLang === 'fr' ? 'Technologie & Engagement :' : 'Technology & Commitment:'}</span>
          </h4>
          <p className="text-slate-400 leading-relaxed">
            {currentLang === 'fr'
              ? 'Propulsé par des technologies modernes (React JS, FastAPI, PostgreSQL Neon et TailwindCSS), RiftAffinity garantit une rapidité optimale et une sécurité absolue des données. Nous nous engageons à maintenir une expérience gratuite, fluide et sans publicité intempestive.'
              : 'Powered by modern stack (React JS, FastAPI, PostgreSQL Neon & TailwindCSS), RiftAffinity ensures maximum speed and absolute data privacy. We commit to keeping a free, smooth, and ad-free experience.'}
          </p>
        </div>

        {/* Footer Modale */}
        <div className="pt-2 flex items-center justify-between border-t border-slate-800">
          <div className="flex items-center gap-1.5 text-slate-400 text-xs">
            <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
            <span>{currentLang === 'fr' ? 'Fait avec passion pour Summoner\'s Rift' : 'Made with passion for Summoner\'s Rift'}</span>
          </div>

          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 font-bold text-xs text-slate-200 transition-colors"
          >
            {currentLang === 'fr' ? 'Fermer' : 'Close'}
          </button>
        </div>

      </div>
    </div>
  );
}
