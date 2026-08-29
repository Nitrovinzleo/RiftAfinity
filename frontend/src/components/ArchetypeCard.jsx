import React from 'react';
import { 
  Sparkles, Heart, Swords, Shield, Compass, Skull, Zap, Users, Ghost, Flame 
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
    <div className="tinder-card-glow p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between h-full shadow-2xl">
      
      {/* Halo de couleur d'arrière-plan Tinder */}
      <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br from-[#fd267d] to-[#ff6036] opacity-25 blur-2xl pointer-events-none"></div>

      <div>
        {/* Entête Archétype */}
        <div className="flex items-center gap-3.5 mb-4">
          <div className="p-3.5 rounded-2xl bg-gradient-to-br from-[#fd267d] to-[#ff6036] text-white shadow-lg shrink-0">
            <IconComponent className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-black tracking-widest text-[#fd267d] flex items-center gap-1">
              <Flame className="w-3 h-3 fill-[#fd267d]" />
              <span>{t.archetypeLabel}</span>
            </span>
            <h3 className="font-display font-black text-2xl sm:text-3xl text-white">
              {archetype.title}
            </h3>
          </div>
        </div>

        {/* Sous-titre & Badge */}
        <div className="inline-block px-3.5 py-1 rounded-full bg-slate-900/90 border border-[#fd267d]/30 text-[#fd267d] text-xs font-semibold mb-4">
          {archetype.subtitle}
        </div>

        {/* Citation thématique */}
        <blockquote className="italic text-sm text-slate-300 border-l-2 border-[#ff6036] pl-3 my-3">
          {archetype.quote}
        </blockquote>

        {/* Description psychologique */}
        <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mt-4 font-sans">
          {archetype.description}
        </p>
      </div>

      {/* Pied de carte d'archétype */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>RiftAffinity LoL</span>
        <span className="text-[#fd267d] font-semibold">Match Chemistry Engine</span>
      </div>

    </div>
  );
}
