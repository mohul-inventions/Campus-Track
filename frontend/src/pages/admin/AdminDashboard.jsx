import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminAPI } from '../../services/api';
import StatCard from '../../components/StatCard';
import StatusBadge from '../../components/StatusBadge';
import { 
  Users, 
  Archive, 
  Compass, 
  Sparkles, 
  FileCheck, 
  CheckCircle2, 
  BarChart3, 
  ArrowUpRight,
  Clock,
  ShieldCheck
} from 'lucide-react';

export default function AdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      try {
        setLoading(true);
        const res = await adminAPI.getDashboard();
        if (res.success) setData(res);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, []);

  if (loading) {
    return <div className="py-20 text-center text-slate-500">Compiling database metrics...</div>;
  }

  const kpis = data?.kpis || {};
  const charts = data?.charts || {};
  const recentActivity = data?.recentActivity || [];

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-2 font-mono">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>CAMPUS SECURITY & PROPERTY CUSTODY CENTER</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-100">Executive Control Dashboard</h1>
          <p className="text-xs text-slate-400 mt-1">
            Real-time aggregate analytics, verification queue, and property recovery rate
          </p>
        </div>

        <Link
          to="/admin/analytics"
          className="px-4 py-2 rounded-xl text-xs font-bold bg-gold-500/15 hover:bg-gold-500/25 text-gold-400 border border-gold-500/30 flex items-center gap-1.5 self-start sm:self-auto"
        >
          <BarChart3 className="w-4 h-4" />
          <span>DBMS Viva Queries</span>
        </Link>
      </div>

      {/* 6 Core KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard title="Students" value={kpis.totalStudents} icon={Users} />
        <StatCard title="Lost Items" value={kpis.totalLost} icon={Archive} />
        <StatCard title="Found Items" value={kpis.totalFound} icon={Compass} />
        <StatCard title="Pending Matches" value={kpis.pendingMatches} icon={Sparkles} />
        <StatCard title="Pending Claims" value={kpis.pendingClaims} icon={FileCheck} />
        <StatCard title="Returned Items" value={kpis.returnedItems} icon={CheckCircle2} />
      </div>

      {/* 2 Visual Charts (Category Distribution & Location Hotspots) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Reports by Item Category (SQL GROUP BY)
            </h2>
            <span className="text-[10px] font-mono text-gold-400">LOST vs FOUND</span>
          </div>

          <div className="space-y-3 pt-2">
            {charts.categoryDistribution?.map((cat) => {
              const maxVal = Math.max(...charts.categoryDistribution.map((c) => Math.max(c.lost_count, c.found_count)), 1);
              return (
                <div key={cat.category_name} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-300 truncate max-w-[220px]">{cat.category_name}</span>
                    <span className="font-mono text-slate-400 text-[11px]">
                      <span className="text-amber-400">{cat.lost_count} Lost</span> •{' '}
                      <span className="text-emerald-400">{cat.found_count} Found</span>
                    </span>
                  </div>
                  <div className="h-2 w-full bg-dark-900 rounded-full overflow-hidden flex gap-0.5">
                    <div
                      className="bg-amber-500 rounded-full h-full transition-all duration-500"
                      style={{ width: `${(cat.lost_count / maxVal) * 50}%` }}
                    />
                    <div
                      className="bg-emerald-500 rounded-full h-full transition-all duration-500"
                      style={{ width: `${(cat.found_count / maxVal) * 50}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Location Hotspots */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
              Campus Incident Locations (SQL HAVING)
            </h2>
            <span className="text-[10px] font-mono text-slate-400">HOTSPOTS</span>
          </div>

          <div className="space-y-3 pt-2">
            {charts.locationDistribution?.map((loc) => {
              const total = (loc.lost_count || 0) + (loc.found_count || 0);
              return (
                <div key={loc.location_name} className="p-3 rounded-2xl bg-dark-900/60 border border-slate-800 flex items-center justify-between">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{loc.location_name}</p>
                    <p className="text-[10px] text-slate-400 mt-0.5">{loc.building}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-xs text-gold-400 bg-gold-500/10 px-2.5 py-1 rounded-lg border border-gold-500/20">
                      {total} Incidents
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Recent Activity Feed */}
      <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
          Recent Campus Lost & Found Audit Feed
        </h2>
        <div className="divide-y divide-slate-800/80">
          {recentActivity.map((act, idx) => (
            <div key={idx} className="py-3 flex items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded uppercase ${
                    act.type === 'LOST'
                      ? 'bg-amber-500/15 text-amber-300'
                      : act.type === 'FOUND'
                      ? 'bg-emerald-500/15 text-emerald-300'
                      : 'bg-gold-500/15 text-gold-300'
                  }`}
                >
                  {act.type}
                </span>
                <p className="text-slate-200 font-semibold truncate">{act.title}</p>
                <span className="text-slate-500">• {act.person}</span>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <StatusBadge status={act.status} />
                <span className="text-[10px] text-slate-500 font-mono">
                  {new Date(act.created_at).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
