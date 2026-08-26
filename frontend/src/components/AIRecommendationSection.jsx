import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchLiveRecommendations, localHeuristicRecommend } from '../services/geminiRecommend';
import EventCard from './EventCard';
import {
  Sparkles, RefreshCw, Loader2, CheckCircle2, ChevronRight, ChevronLeft,
  Calendar, MapPin, Trophy, Zap, Plus, X, Search,
  Sliders, Settings, Check, Save, Brain,
  BarChart2, Target, Clock, ShieldCheck, Eye, ArrowRight, Bookmark
} from 'lucide-react';

const POLL_INTERVAL_MS = 60000;

const POPULAR_INTERESTS = [
  'Artificial Intelligence', 'Machine Learning', 'Competitive Coding',
  'Robotics & Drones', 'Web Development', 'Cyber Security',
  'UI/UX Design', 'Cloud Computing', 'Blockchain & Web3',
  'Data Science', 'IoT & Embedded', 'Game Development'
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

/* ── Skeleton Card ── */
function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 space-y-5 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="w-32 h-5 bg-slate-200 dark:bg-slate-800 rounded" />
        <div className="w-20 h-5 bg-slate-200 dark:bg-slate-800 rounded-full" />
      </div>
      <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-3/4" />
      <div className="h-20 bg-slate-100 dark:bg-slate-800 rounded-xl" />
      <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-xl" />
    </div>
  );
}

