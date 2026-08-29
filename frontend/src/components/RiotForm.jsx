import React, { useState } from 'react';
import { Heart, Sparkles, Globe, Key, User, ShieldAlert, ArrowRight } from 'lucide-react';
import Logo from './Logo';

const REGIONS = [
  { id: 'euw1', name: 'Europe Ouest (EUW)' },
  { id: 'eun1', name: 'Europe Nord & Est (EUNE)' },
  { id: 'na1', name: 'Amérique du Nord (NA)' },
  { id: 'kr', name: 'Corée (KR)' },
  { id: 'br1', name: 'Brésil (BR)' },
  { id: 'tr1', name: 'Turquie (TR)' },
  { id: 'la1', name: 'Amérique Latine Nord (LAN)' },
  { id: 'la2', name: 'Amérique Latine Sud (LAS)' },
  { id: 'oc1', name: 'Océanie (OCE)' },
  { id: 'jp1', name: 'Japon (JP)' },
];

export default function RiotForm({ onSubmit, onDemoClick, isLoading }) {
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
      setValidationError('Veuillez renseigner le pseudo et le tag (#) pour les deux joueurs.');
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
      <div className="glass-panel-gold rounded-2xl p-6 sm:p-10 shadow-2xl relative overflow-hidden">
        
        {/* Glow de fond decoratif */}
        <div className="absolute -top-24 -left-24 w-60 h-60 bg-hextech-pink/20 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -right-24 w-60 h-60 bg-hextech-cyan/20 rounded-full blur-3xl pointer-events-none"></div>

        {/* Entête du Formulaire avec Logo Officiel au Sommet */}
        <div className="flex flex-col items-center text-center mb-8">
          <Logo size="xl" className="mb-4 animate-float hover:scale-105 transition-transform" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-hextech-pink/10 border border-hextech-pink/30 text-hextech-pink text-xs font-semibold mb-3">
            <span>RiftAffinity • Calculateur d'Affinité LoL</span>
          </div>
          <h2 className="font-display font-bold text-3xl sm:text-4xl text-white tracking-wide mb-2">
            Mesurez Votre Compatibilité
          </h2>
          <p className="text-slate-400 text-sm max-w-md mx-auto">
            Entrez les pseudos de vos deux comptes League of Legends pour analyser l'historique de vos parties jouées ensemble.
          </p>
        </div>

        {/* Message d'erreur de validation */}
        {validationError && (
          <div className="mb-6 p-4 rounded-xl bg-red-950/80 border border-red-500/40 text-red-200 text-sm flex items-center gap-3">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{validationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Grille des 2 Joueurs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Joueur 1 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-hextech-pink font-semibold text-sm">
                <User className="w-4 h-4" />
                <span>Premier Joueur (ex: Invocateur 1)</span>
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Pseudo / Game Name</label>
                  <input
                    type="text"
                    placeholder="ex: Faker"
                    value={p1Name}
                    onChange={(e) => setP1Name(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1">Tag (#)</label>
                  <input
                    type="text"
                    placeholder="ex: KR1 ou 8ï8"
                    value={p1Tag}
                    onChange={(e) => setP1Tag(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Joueur 2 */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-3">
              <div className="flex items-center gap-2 text-hextech-cyan font-semibold text-sm">
                <User className="w-4 h-4" />
                <span>Second Joueur (ex: Partenaire Duo)</span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="block text-[11px] text-slate-400 mb-1">Pseudo / Game Name</label>
                  <input
                    type="text"
                    placeholder="ex: Keria"
                    value={p2Name}
                    onChange={(e) => setP2Name(e.target.value)}
                    className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
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
                    className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-white placeholder-slate-500"
                    required
                  />
                </div>
              </div>
            </div>

          </div>

          {/* Sélection de Région */}
          <div>
            <label className="block text-xs text-slate-300 font-medium mb-1.5 flex items-center gap-2">
              <Globe className="w-3.5 h-3.5 text-hextech-gold" />
              <span>Serveur de Jeu (Région Riot)</span>
            </label>
            <select
              value={region}
              onChange={(e) => setRegion(e.target.value)}
              className="w-full glass-input px-3 py-2.5 rounded-lg text-sm text-white bg-[#090a12] cursor-pointer"
            >
              {REGIONS.map((r) => (
                <option key={r.id} value={r.id} className="bg-[#090a12] text-slate-200">
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
              className="text-xs text-slate-400 hover:text-hextech-gold flex items-center gap-1.5 transition-colors"
            >
              <Key className="w-3.5 h-3.5" />
              <span>{showAdvanced ? 'Masquer la clé API personnalisée' : 'Options avancées (Clé API Riot optionnelle)'}</span>
            </button>

            {showAdvanced && (
              <div className="mt-3 p-3 rounded-lg bg-slate-900/90 border border-slate-800 space-y-2">
                <p className="text-[11px] text-slate-400">
                  Si le serveur backend n'a pas de clé API valide configurée, vous pouvez saisir votre propre clé de développement Riot (<code className="text-hextech-gold">RGAPI-...</code>).
                </p>
                <input
                  type="text"
                  placeholder="RGAPI-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  className="w-full glass-input px-3 py-2 rounded text-xs text-slate-200 font-mono"
                />
              </div>
            )}
          </div>

          {/* Boutons d'Action */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-hextech-pink via-purple-600 to-hextech-cyan text-white font-semibold text-base shadow-love-glow hover:opacity-95 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 group disabled:opacity-50"
            >
              <Heart className="w-5 h-5 fill-white/20 group-hover:scale-110 transition-transform" />
              <span>Analyser notre Compatibilité</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}
