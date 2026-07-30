import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Bell, QrCode, PhoneCall, Save, CheckCircle2,
  BookOpen, MapPin, Globe, Linkedin, Github,
  GraduationCap, Star, Plus, X, Camera, Sparkles
} from 'lucide-react';
import api, { MOCK_EVENTS } from '../services/api';
import AIRecommendationSection from '../components/AIRecommendationSection';

const SKILL_SUGGESTIONS = [
  'Python', 'JavaScript', 'React', 'Node.js', 'Java', 'C++', 'Machine Learning',
  'Deep Learning', 'TensorFlow', 'Flutter', 'SQL', 'MongoDB', 'AWS', 'Docker',
  'Figma', 'Unity', 'Arduino', 'ROS', 'Computer Vision', 'NLP'
];

const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', '5th Year (Integrated)'];
const DEPT_OPTIONS = [
  'Computer Science & Engineering', 'Information Technology', 'Electronics & Communication',
  'Mechanical Engineering', 'Civil Engineering', 'Electrical Engineering',
  'Data Science & AI', 'Biomedical Engineering', 'Chemical Engineering'
];

export default function StudentDashboardPage() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.search.includes('recommendations')) return 'recommendations';
    return 'profile';
  });

  useEffect(() => {
    if (location.search.includes('recommendations')) {
      setActiveTab('recommendations');
    }
  }, [location.search]);

  const [registrations, setRegistrations] = useState([]);
  const [showQrModal, setShowQrModal] = useState(null);
  const [saved, setSaved] = useState(false);
  const [skillInput, setSkillInput] = useState('');

  // Profile form state
  const [form, setForm] = useState({
    name: user?.name || '',
    college: user?.college || '',
    department: user?.department || '',
    year: user?.year || '',
    cgpa: user?.cgpa || '',
    bio: user?.bio || '',
    city: user?.city || '',
    state: user?.state || '',
    linkedin: user?.linkedin || '',
    github: user?.github || '',
    languages: user?.languages || [],
    skills: user?.skills || [],
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    emergencyRelation: user?.emergencyContact?.relation || 'Father'
  });

  const [notifications] = useState([
    {
      id: 1,
      title: 'Registration Confirmed 🎉',
      message: 'You registered for HackNova 2026: 36-Hour AI & Web3 Hackathon.',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'New Event Added 🚀',
      message: 'RoboQuest 2.0 at NIT Trichy has opened registrations. AI recommends this for you!',
      time: '5 hours ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Travel Safety Alert 🛡️',
      message: 'AI Travel Safety score updated for CyberShield 2026. Clear weather predicted.',
      time: '1 day ago',
      type: 'warning'
    }
  ]);

  useEffect(() => {
    api.get('/registrations/my-registrations')
      .then(res => {
        if (res.data.success) setRegistrations(res.data.data);
      })
      .catch(() => {
        setRegistrations([
          {
            _id: 'reg_1',
            event: MOCK_EVENTS[0],
            teamName: 'Team CyberKnights',
            registeredAt: '2026-07-20',
            qrCodeToken: 'CC-98234'
          }
        ]);
      });
  }, []);

  const handleFormChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAddSkill = (skill) => {
    const val = skill || skillInput.trim();
    if (val && !form.skills.includes(val)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, val] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) => {
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));
  };

  const handleSaveProfile = () => {
    updateProfile({
      ...form,
      emergencyContact: {
        name: form.emergencyName,
        phone: form.emergencyPhone,
        relation: form.emergencyRelation
      }
    });
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { key: 'profile', label: '👤 Profile & Settings', count: null },
    { key: 'recommendations', label: '🤖 AI Recommendations & Local Engine', count: null },
    { key: 'registrations', label: `🏆 Registered Events`, count: registrations.length },
    { key: 'notifications', label: `🔔 Notifications`, count: notifications.length }
  ];


  return (
    <div className="space-y-6" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Profile Header Card ──────────────────────────────── */}
      <div className="kaggle-card p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start gap-6"
        style={{ borderColor: 'rgba(32,190,255,0.2)' }}>

        <div className="relative shrink-0">
          <img
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
            alt={user?.name}
            className="w-24 h-24 rounded-2xl object-cover"
            style={{ border: '3px solid #20BEFF' }}
          />
          <button className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: '#20BEFF', border: '2px solid white' }}>
            <Camera size={13} style={{ color: '#0F1117' }} />
          </button>
        </div>

        <div className="flex-1 text-center md:text-left space-y-2">
          <div className="flex items-center gap-3 justify-center md:justify-start flex-wrap">
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--tw-prose-headings, #0F172A)', letterSpacing: '-0.02em' }}
              className="dark:text-white">
              {user?.name || 'Your Name'}
            </h1>
            <span className="px-3 py-1 rounded-full text-xs font-bold uppercase"
              style={{ background: 'rgba(32,190,255,0.1)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.25)' }}>
              🎓 Student
            </span>
          </div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
            {user?.department || 'Department'} • {user?.year || 'Year'}
          </p>
          <p className="text-sm text-slate-400">{user?.college || 'College Name'}</p>

          {/* Skill chips preview */}
          {(user?.skills || form.skills).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2 justify-center md:justify-start">
              {(user?.skills || form.skills).slice(0, 6).map(skill => (
                <span key={skill} className="px-2.5 py-1 rounded-lg text-xs font-semibold"
                  style={{ background: 'rgba(32,190,255,0.06)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.15)' }}>
                  {skill}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Emergency Contact Badge */}
        <div className="shrink-0 p-4 rounded-2xl text-sm"
          style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.2)' }}>
          <div className="font-bold flex items-center gap-1.5 mb-1" style={{ color: '#F59E0B' }}>
            <PhoneCall size={14} /> Emergency Contact
          </div>
          <div className="font-semibold text-slate-700 dark:text-slate-300 text-xs">
            {user?.emergencyContact?.name || 'Not set'}<br />
            <span className="font-normal text-slate-400">{user?.emergencyContact?.phone || '+91 XXXXX XXXXX'}</span>
          </div>
        </div>
      </div>

      {/* ─── Tabs ────────────────────────────────────────────── */}
      <div className="flex items-center gap-1 overflow-x-auto pb-1">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className="px-5 py-2.5 text-sm font-bold rounded-xl whitespace-nowrap transition-all"
            style={{
              background: activeTab === tab.key ? '#20BEFF' : 'transparent',
              color: activeTab === tab.key ? '#0F1117' : '#64748B',
              border: 'none', cursor: 'pointer'
            }}>
            {tab.label}{tab.count !== null ? ` (${tab.count})` : ''}
          </button>
        ))}
      </div>

      {/* ─── Tab: Profile Settings ────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-6 animate-fade-in-up">

          {/* ─── AI Recommendations Hero Teaser ─────────────────── */}
          <div className="relative rounded-2xl overflow-hidden p-5"
            style={{
              background: 'linear-gradient(135deg, rgba(32,190,255,0.1) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.05) 100%)',
              border: '1px solid rgba(32,190,255,0.22)'
            }}>
            {/* Glowing orb */}
            <div className="absolute top-0 right-0 w-56 h-56 pointer-events-none"
              style={{ background: 'radial-gradient(circle, rgba(32,190,255,0.1) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />

            <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center gap-4 justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl" style={{ background: 'rgba(32,190,255,0.12)', border: '1px solid rgba(32,190,255,0.25)' }}>
                  <Sparkles size={22} style={{ color: '#20BEFF' }} />
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-0.5">
                    <h2 className="text-slate-900 dark:text-white" style={{ fontSize: 17, fontWeight: 900, letterSpacing: '-0.02em' }}>
                      Recommended for You
                    </h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: '#20BEFF', color: '#0F1117' }}>AI</span>
                  </div>
                  <p style={{ fontSize: 12, color: '#64748B' }}>
                    Personalized events matched to your interests, department & year
                  </p>

                  {/* Preview match chips */}
                  <div className="flex flex-wrap gap-2 mt-3">
                    {[
                      { label: 'HackNova 2026', score: 97, color: '#10B981' },
                      { label: 'RoboQuest 2.0', score: 89, color: '#20BEFF' },
                      { label: 'CyberShield CTF', score: 84, color: '#8B5CF6' },
                    ].map(({ label, score, color }) => (
                      <div key={label} className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
                        style={{ background: `${color}12`, border: `1px solid ${color}25`, color }}>
                        <span>{label}</span>
                        <span style={{ opacity: 0.8 }}>{score}% match</span>
                      </div>
                    ))}
                    <div className="flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold"
                      style={{ background: 'rgba(100,116,139,0.08)', color: '#64748B' }}>+ more</div>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setActiveTab('recommendations')}
                className="kaggle-btn-primary text-xs px-6 py-2.5 shrink-0"
                style={{ borderRadius: 12 }}>
                <Sparkles size={14} /> View AI Recommendations
              </button>
            </div>
          </div>


          <div className="kaggle-card p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(32,190,255,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(32,190,255,0.1)' }}>
                <GraduationCap size={18} style={{ color: '#20BEFF' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700 }} className="text-slate-900 dark:text-white">Academic Information</h2>
                <p style={{ fontSize: 12 }} className="text-slate-400">Your educational details for AI event matching</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Full Name</label>
                <input type="text" value={form.name}
                  onChange={e => handleFormChange('name', e.target.value)}
                  className="kaggle-input" placeholder="Your full name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">College / University</label>
                <input type="text" value={form.college}
                  onChange={e => handleFormChange('college', e.target.value)}
                  className="kaggle-input" placeholder="e.g. NIT Trichy" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Department / Branch</label>
                <select value={form.department}
                  onChange={e => handleFormChange('department', e.target.value)}
                  className="kaggle-input">
                  <option value="">Select department</option>
                  {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Current Year</label>
                <select value={form.year}
                  onChange={e => handleFormChange('year', e.target.value)}
                  className="kaggle-input">
                  <option value="">Select year</option>
                  {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">CGPA / Percentage</label>
                <input type="text" value={form.cgpa}
                  onChange={e => handleFormChange('cgpa', e.target.value)}
                  className="kaggle-input" placeholder="e.g. 8.7 / 92%" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">City</label>
                <input type="text" value={form.city}
                  onChange={e => handleFormChange('city', e.target.value)}
                  className="kaggle-input" placeholder="e.g. Trichy" />
              </div>
            </div>

            {/* Skills Section */}
            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-2">Technical Skills</label>
              <div className="flex gap-2 mb-3">
                <input type="text" value={skillInput}
                  onChange={e => setSkillInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  placeholder="Add a skill (e.g. Python, React)..."
                  className="kaggle-input flex-1 text-sm" />
                <button onClick={() => handleAddSkill()}
                  className="kaggle-btn-primary px-4 py-2 text-xs shrink-0">
                  <Plus size={14} /> Add
                </button>
              </div>

              {/* Skill suggestions */}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                  <button key={s} onClick={() => handleAddSkill(s)}
                    className="px-2.5 py-1 rounded-lg text-xs font-medium transition-colors"
                    style={{ background: 'rgba(100,116,139,0.08)', color: '#64748B', border: '1px solid rgba(100,116,139,0.15)', cursor: 'pointer' }}>
                    + {s}
                  </button>
                ))}
              </div>

              {/* Selected Skills */}
              <div className="flex flex-wrap gap-1.5">
                {form.skills.map(skill => (
                  <span key={skill} className="px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5"
                    style={{ background: 'rgba(32,190,255,0.1)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.2)' }}>
                    {skill}
                    <X size={12} className="cursor-pointer hover:text-rose-400" onClick={() => handleRemoveSkill(skill)} />
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Personal Information */}
          <div className="kaggle-card p-6 space-y-5">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(100,116,139,0.1)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(139,92,246,0.1)' }}>
                <User size={18} style={{ color: '#8B5CF6' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700 }} className="text-slate-900 dark:text-white">Personal Information</h2>
                <p style={{ fontSize: 12 }} className="text-slate-400">About you and your online presence</p>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Bio / About Me</label>
              <textarea value={form.bio} rows={3}
                onChange={e => handleFormChange('bio', e.target.value)}
                placeholder="Write a short bio about yourself, your interests, and goals..."
                className="kaggle-input resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">State</label>
                <input type="text" value={form.state}
                  onChange={e => handleFormChange('state', e.target.value)}
                  className="kaggle-input" placeholder="e.g. Tamil Nadu" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">LinkedIn Profile</label>
                <div className="relative">
                  <Linkedin size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type="url" value={form.linkedin}
                    onChange={e => handleFormChange('linkedin', e.target.value)}
                    placeholder="https://linkedin.com/in/..."
                    className="kaggle-input" style={{ paddingLeft: 36 }} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">GitHub Profile</label>
                <div className="relative">
                  <Github size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                  <input type="url" value={form.github}
                    onChange={e => handleFormChange('github', e.target.value)}
                    placeholder="https://github.com/..."
                    className="kaggle-input" style={{ paddingLeft: 36 }} />
                </div>
              </div>
            </div>
          </div>

          {/* Emergency Contact */}
          <div className="kaggle-card p-6 space-y-4">
            <div className="flex items-center gap-3 pb-4" style={{ borderBottom: '1px solid rgba(245,158,11,0.15)' }}>
              <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                style={{ background: 'rgba(245,158,11,0.1)' }}>
                <PhoneCall size={18} style={{ color: '#F59E0B' }} />
              </div>
              <div>
                <h2 style={{ fontSize: 15, fontWeight: 700 }} className="text-slate-900 dark:text-white">Emergency Contact</h2>
                <p style={{ fontSize: 12 }} className="text-slate-400">Used for travel safety alerts when attending distant events</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Contact Name</label>
                <input type="text" value={form.emergencyName}
                  onChange={e => handleFormChange('emergencyName', e.target.value)}
                  className="kaggle-input" placeholder="Parent / Guardian name" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Phone Number</label>
                <input type="tel" value={form.emergencyPhone}
                  onChange={e => handleFormChange('emergencyPhone', e.target.value)}
                  className="kaggle-input" placeholder="+91 XXXXX XXXXX" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Relation</label>
                <select value={form.emergencyRelation}
                  onChange={e => handleFormChange('emergencyRelation', e.target.value)}
                  className="kaggle-input">
                  {['Father', 'Mother', 'Guardian', 'Sibling', 'Spouse', 'Friend'].map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button onClick={handleSaveProfile}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-bold transition-all"
              style={{
                background: saved ? '#10B981' : '#20BEFF',
                color: '#0F1117', border: 'none', cursor: 'pointer',
                boxShadow: saved ? '0 4px 16px rgba(16,185,129,0.3)' : '0 4px 16px rgba(32,190,255,0.3)'
              }}>
              {saved ? (
                <><CheckCircle2 size={16} /> Profile Saved!</>
              ) : (
                <><Save size={16} /> Save Profile</>
              )}
            </button>
          </div>
        </div>
      )}

      {/* ─── Tab: AI Recommendations & Local Engine ────────────── */}
      {activeTab === 'recommendations' && (
        <div className="space-y-6 animate-fade-in-up">
          <AIRecommendationSection />
        </div>
      )}

      {/* ─── Tab: Registered Events ──────────────────────────── */}
      {activeTab === 'registrations' && (
        <div className="space-y-4 animate-fade-in-up">
          {registrations.length === 0 ? (
            <div className="kaggle-card p-12 text-center space-y-3">
              <QrCode size={40} className="mx-auto text-slate-300 dark:text-slate-700" />
              <p className="text-base font-semibold text-slate-400">No registered events yet</p>
              <p className="text-sm text-slate-400">Browse and register for events to see them here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {registrations.map((reg) => (
                <div key={reg._id} className="kaggle-card p-6 space-y-4 hover:shadow-md transition-all">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold px-3 py-1 rounded-full"
                      style={{ background: 'rgba(16,185,129,0.1)', color: '#10B981', border: '1px solid rgba(16,185,129,0.2)' }}>
                      ✓ Pass Confirmed
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{reg.qrCodeToken}</span>
                  </div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">{reg.event?.title}</h3>
                  <p className="text-sm text-slate-500">{reg.event?.collegeName} • {reg.event?.venue}</p>
                  <div className="pt-4 flex justify-between items-center" style={{ borderTop: '1px solid rgba(100,116,139,0.1)' }}>
                    <span className="text-sm text-slate-400">
                      {new Date(reg.event?.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button onClick={() => setShowQrModal(reg)}
                      className="kaggle-btn-primary text-xs px-4 py-2">
                      <QrCode size={14} /> Digital Pass
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Notifications ──────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-3 animate-fade-in-up">
          {notifications.map((n) => {
            const colors = {
              success: { bg: 'rgba(16,185,129,0.06)', border: 'rgba(16,185,129,0.15)', icon: '#10B981' },
              info: { bg: 'rgba(32,190,255,0.06)', border: 'rgba(32,190,255,0.15)', icon: '#20BEFF' },
              warning: { bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.15)', icon: '#F59E0B' }
            }[n.type] || { bg: 'rgba(100,116,139,0.06)', border: 'rgba(100,116,139,0.15)', icon: '#94A3B8' };

            return (
              <div key={n.id} className="kaggle-card p-5 flex items-start gap-4"
                style={{ background: colors.bg, borderColor: colors.border }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ background: `${colors.icon}20` }}>
                  <Bell size={18} style={{ color: colors.icon }} />
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-center mb-1">
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                    <span className="text-xs text-slate-400">{n.time}</span>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-300">{n.message}</p>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ─── QR Modal ────────────────────────────────────────── */}
      {showQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
          <div className="kaggle-card p-8 max-w-sm w-full text-center space-y-5 shadow-2xl animate-fade-in-up">
            <h3 className="text-xl font-black text-slate-900 dark:text-white">Digital Entry Pass</h3>
            <p className="text-sm text-slate-400">{showQrModal.event?.title}</p>
            <div className="p-8 bg-white rounded-2xl w-48 h-48 mx-auto flex items-center justify-center"
              style={{ border: '1px solid #E2E8F0' }}>
              <QrCode size={120} style={{ color: '#0F1117' }} />
            </div>
            <p className="text-base font-mono font-black" style={{ color: '#20BEFF' }}>{showQrModal.qrCodeToken}</p>
            <p className="text-xs text-slate-400">Present this QR at campus security gate</p>
            <button onClick={() => setShowQrModal(null)} className="kaggle-btn-primary mx-auto px-8 py-3 text-sm font-bold">
              Close Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
