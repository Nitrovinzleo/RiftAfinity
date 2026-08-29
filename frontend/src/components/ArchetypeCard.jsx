import React from 'react';
import { 
  Sparkles, Heart, Swords, Shield, Compass, Skull, Zap, Users, Ghost 
} from 'lucide-react';
import { translations } from '../utils/translations';

const ICON_MAP = {
  heart_crown: Heart,
  duo_sparkles: Sparkles,
  swords_flame: Swords,
  shield_heart: Shield,
  compass_magic: Compass,
  skull_heart: Skull,
  sparkler: Zap,
  users_shield: Users,
  ghost: Ghost
};

export default function ArchetypeCard({ archetype, currentLang }) {
  const t = translations[currentLang]?.dashboard || translations.fr.dashboard;

  if (!archetype) return null;

  const IconComponent = ICON_MAP[archetype.iconName] || Heart;

  return (
    <div className="glass-panel-vibrant p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
      
      {/* Halo de couleur d'arrière-plan Rose/Cyan */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-[#ff2a85] to-[#00f0ff] opacity-20 blur-2xl pointer-events-none"></div>

      <div>
        {/* Entête Archétype */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3.5 rounded-xl bg-gradient-to-br from-[#ff2a85] via-purple-600 to-[#00f0ff] text-white shadow-lg shrink-0">
            <IconComponent className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-[#ff2a85]">
              {t.archetypeLabel}
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl text-white">
              {archetype.title}
            </h3>
          </div>
        </div>

        {/* Sous-titre & Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-slate-900/90 border border-[#ff2a85]/40 text-[#00f0ff] text-xs font-semibold mb-4">
          {archetype.subtitle}
        </div>

        {/* Citation thématique */}
        <blockquote className="italic text-sm text-slate-300 border-l-2 border-[#ff2a85] pl-3 my-3">
          {archetype.quote}
        </blockquote>

        {/* Description psychologique */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-4 font-sans">
          {archetype.description}
        </p>
      </div>

      {/* Pied de carte d'archétype */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>RiftAffinity v1.0</span>
        <span className="text-[#ff2a85] font-semibold">Riot Games API Engine</span>
      </div>

    </div>
  );
}
