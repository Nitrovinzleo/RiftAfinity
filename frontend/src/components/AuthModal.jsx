import React, { useState, useEffect } from 'react';
import { X, Lock, Mail, User, ShieldCheck, ArrowRight, AlertCircle } from 'lucide-react';
import Logo from './Logo';

export default function AuthModal({ isOpen, onClose, onAuthSuccess }) {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [riotId, setRiotId] = useState('');
  const [region, setRegion] = useState('euw1');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Verrouillage du scroll d'arrière-plan
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

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsLoading(true);

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';

      const cleanEmail = email.trim().toLowerCase();
      const cleanPassword = password.trim();

      const payload = isLogin
        ? { email: cleanEmail, password: cleanPassword }
        : { email: cleanEmail, password: cleanPassword, riotId: riotId.trim(), region };

      const res = await fetch(`${backendUrl}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      let data = {};
      try {
        data = await res.json();
      } catch (e) {
        data = {};
      }

      if (!res.ok) {
        throw new Error(data.detail || data.message || `Erreur de communication avec le serveur (${res.status}).`);
      }

      // Sauvegarde du jeton JWT et des données utilisateur
      localStorage.setItem('riftaffinity_token', data.token);
      if (data.restoredMessage || data.user?.restoredMessage) {
        alert(`🎉 ${data.restoredMessage || data.user.restoredMessage}`);
      }
      onAuthSuccess(data.user);
      onClose();

    } catch (err) {
      setErrorMsg(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-md p-6 sm:p-8 rounded-3xl glass-panel-vibrant border border-[#ff2a85]/40 shadow-2xl overflow-hidden">
        
        {/* Bouton de fermeture */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900/80 hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Entête Modal */}
        <div className="flex flex-col items-center text-center mb-6">
          <Logo size="md" className="mb-3" />
          <h3 className="font-display font-black text-2xl text-white">
            {isLogin ? 'Connexion à RiftAffinity' : 'Créer votre Compte'}
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            {isLogin ? 'Accédez à votre profil et votre badge vérifié LoL' : 'Rejoignez la communauté de rencontres & affinité LoL'}
          </p>
        </div>

        {/* Indication Sécurité Chiffrement */}
        <div className="mb-5 p-2.5 rounded-xl bg-emerald-950/40 border border-emerald-500/30 text-emerald-300 text-[11px] flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 shrink-0 text-emerald-400" />
          <span>🔒 Données 100% Chiffrées & Sécurisées</span>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          {/* Email */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Adresse E-mail</label>
            <div className="relative">
              <Mail className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="email"
                placeholder="votre.email@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          {/* Mot de passe */}
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Mot de Passe</label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                required
              />
            </div>
          </div>

          {/* Champs Inscription (Riot ID + Région) */}
          {!isLogin && (
            <>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Votre Riot ID (Pseudo#TAG)</label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3.5 top-3 text-[#ff2a85]" />
                  <input
                    type="text"
                    placeholder="ex: Faker#KR1"
                    value={riotId}
                    onChange={(e) => setRiotId(e.target.value)}
                    className="w-full glass-input pl-10 pr-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500 font-medium"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Serveur de Jeu (Région)</label>
                <select
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white bg-[#080912]"
                >
                  <option value="euw1">Europe West (EUW)</option>
                  <option value="eun1">Europe Nordic & East (EUNE)</option>
                  <option value="na1">North America (NA)</option>
                  <option value="kr">Korea (KR)</option>
                </select>
              </div>
            </>
          )}

          {/* Bouton de Soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-pink-cyan py-3 px-4 rounded-xl text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <span>{isLogin ? 'Se Connecter' : 'Créer mon Compte'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

        </form>

        {/* Bascule Connexion / Inscription */}
        <div className="mt-5 text-center text-xs text-slate-400">
          {isLogin ? "Vous n'avez pas encore de compte ?" : "Vous avez déjà un compte ?"}
          <button
            onClick={() => { setIsLogin(!isLogin); setErrorMsg(''); }}
            className="ml-1.5 font-bold text-[#00f0ff] hover:underline"
          >
            {isLogin ? "S'inscrire" : "Se connecter"}
          </button>
        </div>

      </div>
    </div>
  );
}
