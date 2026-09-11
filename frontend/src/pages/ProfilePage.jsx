import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useToast } from '../contexts/ToastContext';
import { authAPI } from '../services/api';
import { User, Mail, Phone, BookOpen, Hash, ShieldCheck, Check } from 'lucide-react';

export default function ProfilePage() {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    department: user?.department || 'Computer Science and Engineering'
  });
  const [loading, setLoading] = useState(false);
  const { success, error } = useToast();

  const handleUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.updateProfile(formData);
      if (res.success) {
        updateUser(res.user);
        success('Profile updated successfully.');
      }
    } catch (err) {
      error(err.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gold-500/20 border border-gold-500/30 flex items-center justify-center text-gold-400 font-bold text-2xl shadow-glow-sm">
            {user?.full_name ? user.full_name[0].toUpperCase() : 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-slate-100">{user?.full_name}</h1>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded uppercase font-bold bg-gold-500/15 text-gold-400 border border-gold-500/30">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">{user?.reg_no}</p>
          </div>
        </div>

        <form onSubmit={handleUpdate} className="mt-8 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Full Name</label>
            <input type="text" required value={formData.full_name} onChange={e => setFormData({ ...formData, full_name: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Register Number</label>
              <input type="text" disabled value={user?.reg_no} className="w-full bg-dark-900/50 border border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-500 font-mono cursor-not-allowed" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Campus Email</label>
              <input type="email" disabled value={user?.email} className="w-full bg-dark-900/50 border border-slate-800/60 rounded-xl py-2 px-3 text-xs text-slate-500 font-mono cursor-not-allowed" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Phone Number</label>
              <input type="text" required value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 font-mono focus:outline-none focus:border-gold-500/60" />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">Department</label>
              <input type="text" required value={formData.department} onChange={e => setFormData({ ...formData, department: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60" />
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full mt-4 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-1.5">
            {loading ? <div className="w-3.5 h-3.5 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" /> : <Check className="w-4 h-4" />}
            <span>Save Profile Updates</span>
          </button>
        </form>
      </div>
    </div>
  );
}
