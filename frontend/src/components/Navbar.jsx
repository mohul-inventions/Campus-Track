import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';
import { 
  PlusCircle, 
  Search, 
  Sparkles, 
  User, 
  LogOut, 
  ShieldAlert, 
  Menu, 
  X,
  FileCheck,
  Compass
} from 'lucide-react';

export default function Navbar({ onMenuToggle }) {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [profileOpen, setProfileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Menu Trigger & Logo */}
        <div className="flex items-center gap-3">
          {isAuthenticated && (
            <button
              onClick={onMenuToggle}
              className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800/60"
              aria-label="Toggle Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link to={isAuthenticated ? '/dashboard' : '/'} className="flex items-center">
            <Logo />
          </Link>
        </div>

        {/* Center: Quick search / navigation links for logged-in users */}
        {isAuthenticated && (
          <div className="hidden md:flex items-center gap-1 text-sm font-medium text-slate-300">
            <Link
              to="/search"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/search' ? 'text-gold-400 bg-gold-500/10' : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Search className="w-4 h-4" />
              <span>Search Records</span>
            </Link>
            <Link
              to="/matches"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/matches' ? 'text-gold-400 bg-gold-500/10' : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <Sparkles className="w-4 h-4 text-gold-400" />
              <span>Possible Matches</span>
            </Link>
            <Link
              to="/claims"
              className={`px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                location.pathname === '/claims' ? 'text-gold-400 bg-gold-500/10' : 'hover:text-white hover:bg-slate-800/40'
              }`}
            >
              <FileCheck className="w-4 h-4" />
              <span>Claims</span>
            </Link>
          </div>
        )}

        {/* Right Action buttons */}
        <div className="flex items-center gap-3">
          {isAuthenticated ? (
            <>
              <Link
                to="/report-lost"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700 transition-all"
              >
                <PlusCircle className="w-3.5 h-3.5 text-amber-400" />
                <span>Report Lost</span>
              </Link>
              <Link
                to="/report-found"
                className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 font-bold shadow-glow-sm transition-all"
              >
                <Compass className="w-3.5 h-3.5" />
                <span>Report Found</span>
              </Link>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="flex items-center gap-2 p-1.5 pl-2.5 rounded-xl glass-panel hover:border-gold-500/40 transition-all text-xs"
                >
                  <div className="text-left hidden sm:block">
                    <p className="font-bold text-slate-200 leading-tight truncate max-w-[110px]">
                      {user?.full_name?.split(' ')[0]}
                    </p>
                    <p className="text-[10px] text-gold-400 uppercase tracking-wider font-mono">
                      {user?.role}
                    </p>
                  </div>
                  <div className="w-8 h-8 rounded-lg bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold">
                    {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
                  </div>
                </button>

                {profileOpen && (
                  <div 
                    className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl p-2 border border-slate-700/80 shadow-2xl z-50 text-xs"
                    onClick={() => setProfileOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-slate-800">
                      <p className="font-bold text-slate-100">{user?.full_name}</p>
                      <p className="text-slate-400 truncate">{user?.email}</p>
                      <p className="text-[10px] text-gold-400 font-mono mt-0.5">{user?.reg_no}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-white transition-colors"
                      >
                        <User className="w-3.5 h-3.5 text-slate-400" />
                        <span>My Profile</span>
                      </Link>

                      {isAdmin && (
                        <Link
                          to="/admin/dashboard"
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-gold-500/10 hover:bg-gold-500/20 text-gold-400 font-semibold transition-colors mt-1"
                        >
                          <ShieldAlert className="w-3.5 h-3.5 text-gold-400" />
                          <span>Admin Control Center</span>
                        </Link>
                      )}
                    </div>

                    <div className="pt-1 border-t border-slate-800">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-500/10 transition-colors text-left"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 transition-colors"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
