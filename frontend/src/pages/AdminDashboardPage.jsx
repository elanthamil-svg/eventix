import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Check, 
  X, 
  AlertTriangle
} from 'lucide-react';
import { MOCK_EVENTS } from '../services/api';
import Toast from '../components/Toast';

export default function AdminDashboardPage() {
  const [pendingQueue, setPendingQueue] = useState([
    {
      id: 'pending_1',
      title: 'Crypto Hacking Clash (Unverified Event)',
      college: 'Global Virtual Univ',
      organizer: 'Unknown User',
      category: 'Hackathon',
      date: '2026-08-30',
      reason: 'Flagged by automated heuristic for missing college affiliation proof.'
    }
  ]);

  const [usersList, setUsersList] = useState([
    { id: 'u1', name: 'Aarav Sharma', email: 'student@campusconnect.edu', role: 'student', college: 'NIT Trichy' },
    { id: 'u2', name: 'Priya Sundaram', email: 'organizer@iitm.ac.in', role: 'organizer', college: 'IIT Madras' },
    { id: 'u3', name: 'Dr. Suresh Kumar', email: 'suresh@bits.ac.in', role: 'organizer', college: 'BITS Pilani' }
  ]);

  const [toastMsg, setToastMsg] = useState('');

  const handleApprove = (id) => {
    setPendingQueue(pendingQueue.filter(item => item.id !== id));
    setToastMsg('✅ Event approved & published to Kaggle marketplace');
  };

  const handleReject = (id) => {
    setPendingQueue(pendingQueue.filter(item => item.id !== id));
    setToastMsg('❌ Event rejected');
  };

  const toggleRole = (userId) => {
    setUsersList(usersList.map(u => {
      if (u.id === userId) {
        const nextRole = u.role === 'student' ? 'organizer' : u.role === 'organizer' ? 'admin' : 'student';
        return { ...u, role: nextRole };
      }
      return u;
    }));
    setToastMsg('Role updated');
  };

  return (
    <div className="space-y-6">
      
      <div className="border-b border-slate-200 dark:border-slate-800 pb-4">
        <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
          <ShieldCheck className="w-6 h-6 text-kaggle-cyan" />
          <span>Admin Moderation Command Center</span>
        </h1>
        <p className="text-xs text-slate-500 mt-1">Platform moderation, verification queue, and user permissions.</p>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kaggle-card p-4">
          <div className="text-xs text-slate-400">Total Users</div>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">1,480</div>
        </div>

        <div className="kaggle-card p-4">
          <div className="text-xs text-slate-400">Verified Competitions</div>
          <div className="text-xl font-bold text-kaggle-cyan mt-1">{MOCK_EVENTS.length}</div>
        </div>

        <div className="kaggle-card p-4">
          <div className="text-xs text-slate-400">Pending Review</div>
          <div className="text-xl font-bold text-amber-500 mt-1">{pendingQueue.length}</div>
        </div>

        <div className="kaggle-card p-4">
          <div className="text-xs text-slate-400">Safety Index</div>
          <div className="text-xl font-bold text-emerald-500 mt-1">100% Clean</div>
        </div>
      </div>

      {/* Pending Queue */}
      <div className="kaggle-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-amber-500" /> Pending Event Approvals
        </h3>

        {pendingQueue.length === 0 ? (
          <div className="text-center py-4 text-xs text-slate-400">✓ Queue clear!</div>
        ) : (
          <div className="space-y-2">
            {pendingQueue.map((item) => (
              <div key={item.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4 text-xs">
                <div>
                  <div className="font-bold text-slate-900 dark:text-white">{item.title}</div>
                  <div className="text-slate-400">{item.college} • {item.organizer}</div>
                  <div className="text-amber-500 text-[11px]">⚠️ {item.reason}</div>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => handleApprove(item.id)} className="px-3 py-1 bg-emerald-600 text-white rounded font-bold text-xs flex items-center gap-1">
                    <Check className="w-3.5 h-3.5" /> Approve
                  </button>
                  <button onClick={() => handleReject(item.id)} className="px-3 py-1 bg-rose-600 text-white rounded font-bold text-xs flex items-center gap-1">
                    <X className="w-3.5 h-3.5" /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Users Moderation */}
      <div className="kaggle-card p-5 space-y-3">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Platform Users</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">User</th>
                <th className="p-3">Email</th>
                <th className="p-3">College</th>
                <th className="p-3">Role</th>
                <th className="p-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {usersList.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white">{u.name}</td>
                  <td className="p-3 text-slate-400">{u.email}</td>
                  <td className="p-3 text-slate-400">{u.college}</td>
                  <td className="p-3 font-bold text-kaggle-cyan capitalize">{u.role}</td>
                  <td className="p-3 text-right">
                    <button onClick={() => toggleRole(u.id)} className="px-3 py-1 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold hover:bg-kaggle-cyan hover:text-slate-950">
                      Change Role
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
