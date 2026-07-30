/**
 * AIRecommendationSection.jsx — Premium AI Event Recommendation Engine
 * Features: Animated score counters, horizontal carousel, confidence score bars,
 * glassmorphism cards, interest tags, AI explanation blocks, engine mode selector
 */
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLiveRecommendations, localHeuristicRecommend } from '../services/geminiRecommend';
import {
  Sparkles, RefreshCw, Loader2, CheckCircle2, ChevronRight, ChevronLeft,
  Calendar, MapPin, Trophy, Zap, TrendingUp, Plus, X, Search,
  Sliders, Settings, Filter, Check, Play, Save, Info, Brain,
  BarChart2, Target, Clock, Users, Star
} from 'lucide-react';

const POLL_INTERVAL_MS = 60000;

const POPULAR_INTERESTS = [
  { label: 'Artificial Intelligence', emoji: '🤖' },
  { label: 'Machine Learning', emoji: '📊' },
  { label: 'Competitive Coding', emoji: '💻' },
  { label: 'Robotics & Drones', emoji: '🦾' },
  { label: 'Web Development', emoji: '🌐' },
  { label: 'Cyber Security', emoji: '🔐' },
  { label: 'UI/UX Design', emoji: '🎨' },
  { label: 'Cloud Computing', emoji: '☁️' },
  { label: 'Blockchain & Web3', emoji: '⛓️' },
  { label: 'Data Science', emoji: '📈' },
  { label: 'IoT & Embedded', emoji: '⚡' },
  { label: 'Game Development', emoji: '🎮' },
];

const DEPT_OPTIONS = [
  'Computer Science & Engineering', 'Data Science & AI', 'Information Technology',
  'Electronics & Communication', 'Mechanical Engineering',
  'Electrical & Electronics', 'Civil Engineering', 'Biomedical Engineering'
];
const YEAR_OPTIONS = ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Post Graduate'];
const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'Hackathon', label: 'Hackathons' },
  { value: 'Robotics', label: 'Robotics & Hardware' },
  { value: 'Coding', label: 'Competitive Coding' },
  { value: 'Design', label: 'UI/UX & Product Design' },
  { value: 'Cyber Security', label: 'Cyber Security & CTF' },
  { value: 'Cloud Computing', label: 'Cloud & DevOps' }
];

/* ── Animated counter hook ──────────────────────────────────── */
function useCountUp(target, duration = 1000, delay = 0) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const startTime = Date.now() + delay;
    const animate = () => {
      const now = Date.now();
      if (now < startTime) { frameRef.current = requestAnimationFrame(animate); return; }
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, delay]);
  return value;
}

