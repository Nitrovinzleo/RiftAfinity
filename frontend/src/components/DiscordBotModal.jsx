import React, { useEffect } from 'react';
import { X, Bot, Sparkles, MessageSquare, ShieldCheck, Zap, ExternalLink, Copy, Check, Users, Headphones } from 'lucide-react';

export default function DiscordBotModal({ isOpen, onClose, currentLang = 'fr' }) {
  const [copiedCmd, setCopiedCmd] = React.useState('');

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

  const handleCopyCommand = (cmd) => {
    navigator.clipboard.writeText(cmd);
    setCopiedCmd(cmd);
    setTimeout(() => setCopiedCmd(''), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-4 py-8 sm:py-12 flex justify-center items-start">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-indigo-500/40 shadow-2xl space-y-6 my-auto text-slate-100">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Modale */}
        <div className="flex items-center gap-4 border-b border-slate-800 pb-4">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/30 shrink-0">
            <Bot className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-black text-xl sm:text-2xl text-white">
                RiftAffinity Discord Bot 🤖
              </h3>
              <span className="px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 text-[10px] font-black uppercase">
                Officiel
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              {currentLang === 'fr' 
                ? 'Liez votre serveur Discord et recevez vos alertes de Matchs LoL en direct !'
                : 'Connect your Discord server and receive live LoL Match alerts!'}
            </p>
          </div>
        </div>

        {/* Bouton d'Ajout Principal */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 to-purple-950/80 border border-indigo-500/40 space-y-3 shadow-xl">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="space-y-1 text-center sm:text-left">
              <h4 className="font-bold text-white text-sm sm:text-base flex items-center gap-1.5 justify-center sm:justify-start">
                <Sparkles className="w-4 h-4 text-indigo-400" />
                <span>{currentLang === 'fr' ? 'Inviter le Bot sur votre Serveur' : 'Invite the Bot to your Server'}</span>
              </h4>
              <p className="text-xs text-slate-300">
                {currentLang === 'fr'
                  ? 'Compatible avec tous les serveurs LoL & communautés d’invocateurs.'
                  : 'Compatible with all LoL servers & summoner communities.'}
              </p>
            </div>

            <a
              href="https://discord.com/oauth2/authorize?client_id=123456789&permissions=8&scope=bot%20applications.commands"
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-extrabold text-white text-xs shadow-lg shadow-indigo-500/30 flex items-center gap-2 shrink-0 active:scale-95 transition-all"
            >
              <Bot className="w-4 h-4" />
              <span>{currentLang === 'fr' ? 'Ajouter à Discord 🚀' : 'Add to Discord 🚀'}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>

        {/* Fonctionnalités Principales (Grille 2x2) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          
          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <MessageSquare className="w-4 h-4 text-pink-400" />
              <span>{currentLang === 'fr' ? 'Alertes de Match MP' : 'Direct Match Alerts'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentLang === 'fr'
                ? 'Dès qu’un joueur vous like en retour, le Bot vous envoie un message privé instantané sur Discord avec son Riot ID !'
                : 'As soon as a player likes you back, the Bot sends you an instant private message on Discord with their Riot ID!'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Zap className="w-4 h-4 text-amber-400" />
              <span>{currentLang === 'fr' ? 'Calculateur d’Affinité' : 'Affinity Calculator'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentLang === 'fr'
                ? 'Tapez la commande /affinity dans n’importe quel canal pour calculer la synergie LoL entre 2 joueurs.'
                : 'Type /affinity in any channel to compute LoL synergy between 2 summoners.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>{currentLang === 'fr' ? 'Vérification Ori Bot' : 'Ori Bot Verification'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentLang === 'fr'
                ? 'Le Bot valide l’authenticité de votre compte LoL en vérifiant votre icône d’invocateur en direct.'
                : 'The Bot verifies your LoL account authenticity by checking your summoner icon live.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 space-y-1.5 shadow-md">
            <div className="flex items-center gap-2 text-indigo-400 font-bold">
              <Headphones className="w-4 h-4 text-[#00f0ff]" />
              <span>{currentLang === 'fr' ? 'Salons Vocaux Duo' : 'Duo Voice Channels'}</span>
            </div>
            <p className="text-slate-400 leading-relaxed text-[11px]">
              {currentLang === 'fr'
                ? 'Générez des salons vocaux privés temporaires pour lancer vos parties Duo en toute tranquillité.'
                : 'Generate temporary private voice channels to start your Duo games in peace.'}
            </p>
          </div>

        </div>

        {/* Guide des Commandes Slash */}
        <div className="space-y-3 pt-1">
          <h4 className="font-bold text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-4 h-4 text-indigo-400" />
            <span>{currentLang === 'fr' ? 'Guide des Commandes Slash Discord :' : 'Discord Slash Commands Guide:'}</span>
          </h4>

          <div className="space-y-2 text-xs font-mono">
            
            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-indigo-400 font-bold">/link [token]</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {currentLang === 'fr' ? 'Lier votre compte Discord à votre profil RiftAffinity' : 'Link your Discord account to your RiftAffinity profile'}
                </p>
              </div>
              <button
                onClick={() => handleCopyCommand('/link')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 border border-slate-700"
              >
                {copiedCmd === '/link' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === '/link' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-pink-400 font-bold">/affinity [RiotID1] [RiotID2]</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {currentLang === 'fr' ? 'Calculer le score d’affinité et l’archétype de Duo' : 'Compute affinity score and Duo archetype'}
                </p>
              </div>
              <button
                onClick={() => handleCopyCommand('/affinity')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 border border-slate-700"
              >
                {copiedCmd === '/affinity' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === '/affinity' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[#00f0ff] font-bold">/duo</span>
                <p className="text-[11px] text-slate-400 font-sans">
                  {currentLang === 'fr' ? 'Rechercher un coéquipier Duo directement depuis Discord' : 'Find a Duo teammate directly from Discord'}
                </p>
              </div>
              <button
                onClick={() => handleCopyCommand('/duo')}
                className="px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 border border-slate-700"
              >
                {copiedCmd === '/duo' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedCmd === '/duo' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>

          </div>
        </div>

        {/* Footer Modale */}
        <div className="pt-2 flex items-center justify-end">
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