/* ── Label helper ── */
function Label({ children }) {
  return (
    <label className="block text-sm font-bold text-slate-700 dark:text-slate-300 mb-2">
      {children}
    </label>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AIRecommendationSection({ interests: propInterests }) {
  const { user, updateProfile } = useAuth();

  const [interests, setInterests] = useState(() => propInterests || []);
  const [inputVal, setInputVal] = useState('');

  const [preferences, setPreferences] = useState(() => ({
    department: user?.department || 'Computer Science & Engineering',
    year: user?.year || '3rd Year',
    category: 'all',
    region: 'all',
    mode: 'all',
    freeOnly: false,
    minScore: 40,
    engineMode: 'local',
    autoRunLocal: true
  }));

  const [showPrefEditor, setShowPrefEditor] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [status, setStatus] = useState('idle');
  const [lastUpdated, setLastUpdated] = useState(null);
  const [executionStats, setExecutionStats] = useState(null);
  const [jobProgress, setJobProgress] = useState(null);
  const [jobCompletedBanner, setJobCompletedBanner] = useState(null);

  const pollRef = useRef(null);
  const inputRef = useRef(null);

  /* ── Core Job Runner ── */
  const runRecommendationJob = useCallback(async (customList, customPrefs, forcedLocal = true) => {
    const listToUse = customList || interests;
    const prefsToUse = { ...preferences, ...(customPrefs || {}) };
    if (forcedLocal) prefsToUse.engineMode = 'local';
    if (!listToUse || listToUse.length === 0) return;

    setStatus('loading');
    setJobCompletedBanner(null);
    setJobProgress({ step: 1, label: 'Analyzing profile & building interest vectors…' });

    setTimeout(async () => {
      setJobProgress({
        step: 2,
        label: prefsToUse.engineMode === 'local'
          ? 'Scoring event corpus against academic profile…'
          : 'Querying Gemini AI for semantic matching…'
      });
      try {
        const results = await fetchLiveRecommendations(
          listToUse, prefsToUse.department, prefsToUse.year, prefsToUse
        );
        setRecommendations(results);
        const isLocal = results.length > 0 && results[0].executedLocally;
        const execTime = results[0]?.executionTimeMs || 120;
        const engineName = results[0]?.engine || (isLocal ? 'Local Client-Side Heuristic Engine v2.0' : 'Gemini AI');
        setExecutionStats({
          executedLocally: isLocal,
          engine: engineName,
          executionTimeMs: execTime,
          matchedCount: results.length
        });
        setStatus(isLocal ? 'local_success' : 'success');
        setLastUpdated(new Date());
        setJobProgress(null);
        setJobCompletedBanner({
          time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
          count: results.length,
          engine: isLocal ? 'Local Engine' : 'Gemini AI',
          execTime
        });
      } catch (err) {
        const fallback = localHeuristicRecommend(listToUse, prefsToUse.department, prefsToUse.year, prefsToUse);
        setRecommendations(fallback);
        setStatus('fallback');
        setJobProgress(null);
        setExecutionStats({ executedLocally: true, engine: 'Local Client-Side Heuristic Engine v2.0', executionTimeMs: 95, matchedCount: fallback.length });
        if (fallback.length > 0) {
          setLastUpdated(new Date());
          setJobCompletedBanner({
            time: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            count: fallback.length,
            engine: 'Local Engine',
            execTime: 95
          });
        }
      }
    }, 250);
  }, [interests, preferences]);

  const runJobRef = useRef(runRecommendationJob);
  useEffect(() => { runJobRef.current = runRecommendationJob; }, [runRecommendationJob]);

  useEffect(() => {
    if (interests && interests.length > 0) {
      runJobRef.current(interests, preferences, preferences.engineMode === 'local');
    } else {
      setRecommendations([]);
      setStatus('idle');
    }
  }, [interests, preferences.engineMode, preferences.category, preferences.mode, preferences.region, preferences.freeOnly, preferences.minScore]);

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

  /* ── Interest handlers ── */
  const addInterest = (val) => {
    const clean = (val || inputVal).trim();
    if (clean && !interests.includes(clean)) {
      setInterests([...interests, clean]);
    }
    setInputVal('');
    inputRef.current?.focus();
  };

  const removeInterest = (item) => setInterests(interests.filter(i => i !== item));

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addInterest(); }
    if (e.key === 'Backspace' && !inputVal && interests.length > 0) removeInterest(interests[interests.length - 1]);
  };

  const handleSavePreferences = () => {
    if (updateProfile) updateProfile({ department: preferences.department, year: preferences.year, interests, aiPreferences: preferences });
    runRecommendationJob(interests, preferences, preferences.engineMode === 'local');
    setShowPrefEditor(false);
  };

  const selectCls = "w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-800 text-sm rounded-xl border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:border-slate-500";

  return (
    <section className="space-y-5">

      {/* ─── Preferences Panel ─── */}
      {showPrefEditor && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Settings size={18} /> Match Settings & Filters
            </h3>
            <span className="text-sm text-slate-400">Changes apply immediately</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            <div>
              <Label>Department</Label>
              <select value={preferences.department} onChange={e => setPreferences(p => ({ ...p, department: e.target.value }))} className={selectCls}>
                {DEPT_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
              </select>
            </div>

            <div>
              <Label>Year of Study</Label>
              <select value={preferences.year} onChange={e => setPreferences(p => ({ ...p, year: e.target.value }))} className={selectCls}>
                {YEAR_OPTIONS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            <div>
              <Label>Event Domain</Label>
              <select value={preferences.category} onChange={e => setPreferences(p => ({ ...p, category: e.target.value }))} className={selectCls}>
                {CATEGORY_OPTIONS.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
              </select>
            </div>

            <div>
              <Label>Event Mode</Label>
              <select value={preferences.mode} onChange={e => setPreferences(p => ({ ...p, mode: e.target.value }))} className={selectCls}>
                <option value="all">All Modes</option>
                <option value="offline">On-Campus / In-Person</option>
                <option value="online">Virtual / Online</option>
              </select>
            </div>

            <div>
              <Label>Geographic Region</Label>
              <select value={preferences.region} onChange={e => setPreferences(p => ({ ...p, region: e.target.value }))} className={selectCls}>
                <option value="all">All India Fests</option>
                <option value="south">South India (TN, KL, KA, TS, AP)</option>
              </select>
            </div>

            <div>
              <div className="flex justify-between mb-2">
                <Label>Min Match Score</Label>
                <span className="text-sm font-bold text-slate-900 dark:text-white">{preferences.minScore}%</span>
              </div>
              <input
                type="range" min="40" max="90" step="5"
                value={preferences.minScore}
                onChange={e => setPreferences(p => ({ ...p, minScore: Number(e.target.value) }))}
                className="w-full accent-slate-900 dark:accent-white cursor-pointer"
              />
            </div>
          </div>

          <div className="flex justify-end items-center gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <button
              onClick={() => setPreferences(p => ({ ...p, category: 'all', mode: 'all', region: 'all', freeOnly: false, minScore: 40 }))}
              className="px-4 py-2 text-sm font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Reset to Defaults
            </button>
            <button
              onClick={handleSavePreferences}
              className="px-5 py-2 text-sm font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-slate-200 transition-colors"
            >
              Save & Apply
            </button>
          </div>
        </div>
      )}

      {/* ─── Interest Selector Card ─── */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-5">
        
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Your Selected Interests & Skills
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              These topics are used to rank and match events for you.
            </p>
          </div>
        </div>

        {/* Tag Input */}
        <div
          className="flex flex-wrap items-center gap-2 p-3.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 cursor-text min-h-[52px]"
          onClick={() => inputRef.current?.focus()}
        >
          {interests.map(item => (
            <span
              key={item}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 shadow-sm"
            >
              {item}
              <button
                onClick={(e) => { e.stopPropagation(); removeInterest(item); }}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-slate-100 focus:outline-none"
              >
                <X size={13} />
              </button>
            </span>
          ))}
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={e => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={interests.length === 0 ? 'Type an interest (e.g. AI, Robotics)…' : 'Add more…'}
            className="flex-1 min-w-[160px] bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-1"
          />
          {inputVal.trim() && (
            <button
              onClick={() => addInterest()}
              className="px-3 py-1.5 rounded-lg text-sm font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-600 hover:bg-slate-100"
            >
              Add
            </button>
          )}
        </div>

        {/* Quick-add topic chips */}
        <div className="space-y-2">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Quick Add Topics</p>
          <div className="flex flex-wrap gap-2">
            {POPULAR_INTERESTS.map(label => {
              const isSelected = interests.includes(label);
              return (
                <button
                  key={label}
                  onClick={() => isSelected ? removeInterest(label) : addInterest(label)}
                  className={`px-3.5 py-1.5 rounded-full text-sm font-semibold transition-all duration-150 ${
                    isSelected
                      ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 border border-transparent font-bold shadow-sm'
                      : 'bg-white dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ─── Loading State ─── */}
      {status === 'loading' && recommendations.length === 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map(i => <SkeletonCard key={i} />)}
        </div>
      )}

      {/* ─── Recommendations Grid ─── */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <span className="text-sm font-bold text-slate-500 dark:text-slate-400">
              Showing <strong className="text-slate-900 dark:text-white">{recommendations.length}</strong> recommended competitions
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {recommendations.map((rec, i) => (
              <EventCard
                key={rec.eventId || rec.event?._id || i}
                event={rec.event}
                matchReason={rec.reason}
              />
            ))}
          </div>
        </div>
      )}

      {/* ─── Empty State ─── */}
      {interests.length === 0 && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-14 text-center space-y-4">
          <Search className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Interests Selected</h3>
          <p className="text-sm text-slate-500 max-w-sm mx-auto leading-relaxed">
            Add at least one interest or technical topic above to get tailored event matches.
          </p>
        </div>
      )}

    </section>
  );
}
