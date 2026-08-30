import React, { useState } from 'react';
import { Heart, Globe, Key, User, ShieldAlert, Sparkles, ArrowRight } from 'lucide-react';
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

export default function RiotForm({ onSubmit, initialValues, isLoading, currentLang }) {
  const t = translations[currentLang]?.form || translations.fr.form;

  const [p1Input, setP1Input] = useState(initialValues?.p1Input || '');
  const [p2Input, setP2Input] = useState(initialValues?.p2Input || '');
  const [region, setRegion] = useState(initialValues?.region || 'euw1');
  const [apiKey, setApiKey] = useState(initialValues?.apiKey || '');
  const [showAdvanced, setShowAdvanced] = useState(!!initialValues?.apiKey);
  const [validationError, setValidationError] = useState('');

  // Auto-détection du Pseudo et du Tag# à partir d'une seule chaîne de texte
  const parseRiotId = (str) => {
    const trimmed = str.trim();
    if (!trimmed) return { gameName: '', tagLine: '' };

    if (trimmed.includes('#')) {
      const hashIndex = trimmed.lastIndexOf('#');
      const gameName = trimmed.substring(0, hashIndex).trim();
      const tagLine = trimmed.substring(hashIndex + 1).trim();
      return { gameName, tagLine };
    }

    // Si pas de # saisi, tag par défaut selon le serveur
    const regionTagMap = {
      euw1: 'EUW',
      eun1: 'EUNE',
      na1: 'NA1',
      kr: 'KR1',
      br1: 'BR1',
      tr1: 'TR1',
      la1: 'LAN',
      la2: 'LAS',
      oc1: 'OCE',
      jp1: 'JP1'
    };

    return {
      gameName: trimmed,
      tagLine: regionTagMap[region] || 'EUW'
    };
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setValidationError('');

    const player1 = parseRiotId(p1Input);
    const player2 = parseRiotId(p2Input);

    if (!player1.gameName || !player2.gameName) {
      setValidationError(t.validationErr);
      return;
    }

    onSubmit(
      {
        player1,
        player2,
        region,
        apiKey: apiKey.trim() || undefined
      },
      { p1Input, p2Input, region, apiKey }
    );
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-2 sm:px-0">
      <div className="glass-panel-vibrant p-5 sm:p-10 shadow-2xl relative overflow-hidden rounded-2xl sm:rounded-3xl">
        
        {/* Halos lumineux Rose & Cyan */}
        <div className="absolute -top-28 -left-28 w-56 h-56 sm:w-72 sm:h-72 bg-[#ff2a85]/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-28 -right-28 w-56 h-56 sm:w-72 sm:h-72 bg-[#00f0ff]/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Entête du Formulaire */}
        <div className="flex flex-col items-center text-center mb-6 sm:mb-8 relative z-10">
          <Logo size="lg" className="sm:hidden mb-3 animate-float" />
          <Logo size="xl" className="hidden sm:block mb-4 animate-float hover:scale-105 transition-transform" />
          
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ff2a85]/15 border border-[#ff2a85]/40 text-[#ff2a85] text-[11px] sm:text-xs font-semibold mb-2.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{t.tagline}</span>
          </div>

          <h2 className="font-display font-black text-2xl sm:text-4xl text-white tracking-wide mb-1.5 sm:mb-2">
            {t.title}
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
            {t.subtitle}
          </p>
        </div>

        {/* Message d'erreur de validation */}
        {validationError && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-xs sm:text-sm flex items-center gap-2.5">
            <ShieldAlert className="w-4 h-4 sm:w-5 sm:h-5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6 relative z-10">
          
          {/* Grille des 2 Joueurs avec UNE SEULE BARRE DE SAISIE PAR JOUEUR */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            
            {/* Joueur 1 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#090b16]/70 border border-[#ff2a85]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#ff2a85] font-bold text-xs sm:text-sm">
                <User className="w-4 h-4" />
                <span>{t.p1Label}</span>
              </div>
              
              <div>
                <label className="block text-[10px] sm:text-[11px] text-slate-400 mb-1">Riot ID (Pseudo#TAG)</label>
                <input
                  type="text"
                  placeholder={t.p1Placeholder}
                  value={p1Input}
                  onChange={(e) => setP1Input(e.target.value)}
                  className="w-full glass-input px-3.5 py-3 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium"
                  required
                />
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#090b16]/70 border border-[#00f0ff]/40 space-y-2">
              <div className="flex items-center gap-2 text-[#00f0ff] font-bold text-xs sm:text-sm">
                <User className="w-4 h-4" />
                <span>{t.p2Label}</span>
              </div>

              <div>
                <label className="block text-[10px] sm:text-[11px] text-slate-400 mb-1">Riot ID (Pseudo#TAG)</label>
                <input
                  type="text"
                  placeholder={t.p2Placeholder}
                  value={p2Input}
                  onChange={(e) => setP2Input(e.target.value)}
                  className="w-full glass-input px-3.5 py-3 rounded-xl text-base sm:text-sm text-white placeholder-slate-500 font-medium"
                  required
                />
              </div>
            </div>

          </div>

          {/* Sélection de Région */}
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5 flex items-center gap-1.5">
              <Globe className="w-3.5 h-3.5 text-[#00f0ff]" />
              <span>{t.regionLabel}</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full glass-input px-3.5 py-3 rounded-xl text-base sm:text-sm text-white bg-[#080912] cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#080912] text-slate-200">
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          {/* Options Avancées (Clé API Riot) */}
          <div className="border-t border-slate-800/80 pt-3">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-slate-400 hover:text-[#ff2a85] flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showAdvanced ? t.advancedHide : t.advancedOptions}</span>
            </button>

            {showAdvanced && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400">
                  {t.apiKeyNotice} (<code className="text-[#ff2a85]">RGAPI-...</code>).
                </p>
                <input
                  type="text"
                  placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded-lg text-base sm:text-xs text-slate-200 font-mono"
                />
              </div>
            )}
          </div>

          {/* Bouton Principal Rose & Cyan */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full btn-pink-cyan py-3.5 sm:py-4 px-5 rounded-xl text-white font-bold text-sm sm:text-base flex items-center justify-center gap-2 group disabled:opacity-50 touch-manipulation"
            >
              <Heart className="w-4 h-4 sm:w-5 sm:h-5 fill-white/20 group-hover:scale-110 transition-transform" />
              <span>{t.submitBtn}</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
