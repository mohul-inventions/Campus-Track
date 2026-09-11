import React, { useState, useEffect } from 'react';
import { matchAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import MatchScoreBadge from '../../components/MatchScoreBadge';
import StatusBadge from '../../components/StatusBadge';
import { Sparkles, Check, X, ShieldAlert } from 'lucide-react';

export default function AdminMatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const { success, error } = useToast();

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await matchAPI.getAll();
      if (res.success) setMatches(res.matches);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  const handleVerify = async (id, status) => {
    try {
      const res = await matchAPI.verify(id, status);
      if (res.success) {
        success(res.message);
        fetchMatches();
      }
    } catch (err) {
      error(err.message || 'Action failed.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <h1 className="text-2xl font-black text-slate-100">Match Pair Review & Verification</h1>
        <p className="text-xs text-slate-400 mt-1">Review algorithm-generated scores and verify potential matches before claim processing</p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Retrieving matches...</div>
        ) : matches.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">No matches found.</div>
        ) : (
          matches.map(m => (
            <div key={m.match_id} className="glass-panel rounded-3xl p-5 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">MATCH #{m.match_id}</span>
                  <MatchScoreBadge score={m.score} />
                  <StatusBadge status={m.match_status} />
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="font-bold text-slate-200">Lost: {m.lost_name}</span>
                  <span className="text-slate-500">↔</span>
                  <span className="font-bold text-gold-300">Found: {m.found_name}</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  Category: {m.category_name} • Location: {m.lost_location_name} ↔ {m.found_location_name}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {m.match_status === 'Suggested' ? (
                  <>
                    <button
                      onClick={() => handleVerify(m.match_id, 'Verified')}
                      className="px-3.5 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Verify Match</span>
                    </button>
                    <button
                      onClick={() => handleVerify(m.match_id, 'Rejected')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 border border-rose-500/30 text-xs font-bold flex items-center gap-1 transition-colors"
                    >
                      <X className="w-3.5 h-3.5" />
                      <span>Reject</span>
                    </button>
                  </>
                ) : (
                  <span className="text-xs font-mono text-slate-500">
                    Status: {m.match_status}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
