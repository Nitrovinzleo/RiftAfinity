import React, { useState } from 'react';
import { Heart, Globe, Key, User, ShieldAlert, Flame, ArrowRight } from 'lucide-react';
import Logo from './Logo';
import { translations } from '../utils/translations';

const REGIONS = [
  { id: 'euw1', name: 'Europe West (EUW)' },
  { id: 'eun1', name: 'Europe Nordic & East (EUNE)' },
  { id: 'na1', name: 'North America (NA)' },
  { id: 'kr', name: 'Korea (KR)' },
  { id: 'br1', name: 'Brazil (BR)' },
  { id: 'tr1', name: 'Turkey (TR)' },
  { id: 'la1', name: 'Latin America North (LAN)' },
  { id: 'la2', name: 'Latin America South (LAS)' },
  { id: 'oc1', name: 'Oceania (OCE)' },
  { id: 'jp1', name: 'Japan (JP)' },
];

export default function RiotForm({ onSubmit, isLoading, currentLang }) {
  const t = translations[currentLang]?.form || translations.fr.form;

  const [p1Name, setP1Name] = useState('');
  const [p1Tag, setP1Tag] = useState('');
  const [p2Name, setP2Name] = useState('');
  const [p2Tag, setP2Tag] = useState('');
  const [region, setRegion] = useState('euw1');
  const [apiKey, setApiKey] = useState('');
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [validationError, setValidationError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    if (!p1Name.trim() || !p1Tag.trim() || !p2Name.trim() || !p2Tag.trim()) {
      setValidationError(t.validationErr);
      return;
    }

    onSubmit({
      player1: { gameName: p1Name.trim(), tagLine: p1Tag.trim().replace('#', '') },
      player2: { gameName: p2Name.trim(), tagLine: p2Tag.trim().replace('#', '') },
      region,
      apiKey: apiKey.trim() || undefined
    });
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      <div className="tinder-card p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fond Tinder */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-[#fd267d]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-[#ff6036]/15 rounded-full blur-3xl pointer-events-none"></div>

        {/* Entête du Formulaire avec Logo Tinder-Style */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" className="mb-4 animate-float hover:scale-105 transition-transform" />
          
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#fd267d]/10 border border-[#fd267d]/30 text-[#fd267d] text-xs font-semibold mb-3">
            <Flame className="w-3.5 h-3.5 fill-[#fd267d]" />
            <span>{t.tagline}</span>
          </div>

          <h2 className="font-display font-black text-3xl sm:text-4xl text-white tracking-wide mb-2">
            {t.title}
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            {t.subtitle}
          </p>
        </div>

        {/* Message d'erreur de validation */}
        {validationError && (
          <div className="mb-6 p-4 rounded-2xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grille des 2 Joueurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Joueur 1 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-[#fd267d] font-bold text-sm">
                <User className="w-4 h-4" />
                <span>{t.p1Label}</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Game Name</label>
                  <input
                    type="text"
                    placeholder={t.pseudoPlaceholder}
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tag (#)</label>
                  <input
                    type="text"
                    placeholder={t.tagPlaceholder}
                    value={p1Tag}
                    onChange={(e) => setP1Tag(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-[#ff6036] font-bold text-sm">
                <User className="w-4 h-4" />
                <span>{t.p2Label}</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Game Name</label>
                  <input
                    type="text"
                    placeholder="ex: Keria"
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tag (#)</label>
                  <input
                    type="text"
                    placeholder="ex: T1"
                    value={p2Tag}
                    onChange={(e) => setP2Tag(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-xl text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sélection de Région */}
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-[#ff6036]" />
              <span>{t.regionLabel}</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full glass-input px-3.5 py-2.5 rounded-xl text-sm text-white bg-[#0d0f17] cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#0d0f17] text-slate-200">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Options Avancées (Clé API Riot) */}
          <div className="border-t border-slate-800/80 pt-4">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-[#fd267d] flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showAdvanced ? t.advancedHide : t.advancedOptions}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400">
                  {t.apiKeyNotice} (<code className="text-[#fd267d]">RGAPI-...</code>).
                </p>
                <input
                  type="text"
                  placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-xs text-slate-200 font-mono"
                />
              </div>
            )}
          </div>

          {/* Bouton Principal Style Tinder */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full tinder-btn py-4 px-6 rounded-2xl text-white font-bold text-base flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Heart className="w-5 h-5 fill-white/20 group-hover:scale-110 transition-transform" />
              <span>{t.submitBtn}</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
