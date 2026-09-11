import React from 'react';

export default function StatusBadge({ status }) {
  const getStyles = () => {
    switch (status?.toLowerCase()) {
      case 'lost':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'found':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'matched':
        return 'bg-violet-500/10 text-violet-400 border-violet-500/30';
      case 'claimed':
        return 'bg-sky-500/10 text-sky-400 border-sky-500/30';
      case 'approved':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'rejected':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'pending':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'verified':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'suggested':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/30';
      case 'closed':
      default:
        return 'bg-slate-800/60 text-slate-400 border-slate-700/60';
    }
  };

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${getStyles()}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}
