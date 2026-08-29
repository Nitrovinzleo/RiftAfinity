import React from 'react';
import { 
  Sparkles, Heart, Swords, Shield, Compass, Skull, Zap, Users, Ghost 
} from 'lucide-react';

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

export default function ArchetypeCard({ archetype }) {
  if (!archetype) return null;

  const IconComponent = ICON_MAP[archetype.iconName] || Heart;

  return (
    <div className="glass-panel rounded-2xl p-6 sm:p-8 relative overflow-hidden flex flex-col justify-between h-full shadow-xl">
      
      {/* Halo de couleur d'arrière-plan */}
      <div className={`absolute -right-16 -top-16 w-48 h-48 rounded-full bg-gradient-to-br ${archetype.badgeGradient} opacity-20 blur-2xl pointer-events-none`}></div>

      <div>
        {/* Entête Archétype */}
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-3 rounded-xl bg-gradient-to-br ${archetype.badgeGradient} text-white shadow-lg shrink-0`}>
            <IconComponent className="w-6 h-6 fill-white/20" />
          </div>
          <div>
            <span className="text-[10px] uppercase font-bold tracking-widest text-hextech-gold">
              Archétype de Duo
            </span>
            <h3 className="font-display font-bold text-2xl text-white">
              {archetype.title}
            </h3>
          </div>
        </div>

        {/* Sous-titre & Badge */}
        <div className="inline-block px-3 py-1 rounded-full bg-slate-900/80 border border-slate-700 text-hextech-cyan text-xs font-medium mb-4">
          {archetype.subtitle}
        </div>

        {/* Citation thématique */}
        <blockquote className="italic text-sm text-slate-300 border-l-2 border-hextech-pink/60 pl-3 my-3">
          {archetype.quote}
        </blockquote>

        {/* Description psychologique */}
        <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mt-4">
          {archetype.description}
        </p>
      </div>

      {/* Pied de carte d'archétype */}
      <div className="mt-6 pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-500">
        <span>Analyse DuoSync v1.0</span>
        <span className="text-hextech-gold font-medium">Algorithme d'Affinité Riot</span>
      </div>

    </div>
  );
}
