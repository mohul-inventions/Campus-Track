import React, { useState, useEffect } from 'react';
import { lostAPI, foundAPI } from '../services/api';
import StatusBadge from '../components/StatusBadge';
import { Layers, Compass, PlusCircle, Calendar, MapPin, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MyReportsPage() {
  const [tab, setTab] = useState('lost');
  const [lostItems, setLostItems] = useState([]);
  const [foundItems, setFoundItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [l, f] = await Promise.all([lostAPI.getMy(), foundAPI.getMy()]);
        if (l.success) setLostItems(l.items);
        if (f.success) setFoundItems(f.items);
      } catch (err) {} finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const currentList = tab === 'lost' ? lostItems : foundItems;

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-100">My Submissions</h1>
            <p className="text-xs text-slate-400 mt-1">Review all your reported lost items and logged found items</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center p-1 bg-dark-900 rounded-xl border border-slate-800">
              <button
                onClick={() => setTab('lost')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === 'lost' ? 'bg-amber-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Lost Items ({lostItems.length})
              </button>
              <button
                onClick={() => setTab('found')}
                className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  tab === 'found' ? 'bg-emerald-500 text-dark-950 shadow-glow-sm' : 'text-slate-400 hover:text-white'
                }`}
              >
                Found Items ({foundItems.length})
              </button>
            </div>
            <Link
              to={tab === 'lost' ? '/report-lost' : '/report-found'}
              className="p-2 rounded-xl bg-gold-500 text-dark-950 hover:bg-gold-400 transition-colors shadow-glow-sm"
              title="Add New Report"
            >
              <PlusCircle className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-20 text-center text-slate-500">Retrieving records from database...</div>
      ) : currentList.length === 0 ? (
        <div className="glass-panel rounded-3xl p-12 text-center text-slate-400 space-y-3">
          <Layers className="w-8 h-8 mx-auto text-slate-500" />
          <p className="text-sm font-bold">No {tab} records reported yet.</p>
          <Link
            to={tab === 'lost' ? '/report-lost' : '/report-found'}
            className="inline-block mt-2 px-4 py-2 rounded-xl text-xs font-bold bg-gold-500 text-dark-950 hover:bg-gold-400"
          >
            File a New Report
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {currentList.map(item => (
            <div key={item.lost_id || item.found_id} className="glass-panel p-5 rounded-2xl border border-slate-800/80 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-mono font-bold text-slate-400">
                    #{tab.toUpperCase()}-{item.lost_id || item.found_id}
                  </span>
                  <StatusBadge status={item.status} />
                </div>
                <h3 className="text-sm font-bold text-slate-100">{item.item_name}</h3>
                <p className="text-xs text-slate-400 mt-1 line-clamp-2">{item.description}</p>
              </div>
              <div className="space-y-1 text-xs text-slate-400 pt-3 border-t border-slate-800">
                <div className="flex items-center gap-1.5"><Tag className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.category_name}</span></div>
                <div className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span className="truncate">{item.location_name}</span></div>
                <div className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" /><span>{(item.date_lost || item.date_found)?.split('T')[0]}</span></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
