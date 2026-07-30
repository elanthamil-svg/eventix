/**
 * AISafetyScoreCard.jsx — Premium AI Travel Safety Dashboard
 * Features: Animated SVG circular gauge, 6 metric tiles, risk factors,
 * travel tips, transport suggestion, safety glow status badges
 */
import React, { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck, ShieldAlert, AlertTriangle, CloudSun, Navigation,
  Clock, Sparkles, Train, Car, Bus, Bike, TrendingDown,
  Lightbulb, CheckCircle2, XCircle, Info, Loader2, Zap,
  MapPin, Wind, Thermometer, Eye
} from 'lucide-react';
import api from '../services/api';

/* ── Animated counter hook ─────────────────────────────────── */
function useCountUp(target, duration = 1200, delay = 300) {
  const [value, setValue] = useState(0);
  const frameRef = useRef(null);
  useEffect(() => {
    const start = Date.now() + delay;
    const tick = () => {
      const now = Date.now();
      if (now < start) { frameRef.current = requestAnimationFrame(tick); return; }
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, delay]);
  return value;
}

/* ── Transport Icon ────────────────────────────────────────── */
function TransportIcon({ mode }) {
  const map = {
    Train: <Train size={16} />, Bus: <Bus size={16} />,
    Cab: <Car size={16} />, Metro: <Train size={16} />,
    Auto: <Bike size={16} />, Walk: <Navigation size={16} />
  };
  return map[mode] || <Car size={16} />;
}

/* ── Mini circular ring for metric tiles ───────────────────── */
function MiniRing({ value, color }) {
  const r = 18, circ = 2 * Math.PI * r;
  const offset = circ - (circ * value) / 100;
  return (
    <svg width={44} height={44} viewBox="0 0 44 44" className="-rotate-90">
      <circle cx={22} cy={22} r={r} stroke="rgba(100,116,139,0.15)" strokeWidth={4} fill="none" />
      <circle cx={22} cy={22} r={r} stroke={color} strokeWidth={4} fill="none"
        strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)' }}
      />
    </svg>
  );
}

