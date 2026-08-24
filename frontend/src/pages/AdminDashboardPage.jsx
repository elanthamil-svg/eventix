import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck,
  PlusCircle,
  CalendarDays,
  Clock,
  MapPin,
  FileText,
  Tag,
  Upload,
  Trash2,
  Eye,
  X,
  CheckCircle,
  AlertCircle,
  List,
  ChevronRight,
  LayoutGrid,
  UserCircle
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = ['Hackathon', 'Workshop', 'Symposium', 'Coding', 'AI', 'Robotics', 'Design', 'Cultural', 'Sports', 'Other'];
const LS_KEY = 'eventix_admin_events';

function loadLocalEvents() {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || '[]'); } catch { return []; }
}
function saveLocalEvents(events) {
  localStorage.setItem(LS_KEY, JSON.stringify(events));
}

// ─── Toast ─────────────────────────────────────────────────────────
function Toast({ msg, type, onClose }) {
  useEffect(() => { const t = setTimeout(onClose, 3500); return () => clearTimeout(t); }, [onClose]);
  const colors = type === 'success'
    ? { bg: '#ECFDF5', border: '#10B981', text: '#065F46' }
    : { bg: '#FFF1F2', border: '#F43F5E', text: '#9F1239' };
  return (
    <div style={{
      position: 'fixed', bottom: 28, right: 28, zIndex: 9999,
      background: colors.bg, border: `1.5px solid ${colors.border}`,
      borderRadius: 14, padding: '14px 20px', display: 'flex', alignItems: 'center',
      gap: 10, color: colors.text, fontWeight: 700, fontSize: 14,
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)', animation: 'slideUp 0.3s ease', maxWidth: 340
    }}>
      {type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />}
      {msg}
      <button onClick={onClose} style={{ marginLeft: 8, background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', padding: 0 }}>
        <X size={15} />
      </button>
    </div>
  );
}

// ─── Brochure Modal ─────────────────────────────────────────────────
function BrochureModal({ url, name, onClose }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9000,
      background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 24
    }} onClick={onClose}>
      <div style={{
        background: '#fff', borderRadius: 20, overflow: 'hidden',
        width: '100%', maxWidth: 860, height: '88vh',
        boxShadow: '0 24px 80px rgba(0,0,0,0.25)',
        display: 'flex', flexDirection: 'column'
      }} onClick={e => e.stopPropagation()}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 24px', borderBottom: '1px solid #E2E8F0', background: '#F8FAFC'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={18} style={{ color: '#F59E0B' }} />
            <span style={{ color: '#0F172A', fontWeight: 700, fontSize: 15 }}>{name}</span>
          </div>
          <button onClick={onClose} style={{
            background: '#F1F5F9', border: '1px solid #E2E8F0',
            borderRadius: 8, color: '#64748B', cursor: 'pointer', padding: '6px 10px'
          }}>
            <X size={16} />
          </button>
        </div>
        <iframe src={url} title="Brochure" style={{ flex: 1, border: 'none' }} />
      </div>
    </div>
  );
}

