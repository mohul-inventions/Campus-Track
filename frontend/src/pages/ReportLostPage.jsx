import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { metaAPI, lostAPI } from '../services/api';
import { useToast } from '../contexts/ToastContext';
import { PlusCircle, Sparkles, MapPin, Tag, Calendar, Clock, Palette, CheckCircle2, ArrowRight } from 'lucide-react';

export default function ReportLostPage() {
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submittedItem, setSubmittedItem] = useState(null);
  const [potentialMatches, setPotentialMatches] = useState(0);

  const [form, setForm] = useState({
    item_name: '',
    category_id: '',
    location_id: '',
    brand: '',
    primary_color: '',
    date_lost: new Date().toISOString().split('T')[0],
    approx_time: '14:00',
    description: '',
    identifying_details: ''
  });

  const { success, error } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, locRes] = await Promise.all([
          metaAPI.getCategories(),
          metaAPI.getLocations()
        ]);
        if (catRes.success) {
          setCategories(catRes.categories);
          if (catRes.categories.length > 0) setForm((f) => ({ ...f, category_id: catRes.categories[0].category_id }));
        }
        if (locRes.success) {
          setLocations(locRes.locations);
          if (locRes.locations.length > 0) setForm((f) => ({ ...f, location_id: locRes.locations[0].location_id }));
        }
      } catch (err) {
        console.error('Failed to load metadata dropdowns:', err);
      }
    }
    loadMeta();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await lostAPI.create(form);
      if (res.success) {
        setSubmittedItem(res.lostItem);
        setPotentialMatches(res.potentialMatchesCount);
        success(`Report filed successfully! Generated ID: #L-${res.lostItem.lost_id}`);
      }
    } catch (err) {
      error(err.message || 'Failed to submit report. Please check required fields.');
    } finally {
      setLoading(false);
    }
  };

  if (submittedItem) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4">
        <div className="glass-panel rounded-3xl p-8 border border-emerald-500/30 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mx-auto shadow-glow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <div>
            <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-widest">
              Report Successfully Stored in MySQL
            </span>
            <h2 className="text-2xl font-black text-slate-100 mt-2">
              Lost Item #{submittedItem.lost_id} Logged
            </h2>
            <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
              "{submittedItem.item_name}" has been recorded. The automated matching engine compared your report against active found records.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-dark-900/80 border border-slate-800 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Category:</span>
              <span className="font-bold text-slate-200">{submittedItem.category_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Location Misplaced:</span>
              <span className="font-bold text-slate-200">{submittedItem.location_name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Date Recorded:</span>
              <span className="font-bold text-slate-200">{submittedItem.date_lost?.split('T')[0]}</span>
            </div>
            <div className="flex justify-between pt-2 border-t border-slate-800">
              <span className="text-gold-400 font-bold">Rule-Based Matches Detected:</span>
              <span className="font-mono font-bold text-gold-400 bg-gold-500/10 px-2 py-0.5 rounded">
                {potentialMatches} Possible Matches
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => navigate('/matches')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl text-xs font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Inspect Possible Matches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                setSubmittedItem(null);
                setForm((f) => ({ ...f, item_name: '', description: '', identifying_details: '' }));
              }}
              className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
            >
              File Another Report
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
            <PlusCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-slate-100">Report Lost Item</h1>
            <p className="text-xs text-slate-400">Fill in comprehensive details to maximize matching score accuracy</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="mt-8 space-y-6">
          {/* Row 1: Item Name & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Item Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Black Leather Fossil Wallet"
                value={form.item_name}
                onChange={(e) => setForm({ ...form, item_name: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Category *
              </label>
              <select
                value={form.category_id}
                onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all"
              >
                {categories.map((c) => (
                  <option key={c.category_id} value={c.category_id}>
                    {c.category_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Campus Location & Brand */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Campus Location Misplaced *
              </label>
              <select
                value={form.location_id}
                onChange={(e) => setForm({ ...form, location_id: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all"
              >
                {locations.map((loc) => (
                  <option key={loc.location_id} value={loc.location_id}>
                    {loc.location_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Brand / Manufacturer
              </label>
              <input
                type="text"
                placeholder="e.g. Fossil, Apple, Casio, Dell, Milton"
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all"
              />
            </div>
          </div>

          {/* Row 3: Color, Date Lost, Approx Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Primary Colour *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Black, Blue, Silver"
                value={form.primary_color}
                onChange={(e) => setForm({ ...form, primary_color: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Date Lost *
              </label>
              <input
                type="date"
                required
                value={form.date_lost}
                onChange={(e) => setForm({ ...form, date_lost: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
                Approximate Time
              </label>
              <input
                type="time"
                value={form.approx_time}
                onChange={(e) => setForm({ ...form, approx_time: e.target.value })}
                className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2.5 px-4 text-sm text-slate-100 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all font-mono"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5">
              General Description *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe physical shape, condition, stickers, case material, and context of misplacement..."
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full bg-dark-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all resize-none"
            />
          </div>

          {/* Secret Identifying Details */}
          <div>
            <label className="block text-xs font-semibold text-gold-400 uppercase tracking-wider mb-1.5">
              Secret Identifying Details (Used for Claim Verification)
            </label>
            <textarea
              rows={2}
              placeholder="Private details (e.g. initials inside cover, phone wallpaper photo, internal card IDs, engraving)..."
              value={form.identifying_details}
              onChange={(e) => setForm({ ...form, identifying_details: e.target.value })}
              className="w-full bg-dark-900 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60 focus:ring-1 focus:ring-gold-500/40 transition-all resize-none"
            />
            <p className="text-[11px] text-slate-500 mt-1">
              Note: Identifying marks are kept confidential and used by administrators during claim reviews.
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3.5 rounded-xl text-sm font-bold bg-gradient-to-r from-gold-500 to-amber-500 hover:from-gold-400 hover:to-amber-400 text-dark-950 shadow-glow-sm transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-dark-950 border-t-transparent rounded-full animate-spin" />
            ) : (
              <PlusCircle className="w-4 h-4" />
            )}
            <span>Submit Lost Item Report</span>
          </button>
        </form>
      </div>
    </div>
  );
}
