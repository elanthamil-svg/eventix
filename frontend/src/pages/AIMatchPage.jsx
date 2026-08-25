import React from 'react';
import { Sparkles, Brain, Zap, Target } from 'lucide-react';
import AIRecommendationSection from '../components/AIRecommendationSection';

const FEATURES = [
  {
    icon: Brain,
    title: 'Gemini AI Scoring',
    desc: 'Deep language model scoring evaluated against your academic domain and technical interests.'
  },
  {
    icon: Zap,
    title: 'Instant Engine',
    desc: 'Fast heuristic matching that scores multiple factors in milliseconds with local fallback.'
  },
  {
    icon: Target,
    title: 'Domain Matching',
    desc: 'Evaluates interest overlap, technical skills, department alignment, and event domains.'
  },
];

export default function AIMatchPage() {
  return (
    <div className="space-y-6 max-w-5xl mx-auto">

      {/* Hero Header */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-7 sm:p-10">
        <div className="max-w-3xl space-y-5">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-slate-500" />
            AI Personalization Engine
          </div>

          {/* Title */}
          <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">
            AI Match Fest
          </h1>

          {/* Description */}
          <p className="text-base text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl">
            Select your interests, year of study, and department. Our recommendation engine ranks every competition and fest across India specifically for you with personalized relevance scores.
          </p>

          {/* Feature Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div
                key={title}
                className="p-5 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2.5"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
                    <Icon className="w-4.5 h-4.5 text-slate-700 dark:text-slate-300" size={18} />
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white">{title}</span>
                </div>
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* AI Recommendation Engine */}
      <AIRecommendationSection />

    </div>
  );
}
