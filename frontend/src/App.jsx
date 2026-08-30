import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RiotForm from './components/RiotForm';
import LoadingScreen from './components/LoadingScreen';
import ResultDashboard from './components/ResultDashboard';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import DuoMatchmakerModal from './components/DuoMatchmakerModal';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { translations } from './utils/translations';

export default function App() {
  const [currentLang, setCurrentLang] = useState('fr'); // 'fr' | 'en'
  const [viewState, setViewState] = useState('form'); // 'form' | 'loading' | 'result' | 'error'
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSearchInputs, setLastSearchInputs] = useState(null);

  // Authentification, Profil & Matchmaking Utilisateur
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);

  const t = translations[currentLang]?.error || translations.fr.error;

  const toggleLanguage = () => {
    setCurrentLang((prev) => (prev === 'fr' ? 'en' : 'fr'));
  };

  // Chargement automatique du profil utilisateur s'il possède un jeton JWT
  useEffect(() => {
    const fetchCurrentUser = async () => {
      const token = localStorage.getItem('riftaffinity_token');
      if (!token) return;

      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
        const res = await fetch(`${backendUrl}/api/auth/me`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const user = await res.json();
          setCurrentUser(user);
        } else {
          localStorage.removeItem('riftaffinity_token');
        }
      } catch (err) {
        console.error('Impossible de charger la session utilisateur:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('riftaffinity_token');
    setCurrentUser(null);
    setIsProfileOpen(false);
    setIsMatchmakerOpen(false);
  };

  // Contrôle d'accès strict au Matchmaking : Connecté + Compte LoL Vérifié
  const handleOpenMatchmaker = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!currentUser.isVerified) {
      alert("⚠️ Votre compte League of Legends doit être VÉRIFIÉ pour accéder au Matchmaking Duo ! Équipez l'icône requise dans votre profil.");
      setIsProfileOpen(true);
      return;
    }
    setIsMatchmakerOpen(true);
  };

  // Envoi de la requête au backend FastAPI
  const handleFormSubmit = async (formData, rawInputs) => {
    setLastSearchInputs(rawInputs);
    setViewState('loading');
    setErrorMessage('');

    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const response = await fetch(`${backendUrl}/api/compatibility`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Erreur lors de l\'analyse du duo.');
      }

      setResultData(data);
      setViewState('result');
    } catch (err) {
      console.error('Erreur d\'analyse:', err);
      setErrorMessage(err.message || 'Impossible de se connecter au serveur backend.');
      setViewState('error');
    }
  };

  const handleReset = () => {
    setViewState('form');
    setResultData(null);
    setErrorMessage('');
  };

  return (
    <div className="min-h-screen flex flex-col justify-between">
      
      {/* Barre de navigation sticky */}
      <Navbar
        onReset={handleReset}
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMatchmaker={handleOpenMatchmaker}
      />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Écran Formulaire */}
        {viewState === 'form' && (
          <RiotForm
            onSubmit={handleFormSubmit}
            initialValues={lastSearchInputs}
            isLoading={false}
            currentLang={currentLang}
          />
        )}

        {/* Écran Chargement Dynamique */}
        {viewState === 'loading' && <LoadingScreen currentLang={currentLang} />}

        {/* Écran Tableau de Bord des Résultats */}
        {viewState === 'result' && (
          <ResultDashboard result={resultData} onReset={handleReset} currentLang={currentLang} />
        )}

        {/* Écran d'Erreur */}
        {viewState === 'error' && (
          <div className="max-w-lg mx-auto my-12 p-8 rounded-xl clean-card text-center space-y-5 shadow-xl border-red-500/30">
            <div className="w-12 h-12 rounded-full bg-red-500/10 text-red-400 flex items-center justify-center mx-auto border border-red-500/30">
              <AlertCircle className="w-6 h-6" />
            </div>
            
            <div className="space-y-1">
              <h3 className="font-display font-bold text-2xl text-white">
                {t.title}
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
                {errorMessage}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-left text-xs space-y-2 text-slate-400">
              <div className="font-semibold text-amber-400">{t.howToFix}</div>
              <ul className="list-disc list-inside space-y-1 text-[11px]">
                <li>{t.step1}</li>
                <li>{t.step2}</li>
              </ul>
            </div>

            <div className="pt-2">
              <button
                onClick={handleReset}
                className="w-full py-3.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-4 h-4" />
                <span>{t.retryBtn}</span>
              </button>
            </div>
          </div>
        )}

      </main>

      {/* Modale d'Authentification (Inscription / Connexion) */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          setIsProfileOpen(true);
        }}
      />

      {/* Modale de Profil Utilisateur (Vérification Ori Bot & Profil Dating LoL) */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        currentLang={currentLang}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
      />

      {/* Modale de Matchmaking Duo ("Trouver un Duo") */}
      <DuoMatchmakerModal
        isOpen={isMatchmakerOpen}
        onClose={() => setIsMatchmakerOpen(false)}
        currentUser={currentUser}
        onOpenProfile={() => {
          setIsMatchmakerOpen(false);
          setIsProfileOpen(true);
        }}
      />

      {/* Pied de page */}
      <Footer />

    </div>
  );
}
