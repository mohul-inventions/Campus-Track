import React from 'react';
import { Sparkles, ShieldCheck, AlertCircle } from 'lucide-react';

export default function MatchScoreBadge({ score, size = 'default' }) {
  let tier = 'Low Match';
  let badgeStyle = 'bg-slate-800 text-slate-300 border-slate-700';

  if (score >= 90) {
    tier = 'Very High Match';
    badgeStyle = 'bg-gradient-to-r from-gold-500/20 to-amber-500/10 text-gold-400 border-gold-500/40 shadow-glow-sm';
  } else if (score >= 75) {
    tier = 'High Match';
    badgeStyle = 'bg-amber-500/15 text-amber-300 border-amber-500/30';
  } else if (score >= 50) {
    tier = 'Possible Match';
    badgeStyle = 'bg-blue-500/15 text-blue-300 border-blue-500/30';
  }

  const isSmall = size === 'small';

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-lg border font-mono font-bold ${badgeStyle}`}>
      {score >= 90 ? (
        <Sparkles className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-gold-400 animate-spin-slow`} />
      ) : score >= 75 ? (
        <ShieldCheck className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-amber-400`} />
      ) : (
        <AlertCircle className={`${isSmall ? 'w-3.5 h-3.5' : 'w-4 h-4'} text-blue-400`} />
      )}
      <span className={isSmall ? 'text-xs' : 'text-sm'}>{score}%</span>
      <span className="text-slate-400 font-sans font-normal text-xs">• {tier}</span>
    </div>
  );
}
