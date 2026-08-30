import React, { useState } from 'react';
import { X, CheckCircle, RefreshCw, Trophy, Shield, User, Heart, Sparkles, AlertCircle } from 'lucide-react';

export default function UserProfileModal({ isOpen, onClose, user, onUserUpdated, onLogout }) {
  const [age, setAge] = useState(user?.age || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [primaryRole, setPrimaryRole] = useState(user?.primaryRole || 'MID');
  const [favoriteChampion, setFavoriteChampion] = useState(user?.favoriteChampion || '');

  const [isVerifying, setIsVerifying] = useState(false);
  const [verifyStatusMsg, setVerifyStatusMsg] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  if (!isOpen || !user) return null;

  const targetIconUrl = `https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.targetIconId || 28}.png`;

  // Vérification style Ori Bot
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
      setVerifyStatusMsg(data.message);

      if (data.isVerified) {
        onUserUpdated({
          ...user,
          isVerified: true,
          rankTier: data.rankTier,
          rankDivision: data.rankDivision,
          rankLp: data.rankLp,
          currentIconId: data.currentIconId
        });
      }
    } catch (err) {
      setVerifyStatusMsg('Erreur lors de la vérification de l\'icône.');
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
          age: age ? parseInt(age) : null,
          bio,
          primaryRole,
          favoriteChampion
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn overflow-y-auto">
      <div className="relative w-full max-w-2xl my-8 p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#00f0ff]/40 shadow-2xl space-y-6">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête du Profil */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 pb-4 border-b border-slate-800">
          <div className="relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 border-[#ff2a85] shadow-lg bg-slate-900 shrink-0">
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/14.10.1/img/profileicon/${user.currentIconId || user.targetIconId || 28}.png`}
              alt="Profile Icon"
              className="w-full h-full object-cover"
              onError={(e) => { e.target.src = targetIconUrl; }}
            />
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 text-xs font-bold">
                  <Shield className="w-3.5 h-3.5" />
                  <span>Non Vérifié</span>
                </span>
              )}
            </div>

            <p className="text-xs text-slate-400">
              Région: <span className="text-slate-200 uppercase font-semibold">{user.region}</span> • Membre RiftAffinity
            </p>
          </div>

          <button
            onClick={onLogout}
            className="px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/60 border border-red-500/40 text-red-300 text-xs font-semibold transition-colors"
          >
            Déconnexion
          </button>
        </div>

        {/* --- SECTION 1 : VÉRIFICATION D'ICÔNE ORI BOT --- */}
        {!user.isVerified && (
          <div className="p-4 sm:p-5 rounded-2xl bg-[#0a0d1d] border border-amber-500/40 space-y-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Vérification de Propriété LoL (Méthode Ori Bot)</span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Pour prouver que vous êtes bien le propriétaire de <strong className="text-white">{user.gameName}#{user.tagLine}</strong>, équipez cette icône d'invocateur dans votre client League of Legends puis cliquez sur le bouton de rafraîchissement :
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
            {user.rankTier ? (
              <span className="text-xs font-bold text-emerald-400">Riot API Synced</span>
            ) : (
              <span className="text-[11px] text-slate-400">Vérifiez votre compte pour synchroniser</span>
            )}
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 flex items-center justify-between">
            <div>
              <span className="font-display font-black text-xl text-white">
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

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Âge</label>
              <input
                type="number"
                placeholder="ex: 22"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
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
            <label className="block text-[11px] text-slate-400 mb-1">Champion Favori / Main</label>
            <input
              type="text"
              placeholder="ex: Ahri, Lucian, Thresh..."
              value={favoriteChampion}
              onChange={(e) => setFavoriteChampion(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
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
