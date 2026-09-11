import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { lostAPI, foundAPI, matchAPI, claimAPI } from '../services/api';
import StatCard from '../components/StatCard';
import StatusBadge from '../components/StatusBadge';
import MatchScoreBadge from '../components/MatchScoreBadge';
import StatusTimeline from '../components/StatusTimeline';
import { 
  PlusCircle, 
  Compass, 
  Search, 
  Sparkles, 
  Layers, 
  FileCheck, 
  ArrowUpRight, 
  Clock, 
  MapPin, 
  Calendar,
  AlertCircle
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [counts, setCounts] = useState({
    lost: 0,
    found: 0,
    matches: 0,
    claims: 0
  });
  const [myLostItems, setMyLostItems] = useState([]);
  const [myMatches, setMyMatches] = useState([]);
  const [myClaims, setMyClaims] = useState([]);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        setLoading(true);
        const [lostRes, foundRes, matchRes, claimRes] = await Promise.all([
          lostAPI.getMy(),
          foundAPI.getMy(),
          matchAPI.getMy(),
          claimAPI.getMy()
        ]);

        if (lostRes.success) setMyLostItems(lostRes.items);
        if (matchRes.success) setMyMatches(matchRes.matches);
        if (claimRes.success) setMyClaims(claimRes.claims);

        setCounts({
          lost: lostRes.items?.length || 0,
          found: foundRes.items?.length || 0,
          matches: matchRes.matches?.length || 0,
          claims: claimRes.claims?.length || 0
        });
      } catch (err) {
        console.error('Failed to load dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  return (
    <div className="space-y-8 pb-12">
      {/* Welcome Banner */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 relative overflow-hidden">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold bg-gold-500/10 text-gold-400 border border-gold-500/20 mb-2 font-mono">
              <span>ACTIVE SESSION • {user?.reg_no}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-100">
              Welcome back, {user?.full_name}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Track your reported items, check high-confidence matches, and file claims for physical recovery.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Link
              to="/report-lost"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-colors flex items-center gap-1.5"
            >
              <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Report Lost</span>
            </Link>
            <Link
              to="/report-found"
              className="px-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Report Found</span>
            </Link>
          </div>
        </div>
      </div>

      {/* 4 Core KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="My Lost Reports"
          value={counts.lost}
          subtext="Active tracking records"
          icon={Layers}
          trend={{ label: 'Database Status', value: 'Live', positive: true }}
        />
        <StatCard
          title="Items I Found"
          value={counts.found}
          subtext="Custody logged for others"
          icon={Compass}
          trend={{ label: 'Campus Honesty', value: 'Recorded', positive: true }}
        />
        <StatCard
          title="Possible Matches"
          value={counts.matches}
          subtext="Calculated match scores"
          icon={Sparkles}
          trend={{ label: 'Matcher Engine', value: `${counts.matches} Identified`, positive: counts.matches > 0 }}
        />
        <StatCard
          title="Active Claims"
          value={counts.claims}
          subtext="Pending verification"
          icon={FileCheck}
          trend={{ label: 'Handover Pipeline', value: 'In Review', positive: true }}
        />
      </div>

      {/* Lifecycle Status Timeline Section */}
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
          <div>
            <h2 className="text-lg font-black text-slate-100">Recovery Workflow Pipeline</h2>
            <p className="text-xs text-slate-400">CampusTrack stages all lost property through 5 verifiable transitions</p>
          </div>
          <span className="text-[11px] font-mono text-gold-400 bg-gold-500/10 px-3 py-1 rounded-lg border border-gold-500/20">
            RELATIONAL STATUS ENGINE
          </span>
        </div>

        <StatusTimeline currentStatus={myLostItems[0]?.status || 'Matched'} />
      </div>

      {/* Quick Action Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link
          to="/report-lost"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-3 group-hover:scale-110 transition-transform">
              <PlusCircle className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">REPORT LOST</h3>
            <p className="text-xs text-slate-400 mt-1">Log misplaced item details into MySQL database</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-gold-400 transition-colors" />
        </Link>

        <Link
          to="/report-found"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-3 group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">REPORT FOUND</h3>
            <p className="text-xs text-slate-400 mt-1">Record custody location of an item you found</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-gold-400 transition-colors" />
        </Link>

        <Link
          to="/search"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-3 group-hover:scale-110 transition-transform">
              <Search className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">SEARCH ITEMS</h3>
            <p className="text-xs text-slate-400 mt-1">Query campus catalog with category & zone filters</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-gold-400 transition-colors" />
        </Link>

        <Link
          to="/matches"
          className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800 flex items-start justify-between group"
        >
          <div>
            <div className="w-10 h-10 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 mb-3 group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="text-sm font-bold text-slate-100">VIEW MATCHES</h3>
            <p className="text-xs text-slate-400 mt-1">Inspect multi-attribute candidate matches & scores</p>
          </div>
          <ArrowUpRight className="w-4 h-4 text-slate-500 group-hover:text-gold-400 transition-colors" />
        </Link>
      </div>

      {/* Split Section: Top Potential Matches & My Active Cases */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left: Top Potential Matches */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                <Sparkles className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-100">Identified Possible Matches</h2>
            </div>
            <Link to="/matches" className="text-xs font-bold text-gold-400 hover:underline">
              View All ({myMatches.length})
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Loading matches from database...</div>
          ) : myMatches.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              No possible matches detected yet for your reports.
            </div>
          ) : (
            <div className="space-y-3">
              {myMatches.slice(0, 3).map((m) => (
                <div key={m.match_id} className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-slate-200 truncate">{m.lost_name}</p>
                      <span className="text-[10px] text-slate-500">↔</span>
                      <p className="text-xs font-bold text-gold-300 truncate">{m.found_name}</p>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" />{m.found_location_name}</span>
                      <span>•</span>
                      <span>{m.category_name}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <MatchScoreBadge score={m.score} size="small" />
                    <Link
                      to="/matches"
                      className="p-1.5 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 transition-colors"
                      title="Inspect match & claim"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right: My Lost Reports Status */}
        <div className="glass-panel rounded-3xl p-6 border border-slate-800/80">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                <Layers className="w-4 h-4" />
              </div>
              <h2 className="text-base font-bold text-slate-100">My Tracked Reports</h2>
            </div>
            <Link to="/my-reports" className="text-xs font-bold text-gold-400 hover:underline">
              View All ({myLostItems.length})
            </Link>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500">Retrieving items...</div>
          ) : myLostItems.length === 0 ? (
            <div className="py-10 text-center text-slate-400 text-xs">
              You haven't filed any lost reports yet. Misplaced something? Click "Report Lost".
            </div>
          ) : (
            <div className="space-y-3">
              {myLostItems.slice(0, 3).map((item) => (
                <div key={item.lost_id} className="p-4 rounded-2xl bg-dark-900/60 border border-slate-800 flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-200 truncate">{item.item_name}</p>
                    <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3 text-slate-500" />{item.location_name}</span>
                      <span>•</span>
                      <span className="flex items-center gap-1"><Calendar className="w-3 h-3 text-slate-500" />{item.date_lost?.split('T')[0]}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <StatusBadge status={item.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
