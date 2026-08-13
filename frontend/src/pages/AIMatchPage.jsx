/**
 * AIMatchPage.jsx — Dedicated AI Match Fest Module
 * Full-page experience for personalized AI event matching.
 * This is the ONLY place AIRecommendationSection is rendered.
 */
import React from 'react';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';
import AIRecommendationSection from '../components/AIRecommendationSection';

const FEATURES = [
  {
    icon: Brain,
    color: '#20BEFF',
    title: 'Gemini 2.5 Flash AI',
    desc: 'Google\'s most advanced language model ranks every event against your academic profile with deep semantic understanding.'
  },
  {
    icon: Zap,
    color: '#10B981',
    title: 'Instant Local Engine',
    desc: 'On-device heuristic scoring with multi-factor analysis — runs in milliseconds with no server needed.'
  },
  {
    icon: Target,
    color: '#8B5CF6',
    title: '5-Factor Accuracy',
    desc: 'Interest match, skill applicability, year suitability, department alignment, and opportunity prestige — all weighted.'
  },
];

export default function AIMatchPage() {
  return (
    <div className="space-y-8" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* ─── Hero Header ─────────────────────────────────────────── */}
      <div className="relative rounded-2xl overflow-hidden p-8 md:p-10"
        style={{
          background: 'linear-gradient(135deg, rgba(32,190,255,0.08) 0%, rgba(139,92,246,0.06) 50%, rgba(16,185,129,0.05) 100%)',
          border: '1px solid rgba(32,190,255,0.2)'
        }}>

        {/* Background glowing orbs */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(32,190,255,0.1) 0%, transparent 70%)', transform: 'translate(30%,-30%)' }} />
        <div className="absolute bottom-0 left-0 w-64 h-64 pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.08) 0%, transparent 70%)', transform: 'translate(-30%,30%)' }} />

        <div className="relative z-10 max-w-3xl">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full mb-5"
            style={{ background: 'rgba(32,190,255,0.1)', border: '1px solid rgba(32,190,255,0.25)' }}>
            <Sparkles size={13} style={{ color: '#20BEFF' }} className="animate-pulse" />
            <span style={{ fontSize: 11, fontWeight: 700, color: '#20BEFF', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              AI-Powered Personalization Module
            </span>
          </div>

          <h1 className="text-slate-900 dark:text-white mb-3"
            style={{ fontSize: 'clamp(26px,3.5vw,42px)', fontWeight: 900, letterSpacing: '-0.03em', lineHeight: 1.1 }}>
            AI Match Fest
            <span style={{ color: '#20BEFF' }}> Engine</span>
          </h1>

          <p className="text-slate-500 dark:text-slate-400 mb-6"
            style={{ fontSize: 15, lineHeight: 1.7, maxWidth: 560 }}>
            Eventix's most powerful module. Select your interests, year, and department — 
            our AI ranks every competition and fest across India specifically for you, with 
            personalized recommendations and detailed explanations.
          </p>

          {/* Feature Pills */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FEATURES.map(({ icon: Icon, color, title, desc }) => (
              <div key={title} className="p-4 rounded-xl"
                style={{ background: `${color}08`, border: `1px solid ${color}20` }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                    style={{ background: `${color}15` }}>
                    <Icon size={14} style={{ color }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 700, color }} className="dark:text-white">
                    {title}
                  </span>
                </div>
                <p style={{ fontSize: 11, color: '#64748B', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ─── AI Recommendation Engine ────────────────────────────── */}
      <AIRecommendationSection />

    </div>
  );
}
