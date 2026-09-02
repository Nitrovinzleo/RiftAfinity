import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import RiotForm from './components/RiotForm';
import LoadingScreen from './components/LoadingScreen';
import ResultDashboard from './components/ResultDashboard';
import AuthModal from './components/AuthModal';
import UserProfileModal from './components/UserProfileModal';
import DuoMatchmakerModal from './components/DuoMatchmakerModal';
import MyMatchesModal from './components/MyMatchesModal';
import DiscordLinkModal from './components/DiscordLinkModal';
import DiscordBotModal from './components/DiscordBotModal';
import AboutUsModal from './components/AboutUsModal';
import PlayerCardExporterModal from './components/PlayerCardExporterModal';
import StatsLandingPage from './components/StatsLandingPage';
import { AlertCircle, RefreshCw, Heart } from 'lucide-react';
import { translations } from './utils/translations';

export default function App() {
  const [currentLang, setCurrentLang] = useState('fr'); // 'fr' | 'en'
  const [activeTab, setActiveTab] = useState('form'); // 'form' | 'stats'
  const [viewState, setViewState] = useState('form'); // 'form' | 'loading' | 'result' | 'error'
  const [resultData, setResultData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [lastSearchInputs, setLastSearchInputs] = useState(null);

  // Authentification, Profil & Matchmaking Utilisateur
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMatchmakerOpen, setIsMatchmakerOpen] = useState(false);
  const [isMyMatchesOpen, setIsMyMatchesOpen] = useState(false);
  const [isDiscordGuideOpen, setIsDiscordGuideOpen] = useState(false);
  const [isAboutUsOpen, setIsAboutUsOpen] = useState(false);
  const [isCardExporterOpen, setIsCardExporterOpen] = useState(false);


  // Liaison Discord DM Token
  const [discordToken, setDiscordToken] = useState(null);
  const [isDiscordLinkOpen, setIsDiscordLinkOpen] = useState(false);

  // Détection automatique du paramètre ?discord_token= dans l'URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tokenParam = params.get('discord_token') || params.get('token');
    if (tokenParam) {
      setDiscordToken(tokenParam);
      setIsDiscordLinkOpen(true);
    }
  }, []);

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
          if (user.restoredMessage) {
            alert(`🎉 ${user.restoredMessage}`);
          }
        } else {

          localStorage.removeItem('riftaffinity_token');
        }
      } catch (err) {
        console.error('Impossible de charger la session utilisateur:', err);
      }
    };

    fetchCurrentUser();
  }, []);

  const [matchCount, setMatchCount] = useState(0);

  // Récupération dynamique du nombre de matchs débloqués pour l'utilisateur connecté
  const fetchMatchesCount = async () => {
    const token = localStorage.getItem('riftaffinity_token');
    if (!token) return;
    try {
      const backendUrl = import.meta.env.VITE_BACKEND_URL || '';
      const res = await fetch(`${backendUrl}/api/matchmaking/matches`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMatchCount(data.length);
      }
    } catch (err) {
      console.error('Erreur de chargement du nombre de matchs:', err);
    }
  };

  useEffect(() => {
    if (currentUser) {
      fetchMatchesCount();
    } else {
      setMatchCount(0);
    }
  }, [currentUser]);

  const handleLogout = () => {
    localStorage.removeItem('riftaffinity_token');
    setCurrentUser(null);
    setMatchCount(0);
    setIsProfileOpen(false);
    setIsMatchmakerOpen(false);
  };

  // Contrôle d'accès au Matchmaking Duo : Connecté + Icône LoL Vérifiée (style Ori Bot)
  const handleOpenMatchmaker = () => {
    if (!currentUser) {
      setIsAuthOpen(true);
      return;
    }
    if (!currentUser.isVerified) {
      alert(
        currentLang === 'fr'
          ? "⚠️ Votre compte League of Legends doit être VÉRIFIÉ pour accéder au Matchmaking Duo ! Équipez l'icône requise dans votre profil."
          : "⚠️ Your League of Legends account must be VERIFIED to access Duo Matchmaking! Equip the required icon in your profile."
      );
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
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'form') {
            setViewState('form');
          }
        }}
        currentLang={currentLang}
        onToggleLang={toggleLanguage}
        currentUser={currentUser}
        matchCount={matchCount}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenProfile={() => setIsProfileOpen(true)}
        onOpenMatchmaker={handleOpenMatchmaker}
        onOpenMyMatches={() => setIsMyMatchesOpen(true)}
      />

      {/* Contenu Principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10">
        
        {/* Banner Notification de Match Duo Débloqué */}
        {currentUser && matchCount > 0 && (
          <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-[#ff2a85]/20 via-[#8a2be2]/20 to-[#00f0ff]/20 border border-[#ff2a85]/50 flex items-center justify-between gap-4 shadow-xl animate-fadeIn">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-[#ff2a85] text-white shadow-md animate-bounce shrink-0">
                <Heart className="w-5 h-5 fill-white text-white" />
              </div>
              <div>
                <h4 className="font-bold text-white text-sm">
                  🎉 {currentLang === 'fr' ? `Vous avez ${matchCount} Match(s) Duo débloqué(s) !` : `You have ${matchCount} Duo Match(es) unlocked!`}
                </h4>
                <p className="text-xs text-slate-300">
                  {currentLang === 'fr' ? 'Consultez les coordonnées et réseaux sociaux de vos partenaires Duo.' : 'Check unlocked contacts and social media of your Duo partners.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsMyMatchesOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#ff2a85] to-[#8a2be2] hover:from-[#ff2a85] hover:to-[#00f0ff] text-white font-bold text-xs shadow-lg shrink-0 transition-all hover:scale-105"
            >
              {currentLang === 'fr' ? 'Voir Mes Matchs 💖' : 'View My Matches 💖'}
            </button>
          </div>
        )}

        {/* Écran Stats & Showcase Landing Page */}
        {activeTab === 'stats' && (
          <StatsLandingPage
            onOpenAuth={() => setIsAuthOpen(true)}
            onOpenMatchmaker={handleOpenMatchmaker}
            currentUser={currentUser}
            currentLang={currentLang}
          />
        )}

        {/* Écran Formulaire */}
        {activeTab === 'form' && viewState === 'form' && (
          <RiotForm
            onSubmit={handleFormSubmit}
            initialValues={lastSearchInputs}
            isLoading={false}
            currentLang={currentLang}
            onOpenDiscordGuide={() => setIsDiscordGuideOpen(true)}
          />
        )}

        {/* Écran Chargement Dynamique */}
        {activeTab === 'form' && viewState === 'loading' && <LoadingScreen currentLang={currentLang} />}

        {/* Écran Tableau de Bord des Résultats */}
        {activeTab === 'form' && viewState === 'result' && (
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

      {/* Modale de Profil Utilisateur (Vérification Riot & Profil Dating LoL) */}
      <UserProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
        user={currentUser}
        currentLang={currentLang}
        onUserUpdated={(updatedUser) => setCurrentUser(updatedUser)}
        onLogout={handleLogout}
        onOpenCardExporter={() => setIsCardExporterOpen(true)}
      />

      {/* Modale Générateur de Carte HD ("Duo Card") */}
      <PlayerCardExporterModal
        isOpen={isCardExporterOpen}
        onClose={() => setIsCardExporterOpen(false)}
        user={currentUser}
        currentLang={currentLang}
      />

      {/* Modale de Matchmaking Duo ("Trouver un Duo") */}
      <DuoMatchmakerModal
        isOpen={isMatchmakerOpen}
        onClose={() => {
          setIsMatchmakerOpen(false);
          fetchMatchesCount();
        }}
        currentUser={currentUser}
        currentLang={currentLang}
        onOpenProfile={() => {
          setIsMatchmakerOpen(false);
          setIsProfileOpen(true);
        }}
      />

      {/* Modale "Mes Matchs & Notifications" */}
      <MyMatchesModal
        isOpen={isMyMatchesOpen}
        onClose={() => {
          setIsMyMatchesOpen(false);
          fetchMatchesCount();
        }}
        currentUser={currentUser}
        currentLang={currentLang}
      />


      {/* Modale d'Association Discord (DM Token Validation) */}
      {isDiscordLinkOpen && (
        <DiscordLinkModal
          token={discordToken}
          currentUser={currentUser}
          onClose={() => setIsDiscordLinkOpen(false)}
          onOpenAuth={() => setIsAuthOpen(true)}
          onLinkSuccess={(updatedUser) => {
            setCurrentUser(updatedUser);
          }}
        />
      )}

      {/* Modale d'Information Discord Bot & Guide */}
      <DiscordBotModal
        isOpen={isDiscordGuideOpen}
        onClose={() => setIsDiscordGuideOpen(false)}
        currentLang={currentLang}
      />

      {/* Modale À Propos de RiftAffinity */}
      <AboutUsModal
        isOpen={isAboutUsOpen}
        onClose={() => setIsAboutUsOpen(false)}
        currentLang={currentLang}
      />

      {/* Pied de page */}
      <Footer 
        currentLang={currentLang}
        onOpenDiscordGuide={() => setIsDiscordGuideOpen(true)} 
        onOpenAboutUs={() => setIsAboutUsOpen(true)} 
      />

    </div>
  );
}
