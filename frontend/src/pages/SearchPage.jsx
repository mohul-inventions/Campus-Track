import React, { useState, useEffect } from 'react';
import { lostAPI, foundAPI, metaAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Search, MapPin, Calendar, Tag, AlertCircle, X } from 'lucide-react';

export default function SearchPage() {
  const [activeType, setActiveType] = useState('all');
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category_id: '', location_id: '', status: '' });
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [c, l] = await Promise.all([metaAPI.getCategories(), metaAPI.getLocations()]);
        if (c.success) setCategories(c.categories);
        if (l.success) setLocations(l.locations);
      } catch (err) {}
    }
    loadMeta();
  }, []);

  useEffect(() => {
    async function searchItems() {
      try {
        setLoading(true);
        const params = {};
        if (filters.search) params.search = filters.search;
        if (filters.category_id) params.category_id = filters.category_id;
        if (filters.location_id) params.location_id = filters.location_id;
        if (filters.status) params.status = filters.status;

        let combined = [];
        if (activeType === 'all' || activeType === 'lost') {
          const l = await lostAPI.getAll(params);
          if (l.success) combined = [...combined, ...l.items.map(i => ({ ...i, entityType: 'LOST' }))];
        }
        if (activeType === 'all' || activeType === 'found') {
          const f = await foundAPI.getAll(params);
          if (f.success) combined = [...combined, ...f.items.map(i => ({ ...i, entityType: 'FOUND' }))];
        }
        combined.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        setItems(combined);
      } catch (err) {} finally {
        setLoading(false);
      }
    }
    const t = setTimeout(searchItems, 300);
    return () => clearTimeout(t);
  }, [filters, activeType]);

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-100">Search Campus Registry</h1>
            <p className="text-xs text-slate-400 mt-1">Query lost and found records across all academic blocks and labs</p>
          </div>
          <div className="flex items-center gap-1.5 p-1 bg-dark-900 rounded-xl border border-slate-800">
            <button onClick={() => setActiveType('all')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'all' ? 'bg-gold-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'}`}>All</button>
            <button onClick={() => setActiveType('lost')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'lost' ? 'bg-amber-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'}`}>Lost Items</button>
            <button onClick={() => setActiveType('found')} className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeType === 'found' ? 'bg-emerald-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'}`}>Found Items</button>
          </div>
        </div>
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="text" placeholder="Search keyword, item name, brand..." value={filters.search} onChange={e => setFilters({ ...filters, search: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-gold-500/60" />
          </div>
          <select value={filters.category_id} onChange={e => setFilters({ ...filters, category_id: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c.category_id} value={c.category_id}>{c.category_name}</option>)}
          </select>
          <select value={filters.location_id} onChange={e => setFilters({ ...filters, location_id: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60">
            <option value="">All Locations</option>
            {locations.map(l => <option key={l.location_id} value={l.location_id}>{l.location_name}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters({ ...filters, status: e.target.value })} className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60">
            <option value="">All Statuses</option>
            <option value="Lost">Lost</option>
            <option value="Found">Found</option>
            <option value="Matched">Matched</option>
            <option value="Claimed">Claimed</option>
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>
      <div>
        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider font-mono mb-4">{loading ? 'Searching...' : `Found ${items.length} records matching criteria`}</p>
        {loading ? <div className="py-20 text-center text-slate-500">Querying database...</div> : items.length === 0 ? (
          <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-500" />
            <p className="text-sm font-bold">No records found matching your filters.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map(item => {
              const isLost = item.entityType === 'LOST';
              return (
                <div key={`${item.entityType}-${item.lost_id || item.found_id}`} className="glass-panel glass-panel-hover p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className={`text-[10px] font-bold font-mono px-2 py-0.5 rounded uppercase tracking-wider ${isLost ? 'bg-amber-500/15 text-amber-300 border border-amber-500/30' : 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'}`}>{item.entityType}</span>
                      <StatusBadge status={item.status} />
                    </div>
                    <h3 className="text-sm font-bold text-slate-100 leading-snug">{item.item_name}</h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs text-slate-400">
                    <div className="flex items-center gap-1.5 truncate"><Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.category_name}</span></div>
                    <div className="flex items-center gap-1.5 truncate"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.location_name}</span></div>
                    <div className="flex items-center justify-between pt-1">
                      <span className="flex items-center gap-1 text-[11px] text-slate-500"><Calendar className="w-3 h-3" />{(item.date_lost || item.date_found)?.split('T')[0]}</span>
                      <button onClick={() => setSelectedItem(item)} className="text-xs font-bold text-gold-400 hover:underline">Details</button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      {selectedItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-700 shadow-2xl relative space-y-4">
            <button onClick={() => setSelectedItem(null)} className="absolute top-5 right-5 text-slate-400 hover:text-white p-1"><X className="w-5 h-5" /></button>
            <div className="flex items-center gap-2"><span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded uppercase bg-gold-500/10 text-gold-400 border border-gold-500/20">{selectedItem.entityType} RECORD</span><StatusBadge status={selectedItem.status} /></div>
            <h2 className="text-xl font-black text-slate-100">{selectedItem.item_name}</h2>
            <p className="text-xs text-slate-300 leading-relaxed bg-dark-900/60 p-3.5 rounded-xl border border-slate-800">{selectedItem.description}</p>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-xl bg-dark-900/40 border border-slate-800"><span className="text-slate-500 block text-[10px] uppercase font-bold">Category</span><span className="font-semibold text-slate-200 mt-0.5 block">{selectedItem.category_name}</span></div>
              <div className="p-3 rounded-xl bg-dark-900/40 border border-slate-800"><span className="text-slate-500 block text-[10px] uppercase font-bold">Primary Colour</span><span className="font-semibold text-slate-200 mt-0.5 block">{selectedItem.primary_color}</span></div>
              <div className="p-3 rounded-xl bg-dark-900/40 border border-slate-800"><span className="text-slate-500 block text-[10px] uppercase font-bold">Brand</span><span className="font-semibold text-slate-200 mt-0.5 block">{selectedItem.brand || 'Unbranded'}</span></div>
              <div className="p-3 rounded-xl bg-dark-900/40 border border-slate-800"><span className="text-slate-500 block text-[10px] uppercase font-bold">Date</span><span className="font-semibold text-slate-200 mt-0.5 block">{(selectedItem.date_lost || selectedItem.date_found)?.split('T')[0]}</span></div>
            </div>
            <button onClick={() => setSelectedItem(null)} className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-colors">Close</button>
          </div>
        </div>
      )}
    </div>
  );
}
