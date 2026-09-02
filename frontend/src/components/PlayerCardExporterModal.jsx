import React, { useRef, useState, useEffect } from 'react';
import { X, Download, Share2, Check, Sparkles, Heart, Trophy, ShieldCheck, Image, ExternalLink } from 'lucide-react';
import { toPng } from 'html-to-image';
import { getRankEmblemUrl } from '../utils/rankEmblems';
import Logo from './Logo';

export default function PlayerCardExporterModal({ isOpen, onClose, user, currentLang = 'fr' }) {
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [cardFormat, setCardFormat] = useState('horizontal'); // 'horizontal' | 'vertical'
  const isFr = String(currentLang).toLowerCase() === 'fr';

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

  if (!isOpen || !user) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, { 
        cacheBust: true, 
        pixelRatio: 3,
        quality: 0.95
      });
      const link = document.createElement('a');
      const filename = `RiftAffinity-${user.displayName || user.gameName}-${cardFormat}.png`;
      link.download = filename;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur lors de l\'export de la carte HD:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyShareLink = () => {
    const shareUrl = window.location.origin || 'https://rift-afinity.vercel.app/';
    navigator.clipboard.writeText(shareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const getSpokenLangsDisplay = (user) => {
    const LANG_FLAGS = {
      'FR': { code: 'FR', flagUrl: 'https://flagcdn.com/24x18/fr.png' },
      'EN': { code: 'EN', flagUrl: 'https://flagcdn.com/24x18/gb.png' },
      'ES': { code: 'ES', flagUrl: 'https://flagcdn.com/24x18/es.png' },
      'KR': { code: 'KR', flagUrl: 'https://flagcdn.com/24x18/kr.png' },
      'DE': { code: 'DE', flagUrl: 'https://flagcdn.com/24x18/de.png' },
      'PT': { code: 'PT', flagUrl: 'https://flagcdn.com/24x18/br.png' }
    };

    let rawLangs = user?.spokenLanguages;
    if (!rawLangs) return [LANG_FLAGS['FR'], LANG_FLAGS['EN']];

    if (typeof rawLangs === 'string') {
      rawLangs = rawLangs.split(',').map(s => s.trim().toUpperCase());
    }

    if (Array.isArray(rawLangs) && rawLangs.length > 0) {
      const formatted = rawLangs.map(code => LANG_FLAGS[code] || { code, flagUrl: null }).filter(Boolean);
      if (formatted.length > 0) return formatted;
    }

    return [LANG_FLAGS['FR'], LANG_FLAGS['EN']];
  };

  const avatarUrl = user.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${user.currentIconId || 28}.jpg`;
  const rankTier = (user.rankTier || 'GOLD').toUpperCase();
  const rankDiv = user.rankDivision || 'III';
  const spokenBadges = getSpokenLangsDisplay(user);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-3 sm:px-4 py-6 sm:py-10 flex justify-center items-start">
      <div className="relative w-full max-w-3xl p-5 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 shadow-2xl space-y-6 my-auto text-slate-100">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modale */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-slate-800 pb-4 text-center sm:text-left">
          <div>
            <div className="flex items-center justify-center sm:justify-start gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                {isFr ? 'Générateur de Carte "Duo Card" HD 🎴' : 'HD "Duo Card" Generator 🎴'}
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#00f0ff] text-white text-[10px] font-black uppercase shadow-md">
                {isFr ? 'Virale' : 'Viral'}
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {isFr 
                ? 'Exportez votre carte illustrée HD pour la partager sur TikTok, Twitter & Discord !'
                : 'Export your HD player card to share on TikTok, Twitter & Discord!'}
            </p>
          </div>

          {/* Sélecteur de Format (Horizontal vs Vertical Story) */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-950 border border-slate-800 shrink-0">
            <button
              onClick={() => setCardFormat('horizontal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardFormat === 'horizontal' 
                  ? 'bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Horizontal (Twitter/Discord)
            </button>
            <button
              onClick={() => setCardFormat('vertical')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                cardFormat === 'vertical' 
                  ? 'bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white shadow-md' 
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Story (TikTok/Insta)
            </button>
          </div>
        </div>

        {/* --- ZONE D'APERÇU & CANVAS DE LA CARTE GENEREE --- */}
        <div className="overflow-x-auto py-2 flex justify-center">
          <div
            ref={cardRef}
            className={`relative rounded-3xl p-6 sm:p-8 bg-gradient-to-br from-[#0a0b16] via-[#101429] to-[#1a122a] border-2 border-[#ff2a85]/50 shadow-2xl text-slate-100 flex flex-col justify-between overflow-hidden shrink-0 transition-all ${
              cardFormat === 'horizontal' ? 'w-[560px] sm:w-[620px] min-h-[340px]' : 'w-[340px] sm:w-[380px] min-h-[580px]'
            }`}
          >
            {/* Effets d'arrière-plan lumineux Hextech */}
            <div className="absolute top-0 right-0 w-72 h-72 bg-[#ff2a85]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#00f0ff]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#8a2be2]/15 rounded-full blur-3xl pointer-events-none" />

            {/* Header de la Carte */}
            <div className="relative z-10 flex items-center justify-between border-b border-slate-700/60 pb-3 mb-4 gap-2">
              <div className="flex items-center gap-2 shrink-0">
                <Logo size="sm" />
                <span className="font-display font-black text-base tracking-wider gradient-text-vibrant">
                  RiftAffinity
                </span>
              </div>

              <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85]/40 text-[9px] sm:text-[10px] font-black uppercase tracking-tight shadow-sm flex items-center gap-1 shrink-0">
                <Heart className="w-2.5 h-2.5 sm:w-3 sm:h-3 fill-[#ff2a85] shrink-0" />
                <span>{isFr ? 'Cherche son Duo' : 'Looking for Duo'}</span>
              </span>
            </div>

            {/* Body de la Carte */}
            <div className={`relative z-10 grid gap-4 items-center my-auto ${
              cardFormat === 'horizontal' ? 'grid-cols-3' : 'grid-cols-1 text-center'
            }`}>
              
              {/* Avatar + Identité */}
              <div className={`space-y-3 flex flex-col ${cardFormat === 'horizontal' ? 'items-start col-span-1' : 'items-center'}`}>
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shadow-xl bg-slate-950 shrink-0">
                  <img 
                    src={avatarUrl} 
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/90 to-transparent py-1 text-center">
                    <span className="text-[9px] font-bold text-[#00f0ff] uppercase">{user.region || 'EUW'}</span>
                  </div>
                </div>

                <div className="space-y-0.5">
                  <h4 className="font-display font-black text-xl sm:text-2xl text-white leading-tight truncate">
                    {user.displayName || user.gameName}
                  </h4>
                  {!user.displayName && (
                    <span className="text-xs text-slate-400 font-mono">#{user.tagLine}</span>
                  )}
                </div>
              </div>

              {/* Rang & Stats */}
              <div className={`space-y-3 ${cardFormat === 'horizontal' ? 'col-span-2' : ''}`}>
                
                {/* Emblem + Role Box */}
                <div className="p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-3 shadow-inner">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={getRankEmblemUrl(rankTier)} 
                      alt={rankTier} 
                      className="w-10 h-10 object-contain"
                    />
                    <div>
                      <span className="text-[10px] text-slate-400 block uppercase font-bold">
                        {isFr ? 'Rang Solo/Duo' : 'Solo/Duo Rank'}
                      </span>
                      <span className="font-display font-black text-sm text-white">
                        {rankTier} {rankDiv}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">
                      {isFr ? 'Poste & Main' : 'Role & Main'}
                    </span>
                    <span className="font-extrabold text-xs text-[#00f0ff]">
                      ⚔️ {user.primaryRole || 'MID'} ({user.favoriteChampion || 'LoL'})
                    </span>
                  </div>
                </div>

                {/* Badges Automatiques (💎 High Elo, 🥇 Climber Duo...) */}
                {user.badges && user.badges.length > 0 && (
                  <div className={`flex items-center gap-1.5 flex-wrap ${cardFormat === 'vertical' ? 'justify-center' : ''}`}>
                    {user.badges.map((b) => (
                      <span key={b.id} className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-700 text-xs font-black text-amber-300 shadow-sm">
                        {b.label}
                      </span>
                    ))}
                  </div>
                )}

                {/* Bio si présente */}
                {user.bio && (
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800/80 text-left">
                    <p className="text-[11px] sm:text-xs leading-relaxed text-slate-200 italic break-words">
                      "{user.bio}"
                    </p>
                  </div>
                )}
              </div>

            </div>

            {/* Footer de la Carte */}
            <div className="relative z-10 pt-3 border-t border-slate-700/60 flex items-center justify-between text-xs mt-4 gap-2">
              <div className="flex flex-col items-start text-xs">
                <span className="text-slate-300 font-bold flex items-center gap-1 text-[11px]">
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                  <span>{isFr ? 'Swipe-moi sur :' : 'Swipe me on:'}</span>
                </span>
                <span className="text-[#00f0ff] font-black text-xs whitespace-nowrap tracking-wide mt-0.5">
                  rift-afinity.vercel.app 💖
                </span>
              </div>
              
              {cardFormat === 'horizontal' ? (
                <div className="flex items-center gap-1.5 flex-wrap justify-end shrink-0">
                  {spokenBadges.map((langItem, idx) => (
                    <span 
                      key={idx}
                      className="text-[10px] font-black text-[#00f0ff] uppercase tracking-wider bg-slate-950/90 border border-[#00f0ff]/40 px-2 py-0.5 rounded-lg shadow-sm flex items-center gap-1.5"
                    >
                      <span>🗣️</span>
                      <span>{langItem.code}</span>
                      {langItem.flagUrl && (
                        <img 
                          src={langItem.flagUrl} 
                          alt={langItem.code} 
                          className="w-4 h-3 rounded-[2px] object-cover shadow-sm"
                          crossOrigin="anonymous"
                        />
                      )}
                    </span>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-end gap-1 shrink-0 max-w-[130px]">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                    <span>🗣️</span>
                    <span>{isFr ? 'Langues' : 'Languages'}</span>
                  </span>

                  <div className="flex items-center gap-1 flex-wrap justify-end">
                    {spokenBadges.map((langItem, idx) => (
                      <span 
                        key={idx}
                        className="text-[10px] font-black text-[#00f0ff] uppercase tracking-wider bg-slate-950/90 border border-[#00f0ff]/40 px-1.5 py-0.5 rounded-md shadow-sm flex items-center gap-1"
                      >
                        <span>{langItem.code}</span>
                        {langItem.flagUrl && (
                          <img 
                            src={langItem.flagUrl} 
                            alt={langItem.code} 
                            className="w-3.5 h-2.5 rounded-[1px] object-cover shadow-sm"
                            crossOrigin="anonymous"
                          />
                        )}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

          </div>
        </div>

        {/* --- BOUTONS D'ACTION EXPORT --- */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-slate-800">
          <button
            onClick={handleCopyShareLink}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-bold text-slate-200 transition-all flex items-center justify-center gap-2"
          >
            {copiedLink ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#00f0ff]" />}
            <span>{copiedLink ? (isFr ? 'Lien copié !' : 'Link Copied!') : (isFr ? 'Copier le Lien du Site' : 'Copy Site Link')}</span>
          </button>

          <button
            onClick={handleDownload}
            disabled={isDownloading}
            className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-[#ff2a85] via-[#8a2be2] to-[#00f0ff] hover:from-[#ff2a85] hover:to-[#00f0ff] text-xs font-black text-white shadow-lg shadow-[#ff2a85]/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-95"
          >
            <Download className="w-4 h-4 animate-bounce" />
            <span>{isDownloading ? (isFr ? 'Génération HD...' : 'Generating HD...') : (isFr ? 'Télécharger la Carte HD 📥' : 'Download HD Card 📥')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
