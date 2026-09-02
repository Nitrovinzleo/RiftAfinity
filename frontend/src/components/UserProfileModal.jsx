import React, { useState, useEffect } from 'react';
import { X, CheckCircle, RefreshCw, Trophy, Shield, Heart, Sparkles, AlertCircle, Camera, Lock, Mail, KeyRound, Trash2, User as UserIcon } from 'lucide-react';
import { getRankEmblemUrl } from '../utils/rankEmblems';
import { translations } from '../utils/translations';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated, onLogout, currentLang = 'en' }) {
  const t = translations[currentLang]?.profile || translations.en.profile;

  const [activeTab, setActiveTab] = useState('profile'); // 'profile' | 'security'

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

  // Changement de mot de passe
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [passwordMsg, setPasswordMsg] = useState({ type: '', text: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Changement d'email
  const [newEmail, setNewEmail] = useState('');
  const [emailConfirmPassword, setEmailConfirmPassword] = useState('');
  const [emailMsg, setEmailMsg] = useState({ type: '', text: '' });
  const [isChangingEmail, setIsChangingEmail] = useState(false);

  // Suppression de compte
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);

  // Synchronisation des états locaux si l'utilisateur est mis à jour depuis le backend
  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || '');
      setSpokenLangs(user.spokenLanguages ? user.spokenLanguages.split(',').map(s => s.trim()) : ['FR', 'EN']);
      setBirthDate(user.birthDate || '');
      setBio(user.bio || '');
      setPrimaryRole(user.primaryRole || 'MID');
      setFavoriteChampion(user.favoriteChampion || '');
      setDiscordTag(user.discordTag || '');
      setInstagramUsername(user.instagramUsername || '');
      setTiktokUsername(user.tiktokUsername || '');
      setTwitchUsername(user.twitchUsername || '');
      setTwitterUsername(user.twitterUsername || '');
    } else {
      setDisplayName('');
      setSpokenLangs(['FR', 'EN']);
      setBirthDate('');
      setBio('');
      setPrimaryRole('MID');
      setFavoriteChampion('');
      setDiscordTag('');
      setInstagramUsername('');
      setTiktokUsername('');
      setTwitchUsername('');
      setTwitterUsername('');
    }
  }, [user]);


  const toggleSpokenLang = (code) => {
    setSpokenLangs(prev => 
      prev.includes(code) ? prev.filter(c => c !== code) : [...prev, code]
    );
  };

  // Empêcher le scroll de la page arrière-plan
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.documentElement.style.overflow = '';
      setShowDeleteConfirm(false);
      setPasswordMsg({ type: '', text: '' });
      setEmailMsg({ type: '', text: '' });
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

  // Changement de mot de passe
  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      setPasswordMsg({ type: 'error', text: currentLang === 'fr' ? 'Veuillez remplir tous les champs.' : 'Please fill out all fields.' });
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setPasswordMsg({ type: 'error', text: currentLang === 'fr' ? 'Les nouveaux mots de passe ne correspondent pas.' : 'New passwords do not match.' });
      return;
    }
    setIsChangingPassword(true);
    setPasswordMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/change-password`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ currentPassword, newPassword })
      });

      const data = await res.json();
      if (res.ok) {
        setPasswordMsg({ type: 'success', text: data.message || (currentLang === 'fr' ? 'Mot de passe modifié avec succès !' : 'Password updated successfully!') });
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
      } else {
        setPasswordMsg({ type: 'error', text: data.detail || (currentLang === 'fr' ? 'Erreur lors du changement de mot de passe.' : 'Password update error.') });
      }
    } catch (err) {
      setPasswordMsg({ type: 'error', text: currentLang === 'fr' ? 'Erreur de connexion au serveur.' : 'Server connection error.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Changement d'email
  const handleChangeEmail = async (e) => {
    e.preventDefault();
    if (!newEmail || !emailConfirmPassword) {
      setEmailMsg({ type: 'error', text: currentLang === 'fr' ? 'Veuillez renseigner la nouvelle adresse e-mail et votre mot de passe.' : 'Please enter your new email and current password.' });
      return;
    }
    setIsChangingEmail(true);
    setEmailMsg({ type: '', text: '' });

    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/change-email`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ newEmail, password: emailConfirmPassword })
      });

      const data = await res.json();
      if (res.ok && data.user) {
        if (data.token) {
          localStorage.setItem('riftaffinity_token', data.token);
        }
        onUserUpdated(data.user);
        setEmailMsg({ type: 'success', text: data.message || (currentLang === 'fr' ? 'Adresse e-mail modifiée avec succès !' : 'Email updated successfully!') });
        setNewEmail('');
        setEmailConfirmPassword('');
      } else {
        setEmailMsg({ type: 'error', text: data.detail || (currentLang === 'fr' ? 'Erreur lors du changement d\'email.' : 'Email update error.') });
      }
    } catch (err) {
      setEmailMsg({ type: 'error', text: currentLang === 'fr' ? 'Erreur de connexion au serveur.' : 'Server connection error.' });
    } finally {
      setIsChangingEmail(false);
    }
  };

  // Annulation de la suppression programmée
  const handleCancelDeletion = async () => {
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/cancel-deletion`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        alert(data.message || (currentLang === 'fr' ? 'La suppression de votre compte a été annulée avec succès !' : 'Account deletion cancelled successfully!'));
      }
    } catch (err) {
      alert(currentLang === 'fr' ? "Erreur lors de l'annulation de la suppression." : "Error cancelling deletion.");
    }
  };

  // Suppression temporaire avec masque de 7 jours (Soft Delete)
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      const token = localStorage.getItem('riftaffinity_token');
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/profile/delete-account`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await res.json();
      if (res.ok && data.user) {
        onUserUpdated(data.user);
        alert(data.message || (currentLang === 'fr' ? 'Votre compte a été masqué pendant 7 jours.' : 'Account scheduled for deletion in 7 days.'));
      } else {
        alert(data.detail || (currentLang === 'fr' ? 'Erreur lors de la suppression du compte.' : 'Account deletion error.'));
      }
    } catch (err) {
      alert(currentLang === 'fr' ? 'Erreur lors de la demande de suppression du compte.' : 'Error deleting account.');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
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

            {/* Badges Automatiques Riot API (💎 High Elo, 🥇 Climber Duo, 🛡️ Support Main, 🐉 Jungler, 🔨 Top Raidboss...) */}
            {user.badges && user.badges.length > 0 && (
              <div className="flex items-center gap-1.5 flex-wrap justify-center sm:justify-start pt-1">
                {user.badges.map((b) => (
                  <span key={b.id} className="px-2.5 py-0.5 rounded-full bg-slate-950 border border-slate-700/80 text-xs font-black text-amber-300 shadow-md">
                    {b.label}
                  </span>
                ))}
              </div>
            )}

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

        {/* Barre de navigation par onglets : Profil vs Sécurité */}
        <div className="flex border-b border-slate-800 gap-2 pt-1">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'profile'
                ? 'bg-slate-900 text-[#00f0ff] border-t border-x border-[#00f0ff]/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <UserIcon className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Mon Profil & Préférences' : 'Profile & Preferences'}</span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-2.5 px-4 text-xs font-bold rounded-t-xl transition-all flex items-center gap-2 ${
              activeTab === 'security'
                ? 'bg-slate-900 text-[#ff2a85] border-t border-x border-[#ff2a85]/40 shadow-lg'
                : 'text-slate-400 hover:text-white hover:bg-slate-900/40'
            }`}
          >
            <Lock className="w-4 h-4" />
            <span>{currentLang === 'fr' ? 'Sécurité & Compte' : 'Security & Account'}</span>
          </button>
        </div>

        {/* --- ONGLET 1 : MON PROFIL & PREFERENCES --- */}
        {activeTab === 'profile' && (
          <div className="space-y-6">
            
            {/* VÉRIFICATION D'ICÔNE */}
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

            {/* RANG AUTOMATIQUE LOL VIA API RIOT */}
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

            {/* FORMULAIRE DE PROFIL DATING LOL */}
            <form onSubmit={handleSaveProfile} className="space-y-4">
              <h4 className="text-xs uppercase font-bold text-slate-400 tracking-wider flex items-center gap-2">
                <Heart className="w-4 h-4 text-[#ff2a85]" />
                <span>{t.matchmakingTitle || "Mon Profil & Préférences Matchmaking"}</span>
              </h4>

              {/* Photo de Profil */}
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

              {/* Pseudo d'Affichage Personnalisé */}
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

              {/* Langues Parlées */}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block text-[11px] text-slate-400">{t.birthDateLabel || "Date de Naissance"}</label>
                    {user?.age !== null && user?.age !== undefined && (
                      <span className="text-[10px] text-[#ff2a85] font-bold">
                        🎂 {user.age} {t.ageCalculated || "ans (calculé)"}
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
                <label className="block text-[11px] text-slate-400 mb-1">{t.favoriteChampLabel || "Champion Favori / Main"}</label>
                <input
                  type="text"
                  placeholder="ex: Ahri, Yasuo..."
                  value={favoriteChampion}
                  onChange={(e) => setFavoriteChampion(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 font-semibold"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{t.bioLabel || "Description / Bio"}</label>
                <textarea
                  rows="3"
                  placeholder="Présentez-vous en quelques mots..."
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                ></textarea>
              </div>

              {/* Réseaux Sociaux */}
              <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
                <label className="block text-xs font-bold text-[#00f0ff]">{t.socialsTitle || "🌐 Mes Réseaux Sociaux (Débloqués lors d'un Match)"}</label>
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
        )}

        {/* --- ONGLET 2 : SÉCURITÉ & COMPTE --- */}
        {activeTab === 'security' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* FORMULAIRE 1 : CHANGER L'EMAIL */}
            <form onSubmit={handleChangeEmail} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <Mail className="w-4 h-4 text-[#00f0ff]" />
                <span>{currentLang === 'fr' ? 'Changer mon adresse e-mail' : 'Change Email Address'}</span>
              </div>

              <div className="text-xs text-slate-400">
                {currentLang === 'fr' ? 'Adresse e-mail actuelle :' : 'Current email:'} <strong className="text-slate-200">{user.email}</strong>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{currentLang === 'fr' ? 'Nouvelle adresse e-mail' : 'New email address'}</label>
                  <input
                    type="email"
                    required
                    placeholder="ex: nouveau.email@gmail.com"
                    value={newEmail}
                    onChange={(e) => setNewEmail(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{currentLang === 'fr' ? 'Mot de passe actuel' : 'Current password'}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={emailConfirmPassword}
                    onChange={(e) => setEmailConfirmPassword(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {emailMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${emailMsg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-red-950/80 border border-red-500/40 text-red-300'}`}>
                  {emailMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingEmail}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-[#00f0ff] hover:text-black border border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChangingEmail ? 'animate-spin' : ''}`} />
                <span>{isChangingEmail ? (currentLang === 'fr' ? 'Mise à jour...' : 'Updating...') : (currentLang === 'fr' ? 'Mettre à jour l\'adresse e-mail' : 'Update Email Address')}</span>
              </button>
            </form>

            {/* FORMULAIRE 2 : CHANGER LE MOT DE PASSE */}
            <form onSubmit={handleChangePassword} className="p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-white font-bold text-sm">
                <KeyRound className="w-4 h-4 text-[#ff2a85]" />
                <span>{currentLang === 'fr' ? 'Changer mon mot de passe' : 'Change Password'}</span>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">{currentLang === 'fr' ? 'Mot de passe actuel' : 'Current password'}</label>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{currentLang === 'fr' ? 'Nouveau mot de passe' : 'New password'}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">{currentLang === 'fr' ? 'Confirmer le nouveau mot de passe' : 'Confirm new password'}</label>
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-xs text-white placeholder-slate-500 font-medium"
                  />
                </div>
              </div>

              {passwordMsg.text && (
                <div className={`p-3 rounded-xl text-xs ${passwordMsg.type === 'success' ? 'bg-emerald-950/80 border border-emerald-500/40 text-emerald-300' : 'bg-red-950/80 border border-red-500/40 text-red-300'}`}>
                  {passwordMsg.text}
                </div>
              )}

              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-[#ff2a85] hover:text-white border border-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isChangingPassword ? 'animate-spin' : ''}`} />
                <span>{isChangingPassword ? (currentLang === 'fr' ? 'Modification...' : 'Updating...') : (currentLang === 'fr' ? 'Enregistrer le nouveau mot de passe' : 'Save New Password')}</span>
              </button>
            </form>

            {/* DANGER ZONE : SUPPRIMER / MASQUER LE COMPTE */}
            <div className="p-4 sm:p-5 rounded-2xl bg-red-950/30 border border-red-500/50 space-y-3">
              <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-red-500" />
                <span>{currentLang === 'fr' ? 'Zone de Danger : Masquage & Suppression du Compte' : 'Danger Zone: Hide & Delete Account'}</span>
              </div>

              {user.scheduledDeletionAt ? (
                <div className="p-3.5 rounded-xl bg-amber-950/80 border border-amber-500/50 text-amber-200 text-xs space-y-2">
                  <p className="font-bold flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>{currentLang === 'fr' ? '⏳ Compte masqué - Suppression programmée dans 7 jours' : '⏳ Account hidden - Deletion scheduled in 7 days'}</span>
                  </p>
                  <p className="text-[11px] text-amber-300/90 leading-relaxed">
                    {currentLang === 'fr'
                      ? 'Votre profil est actuellement masqué et invisible pour les autres joueurs. Si vous ne faites rien, il sera définitivement supprimé. Pour réactiver votre compte, cliquez sur le bouton ci-dessous.'
                      : 'Your profile is hidden from other players. To restore your account, click the button below.'}
                  </p>
                  <button
                    type="button"
                    onClick={handleCancelDeletion}
                    className="w-full py-2.5 px-4 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                  >
                    <span>{currentLang === 'fr' ? 'Annuler la suppression & Réactiver mon profil' : 'Cancel deletion & Restore profile'}</span>
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    {currentLang === 'fr'
                      ? 'La suppression masquera immédiatement votre compte pour les autres joueurs. Vous disposerez de 7 jours de réflexion pour changer d\'avis (annulation automatique en vous reconnectant). Au-delà de 7 jours sans connexion, le compte sera définitivement effacé.'
                      : 'Requesting deletion will immediately hide your profile. You will have 7 days to change your mind by simply logging back in.'}
                  </p>

                  {!showDeleteConfirm ? (
                    <button
                      type="button"
                      onClick={() => setShowDeleteConfirm(true)}
                      className="w-full py-3 px-4 rounded-xl bg-red-950/70 hover:bg-red-900 border border-red-500/60 text-red-200 hover:text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-md"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>{currentLang === 'fr' ? 'Supprimer mon compte (Masquer 7 jours)' : 'Delete my account (Hide 7 days)'}</span>
                    </button>
                  ) : (
                    <div className="p-4 rounded-xl bg-slate-950 border border-red-500 text-center space-y-3 animate-scaleUp">
                      <p className="text-xs font-bold text-red-300">
                        ⚠️ {currentLang === 'fr' ? 'Confirmez-vous le masquage et la suppression de votre compte sous 7 jours ?' : 'Confirm hiding and deleting your account in 7 days?'}
                      </p>
                      
                      <div className="flex items-center justify-center gap-3">
                        <button
                          type="button"
                          onClick={() => setShowDeleteConfirm(false)}
                          className="py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                        >
                          {currentLang === 'fr' ? 'Annuler' : 'Cancel'}
                        </button>
                        
                        <button
                          type="button"
                          onClick={handleDeleteAccount}
                          disabled={isDeletingAccount}
                          className="py-2 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-lg disabled:opacity-50"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>{isDeletingAccount ? (currentLang === 'fr' ? 'Traitement...' : 'Processing...') : (currentLang === 'fr' ? 'Masquer & Programmer Suppression' : 'Hide & Schedule Deletion')}</span>
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>


          </div>
        )}

      </div>
    </div>
  );
}