// ─── Create Event Form ──────────────────────────────────────────────
function CreateEventForm({ onCreated }) {
  const { user, token } = useAuth();
  const fileRef = useRef();
  const INDIA_STATES = [
    'Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat',
    'Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh',
    'Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab',
    'Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh',
    'Uttarakhand','West Bengal','Andaman & Nicobar Islands','Chandigarh',
    'Dadra & Nagar Haveli and Daman & Diu','Delhi','Jammu & Kashmir','Ladakh',
    'Lakshadweep','Puducherry'
  ];

  const [form, setForm] = useState({
    title: '', description: '', category: 'Hackathon',
    collegeName: '', state: '', district: '',
    venue: '', eventDate: '', startTime: '', endTime: ''
  });
  const [brochureB64, setBrochureB64] = useState('');
  const [brochureName, setBrochureName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleFile = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrors(er => ({ ...er, brochure: 'Only PDF files are allowed.' }));
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrors(er => ({ ...er, brochure: 'File must be under 10 MB.' }));
      return;
    }
    setErrors(er => ({ ...er, brochure: '' }));
    setBrochureName(file.name);
    const reader = new FileReader();
    reader.onload = (ev) => setBrochureB64(ev.target.result);
    reader.readAsDataURL(file);
  };

  const validate = () => {
    const e = {};
    if (!form.title.trim()) e.title = 'Event name is required.';
    if (!form.collegeName.trim()) e.collegeName = 'College name is required.';
    if (!form.state) e.state = 'State is required.';
    if (!form.district.trim()) e.district = 'District is required.';
    if (!form.venue.trim()) e.venue = 'Venue is required.';
    if (!form.eventDate) e.eventDate = 'Date is required.';
    if (!form.startTime) e.startTime = 'Start time is required.';
    if (!form.endTime) e.endTime = 'End time is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    const newEvent = {
      _id: 'local_' + Date.now(),
      ...form,
      brochure: brochureB64,
      brochureName,
      organizer: user?._id || 'admin',
      organizerName: user?.name || 'Admin',
      collegeName: form.collegeName || user?.college || 'Eventix Admin',
      state: form.state,
      district: form.district,
      status: 'approved',
      createdAt: new Date().toISOString(),
      location: {
        address: form.venue,
        city: form.district || form.venue,
        state: form.state,
        lat: 0, lng: 0
      },
      contactPerson: { name: user?.name || 'Admin', phone: '', email: user?.email || '' },
      registrationDeadline: form.eventDate,
      poster: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&q=80&w=1200'
    };
    const existing = loadLocalEvents();
    saveLocalEvents([newEvent, ...existing]);
    try {
      await api.post('/events', { ...newEvent }, { headers: { Authorization: `Bearer ${token}` } });
    } catch (_) {}
    setSubmitting(false);
    onCreated(newEvent);
    setForm({ title: '', description: '', category: 'Hackathon', collegeName: '', state: '', district: '', venue: '', eventDate: '', startTime: '', endTime: '' });
    setBrochureB64(''); setBrochureName('');
    if (fileRef.current) fileRef.current.value = '';
  };

  // Light-mode input/label styles
  const inputStyle = {
    width: '100%', background: '#fff',
    border: '1.5px solid #CBD5E1', borderRadius: 10,
    padding: '11px 14px', color: '#0F172A', fontSize: 14,
    outline: 'none', fontFamily: 'inherit', boxSizing: 'border-box',
    transition: 'border-color 0.2s'
  };
  const inputFocusStyle = { borderColor: '#F59E0B' };
  const errInput = { borderColor: '#F43F5E' };
  const errorStyle = { fontSize: 11, color: '#E11D48', marginTop: 4, display: 'block', fontWeight: 600 };
  const labelStyle = { fontSize: 12, fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: 5, marginBottom: 7 };

  return (
    <form onSubmit={handleSubmit} style={{ maxWidth: 720 }}>
      <div style={{ display: 'grid', gap: 20 }}>

        {/* Event Name */}
        <div>
          <label style={labelStyle}><Tag size={12} />Event Name *</label>
          <input
            style={{ ...inputStyle, ...(errors.title ? errInput : {}) }}
            placeholder="e.g. TechFest 2026 – National Hackathon"
            value={form.title} onChange={e => set('title', e.target.value)}
            id="evt-name"
          />
          {errors.title && <span style={errorStyle}>{errors.title}</span>}
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}><LayoutGrid size={12} />Category *</label>
          <select
            style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto' }}
            value={form.category} onChange={e => set('category', e.target.value)}
            id="evt-category"
          >
            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* College Name */}
        <div>
          <label style={labelStyle}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20V10l8-7 8 7v10"/><rect x="9" y="14" width="6" height="6"/></svg>
            College Name *
          </label>
          <input
            style={{ ...inputStyle, ...(errors.collegeName ? errInput : {}) }}
            placeholder="e.g. Anna University, NIT Trichy, IIT Madras"
            value={form.collegeName} onChange={e => set('collegeName', e.target.value)}
            id="evt-college"
          />
          {errors.collegeName && <span style={errorStyle}>{errors.collegeName}</span>}
        </div>

        {/* State + District row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/></svg>
              State *
            </label>
            <select
              style={{ ...inputStyle, cursor: 'pointer', appearance: 'auto', ...(errors.state ? errInput : {}) }}
              value={form.state} onChange={e => set('state', e.target.value)}
              id="evt-state"
            >
              <option value="">Select State / UT</option>
              {INDIA_STATES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {errors.state && <span style={errorStyle}>{errors.state}</span>}
          </div>
          <div>
            <label style={labelStyle}>
              <MapPin size={12} /> District *
            </label>
            <input
              style={{ ...inputStyle, ...(errors.district ? errInput : {}) }}
              placeholder="e.g. Chennai, Coimbatore"
              value={form.district} onChange={e => set('district', e.target.value)}
              id="evt-district"
            />
            {errors.district && <span style={errorStyle}>{errors.district}</span>}
          </div>
        </div>

        {/* Date + Time row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14 }}>
          <div>
            <label style={labelStyle}><CalendarDays size={12} />Date *</label>
            <input type="date"
              style={{ ...inputStyle, ...(errors.eventDate ? errInput : {}) }}
              value={form.eventDate} onChange={e => set('eventDate', e.target.value)} id="evt-date" />
            {errors.eventDate && <span style={errorStyle}>{errors.eventDate}</span>}
          </div>
          <div>
            <label style={labelStyle}><Clock size={12} />Start Time *</label>
            <input type="time"
              style={{ ...inputStyle, ...(errors.startTime ? errInput : {}) }}
              value={form.startTime} onChange={e => set('startTime', e.target.value)} id="evt-start" />
            {errors.startTime && <span style={errorStyle}>{errors.startTime}</span>}
          </div>
          <div>
            <label style={labelStyle}><Clock size={12} />End Time *</label>
            <input type="time"
              style={{ ...inputStyle, ...(errors.endTime ? errInput : {}) }}
              value={form.endTime} onChange={e => set('endTime', e.target.value)} id="evt-end" />
            {errors.endTime && <span style={errorStyle}>{errors.endTime}</span>}
          </div>
        </div>

        {/* Venue */}
        <div>
          <label style={labelStyle}><MapPin size={12} />Venue *</label>
          <input
            style={{ ...inputStyle, ...(errors.venue ? errInput : {}) }}
            placeholder="e.g. Main Auditorium, Anna University, Chennai"
            value={form.venue} onChange={e => set('venue', e.target.value)} id="evt-venue"
          />
          {errors.venue && <span style={errorStyle}>{errors.venue}</span>}
        </div>

        {/* Description */}
        <div>
          <label style={labelStyle}><FileText size={12} />Description *</label>
          <textarea
            rows={4}
            style={{ ...inputStyle, resize: 'vertical', lineHeight: 1.65, ...(errors.description ? errInput : {}) }}
            placeholder="Describe the event — theme, activities, prizes, eligibility…"
            value={form.description} onChange={e => set('description', e.target.value)} id="evt-desc"
          />
          {errors.description && <span style={errorStyle}>{errors.description}</span>}
        </div>

        {/* Brochure Upload */}
        <div>
          <label style={labelStyle}><Upload size={12} />Brochure PDF <span style={{ color: '#94A3B8', fontWeight: 500 }}>(optional, max 10 MB)</span></label>
          <div
            onClick={() => fileRef.current?.click()}
            style={{
              border: `2px dashed ${brochureName ? '#F59E0B' : '#CBD5E1'}`,
              borderRadius: 12, padding: '22px 20px', cursor: 'pointer',
              textAlign: 'center', transition: 'all 0.2s',
              background: brochureName ? '#FFFBEB' : '#F8FAFC'
            }}
          >
            {brochureName ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
                <FileText size={22} style={{ color: '#F59E0B' }} />
                <div style={{ textAlign: 'left' }}>
                  <div style={{ color: '#92400E', fontWeight: 700, fontSize: 13 }}>{brochureName}</div>
                  <div style={{ color: '#B45309', fontSize: 11, marginTop: 2 }}>Click to replace</div>
                </div>
              </div>
            ) : (
              <>
                <Upload size={24} style={{ color: '#94A3B8', margin: '0 auto 8px' }} />
                <div style={{ color: '#475569', fontSize: 13, fontWeight: 600 }}>Click to upload PDF brochure</div>
                <div style={{ color: '#94A3B8', fontSize: 11, marginTop: 4 }}>PDF only · Max 10 MB</div>
              </>
            )}
          </div>
          <input ref={fileRef} type="file" accept=".pdf,application/pdf" style={{ display: 'none' }} onChange={handleFile} id="evt-brochure" />
          {errors.brochure && <span style={errorStyle}>{errors.brochure}</span>}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={submitting} id="evt-submit"
          style={{
            background: submitting ? '#FCD34D' : 'linear-gradient(135deg,#F59E0B,#D97706)',
            border: 'none', borderRadius: 12, padding: '14px 28px',
            color: '#fff', fontWeight: 800, fontSize: 15,
            cursor: submitting ? 'not-allowed' : 'pointer',
            display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center',
            width: '100%', fontFamily: 'inherit', transition: 'all 0.2s',
            boxShadow: submitting ? 'none' : '0 4px 16px rgba(245,158,11,0.4)'
          }}
        >
          {submitting ? (
            <div style={{ width: 18, height: 18, borderRadius: '50%', border: '2.5px solid #fff', borderTopColor: 'transparent', animation: 'spin 0.7s linear infinite' }} />
          ) : (
            <><PlusCircle size={18} /> Create Event</>
          )}
        </button>
      </div>
    </form>
  );
}

