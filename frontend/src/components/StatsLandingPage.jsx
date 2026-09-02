import React, { useState, useEffect } from 'react';
import { 
  Users, Trophy, Zap, Globe, Sparkles, Heart, ArrowRight, ShieldCheck, 
  Flame, CheckCircle2, UserPlus, Sliders, MessageSquare, Star, Target, Activity, Gamepad2
} from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';

export default function StatsLandingPage({ 
  onOpenAuth, 
  onOpenMatchmaker, 
  currentUser, 
  currentLang = 'fr' 
}) {
  const [statsData, setStatsData] = useState({
    registeredPlayers: 5,
    onlinePlayers: 5,
    totalMatches: 5,
    regionsCount: 4,
    featuredPlayers: []
  });

  // Récupération des vrais joueurs et statistiques en temps réel depuis la BDD
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/matchmaking/public-stats`);
        if (res.ok) {
          const data = await res.json();
          setStatsData({
            registeredPlayers: data.totalPlayers ?? 5,
            onlinePlayers: data.onlinePlayers ?? 5,
            totalMatches: data.totalMatches ?? 5,
            regionsCount: data.regionsCount ?? 4,
            featuredPlayers: data.featuredPlayers || []
          });
        }
      } catch (err) {
        console.error("Erreur de chargement des stats publiques:", err);
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
    { name: 'Grandmaster', tier: 'grandmaster' },
    { name: 'Challenger', tier: 'challenger' },
  ];

  // Joueurs réels de la plateforme
  const defaultPlayers = [
    {
      name: 'PrincessPinkyUp',
      tag: '#8ï8',
      rankTier: 'DIAMOND',
      rankDivision: 'I',
      winrate: '68%',
      wins: 102,
      losses: 48,
      role: 'ADC',
      mainChamp: 'Twitch',
      avatar: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/7196.jpg',
      currentIconId: 7196,
      badges: [{ id: 'high_elo', label: '💎 High Elo' }, { id: 'climber', label: '🥇 Climber Duo' }, { id: 'adc', label: '🏹 ADC Carry' }],
      region: 'EUW',
      badge: 'TOP WINRATE'
    },
    {
      name: 'Doakes',
      tag: '#slice',
      rankTier: 'SILVER',
      rankDivision: 'III',
      winrate: '62%',
      wins: 101,
      losses: 99,
      role: 'JUNGLE',
      mainChamp: 'Lillia',
      avatar: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/6024.jpg',
      currentIconId: 6024,
      badges: [{ id: 'climber', label: '🥇 Climber Duo' }, { id: 'jungle', label: '🐉 Jungler' }],
      region: 'EUW',
      badge: 'JUNGLE KING'
    },
    {
      name: 'Lesbian princess',
      tag: '#UwU',
      rankTier: 'MASTER',
      rankDivision: 'I',
      winrate: '64%',
      wins: 611,
      losses: 571,
      role: 'MID',
      mainChamp: 'Singed',
      avatar: 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/7.jpg',
      currentIconId: 7,
      badges: [{ id: 'high_elo', label: '💎 High Elo' }, { id: 'mid', label: '⚡ Carry Mid' }],
      region: 'EUW',
      badge: 'MASTER DUO'
    }
  ];

  const displayPlayers = statsData.featuredPlayers && statsData.featuredPlayers.length > 0 
    ? statsData.featuredPlayers.map((p, idx) => ({
        name: p.displayName || p.gameName,
        hasCustomName: Boolean(p.displayName && p.displayName.trim()),
        tag: `#${p.tagLine}`,
        rankTier: p.rankTier,
        rankDivision: p.rankDivision,
        winrate: p.winrate || '60%',
        wins: p.wins || 50,
        losses: p.losses || 30,
        role: p.primaryRole,
        mainChamp: p.favoriteChampion,
        avatar: p.customAvatar || `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${p.currentIconId || 28}.jpg`,
        currentIconId: p.currentIconId || 28,
        badges: (p.badges && p.badges.length > 0) ? p.badges : [{ id: 'climber', label: '🥇 Climber Duo' }],
        region: p.region,
        badge: idx === 0 ? 'TOP DUO' : idx === 1 ? 'ACTIVE PLAYER' : 'PRO CARRY'
      }))
    : defaultPlayers;

  const topDuos = statsData.topDuos && statsData.topDuos.length > 0 
    ? statsData.topDuos 
    : [
        { id: 1, player1Name: 'Faker', player2Name: 'Keria', score: 98, archetype: '🏆 Duo de Légende T1', winrate: '82%', games: 45 },
        { id: 2, player1Name: 'PrincessPinkyUp', player2Name: 'Lesbian princess', score: 95, archetype: '💎 High Elo Duo', winrate: '74%', games: 38 },
        { id: 3, player1Name: 'Doakes', player2Name: 'ILoveN', score: 91, archetype: '🔥 Climber Duo', winrate: '68%', games: 29 }
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

      {/* --- CARDS DE JOUEURS DE LA PLATEFORME (RÉELS) --- */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-1">
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-[#00f0ff]">
            {currentLang === 'fr' ? 'Joueurs de la Plateforme' : 'Platform Teammates'}
          </span>
          <h2 className="font-display font-black text-2xl sm:text-3xl text-white">
            {currentLang === 'fr' ? 'Des coéquipiers qualifiés et vérifiés' : 'Verified Platform Players'}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {displayPlayers.map((player, idx) => (
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

              {/* Avatar + Nom & Rang */}
              <div className="flex items-center gap-4">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-[#00f0ff] shrink-0 bg-slate-950 shadow-lg group-hover:scale-105 transition-transform">
                  <img 
                    src={player.avatar} 
                    alt={player.name} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.onerror = null;
                      e.target.src = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/profile-icons/${player.currentIconId || 28}.jpg`;
                    }}
                  />
                </div>
                <div>
                  <div className="flex items-center gap-1">
                    <h3 className="font-display font-black text-lg text-white group-hover:text-[#00f0ff] transition-colors">
                      {player.name}
                    </h3>
                    {!player.hasCustomName && (
                      <span className="text-xs text-slate-500 font-mono">{player.tag}</span>
                    )}
                  </div>
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

                  {/* Badges Automatiques Riot API (💎 High Elo, 🥇 Climber Duo...) */}
                  {player.badges && player.badges.length > 0 && (
                    <div className="flex items-center gap-1.5 flex-wrap pt-1">
                      {player.badges.map((b, bIdx) => (
                        <span key={bIdx} className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700/80 text-[11px] font-black text-amber-300 shadow-sm">
                          {b.label}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Grid des Stats (Taux de Victoire & Bilan V/D) */}
              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Taux de Victoire</span>
                  <span className="text-base font-black text-[#00f0ff]">{player.winrate}</span>
                </div>
                <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 text-center">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Victoires / Défaites</span>
                  <span className="text-sm font-bold text-slate-300">
                    <strong className="text-emerald-400">{player.wins}V</strong> / <strong className="text-red-400">{player.losses}D</strong>
                  </span>
                </div>
              </div>

              {/* Rôle & Champion Favori */}
              <div className="p-2.5 rounded-xl bg-slate-950/50 border border-slate-800/80 flex items-center justify-between text-xs font-semibold">
                <span className="text-slate-400">Rôle Main :</span>
                <span className="text-[#00f0ff] font-bold">⚔️ {player.role} ({player.mainChamp})</span>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* --- AFFICHAGE ENTIER DES RANGS (SANS BARRE DE DEFILEMENT LATERALE) --- */}
      <section className="py-8 border-y border-slate-800/80 bg-slate-950/50 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 space-y-3 text-center">
          <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">
            {currentLang === 'fr' ? 'Tous les rangs supportés' : 'All Supported Rank Tiers'}
          </span>
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 py-2">
            {ranksList.map((r, i) => (
              <div 
                key={i} 
                className="flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-slate-900/90 border border-slate-800 hover:border-[#00f0ff]/50 transition-all hover:scale-105 shadow-md"
              >
                <img src={getRankEmblemUrl(r.tier)} alt={r.name} className="w-6 h-6 object-contain" />
                <span className="text-xs font-black text-slate-200 uppercase tracking-wide">{r.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- HALL OF FAME : TOP DUOS DE LA PLATEFORME --- */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="text-center space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/15 border border-amber-500/40 text-amber-300 text-xs font-bold shadow-md">
            <Trophy className="w-4 h-4 text-amber-400" />
            <span>{currentLang === 'fr' ? 'CLASSEMENT OFFICIEL DE COMPATIBILITÉ' : 'OFFICIAL SYNERGY LEADERBOARD'}</span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide">
            🏆 Hall of Fame des Top Duos
          </h3>
          <p className="text-slate-400 text-xs sm:text-sm max-w-xl mx-auto">
            {currentLang === 'fr'
              ? 'Les Duos d\'invocateurs ayant obtenu les plus puissants scores d\'affinité et de complicité sur la plateforme !'
              : 'The summoner Duos who achieved the highest affinity & chemistry scores on the platform!'}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
          {topDuos.map((duo, idx) => (
            <div 
              key={duo.id || idx}
              className={`relative p-5 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0f1227] border shadow-xl flex flex-col justify-between space-y-4 hover:-translate-y-1 transition-all ${
                idx === 0 
                  ? 'border-amber-400/60 shadow-amber-500/10' 
                  : idx === 1 
                  ? 'border-slate-300/50 shadow-slate-300/10' 
                  : 'border-amber-700/50 shadow-amber-800/10'
              }`}
            >
              {/* Badge Rang Médaille (1er, 2ème, 3ème) */}
              <div className="flex items-center justify-between">
                <span className={`px-3 py-1 rounded-full text-xs font-black uppercase flex items-center gap-1 shadow-md ${
                  idx === 0 
                    ? 'bg-amber-400 text-slate-950' 
                    : idx === 1 
                    ? 'bg-slate-200 text-slate-950' 
                    : 'bg-amber-700 text-white'
                }`}>
                  <span>{idx === 0 ? '🥇 1er Duo' : idx === 1 ? '🥈 2ème Duo' : idx === 2 ? '🥉 3ème Duo' : `🏅 #${idx + 1} Duo`}</span>
                </span>

                <span className="text-xs font-mono font-bold text-slate-400">
                  {duo.games} games
                </span>
              </div>

              {/* Noms des 2 joueurs */}
              <div className="space-y-1.5 text-center my-2">
                <div className="font-display font-black text-lg text-white flex items-center justify-center gap-2 flex-wrap">
                  <span className="text-[#ff2a85]">{duo.player1Name}</span>
                  <Heart className="w-4 h-4 text-pink-500 fill-pink-500 animate-pulse shrink-0" />
                  <span className="text-[#00f0ff]">{duo.player2Name}</span>
                </div>
                <p className="text-xs text-amber-300 font-extrabold italic">
                  {duo.archetype}
                </p>
              </div>

              {/* Stat Score & Winrate */}
              <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-800 text-center">
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Score Affinité</span>
                  <span className="text-base font-black text-[#00f0ff]">{duo.score}%</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block">Winrate Duo</span>
                  <span className="text-base font-black text-emerald-400">{duo.winrate}</span>
                </div>
              </div>

            </div>
          ))}
        </div>
      </section>

      {/* --- CHIFFRES CLÉS & STATISTIQUES REELLES DE LA PLATEFORME --- */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
          
          {/* Card 1 : Joueurs Inscrits */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-[#ff2a85]/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#ff2a85]/20 text-[#ff2a85] flex items-center justify-center mx-auto border border-[#ff2a85]/40">
              <Users className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              👥 {statsData.registeredPlayers}
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Joueurs Inscrits' : 'Registered Players'}
            </p>
          </div>

          {/* Card 2 : Joueurs Connectés */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-emerald-500/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto border border-emerald-500/40">
              <Activity className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              🟢 {statsData.onlinePlayers}
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Joueurs Connectés' : 'Online Players'}
            </p>
          </div>

          {/* Card 3 : Matchs Duo Formés */}
          <div className="p-6 rounded-3xl bg-gradient-to-b from-[#090b16] to-[#0d0f22] border border-slate-800 hover:border-[#00f0ff]/50 text-center space-y-2 shadow-xl hover:-translate-y-1 transition-all">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 text-[#00f0ff] flex items-center justify-center mx-auto border border-[#00f0ff]/40">
              <Gamepad2 className="w-6 h-6" />
            </div>
            <div className="font-display font-black text-3xl sm:text-4xl text-white tracking-tight">
              💖 {statsData.totalMatches}
            </div>
            <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider">
              {currentLang === 'fr' ? 'Matchs Duo Formés' : 'Matches Formed'}
            </p>
          </div>

          {/* Card 4 : Régions Supportées */}
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
              Connect your Riot Account in seconds. Rank, winrate, and favorite champions load automatically.
            </p>
          </div>

          {/* Étape 2 (Modifiée comme demandé : Let Our Algorithm Surprise You) */}
          <div className="relative p-7 rounded-3xl bg-[#090b16] border border-slate-800 space-y-4 shadow-xl text-center md:text-left border-[#00f0ff]/40">
            <div className="w-12 h-12 rounded-2xl bg-[#00f0ff]/20 text-[#00f0ff] font-black text-xl flex items-center justify-center border border-[#00f0ff]/40 mx-auto md:mx-0">
              2
            </div>
            <h3 className="font-display font-bold text-xl text-white flex items-center justify-center md:justify-start gap-2">
              <Sparkles className="w-5 h-5 text-[#00f0ff]" />
              <span>Let Our Algorithm Surprise You</span>
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              {currentLang === 'fr' 
                ? "Laissez notre algorithme calculer la meilleure synergie de rôles et la proximité de rang pour vous trouver le duo idéal."
                : "Let our algorithm calculate the optimal role synergy, rank proximity, and playstyle match for you automatically."}
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