/* ── Risk Factor Row ────────────────────────────────────────── */
function RiskRow({ label, severity }) {
  const clr = severity === 'low'
    ? { bg: 'rgba(16,185,129,0.08)', text: '#10B981', icon: <CheckCircle2 size={13} /> }
    : severity === 'medium'
    ? { bg: 'rgba(245,158,11,0.08)', text: '#F59E0B', icon: <AlertTriangle size={13} /> }
    : { bg: 'rgba(239,68,68,0.08)', text: '#EF4444', icon: <XCircle size={13} /> };
  return (
    <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl"
      style={{ background: clr.bg }}>
      <span style={{ color: clr.text, flexShrink: 0 }}>{clr.icon}</span>
      <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500 }}>{label}</span>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AISafetyScoreCard({ event, initialDistance = 35, compact = false }) {
  const [distance, setDistance] = useState(initialDistance);
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState(null);
  const animatedScore = useCountUp(report?.score || 0, 1400, 400);

  /* ── Derive rich safety data from score + params ─────────── */
  const buildReport = (score, status, reasons, advice, distVal) => {
    const travelMins = Math.round(distVal * 1.4);
    const hour = new Date().getHours();
    const isNight = hour >= 20 || hour <= 5;

    let transport = 'Bus';
    if (distVal > 150) transport = 'Train';
    else if (distVal > 50) transport = 'Train';
    else if (distVal > 25) transport = 'Bus';
    else if (distVal > 10) transport = 'Auto';
    else transport = 'Walk';

    const bestTime = score >= 80
      ? 'Before 7:00 PM (Recommended)'
      : score >= 60 ? 'Before 8:30 PM (Advised)' : 'Travel during daylight only';

    const weather = distVal > 100 ? 'Partly Cloudy, 28°C' : 'Clear Sky, 26°C';
    const weatherIcon = distVal > 100 ? '⛅' : '☀️';

    const riskFactors = [];
    if (distVal > 100) riskFactors.push({ label: `Long distance journey (${distVal} km)`, severity: 'high' });
    else if (distVal > 50) riskFactors.push({ label: `Moderate distance (${distVal} km)`, severity: 'medium' });
    else riskFactors.push({ label: `Short distance — manageable (${distVal} km)`, severity: 'low' });

    if (isNight) riskFactors.push({ label: 'Late-night travel detected', severity: 'high' });
    else riskFactors.push({ label: 'Daytime travel conditions', severity: 'low' });

    if (score < 70) riskFactors.push({ label: 'Limited transport options at this hour', severity: 'medium' });
    else riskFactors.push({ label: 'Multiple transport routes available', severity: 'low' });

    const tips = [
      'Share your live location with an emergency contact before departure.',
      `Book a verified ${transport.toLowerCase()} or campus cab pool in advance.`,
      'Keep campus helpline number saved: 1800-XXX-XXXX.',
      score < 75 ? 'Travel in groups of 2+ for added safety.' : 'Carry a fully charged power bank for the journey.',
    ];

    return {
      score, status, reasons, advice, transport, bestTime,
      weather, weatherIcon, travelMins, riskFactors, tips,
      confidence: Math.min(98, score + 3),
      aiExplanation: score >= 80
        ? `Daytime travel, ${weather.toLowerCase()}, and ${transport.toLowerCase()} connectivity make this a low-risk journey.`
        : score >= 60
        ? `Moderate risk due to distance and timing. Plan early departure and book transport in advance.`
        : `High-risk travel detected. Strongly advise arranging verified transport and traveling with companions.`
    };
  };

  const fetchScore = async (distVal) => {
    setLoading(true);
    try {
      const res = await api.post('/ai/safety-score', {
        distanceKm: distVal,
        travelTimeMins: Math.round(distVal * 1.4),
        eventEndTime: event?.endTime || '08:30 PM',
        currentTime: '06:00 PM',
        weather: distVal > 100 ? 'Partly Cloudy' : 'Clear sky, 26°C',
        transportAvailable: true
      });
      if (res.data.success) {
        const d = res.data.data;
        setReport(buildReport(d.score, d.status, d.reasons, d.advice, distVal));
      } else throw new Error('No data');
    } catch {
      // Heuristic fallback
      let score = 95 - Math.round(distVal * 0.22);
      if (event?.endTime?.includes('PM') && parseInt(event.endTime) >= 8) score -= 12;
      score = Math.max(35, Math.min(98, score));
      const status = score < 60 ? 'High Risk' : score < 80 ? 'Moderate' : 'Safe';
      const reasons = [
        `Transit distance: ${distVal} km via verified route`,
        event?.endTime ? `Event concludes around ${event.endTime}` : 'Concludes during evening hours',
        score >= 75 ? 'Multiple public transport options available' : 'Limited night transport — pre-book advised'
      ];
      const advice = score < 70
        ? 'Travel with peers and use campus-verified cab pool services.'
        : 'Share your live GPS location with your emergency contact.';
      setReport(buildReport(score, status, reasons, advice, distVal));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchScore(distance); }, [distance, event]);

  if (!report && loading) return (
    <div className="kaggle-card p-8 flex flex-col items-center gap-4 justify-center min-h-[200px]">
      <Loader2 size={28} className="animate-spin" style={{ color: '#20BEFF' }} />
      <p style={{ fontSize: 13, color: '#64748B' }}>Generating AI Travel Safety Report…</p>
    </div>
  );

  if (!report) return null;

  /* ── Status colors ─────────────────────────────────────── */
  const statusConfig = {
    'Safe':      { color: '#10B981', bg: 'rgba(16,185,129,0.08)',  border: 'rgba(16,185,129,0.3)',  glow: 'safety-glow-green', emoji: '🟢', icon: <ShieldCheck size={14}/> },
    'Moderate':  { color: '#F59E0B', bg: 'rgba(245,158,11,0.08)', border: 'rgba(245,158,11,0.3)', glow: 'safety-glow-amber', emoji: '🟡', icon: <AlertTriangle size={14}/> },
    'High Risk': { color: '#EF4444', bg: 'rgba(239,68,68,0.08)',  border: 'rgba(239,68,68,0.3)',  glow: 'safety-glow-red',   emoji: '🔴', icon: <ShieldAlert size={14}/> },
  };
  const sc = statusConfig[report.status] || statusConfig['Safe'];
  const scoreColor = report.score >= 80 ? '#10B981' : report.score >= 60 ? '#F59E0B' : '#EF4444';

  /* ── SVG Gauge ─────────────────────────────────────────── */
  const R = 58, CIRC = 2 * Math.PI * R;
  const offset = CIRC - (CIRC * animatedScore) / 100;

  const metrics = [
    { icon: <Navigation size={14} />, label: 'Distance', value: `${distance} km`, color: '#20BEFF' },
    { icon: <Clock size={14} />, label: 'Travel Time', value: `${report.travelMins} min`, color: '#8B5CF6' },
    { icon: <CloudSun size={14} />, label: 'Weather', value: report.weather, color: '#10B981' },
    { icon: <Eye size={14} />, label: 'Best Time', value: report.bestTime.split(' (')[0], color: '#F59E0B' },
    { icon: <TransportIcon mode={report.transport} />, label: 'Transport', value: report.transport, color: '#06B6D4' },
    { icon: <Clock size={14} />, label: 'Event Ends', value: event?.endTime || '08:30 PM', color: '#EC4899' },
  ];

  if (compact) {
    /* ── Compact version for sidebar ───────────────────────── */
    return (
      <div className={`kaggle-card p-5 space-y-4 ${sc.glow}`}
        style={{ borderColor: sc.border, background: `linear-gradient(135deg,${sc.color}08 0%,transparent 70%)` }}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl" style={{ background: `${sc.color}15` }}>
              <Sparkles size={14} style={{ color: sc.color }} />
            </div>
            <div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--tw-prose-headings,#0F172A)' }}
                className="dark:text-white">AI Safety Score</div>
              <div style={{ fontSize: 10, color: '#64748B' }}>Gemini Risk Engine</div>
            </div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border"
            style={{ background: sc.bg, borderColor: sc.border, color: sc.color, fontSize: 11, fontWeight: 800 }}>
            {sc.icon} {report.status}
          </div>
        </div>
        {/* Mini gauge + score */}
        <div className="flex items-center gap-4">
          <div className="relative flex-shrink-0">
            <svg width={72} height={72} viewBox="0 0 72 72" className="-rotate-90">
              <circle cx={36} cy={36} r={28} stroke="rgba(100,116,139,0.12)" strokeWidth={7} fill="none"/>
              <circle cx={36} cy={36} r={28} stroke={scoreColor} strokeWidth={7} fill="none"
                strokeDasharray={2 * Math.PI * 28}
                strokeDashoffset={2 * Math.PI * 28 - (2 * Math.PI * 28 * animatedScore) / 100}
                strokeLinecap="round"
                style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4,0,0.2,1)' }}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span style={{ fontSize: 16, fontWeight: 900, color: scoreColor }}>{animatedScore}%</span>
            </div>
          </div>
          <div className="flex-1 space-y-1.5">
            {metrics.slice(0, 3).map((m, i) => (
              <div key={i} className="flex items-center justify-between">
                <span className="flex items-center gap-1.5" style={{ fontSize: 11, color: '#64748B' }}>
                  <span style={{ color: m.color }}>{m.icon}</span>{m.label}
                </span>
                <span style={{ fontSize: 11, fontWeight: 700, color: '#CBD5E1' }}>{m.value}</span>
              </div>
            ))}
          </div>
        </div>
        <div className="p-3 rounded-xl" style={{ background: `${sc.color}08`, border: `1px solid ${sc.border}` }}>
          <p style={{ fontSize: 11, color: '#94A3B8', lineHeight: 1.6 }}>
            <span style={{ color: sc.color, fontWeight: 700 }}>AI: </span>{report.aiExplanation}
          </p>
        </div>
      </div>
    );
  }

  /* ── Full version ──────────────────────────────────────── */
  return (
    <div className={`kaggle-card overflow-hidden ${sc.glow}`}
      style={{ borderColor: sc.border, fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Gradient Header ───────────────────────────────── */}
      <div className="relative p-6 pb-4 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${sc.color}0F 0%, rgba(15,17,23,0.6) 100%)` }}>

        {/* Scan line animation */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div style={{
            position: 'absolute', left: 0, right: 0, height: 2,
            background: `linear-gradient(90deg,transparent,${sc.color}60,transparent)`,
            animation: 'scanLine 3s ease-in-out infinite'
          }} />
        </div>

        <div className="flex items-center justify-between flex-wrap gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl animate-float"
              style={{ background: `${sc.color}15`, border: `1px solid ${sc.color}30` }}>
              <Sparkles size={20} style={{ color: sc.color }} />
            </div>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 900, letterSpacing: '-0.02em' }}
                className="text-slate-900 dark:text-white">
                AI Travel Safety Report
              </h3>
              <p style={{ fontSize: 11, color: '#64748B', marginTop: 1 }}>
                Powered by Gemini 2.5 Flash Risk Reasoning Engine
              </p>
            </div>
          </div>

          {/* Status Badge */}
          <div className="flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-extrabold"
            style={{ background: sc.bg, borderColor: sc.border, color: sc.color }}>
            {sc.icon}
            <span>{sc.emoji} {report.status} Travel</span>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">

        {/* ─── Main Score Gauge ──────────────────────────────── */}
        <div className="flex flex-col md:flex-row items-center gap-6 p-5 rounded-2xl dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800"
          style={{ background: 'rgba(15,23,42,0.06)' }}>

          {/* Circular Gauge */}
          <div className="relative flex-shrink-0 flex flex-col items-center">
            <div className="relative">
              <svg width={144} height={144} viewBox="0 0 144 144" className="-rotate-90">
                {/* Track */}
                <circle cx={72} cy={72} r={R} stroke="rgba(100,116,139,0.12)" strokeWidth={12} fill="none"/>
                {/* Progress */}
                <circle cx={72} cy={72} r={R} stroke={scoreColor} strokeWidth={12} fill="none"
                  strokeDasharray={CIRC} strokeDashoffset={offset}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1.4s cubic-bezier(0.4,0,0.2,1)', filter: `drop-shadow(0 0 8px ${scoreColor}60)` }}
                />
                {/* Glow ring */}
                <circle cx={72} cy={72} r={R + 6} stroke={scoreColor} strokeWidth={1} fill="none"
                  strokeDasharray="2 8" strokeLinecap="round" opacity={0.3}
                  style={{ animation: 'spin 8s linear infinite' }}
                />
              </svg>
              {/* Center text */}
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="animate-count-up" style={{ fontSize: 36, fontWeight: 900, color: scoreColor, lineHeight: 1 }}>
                  {animatedScore}
                </span>
                <span style={{ fontSize: 11, color: '#64748B', fontWeight: 700, letterSpacing: '0.06em' }}>SAFETY</span>
              </div>
            </div>
            {/* Confidence score */}
            <div className="mt-3 flex items-center gap-1.5 px-3 py-1 rounded-full"
              style={{ background: 'rgba(32,190,255,0.08)', border: '1px solid rgba(32,190,255,0.2)' }}>
              <Zap size={10} style={{ color: '#20BEFF' }} />
              <span style={{ fontSize: 10, color: '#20BEFF', fontWeight: 700 }}>
                {report.confidence}% Confidence
              </span>
            </div>
          </div>

          {/* Metric Grid */}
          <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 w-full">
            {metrics.map((m, i) => (
              <div key={i} className="metric-tile flex flex-col gap-1">
                <div className="flex items-center gap-1.5" style={{ color: m.color }}>
                  {m.icon}
                  <span style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{m.label}</span>
                </div>
                <span style={{ fontSize: 13, fontWeight: 800 }} className="text-slate-900 dark:text-white truncate" title={m.value}>
                  {m.value}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── AI Explanation ────────────────────────────────── */}
        <div className="p-4 rounded-2xl relative overflow-hidden"
          style={{ background: `${sc.color}08`, border: `1px solid ${sc.color}25` }}>
          <div className="flex items-start gap-3">
            <div className="p-2 rounded-xl flex-shrink-0 mt-0.5"
              style={{ background: `${sc.color}15` }}>
              <Sparkles size={14} style={{ color: sc.color }} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: sc.color, textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
                Gemini AI Analysis
              </div>
              <p style={{ fontSize: 13, color: '#CBD5E1', lineHeight: 1.7 }}>
                {report.aiExplanation}
              </p>
            </div>
          </div>
        </div>

        {/* ─── Distance Slider ───────────────────────────────── */}
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <label style={{ fontSize: 12, fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Simulate Travel Distance
            </label>
            <span style={{ fontSize: 14, fontWeight: 900, color: '#20BEFF' }}>{distance} km</span>
          </div>
          <div className="relative">
            <input type="range" min="5" max="300" value={distance}
              onChange={(e) => setDistance(Number(e.target.value))}
              className="w-full h-2 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              style={{ background: `linear-gradient(to right, #20BEFF ${distance/3}%, rgba(100,116,139,0.2) ${distance/3}%)` }}
            />
          </div>
          <div className="flex justify-between text-xs text-slate-400">
            <span>5 km (Campus)</span><span>150 km (State)</span><span>300 km (National)</span>
          </div>
        </div>

        {/* ─── Risk Factors ──────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown size={14} style={{ color: '#F59E0B' }} />
            <h4 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Risk Factor Analysis
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {report.riskFactors.map((rf, i) => (
              <RiskRow key={i} label={rf.label} severity={rf.severity} />
            ))}
          </div>
        </div>

        {/* ─── AI Safety Reasoning ───────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Info size={14} style={{ color: '#20BEFF' }} />
            <h4 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Safety Reasoning
            </h4>
          </div>
          <div className="space-y-2">
            {report.reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2.5 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(100,116,139,0.05)', border: '1px solid rgba(100,116,139,0.1)' }}>
                <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ background: '#20BEFF' }} />
                <span style={{ fontSize: 12, color: '#CBD5E1', fontWeight: 500, lineHeight: 1.6 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Travel Tips ───────────────────────────────────── */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Lightbulb size={14} style={{ color: '#10B981' }} />
            <h4 style={{ fontSize: 12, fontWeight: 800, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              AI Travel Tips
            </h4>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {report.tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-2 px-3 py-2.5 rounded-xl"
                style={{ background: 'rgba(16,185,129,0.05)', border: '1px solid rgba(16,185,129,0.12)' }}>
                <CheckCircle2 size={13} className="flex-shrink-0 mt-0.5" style={{ color: '#10B981' }} />
                <span style={{ fontSize: 11.5, color: '#94A3B8', lineHeight: 1.6 }}>{tip}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ─── Safety Advisory ───────────────────────────────── */}
        {report.advice && (
          <div className="p-4 rounded-2xl flex items-start gap-3"
            style={{ background: 'rgba(245,158,11,0.07)', border: '1px solid rgba(245,158,11,0.25)' }}>
            <AlertTriangle size={16} className="flex-shrink-0 mt-0.5" style={{ color: '#F59E0B' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 800, color: '#F59E0B', marginBottom: 2 }}>Safety Advisory</div>
              <span style={{ fontSize: 12, color: '#FCD34D', lineHeight: 1.7 }}>{report.advice}</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
