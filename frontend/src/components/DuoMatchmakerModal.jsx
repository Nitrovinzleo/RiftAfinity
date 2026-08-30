import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, HeartOff, Sparkles, Trophy, ShieldCheck, Mail, ArrowRight, UserCheck, Flame, RefreshCw } from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';
import { translations } from '../utils/translations';

export default function DuoMatchmakerModal({ isOpen, onClose, currentUser, onOpenProfile, currentLang = 'en' }) {
  const t = translations[currentLang]?.matchmaker || translations.en.matchmaker;

  const [candidates, setCandidates] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [swiping, setSwiping] = useState(false);
  const [matchResult, setMatchResult] = useState(null); // { isMatch: true, matchedUser: {...} }

  const canvasRef = useRef(null);

  // Verrouillage du scroll d'arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
      fetchCandidates();
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setMatchResult(null);
      setCurrentIndex(0);
    }
    return () => {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Récupération des candidats depuis le backend
  const fetchCandidates = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/candidates`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const data = await res.json();
        setCandidates(data);
      }
    } catch (err) {
      console.error("Erreur de chargement des profils:", err);
    } finally {
      setIsLoading(false);
    }
  };

  // Animation de confettis en Canvas 2D
  useEffect(() => {
    if (matchResult?.isMatch && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      let animationFrameId;

      canvas.width = canvas.parentElement.clientWidth;
      canvas.height = canvas.parentElement.clientHeight;

      const particles = Array.from({ length: 60 }).map(() => ({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height - canvas.height,
        size: Math.random() * 6 + 4,
        color: ['#ff2a85', '#00f0ff', '#8a2be2', '#ffbd2e', '#00ff88'][Math.floor(Math.random() * 5)],
        speedY: Math.random() * 3 + 2,
        speedX: Math.random() * 2 - 1,
        rotation: Math.random() * 360
      }));

      const render = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        particles.forEach((p) => {
          p.y += p.speedY;
          p.x += p.speedX;
          p.rotation += 2;

          if (p.y > canvas.height) p.y = -10;

          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        });

        animationFrameId = requestAnimationFrame(render);
      };

      render();

      return () => {
        cancelAnimationFrame(animationFrameId);
      };
    }
  }, [matchResult]);

  // Action de Swiper (Liker ou Passer)
  const handleSwipe = async (liked) => {
    const currentCandidate = candidates[currentIndex];
    if (!currentCandidate || swiping) return;

    setSwiping(true);

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/swipe`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          targetUserId: currentCandidate.id,
          liked: liked
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.isMatch) {
          setMatchResult({
            isMatch: true,
            matchedUser: data.matchedUser
          });
        } else {
          setCurrentIndex((prev) => prev + 1);
        }
      } else {
        setCurrentIndex((prev) => prev + 1);
      }
    } catch (err) {
      console.error("Erreur lors du swipe:", err);
      setCurrentIndex((prev) => prev + 1);
    } finally {
      setSwiping(false);
    }
  };

  if (!isOpen) return null;

  // Si l'utilisateur n'est pas connecté
  if (!currentUser) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn px-4 py-10 sm:py-16 flex justify-center items-center">
        <div className="relative w-full max-w-md p-6 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 text-center space-y-4">
          <button onClick={onClose} className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
          <div className="w-14 h-14 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] flex items-center justify-center mx-auto border border-[#ff2a85]/40">
            <Heart className="w-7 h-7 animate-bounce" />
          </div>
          <h3 className="font-display font-black text-xl text-white">{t.mainTitle || "Trouvez votre Duo Idéal 💘"}</h3>
          <p className="text-xs text-slate-300">
            {currentLang === 'fr' ? 'Vous devez vous connecter à votre compte RiftAffinity pour pouvoir trouver votre duo et tchatter !' : 'You need to sign in to your RiftAffinity account to find a duo!'}
          </p>
        </div>
      </div>
    );
  }

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-4 py-8 sm:py-12 flex justify-center items-center">
      <div className="relative w-full max-w-lg p-5 sm:p-7 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 shadow-2xl space-y-5">
        
        {/* Header Modale */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-xl bg-gradient-to-br from-[#ff2a85] to-[#8a2be2] text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-display font-black text-base sm:text-lg text-white leading-none">
                {t.mainTitle || "Trouvez votre Duo Idéal 💘"}
              </h3>
              <span className="text-[10px] text-slate-400">
                {t.subtitle || "Parcourez les profils vérifiés et matchez pour jouer ensemble !"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* --- CAS 1 : ÉCRAN DE CELEBRATION "IT'S A MATCH !" --- */}
        {matchResult?.isMatch ? (
          <div className="relative py-6 px-4 rounded-2xl bg-gradient-to-b from-[#1a0826] via-[#090b16] to-[#0d091a] border-2 border-[#ff2a85] text-center space-y-5 overflow-hidden shadow-2xl animate-scaleUp">
            
            {/* Canvas Confettis */}
            <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none z-10" />

            <div className="relative z-20 space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85]/40 text-xs font-black animate-pulse">
                <Flame className="w-4 h-4 text-amber-400" />
                <span>{t.matchTitle || "C'EST UN MATCH !"}</span>
              </div>
              <h3 className="font-display font-black text-2xl sm:text-3xl text-white tracking-wide">
                {currentUser.displayName || currentUser.gameName} & {matchResult.matchedUser.displayName || matchResult.matchedUser.gameName}
              </h3>
              <p className="text-xs text-slate-300">
                {currentLang === 'fr' ? 'Vous avez tous les deux liké vos profils respectifs !' : 'You both liked each other\'s profiles!'}
              </p>
            </div>

            {/* Photos des 2 Duos qui matchent */}
            <div className="relative z-20 flex items-center justify-center gap-4 py-2">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shadow-lg bg-slate-900">
                <img
                  src={currentUser.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${currentUser.currentIconId || 28}.png`}
                  alt="You"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] flex items-center justify-center text-white shadow-xl animate-bounce">
                <Heart className="w-6 h-6 fill-white" />
              </div>

              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#ff2a85] shadow-lg bg-slate-900">
                <img
                  src={matchResult.matchedUser.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${matchResult.matchedUser.currentIconId || 28}.png`}
                  alt="Match User"
                  className="w-full h-full object-cover"
                />
              </div>
            </div>

            {/* Réseaux sociaux & Contact Débloqués */}
            <div className="relative z-20 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2">
              <h4 className="text-xs font-bold text-[#00f0ff] uppercase tracking-wider flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>{t.unlockedTitle || "Contact & Réseaux Débloqués :"}</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {matchResult.matchedUser.discordTag && (
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-slate-200">
                    🎮 Discord: <strong className="text-white">{matchResult.matchedUser.discordTag}</strong>
                  </div>
                )}
                {matchResult.matchedUser.instagramUsername && (
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-slate-200">
                    📷 Insta: <strong className="text-white">{matchResult.matchedUser.instagramUsername}</strong>
                  </div>
                )}
                {matchResult.matchedUser.tiktokUsername && (
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-slate-200">
                    🎵 TikTok: <strong className="text-white">{matchResult.matchedUser.tiktokUsername}</strong>
                  </div>
                )}
                {matchResult.matchedUser.twitchUsername && (
                  <div className="p-2 rounded-lg bg-slate-950/80 border border-slate-800 font-mono text-slate-200">
                    🟣 Twitch: <strong className="text-white">{matchResult.matchedUser.twitchUsername}</strong>
                  </div>
                )}
              </div>

              <div className="text-[11px] text-emerald-300 font-medium flex items-center gap-1 pt-1">
                <Mail className="w-3.5 h-3.5" />
                <span>{t.emailSent || "✉️ Un e-mail de mise en relation a été envoyé aux deux joueurs !"}</span>
              </div>
            </div>

            <button
              onClick={() => {
                setMatchResult(null);
                setCurrentIndex((prev) => prev + 1);
              }}
              className="w-full btn-pink-cyan py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>{t.continueBtn || "Continuer à chercher d'autres Duos"}</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        ) : (
          /* --- CAS 2 : PARCOURS DES CARDS DE MATCHMAKING --- */
          <>
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#00f0ff] animate-spin mx-auto" />
                <p className="text-xs text-slate-400">
                  {currentLang === 'fr' ? 'Recherche des meilleurs duos compatibles...' : 'Searching for best compatible duos...'}
                </p>
              </div>
            ) : currentIndex >= candidates.length ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-800">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-lg">{t.noMoreTitle || "Plus d'autres profils pour le moment !"}</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    {t.noMoreDesc || "Vous avez parcouru tous les joueurs disponibles. Revenez un peu plus tard !"}
                  </p>
                </div>
                <button
                  onClick={fetchCandidates}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>{t.reloadBtn || "Recharger la liste"}</span>
                </button>
              </div>
            ) : (
              /* CARTE DU CANDIDAT */
              <div className="space-y-4">
                
                <div className="relative rounded-2xl bg-[#090b16] border border-slate-800 overflow-hidden shadow-xl p-5 space-y-4">
                  
                  {/* Badge de compatibilité */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentCandidate.compatibilityScore}% {t.compatibilityBadge || "Compatibilité"}</span>
                  </div>

                  {/* Header Carte (Avatar + Nom) */}
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shrink-0 bg-slate-950 shadow-md">
                      <img
                        src={currentCandidate.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${currentCandidate.currentIconId || 28}.png`}
                        alt="Avatar Candidate"
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <h4 className="font-display font-black text-xl text-white">
                          {currentCandidate.displayName || currentCandidate.gameName}
                        </h4>
                        {/* Masquer totalement le tag si un pseudo personnalisé est configuré */}
                        {!currentCandidate.displayName && (
                          <span className="text-xs text-slate-500 font-mono">#***</span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                        <p className="text-xs text-slate-400">
                          {currentCandidate.age} {currentLang === 'fr' ? 'ans' : 'yo'} • {currentLang === 'fr' ? 'Serveur' : 'Server'} <span className="uppercase text-slate-200 font-semibold">{currentCandidate.region}</span>
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Ligne Dédiée : Badges & Tags des Langues Parlées avec Drapeaux */}
                  <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400 font-bold flex items-center gap-1">
                      <span>🗣️</span>
                      <span>{currentLang === 'fr' ? 'Langues parlées :' : 'Spoken Languages:'}</span>
                    </span>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {(currentCandidate.spokenLanguages || 'FR, EN').split(',').map((lang) => {
                        const code = lang.trim().toUpperCase();
                        const flagMap = { FR: '🇫🇷', EN: '🇬🇧', ES: '🇪🇸', KR: '🇰🇷', DE: '🇩🇪', PT: '🇵🇹' };
                        return (
                          <span key={code} className="text-xs font-black px-2 py-0.5 rounded-lg bg-slate-900 text-[#00f0ff] border border-[#00f0ff]/40 shadow-sm flex items-center gap-1">
                            <span>{flagMap[code] || '🌐'}</span>
                            <span>{code}</span>
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  {/* Badges Statistiques (Rank & Rôle) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t.rankLabel || "Rang Solo/Duo"}</span>
                      <span className="text-xs font-black text-white flex items-center justify-center gap-1.5 mt-0.5">
                        <img
                          src={getRankEmblemUrl(currentCandidate.rankTier)}
                          alt={currentCandidate.rankTier || 'Rank'}
                          className="w-5 h-5 object-contain"
                        />
                        <span>{currentCandidate.rankTier} {currentCandidate.rankDivision}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">{t.roleLabel || "Rôle & Main"}</span>
                      <span className="text-xs font-black text-[#00f0ff] block mt-0.5">
                        {currentCandidate.primaryRole} ({currentCandidate.favoriteChampion})
                      </span>
                    </div>
                  </div>

                  {/* Bio Description */}
                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800/80 text-xs text-slate-300 italic leading-relaxed">
                    "{currentCandidate.bio}"
                  </div>

                </div>

                {/* Boutons d'Action (NON vs OUI) */}
                <div className="grid grid-cols-2 gap-3 pt-1">
                  
                  {/* Bouton NON */}
                  <button
                    onClick={() => handleSwipe(false)}
                    disabled={swiping}
                    className="py-3.5 px-4 rounded-2xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 hover:text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
                  >
                    <HeartOff className="w-4 h-4 text-red-400" />
                    <span>{t.passBtn || "Passer (Non)"}</span>
                  </button>

                  {/* Bouton OUI / LIKER */}
                  <button
                    onClick={() => handleSwipe(true)}
                    disabled={swiping}
                    className="btn-pink-cyan py-3.5 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>{t.likeBtn || "Liker (Oui)"}</span>
                  </button>

                </div>

              </div>
            )}
          </>
        )}

      </div>
    </div>
  );
}
