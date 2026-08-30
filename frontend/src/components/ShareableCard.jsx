import React, { useRef, useState } from 'react';
import { Download, Heart, Share2, Check } from 'lucide-react';
import { toPng } from 'html-to-image';
import { translations } from '../utils/translations';

export default function ShareableCard({ result, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;
  const cardRef = useRef(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!result) return null;

  const { overallScore, archetype, duoStats, player1Summary, player2Summary } = result;

  const handleDownloadImage = async () => {
    if (!cardRef.current) return;
    setIsDownloading(true);

    try {
      const dataUrl = await toPng(cardRef.current, { cacheBust: true, pixelRatio: 2 });
      const link = document.createElement('a');
      link.download = `RiftAffinity-${player1Summary.gameName}-${player2Summary.gameName}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Erreur lors du téléchargement de l\'image:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Boutons d'export */}
      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={handleCopyLink}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs font-medium text-slate-200 transition-all flex items-center gap-2"
        >
          {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4 text-[#00f0ff]" />}
          <span>{copied ? t.copiedMsg : t.copyLinkBtn}</span>
        </button>

        <button
          onClick={handleDownloadImage}
          disabled={isDownloading}
          className="px-4 py-2 rounded-xl btn-pink-cyan text-xs font-bold text-white shadow-love-glow transition-all flex items-center gap-2 disabled:opacity-50"
        >
          <Download className="w-4 h-4" />
          <span>{isDownloading ? '...' : t.shareCardBtn}</span>
        </button>
      </div>

      {/* Carte Visuelle Générée avec Logo Officiel Rose & Cyan */}
      <div
        ref={cardRef}
        className="w-full max-w-2xl mx-auto rounded-3xl p-8 bg-gradient-to-br from-[#0c0d18] via-[#12162b] to-[#1c142e] border-2 border-[#ff2a85]/40 shadow-2xl relative overflow-hidden text-slate-100"
      >
        {/* Glows d'arrière-plan Rose & Cyan */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#ff2a85]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#00f0ff]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Entête avec Logo Officiel RiftAffinity */}
        <div className="flex items-center justify-between border-b border-slate-700/60 pb-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-8 h-8 rounded-xl bg-gradient-to-br from-[#ff2a85] via-[#a855f7] to-[#00f0ff] p-[1.5px]">
              <div className="w-full h-full bg-[#0b0813] rounded-[9px] flex items-center justify-center">
                <Heart className="w-4 h-4 text-[#ff2a85] stroke-[2.5]" />
              </div>
            </div>
            <span className="font-display font-black text-lg tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-100 to-[#ff2a85]">
              RiftAffinity
            </span>
          </div>
          <span className="text-[10px] uppercase font-bold px-2.5 py-1 rounded-full bg-slate-900 border border-[#ff2a85]/30 text-[#ff2a85]">
            {t.cardTitle}
          </span>
        </div>

        {/* Bloc Central : Joueur 1 (Rose) & Joueur 2 (Bleu/Cyan) */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-center my-6 text-center">
          
          {/* Joueur 1 (Rose) */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#ff2a85] tracking-widest block">Joueur 1</span>
            <div className="font-display font-bold text-xl text-white truncate">
              {player1Summary.gameName}
            </div>
            <div className="text-xs text-slate-400 font-mono">#{player1Summary.tagLine}</div>
          </div>

          {/* Badge Score Central */}
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-slate-900/90 border border-[#ff2a85]/40 shadow-[0_0_20px_rgba(255,42,133,0.3)]">
            <span className="text-xs uppercase font-bold text-[#00f0ff] tracking-widest mb-1">{t.cardScoreLabel}</span>
            <div className="font-display font-black text-5xl text-white tracking-tight">
              {overallScore}<span className="text-sm font-sans text-slate-400">/100</span>
            </div>
          </div>

          {/* Joueur 2 (Bleu / Cyan) */}
          <div className="space-y-1">
            <span className="text-[10px] uppercase font-bold text-[#00f0ff] tracking-widest block">Joueur 2</span>
            <div className="font-display font-bold text-xl text-white truncate">
              {player2Summary.gameName}
            </div>
            <div className="text-xs text-slate-400 font-mono">#{player2Summary.tagLine}</div>
          </div>

        </div>

        {/* Archétype d'Affinité */}
        <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700/80 my-4 text-center">
          <div className="text-[10px] uppercase font-bold tracking-widest text-[#00f0ff] mb-0.5">
            {t.cardArchetypeLabel}
          </div>
          <div className="font-display font-bold text-lg text-white">
            {archetype.title}
          </div>
          <div className="text-xs text-[#ff2a85] font-medium mt-0.5">
            {archetype.subtitle}
          </div>
        </div>

        {/* Pied de Carte & Stat Clefs */}
        <div className="grid grid-cols-3 gap-2 pt-4 border-t border-slate-700/60 text-center text-xs">
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Winrate Duo</span>
            <span className="font-bold text-white">{duoStats.winratePercent}%</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Parties Ensemble</span>
            <span className="font-bold text-white">{duoStats.totalGamesTogether}</span>
          </div>
          <div>
            <span className="block text-[10px] text-slate-400 uppercase">Entraide Kills</span>
            <span className="font-bold text-white">{duoStats.jointKillParticipationPercent}%</span>
          </div>
        </div>

      </div>
    </div>
  );
}
