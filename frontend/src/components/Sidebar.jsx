import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  Compass,
  Search,
  Sparkles,
  Layers,
  FileCheck,
  User,
  ShieldCheck,
  Users,
  Archive,
  BarChart3,
  X
} from 'lucide-react';

export default function Sidebar({ isOpen, onClose }) {
  const { user, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/report-lost', label: 'Report Lost Item', icon: PlusCircle },
    { to: '/report-found', label: 'Report Found Item', icon: Compass },
    { to: '/search', label: 'Search Registry', icon: Search },
    { to: '/matches', label: 'Possible Matches', icon: Sparkles },
    { to: '/my-reports', label: 'My Submissions', icon: Layers },
    { to: '/claims', label: 'My Claims', icon: FileCheck },
    { to: '/profile', label: 'Student Profile', icon: User }
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Admin Overview', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Students Directory', icon: Users },
    { to: '/admin/lost-items', label: 'Lost Items Log', icon: Archive },
    { to: '/admin/found-items', label: 'Found Items Custody', icon: Compass },
    { to: '/admin/matches', label: 'Matches Review', icon: Sparkles },
    { to: '/admin/claims', label: 'Claims Verification', icon: ShieldCheck },
    { to: '/admin/analytics', label: 'DBMS Analytics', icon: BarChart3 }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-dark-950/80 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar Panel */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 glass-panel border-r border-slate-800/80 flex flex-col justify-between py-5 px-3 transition-transform duration-300 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex-1 overflow-y-auto space-y-6">
          {/* Close button on mobile */}
          <div className="flex items-center justify-between px-3 lg:hidden">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Navigation</span>
            <button onClick={onClose} className="p-1 rounded-lg text-slate-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Student Links */}
          <div>
            <p className="px-3 text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-2">
              Student Portal
            </p>
            <div className="space-y-1">
              {studentLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <NavLink
                    key={link.to}
                    to={link.to}
                    onClick={() => onClose?.()}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                        isActive
                          ? 'bg-gradient-to-r from-gold-500/20 to-amber-500/10 text-gold-400 border border-gold-500/30 shadow-glow-sm font-bold'
                          : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                      }`
                    }
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{link.label}</span>
                  </NavLink>
                );
              })}
            </div>
          </div>

          {/* Admin Links */}
          {isAdmin && (
            <div className="pt-4 border-t border-slate-800/80">
              <div className="flex items-center justify-between px-3 mb-2">
                <span className="text-[11px] font-bold uppercase tracking-widest text-gold-400 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
                  Admin Panel
                </span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-gold-500/20 text-gold-400 font-mono">STAFF</span>
              </div>
              <div className="space-y-1">
                {adminLinks.map((link) => {
                  const Icon = link.icon;
                  return (
                    <NavLink
                      key={link.to}
                      to={link.to}
                      onClick={() => onClose?.()}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-amber-500/20 to-gold-500/10 text-amber-300 border border-amber-500/40 shadow-glow-sm font-bold'
                            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                        }`
                      }
                    >
                      <Icon className="w-4 h-4 shrink-0" />
                      <span>{link.label}</span>
                    </NavLink>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* User Card at bottom */}
        <div className="pt-4 border-t border-slate-800/80 px-2">
          <div className="p-3 rounded-xl bg-dark-900/60 border border-slate-800/80 flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gold-500/10 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-xs">
              {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-200 truncate">{user?.full_name}</p>
              <p className="text-[10px] text-slate-400 font-mono truncate">{user?.reg_no}</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
