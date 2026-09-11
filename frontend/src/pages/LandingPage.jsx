import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  PlusCircle, 
  Compass, 
  Search, 
  Sparkles, 
  ShieldCheck, 
  Database, 
  ArrowRight, 
  CheckCircle2, 
  Layers, 
  Clock, 
  MapPin, 
  Cpu,
  Lock,
  ChevronRight
} from 'lucide-react';
import { metaAPI } from '../services/api';
import Logo from '../components/Logo';
import StatusTimeline from '../components/StatusTimeline';

export default function LandingPage() {
  const [stats, setStats] = useState({
    totalLost: 20,
    totalFound: 20,
    totalResolved: 4,
    activeUsers: 17,
    recoveryRate: 20
  });

  useEffect(() => {
    async function loadStats() {
      try {
        const res = await metaAPI.getPublicStats();
        if (res.success) setStats(res.stats);
      } catch (err) {
        // Fallback to loaded defaults
      }
    }
    loadStats();
  }, []);

  const workflowSteps = [
    {
      step: '01',
      title: 'Report Lost Item',
      desc: 'Submit detailed description, category, brand, and campus landmark where item was misplaced.',
      icon: PlusCircle,
      badge: 'Step 1: Record'
    },
    {
      step: '02',
      title: 'Found Item Logged',
      desc: 'Campus community or security registers found items with custody location and timestamp.',
      icon: Compass,
      badge: 'Step 2: Secure'
    },
    {
      step: '03',
      title: 'Intelligent Match Engine',
      desc: 'Rule-based scoring algorithm evaluates category, location, color, brand, and date proximity up to 100%.',
      icon: Sparkles,
      badge: 'Step 3: Score'
    },
    {
      step: '04',
      title: 'Verification & Claim',
      desc: 'Claimant submits unique identifying marks and proof. Admin verifies and runs atomic approval transaction.',
      icon: ShieldCheck,
      badge: 'Step 4: Verify'
    },
    {
      step: '05',
      title: 'Safe Handover & Closure',
      desc: 'Verified owner collects item with physical receipt; system updates state from Claimed to Closed.',
      icon: CheckCircle2,
      badge: 'Step 5: Resolve'
    }
  ];

  return (
    <div className="min-h-screen bg-dark-950 text-slate-100 relative overflow-hidden bg-grid-pattern">
      {/* Ambient background glow effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-b from-gold-500/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />
      <div className="absolute top-96 right-[-100px] w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-24 pb-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Project Tag */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-gold-500/10 border border-gold-500/30 text-gold-400">
            <Database className="w-3.5 h-3.5" />
            <span>DBMS Capstone Project • Relational MySQL 8.0 Architecture</span>
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight text-slate-100 leading-none">
            CAMPUS <span className="text-transparent bg-clip-text bg-gradient-to-r from-gold-400 via-amber-400 to-amber-200">TRACK</span>
          </h1>

          <p className="text-xl sm:text-2xl font-medium text-slate-300">
            Lost something? Found something? Track it down.
          </p>

          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            The unified digital registry replacing scattered WhatsApp groups, lost notice boards, and manual logs. Powered by automated multi-attribute matching, verification workflow, and real-time database auditing.
          </p>

          {/* CTA Buttons */}
          <div className="pt-4 flex flex-wrap items-center justify-center gap-4">
            <Link
              to="/report-lost"
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-slate-900 hover:bg-slate-800 text-slate-100 border border-slate-700/80 shadow-lg hover:border-slate-600 transition-all flex items-center gap-2 group"
            >
              <PlusCircle className="w-4 h-4 text-amber-400 group-hover:scale-110 transition-transform" />
              <span>Report Lost Item</span>
            </Link>

            <Link
              to="/report-found"
              className="px-7 py-3.5 rounded-2xl text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-md transition-all flex items-center gap-2 group"
            >
              <Compass className="w-4 h-4 text-dark-950 group-hover:rotate-45 transition-transform" />
              <span>Report Found Item</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Link>

            <Link
              to="/search"
              className="px-5 py-3.5 rounded-2xl text-sm font-semibold glass-panel hover:border-gold-500/40 text-slate-300 hover:text-white transition-colors flex items-center gap-2"
            >
              <Search className="w-4 h-4 text-gold-400" />
              <span>Browse Registry</span>
            </Link>
          </div>
        </motion.div>

        {/* Live Real-time Stats Grid */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-5xl mx-auto"
        >
          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl sm:text-4xl font-black font-mono text-amber-400">{stats.totalLost}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Lost Reports Logged</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl sm:text-4xl font-black font-mono text-emerald-400">{stats.totalFound}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Found Items In Custody</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl sm:text-4xl font-black font-mono text-gold-400">{stats.totalResolved}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Items Reunited</p>
          </div>

          <div className="glass-panel p-5 rounded-2xl text-center">
            <p className="text-3xl sm:text-4xl font-black font-mono text-sky-400">{stats.activeUsers}</p>
            <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mt-1">Registered Campus Users</p>
          </div>
        </motion.div>
      </section>

      {/* Workflow Section: Lost -> Found -> Matched -> Claimed -> Closed */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto relative border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-14">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest font-mono">End-to-End Life Cycle</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            How CampusTrack Resolves Misplaced Property
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            A transparent 5-stage relational pipeline ensuring integrity from report submission to physical handover.
          </p>
        </div>

        {/* Visual Workflow Timeline */}
        <div className="glass-panel rounded-3xl p-6 sm:p-10 mb-12 border border-slate-800">
          <StatusTimeline currentStatus="Matched" />
        </div>

        {/* Workflow Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {workflowSteps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="glass-panel glass-panel-hover p-5 rounded-2xl flex flex-col justify-between border border-slate-800/80"
              >
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono font-bold text-gold-400">{s.badge}</span>
                    <div className="w-9 h-9 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-slate-100 mb-2">{s.title}</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Key Features Grid */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto border-t border-slate-900">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <span className="text-xs font-bold text-gold-400 uppercase tracking-widest font-mono">Platform Capabilities</span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-100 mt-2">
            Engineered for Campus Integrity
          </h2>
          <p className="text-sm text-slate-400 mt-3">
            Combining rigorous relational database modeling with an intuitive modern student portal.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-gold-500/10 border border-gold-500/20 flex items-center justify-center text-gold-400 mb-4">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Rule-Based 100-Point Matcher</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent deterministic scoring across category (25pts), location (25pts), color (15pts), brand (15pts), description similarity (10pts), and date proximity (10pts).
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-4">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">ACID Transaction Claim Engine</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Admin claim approval automatically executes multi-table synchronization via MySQL transactions, locking records and auto-rejecting competing claims.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-800">
            <div className="w-12 h-12 rounded-xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center text-sky-400 mb-4">
              <Database className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-100 mb-2">Real Stored Procedures & Triggers</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live SQL views (<code className="text-gold-400">active_lost_items</code>), stored procedures for analytics, and audit triggers maintaining permanent tracking logs.
            </p>
          </div>
        </div>
      </section>

      {/* Viva / Faculty Evaluation Ready Banner */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="glass-panel rounded-3xl p-8 sm:p-12 border border-gold-500/30 relative overflow-hidden text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
          <div className="space-y-3 max-w-2xl">
            <span className="text-xs font-bold text-gold-400 font-mono uppercase tracking-wider">DBMS Faculty Viva Ready</span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-100">
              Ready to demonstrate full-cycle lost & found recovery?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Pre-loaded with 17 registered campus students, 20 lost items, 20 found items, and pre-computed match records for immediate demonstration.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0">
            <Link
              to="/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all text-center"
            >
              Sign In to Demo
            </Link>
            <Link
              to="/admin/login"
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-all text-center"
            >
              Admin Portal
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-10 border-t border-slate-900 text-center text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="small" />
          <p>© 2026 CampusTrack • College DBMS Capstone Project • Built with React, Express & MySQL 8.0</p>
          <div className="flex items-center gap-4 text-slate-400">
            <Link to="/search" className="hover:text-gold-400 transition-colors">Search</Link>
            <Link to="/login" className="hover:text-gold-400 transition-colors">Student Login</Link>
            <Link to="/admin/login" className="hover:text-gold-400 transition-colors">Admin Login</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
