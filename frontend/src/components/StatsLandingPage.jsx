import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Zap, Globe, Sparkles, Heart, ArrowRight, ShieldCheck, 
  Flame, CheckCircle2, UserPlus, Sliders, MessageSquare, Star, Target, Crosshair
} from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';

export default function StatsLandingPage({ 
  onOpenAuth, 
  onOpenMatchmaker, 
  currentUser, 
  currentLang = 'fr' 
}) {
  const [statsData, setStatsData] = useState({
    registeredPlayers: 212,
    rankTiers: 9,
    freeToUse: 100,
    regionsCount: 4
  });

  // Fetch real count from public stats endpoint if available
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/matchmaking/public-stats`);
        if (res.ok) {
          const data = await res.json();
          if (data.totalPlayers) {
            setStatsData(prev => ({
              ...prev,
              registeredPlayers: Math.max(212, data.totalPlayers)
            }));
          }
        }
      } catch (err) {
        // Fallback to default stats
      }
    };
    fetchStats();
  }, []);

  const ranksList = [
    { name: 'Iron', tier: 'iron' },
    { name: 'Bronze', tier: 'bronze' },
    { name: 'Silver', tier: 'silver' },
    { name: 'Gold', tier: 'gold' },
    { name: 'Platinum', tier: 'platinum' },
    { name: 'Emerald', tier: 'emerald' },
    { name: 'Diamond', tier: 'diamond' },
    { name: 'Master', tier: 'master' },
    { name: 'Challenger', tier: 'challenger' },
  ];

  const featuredPlayers = [
    {
      name: 'PhantomEUW',
      rankTier: 'CHALLENGER',
      rankDivision: 'I',
      kd: '1.84',
      hs: '28%',
      winrate: '68%',
      role: 'ADC',
      mainChamp: 'Vayne',
      avatar: 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/588.png',
      region: 'EUW',
      badge: 'PRO DUO'
    },
    {
      name: 'AscendGod',
      rankTier: 'MASTER',
      rankDivision: 'I',
      kd: '1.42',
      hs: '22%',
      winrate: '64%',
      role: 'JUNGLE',
      mainChamp: 'Lee Sin',
      avatar: 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/12.png',
      region: 'EUW',
      badge: 'TOP CARRY'
    },
    {
      name: 'DiamondDuo',
      rankTier: 'DIAMOND',
      rankDivision: '1',
      kd: '1.21',
      hs: '19%',
      winrate: '58%',
      role: 'MID',
      mainChamp: 'Ahri',
      avatar: 'https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/28.png',
      region: 'NA',
      badge: 'SHIELDER'
    }
  ];

  return (
    <div className="space-y-16 py-6 sm:py-10 animate-fadeIn">
      
      {/* --- HERO SECTION --- */}
      <section className="relative text-center space-y-6 max-w-4xl mx-auto px-4">
        
        {/* Glow Effects Background */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-[#ff2a85]/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-[#00f0ff]/15 blur-[100px] rounded-full pointer-events-none" />

        {/* Badge Hero */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-[#ff2a85]/20 via-[#8a2be2]/20 to-[#00f0ff]/20 border border-[#ff2a85]/40 text-xs font-black text-[#ff2a85] shadow-lg animate-pulse">
          <Sparkles className="w-4 h-4 text-amber-300" />
          <span>STOP PLAYING WITH TOXIC MATES</span>
        </div>

        {/* Hero Title */}
        <h1 className="font-display font-black text-3xl sm:text-5xl md:text-6xl text-white tracking-tight leading-tight">
          Stop Playing <br className="hidden sm:inline" />
          <span className="gradient-text-vibrant">WITH TOXIC MATES</span>
        </h1>

        {/* Subtitle */}
        <p className="text-sm sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
          {currentLang === 'fr' 
            ? "Trouvez des coéquipiers qui partagent votre rang, votre style de jeu et votre état d'esprit. Plus d'excuses — que des victoires."
            : "Match with players who share your rank, playstyle, and mindset. No more excuses — just wins."}
        </p>

        {/* CTAs Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          
          <button
            onClick={currentUser ? onOpenMatchmaker : onOpenAuth}
            className="w-full sm:w-auto btn-pink-cyan py-4 px-8 rounded-2xl text-white font-extrabold text-sm sm:text-base flex items-center justify-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all group"
          >
            <Flame className="w-5 h-5 text-amber-300 fill-amber-300 group-hover:animate-bounce" />
            <span>{currentLang === 'fr' ? 'Trouver mon Duo — Gratuit' : 'Find My Duo — Free'}</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          {!currentUser && (
            <button
              onClick={onOpenAuth}
              className="w-full sm:w-auto py-4 px-6 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700 hover:border-[#00f0ff] text-slate-200 hover:text-white font-semibold text-xs sm:text-sm transition-all flex items-center justify-center gap-2"
            >
              <span>{currentLang === 'fr' ? 'Déjà un compte ? Se Connecter →' : 'Already have an account? Sign In →'}</span>
            </button>
          )}

        </div>

      </section>

      {/* --- CARDS DE JOUEURS EN VEDETTE --- */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00f0ff]">
            {currentLang === 'fr' ? 'Duos Prêts à Jouer' : 'Top Duo Candidates'}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {currentLang === 'fr' ? 'Des coéquipiers qualifiés et vérifiés' : 'Top Rated Teammates Online'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredPlayers.map((player, idx) => (
            <div 
              key={idx}
              className="relative rounded-3xl bg-[#090b16]/90 border border-slate-800 hover:border-[#ff2a85]/60 p-6 space-y-5 shadow-2xl transition-all duration-300 hover:-translate-y-1.5 group overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#ff2a85]/10 to-transparent rounded-bl-full pointer-events-none" />

              {/* Badge Overlay */}
              <div className="flex items-center justify-between">
                <span className="px-3 py-1 rounded-full bg-[#ff2a85]/20 text-[#ff2a85] border border-[#ff2a85]/40 text-[10px] font-black uppercase tracking-wider">
                  {player.badge}
                </span>
                <span className="text-xs text-slate-400 font-mono font-bold">
                  {player.region}
                </span>
              </div>

              {/* Avatar + Rank */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shrink-0 bg-slate-950 shadow-lg group-hover:scale-105 transition-transform">
                  <img src={player.avatar} alt={player.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h3 className="font-display font-black text-lg text-white group-hover:text-[#00f0ff] transition-colors">
                    {player.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <img 
                      src={getRankEmblemUrl(player.rankTier)} 
                      alt={player.rankTier} 
                      className="w-5 h-5 object-contain"
                    />
                    <span className="text-xs font-bold text-slate-200">
                      {player.rankTier} {player.rankDivision}
                    </span>
                  </div>
                </div>
              </div>

              {/* Grid des Stats (K/D & HS% / Winrate) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">K / D</span>
                  <span className="text-base font-black text-emerald-400">{player.kd}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">HS% / Winrate</span>
                  <span className="text-base font-black text-[#00f0ff]">{player.hs}</span>
                </div>
              </div>

              {/* Roles & Champions */}
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Rôle Main :</span>
                <span className="text-white font-bold">⚔️ {player.role} ({player.mainChamp})</span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* --- BANNIÈRE DYNAMIQUE DES RANGS --- */}
      <section className="py-6 border-y border-slate-800/80 bg-slate-950/50 backdrop-blur-sm overflow-hidden">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between gap-4 overflow-x-auto no-scrollbar py-2">
            {ranksList.map((r, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-[#00f0ff]/50 transition-all shrink-0 hover:scale-105"
              >
                <img src={getRankEmblemUrl(r.tier)} alt={r.name} className="w-6 h-6 object-contain" />
                <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CHIFFRES CLÉS & STATISTIQUES --- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-[#ff2a85]/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#ff2a85]/20 text-[#ff2a85] flex items-center justify-center mx-auto border border-[#ff2a85]/40">
              <Users className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              👥 {statsData.registeredPlayers}+
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Joueurs Inscrits' : 'Registered Players'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-[#00f0ff]/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center mx-auto border border-[#00f0ff]/40">
              <Trophy className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              🏆 {statsData.rankTiers}
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Rangs LoL Dispo' : 'Rank Tiers'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-emerald-500/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <Zap className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              ⚡ {statsData.freeToUse}%
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Gratuit & Illimité' : 'Free to Use'}
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-purple-500/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/20 text-purple-400 flex items-center justify-center mx-auto border border-purple-500/40">
              <Globe className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              🌍 {statsData.regionsCount}
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              EUW · NA · KR · EUNE
            </p>
          </div>

        </div>
      </section>

      {/* --- HOW IT WORKS (3 ETAPES) --- */}
      <section className="max-w-5xl mx-auto px-4 space-y-10">
        <div className="text-center space-y-2">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#ff2a85]">
            How It Works
          </span>
          <h2 className="font-display font-black text-3xl sm:text-4xl text-white">
            {currentLang === 'fr' ? 'Trouvez votre Duo en 3 Étapes' : 'Find your Duo in 3 Steps'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* Étape 1 */}
          <div className="relative p-7 rounded-3xl bg-[#090b16] border border-slate-800 space-y-4 shadow-xl text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#ff2a85]/20 text-[#ff2a85] font-black text-xl flex items-center justify-center border border-[#ff2a85]/40 mx-auto md:mx-0">
              1
            </div>
            <h3 className="font-display font-bold text-xl text-white flex items-center justify-center md:justify-start gap-2">
              <UserPlus className="w-5 h-5 text-[#ff2a85]" />
              <span>Link Your Account</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Connect your Riot Account in seconds. Rank, K/D, winrate, and favorite champions load automatically.
            </p>
          </div>

          {/* Étape 2 */}
          <div className="relative p-7 rounded-3xl bg-[#090b16] border border-slate-800 space-y-4 shadow-xl text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 text-[#00f0ff] font-black text-xl flex items-center justify-center border border-[#00f0ff]/40 mx-auto md:mx-0">
              2
            </div>
            <h3 className="font-display font-bold text-xl text-white flex items-center justify-center md:justify-start gap-2">
              <Sliders className="w-5 h-5 text-[#00f0ff]" />
              <span>Set Your Filters</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Filter by rank from Iron to Challenger. Play with exactly the level and role synergy you want.
            </p>
          </div>

          {/* Étape 3 */}
          <div className="relative p-7 rounded-3xl bg-[#090b16] border border-slate-800 space-y-4 shadow-xl text-center md:text-left">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 font-black text-xl flex items-center justify-center border border-emerald-500/40 mx-auto md:mx-0">
              3
            </div>
            <h3 className="font-display font-bold text-xl text-white flex items-center justify-center md:justify-start gap-2">
              <Heart className="w-5 h-5 text-emerald-400 fill-emerald-400" />
              <span>Swipe & Match</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Right for interest, left to skip. Both swipe right? Instant match — straight into chat and games.
            </p>
          </div>

        </div>
      </section>

      {/* --- BANNIÈRE FINALE CALL TO ACTION --- */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-[#1a0826] via-[#090b16] to-[#0b1626] border-2 border-[#ff2a85]/60 text-center space-y-6 shadow-2xl overflow-hidden">
          
          <div className="absolute inset-0 bg-gradient-to-r from-[#ff2a85]/10 to-[#00f0ff]/10 pointer-events-none" />

          <div className="relative space-y-2">
            <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide">
              Your Duo is Waiting.
            </h2>
            <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto">
              Stop climbing alone. Your perfect teammate is already here.
            </p>
          </div>

          <div className="relative pt-2">
            <button
              onClick={currentUser ? onOpenMatchmaker : onOpenAuth}
              className="btn-pink-cyan py-4 px-10 rounded-2xl text-white font-black text-base inline-flex items-center gap-3 shadow-xl hover:scale-105 active:scale-95 transition-all"
            >
              <span>Find My Duo →</span>
            </button>
          </div>

        </div>
      </section>

    </div>
  );
}
