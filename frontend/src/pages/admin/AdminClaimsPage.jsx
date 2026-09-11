import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import ConfirmModal from '../../components/ConfirmModal';
import { ShieldCheck, CheckCircle2, XCircle, Archive, User, FileText, Check, X, AlertCircle } from 'lucide-react';

export default function AdminClaimsPage() {
  const [claims, setClaims] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaim, setSelectedClaim] = useState(null);
  const [actionType, setActionType] = useState(null); // 'Approve', 'Reject', 'Close'
  const [remarks, setRemarks] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const { success, error } = useToast();

  const fetchClaims = async () => {
    try {
      setLoading(true);
      const res = await adminAPI.getAllClaims();
      if (res.success) setClaims(res.claims);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClaims();
  }, []);

  const handleAction = async () => {
    setActionLoading(true);
    try {
      if (actionType === 'Close') {
        const res = await adminAPI.closeCase(selectedClaim.claim_id, remarks || 'Physical handover confirmed with ID check.');
        if (res.success) {
          success(res.message);
          setSelectedClaim(null);
          fetchClaims();
        }
      } else {
        const res = await adminAPI.reviewClaim(selectedClaim.claim_id, actionType, remarks);
        if (res.success) {
          success(res.message);
          setSelectedClaim(null);
          fetchClaims();
        }
      }
    } catch (err) {
      error(err.message || 'Transaction failed.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-mono font-bold text-gold-400 bg-gold-500/10 px-2.5 py-0.5 rounded border border-gold-500/20">
            ACID TRANSACTION CONTROLLER
          </span>
        </div>
        <h1 className="text-2xl font-black text-slate-100">Claims Verification & Handover Center</h1>
        <p className="text-xs text-slate-400 mt-1">
          Review claimant submitted identifying marks. Approval automatically synchronizes Claim, Lost, and Found entity states in MySQL.
        </p>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="py-20 text-center text-slate-500">Retrieving claims queue...</div>
        ) : claims.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400">No active claims found.</div>
        ) : (
          claims.map(c => (
            <div key={c.claim_id} className="glass-panel rounded-3xl p-6 border border-slate-800/80 shadow-lg space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-400">CLAIM #CLM-{c.claim_id}</span>
                    <span className="text-xs text-slate-500">•</span>
                    <span className="text-xs font-bold text-slate-200">{c.claimant_name} ({c.claimant_reg_no})</span>
                  </div>
                  <h3 className="text-base font-bold text-gold-300 mt-1">{c.lost_name}</h3>
                </div>

                <div className="flex items-center gap-3">
                  <StatusBadge status={c.claim_status} />
                  {c.claim_status === 'Pending' && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => { setSelectedClaim(c); setActionType('Approve'); setRemarks('Physical proof & serial marks verified by security officer.'); }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-500 text-dark-950 font-bold text-xs hover:bg-emerald-400 transition-colors shadow-glow-sm flex items-center gap-1"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve Claim</span>
                      </button>
                      <button
                        onClick={() => { setSelectedClaim(c); setActionType('Reject'); setRemarks('Identifying marks did not match physical inspect.'); }}
                        className="px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-bold hover:bg-rose-500/30 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}

                  {c.claim_status === 'Approved' && (
                    <button
                      onClick={() => { setSelectedClaim(c); setActionType('Close'); setRemarks('Item physically handed over and receipt signed.'); }}
                      className="px-3.5 py-1.5 rounded-xl bg-sky-500 text-dark-950 font-bold text-xs hover:bg-sky-400 transition-colors flex items-center gap-1.5"
                    >
                      <Archive className="w-3.5 h-3.5" />
                      <span>Close Handed-Over Case</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Submitted Proof Card */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-1.5">
                  <span className="text-[10px] font-mono font-bold uppercase text-gold-400">Claimant Submitted Identifying Proof</span>
                  <p className="text-slate-200 font-mono text-[11px] leading-relaxed">{c.identifying_marks}</p>
                  {c.proof_details && <p className="text-[11px] text-slate-400 pt-1">Additional: {c.proof_details}</p>}
                </div>

                <div className="p-3.5 rounded-2xl bg-dark-900/60 border border-slate-800 space-y-1">
                  <span className="text-[10px] font-mono font-bold uppercase text-slate-400">Student & Contact Details</span>
                  <p className="text-slate-200 font-semibold">{c.claimant_name} • {c.claimant_department}</p>
                  <p className="text-slate-400 font-mono">{c.claimant_email} • {c.claimant_phone}</p>
                  <p className="text-emerald-400 pt-1 font-semibold">Custody: {c.storage_location}</p>
                </div>
              </div>

              {c.admin_remarks && (
                <div className="p-3 rounded-xl bg-gold-500/10 border border-gold-500/20 text-xs">
                  <span className="text-[10px] font-bold uppercase text-gold-400 font-mono">Remarks Recorded in MySQL:</span>
                  <p className="text-slate-200 mt-0.5">{c.admin_remarks}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Confirmation Modal */}
      {selectedClaim && (
        <ConfirmModal
          isOpen={!!selectedClaim}
          onClose={() => setSelectedClaim(null)}
          onConfirm={handleAction}
          loading={actionLoading}
          title={`${actionType === 'Approve' ? 'Approve & Return Item' : actionType === 'Close' ? 'Close Handover Case' : 'Reject Claim'}`}
          message={
            actionType === 'Approve'
              ? `Executing ACID transaction for Claim #CLM-${selectedClaim.claim_id}. This will mark the claim as Approved, synchronize Lost item and Found item statuses to Claimed, verify the match, and auto-reject any other competing claims on this item.`
              : actionType === 'Close'
              ? `Archive and close case for Claim #CLM-${selectedClaim.claim_id}. This permanently marks the item state as Closed following physical custody handover.`
              : `Reject Claim #CLM-${selectedClaim.claim_id} for ${selectedClaim.lost_name}.`
          }
          confirmText={actionType === 'Approve' ? 'Execute Approval Transaction' : actionType === 'Close' ? 'Execute Case Closure' : 'Confirm Rejection'}
          confirmVariant={actionType === 'Reject' ? 'danger' : 'gold'}
        />
      )}
    </div>
  );
}
