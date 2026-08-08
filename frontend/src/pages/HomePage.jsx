import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Sparkles, Search, Code, Bot, Cpu, Palette,
  Wrench, Award, ShieldCheck, Zap, TrendingUp
} from 'lucide-react';
import EventCard from '../components/EventCard';
import api, { MOCK_EVENTS } from '../services/api';
import { useAuth } from '../context/AuthContext';

const CATEGORIES = [
  { name: 'Hackathon', icon: Code, color: '#20BEFF' },
  { name: 'AI/ML', icon: Sparkles, color: '#8B5CF6' },
  { name: 'Robotics', icon: Bot, color: '#F59E0B' },
  { name: 'Coding', icon: Cpu, color: '#10B981' },
  { name: 'Design', icon: Palette, color: '#F43F5E' },
  { name: 'Workshop', icon: Wrench, color: '#06B6D4' },
  { name: 'Symposium', icon: Award, color: '#6366F1' },
];

const PLATFORM_STATS = [
  { label: 'Active Colleges', value: '500+', color: '#20BEFF' },
  { label: 'Total Prize Pool', value: '₹25L+', color: '#10B981' },
  { label: 'Safety Verified', value: '98%', color: '#8B5CF6' },
  { label: 'Students Registered', value: '12,000+', color: '#F59E0B' },
];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('featured');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    api.get('/events?featured=true')
      .then(res => {
        if (res.data.success && res.data.data.length > 0) setEvents(res.data.data);
      })
      .catch(() => setEvents(MOCK_EVENTS));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/events?search=${encodeURIComponent(searchQuery)}` : '/events');
  };

  const handleBookmark = (id) => setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredEvents = activeTab === 'trending'
    ? [...events].sort((a, b) => (b.prizePool || '').localeCompare(a.prizePool || ''))
    : events;

  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Hero Banner ───────────────────────────────────────── */}
      <div className="kaggle-card p-8 md:p-12 relative overflow-hidden"
        style={{ borderColor: 'rgba(32,190,255,0.15)' }}>

        {/* Background glow */}
        <div style={{
          position: 'absolute', inset: 0, pointerEvents: 'none',
          background: 'radial-gradient(ellipse at 70% 0%, rgba(32,190,255,0.07) 0%, transparent 60%)'
        }} />

        <div className="max-w-3xl space-y-5 relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full"
            style={{ background: 'rgba(32,190,255,0.08)', border: '1px solid rgba(32,190,255,0.2)' }}>
            <Sparkles size={13} style={{ color: '#20BEFF' }} className="animate-pulse" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#20BEFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
              AI-Powered Inter-College Event Discovery
            </span>
          </div>

          <h1 className="text-slate-900 dark:text-white"
            style={{ fontSize: 'clamp(28px,4vw,48px)', fontWeight: 900, letterSpacing: '-0.04em', lineHeight: 1.1 }}>
            Discover Fests with{' '}
            <span style={{ color: '#20BEFF' }}>AI Safety & Guidance</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400"
            style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 540 }}>
            Explore nationwide hackathons, robotics challenges, and coding competitions.
            Gemini AI calculates travel safety scores and recommends events tailored to your academic profile.
          </p>

          {/* Search */}
          <form onSubmit={handleSearch} className="flex flex-col sm:flex-row items-center gap-3 max-w-xl pt-2">
            <div className="relative flex-1 w-full">
              <Search size={16} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: '#94A3B8' }} />
              <input
                type="text"
                placeholder="Search events, colleges, tech stacks..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="kaggle-input w-full"
                style={{ paddingLeft: 44, paddingRight: 16, paddingTop: 12, paddingBottom: 12 }}
              />
            </div>
            <button type="submit" className="kaggle-btn-primary w-full sm:w-auto px-8 py-3 text-sm font-bold shrink-0">
              Search Events
            </button>
          </form>
        </div>
      </div>

      {/* ─── Platform Stats Row ────────────────────────────────── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {PLATFORM_STATS.map(stat => (
          <div key={stat.label} className="kaggle-card p-4 text-center hover:shadow-md transition-all">
            <div style={{ fontSize: 22, fontWeight: 800, color: stat.color, letterSpacing: '-0.02em' }}>
              {stat.value}
            </div>
            <div style={{ fontSize: 11, color: '#94A3B8', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* ─── Category Pills ─────────────────────────────────────── */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            Browse by Domain
          </h3>
          <Link to="/events" style={{ fontSize: 12, fontWeight: 700, color: '#20BEFF', textDecoration: 'none' }}>
            View All →
          </Link>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {CATEGORIES.map(cat => {
            const Icon = cat.icon;
            return (
              <button key={cat.name}
                onClick={() => navigate(`/events?category=${cat.name}`)}
                className="kaggle-card p-3 flex items-center justify-center gap-2 transition-all hover:shadow-md group cursor-pointer border-none text-sm font-semibold text-slate-700 dark:text-slate-300 hover:border-[#20BEFF]/40"
                style={{ cursor: 'pointer' }}>
                <Icon size={15} style={{ color: cat.color }} />
                <span style={{ fontSize: 12 }}>{cat.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* ─── Main Content ──────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Left: Events List */}
        <div className="lg:col-span-2 space-y-6">
          {/* Tabs */}
          <div className="flex items-center gap-1 border-b border-slate-100 dark:border-slate-800 pb-3">
            {[
              { key: 'featured', label: '🏆 Featured Fests' },
              { key: 'trending', label: '🔥 High Prize Pools' },
            ].map(tab => (
              <button key={tab.key} onClick={() => setActiveTab(tab.key)}
                className="px-5 py-2.5 text-sm font-bold rounded-xl transition-all"
                style={{
                  background: activeTab === tab.key ? '#20BEFF' : 'transparent',
                  color: activeTab === tab.key ? '#0F1117' : '#64748B',
                  border: 'none', cursor: 'pointer'
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Events Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredEvents.map(evt => (
              <EventCard
                key={evt._id || evt.id}
                event={evt}
                isBookmarked={!!bookmarks[evt._id || evt.id]}
                onBookmark={handleBookmark}
              />
            ))}
          </div>

          <div className="text-center pt-2">
            <Link to="/events" className="kaggle-btn-secondary inline-flex px-8 py-3 text-sm font-bold"
              style={{ textDecoration: 'none' }}>
              View All Events →
            </Link>
          </div>
        </div>

        {/* Right Sidebar */}
        <div className="space-y-5 lg:sticky lg:top-24 lg:self-start">
          {/* Safety highlight */}
          <div className="kaggle-card p-5 space-y-3"
            style={{ borderColor: 'rgba(16,185,129,0.2)', background: 'linear-gradient(135deg, rgba(16,185,129,0.03) 0%, transparent 60%)' }}>
            <div className="flex items-center gap-2" style={{ color: '#10B981', fontWeight: 700, fontSize: 13 }}>
              <ShieldCheck size={16} />
              AI Travel Safety Engine
            </div>
            <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.7 }}>
              When an event distance exceeds 100km, Eventix automatically computes live travel safety scores based on transit, weather, and verified student hostels.
            </p>
            <Link to="/events" style={{ fontSize: 12, fontWeight: 700, color: '#10B981', textDecoration: 'none', display: 'block', paddingTop: 4 }}>
              Explore Safe Events →
            </Link>
          </div>

          {/* Quick links */}
          <div className="kaggle-card p-5 space-y-3">
            <h4 style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Quick Actions
            </h4>
            <div className="space-y-2">
              {[
                { label: 'My Registrations', to: '/dashboard', icon: TrendingUp },
                { label: 'Profile & Settings', to: '/dashboard', icon: Zap },
                { label: 'All Events', to: '/events', icon: Search },
              ].map(link => {
                const Icon = link.icon;
                return (
                  <Link key={link.label} to={link.to}
                    className="flex items-center justify-between p-3 rounded-xl transition-all hover:shadow-sm group"
                    style={{
                      textDecoration: 'none',
                      background: 'rgba(100,116,139,0.04)',
                      border: '1px solid rgba(100,116,139,0.08)',
                      color: '#64748B',
                      fontSize: 13,
                      fontWeight: 600
                    }}>
                    <div className="flex items-center gap-2">
                      <Icon size={14} />
                      {link.label}
                    </div>
                    <span className="group-hover:translate-x-0.5 transition-transform text-xs">→</span>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
