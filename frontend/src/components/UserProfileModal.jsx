import React, { useState, useEffect } from 'react';
import { X, CheckCircle, RefreshCw, Trophy, Shield, Heart, Sparkles, AlertCircle, Camera } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated, onLogout }) {
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

  // Importation d'une photo de profil personnalisée
  const handleCustomAvatarUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      alert("L'image est trop volumineuse (max 5 Mo).");
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
        if (data.user) {
          onUserUpdated(data.user);
          setSaveSuccessMsg('Photo de profil mise à jour avec succès !');
          setTimeout(() => setSaveSuccessMsg(''), 3000);
        }
      } catch (err) {
        console.error("Erreur lors de l'envoi de la photo:", err);
      }
    };
    reader.readAsDataURL(file);
  };

  // Vérification officielle et synchronisation du Rang LoL & Champion Favori
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

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Erreur de réponse du serveur.");
      }

      setVerifyStatusMsg(data.message || 'Vérification effectuée.');

      if (data.user) {
        onUserUpdated(data.user);
        if (data.user.favoriteChampion) {
          setFavoriteChampion(data.user.favoriteChampion);
        }
      }
    } catch (err) {
      setVerifyStatusMsg('Erreur lors de la vérification du compte.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Synchronisation globale (Pseudo, Photo de profil, Rank & Champions)
  const handleRefreshAllRiotData = async () => {
    setIsVerifying(true);
    setVerifyStatusMsg('');

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/refresh-all`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const contentType = res.headers.get("content-type");
      let data = {};
      if (contentType && contentType.includes("application/json")) {
        data = await res.json();
      } else {
        const text = await res.text();
        throw new Error(text || "Erreur de réponse du serveur.");
      }

      if (data.user) {
        onUserUpdated(data.user);
        if (data.user.favoriteChampion) {
          setFavoriteChampion(data.user.favoriteChampion);
        }
        setVerifyStatusMsg(data.message || 'Profil complet synchronisé avec succès !');
      }
    } catch (err) {
      setVerifyStatusMsg('Erreur lors de la synchronisation.');
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
          twitterUsername
        })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        setSaveSuccessMsg('Profil mis à jour avec succès !');
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
              <span>Changer Photo</span>
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
                {user.gameName}#{user.tagLine}
              </h2>

              {user.isVerified ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold">
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Compte LoL Vérifié</span>
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Non Vérifié</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Région: <span className="text-slate-200 uppercase font-semibold">{user.region}</span> • Membre RiftAffinity
            </p>

            <div className="pt-1.5 flex flex-wrap gap-2 justify-center sm:justify-start">
              <button
                onClick={handleRefreshAllRiotData}
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900 border border-[#00f0ff]/50 hover:border-[#00f0ff] text-[#00f0ff] hover:text-white text-xs font-semibold transition-all shadow-md"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin' : ''}`} />
                <span>Tout synchroniser depuis LoL</span>
              </button>
            </div>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* --- SECTION 1 : VÉRIFICATION D'ICÔNE --- */}
        {!user.isVerified && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0d1d] border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Vérification Officielle de Propriété LoL</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour prouver que vous êtes bien le propriétaire de <strong className="text-white">{user.gameName}#{user.tagLine}</strong>, équipez cette icône d'invocateur dans votre client League of Legends puis cliquez sur le bouton de vérification :
            </p>

            <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-14 h-14 rounded-xl overflow-hidden border-2 border-amber-400 shrink-0">
                <img src={targetIconUrl} alt="Target Icon" className="w-full h-full object-cover" />
              </div>

              <div>
                <span className="block text-xs font-bold text-slate-100">Icône Requise n°{user.targetIconId}</span>
                <span className="text-[11px] text-slate-400">Équipez cette icône dans le client League of Legends</span>
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
              <span>{isVerifying ? 'Vérification en cours chez Riot...' : 'Vérifier mon Icône LoL & Mon Rang'}</span>
            </button>
          </div>
        )}

        {/* --- SECTION 2 : RANG AUTOMATIQUE LOL VIA API RIOT --- */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[#090b16]/80 border border-[#00f0ff]/30 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase font-bold text-[#00f0ff] flex items-center gap-2">
              <Trophy className="w-4 h-4" />
              <span>Classement Solo/Duo Automatique (Riot API)</span>
            </span>
            <button
              onClick={handleRefreshAllRiotData}
              disabled={isVerifying}
              className="text-[11px] text-[#00f0ff] hover:underline flex items-center gap-1 font-semibold"
            >
              <RefreshCw className={`w-3 h-3 ${isVerifying ? 'animate-spin' : ''}`} />
              <span>Actualiser le Rang & Maîtrise</span>
            </button>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-display font-black text-2xl text-white">
                {user.rankTier ? `${user.rankTier} ${user.rankDivision || ''}` : 'UNRANKED'}
              </span>
              <div className="text-xs text-slate-400">
                {user.rankLp !== null && user.rankLp !== undefined ? `${user.rankLp} LP` : 'Rang Solo/Duo'}
              </div>
            </div>

            <div className="text-right">
              <span className="text-xs text-[#ff2a85] font-bold block">{user.favoriteChampion || 'LoL Player'}</span>
              <span className="text-[10px] text-slate-400 uppercase font-semibold">{user.primaryRole || 'MID'} LANE</span>
            </div>
          </div>
        </div>

        {/* --- SECTION 3 : FORMULAIRE DE PROFIL DATING LOL --- */}
        <form onSubmit={handleSaveProfile} className="space-y-4 pt-2">
          <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
            <Heart className="w-4 h-4 text-[#ff2a85]" />
            <span>Mon Profil & Préférences Matchmaking</span>
          </h4>

          {/* Importation de la Photo de Profil */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Photo de Profil Personnalisée</label>
            <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800">
              <div className="w-12 h-12 rounded-xl overflow-hidden border border-[#ff2a85] shrink-0 bg-slate-950">
                <img
                  src={user.customAvatar || `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.currentIconId || user.targetIconId || 28}.png`}
                  alt="Avatar"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <span className="block text-xs font-semibold text-white">Changer ma photo de profil</span>
                <span className="text-[10px] text-slate-400">Format d'image personnalisé (max 5 Mo)</span>
              </div>
              <label className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-[#ff2a85] text-slate-200 hover:text-white border border-slate-700 hover:border-[#ff2a85] text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 shrink-0 shadow-md">
                <Camera className="w-4 h-4 text-[#ff2a85] group-hover:text-white" />
                <span>Importer une photo</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleCustomAvatarUpload}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-[11px] text-slate-400">Date de Naissance</label>
                {user?.age !== null && user?.age !== undefined && (
                  <span className="text-[10px] text-[#ff2a85] font-bold">
                    🎂 {user.age} ans (calculé dynamiquement)
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
              <label className="block text-[11px] text-slate-400 mb-1">Rôle Principal</label>
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
              <label className="block text-[11px] text-slate-400">Champion Favori / Main (Automatique par Maîtrise Riot)</label>
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
            <label className="block text-[11px] text-slate-400 mb-1">Description / Bio</label>
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
            <label className="block text-xs font-bold text-[#00f0ff]">🌐 Mes Réseaux Sociaux (Débloqués uniquement lors d'un Match)</label>
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
              <span>{isSaving ? 'Enregistrement...' : 'Enregistrer mon Profil'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
