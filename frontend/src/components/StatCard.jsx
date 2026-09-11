import React from 'react';

export default function StatCard({ title, value, subtext, icon: Icon, color = 'gold', trend }) {
  return (
    <div className="glass-panel glass-panel-hover rounded-2xl p-5 relative overflow-hidden group">
      {/* Subtle Glow in background on hover */}
      <div className="absolute -top-10 -right-10 w-28 h-28 bg-gold-500/5 rounded-full blur-2xl group-hover:bg-gold-500/15 transition-all duration-500" />

      <div className="flex items-start justify-between relative z-10">
        <div>
          <p className="text-xs font-semibold tracking-wider text-slate-400 uppercase">{title}</p>
          <h3 className="text-3xl font-black text-slate-100 mt-1.5 font-mono tracking-tight">{value}</h3>
          {subtext && <p className="text-xs text-slate-400 mt-1.5 flex items-center gap-1">{subtext}</p>}
        </div>

        {Icon && (
          <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 group-hover:scale-110 group-hover:border-gold-500/40 transition-all duration-300">
            <Icon className="w-6 h-6" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <span>{trend.label}</span>
          <span className={trend.positive ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
            {trend.value}
          </span>
        </div>
      )}
    </div>
  );
}
