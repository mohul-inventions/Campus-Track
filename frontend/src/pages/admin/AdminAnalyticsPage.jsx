import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { BarChart3, Database, Layers, Sparkles, Activity, FileCode } from 'lucide-react';

export default function AdminAnalyticsPage() {
  const [catStats, setCatStats] = useState([]);
  const [locStats, setLocStats] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('procedures'); // 'procedures', 'audit', 'concepts'

  useEffect(() => {
    async function loadAnalytics() {
      try {
        setLoading(true);
        const [cRes, lRes, aRes] = await Promise.all([
          adminAPI.getCategoryAnalytics(),
          adminAPI.getLocationAnalytics(),
          adminAPI.getAuditLogs()
        ]);
        if (cRes.success) setCatStats(cRes.stats || []);
        if (lRes.success) setLocStats(lRes.stats || []);
        if (aRes.success) setAuditLogs(aRes.logs || []);
      } catch (err) {
        console.error('Failed to load DBMS analytics:', err);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-2 font-mono">
            <Database className="w-3.5 h-3.5" />
            <span>DBMS CAPSTONE EVALUATION MODULE</span>
          </div>
          <h1 className="text-2xl font-black text-slate-100">Database Engine Analytics & Audit</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real MySQL Stored Procedures, Relational Views, Trigger-generated Audit Trail, and Transaction Logging
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center p-1 bg-dark-900 rounded-xl border border-slate-800 text-xs">
          <button
            onClick={() => setActiveTab('procedures')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'procedures' ? 'bg-gold-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Stored Procedures
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'audit' ? 'bg-gold-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Audit Trail (Triggers)
          </button>
          <button
            onClick={() => setActiveTab('concepts')}
            className={`px-3.5 py-1.5 rounded-lg font-bold transition-all ${
              activeTab === 'concepts' ? 'bg-gold-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            DBMS Viva Checklist
          </button>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Executing MySQL database routines...</div>
      ) : activeTab === 'procedures' ? (
        <div className="space-y-6">
          {/* Stored Procedure 1: GetCategoryStatistics() */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-gold-400 uppercase">STORED PROCEDURE 1</span>
                <h2 className="text-base font-bold text-slate-100 font-mono">CALL GetCategoryStatistics();</h2>
                <p className="text-xs text-slate-400 mt-0.5">Calculates category-wise lost, found, and recovery counts via LEFT JOIN & GROUP BY</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-900/80 text-[11px] font-mono text-gold-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">ID</th>
                    <th className="py-2.5 px-3">Category Name</th>
                    <th className="py-2.5 px-3 text-center">Total Lost</th>
                    <th className="py-2.5 px-3 text-center">Total Found</th>
                    <th className="py-2.5 px-3 text-center">Resolved Lost</th>
                    <th className="py-2.5 px-3 text-center">Resolved Found</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {catStats.map(c => (
                    <tr key={c.category_id} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 text-slate-500">{c.category_id}</td>
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">{c.category_name}</td>
                      <td className="py-2.5 px-3 text-center text-amber-400 font-bold">{c.total_lost}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400 font-bold">{c.total_found}</td>
                      <td className="py-2.5 px-3 text-center text-sky-400">{c.resolved_lost}</td>
                      <td className="py-2.5 px-3 text-center text-sky-400">{c.resolved_found}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Stored Procedure 2: GetLocationStatistics() */}
          <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-gold-400 uppercase">STORED PROCEDURE 2</span>
                <h2 className="text-base font-bold text-slate-100 font-mono">CALL GetLocationStatistics();</h2>
                <p className="text-xs text-slate-400 mt-0.5">Aggregates campus incident hot-spots using GROUP BY and HAVING total_incidents &gt; 0</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-dark-900/80 text-[11px] font-mono text-gold-400 uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-2.5 px-3">Location Name</th>
                    <th className="py-2.5 px-3">Building</th>
                    <th className="py-2.5 px-3">Zone</th>
                    <th className="py-2.5 px-3 text-center">Lost Count</th>
                    <th className="py-2.5 px-3 text-center">Found Count</th>
                    <th className="py-2.5 px-3 text-center">Total Incidents</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {locStats.map(l => (
                    <tr key={l.location_id} className="hover:bg-slate-800/30 font-mono">
                      <td className="py-2.5 px-3 font-sans font-semibold text-slate-200">{l.location_name}</td>
                      <td className="py-2.5 px-3 text-slate-400 font-sans">{l.building}</td>
                      <td className="py-2.5 px-3 text-slate-500 font-sans">{l.floor_zone}</td>
                      <td className="py-2.5 px-3 text-center text-amber-400">{l.lost_count}</td>
                      <td className="py-2.5 px-3 text-center text-emerald-400">{l.found_count}</td>
                      <td className="py-2.5 px-3 text-center text-gold-400 font-bold">{l.total_incidents}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : activeTab === 'audit' ? (
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80 space-y-4">
          <div>
            <span className="text-[10px] font-mono font-bold text-gold-400 uppercase">TRIGGER-DRIVEN AUDIT TRAIL</span>
            <h2 className="text-base font-bold text-slate-100 font-mono">SELECT * FROM status_audit_log ORDER BY changed_at DESC;</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Entries populated automatically by MySQL triggers <code className="text-gold-400">trg_audit_lost_status</code> and <code className="text-gold-400">trg_audit_claim_status</code>
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-dark-900/80 text-[11px] font-mono text-gold-400 uppercase border-b border-slate-800">
                <tr>
                  <th className="py-2.5 px-3">Log ID</th>
                  <th className="py-2.5 px-3">Entity Type</th>
                  <th className="py-2.5 px-3">Entity ID</th>
                  <th className="py-2.5 px-3">Old Status</th>
                  <th className="py-2.5 px-3">New Status</th>
                  <th className="py-2.5 px-3">Audit Notes</th>
                  <th className="py-2.5 px-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {auditLogs.map(a => (
                  <tr key={a.log_id} className="hover:bg-slate-800/30">
                    <td className="py-2.5 px-3 text-slate-500">#{a.log_id}</td>
                    <td className="py-2.5 px-3"><span className="text-gold-400 font-bold">{a.entity_type}</span></td>
                    <td className="py-2.5 px-3">{a.entity_id}</td>
                    <td className="py-2.5 px-3 text-slate-400">{a.old_status || 'NULL'}</td>
                    <td className="py-2.5 px-3 text-emerald-400 font-bold">{a.new_status}</td>
                    <td className="py-2.5 px-3 font-sans text-slate-300">{a.change_notes}</td>
                    <td className="py-2.5 px-3 text-[11px] text-slate-500">{new Date(a.changed_at).toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        /* DBMS Viva Checklist */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-mono">1. Relational Design & Constraints</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><b>Primary Keys:</b> Auto-increment integer keys across all 8 tables.</li>
              <li><b>Foreign Keys:</b> Enforced referential integrity with ON DELETE CASCADE and RESTRICT.</li>
              <li><b>Constraints:</b> UNIQUE on student email & reg_no, category_name, location_name.</li>
              <li><b>CHECK Constraint:</b> <code>score &gt;= 0 AND score &lt;= 100</code> on matches table.</li>
              <li><b>Normalization:</b> Structured to 3NF eliminating redundant attribute repetition.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-mono">2. Complex Queries & Aggregates</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><b>INNER & LEFT JOIN:</b> Used across all dashboard feeds, reports, and match comparisons.</li>
              <li><b>Aggregate Functions:</b> <code>COUNT(DISTINCT ...)</code>, <code>MAX()</code>, <code>DATEDIFF()</code>.</li>
              <li><b>GROUP BY & HAVING:</b> Category metrics and campus location incident counts filtered by volume.</li>
              <li><b>Subqueries:</b> Correlated match counts and user claim status checks.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-mono">3. Stored Procedures & Views</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><b>active_lost_items:</b> Filters unreturned items joined with student contacts and category names.</li>
              <li><b>available_found_items:</b> Found items awaiting claimant matching or security custody collection.</li>
              <li><b>GetStudentReports(student_id):</b> Multi-result set stored procedure.</li>
              <li><b>GetCategoryStatistics() & GetLocationStatistics():</b> Server-side analytical procedures.</li>
            </ul>
          </div>

          <div className="glass-panel p-6 rounded-3xl border border-slate-800 space-y-3">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gold-400 font-mono">4. Transactions & Triggers</h3>
            <ul className="text-xs text-slate-300 space-y-2 list-disc list-inside leading-relaxed">
              <li><b>ACID Transaction:</b> <code>START TRANSACTION ... FOR UPDATE ... COMMIT / ROLLBACK</code> on claim approvals.</li>
              <li><b>trg_audit_lost_status:</b> Auto-audits status changes into <code>status_audit_log</code>.</li>
              <li><b>trg_audit_claim_status:</b> Tracks lifecycle transitions with timestamp and approver ID.</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
