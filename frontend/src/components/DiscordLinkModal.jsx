import React, { useState, useEffect } from 'react';
import { Link, CheckCircle, AlertCircle, Loader2, ShieldCheck, X } from 'lucide-react';

export default function DiscordLinkModal({ token, currentUser, onClose, onOpenAuth, onLinkSuccess }) {
  const [status, setStatus] = useState('loading'); // 'loading' | 'ready' | 'confirming' | 'success' | 'error'
  const [pendingData, setPendingData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

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

  // Exécution de la confirmation de la liaison
  const handleConfirmLink = async () => {
    const tokenJWT = localStorage.getItem('riftaffinity_token');
    if (!tokenJWT) {
      onOpenAuth();
      return;
    }

    setStatus('confirming');
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/auth/confirm-discord-link`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenJWT}`
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
          <h3 className="text-xl font-bold text-white">Liaison de Compte Discord</h3>
          <p className="text-sm text-slate-400 mt-1">Associez votre compte Discord à votre profil RiftAffinity</p>
        </div>

        {/* Chargement */}
        {status === 'loading' && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin mb-3" />
            <p className="text-sm text-slate-300">Vérification du lien sécurisé...</p>
          </div>
        )}

        {/* Erreur */}
        {status === 'error' && (
          <div className="space-y-4">
            <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 text-red-300">
              <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              <p className="text-sm">{errorMessage}</p>
            </div>
            <button
              onClick={onClose}
              className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 font-semibold text-slate-200 transition-colors"
            >
              Fermer
            </button>
          </div>
        )}

        {/* Prêt / Confirmation */}
        {(status === 'ready' || status === 'confirming') && pendingData && (
          <div className="space-y-5">
            <div className="p-4 rounded-xl bg-slate-800/80 border border-slate-700/50 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-slate-400">Compte Discord :</span>
                <span className="font-semibold text-indigo-400">
                  @{pendingData.discordTag || pendingData.discordId}
                </span>
              </div>

              {currentUser ? (
                <div className="flex items-center justify-between text-sm pt-2 border-t border-slate-700/50">
                  <span className="text-slate-400">Compte RiftAffinity :</span>
                  <span className="font-semibold text-pink-400">
                    {currentUser.gameName}#{currentUser.tagLine}
                  </span>
                </div>
              ) : (
                <div className="pt-2 border-t border-slate-700/50 text-amber-400 text-xs flex items-center gap-1.5">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>Vous devez vous connecter à votre compte sur le site pour continuer.</span>
                </div>
              )}
            </div>

            {currentUser ? (
              <button
                onClick={handleConfirmLink}
                disabled={status === 'confirming'}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-indigo-600 to-pink-600 hover:from-indigo-500 hover:to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
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
            ) : (
              <button
                onClick={() => {
                  onClose();
                  onOpenAuth();
                }}
                className="w-full py-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold text-white transition-colors"
              >
                Se Connecter / S'inscrire sur le Site
              </button>
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
              Vous pouvez maintenant utiliser <code className="bg-slate-800 px-1.5 py-0.5 rounded text-indigo-300">/rafinity @votre_pseudo</code> sur Discord !
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
