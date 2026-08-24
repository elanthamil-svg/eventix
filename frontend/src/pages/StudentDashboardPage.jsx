import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  User, Bell, QrCode, PhoneCall, Save, CheckCircle2,
  BookOpen, MapPin, Globe, Linkedin, Github,
  GraduationCap, Star, Plus, X, Camera, Sparkles,
  ShieldCheck, RefreshCw
} from 'lucide-react';
import api, { MOCK_EVENTS } from '../services/api';

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

// ─── Reusable Input/Label helpers ──────────────────────────────
const inputCls = 'w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 transition-colors';
const selectCls = inputCls;

function Label({ children }) {
  return (
    <label className="block text-sm font-semibold text-slate-600 dark:text-slate-400 mb-2">
      {children}
    </label>
  );
}

function SectionHeader({ icon: Icon, title, desc }) {
  return (
    <div className="flex items-center gap-4 pb-5 border-b border-slate-100 dark:border-slate-800">
      <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
        <Icon size={22} />
      </div>
      <div>
        <h2 className="text-base font-bold text-slate-900 dark:text-white">{title}</h2>
        <p className="text-sm text-slate-500 mt-0.5">{desc}</p>
      </div>
    </div>
  );
}

// ─── Card wrapper ───────────────────────────────────────────────
function Card({ children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export default function StudentDashboardPage() {
  const { user, updateProfile } = useAuth();
  const location = useLocation();
  const fileRef = useRef();

  const [activeTab, setActiveTab] = useState(() => {
    if (location.search.includes('recommendations')) return 'recommendations';
    return 'profile';
  });

  useEffect(() => {
    if (location.search.includes('recommendations')) setActiveTab('recommendations');
  }, [location.search]);

  const [registrations, setRegistrations] = useState([]);
  const [showQrModal, setShowQrModal] = useState(null);
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');

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
    avatar: user?.avatar || '',
    emergencyName: user?.emergencyContact?.name || '',
    emergencyPhone: user?.emergencyContact?.phone || '',
    emergencyRelation: user?.emergencyContact?.relation || 'Father'
  });

  const [notifications] = useState([
    {
      id: 1,
      title: 'Registration Confirmed',
      message: 'You registered for HackNova 2026: 36-Hour AI & Web3 Hackathon.',
      time: '2 hours ago',
      type: 'success'
    },
    {
      id: 2,
      title: 'New Event Added',
      message: 'RoboQuest 2.0 at NIT Trichy has opened registrations. AI recommends this for you!',
      time: '5 hours ago',
      type: 'info'
    },
    {
      id: 3,
      title: 'Travel Safety Alert',
      message: 'AI Travel Safety score updated for CyberShield 2026. Clear weather predicted.',
      time: '1 day ago',
      type: 'warning'
    }
  ]);

  useEffect(() => {
    api.get('/registrations/my-registrations')
      .then(res => { if (res.data.success) setRegistrations(res.data.data); })
      .catch(() => {
        setRegistrations([{
          _id: 'reg_1',
          event: MOCK_EVENTS[0],
          teamName: 'Team CyberKnights',
          registeredAt: '2026-07-20',
          qrCodeToken: 'CC-98234'
        }]);
      });
  }, []);

  const handleFormChange = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => handleFormChange('avatar', ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddSkill = (skill) => {
    const val = skill || skillInput.trim();
    if (val && !form.skills.includes(val)) {
      setForm(prev => ({ ...prev, skills: [...prev.skills, val] }));
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skill) =>
    setForm(prev => ({ ...prev, skills: prev.skills.filter(s => s !== skill) }));

  const handleSaveProfile = async () => {
    setSaving(true);
    try {
      await api.put('/auth/profile', {
        ...form,
        avatar: form.avatar,
        emergencyContact: {
          name: form.emergencyName,
          phone: form.emergencyPhone,
          relation: form.emergencyRelation
        }
      });
    } catch (_) {}
    updateProfile({
      ...form,
      avatar: form.avatar,
      emergencyContact: {
        name: form.emergencyName,
        phone: form.emergencyPhone,
        relation: form.emergencyRelation
      }
    });
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const TABS = [
    { key: 'profile', label: 'Profile & Settings', count: null },
    { key: 'registrations', label: 'Registered Events', count: registrations.length },
    { key: 'notifications', label: 'Notifications', count: notifications.length }
  ];

  const notifColor = (type) => ({
    success: 'border-l-4 border-l-emerald-500 bg-emerald-50/50 dark:bg-emerald-900/10',
    info: 'border-l-4 border-l-slate-400 bg-slate-50 dark:bg-slate-800/40',
    warning: 'border-l-4 border-l-amber-400 bg-amber-50/50 dark:bg-amber-900/10'
  }[type] || '');

  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* ─── Profile Header Card ─────────────────────────────── */}
      <Card>
        <div className="flex flex-col sm:flex-row items-start gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={form.avatar || user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'}
              alt={user?.name}
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
            />
            <button
              onClick={() => fileRef.current?.click()}
              className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
            >
              <Camera size={14} />
            </button>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name, Role, Details */}
          <div className="flex-1 space-y-2 min-w-0">
            <div className="flex items-center gap-3 flex-wrap">
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name || 'Your Name'}
              </h1>
              <span className="px-3 py-1 rounded-full text-xs font-bold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 uppercase tracking-wide">
                Student
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400 flex-wrap">
              <GraduationCap size={15} className="text-slate-400 shrink-0" />
              <span>{user?.department || 'Department'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{user?.year || 'Year'}</span>
              <span className="text-slate-300 dark:text-slate-700">•</span>
              <span>{user?.college || 'College'}</span>
            </div>

            {/* Skill Pills */}
            {(user?.skills || form.skills).length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {(user?.skills || form.skills).slice(0, 6).map(skill => (
                  <span key={skill} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Emergency Contact Badge */}
          <div className="shrink-0 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-1 text-sm min-w-[180px]">
            <div className="font-bold flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
              <PhoneCall size={14} className="text-slate-500" /> Emergency
            </div>
            <div className="font-semibold text-slate-800 dark:text-slate-200">
              {user?.emergencyContact?.name || 'Not set'}
            </div>
            <div className="text-slate-500 text-xs">
              {user?.emergencyContact?.phone || '+91 XXXXX XXXXX'}
            </div>
          </div>
        </div>
      </Card>

      {/* ─── Tabs ─────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 overflow-x-auto pb-0">
        {TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-5 py-3 text-sm font-bold whitespace-nowrap border-b-2 transition-colors ${
              activeTab === tab.key
                ? 'border-slate-900 dark:border-white text-slate-900 dark:text-white'
                : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {tab.label}
            {tab.count !== null && (
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                activeTab === tab.key
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ─── Tab: Profile Settings ────────────────────────────── */}
      {activeTab === 'profile' && (
        <div className="space-y-5">

          {/* Academic Information */}
          <Card>
            <div className="space-y-6">
              <SectionHeader icon={GraduationCap} title="Academic Information" desc="Your educational details used for AI event matching" />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>Full Name</Label>
                  <input type="text" value={form.name} onChange={e => handleFormChange('name', e.target.value)} className={inputCls} placeholder="Your full name" />
                </div>
                <div>
                  <Label>College / University</Label>
                  <input type="text" value={form.college} onChange={e => handleFormChange('college', e.target.value)} className={inputCls} placeholder="e.g. NIT Trichy" />
                </div>
                <div>
                  <Label>Department / Branch</Label>
                  <select value={form.department} onChange={e => handleFormChange('department', e.target.value)} className={selectCls}>
                    <option value="">Select department</option>
                    {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                </div>
                <div>
                  <Label>Current Year</Label>
                  <select value={form.year} onChange={e => handleFormChange('year', e.target.value)} className={selectCls}>
                    <option value="">Select year</option>
                    {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
                <div>
                  <Label>CGPA / Percentage</Label>
                  <input type="text" value={form.cgpa} onChange={e => handleFormChange('cgpa', e.target.value)} className={inputCls} placeholder="e.g. 8.7 / 92%" />
                </div>
                <div>
                  <Label>City</Label>
                  <input type="text" value={form.city} onChange={e => handleFormChange('city', e.target.value)} className={inputCls} placeholder="e.g. Trichy" />
                </div>
              </div>

              {/* Skills */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">Technical Skills</h3>
                  <p className="text-sm text-slate-500 mt-0.5">Add the technologies and tools you work with.</p>
                </div>

                {/* Skill input */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={skillInput}
                    onChange={e => setSkillInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                    placeholder="Type a skill (e.g. Python, React) and press Enter…"
                    className={inputCls + ' flex-1'}
                  />
                  <button
                    onClick={() => handleAddSkill()}
                    className="flex items-center gap-1.5 px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-sm font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shrink-0"
                  >
                    <Plus size={15} /> Add
                  </button>
                </div>

                {/* Suggestions */}
                <div className="flex flex-wrap gap-2">
                  {SKILL_SUGGESTIONS.filter(s => !form.skills.includes(s)).slice(0, 10).map(s => (
                    <button
                      key={s}
                      onClick={() => handleAddSkill(s)}
                      className="px-3 py-1.5 rounded-full text-sm font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
                    >
                      + {s}
                    </button>
                  ))}
                </div>

                {/* Selected skills */}
                {form.skills.length > 0 && (
                  <div className="flex flex-wrap gap-2 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800">
                    {form.skills.map(skill => (
                      <span
                        key={skill}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-slate-900 dark:bg-white text-white dark:text-slate-900"
                      >
                        {skill}
                        <button onClick={() => handleRemoveSkill(skill)} className="opacity-70 hover:opacity-100 transition-opacity">
                          <X size={13} />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Personal Information */}
          <Card>
            <div className="space-y-5">
              <SectionHeader icon={User} title="Personal Information" desc="About you and your online presence" />

              <div>
                <Label>Bio / About Me</Label>
                <textarea
                  value={form.bio}
                  rows={4}
                  onChange={e => handleFormChange('bio', e.target.value)}
                  placeholder="Write a short bio about yourself, your interests, and goals…"
                  className={inputCls + ' resize-none leading-relaxed'}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                  <Label>State</Label>
                  <input type="text" value={form.state} onChange={e => handleFormChange('state', e.target.value)} className={inputCls} placeholder="e.g. Tamil Nadu" />
                </div>

                <div>
                  <Label>LinkedIn Profile</Label>
                  <div className="relative">
                    <Linkedin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="url" value={form.linkedin} onChange={e => handleFormChange('linkedin', e.target.value)} placeholder="https://linkedin.com/in/..." className={inputCls + ' pl-10'} />
                  </div>
                </div>

                <div>
                  <Label>GitHub Profile</Label>
                  <div className="relative">
                    <Github size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input type="url" value={form.github} onChange={e => handleFormChange('github', e.target.value)} placeholder="https://github.com/..." className={inputCls + ' pl-10'} />
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Emergency Contact */}
          <Card>
            <div className="space-y-5">
              <SectionHeader icon={PhoneCall} title="Emergency Contact" desc="Used for travel safety alerts when attending distant events" />

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                  <Label>Contact Name</Label>
                  <input type="text" value={form.emergencyName} onChange={e => handleFormChange('emergencyName', e.target.value)} className={inputCls} placeholder="Parent / Guardian name" />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <input type="tel" value={form.emergencyPhone} onChange={e => handleFormChange('emergencyPhone', e.target.value)} className={inputCls} placeholder="+91 XXXXX XXXXX" />
                </div>
                <div>
                  <Label>Relation</Label>
                  <select value={form.emergencyRelation} onChange={e => handleFormChange('emergencyRelation', e.target.value)} className={selectCls}>
                    {['Father', 'Mother', 'Guardian', 'Sibling', 'Spouse', 'Friend'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={handleSaveProfile}
              disabled={saving}
              className={`flex items-center gap-2 px-8 py-3 rounded-full text-sm font-bold transition-all shadow-sm ${
                saved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100'
              } disabled:opacity-60`}
            >
              {saving
                ? <><RefreshCw size={16} className="animate-spin" /> Saving…</>
                : saved
                  ? <><CheckCircle2 size={16} /> Profile Saved!</>
                  : <><Save size={16} /> Save Profile</>
              }
            </button>
          </div>
        </div>
      )}

      {/* ─── Tab: Registered Events ──────────────────────────── */}
      {activeTab === 'registrations' && (
        <div className="space-y-5">
          {registrations.length === 0 ? (
            <Card className="py-16 text-center space-y-4">
              <QrCode size={44} className="mx-auto text-slate-300 dark:text-slate-700" />
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Registered Events</h3>
              <p className="text-sm text-slate-500 max-w-sm mx-auto">Browse and register for events to see your digital passes here.</p>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {registrations.map((reg) => (
                <Card key={reg._id} className="!p-6 space-y-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors cursor-default">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold px-3 py-1.5 rounded-full bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                      ✓ Pass Confirmed
                    </span>
                    <span className="text-xs font-mono font-bold text-slate-400">{reg.qrCodeToken}</span>
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">{reg.event?.title}</h3>
                    <p className="text-sm text-slate-500 mt-1">{reg.event?.collegeName} · {reg.event?.venue}</p>
                  </div>

                  <div className="pt-4 flex justify-between items-center border-t border-slate-100 dark:border-slate-800">
                    <span className="text-sm font-medium text-slate-500">
                      {new Date(reg.event?.eventDate || Date.now()).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </span>
                    <button
                      onClick={() => setShowQrModal(reg)}
                      className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
                    >
                      <QrCode size={14} /> Digital Pass
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ─── Tab: Notifications ───────────────────────────────── */}
      {activeTab === 'notifications' && (
        <div className="space-y-4">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-start gap-4 shadow-sm ${notifColor(n.type)}`}
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                <Bell size={20} className="text-slate-600 dark:text-slate-300" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-start mb-1 gap-3">
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">{n.title}</h4>
                  <span className="text-xs text-slate-400 shrink-0">{n.time}</span>
                </div>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">{n.message}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ─── QR Modal ─────────────────────────────────────────── */}
      {showQrModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)' }}
          onClick={() => setShowQrModal(null)}
        >
          <div
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-8 max-w-sm w-full text-center space-y-5 shadow-2xl"
            onClick={e => e.stopPropagation()}
          >
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Digital Entry Pass</h3>
              <p className="text-sm text-slate-500 mt-1">{showQrModal.event?.title}</p>
            </div>

            <div className="p-6 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-48 h-48 mx-auto flex items-center justify-center">
              <QrCode size={120} className="text-slate-900 dark:text-white" />
            </div>

            <div>
              <p className="text-lg font-mono font-black text-slate-900 dark:text-white">{showQrModal.qrCodeToken}</p>
              <p className="text-xs text-slate-500 mt-1">Present this code at the campus security gate</p>
            </div>

            <button
              onClick={() => setShowQrModal(null)}
              className="w-full py-3 rounded-full text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors"
            >
              Close Pass
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