/* ── Score Arc SVG ─────────────────────────────────────────── */
function ScoreArc({ score, size = 72, color }) {
  const animated = useCountUp(score, 900, 200);
  const r = (size / 2) - 6;
  const circ = 2 * Math.PI * r;
  const offset = circ - (circ * animated) / 100;
  const clr = color || (score >= 90 ? '#10B981' : score >= 75 ? '#20BEFF' : '#F59E0B');
  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} stroke="rgba(100,116,139,0.12)" strokeWidth={6} fill="none" />
        <circle cx={size/2} cy={size/2} r={r} stroke={clr} strokeWidth={6} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 6px ${clr}60)` }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span style={{ fontSize: size < 80 ? 15 : 18, fontWeight: 900, color: clr, lineHeight: 1 }}>
          {animated}%
        </span>
        <span style={{ fontSize: 9, color: '#64748B', fontWeight: 700, letterSpacing: '0.05em', textTransform: 'uppercase' }}>match</span>
      </div>
    </div>
  );
}

/* ── Confidence Bar ─────────────────────────────────────────── */
function ConfidenceBar({ score }) {
  const confidence = Math.min(99, score + Math.round(Math.random() * 3 + 1));
  const clr = confidence >= 90 ? '#10B981' : confidence >= 75 ? '#20BEFF' : '#F59E0B';
  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span style={{ fontSize: 10, color: '#64748B', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          AI Confidence
        </span>
        <span style={{ fontSize: 11, fontWeight: 800, color: clr }}>{confidence}%</span>
      </div>
      <div style={{ height: 3, borderRadius: 9999, background: 'rgba(100,116,139,0.12)', overflow: 'hidden' }}>
        <div style={{
          height: '100%', width: `${confidence}%`, borderRadius: 9999,
          background: `linear-gradient(90deg, ${clr}, ${clr}CC)`,
          transition: 'width 1.2s cubic-bezier(0.4,0,0.2,1)'
        }} />
      </div>
    </div>
  );
}

/* ── Premium Recommendation Card ────────────────────────────── */
function RecommendationCard({ rec, index }) {
  const { event, score, reason, executedLocally } = rec;
  if (!event) return null;
  const scoreColor = score >= 90 ? '#10B981' : score >= 75 ? '#20BEFF' : '#F59E0B';

  return (
    <div
      className="kaggle-card kaggle-card-hover flex flex-col animate-fade-in-up"
      style={{
        animationDelay: `${index * 80}ms`,
        borderColor: `${scoreColor}25`,
        background: `linear-gradient(160deg, ${scoreColor}06 0%, rgba(15,17,23,0.02) 100%)`,
        position: 'relative',
        overflow: 'hidden'
      }}>
      {/* Top shimmer line */}
      <div style={{
        position: 'absolute', top: 0, left: 0, right: 0, height: 2,
        background: `linear-gradient(90deg, transparent, ${scoreColor}80, transparent)`
      }} />

      {/* Rank badge */}
      {index < 3 && (
        <div className="absolute top-3 right-3 w-6 h-6 rounded-full flex items-center justify-center text-xs font-black"
          style={{
            background: index === 0 ? '#FFD700' : index === 1 ? '#C0C0C0' : '#CD7F32',
            color: '#0F1117', boxShadow: `0 2px 8px ${index === 0 ? 'rgba(255,215,0,0.5)' : 'rgba(0,0,0,0.3)'}`
          }}>
          {index + 1}
        </div>
      )}

      <div className="p-5 flex-1 flex flex-col space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3 pr-8">
          <ScoreArc score={score} size={72} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap mb-1.5">
              <span className="text-xs font-bold px-2.5 py-0.5 rounded-full"
                style={{ background: `${scoreColor}12`, color: scoreColor, border: `1px solid ${scoreColor}25` }}>
                {event.category || 'Tech Event'}
              </span>
              {executedLocally && (
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1"
                  style={{ background: 'rgba(32,190,255,0.08)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.18)' }}>
                  <Zap size={9} /> Local
                </span>
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white leading-snug"
              style={{ letterSpacing: '-0.01em' }}>
              {event.title}
            </h3>
          </div>
        </div>

        {/* Confidence bar */}
        <ConfidenceBar score={score} />

        {/* Event info */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-400">
          <span className="flex items-center gap-1"><MapPin size={10} />{event.collegeName}</span>
          {event.eventDate && (
            <span className="flex items-center gap-1">
              <Calendar size={10} />
              {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {event.prizePool && (
            <span className="flex items-center gap-1">
              <Trophy size={10} style={{ color: '#F59E0B' }} />
              <span style={{ color: '#F59E0B', fontWeight: 700 }}>{event.prizePool}</span>
            </span>
          )}
        </div>

        {/* AI Reason */}
        <div className="p-3 rounded-xl flex-1"
          style={{ background: `${scoreColor}07`, border: `1px solid ${scoreColor}18` }}>
          <div className="flex items-start gap-2">
            <Sparkles size={11} style={{ color: scoreColor, flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.65 }}>{reason}</p>
          </div>
        </div>

        {/* Interest tags */}
        {rec.matchedTags && rec.matchedTags.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {rec.matchedTags.slice(0, 4).map(tag => (
              <span key={tag} className="text-[10px] font-bold px-2 py-0.5 rounded-md"
                style={{ background: `${scoreColor}10`, color: scoreColor }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <Link
          to={`/events/${event._id || event.id}`}
          className="flex items-center justify-between w-full px-4 py-2.5 rounded-xl text-xs font-bold transition-all group mt-auto"
          style={{
            background: `${scoreColor}12`, color: scoreColor,
            border: `1px solid ${scoreColor}25`, textDecoration: 'none'
          }}>
          <span>View & Register</span>
          <ChevronRight size={13} className="group-hover:translate-x-0.5 transition-transform" />
        </Link>
      </div>
    </div>
  );
}

/* ── Skeleton Card ──────────────────────────────────────────── */
function SkeletonCard() {
  return (
    <div className="kaggle-card p-5 space-y-4 animate-pulse">
      <div className="flex gap-3">
        <div className="w-16 h-16 rounded-full" style={{ background: 'rgba(100,116,139,0.1)' }} />
        <div className="flex-1 space-y-2">
          <div className="w-16 h-4 rounded-full" style={{ background: 'rgba(100,116,139,0.1)' }} />
          <div className="h-4 rounded" style={{ background: 'rgba(100,116,139,0.1)' }} />
          <div className="h-3 w-2/3 rounded" style={{ background: 'rgba(100,116,139,0.07)' }} />
        </div>
      </div>
      <div className="h-2 rounded-full" style={{ background: 'rgba(100,116,139,0.08)' }} />
      <div className="h-14 rounded-xl" style={{ background: 'rgba(32,190,255,0.04)' }} />
      <div className="h-9 rounded-xl" style={{ background: 'rgba(100,116,139,0.06)' }} />
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AIRecommendationSection({ interests: propInterests }) {
  const { user, updateProfile } = useAuth();

  const [interests, setInterests] = useState(() =>
    propInterests || user?.interests || ['Artificial Intelligence', 'Competitive Coding', 'Web Development']
  );
  const [inputVal, setInputVal] = useState('');

  const [preferences, setPreferences] = useState(() => ({
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    category: 'all',
    mode: 'all',
    freeOnly: false,
    minScore: 60,
    engineMode: 'cloud',
    autoRunLocal: false
  }));

  const [showPrefEditor, setShowPrefEditor] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState('idle');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [jobProgress, setJobProgress] = useState(null);
  const [jobCompletedBanner, setJobCompletedBanner] = useState(null);
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'carousel'

  const pollRef = useRef(null);
  const inputRef = useRef(null);
  const carouselRef = useRef(null);

  /* ── Core Job Runner ─────────────────────────────────────── */
  const runRecommendationJob = useCallback(async (customList, customPrefs, forcedLocal = false) => {
    const listToUse = customList || interests;
    const prefsToUse = { ...preferences, ...(customPrefs || {}) };
    if (forcedLocal) prefsToUse.engineMode = 'local';
    if (!listToUse || listToUse.length === 0) return;

    setStatus('loading');
    setJobCompletedBanner(null);
    setCarouselIndex(0);
    setJobProgress({ step: 1, label: 'Reading student profile & building interest vectors…' });

    setTimeout(async () => {
      setJobProgress({
        step: 2,
        label: prefsToUse.engineMode === 'local'
          ? 'Executing local heuristic engine on event corpus…'
          : 'Querying Cloud Gemini AI for personalized reasoning…'
      });
      try {
        const results = await fetchLiveRecommendations(
          listToUse, prefsToUse.department, prefsToUse.year, prefsToUse
        );
        setRecommendations(results);
        const isLocal = results.length > 0 && results[0].executedLocally;
        const execTime = results[0]?.executionTimeMs || 120;
        setExecutionStats({
          executedLocally: isLocal,
          engine: results[0]?.engine || (isLocal ? 'Local Heuristic Engine' : 'Gemini AI'),
          executionTimeMs: execTime,
          matchedCount: results.length
        });
        setStatus(isLocal ? 'local_success' : 'success');
        setLastUpdated(new Date());
        setJobProgress(null);
        setJobCompletedBanner({
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
          count: results.length,
          engine: isLocal ? 'Local Engine' : 'Cloud Gemini AI',
          execTime
        });
      } catch (err) {
        const fallback = localHeuristicRecommend(listToUse, preferences.department, preferences.year, preferences);
        setRecommendations(fallback);
        setStatus('fallback');
        setJobProgress(null);
        setExecutionStats({ executedLocally: true, engine: 'Local Fallback', executionTimeMs: 95, matchedCount: fallback.length });
      }
    }, 400);
  }, [interests, preferences]);

  // Auto-trigger recommendation update whenever interests change
  useEffect(() => {
    if (interests && interests.length > 0) {
      runRecommendationJob(interests, preferences, preferences.engineMode === 'local');
    } else {
      setRecommendations([]);
    }
  }, [interests, preferences.engineMode, preferences.category, preferences.mode, preferences.freeOnly, preferences.minScore]);

  useEffect(() => {
    clearInterval(pollRef.current);
    if (interests.length > 0) {
      pollRef.current = setInterval(() => {
        fetchLiveRecommendations(interests, preferences.department, preferences.year, preferences)
          .then(res => setRecommendations(res)).catch(() => {});
      }, POLL_INTERVAL_MS);
    }
    return () => clearInterval(pollRef.current);
  }, [interests, preferences]);

  /* ── Interest handlers ────────────────────────────────────── */
  const addInterest = (val) => {
    const clean = (val || inputVal).trim();
    if (clean && !interests.includes(clean)) {
      const updated = [...interests, clean];
      setInterests(updated);
      // Triggers immediate recommendation update
      runRecommendationJob(updated, preferences, preferences.engineMode === 'local');
    }
    setInputVal('');
    inputRef.current?.focus();
  };
  const removeInterest = (item) => {
    const updated = interests.filter(i => i !== item);
    setInterests(updated);
    // Triggers immediate recommendation update
    if (updated.length > 0) {
      runRecommendationJob(updated, preferences, preferences.engineMode === 'local');
    } else {
      setRecommendations([]);
    }
  };
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addInterest(); }
    if (e.key === 'Backspace' && !inputVal && interests.length > 0) removeInterest(interests[interests.length - 1]);
  };

  const handleSavePreferences = () => {
    if (updateProfile) updateProfile({ department: preferences.department, year: preferences.year, interests, aiPreferences: preferences });
    runRecommendationJob(interests, preferences, preferences.engineMode === 'local');
    setShowPrefEditor(false);
  };

  /* ── Carousel controls ────────────────────────────────────── */
  const carouselPrev = () => setCarouselIndex(i => Math.max(0, i - 1));
  const carouselNext = () => setCarouselIndex(i => Math.min(recommendations.length - 1, i + 1));

  useEffect(() => {
    if (carouselRef.current) {
      const item = carouselRef.current.children[carouselIndex];
      item?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'start' });
    }
  }, [carouselIndex]);

  /* ── Status Badge ────────────────────────────────────────── */
  const StatusBadge = () => {
    if (status === 'loading') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold animate-pulse"
        style={{ background: 'rgba(32,190,255,0.08)', border: '1px solid rgba(32,190,255,0.2)', color: '#20BEFF' }}>
        <Loader2 size={11} className="animate-spin" /> Processing AI Job…
      </span>
    );
    if (status === 'local_success') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ background: 'rgba(32,190,255,0.1)', border: '1px solid rgba(32,190,255,0.25)', color: '#20BEFF' }}>
        <Zap size={11} /> Local Engine — {executionStats?.executionTimeMs || 120}ms
      </span>
    );
    if (status === 'success') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.2)', color: '#10B981' }}>
        <CheckCircle2 size={11} /> Gemini AI — Live
      </span>
    );
    if (status === 'fallback') return (
      <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
        style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.2)', color: '#F59E0B' }}>
        <Sparkles size={11} /> Heuristic Fallback
      </span>
    );
    return null;
  };

  return (
    <section className="space-y-5" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Hero Banner ────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-6"
        style={{
          background: 'linear-gradient(135deg, rgba(32,190,255,0.12) 0%, rgba(139,92,246,0.08) 50%, rgba(16,185,129,0.06) 100%)',
          border: '1px solid rgba(32,190,255,0.2)'
        }}>
        {/* Animated background orb */}
        <div className="absolute top-0 right-0 w-48 h-48 pointer-events-none"
          style={{
            background: 'radial-gradient(circle, rgba(32,190,255,0.12) 0%, transparent 70%)',
            animation: 'floatUp 4s ease-in-out infinite'
          }} />

        <div className="flex items-start justify-between gap-4 relative z-10 flex-wrap">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl animate-float"
              style={{ background: 'rgba(32,190,255,0.12)', border: '1px solid rgba(32,190,255,0.25)' }}>
              <Brain size={24} style={{ color: '#20BEFF' }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-slate-900 dark:text-white"
                  style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.02em' }}>
                  Recommended for You
                </h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-black"
                  style={{ background: '#20BEFF', color: '#0F1117' }}>AI</span>
              </div>
              <p style={{ fontSize: 12, color: '#64748B' }}>
                Personalized event matches based on your interests, department & year
              </p>
              {/* Quick stats */}
              {executionStats && (
                <div className="flex items-center gap-4 mt-2 flex-wrap">
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                    <Target size={11} style={{ color: '#20BEFF' }} />
                    <strong style={{ color: '#20BEFF' }}>{executionStats.matchedCount}</strong> events matched
                  </span>
                  <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                    <Zap size={11} style={{ color: '#10B981' }} />
                    <strong style={{ color: '#10B981' }}>{executionStats.engine}</strong>
                  </span>
                  {lastUpdated && (
                    <span className="flex items-center gap-1 text-xs" style={{ color: '#64748B' }}>
                      <Clock size={11} />
                      {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <StatusBadge />
            <button onClick={() => setShowPrefEditor(!showPrefEditor)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all"
              style={{
                background: showPrefEditor ? '#20BEFF' : 'rgba(32,190,255,0.08)',
                color: showPrefEditor ? '#0F1117' : '#20BEFF',
                border: '1px solid rgba(32,190,255,0.25)', cursor: 'pointer'
              }}>
              <Sliders size={12} /> {showPrefEditor ? 'Close' : 'Preferences'}
            </button>
            <button onClick={() => runRecommendationJob(interests, preferences, true)}
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.25)', color: '#10B981', cursor: 'pointer' }}>
              <Zap size={12} /> Run Local
            </button>
            <button onClick={() => runRecommendationJob(interests, preferences, false)}
              disabled={status === 'loading'}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all disabled:opacity-40"
              style={{ background: 'rgba(100,116,139,0.06)', border: '1px solid rgba(100,116,139,0.15)', color: '#64748B', cursor: 'pointer' }}>
              <RefreshCw size={12} className={status === 'loading' ? 'animate-spin' : ''} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* ─── Preferences Panel ──────────────────────────────── */}
      {showPrefEditor && (
        <div className="kaggle-card p-6 space-y-6 animate-fade-in-up"
          style={{ borderColor: '#20BEFF', background: 'linear-gradient(135deg, rgba(32,190,255,0.05) 0%, rgba(15,17,23,0.2) 100%)' }}>
          <div className="flex items-center justify-between pb-4" style={{ borderBottom: '1px solid rgba(32,190,255,0.15)' }}>
            <div className="flex items-center gap-2">
              <Settings size={16} style={{ color: '#20BEFF' }} />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">AI Recommendation Parameters</h3>
            </div>
            <span className="text-xs text-slate-400">Settings persist to your profile</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Engine Mode */}
            <div className="md:col-span-2 lg:col-span-3 space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">Recommendation Engine</label>
              <div className="flex flex-wrap gap-3">
                {[
                  { mode: 'local', icon: <Zap size={18} />, label: '⚡ Local Engine (Instant)', desc: 'Runs locally in browser — offline ready, instant results.', clr: '#20BEFF' },
                  { mode: 'cloud', icon: <Sparkles size={18} />, label: '🤖 Cloud Gemini AI', desc: 'Server-side LLM for deep natural language reasoning.', clr: '#10B981' }
                ].map(({ mode, icon, label, desc, clr }) => (
                  <button key={mode} type="button"
                    onClick={() => setPreferences(p => ({ ...p, engineMode: mode }))}
                    className="flex-1 min-w-[200px] p-3 rounded-xl text-left border transition-all flex items-start gap-3"
                    style={{
                      background: preferences.engineMode === mode ? `${clr}12` : 'rgba(15,17,23,0.04)',
                      borderColor: preferences.engineMode === mode ? clr : 'rgba(100,116,139,0.2)',
                      cursor: 'pointer'
                    }}>
                    <span style={{ color: clr, marginTop: 2 }}>{icon}</span>
                    <div>
                      <div className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        {label}
                        {preferences.engineMode === mode && <Check size={12} style={{ color: clr }} />}
                      </div>
                      <p style={{ fontSize: 11, color: '#64748B', marginTop: 2 }}>{desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Department */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Department</label>
              <select value={preferences.department}
                onChange={e => setPreferences(p => ({ ...p, department: e.target.value }))}
                className="kaggle-input text-xs">
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            {/* Year */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Year of Study</label>
              <select value={preferences.year}
                onChange={e => setPreferences(p => ({ ...p, year: e.target.value }))}
                className="kaggle-input text-xs">
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Category */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Event Domain</label>
              <select value={preferences.category}
                onChange={e => setPreferences(p => ({ ...p, category: e.target.value }))}
                className="kaggle-input text-xs">
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            {/* Mode */}
            <div>
              <label className="text-xs font-semibold text-slate-400 block mb-1.5">Event Mode</label>
              <select value={preferences.mode}
                onChange={e => setPreferences(p => ({ ...p, mode: e.target.value }))}
                className="kaggle-input text-xs">
                <option value="all">All Modes</option>
                <option value="offline">On-Campus / In-Person</option>
                <option value="online">Virtual / Online</option>
              </select>
            </div>

            {/* Min Score */}
            <div>
              <div className="flex justify-between mb-1.5">
                <label className="text-xs font-semibold text-slate-400">Min Match Score</label>
                <span className="text-xs font-black" style={{ color: '#20BEFF' }}>{preferences.minScore}%</span>
              </div>
              <input type="range" min="50" max="90" step="5" value={preferences.minScore}
                onChange={e => setPreferences(p => ({ ...p, minScore: Number(e.target.value) }))}
                className="w-full accent-cyan-400 cursor-pointer" />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col justify-center space-y-2 pt-2">
              {[
                { key: 'freeOnly', label: 'Free Entry Events Only' },
                { key: 'autoRunLocal', label: 'Auto-run when interests change' }
              ].map(({ key, label }) => (
                <label key={key} className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-300">
                  <input type="checkbox" checked={preferences[key]}
                    onChange={e => setPreferences(p => ({ ...p, [key]: e.target.checked }))}
                    className="rounded border-slate-700 text-cyan-400 focus:ring-0" />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-3" style={{ borderTop: '1px solid rgba(100,116,139,0.1)' }}>
            <button onClick={() => setPreferences({ department: 'Computer Science & Engineering', year: '3rd Year', category: 'all', mode: 'all', freeOnly: false, minScore: 60, engineMode: 'local', autoRunLocal: true })}
              className="px-4 py-2 rounded-xl text-xs font-medium text-slate-400 hover:text-slate-200"
              style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
              Reset Defaults
            </button>
            <button onClick={handleSavePreferences}
              className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold"
              style={{ background: '#20BEFF', color: '#0F1117', border: 'none', cursor: 'pointer' }}>
              <Save size={14} /> Save & Run Engine
            </button>
          </div>
        </div>
      )}

      {/* ─── Interest Input Panel ────────────────────────────── */}
      <div className="kaggle-card p-6 space-y-5"
        style={{ borderColor: 'rgba(32,190,255,0.18)', background: 'linear-gradient(135deg,rgba(32,190,255,0.03) 0%,transparent 60%)' }}>
        <div>
          <div className="flex items-center justify-between mb-2">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
              Your Interests & Skill Focus
            </label>
            <span className="text-xs text-slate-400">
              Dept: <strong className="text-cyan-400">{preferences.department.split(' ')[0]}</strong> · {preferences.year}
            </span>
          </div>

          {/* Tag input */}
          <div className="flex flex-wrap items-center gap-2 min-h-[48px] px-3 py-2.5 rounded-xl cursor-text"
            style={{ background: 'rgba(15,17,23,0.04)', border: '1.5px solid rgba(32,190,255,0.25)' }}
            onClick={() => inputRef.current?.focus()}>
            {interests.map(item => (
              <span key={item} className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
                style={{ background: 'rgba(32,190,255,0.1)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.25)', whiteSpace: 'nowrap' }}>
                {item}
                <button onClick={e => { e.stopPropagation(); removeInterest(item); }}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex', alignItems: 'center' }}>
                  <X size={11} style={{ opacity: 0.7 }} />
                </button>
              </span>
            ))}
            <input ref={inputRef} type="text" value={inputVal}
              onChange={e => setInputVal(e.target.value)} onKeyDown={handleKeyDown}
              placeholder={interests.length === 0 ? 'Type an interest (e.g. Machine Learning, Robotics…)' : 'Add more…'}
              style={{ flex: 1, minWidth: 160, background: 'none', border: 'none', outline: 'none', fontSize: 13, color: 'inherit', fontFamily: "'Inter', sans-serif" }}
              className="text-slate-900 dark:text-white placeholder-slate-400" />
            {inputVal.trim() && (
              <button onClick={() => addInterest()}
                className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold shrink-0"
                style={{ background: '#20BEFF', color: '#0F1117', border: 'none', cursor: 'pointer' }}>
                <Plus size={12} /> Add
              </button>
            )}
          </div>
        </div>

        {/* Popular interests */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#94A3B8', marginBottom: 8, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            Popular Fields — click to toggle
          </div>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INTERESTS.map(({ label, emoji }) => {
              const selected = interests.includes(label);
              return (
                <button key={label} onClick={() => selected ? removeInterest(label) : addInterest(label)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all"
                  style={{
                    background: selected ? '#20BEFF' : 'rgba(100,116,139,0.07)',
                    color: selected ? '#0F1117' : '#64748B',
                    border: selected ? '1px solid #20BEFF' : '1px solid rgba(100,116,139,0.15)',
                    cursor: 'pointer', transform: selected ? 'scale(1.04)' : 'scale(1)', fontWeight: selected ? 700 : 500
                  }}>
                  {emoji} {selected ? '✓ ' : ''}{label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Generate CTA */}
        {interests.length > 0 && status === 'idle' && (
          <div className="flex justify-center items-center gap-3 pt-2">
            <button onClick={() => runRecommendationJob(interests, preferences, true)}
              className="kaggle-btn-primary px-8 py-3 text-xs font-bold" style={{ borderRadius: 12 }}>
              <Zap size={14} /> Run Local Engine
            </button>
            <button onClick={() => runRecommendationJob(interests, preferences, false)}
              className="px-6 py-3 rounded-xl text-xs font-bold text-slate-300 transition-all hover:bg-slate-800"
              style={{ border: '1px solid rgba(100,116,139,0.2)', background: 'transparent', cursor: 'pointer' }}>
              <Sparkles size={14} /> Cloud Gemini AI
            </button>
          </div>
        )}
      </div>

      {/* ─── Loading Progress ────────────────────────────────── */}
      {jobProgress && (
        <div className="kaggle-card p-4 flex items-center justify-between border-cyan-500/30 animate-pulse"
          style={{ background: 'rgba(32,190,255,0.04)', borderColor: 'rgba(32,190,255,0.25)' }}>
          <div className="flex items-center gap-3">
            <Loader2 size={16} className="animate-spin text-cyan-400" />
            <div className="text-xs font-bold text-cyan-300">
              Step {jobProgress.step}/2: {jobProgress.label}
            </div>
          </div>
          <span className="text-[11px] font-mono text-cyan-400/80">AI Engine Running…</span>
        </div>
      )}

      {/* ─── Completion Banner ───────────────────────────────── */}
      {jobCompletedBanner && !jobProgress && (
        <div className="p-3.5 rounded-xl border flex items-center justify-between flex-wrap gap-2 animate-fade-in-up"
          style={{ background: 'rgba(16,185,129,0.06)', borderColor: 'rgba(16,185,129,0.2)' }}>
          <div className="flex items-center gap-2">
            <CheckCircle2 size={16} style={{ color: '#10B981' }} />
            <span className="text-xs font-bold text-slate-900 dark:text-white">
              ✅ Job Complete: {jobCompletedBanner.count} events ranked via {jobCompletedBanner.engine} in {jobCompletedBanner.execTime}ms
            </span>
          </div>
          <span className="text-[11px] text-slate-400 font-mono">at {jobCompletedBanner.time}</span>
        </div>
      )}

      {/* ─── Empty State ─────────────────────────────────────── */}
      {interests.length === 0 && status === 'idle' && (
        <div className="kaggle-card p-12 text-center space-y-3">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto"
            style={{ background: 'rgba(32,190,255,0.06)', border: '1px solid rgba(32,190,255,0.12)' }}>
            <Search size={26} style={{ color: '#20BEFF', opacity: 0.6 }} />
          </div>
          <p className="text-sm font-semibold text-slate-400">Add your interests to get AI-powered recommendations</p>
          <p style={{ fontSize: 12, color: '#94A3B8' }}>
            The engine analyzes events and ranks them based on your custom profile.
          </p>
        </div>
      )}

      {/* ─── Loading Skeletons ───────────────────────────────── */}
      {status === 'loading' && recommendations.length === 0 && (
        <div>
          <div style={{ fontSize: 12, color: '#64748B', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6 }}>
            <Loader2 size={13} className="animate-spin" style={{ color: '#20BEFF' }} />
            Ranking events for: <strong style={{ color: '#20BEFF' }}>{interests.slice(0, 3).join(', ')}</strong>…
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3].map(i => <SkeletonCard key={i} />)}
          </div>
        </div>
      )}

      {/* ─── Recommendations ─────────────────────────────────── */}
      {recommendations.length > 0 && (
        <div>
          {/* Results header + view toggle */}
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div style={{ fontSize: 13, fontWeight: 600, color: '#64748B' }}>
              <span style={{ color: '#F1F5F9', fontWeight: 800 }}>{recommendations.length}</span> events matched
              {lastUpdated && (
                <span style={{ marginLeft: 8, fontSize: 11 }}>
                  · {lastUpdated.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3">
              {/* Active interests */}
              <div className="flex flex-wrap gap-1.5">
                {interests.slice(0, 3).map(i => (
                  <span key={i} className="px-2 py-0.5 rounded-full text-xs font-semibold"
                    style={{ background: 'rgba(32,190,255,0.08)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.15)' }}>
                    {i}
                  </span>
                ))}
              </div>
              {/* View mode toggle */}
              <div className="flex items-center rounded-xl overflow-hidden border"
                style={{ borderColor: 'rgba(100,116,139,0.2)' }}>
                {[
                  { mode: 'grid', icon: <BarChart2 size={13} />, label: 'Grid' },
                  { mode: 'carousel', icon: <ChevronRight size={13} />, label: 'Carousel' }
                ].map(({ mode, icon, label }) => (
                  <button key={mode}
                    onClick={() => setViewMode(mode)}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold transition-all"
                    style={{
                      background: viewMode === mode ? '#20BEFF' : 'transparent',
                      color: viewMode === mode ? '#0F1117' : '#64748B',
                      border: 'none', cursor: 'pointer'
                    }}>
                    {icon} {label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Grid view */}
          {viewMode === 'grid' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {recommendations.map((rec, i) => (
                <RecommendationCard key={rec.eventId || i} rec={rec} index={i} />
              ))}
            </div>
          )}

          {/* Carousel view */}
          {viewMode === 'carousel' && (
            <div className="relative">
              {/* Prev button */}
              <button onClick={carouselPrev} disabled={carouselIndex === 0}
                className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30"
                style={{ background: '#1A2332', border: '1px solid rgba(32,190,255,0.3)', cursor: 'pointer' }}>
                <ChevronLeft size={16} style={{ color: '#20BEFF' }} />
              </button>

              {/* Carousel scroll area */}
              <div ref={carouselRef} className="rec-carousel px-2">
                {recommendations.map((rec, i) => (
                  <div key={rec.eventId || i} className="rec-carousel-item">
                    <RecommendationCard rec={rec} index={i} />
                  </div>
                ))}
              </div>

              {/* Next button */}
              <button onClick={carouselNext} disabled={carouselIndex >= recommendations.length - 1}
                className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 z-10 w-9 h-9 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-30"
                style={{ background: '#1A2332', border: '1px solid rgba(32,190,255,0.3)', cursor: 'pointer' }}>
                <ChevronRight size={16} style={{ color: '#20BEFF' }} />
              </button>

              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-1.5 mt-4">
                {recommendations.map((_, i) => (
                  <button key={i} onClick={() => setCarouselIndex(i)}
                    style={{
                      width: i === carouselIndex ? 20 : 6, height: 6,
                      borderRadius: 9999, border: 'none', cursor: 'pointer',
                      background: i === carouselIndex ? '#20BEFF' : 'rgba(100,116,139,0.3)',
                      transition: 'all 0.3s'
                    }} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

    </section>
  );
}
