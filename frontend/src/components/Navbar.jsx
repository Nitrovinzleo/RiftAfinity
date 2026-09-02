import React from 'react';
import { User, CheckCircle, LogIn, Heart, BarChart3, Sparkles } from 'lucide-react';
import Logo from './Logo';
import { FrenchFlag, UKFlag } from './FlagIcons';
import { translations } from '../utils/translations';

export default function Navbar({ 
  onReset, 
  activeTab = 'form',
  onSelectTab,
  currentLang, 
  onToggleLang, 
  currentUser, 
  matchCount = 0, 
  onOpenAuth, 
  onOpenProfile, 
  onOpenMatchmaker, 
  onOpenMyMatches 
}) {
  const t = translations[currentLang]?.navbar || translations.fr.navbar;

  return (
    <header className="w-full border-b border-slate-800/80 bg-[#090a12]/85 backdrop-blur-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
        
        {/* Logo & Main Brand Title */}
        <div 
          onClick={() => {
            onReset();
            if (onSelectTab) onSelectTab('form');
          }}
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

        {/* Boutons d'Action Nav */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          
          {/* Bouton Onglet Stats & Community */}
          {onSelectTab && (
            <button
              onClick={() => onSelectTab(activeTab === 'stats' ? 'form' : 'stats')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl text-xs font-extrabold transition-all border ${
                activeTab === 'stats'
                  ? 'bg-gradient-to-r from-[#ff2a85]/20 to-[#00f0ff]/20 border-[#00f0ff] text-white shadow-lg shadow-[#00f0ff]/20'
                  : 'bg-slate-900/90 border-slate-800 hover:border-[#ff2a85]/50 text-slate-300 hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-[#00f0ff]" />
              <span className="hidden xs:inline">{currentLang === 'fr' ? 'Stats & Offres 🔥' : 'Stats & Features 🔥'}</span>
            </button>
          )}

          {/* Bouton Matchmaking Duo */}
          <button
            onClick={onOpenMatchmaker}
            className="flex items-center gap-1 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] hover:from-[#ff2a85] hover:to-[#00f0ff] text-white transition-all text-xs font-bold shadow-lg shadow-[#ff2a85]/20 animate-pulse hover:animate-none"
          >
            <span>💘</span>
            <span className="hidden xs:inline">{t.findDuo || 'Trouver un Duo'}</span>
          </button>

          {/* Bouton Mes Matchs (si connecté) */}
          {currentUser && (
            <button
              onClick={onOpenMyMatches}
              className="flex items-center gap-1.5 px-2.5 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900 border border-[#ff2a85]/40 hover:border-[#ff2a85] text-slate-200 hover:text-white transition-all text-xs font-bold shadow-md relative"
              title="Mes Matchs & Notifications"
            >
              <Heart className="w-4 h-4 text-[#ff2a85] fill-[#ff2a85]" />
              <span className="hidden xs:inline">{currentLang === 'fr' ? 'Mes Matchs' : 'My Matches'}</span>
              {matchCount > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-[#ff2a85] text-white text-[10px] font-black animate-bounce shadow-lg border border-white/20">
                  {matchCount}
                </span>
              )}
            </button>
          )}


          {/* Bouton Authentification / Profil */}
          {currentUser ? (
            <button
              onClick={onOpenProfile}
              className="flex items-center gap-1.5 p-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-slate-900/90 border border-[#ff2a85]/40 hover:border-[#ff2a85] text-slate-100 hover:text-white transition-all text-xs font-semibold shadow-md"
              title={currentUser.displayName || currentUser.gameName}
            >
              <div className="w-6 h-6 sm:w-5 sm:h-5 rounded-full overflow-hidden border border-[#ff2a85] shrink-0 bg-slate-800">
                <img 
                  src={currentUser.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${currentUser.currentIconId || currentUser.targetIconId || 28}.png`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${currentUser.currentIconId || currentUser.targetIconId || 28}.png`;
                  }}
                />
              </div>
              <span className="max-w-[70px] sm:max-w-[120px] truncate">{currentUser.displayName || currentUser.gameName}</span>
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
              <span>Se Connecter</span>
            </button>
          )}


          {/* Bouton de langue DESKTOP uniquement (à droite dans la Navbar) */}
          <button
            onClick={onToggleLang}
            className="hidden sm:flex p-1 rounded-full border border-slate-700/80 hover:border-[#ff2a85] hover:scale-110 active:scale-95 transition-all shadow-md bg-slate-900 items-center justify-center"
            title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
          >
            {currentLang === 'fr' ? (
              <FrenchFlag className="w-7 h-7" />
            ) : (
              <UKFlag className="w-7 h-7" />
            )}
          </button>

        </div>

      </div>

      {/* Bouton de langue MOBILE uniquement : Positionné à GAUCHE en dessous de la Navbar */}
      <div className="sm:hidden border-t border-slate-800/50 bg-[#06070e]/90 px-3 py-1 flex items-center justify-start">
        <button
          onClick={onToggleLang}
          className="flex items-center gap-1 px-2.5 py-1 rounded-full border border-slate-700/80 hover:border-[#ff2a85] active:scale-95 transition-all shadow-sm bg-slate-900 text-sm font-bold text-slate-200"
          title={currentLang === 'fr' ? 'Switch to English' : 'Passer en Français'}
        >
          {currentLang === 'fr' ? (
            <span>🇫🇷</span>
          ) : (
            <span>🇬🇧</span>
          )}
        </button>
      </div>

    </header>
  );
}
