import React, { useState } from 'react';
import { 
  PlusCircle, 
  Calendar, 
  Users, 
  Eye, 
  Trash2, 
  DollarSign,
  FileText
} from 'lucide-react';
import api, { MOCK_EVENTS } from '../services/api';
import Toast from '../components/Toast';

export default function OrganizerDashboardPage() {
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'Hackathon',
    collegeName: 'IIT Madras',
    venue: 'Main Auditorium',
    poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200',
    eventDate: '2026-09-20',
    startTime: '09:00 AM',
    endTime: '06:00 PM',
    registrationDeadline: '2026-09-15',
    entryFee: 0,
    prizePool: '₹1,00,000',
    brochure: '',
    contactName: 'Priya Sundaram',
    contactPhone: '+91 98765 43210'
  });

  const handleCreateSubmit = (e) => {
    e.preventDefault();
    const newEvt = {
      _id: 'evt_' + Date.now(),
      ...formData,
      tags: [formData.category, 'College Fest'],
      contactPerson: { name: formData.contactName, phone: formData.contactPhone, email: 'organizer@campus.edu' },
      location: { address: formData.venue, city: 'Chennai', lat: 12.9915, lng: 80.2337 },
      status: 'approved',
      viewsCount: 1,
      organizerName: 'Priya Sundaram (Organizer)'
    };

    api.post('/events', newEvt).catch(() => {});

    setEvents([newEvt, ...events]);
    setShowCreateModal(false);
    setToastMsg('🎉 Competition Host Created & Published!');
  };

  const handleDelete = (id) => {
    setEvents(events.filter(e => (e._id || e.id) !== id));
    setToastMsg('Competition removed');
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">Organizer Competition Hub</h1>
          <p className="text-xs text-slate-500 mt-1">Host inter-college hackathons, manage student registrations, and view analytics.</p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="kaggle-btn-primary text-xs px-4 py-2 font-bold self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4 text-slate-950" /> Host New Competition
        </button>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="kaggle-card p-4 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Hosted Fests</span>
            <Calendar className="w-4 h-4 text-kaggle-cyan" />
          </div>
          <div className="text-xl font-bold text-slate-900 dark:text-white">{events.length}</div>
        </div>

        <div className="kaggle-card p-4 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Total Views</span>
            <Eye className="w-4 h-4 text-kaggle-cyan" />
          </div>
          <div className="text-xl font-bold text-kaggle-cyan">4,280</div>
        </div>

        <div className="kaggle-card p-4 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Teams Registered</span>
            <Users className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-xl font-bold text-emerald-500">540</div>
        </div>

        <div className="kaggle-card p-4 space-y-1">
          <div className="flex justify-between items-center text-xs text-slate-400">
            <span>Prize Money</span>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-xl font-bold text-amber-500">₹5,75,000</div>
        </div>
      </div>

      {/* Table */}
      <div className="kaggle-card p-5 space-y-4">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white">Active Hosted Competitions</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-100 dark:bg-slate-900 text-slate-500 uppercase font-mono border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Title</th>
                <th className="p-3">Category</th>
                <th className="p-3">Date</th>
                <th className="p-3">Fee</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {events.map((evt) => (
                <tr key={evt._id || evt.id} className="hover:bg-slate-50 dark:hover:bg-slate-900/40">
                  <td className="p-3 font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                    <img src={evt.poster} alt="" className="w-7 h-7 rounded object-cover" />
                    <span>{evt.title}</span>
                  </td>
                  <td className="p-3 text-slate-500">{evt.category}</td>
                  <td className="p-3 text-slate-500">{new Date(evt.eventDate).toLocaleDateString()}</td>
                  <td className="p-3 font-bold text-emerald-500">{evt.entryFee === 0 ? 'Free' : `₹${evt.entryFee}`}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                      Published
                    </span>
                  </td>
                  <td className="p-3 text-right flex items-center justify-end gap-2">
                    {evt.brochure && (
                      <a
                        href={evt.brochure}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 rounded text-purple-400 hover:bg-purple-500/10"
                        title="View / Download Event Brochure"
                      >
                        <FileText className="w-4 h-4" />
                      </a>
                    )}
                    <button onClick={() => handleDelete(evt._id || evt.id)} className="p-1.5 rounded text-rose-500 hover:bg-rose-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="kaggle-card p-6 max-w-lg w-full space-y-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">Host New Competition</h3>

            <form onSubmit={handleCreateSubmit} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. AI Vision Challenge 2026"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  >
                    <option value="Hackathon">Hackathon</option>
                    <option value="Workshop">Workshop</option>
                    <option value="Symposium">Symposium</option>
                    <option value="Coding">Coding</option>
                    <option value="AI">AI</option>
                    <option value="Robotics">Robotics</option>
                    <option value="Design">Design</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1">Prize Pool</label>
                  <input 
                    type="text" 
                    value={formData.prizePool}
                    onChange={(e) => setFormData({ ...formData, prizePool: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Brochure PDF URL</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/event-brochure.pdf"
                  value={formData.brochure}
                  onChange={(e) => setFormData({ ...formData, brochure: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Description</label>
                <textarea 
                  rows="3"
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-3 py-1.5 text-slate-400 font-bold">Cancel</button>
                <button type="submit" className="kaggle-btn-primary text-xs px-4 py-2">Publish Competition</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
