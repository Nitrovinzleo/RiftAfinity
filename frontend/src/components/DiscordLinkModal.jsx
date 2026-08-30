import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, AlertCircle, Loader2, ShieldCheck, X, Mail, Lock, LogIn } from 'lucide-react';

export default function DiscordLinkModal({ token, currentUser, onClose, onOpenAuth, onLinkSuccess }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'confirming' | 'success' | 'error'
  const [pendingData, setPendingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Formulaire de connexion intégré si non connecté
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [showFormOverUser, setShowFormOverUser] = useState(false);

  // Vérification de la validité du jeton temporaire au chargement de la modale
  useEffect(() => {
    if (!token) return;

    const verifyToken = async () => {
      setStatus('loading');
      setErrorMessage('');
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/auth/discord-token/${token}`);
        const data = await res.json();

        if (!res.ok) {
          throw new Error(data.detail || 'Le lien d\'association est invalide ou expiré.');
        }

        setPendingData(data);
        setStatus('ready');
      } catch (err) {
        setErrorMessage(err.message);
        setStatus('error');
      }
    };

    verifyToken();
  }, [token]);

  // Exécution de la confirmation de la liaison avec un token JWT donné
  const executeConfirmLink = async (jwtToken) => {
    setStatus('confirming');
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/auth/confirm-discord-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${jwtToken}`
        },
        body: JSON.stringify({ token })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Erreur lors de l\'association du compte.');
      }

      setSuccessMessage(data.message || 'Compte Discord lié avec succès !');
      setStatus('success');
      if (onLinkSuccess && data.user) {
        onLinkSuccess(data.user);
      }
    } catch (err) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  // Soumission si l'utilisateur est déjà connecté
  const handleConfirmWithCurrentUser = async () => {
    const tokenJWT = localStorage.getItem('riftaffinity_token');
    if (!tokenJWT) {
      setShowFormOverUser(true);
      return;
    }
    await executeConfirmLink(tokenJWT);
  };

  // Connexion directe via Email / Mot de passe puis confirmation
  const handleLoginAndLink = async (e) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Veuillez entrer votre email et mot de passe RiftAffinity.');
      return;
    }

    setIsLoggingIn(true);
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email.trim(), password: password.trim() })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.detail || 'Identifiants RiftAffinity incorrects.');
      }

      // Sauvegarde du jeton et connexion
      localStorage.setItem('riftaffinity_token', data.token);
      if (onLinkSuccess && data.user) {
        onLinkSuccess(data.user);
      }

      // Enchaîner avec la validation de liaison
      await executeConfirmLink(data.token);
    } catch (err) {
      setErrorMessage(err.message);
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 p-6">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête de la Modale */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 mb-3">
            <Link className="w-7 h-7" />
          </div>
          <h3 className="text-xl font-bold text-white">Liaison Sécurisée Discord</h3>
          <p className="text-sm text-slate-400 mt-1">Connectez votre compte RiftAffinity pour valider l'association</p>
        </div>

        {/* Chargement */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-slate-300">Vérification du lien d'association...</p>
          </div>
        )}

        {/* Erreur */}
        {errorMessage && status !== 'loading' && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-2.5 text-red-300 text-xs">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Prêt / Formulaire */}
        {(status === 'ready' || status === 'confirming') && pendingData && (
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-indigo-950/40 border border-indigo-500/20 flex items-center justify-between text-xs">
              <span className="text-slate-400">Compte Discord à lier :</span>
              <span className="font-semibold text-indigo-300">
                @{pendingData.discordTag || pendingData.discordId}
              </span>
            </div>

            {currentUser && !showFormOverUser ? (
              // Utilisateur déjà connecté sur le navigateur
              <div className="space-y-4 pt-1">
                <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700/50 text-xs space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Connecté en tant que :</span>
                    <span className="font-bold text-pink-400">{currentUser.gameName}#{currentUser.tagLine}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Email :</span>
                    <span>{currentUser.email}</span>
                  </div>
                </div>

                <button
                  onClick={handleConfirmWithCurrentUser}
                  disabled={status === 'confirming'}
                  className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {status === 'confirming' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Confirmation en cours...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5" />
                      <span>Confirmer la Liaison</span>
                    </>
                  )}
                </button>

                <button
                  onClick={() => setShowFormOverUser(true)}
                  className="w-full text-center text-xs text-slate-400 hover:text-slate-200 transition-colors pt-1"
                >
                  Se connecter avec un autre compte RiftAffinity
                </button>
              </div>
            ) : (
              // Formulaire de saisie d'identifiants
              <form onSubmit={handleLoginAndLink} className="space-y-3.5 pt-1">
                <div className="text-xs text-slate-300 mb-1">
                  Entrez votre adresse email et mot de passe RiftAffinity pour valider la propriété de votre compte :
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Email RiftAffinity</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="votre.email@exemple.com"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Mot de passe</label>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      required
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isLoggingIn || status === 'confirming'}
                  className="w-full py-3.5 mt-2 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 text-sm"
                >
                  {isLoggingIn || status === 'confirming' ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Connexion & Validation...</span>
                    </>
                  ) : (
                    <>
                      <LogIn className="w-5 h-5" />
                      <span>Valider l'Association</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        )}

        {/* Succès */}
        {status === 'success' && (
          <div className="space-y-4 text-center py-4">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 mb-2">
              <CheckCircle className="w-6 h-6" />
            </div>
            <p className="text-emerald-300 font-medium">{successMessage}</p>
            <p className="text-xs text-slate-400">
              Vous pouvez désormais faire <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">/rafinity @votre_pseudo</code> sur Discord !
            </p>
            <button
              onClick={onClose}
              className="w-full py-3 mt-2 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
