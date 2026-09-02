import React, { useState, useEffect } from 'react';
import { 
  X, Heart, Sparkles, Flame, ShieldCheck, RefreshCw, Copy, Check, ExternalLink, 
  Trash2, MessageSquare, Send, UserX, AlertTriangle
} from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';
import { translations } from '../utils/translations';

export default function MyMatchesModal({ isOpen, onClose, currentUser, currentLang = 'fr' }) {
  const [matches, setMatches] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copiedKey, setCopiedKey] = useState('');
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [unmatchingId, setUnmatchingId] = useState(null);

  const t = translations[currentLang]?.matchmaker || translations.fr.matchmaker;

  useEffect(() => {
    if (isOpen && currentUser) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      fetchMatches();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setActiveChatId(null);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen, currentUser]);

  const fetchMatches = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatches(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement de la liste des matchs:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(''), 2000);
  };

  // --- MESSAGERIE DIRECTE DUO ---
  const handleToggleChat = async (partnerId) => {
    if (activeChatId === partnerId) {
      setActiveChatId(null);
      setMessages([]);
      return;
    }
    setActiveChatId(partnerId);
    await fetchMessages(partnerId);
  };

  const fetchMessages = async (partnerId) => {
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/matches/${partnerId}/messages`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des messages:', err);
    }
  };

  const handleSendMessage = async (partnerId) => {
    if (!inputMessage.trim() || isSending) return;
    setIsSending(true);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/matches/${partnerId}/messages`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ content: inputMessage.trim() })
      });
      if (res.ok) {
        setInputMessage('');
        await fetchMessages(partnerId);
      }
    } catch (err) {
      console.error('Erreur lors de l’envoi du message:', err);
    } finally {
      setIsSending(false);
    }
  };

  // --- SUPPRESSION D'UN MATCH (UNMATCH) ---
  const handleUnmatch = async (partnerId, partnerName) => {
    const confirmMsg = currentLang === 'fr'
      ? `Voulez-vous vraiment supprimer le match avec ${partnerName} ? Le profil retournera dans les duos disponibles.`
      : `Are you sure you want to unmatch ${partnerName}? They will return to available duos.`;
    
    if (!window.confirm(confirmMsg)) return;

    setUnmatchingId(partnerId);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/matches/${partnerId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMatches(prev => prev.filter(m => m.id !== partnerId));
        if (activeChatId === partnerId) {
          setActiveChatId(null);
        }
      }
    } catch (err) {
      console.error('Erreur lors de la suppression du match:', err);
    } finally {
      setUnmatchingId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-4 py-8 sm:py-12 flex justify-center items-start">
      <div className="relative w-full max-w-2xl p-5 sm:p-7 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 shadow-2xl space-y-5 my-auto">
        
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-br from-[#ff2a85] to-[#8a2be2] text-white shadow-md">
              <Heart className="w-5 h-5 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-black text-lg sm:text-xl text-white leading-none">
                  {currentLang === 'fr' ? 'Mes Matchs & Chat Duo 💖' : 'My Matches & Duo Chat 💖'}
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85]/40 text-xs font-black">
                  {matches.length}
                </span>
              </div>
              <span className="text-[11px] text-slate-400">
                {currentLang === 'fr' ? 'Retrouvez vos duos matchés, discutez en direct et gérez vos contacts !' : 'View your matched duos, chat live, and manage contacts!'}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={fetchMatches}
              disabled={isLoading}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        {isLoading ? (
          <div className="py-16 text-center space-y-3">
            <RefreshCw className="w-8 h-8 text-[#00f0ff] animate-spin mx-auto" />
            <p className="text-xs text-slate-400">
              {currentLang === 'fr' ? 'Chargement de vos matchs...' : 'Loading your matches...'}
            </p>
          </div>
        ) : matches.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[#ff2a85]/10 text-[#ff2a85] flex items-center justify-center mx-auto border border-[#ff2a85]/30">
              <Heart className="w-8 h-8 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h4 className="font-bold text-white text-lg">
                {currentLang === 'fr' ? 'Aucun match pour le moment !' : 'No matches yet!'}
              </h4>
              <p className="text-xs text-slate-400 max-w-xs mx-auto">
                {currentLang === 'fr'
                  ? 'Continuez à parcourir et liker les profils sur "Trouver un Duo". Lorsqu\'un joueur vous like en retour, il apparaîtra ici !'
                  : 'Keep swiping on "Find a Duo". When another player likes you back, they will appear here!'}
              </p>
            </div>
          </div>
        ) : (
          <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {matches.map((cand) => (
              <div key={cand.id} className="relative rounded-2xl bg-[#090b16] border border-slate-800 p-4 space-y-3 shadow-lg hover:border-[#ff2a85]/50 transition-all">
                
                {/* Score badge & Bouton Supprimer le match */}
                <div className="absolute top-4 right-4 flex items-center gap-2">
                  <div className="px-2.5 py-0.5 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white font-extrabold text-[11px] shadow-md flex items-center gap-1">
                    <Flame className="w-3 h-3 text-amber-300" />
                    <span>{cand.compatibilityScore}%</span>
                  </div>

                  {/* Bouton Supprimer le match */}
                  <button
                    onClick={() => handleUnmatch(cand.id, cand.displayName || cand.gameName)}
                    disabled={unmatchingId === cand.id}
                    className="p-1.5 rounded-lg bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-400 hover:text-red-200 transition-colors shadow-sm"
                    title={currentLang === 'fr' ? 'Supprimer ce match' : 'Unmatch player'}
                  >
                    <UserX className={`w-3.5 h-3.5 ${unmatchingId === cand.id ? 'animate-spin' : ''}`} />
                  </button>
                </div>

                {/* Candidate header */}
                <div className="flex items-center gap-3">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shrink-0 bg-slate-950 shadow-md">
                    <img
                      src={cand.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${cand.currentIconId || 28}.jpg`}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${cand.currentIconId || 28}.jpg`;
                      }}
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="font-display font-black text-lg text-white">
                        {cand.displayName || cand.gameName}
                      </h4>
                      {!cand.displayName && (
                        <span className="text-xs text-slate-400 font-mono">#{cand.tagLine}</span>
                      )}
                    </div>

                    <p className="text-xs text-slate-400">
                      {cand.age} {currentLang === 'fr' ? 'ans' : 'yo'} • Serveur <span className="uppercase text-slate-200 font-semibold">{cand.region}</span>
                    </p>

                    {/* Badges Automatiques (💎 High Elo, 🥇 Climber Duo...) */}
                    {cand.badges && cand.badges.length > 0 && (
                      <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
                        {cand.badges.map((b) => (
                          <span key={b.id} className="px-2 py-0.5 rounded-full bg-slate-950 border border-slate-700/80 text-[10px] font-black text-amber-300 shadow-sm">
                            {b.label}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats & Rank Badges */}
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 flex items-center gap-2">
                    <img
                      src={getRankEmblemUrl(cand.rankTier)}
                      alt={cand.rankTier || 'Rank'}
                      className="w-5 h-5 object-contain"
                    />
                    <span className="font-bold text-white text-[11px]">
                      {cand.rankTier || 'UNRANKED'} {cand.rankDivision || ''}
                    </span>
                  </div>

                  <div className="p-2 rounded-xl bg-slate-950 border border-slate-800 font-semibold text-[#00f0ff] text-[11px] truncate">
                    ⚔️ {cand.primaryRole || 'MID'} ({cand.favoriteChampion || 'LoL'})
                  </div>
                </div>

                {/* Bio si présente */}
                {cand.bio && (
                  <p className="text-xs text-slate-300 italic bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                    "{cand.bio}"
                  </p>
                )}

                {/* Contacts & Réseaux Sociaux Débloqués */}
                <div className="p-3 rounded-xl bg-slate-900 border border-[#00f0ff]/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <h5 className="text-[11px] font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>{currentLang === 'fr' ? 'Contacts Débloqués :' : 'Unlocked Contacts:'}</span>
                    </h5>

                    {/* Bouton Chat Direct */}
                    <button
                      onClick={() => handleToggleChat(cand.id)}
                      className="px-2.5 py-1 rounded-lg bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white text-xs font-bold flex items-center gap-1.5 shadow-md active:scale-95 transition-transform"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>{activeChatId === cand.id ? (currentLang === 'fr' ? 'Fermer Chat' : 'Close Chat') : (currentLang === 'fr' ? 'Chat Direct 💬' : 'Direct Chat 💬')}</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {/* Riot ID (LoL) - Toujours affiché & copiable */}
                    <div className="p-2.5 rounded-lg bg-slate-950 border border-[#00f0ff]/40 flex items-center justify-between font-mono text-xs col-span-1 sm:col-span-2 shadow-sm">
                      <span className="truncate text-slate-300">
                        ⚔️ Riot ID LoL : <strong className="text-[#00f0ff] font-bold">{cand.gameName}#{cand.tagLine}</strong>
                      </span>
                      <button
                        onClick={() => handleCopy(`${cand.gameName}#${cand.tagLine}`, `riot-${cand.id}`)}
                        className="px-2.5 py-1 rounded-lg bg-[#00f0ff]/10 hover:bg-[#00f0ff]/20 text-[#00f0ff] text-[11px] font-bold transition-colors flex items-center gap-1 shrink-0 border border-[#00f0ff]/30"
                      >
                        {copiedKey === `riot-${cand.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === `riot-${cand.id}` ? (currentLang === 'fr' ? 'Copié !' : 'Copied!') : (currentLang === 'fr' ? 'Copier' : 'Copy')}</span>
                      </button>
                    </div>

                    {cand.discordTag && (
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                        <span className="truncate text-slate-300">🎮 <strong className="text-white">{cand.discordTag}</strong></span>
                        <button
                          onClick={() => handleCopy(cand.discordTag, `discord-${cand.id}`)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedKey === `discord-${cand.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}

                    {cand.instagramUsername && (
                      <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 flex items-center justify-between font-mono">
                        <span className="truncate text-slate-300">📷 <strong className="text-white">{cand.instagramUsername}</strong></span>
                        <button
                          onClick={() => handleCopy(cand.instagramUsername, `insta-${cand.id}`)}
                          className="p-1 text-slate-400 hover:text-white transition-colors"
                        >
                          {copiedKey === `insta-${cand.id}` ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* --- MODULE CHAT DIRECT ENTRE MATCHS --- */}
                {activeChatId === cand.id && (
                  <div className="p-3 rounded-2xl bg-slate-950 border border-[#ff2a85]/40 space-y-3 animate-fadeIn">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 rounded-full overflow-hidden border border-[#00f0ff] shrink-0 bg-slate-950 shadow-sm">
                          <img
                            src={cand.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${cand.currentIconId || 28}.jpg`}
                            alt="Avatar Header"
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <span className="text-xs font-bold text-[#ff2a85] flex items-center gap-1.5">
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>Chat Direct avec {cand.displayName || cand.gameName}</span>
                        </span>
                      </div>
                    </div>

                    {/* Zone d'affichage des messages */}
                    <div className="max-h-48 overflow-y-auto space-y-2.5 p-2 rounded-xl bg-slate-900/80 border border-slate-800/80 text-xs">
                      {messages.length === 0 ? (
                        <p className="text-center text-slate-500 py-3 italic">
                          {currentLang === 'fr' ? 'Envoyez votre premier message pour démarrer la conversation !' : 'Send your first message to start chatting!'}
                        </p>
                      ) : (
                        messages.map((m) => {
                          const isMe = m.senderId === currentUser.id;
                          const avatarUrl = isMe 
                            ? (currentUser.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${currentUser.currentIconId || 28}.jpg`)
                            : (cand.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${cand.currentIconId || 28}.jpg`);

                          return (
                            <div key={m.id} className={`flex items-end gap-2 ${isMe ? 'justify-end' : 'justify-start'}`}>
                              {!isMe && (
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#00f0ff] shrink-0 bg-slate-950 shadow-sm mb-0.5">
                                  <img 
                                    src={avatarUrl} 
                                    alt="Partner Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${cand.currentIconId || 28}.jpg`;
                                    }}
                                  />
                                </div>
                              )}

                              <div className={`max-w-[75%] p-2.5 rounded-2xl text-xs shadow-md ${
                                isMe 
                                  ? 'bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white font-medium rounded-br-none' 
                                  : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                              }`}>
                                <p>{m.content}</p>
                              </div>

                              {isMe && (
                                <div className="w-6 h-6 rounded-full overflow-hidden border border-[#ff2a85] shrink-0 bg-slate-950 shadow-sm mb-0.5">
                                  <img 
                                    src={avatarUrl} 
                                    alt="My Avatar" 
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${currentUser.currentIconId || 28}.jpg`;
                                    }}
                                  />
                                </div>
                              )}
                            </div>
                          );
                        })
                      )}
                    </div>

                    {/* Formulaire d'envoi de message */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={inputMessage}
                        onChange={(e) => setInputMessage(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage(cand.id)}
                        placeholder={currentLang === 'fr' ? 'Écrire un message...' : 'Write a message...'}
                        className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-white text-xs focus:outline-none focus:border-[#ff2a85]"
                      />
                      <button
                        onClick={() => handleSendMessage(cand.id)}
                        disabled={isSending || !inputMessage.trim()}
                        className="p-2 rounded-xl bg-[#ff2a85] hover:bg-[#ff2a85]/80 disabled:opacity-50 text-white font-bold transition-all shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                )}

              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
