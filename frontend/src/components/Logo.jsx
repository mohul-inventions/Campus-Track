import React from 'react';
import { Compass, Radio, Target } from 'lucide-react';

export default function Logo({ size = 'default', showSubtitle = true }) {
  const isLarge = size === 'large';
  const isSmall = size === 'small';

  return (
    <div className="flex items-center gap-2.5 select-none">
      <div className={`relative flex items-center justify-center rounded-xl bg-gradient-to-br from-gold-400/20 via-gold-500/10 to-transparent border border-gold-500/30 text-gold-400 shadow-glow-sm ${
        isLarge ? 'w-12 h-12' : isSmall ? 'w-8 h-8' : 'w-10 h-10'
      }`}>
        <Radio className={`${isLarge ? 'w-6 h-6' : isSmall ? 'w-4 h-4' : 'w-5 h-5'} animate-pulse text-gold-400`} />
        <span className="absolute top-1 right-1 w-1.5 h-1.5 rounded-full bg-gold-400 shadow-glow-sm" />
      </div>

      <div className="flex flex-col">
        <div className="flex items-center tracking-tight">
          <span className={`font-black text-slate-100 ${isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-xl'}`}>
            CAMPUS
          </span>
          <span className={`font-black text-gold-400 ml-1 ${isLarge ? 'text-2xl' : isSmall ? 'text-base' : 'text-xl'}`}>
            TRACK
          </span>
        </div>
        {showSubtitle && !isSmall && (
          <span className="text-[10px] font-semibold uppercase tracking-widest text-slate-400 -mt-0.5">
            Lost & Found System
          </span>
        )}
      </div>
    </div>
  );
}
