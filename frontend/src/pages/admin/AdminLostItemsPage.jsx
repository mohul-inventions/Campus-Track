import React, { useState, useEffect } from 'react';
import { lostAPI, adminAPI } from '../../services/api';
import { useToast } from '../../contexts/ToastContext';
import StatusBadge from '../../components/StatusBadge';
import { Archive, Search, Tag, MapPin, Calendar, Edit2, X } from 'lucide-react';

export default function AdminLostItemsPage() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState(null);
  const [newStatus, setNewStatus] = useState('Lost');
  const { success, error } = useToast();

  const fetchItems = async () => {
    try {
      setLoading(true);
      const res = await lostAPI.getAll({ search });
      if (res.success) setItems(res.items);
    } catch (err) {} finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const t = setTimeout(fetchItems, 300);
    return () => clearTimeout(t);
  }, [search]);

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    try {
      const res = await adminAPI.updateItemStatus('lost', editingItem.lost_id, newStatus, 'Admin override');
      if (res.success) {
        success(res.message);
        setEditingItem(null);
        fetchItems();
      }
    } catch (err) {
      error(err.message || 'Failed to update status.');
    }
  };

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Lost Items Management</h1>
          <p className="text-xs text-slate-400 mt-1">Direct administrative view and status override for lost property records</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search items, brand, color..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-dark-900 border border-slate-800 rounded-xl py-2 pl-9 pr-3 text-xs text-slate-100 focus:outline-none focus:border-gold-500/60"
          />
        </div>
      </div>

      <div className="glass-panel rounded-3xl border border-slate-800/80 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-dark-900/80 text-[11px] font-mono text-gold-400 uppercase tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">ID</th>
                <th className="py-3 px-4">Item Name</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Location</th>
                <th className="py-3 px-4">Reported By</th>
                <th className="py-3 px-4">Date Lost</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {items.map(i => (
                <tr key={i.lost_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-400">#L-{i.lost_id}</td>
                  <td className="py-3 px-4 font-bold text-slate-100">{i.item_name}</td>
                  <td className="py-3 px-4 text-slate-300">{i.category_name}</td>
                  <td className="py-3 px-4 text-slate-300">{i.location_name}</td>
                  <td className="py-3 px-4 text-slate-400">{i.reported_by}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{i.date_lost?.split('T')[0]}</td>
                  <td className="py-3 px-4"><StatusBadge status={i.status} /></td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => { setEditingItem(i); setNewStatus(i.status); }}
                      className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200"
                      title="Update status"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-dark-950/80 backdrop-blur-md">
          <div className="glass-panel rounded-3xl p-6 max-w-sm w-full border border-slate-700 space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="font-bold text-slate-100 text-sm">Update Status: {editingItem.item_name}</h3>
              <button onClick={() => setEditingItem(null)}><X className="w-4 h-4 text-slate-400" /></button>
            </div>
            <form onSubmit={handleUpdateStatus} className="space-y-4">
              <div>
                <label className="text-xs text-slate-400 block mb-1">New State</label>
                <select
                  value={newStatus}
                  onChange={e => setNewStatus(e.target.value)}
                  className="w-full bg-dark-900 border border-slate-800 rounded-xl p-2 text-xs text-slate-100"
                >
                  <option value="Lost">Lost</option>
                  <option value="Matched">Matched</option>
                  <option value="Claimed">Claimed</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>
              <button type="submit" className="w-full py-2 bg-gold-500 text-dark-950 rounded-xl text-xs font-bold hover:bg-gold-400">
                Update Status
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
