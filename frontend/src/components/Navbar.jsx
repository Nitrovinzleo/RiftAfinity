import React from 'react';
import { User, CheckCircle, LogIn } from 'lucide-react';
import Logo from './Logo';
import { FrenchFlag, UKFlag } from './FlagIcons';
import { translations } from '../utils/translations';

export default function Navbar({ onReset, currentLang, onToggleLang, currentUser, onOpenAuth, onOpenProfile, onOpenMatchmaker }) {
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

        {/* Boutons d'Action (Matchmaking + Connexion/Profil + Langue) */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* Bouton Matchmaking Duo */}
          <button
            onClick={onOpenMatchmaker}
            className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] hover:from-[#ff2a85] hover:to-[#00f0ff] text-white transition-all text-xs font-bold shadow-lg shadow-[#ff2a85]/20 animate-pulse hover:animate-none"
          >
            <span>💘</span>
            <span className="hidden xs:inline sm:inline">Trouver un Duo</span>
          </button>

          {/* Bouton Authentification / Profil */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 border border-[#ff2a85]/40 hover:border-[#ff2a85] text-slate-100 hover:text-white transition-all text-xs font-semibold shadow-md"
            >
              <div className="w-5 h-5 rounded-full overflow-hidden border border-[#ff2a85] shrink-0 bg-slate-800">
                <img 
                  src={currentUser.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${currentUser.currentIconId || currentUser.targetIconId || 28}.png`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="max-w-[90px] sm:max-w-[120px] truncate">{currentUser.gameName}</span>
              {currentUser.isVerified && (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              )}
            </button>
          ) : (
            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl btn-pink-cyan text-white transition-all text-xs font-bold shadow-md"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Se Connecter</span>
            </button>
          )}

          {/* Bouton de langue : Drapeaux SVG ronds */}
          <button
            onClick={onToggleLang}
            className="p-1 rounded-full border border-slate-700/80 hover:border-[#ff2a85] hover:scale-110 active:scale-95 transition-all shadow-md bg-slate-900 flex items-center justify-center"
            title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
          >
            {currentLang === 'fr' ? (
              <FrenchFlag className="w-6 h-6 sm:w-7 sm:h-7" />
            ) : (
              <UKFlag className="w-6 h-6 sm:w-7 sm:h-7" />
            )}
          </button>

        </div>

      </div>
    </header>
  );
}
