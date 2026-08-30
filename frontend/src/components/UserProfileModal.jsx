import React, { useState, useEffect } from 'react';
import { X, CheckCircle, RefreshCw, Trophy, Shield, Heart, Sparkles, AlertCircle, Camera } from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';
import { translations } from '../utils/translations';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated, onLogout, currentLang = 'en' }) {
  const t = translations[currentLang]?.profile || translations.en.profile;

  const [displayName, setDisplayName] = useState(user?.displayName || '');
  const [spokenLangs, setSpokenLangs] = useState(
    user?.spokenLanguages ? user.spokenLanguages.split(',').map(s => s.trim()) : ['FR', 'EN']
  );
  const [birthDate, setBirthDate] = useState(user?.birthDate || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [primaryRole, setPrimaryRole] = useState(user?.primaryRole || 'MID');
  const [favoriteChampion, setFavoriteChampion] = useState(user?.favoriteChampion || '');

  // Réseaux sociaux
  const [discordTag, setDiscordTag] = useState(user?.discordTag || '');
  const [instagramUsername, setInstagramUsername] = useState(user?.instagramUsername || '');
  const [tiktokUsername, setTiktokUsername] = useState(user?.tiktokUsername || '');
  const [twitchUsername, setTwitchUsername] = useState(user?.twitchUsername || '');
  const [twitterUsername, setTwitterUsername] = useState(user?.twitterUsername || '');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatusMsg, setVerifyStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  // Synchronisation des états locaux si l'utilisateur est mis à jour depuis le backend
  useEffect(() => {
    if (user) {
      if (user.displayName !== undefined) setDisplayName(user.displayName || '');
      if (user.spokenLanguages) setSpokenLangs(user.spokenLanguages.split(',').map(s => s.trim()));
      if (user.birthDate) setBirthDate(user.birthDate);
      if (user.bio) setBio(user.bio);
      if (user.primaryRole) setPrimaryRole(user.primaryRole);
      if (user.favoriteChampion) setFavoriteChampion(user.favoriteChampion);
      if (user.discordTag) setDiscordTag(user.discordTag);
      if (user.instagramUsername) setInstagramUsername(user.instagramUsername);
      if (user.tiktokUsername) setTiktokUsername(user.tiktokUsername);
      if (user.twitchUsername) setTwitchUsername(user.twitchUsername);
      if (user.twitterUsername) setTwitterUsername(user.twitterUsername);
    }
  }, [user]);

  const toggleSpokenLang = (code) => {
    setSpokenLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Empêcher totalement le scroll de la page arrière-plan (html & body) lors de l'ouverture du profil
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

  const targetIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.targetIconId || 28}.png`;

  // Gestion de l'upload de photo de profil personnalisée
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert(currentLang === 'fr' ? 'La photo dépasse la taille maximale autorisée de 5 Mo.' : 'Image size exceeds maximum 5 MB limit.');
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const base64Data = reader.result;
      try {
        const token = localStorage.getItem('riftaffinity_token');
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/profile/update`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ customAvatar: base64Data })
        });

        const data = await res.json();
        if (res.ok && data.user) {
          onUserUpdated(data.user);
        }
      } catch (err) {
        console.error('Erreur lors de l\'envoi de la photo:', err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Lancement de la vérification Ori Bot
  const handleVerifyIcon = async () => {
    setIsVerifying(true);
    setVerifyStatusMsg('');

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/verify-icon`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        setVerifyStatusMsg(data.message);
      } else {
        setVerifyStatusMsg(data.detail || (currentLang === 'fr' ? 'Erreur lors de la vérification.' : 'Verification error.'));
      }
    } catch (err) {
      setVerifyStatusMsg(currentLang === 'fr' ? 'Erreur de connexion au serveur.' : 'Server connection error.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Synchronisation globale (Pseudo, Photo, Rank & Main Champion)
  const handleRefreshAllRiotData = async () => {
    setIsVerifying(true);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/refresh-all`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        if (data.user.favoriteChampion) setFavoriteChampion(data.user.favoriteChampion);
        setVerifyStatusMsg(data.message);
        setTimeout(() => setVerifyStatusMsg(''), 4000);
      }
    } catch (err) {
      setVerifyStatusMsg(currentLang === 'fr' ? 'Erreur lors de la synchronisation.' : 'Sync error.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Sauvegarde des informations du profil dating
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    setSaveSuccessMsg('');

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          birthDate,
          bio,
          primaryRole,
          favoriteChampion,
          discordTag,
          instagramUsername,
          tiktokUsername,
          twitchUsername,
          twitterUsername,
          displayName,
          spokenLanguages: spokenLangs.join(',')
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        setSaveSuccessMsg(currentLang === 'fr' ? 'Profil mis à jour avec succès !' : 'Profile updated successfully!');
        setTimeout(() => setSaveSuccessMsg(''), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md animate-fadeIn px-4 py-10 sm:py-16 flex justify-center items-start">
      <div className="relative w-full max-w-2xl p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#00f0ff]/40 shadow-2xl space-y-6">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête du Profil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-800">
          
          {/* Avatar avec bouton d'importation photo */}
          <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-[#ff2a85] shadow-lg bg-slate-900 shrink-0 group">
            <img
              src={user.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.currentIconId || user.targetIconId || 28}.png`}
              alt="Profile Icon"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = targetIconUrl; }}
            />
            <label className="absolute inset-0 bg-black/75 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center text-white cursor-pointer transition-opacity text-[10px] font-bold gap-1 text-center p-1">
              <Camera className="w-5 h-5 text-[#00f0ff]" />
              <span>{t.uploadAvatarBtn || "Changer Photo"}</span>
              <input
                type="file"
                accept="image/*"
                onChange={handleCustomAvatarUpload}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center sm:text-left flex-1 space-y-1">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h2 className="font-display font-black text-2xl text-white">
                {user.displayName || user.gameName}
              </h2>
              {user.displayName && (
                <span className="text-xs text-slate-400 font-mono">({user.gameName}#{user.tagLine})</span>
              )}

              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>{t.verifiedBadge || "Compte LoL Vérifié"}</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>{t.unverifiedBadge || "Non Vérifié"}</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              {t.serverLabel || "Serveur"}: <span className="text-slate-200 uppercase font-semibold">{user.region}</span> • {t.memberNotice || "Membre RiftAffinity"}
            </p>

            <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={handleRefreshAllRiotData}
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-[#00f0ff]/50 hover:border-[#00f0ff] text-[#00f0ff] hover:text-white text-xs font-semibold transition-all shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>{t.syncBtn || "Tout synchroniser depuis LoL"}</span>
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition-colors"
          >
            {t.logoutBtn || "Déconnexion"}
          </button>
        </div>

        {/* --- SECTION 1 : VÉRIFICATION D'ICÔNE --- */}
        {!user.isVerified && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0d1d] border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>{t.verificationTitle || "Vérification Officielle de Propriété LoL"}</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t.verificationDesc || "Pour prouver que vous êtes bien le propriétaire de"} <strong className="text-white">{user.gameName}#{user.tagLine}</strong>:
            </p>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0">
                <img src={targetIconUrl} alt="Target Icon" className="w-full h-full object-cover" />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-100">{t.iconRequired || "Icône Requise n°"}{user.targetIconId}</span>
                <span className="text-[11px] text-slate-400">{t.iconRequiredSub || "Équipez cette icône dans le client League of Legends"}</span>
              </div>
            </div>

            {verifyStatusMsg && (
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-700 text-xs text-amber-200 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-amber-400" />
                <span>{verifyStatusMsg}</span>
              </div>
            )}

            <button
              onClick={handleVerifyIcon}
              disabled={isVerifying}
              className="w-full btn-pink-cyan py-3 px-4 rounded-xl text-white font-bold text-xs flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{isVerifying ? (t.verifyingBtn || 'Vérification en cours chez Riot...') : (t.verifyBtn || 'Vérifier mon Icône LoL & Mon Rang')}</span>
            </button>
          </div>
        )}

        {/* --- SECTION 2 : RANG AUTOMATIQUE LOL VIA API RIOT --- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090b16]/80 border border-[#00f0ff]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#00f0ff] flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>{t.rankTitle || "Classement Solo/Duo Automatique (Riot API)"}</span>
            </span>
            <button
              onClick={handleRefreshAllRiotData}
              disabled={isVerifying}
              className="text-[11px] text-[#00f0ff] hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>{t.refreshRankBtn || "Actualiser le Rang & Maîtrise"}</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              {/* Emblème / Logo de Rang LoL (Diamond, Master, Challenger, etc.) */}
              <div className="w-12 h-12 sm:w-16 sm:h-16 shrink-0 relative flex items-center justify-center p-1 bg-slate-950/90 rounded-2xl border border-[#00f0ff]/40 shadow-lg">
                <img
                  src={getRankEmblemUrl(user.rankTier)}
                  alt={user.rankTier || 'Unranked'}
                  className="w-full h-full object-contain drop-shadow-[0_0_12px_rgba(0,240,255,0.4)]"
                />
              </div>

              <div>
                <span className="font-display font-black text-lg sm:text-2xl text-white block">
                  {user.rankTier ? `${user.rankTier} ${user.rankDivision || ''}` : 'UNRANKED'}
                </span>
                <div className="text-xs text-slate-400 font-semibold mt-0.5">
                  {user.rankLp !== null && user.rankLp !== undefined ? `${user.rankLp} LP • Solo/Duo` : (t.soloDuo || 'Rang Solo/Duo')}
                </div>
              </div>
            </div>

            <div className="text-left sm:text-right shrink-0 pt-2 sm:pt-0 border-t border-slate-800/80 sm:border-0 flex sm:flex-col items-center justify-between sm:justify-center">
              <span className="text-xs text-[#ff2a85] font-bold block">{user.favoriteChampion || 'LoL Player'}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{user.primaryRole || 'MID'} LANE</span>
            </div>
          </div>
        </div>

        {/* --- SECTION 3 : FORMULAIRE DE PROFIL DATING LOL --- */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#ff2a85]" />
            <span>{t.matchmakingTitle || "Mon Profil & Préférences Matchmaking"}</span>
          </h4>

          {/* Importation de la Photo de Profil */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">{t.changeAvatarTitle || "Photo de Profil Personnalisée"}</label>
            <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#ff2a85] shrink-0 bg-slate-950">
                  <img
                    src={user.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.currentIconId || user.targetIconId || 28}.png`}
                    alt="Avatar"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <span className="block text-xs font-semibold text-white">{t.changeAvatarTitle || "Changer ma photo de profil"}</span>
                  <span className="text-[10px] text-slate-400">{t.changeAvatarSub || "Format d'image personnalisé (max 5 Mo)"}</span>
                </div>
              </div>

              {/* Bouton d'importation positionné en dessous (en restant 100% à l'intérieur du cadre) */}
              <label className="w-full px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-[#ff2a85] text-slate-200 hover:text-white border border-slate-700 hover:border-[#ff2a85] text-xs font-semibold transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md">
                <Camera className="w-4 h-4 text-[#ff2a85] group-hover:text-white" />
                <span>{t.uploadAvatarBtn || "Importer une photo"}</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Nom / Pseudo d'Affichage Personnalisé */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-1">
            <label className="block text-xs font-bold text-white mb-1">
              {t.displayNameLabel || "Nom / Pseudo d'Affichage Personnalisé (Optionnel)"}
            </label>
            <input
              type="text"
              placeholder={t.displayNamePlaceholder || "ex: Alex (Laisser vide pour utiliser le Riot ID)"}
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 font-medium"
            />
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {t.displayNameHelp || "Si renseigné, ce pseudo sera affiché en priorité et masquera le tag Riot (#TAG) sur vos cartes."}
            </span>
          </div>

          {/* Tags : Langues Parlées */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
            <label className="block text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <span>{t.spokenLanguagesTitle || "🗣️ Langues Parlées (Sélectionnez vos badges/tags)"}</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {[
                { code: 'FR', label: 'Français 🇫🇷' },
                { code: 'EN', label: 'English 🇬🇧' },
                { code: 'ES', label: 'Español 🇪🇸' },
                { code: 'KR', label: '한국어 🇰🇷' },
                { code: 'DE', label: 'Deutsch 🇩🇪' },
                { code: 'PT', label: 'Português 🇧🇷' }
              ].map(lang => {
                const isSelected = spokenLangs.includes(lang.code);
                return (
                  <button
                    key={lang.code}
                    type="button"
                    onClick={() => toggleSpokenLang(lang.code)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                      isSelected
                        ? 'bg-[#00f0ff]/20 text-[#00f0ff] border-[#00f0ff]/60 shadow-md shadow-[#00f0ff]/10 scale-105'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    <span>{lang.label}</span>
                    {isSelected && <CheckCircle className="w-3.5 h-3.5 text-[#00f0ff]" />}
                  </button>
                );
              })}
            </div>
            <span className="text-[10px] text-slate-400 block pt-0.5">
              {t.spokenLanguagesHelp || "Ces badges seront affichés sur votre carte de matchmaking pour indiquer les langues que vous parlez."}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-slate-400">{t.birthDateLabel || "Date de Naissance"}</label>
                {user?.age !== null && user?.age !== undefined && (
                  <span className="text-[10px] text-[#ff2a85] font-bold">
                    🎂 {user.age} {t.ageCalculated || "ans (calculé dynamiquement)"}
                  </span>
                )}
              </div>
              <input
                type="date"
                value={birthDate}
                onChange={(e) => setBirthDate(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 cursor-pointer font-medium"
              />
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">{t.primaryRoleLabel || "Rôle Principal"}</label>
              <select
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white bg-[#080912]"
              >
                <option value="TOP">TOP (Voie du Haut)</option>
                <option value="JUNGLE">JUNGLE (Jungle)</option>
                <option value="MID">MID (Voie du Milieu)</option>
                <option value="ADC">ADC (Botlane Carry)</option>
                <option value="SUPPORT">SUPPORT (Botlane Support)</option>
              </select>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-[11px] text-slate-400">{t.favoriteChampLabel || "Champion Favori / Main (Automatique par Maîtrise Riot)"}</label>
              <span className="text-[10px] text-emerald-400 font-medium">✨ Maîtrise #1 Synchro</span>
            </div>
            <input
              type="text"
              placeholder="Détecté automatiquement via Maîtrise de Champion Riot"
              value={favoriteChampion}
              onChange={(e) => setFavoriteChampion(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 font-semibold"
            />
          </div>

          <div>
            <label className="block text-[11px] text-slate-400 mb-1">{t.bioLabel || "Description / Bio"}</label>
            <textarea
              rows="3"
              placeholder="Présentez-vous en quelques mots (Style de jeu, ce que vous cherchez en duo...)"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
            ></textarea>
          </div>

          {/* Section Réseaux Sociaux */}
          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <label className="block text-xs font-bold text-[#00f0ff]">{t.socialsTitle || "🌐 Mes Réseaux Sociaux (Débloqués uniquement lors d'un Match)"}</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">🎮 Discord</label>
                <input
                  type="text"
                  placeholder="ex: Faker_T1"
                  value={discordTag}
                  onChange={(e) => setDiscordTag(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">📷 Instagram</label>
                <input
                  type="text"
                  placeholder="ex: @faker_lol"
                  value={instagramUsername}
                  onChange={(e) => setInstagramUsername(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">🎵 TikTok</label>
                <input
                  type="text"
                  placeholder="ex: @faker"
                  value={tiktokUsername}
                  onChange={(e) => setTiktokUsername(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 mb-1">🟣 Twitch</label>
                <input
                  type="text"
                  placeholder="ex: faker"
                  value={twitchUsername}
                  onChange={(e) => setTwitchUsername(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-xl text-xs text-white placeholder-slate-500"
                />
              </div>
            </div>
          </div>

          {saveSuccessMsg && (
            <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 text-xs">
              {saveSuccessMsg}
            </div>
          )}

          <div className="pt-2">
            <button
              type="submit"
              disabled={isSaving}
              className="w-full py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
            >
              <span>{isSaving ? (t.savingBtn || 'Enregistrement...') : (t.saveBtn || 'Enregistrer mon Profil')}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
