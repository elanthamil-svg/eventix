/**
 * AdminProfilePage.jsx
 * Admin professional profile editor — clean monochrome use.ai aesthetic.
 * Lets the admin save/edit professional details: title, org, bio, expertise, links, location.
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  User, Briefcase, Globe, Phone, Linkedin, Twitter, MapPin,
  Save, Edit2, Camera, Check, X, Plus, Trash2, Star,
  BarChart2, CalendarCheck, Award, Link2, RefreshCw, ShieldCheck
} from 'lucide-react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';

const EXPERTISE_SUGGESTIONS = [
  'Event Management', 'Platform Administration', 'AI & Machine Learning',
  'Data Analytics', 'Software Engineering', 'Product Management',
  'Marketing & Outreach', 'UI/UX Design', 'Student Affairs',
  'Campus Partnerships', 'Cybersecurity', 'Cloud Infrastructure',
  'Full-Stack Development', 'DevOps', 'Content Moderation'
];

function StatCard({ icon: Icon, label, value, sub }) {
  return (
    <div className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-1">
      <div className="flex items-center gap-2 text-slate-400">
        <Icon size={15} />
        <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className="text-2xl font-bold text-slate-900 dark:text-white">{value}</div>
      {sub && <div className="text-xs text-slate-500">{sub}</div>}
    </div>
  );
}

export default function AdminProfilePage() {
  const { user, updateProfile } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name || '',
    avatar: user?.avatar || '',
    title: user?.adminProfile?.title || '',
    organisation: user?.adminProfile?.organisation || 'Eventix HQ',
    bio: user?.adminProfile?.bio || '',
    website: user?.adminProfile?.website || '',
    officialPhone: user?.adminProfile?.officialPhone || '',
    linkedin: user?.adminProfile?.linkedin || '',
    twitter: user?.adminProfile?.twitter || '',
    expertise: user?.adminProfile?.expertise || [],
    location: user?.adminProfile?.location || '',
    yearsOfExperience: user?.adminProfile?.yearsOfExperience || 0,
    totalEventsManaged: user?.adminProfile?.totalEventsManaged || 0,
    profileVisible: user?.adminProfile?.profileVisible !== false
  });

  const [editMode, setEditMode] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expertiseInput, setExpertiseInput] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [errors, setErrors] = useState({});
  const fileRef = useRef();

  // Reset to db data on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await api.get('/admin/profile');
        if (res.data?.success && res.data?.data) {
          const u = res.data.data;
          setProfile({
            name: u.name || '',
            avatar: u.avatar || '',
            title: u.adminProfile?.title || '',
            organisation: u.adminProfile?.organisation || 'Eventix HQ',
            bio: u.adminProfile?.bio || '',
            website: u.adminProfile?.website || '',
            officialPhone: u.adminProfile?.officialPhone || '',
            linkedin: u.adminProfile?.linkedin || '',
            twitter: u.adminProfile?.twitter || '',
            expertise: u.adminProfile?.expertise || [],
            location: u.adminProfile?.location || '',
            yearsOfExperience: u.adminProfile?.yearsOfExperience || 0,
            totalEventsManaged: u.adminProfile?.totalEventsManaged || 0,
            profileVisible: u.adminProfile?.profileVisible !== false
          });
        }
      } catch (_) {}
    };
    fetchProfile();
  }, []);

  const set = (k, v) => setProfile(p => ({ ...p, [k]: v }));

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set('avatar', ev.target.result);
    reader.readAsDataURL(file);
  };

  const addExpertise = (tag) => {
    const val = (tag || expertiseInput).trim();
    if (!val || profile.expertise.includes(val)) { setExpertiseInput(''); return; }
    set('expertise', [...profile.expertise, val]);
    setExpertiseInput('');
    setShowSuggestions(false);
  };

  const removeExpertise = (tag) => {
    set('expertise', profile.expertise.filter(t => t !== tag));
  };

  const validate = () => {
    const e = {};
    if (!profile.name.trim()) e.name = 'Display name is required.';
    if (profile.website && !/^https?:\/\/.+/.test(profile.website)) e.website = 'Enter a valid URL (https://...)';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    setSaving(true);
    try {
      const res = await api.put('/admin/profile', profile);
      if (res.data?.success) {
        updateProfile({ ...user, name: profile.name, avatar: profile.avatar, adminProfile: profile });
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
        setEditMode(false);
      }
    } catch (_) {
      // Offline fallback — save locally
      updateProfile({ ...user, name: profile.name, avatar: profile.avatar, adminProfile: profile });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
      setEditMode(false);
    } finally {
      setSaving(false);
    }
  };

  const filteredSuggestions = EXPERTISE_SUGGESTIONS.filter(
    s => !profile.expertise.includes(s) && s.toLowerCase().includes(expertiseInput.toLowerCase())
  );

  // ─── Input field helper ──────────────────────────────────────────
  const inputCls = (err) =>
    `w-full px-4 py-3 bg-slate-50 dark:bg-slate-800/80 border ${err ? 'border-red-400' : 'border-slate-200 dark:border-slate-700'} rounded-xl text-sm font-medium text-slate-900 dark:text-white focus:outline-none focus:border-slate-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed`;

  const Label = ({ children }) => (
    <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
      {children}
    </label>
  );

  const memberSince = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })
    : 'N/A';

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 font-sans">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-800 dark:text-slate-200 shrink-0">
            <User size={22} />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900 dark:text-white">Admin Profile</h1>
            <p className="text-sm text-slate-500">Manage your professional details and public presence</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          {!editMode ? (
            <button
              onClick={() => setEditMode(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 transition-colors shadow-sm"
            >
              <Edit2 size={15} /> Edit Profile
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setEditMode(false); setErrors({}); }}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-slate-400 transition-colors"
              >
                <X size={14} /> Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-2 px-5 py-2 rounded-full text-sm font-bold bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 transition-colors shadow-sm disabled:opacity-60"
              >
                {saving
                  ? <RefreshCw size={14} className="animate-spin" />
                  : saved
                    ? <Check size={14} />
                    : <Save size={14} />}
                <span>{saving ? 'Saving…' : saved ? 'Saved!' : 'Save Changes'}</span>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ─── Quick Stats ─── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard icon={ShieldCheck} label="Role" value="Admin" sub="Platform moderator" />
        <StatCard icon={CalendarCheck} label="Events Managed" value={profile.totalEventsManaged || 0} sub="Total events handled" />
        <StatCard icon={Star} label="Experience" value={`${profile.yearsOfExperience || 0} yrs`} sub="Years of expertise" />
        <StatCard icon={Award} label="Member Since" value={memberSince} sub="Account creation date" />
      </div>

      {/* ─── Avatar + Identity ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <User size={18} className="text-slate-500" /> Identity & Avatar
        </h2>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
          {/* Avatar */}
          <div className="relative shrink-0">
            <img
              src={profile.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200'}
              alt="Admin avatar"
              className="w-24 h-24 rounded-2xl object-cover border-2 border-slate-200 dark:border-slate-700 shadow-sm"
            />
            {editMode && (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 flex items-center justify-center shadow-md border-2 border-white dark:border-slate-900"
              >
                <Camera size={14} />
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          {/* Name, title, org */}
          <div className="flex-1 min-w-0 space-y-4 w-full">
            <div>
              <Label>Display Name *</Label>
              <input
                type="text"
                value={profile.name}
                onChange={e => set('name', e.target.value)}
                disabled={!editMode}
                className={inputCls(errors.name)}
                placeholder="Your full name"
              />
              {errors.name && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.name}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label>Professional Title</Label>
                <input
                  type="text"
                  value={profile.title}
                  onChange={e => set('title', e.target.value)}
                  disabled={!editMode}
                  className={inputCls()}
                  placeholder="e.g. Platform Administrator"
                />
              </div>
              <div>
                <Label>Organisation / Institution</Label>
                <input
                  type="text"
                  value={profile.organisation}
                  onChange={e => set('organisation', e.target.value)}
                  disabled={!editMode}
                  className={inputCls()}
                  placeholder="e.g. Eventix HQ"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Bio ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Briefcase size={18} className="text-slate-500" /> About & Bio
        </h2>
        <div>
          <Label>Professional Bio</Label>
          <textarea
            rows={4}
            value={profile.bio}
            onChange={e => set('bio', e.target.value)}
            disabled={!editMode}
            className={`${inputCls()} resize-none leading-relaxed`}
            placeholder="Write a short professional bio visible to students and organisers…"
          />
          <p className="text-xs text-slate-400 mt-1">{profile.bio.length} / 400 characters</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Location / City</Label>
            <div className="relative">
              <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={profile.location}
                onChange={e => set('location', e.target.value)}
                disabled={!editMode}
                className={`${inputCls()} pl-10`}
                placeholder="e.g. Chennai, Tamil Nadu"
              />
            </div>
          </div>
          <div>
            <Label>Official Phone</Label>
            <div className="relative">
              <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={profile.officialPhone}
                onChange={e => set('officialPhone', e.target.value)}
                disabled={!editMode}
                className={`${inputCls()} pl-10`}
                placeholder="+91 98xxx xxxxx"
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Links & Social ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Link2 size={18} className="text-slate-500" /> Links & Social
        </h2>

        <div className="space-y-4">
          <div>
            <Label>Website / Portfolio URL</Label>
            <div className="relative">
              <Globe size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                value={profile.website}
                onChange={e => set('website', e.target.value)}
                disabled={!editMode}
                className={`${inputCls(errors.website)} pl-10`}
                placeholder="https://yourdomain.com"
              />
            </div>
            {errors.website && <p className="text-xs text-red-500 mt-1 font-semibold">{errors.website}</p>}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>LinkedIn URL</Label>
              <div className="relative">
                <Linkedin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={profile.linkedin}
                  onChange={e => set('linkedin', e.target.value)}
                  disabled={!editMode}
                  className={`${inputCls()} pl-10`}
                  placeholder="https://linkedin.com/in/yourname"
                />
              </div>
            </div>
            <div>
              <Label>Twitter / X URL</Label>
              <div className="relative">
                <Twitter size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="url"
                  value={profile.twitter}
                  onChange={e => set('twitter', e.target.value)}
                  disabled={!editMode}
                  className={`${inputCls()} pl-10`}
                  placeholder="https://twitter.com/yourhandle"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Expertise Tags ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-4 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <Award size={18} className="text-slate-500" /> Areas of Expertise
        </h2>

        {/* Current tags */}
        <div className="flex flex-wrap gap-2 min-h-[36px]">
          {profile.expertise.length === 0 && !editMode && (
            <p className="text-sm text-slate-400">No expertise tags added yet.</p>
          )}
          {profile.expertise.map(tag => (
            <span
              key={tag}
              className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200"
            >
              {tag}
              {editMode && (
                <button
                  type="button"
                  onClick={() => removeExpertise(tag)}
                  className="text-slate-400 hover:text-red-500 transition-colors"
                >
                  <X size={12} />
                </button>
              )}
            </span>
          ))}
        </div>

        {/* Add expertise input */}
        {editMode && (
          <div className="relative">
            <Label>Add Expertise Tag</Label>
            <div className="flex gap-2">
              <input
                type="text"
                value={expertiseInput}
                onChange={e => { setExpertiseInput(e.target.value); setShowSuggestions(true); }}
                onFocus={() => setShowSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addExpertise(); } }}
                className={inputCls()}
                placeholder="Type a skill and press Enter or pick a suggestion"
              />
              <button
                type="button"
                onClick={() => addExpertise()}
                className="px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors flex items-center gap-1.5 text-xs font-bold shrink-0"
              >
                <Plus size={15} /> Add
              </button>
            </div>

            {/* Suggestions Dropdown */}
            {showSuggestions && filteredSuggestions.length > 0 && (
              <div className="absolute top-full mt-1 left-0 right-0 z-20 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg overflow-hidden">
                {filteredSuggestions.slice(0, 8).map(s => (
                  <button
                    key={s}
                    type="button"
                    onMouseDown={() => addExpertise(s)}
                    className="w-full px-4 py-2.5 text-left text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ─── Statistics & Visibility ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5 shadow-sm">
        <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart2 size={18} className="text-slate-500" /> Statistics & Visibility
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label>Years of Experience</Label>
            <input
              type="number"
              min={0}
              max={50}
              value={profile.yearsOfExperience}
              onChange={e => set('yearsOfExperience', e.target.value)}
              disabled={!editMode}
              className={inputCls()}
              placeholder="0"
            />
          </div>
          <div>
            <Label>Total Events Managed</Label>
            <input
              type="number"
              min={0}
              value={profile.totalEventsManaged}
              onChange={e => set('totalEventsManaged', e.target.value)}
              disabled={!editMode}
              className={inputCls()}
              placeholder="0"
            />
          </div>
        </div>

        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between gap-4">
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">Public Profile Visibility</p>
            <p className="text-xs text-slate-500 mt-0.5">
              {profile.profileVisible
                ? 'Your profile details are visible to event organisers and students.'
                : 'Your profile is currently hidden from public view.'}
            </p>
          </div>
          {editMode ? (
            <button
              type="button"
              onClick={() => set('profileVisible', !profile.profileVisible)}
              className={`relative w-12 h-6 rounded-full transition-colors shrink-0 ${
                profile.profileVisible ? 'bg-slate-900 dark:bg-white' : 'bg-slate-200 dark:bg-slate-700'
              }`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white dark:bg-slate-900 rounded-full shadow transition-transform ${
                profile.profileVisible ? 'translate-x-7' : 'translate-x-1'
              }`} />
            </button>
          ) : (
            <span className={`px-3 py-1 rounded-full text-xs font-bold ${
              profile.profileVisible
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700'
                : 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
            }`}>
              {profile.profileVisible ? 'Visible' : 'Hidden'}
            </span>
          )}
        </div>
      </div>

      {/* Email — Read only */}
      <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center gap-3 text-sm">
        <ShieldCheck size={18} className="text-slate-400 shrink-0" />
        <div>
          <span className="text-slate-500">Registered Email: </span>
          <strong className="text-slate-900 dark:text-white">{user?.email}</strong>
          <span className="ml-2 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
            Read-only
          </span>
        </div>
      </div>
    </div>
  );
}
