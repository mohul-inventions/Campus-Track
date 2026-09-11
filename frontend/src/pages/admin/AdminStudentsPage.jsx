import React, { useState, useEffect } from 'react';
import { adminAPI } from '../../services/api';
import { Users, Search, Mail, Phone, BookOpen, Layers } from 'lucide-react';

export default function AdminStudentsPage() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudents() {
      try {
        setLoading(true);
        const res = await adminAPI.getStudents({ search });
        if (res.success) setStudents(res.students);
      } catch (err) {} finally {
        setLoading(false);
      }
    }
    const t = setTimeout(fetchStudents, 300);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="space-y-6 pb-12">
      <div className="glass-panel rounded-3xl p-6 sm:p-8 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-100">Registered Students Directory</h1>
          <p className="text-xs text-slate-400 mt-1">Direct query on MySQL `students` relation with activity aggregates</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search name, roll no, email..."
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
                <th className="py-3 px-4">Register No</th>
                <th className="py-3 px-4">Student Name</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4 text-center">Lost Items</th>
                <th className="py-3 px-4 text-center">Found Items</th>
                <th className="py-3 px-4 text-center">Claims</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-sans">
              {students.map(s => (
                <tr key={s.student_id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-200">{s.reg_no}</td>
                  <td className="py-3 px-4 font-semibold text-slate-100">{s.full_name}</td>
                  <td className="py-3 px-4 text-slate-400">{s.department}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">
                    <div>{s.email}</div>
                    <div className="text-[10px] text-slate-500">{s.phone}</div>
                  </td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-amber-400">{s.lost_count}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-400">{s.found_count}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-gold-400">{s.claims_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