// ─── Event List ─────────────────────────────────────────────────────
function EventList({ events, onDelete, onViewBrochure }) {
  if (events.length === 0) {
    return (
      <div style={{
        textAlign: 'center', padding: '56px 24px',
        border: '2px dashed #E2E8F0', borderRadius: 16, background: '#F8FAFC'
      }}>
        <CalendarDays size={40} style={{ color: '#CBD5E1', margin: '0 auto 12px' }} />
        <div style={{ color: '#334155', fontWeight: 700, fontSize: 15 }}>No events yet</div>
        <div style={{ color: '#94A3B8', fontSize: 13, marginTop: 6 }}>Switch to the Create Event tab to publish your first event.</div>
      </div>
    );
  }

  return (
    <div style={{ display: 'grid', gap: 12 }}>
      {events.map(ev => (
        <div key={ev._id} style={{
          background: '#fff', border: '1.5px solid #E2E8F0',
          borderRadius: 14, padding: '16px 20px',
          display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap',
          boxShadow: '0 1px 4px rgba(0,0,0,0.05)'
        }}>
          <div style={{
            width: 42, height: 42, borderRadius: 11, flexShrink: 0,
            background: '#FFFBEB', border: '1.5px solid #FDE68A',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <CalendarDays size={20} style={{ color: '#F59E0B' }} />
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ color: '#0F172A', fontWeight: 800, fontSize: 15, marginBottom: 4, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
              {ev.title}
            </div>
            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                <Tag size={11} /> {ev.category}
              </span>
              {ev.eventDate && (
                <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <CalendarDays size={11} /> {new Date(ev.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
              )}
              {ev.startTime && (
                <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={11} /> {ev.startTime}{ev.endTime ? ` – ${ev.endTime}` : ''}
                </span>
              )}
              {(ev.district || ev.state) && (
                <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <MapPin size={11} /> {[ev.district, ev.state].filter(Boolean).join(', ')}
                </span>
              )}
              {ev.venue && (
                <span style={{ fontSize: 12, color: '#64748B', display: 'flex', alignItems: 'center', gap: 4 }}>
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 20h20M4 20V10l8-7 8 7v10"/><rect x="9" y="14" width="6" height="6"/></svg>
                  {ev.venue}
                </span>
              )}
            </div>
          </div>

          <span style={{
            fontSize: 11, fontWeight: 700, padding: '4px 10px', borderRadius: 20,
            background: '#ECFDF5', color: '#059669',
            border: '1px solid #A7F3D0', textTransform: 'uppercase', letterSpacing: '0.04em'
          }}>Published</span>

          <div style={{ display: 'flex', gap: 8 }}>
            {ev.brochure && (
              <button
                onClick={() => onViewBrochure(ev)}
                style={{
                  background: '#FFFBEB', border: '1.5px solid #FDE68A',
                  borderRadius: 10, color: '#B45309', cursor: 'pointer',
                  padding: '7px 12px', display: 'flex', alignItems: 'center',
                  gap: 5, fontSize: 12, fontWeight: 700, fontFamily: 'inherit'
                }}
              >
                <Eye size={14} /> Brochure
              </button>
            )}
            <button
              onClick={() => onDelete(ev._id)}
              style={{
                background: '#FFF1F2', border: '1.5px solid #FECDD3',
                borderRadius: 10, color: '#E11D48', cursor: 'pointer', padding: '7px 10px'
              }}
            >
              <Trash2 size={15} />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Admin Dashboard ───────────────────────────────────────────
export default function AdminDashboardPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState('events');
  const [events, setEvents] = useState(loadLocalEvents);
  const [toast, setToast] = useState(null);
  const [brochureModal, setBrochureModal] = useState(null);

  const handleCreated = (ev) => {
    setEvents(prev => [ev, ...prev]);
    setTab('events');
    setToast({ msg: `✅ "${ev.title}" published successfully!`, type: 'success' });
  };

  const handleDelete = (id) => {
    const updated = events.filter(e => e._id !== id);
    setEvents(updated);
    saveLocalEvents(updated);
    setToast({ msg: '🗑️ Event deleted.', type: 'error' });
  };

  const tabs = [
    { key: 'events', label: 'All Events', icon: List, count: events.length },
    { key: 'create', label: 'Create Event', icon: PlusCircle }
  ];

  const statCards = [
    { label: 'Total Events', value: events.length, color: '#F59E0B', bg: '#FFFBEB', border: '#FDE68A' },
    { label: 'Published', value: events.length, color: '#059669', bg: '#ECFDF5', border: '#A7F3D0' },
    { label: 'With Brochure', value: events.filter(e => e.brochure).length, color: '#0284C7', bg: '#EFF6FF', border: '#BAE6FD' }
  ];

  return (
    <div style={{ fontFamily: "'Inter', sans-serif", maxWidth: 900, margin: '0 auto', padding: '0 0 48px' }}>
      <style>{`
        @keyframes slideUp { from { opacity:0;transform:translateY(14px) } to { opacity:1;transform:translateY(0) } }
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>

      {/* Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 28, paddingBottom: 22,
        borderBottom: '1.5px solid #E2E8F0'
      }}>
        <div style={{
          width: 48, height: 48, borderRadius: 14,
          background: '#FFFBEB', border: '1.5px solid #FDE68A',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <ShieldCheck size={24} style={{ color: '#F59E0B' }} />
        </div>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 900, color: '#0F172A', margin: 0, letterSpacing: '-0.03em' }}>
            Admin Dashboard
          </h1>
          <p style={{ fontSize: 13, color: '#64748B', margin: '3px 0 0' }}>
            Manage and publish events for students
          </p>
        </div>
        <button
          onClick={() => navigate('/admin/profile')}
          style={{
            marginLeft: 'auto',
            display: 'flex', alignItems: 'center', gap: 7,
            background: '#F8FAFC', border: '1.5px solid #E2E8F0',
            borderRadius: 12, padding: '9px 18px', cursor: 'pointer',
            color: '#334155', fontWeight: 700, fontSize: 13,
            fontFamily: 'inherit', transition: 'all 0.18s'
          }}
        >
          <UserCircle size={18} />
          My Profile
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 14, marginBottom: 28 }}>
        {statCards.map(stat => (
          <div key={stat.label} style={{
            background: stat.bg, border: `1.5px solid ${stat.border}`,
            borderRadius: 14, padding: '18px 20px'
          }}>
            <div style={{ fontSize: 11, color: '#64748B', fontWeight: 700, marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {stat.label}
            </div>
            <div style={{ fontSize: 30, fontWeight: 900, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex', gap: 4, marginBottom: 22,
        background: '#F1F5F9', border: '1.5px solid #E2E8F0',
        borderRadius: 12, padding: 4, width: 'fit-content'
      }}>
        {tabs.map(t => {
          const Icon = t.icon;
          const active = tab === t.key;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              style={{
                display: 'flex', alignItems: 'center', gap: 7,
                padding: '9px 18px', borderRadius: 9,
                background: active ? (t.key === 'create' ? 'linear-gradient(135deg,#F59E0B,#D97706)' : '#fff') : 'transparent',
                border: 'none', cursor: 'pointer', fontFamily: 'inherit',
                color: active ? (t.key === 'create' ? '#fff' : '#0F172A') : '#64748B',
                fontWeight: active ? 800 : 600, fontSize: 13,
                boxShadow: active && t.key !== 'create' ? '0 1px 4px rgba(0,0,0,0.08)' : 'none',
                transition: 'all 0.2s'
              }}
            >
              <Icon size={15} />
              {t.label}
              {t.count !== undefined && (
                <span style={{
                  background: active ? '#F1F5F9' : '#E2E8F0',
                  color: '#475569',
                  borderRadius: 20, padding: '1px 8px', fontSize: 11, fontWeight: 800
                }}>{t.count}</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Tab Panel */}
      <div style={{
        background: '#fff', border: '1.5px solid #E2E8F0',
        borderRadius: 18, padding: '28px',
        boxShadow: '0 2px 12px rgba(0,0,0,0.05)'
      }}>
        {tab === 'events' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: 16, margin: 0 }}>All Events</h2>
              <button
                onClick={() => setTab('create')}
                style={{
                  display: 'flex', alignItems: 'center', gap: 6,
                  background: '#FFFBEB', border: '1.5px solid #FDE68A',
                  borderRadius: 10, color: '#B45309', cursor: 'pointer',
                  padding: '8px 16px', fontWeight: 700, fontSize: 13, fontFamily: 'inherit'
                }}
              >
                <PlusCircle size={15} /> Create New Event
              </button>
            </div>
            <EventList events={events} onDelete={handleDelete} onViewBrochure={(ev) => setBrochureModal(ev)} />
          </div>
        )}

        {tab === 'create' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24 }}>
              <button
                onClick={() => setTab('events')}
                style={{
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#64748B', display: 'flex', alignItems: 'center', gap: 4,
                  fontSize: 13, fontWeight: 600, padding: 0, fontFamily: 'inherit'
                }}
              >
                <ChevronRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Events
              </button>
              <span style={{ color: '#CBD5E1' }}>·</span>
              <h2 style={{ color: '#0F172A', fontWeight: 800, fontSize: 16, margin: 0 }}>Create New Event</h2>
            </div>
            <CreateEventForm onCreated={handleCreated} />
          </div>
        )}
      </div>

      {brochureModal && (
        <BrochureModal
          url={brochureModal.brochure}
          name={brochureModal.brochureName || `${brochureModal.title} – Brochure`}
          onClose={() => setBrochureModal(null)}
        />
      )}

      {toast && <Toast msg={toast.msg} type={toast.type} onClose={() => setToast(null)} />}
    </div>
  );
}
