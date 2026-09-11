import React, { useState, useEffect } from 'react';
import { claimAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { FileCheck, MapPin, Calendar, Clock } from 'lucide-react';

export default function ClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadClaims() {
      try {
        setLoading(true);
        const res = await claimAPI.getMy();
        if (res.success) setClaims(res.claims);
      } catch (err) {} finally {
        setLoading(false);
      }
    }
    loadClaims();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <h1 className="text-2xl font-black text-slate-100">My Filed Claims</h1>
        <p className="text-xs text-slate-400 mt-1">Track verification progress, review admin remarks, and plan physical item collection</p>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Retrieving claims...</div>
      ) : claims.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-2">
          <FileCheck className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-sm font-bold">No claims submitted yet.</p>
          <p className="text-xs text-slate-500">Spot a match in "Possible Matches" and click "Submit Claim".</p>
        </div>
      ) : (
        <div className="space-y-4">
          {claims.map(c => (
            <div key={c.claim_id} className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-slate-400">CLAIM #CLM-{c.claim_id}</span>
                  <h3 className="text-base font-bold text-slate-100 mt-0.5">{c.lost_item_name}</h3>
                </div>
                <StatusBadge status={c.claim_status} />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-gold-400">Identifying Proof Submitted</span>
                  <p className="text-slate-300 font-mono text-[11px] leading-relaxed">{c.identifying_marks}</p>
                </div>
                <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Custody / Handover Location</span>
                  <p className="font-bold text-emerald-400">{c.storage_location}</p>
                  <p className="text-[11px] text-slate-400">Discovered near: {c.location_name}</p>
                </div>
              </div>

              {c.admin_remarks && (
                <div className="p-3.5 rounded-2xl bg-gold-500/10 border border-gold-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase text-gold-400 font-mono block">Campus Administrator Remarks</span>
                  <p className="text-slate-200 mt-1">{c.admin_remarks}</p>
                </div>
              )}

              <div className="text-[11px] text-slate-500 font-mono flex items-center justify-between pt-1">
                <span>Submitted: {new Date(c.created_at).toLocaleDateString()}</span>
                {c.claimed_at && <span className="text-emerald-400 font-bold">Approved: {new Date(c.claimed_at).toLocaleDateString()}</span>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
