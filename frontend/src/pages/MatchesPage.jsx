import React, { useState, useEffect } from 'react';
import { matchAPI, claimAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import MatchScoreBadge from '../components/MatchScoreBadge';
import StatusBadge from '../components/StatusBadge';
import { Sparkles, FileCheck, X, ShieldCheck } from 'lucide-react';

export default function MatchesPage() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [claimingMatch, setClaimingMatch] = useState(null);
  const [submittingClaim, setSubmittingClaim] = useState(false);
  const [claimForm, setClaimForm] = useState({ claim_description: '', identifying_marks: '', proof_details: '' });
  const { success, error } = useToast();

  const loadMatches = async () => {
    try {
      setLoading(true);
      const res = await matchAPI.getAll();
      if (res.success) setMatches(res.matches);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMatches(); }, []);

  const handleOpenClaim = (m) => {
    setClaimingMatch(m);
    setClaimForm({ claim_description: `Filing claim for ${m.lost_name} matching found record #${m.found_id}`, identifying_marks: '', proof_details: '' });
  };

  const handleClaimSubmit = async (e) => {
    e.preventDefault();
    if (!claimForm.identifying_marks.trim()) {
      error('Please provide secret identifying marks for verification.');
      return;
    }
    setSubmittingClaim(true);
    try {
      const res = await claimAPI.create({
        match_id: claimingMatch.match_id,
        lost_id: claimingMatch.lost_id,
        found_id: claimingMatch.found_id,
        claim_description: claimForm.claim_description,
        identifying_marks: claimForm.identifying_marks,
        proof_details: claimForm.proof_details
      });
      if (res.success) {
        success('Claim submitted successfully! Administration notified.');
        setClaimingMatch(null);
        loadMatches();
      }
    } catch (err) {
      error(err.message || 'Failed to submit claim.');
    } finally {
      setSubmittingClaim(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-2 font-mono">
              <Sparkles className="w-3.5 h-3.5" />
              <span>100-POINT TRANSPARENT SCORING ENGINE</span>
            </div>
            <h1 className="text-2xl font-black text-slate-100">Possible Matches</h1>
            <p className="text-xs text-slate-400 mt-1">Cross-comparing category (25pts), location (25pts), color (15pts), brand (15pts), description (10pts), date (10pts)</p>
          </div>
          <div className="text-right font-mono text-xs text-slate-400">
            <span className="text-gold-400 font-bold">{matches.length}</span> Active Pairs Identified
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Calculating relational match pairs...</div>
      ) : matches.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">No active matches found.</div>
      ) : (
        <div className="space-y-4">
          {matches.map(m => (
            <div key={m.match_id} className="glass-panel rounded-3xl p-5 sm:p-6 border border-slate-800/80 shadow-lg relative overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800/80">
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono font-bold text-slate-400">MATCH #{m.match_id}</span>
                  <MatchScoreBadge score={m.score} />
                  <StatusBadge status={m.match_status} />
                </div>
                <button onClick={() => handleOpenClaim(m)} className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center gap-1.5">
                  <FileCheck className="w-4 h-4" /><span>Submit Claim</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                <div className="p-4 rounded-2xl bg-dark-900/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30">LOST ITEM #{m.lost_id}</span>
                    <StatusBadge status={m.lost_status} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{m.lost_name}</h3>
                  <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <div className="flex justify-between"><span>Category:</span><span className="text-slate-300">{m.category_name}</span></div>
                    <div className="flex justify-between"><span>Location:</span><span className="text-slate-300">{m.lost_location_name}</span></div>
                    <div className="flex justify-between"><span>Color / Brand:</span><span className="text-slate-300">{m.lost_color} • {m.lost_brand || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Date Lost:</span><span className="font-mono text-slate-300">{m.date_lost?.split('T')[0]}</span></div>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-dark-900/50 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold font-mono uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">FOUND ITEM #{m.found_id}</span>
                    <StatusBadge status={m.found_status} />
                  </div>
                  <h3 className="text-sm font-bold text-slate-100">{m.found_name}</h3>
                  <div className="space-y-1 text-xs text-slate-400 pt-1 border-t border-slate-800/60">
                    <div className="flex justify-between"><span>Category:</span><span className="text-slate-300">{m.category_name}</span></div>
                    <div className="flex justify-between"><span>Found At:</span><span className="text-slate-300">{m.found_location_name}</span></div>
                    <div className="flex justify-between"><span>Color / Brand:</span><span className="text-slate-300">{m.found_color} • {m.found_brand || 'N/A'}</span></div>
                    <div className="flex justify-between"><span>Custody:</span><span className="text-emerald-400 truncate max-w-[200px]">{m.storage_location}</span></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {claimingMatch && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-700 shadow-2xl relative space-y-4">
            <button onClick={() => setClaimingMatch(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            <div>
              <span className="text-[11px] font-mono font-bold text-gold-400 uppercase">MATCH #{claimingMatch.match_id} VERIFICATION</span>
              <h2 className="text-xl font-black text-slate-100 mt-1">File Ownership Claim</h2>
              <p className="text-xs text-slate-400">Item: <span className="text-slate-200 font-bold">{claimingMatch.lost_name}</span></p>
            </div>
            <form onSubmit={handleClaimSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Claim Description *</label>
                <input type="text" required value={claimForm.claim_description} onChange={e => setClaimForm({ ...claimForm, claim_description: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3.5 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1">Secret Identifying Marks (Crucial Proof) *</label>
                <textarea required rows={3} placeholder="Exact serial numbers, internal stickers, scratches, contents inside wallet, phone wallpaper..." value={claimForm.identifying_marks} onChange={e => setClaimForm({ ...claimForm, identifying_marks: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">Additional Proof Details</label>
                <textarea rows={2} placeholder="Retail invoice ID, Bluetooth MAC, Govt ID matching cards inside..." value={claimForm.proof_details} onChange={e => setClaimForm({ ...claimForm, proof_details: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 resize-none" />
              </div>
              <div className="pt-2 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setClaimingMatch(null)} className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white">Cancel</button>
                <button type="submit" disabled={submittingClaim} className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4" /><span>Submit Claim</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
