import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import Logo from '../components/Logo';
import { LogIn, Key, Mail, ShieldCheck, UserCheck, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      success(`Welcome back, ${res.user.full_name}!`);
      if (res.user.role === 'admin') {
        navigate('/admin/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      error(err.message || 'Login failed. Check your email and password.');
    } finally {
      setLoading(false);
    }
  };

  // 1-Click Viva Demo Helpers
  const fillStudentDemo = () => {
    setEmail('student@campustrack.edu');
    setPassword('Student@123');
  };

  const fillAdminDemo = () => {
    setEmail('admin@campustrack.edu');
    setPassword('Admin@123');
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-grid-pattern">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-slate-800 shadow-2xl relative overflow-hidden">
        {/* Glow */}
        <div className="absolute -top-12 -left-12 w-40 h-40 bg-gold-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <Logo size="large" />
          </div>
          <h2 className="text-2xl font-black text-slate-100">Sign In to CampusTrack</h2>
          <p className="text-xs text-slate-400 mt-1">Enter your credentials to access your lost & found dashboard</p>
        </div>

        {/* 1-Click Viva Demo Buttons */}
        <div className="mb-6 p-3 rounded-2xl bg-dark-900/80 border border-gold-500/30 space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gold-400 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-gold-400" />
            1-Click Faculty Viva Credentials
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={fillStudentDemo}
              className="py-1.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
            >
              <UserCheck className="w-3 h-3 text-amber-400" />
              <span>Demo Student</span>
            </button>
            <button
              type="button"
              onClick={fillAdminDemo}
              className="py-1.5 px-3 rounded-xl bg-gold-500/15 hover:bg-gold-500/25 text-[11px] font-semibold text-gold-400 border border-gold-500/30 transition-colors flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3 h-3 text-gold-400" />
              <span>Chief Admin</span>
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="student@campustrack.edu"
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all font-mono"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <LogIn className="w-4 h-4" />
            )}
            <span>Sign In</span>
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-400">
          Don't have an account?{' '}
          <Link to="/register" className="text-gold-400 font-bold hover:underline">
            Register as a Student
          </Link>
        </div>
      </div>
    </div>
  );
}
