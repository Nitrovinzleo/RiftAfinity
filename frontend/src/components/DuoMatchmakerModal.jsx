import React, { useState, useEffect, useRef } from 'react';
import { X, Heart, HeartOff, Sparkles, Trophy, ShieldCheck, Mail, ArrowRight, UserCheck, Flame, RefreshCw } from 'lucide-react';

export default function DuoMatchmakerModal({ isOpen, onClose, currentUser, onOpenProfile }) {
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

  // Animation de confettis en canvas HTML5
  const triggerConfetti = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const particles = [];
    const colors = ['#ff2a85', '#00f0ff', '#ffd700', '#00ff88', '#ffffff', '#b537f2'];

    for (let i = 0; i < 120; i++) {
      particles.push({
        x: canvas.width / 2,
        y: canvas.height / 2,
        vx: (Math.random() - 0.5) * 18,
        vy: (Math.random() - 0.5) * 18 - 4,
        size: Math.random() * 8 + 4,
        color: colors[Math.floor(Math.random() * colors.length)],
        rotation: Math.random() * 360,
        rSpeed: (Math.random() - 0.5) * 10,
        opacity: 1
      });
    }

    let animationFrame;
    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      let alive = false;

      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.25; // Gravité
        p.rotation += p.rSpeed;
        p.opacity -= 0.008;

        if (p.opacity > 0) {
          alive = true;
          ctx.save();
          ctx.translate(p.x, p.y);
          ctx.rotate((p.rotation * Math.PI) / 180);
          ctx.globalAlpha = Math.max(0, p.opacity);
          ctx.fillStyle = p.color;
          ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
          ctx.restore();
        }
      });

      if (alive) {
        animationFrame = requestAnimationFrame(render);
      }
    };

    render();
  };

  // Traitement du Swipe (Oui / Non)
  const handleSwipe = async (liked) => {
    if (swiping || currentIndex >= candidates.length) return;
    setSwiping(true);

    const candidate = candidates[currentIndex];

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
          targetId: candidate.id,
          liked: liked
        })
      });

      const data = await res.json();

      if (liked && data.isMatch) {
        setMatchResult(data);
        setTimeout(() => triggerConfetti(), 100);
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

  const currentCandidate = candidates[currentIndex];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md animate-fadeIn px-4 py-8 sm:py-12 flex justify-center items-start">
      
      {/* Canvas pour animation confettis */}
      <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-50" />

      <div className="relative w-full max-w-lg my-auto p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/50 shadow-2xl space-y-5 overflow-hidden">
        
        {/* Bouton de Fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors z-10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff2a85]/15 border border-[#ff2a85]/40 text-[#ff2a85] text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Matchmaking Duo LoL</span>
          </div>
          <h3 className="font-display font-black text-2xl text-white">
            Trouvez votre Duo Idéal 💘
          </h3>
          <p className="text-xs text-slate-400">
            Parcourez les profils vérifiés et matchez pour jouer ensemble !
          </p>
        </div>

        {/* --- CAS 1 : C'EST UN MATCH 🎉 --- */}
        {matchResult ? (
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#1c0826] to-[#080912] border-2 border-[#ff2a85] text-center space-y-5 animate-scaleUp">
            
            <div className="w-20 h-20 mx-auto rounded-full bg-[#ff2a85]/20 border-2 border-[#ff2a85] flex items-center justify-center text-4xl shadow-xl animate-bounce">
              💖
            </div>

            <div className="space-y-1">
              <h2 className="font-display font-black text-3xl text-transparent bg-clip-text bg-gradient-to-r from-[#ff2a85] via-amber-300 to-[#00f0ff]">
                C'EST UN MATCH !
              </h2>
              <p className="text-xs text-slate-300">
                Vous et <strong className="text-white font-bold">{matchResult.matchedUser.gameName}</strong> avez tous les deux liké vos profils !
              </p>
            </div>

            {/* Carte des coordonnées débloquées */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-left space-y-2.5">
              <div className="text-xs font-bold text-amber-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Identifiants & Contact Débloqués :</span>
              </div>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">Riot ID :</span>
                  <span className="font-mono font-bold text-[#00f0ff]">{matchResult.matchedUser.gameName}#{matchResult.matchedUser.tagLine}</span>
                </div>
                <div className="flex items-center justify-between p-2 rounded-lg bg-slate-950 border border-slate-800">
                  <span className="text-slate-400">E-mail :</span>
                  <span className="font-mono font-semibold text-slate-200">{matchResult.matchedUser.email}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
                <Mail className="w-4 h-4 shrink-0 text-emerald-400" />
                <span>✉️ Un e-mail de mise en relation a été envoyé aux deux joueurs !</span>
              </div>
            </div>

            <button
              onClick={() => {
                setMatchResult(null);
                setCurrentIndex((prev) => prev + 1);
              }}
              className="w-full btn-pink-cyan py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2"
            >
              <span>Continuer à chercher d'autres Duos</span>
              <ArrowRight className="w-4 h-4" />
            </button>

          </div>
        ) : (
          /* --- CAS 2 : PARCOURS DES CARDS DE MATCHMAKING --- */
          <>
            {isLoading ? (
              <div className="py-16 text-center space-y-3">
                <RefreshCw className="w-8 h-8 text-[#00f0ff] animate-spin mx-auto" />
                <p className="text-xs text-slate-400">Recherche des meilleurs duos compatibles...</p>
              </div>
            ) : currentIndex >= candidates.length ? (
              <div className="py-12 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 text-slate-400 flex items-center justify-center mx-auto border border-slate-800">
                  <UserCheck className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-bold text-white text-lg">Plus d'autres profils pour le moment !</h4>
                  <p className="text-xs text-slate-400 max-w-xs mx-auto">
                    Vous avez parcouru tous les joueurs disponibles. Revenez un peu plus tard !
                  </p>
                </div>
                <button
                  onClick={fetchCandidates}
                  className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition-all inline-flex items-center gap-2"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Recharger la liste</span>
                </button>
              </div>
            ) : (
              /* CARTE DU CANDIDAT */
              <div className="space-y-4">
                
                <div className="relative rounded-2xl bg-[#090b16] border border-slate-800 overflow-hidden shadow-xl p-5 space-y-4">
                  
                  {/* Badge de compatibilité */}
                  <div className="absolute top-4 right-4 px-3 py-1 rounded-full bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] text-white font-extrabold text-xs shadow-lg flex items-center gap-1.5 animate-pulse">
                    <Flame className="w-3.5 h-3.5 text-amber-300" />
                    <span>{currentCandidate.compatibilityScore}% Compatibilité</span>
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
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-display font-black text-xl text-white">
                          {currentCandidate.gameName}
                        </h4>
                        <span className="text-xs text-slate-500 font-mono">#***</span>
                      </div>
                      <p className="text-xs text-slate-400">
                        {currentCandidate.age} ans • Serveur <span className="uppercase text-slate-200 font-semibold">{currentCandidate.region}</span>
                      </p>
                    </div>
                  </div>

                  {/* Badges Statistiques (Rank & Rôle) */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Rang Solo/Duo</span>
                      <span className="text-xs font-black text-white flex items-center justify-center gap-1 mt-0.5">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>{currentCandidate.rankTier} {currentCandidate.rankDivision}</span>
                      </span>
                    </div>

                    <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800 text-center">
                      <span className="text-[10px] text-slate-400 block uppercase font-semibold">Rôle & Main</span>
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
                    <span>Passer (Non)</span>
                  </button>

                  {/* Bouton OUI / LIKER */}
                  <button
                    onClick={() => handleSwipe(true)}
                    disabled={swiping}
                    className="btn-pink-cyan py-3.5 px-4 rounded-2xl text-white font-bold text-xs flex items-center justify-center gap-2 transition-all shadow-lg active:scale-95 disabled:opacity-50"
                  >
                    <Heart className="w-4 h-4 fill-white" />
                    <span>Liker (Oui)</span>
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
