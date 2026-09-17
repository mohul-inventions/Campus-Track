import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import Logo from '../../components/Logo';
import { ShieldCheck, Mail, Key, LogIn, Lock } from 'lucide-react';

export default function AdminLoginPage() {
  const [email, setEmail] = useState('admin@campustrack.edu');
  const [password, setPassword] = useState('Campus@Admin2026!');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { success, error } = useToast();
  const navigate = useNavigate();

  const handleAdminLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      if (res.user.role !== 'admin') {
        error('Access denied. You must be an administrator.');
        return;
      }
      success('Administrator session authenticated.');
      navigate('/admin/dashboard');
    } catch (err) {
      error(err.message || 'Admin authentication failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4 bg-grid-pattern">
      <div className="max-w-md w-full glass-panel rounded-3xl p-8 border border-gold-500/30 shadow-2xl relative overflow-hidden">
        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-gold-500/20 border border-gold-500/40 flex items-center justify-center text-gold-400 mx-auto mb-3 shadow-glow-sm">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-black text-slate-100">Administrator Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Campus Security & Property Custody Management</p>
        </div>

        <form onSubmit={handleAdminLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Admin Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold-500/60" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold-500/60" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-1.5">
            {loading ? <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" /> : <Lock className="w-3.5 h-3.5" />}
            <span>Authenticate Admin Session</span>
          </button>
        </form>
      </div>
    </div>
  );
}
