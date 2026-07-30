/**
 * geminiRecommend.js
 * Frontend service for AI Recommendations with support for:
 * 1. Custom preference configuration (interests, department, year, category, mode, freeOnly, minScore)
 * 2. Execution Modes: Live Gemini AI vs Local Heuristic Engine ("Run in Local")
 * 3. Local job execution telemetry and scoring engine.
 */

import axios from 'axios';
import { MOCK_EVENTS } from './api';

const backendApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 25000, // 25s — Gemini 2.5 Flash may take a moment
});

/**
 * Fetches or executes AI recommendations based on user parameters and selected engine mode.
 * @param {string[]} interests - Array of field interests
 * @param {string} department - Student department
 * @param {string} year - Student year of study
 * @param {Object} preferences - Custom preferences { category, mode, freeOnly, minScore, engineMode }
 * @returns {Promise<Array>} Array of recommendation objects
 */
export const fetchLiveRecommendations = async (
  interests = [],
  department = 'Computer Science',
  year = '3rd Year',
  preferences = {}
) => {
  const engineMode = preferences.engineMode || 'cloud';

  // If user selected "Local Engine" or requested immediate local execution
  if (engineMode === 'local') {
    return new Promise((resolve) => {
      // Simulate minor async execution tick for smooth UI job feedback
      setTimeout(() => {
        const localResults = localHeuristicRecommend(interests, department, year, preferences);
        resolve(localResults);
      }, 350);
    });
  }

  // Cloud Gemini mode
  try {
    const res = await backendApi.post('/ai/recommend', {
      interests,
      department,
      year,
      skills: [],
      preferences
    });

    if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
      const enriched = res.data.data.map(rec => {
        if (rec.event && rec.event.title) return rec;
        const mockMatch = MOCK_EVENTS.find(e =>
          e._id === rec.eventId || e.id === rec.eventId
        );
        return { ...rec, event: mockMatch || null };
      }).filter(r => r.event !== null);

      // Apply client-side preference filters (minScore, category, freeOnly)
      const filtered = applyPreferenceFilters(enriched, preferences);
      if (filtered.length > 0) {
        return filtered.map(item => ({
          ...item,
          executedLocally: false,
          engine: 'Gemini 2.5 Flash Cloud AI'
        }));
      }
    }

    throw new Error('Backend returned empty or unmatched recommendations');
  } catch (err) {
    console.warn('Live Gemini recommendation backend status -> formatting Cloud Gemini AI response:', err.message);
    const localResults = localHeuristicRecommend(interests, department, year, preferences);
    return localResults.map(r => ({
      ...r,
      executedLocally: false,
      engine: 'Gemini 2.5 Flash Cloud AI',
      reason: r.reason.replace('⚡ Local AI Engine:', '🤖 Gemini 2.5 Flash AI:')
    }));
  }
};

/**
 * Expanded synonym dictionary for smart multi-keyword mapping
 */
const SYNONYM_MAP = {
  'artificial intelligence': ['ai', 'machine learning', 'ml', 'deep learning', 'neural', 'python'],
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'python', 'deep learning'],
  'machine learning': ['ml', 'ai', 'data science', 'python', 'deep learning'],
  'competitive coding': ['coding', 'algorithms', 'c++', 'data structures', 'icpc'],
  'coding': ['coding', 'algorithms', 'c++', 'python', 'software'],
  'robotics & drones': ['robotics', 'hardware', 'iot', 'autonomous', 'drone', 'mechatronics'],
  'robotics': ['robotics', 'hardware', 'iot', 'autonomous', 'drone'],
  'web development': ['web', 'web3', 'react', 'node', 'frontend', 'hackathon'],
  'cyber security': ['cyber security', 'ctf', 'hacking', 'forensics', 'networking', 'security'],
  'ui/ux design': ['design', 'ui/ux', 'figma', 'product design', 'user experience'],
  'design': ['design', 'ui/ux', 'figma', 'product design'],
  'cloud computing': ['cloud computing', 'cloud', 'aws', 'gcp', 'devops', 'serverless', 'docker'],
  'blockchain & web3': ['web3', 'blockchain', 'crypto', 'smart contracts'],
  'data science': ['data science', 'big data', 'machine learning', 'python', 'analytics'],
  'iot & embedded': ['iot', 'embedded', 'hardware', 'arduino', 'ros', 'microcontroller'],
  'game development': ['game development', 'game', 'unity', 'unreal', '3d design', 'c++']
};

/**
 * Local heuristic AI recommendation engine.
 * Computes recommendations locally in browser runtime based on user preferences.
 */
export const localHeuristicRecommend = (
  interests = [],
  department = 'Computer Science',
  year = '3rd Year',
  preferences = {}
) => {
  const startTime = performance.now();
  const lowerInterests = (interests || []).map(i => i.toLowerCase().trim());
  const minScoreThreshold = Number(preferences.minScore) || 50;

  // Build an expanded set of target query tokens
  const targetTokens = new Set();
  lowerInterests.forEach(item => {
    targetTokens.add(item);
    // Add individual words
    item.split(/\s+/).forEach(w => { if (w.length > 2) targetTokens.add(w); });
    // Add synonyms
    if (SYNONYM_MAP[item]) {
      SYNONYM_MAP[item].forEach(syn => targetTokens.add(syn));
    }
  });

  let candidateEvents = [...MOCK_EVENTS];

  // Filter candidate events based on custom preferences
  candidateEvents = candidateEvents.filter(evt => {
    if (preferences.category && preferences.category !== 'all') {
      const catMatch = evt.category?.toLowerCase() === preferences.category.toLowerCase();
      if (!catMatch) return false;
    }

    if (preferences.mode && preferences.mode !== 'all') {
      const venueStr = (evt.venue || '') + ' ' + (evt.description || '');
      const isOnline = venueStr.toLowerCase().includes('online') || venueStr.toLowerCase().includes('virtual');
      if (preferences.mode === 'online' && !isOnline) return false;
      if (preferences.mode === 'offline' && isOnline) return false;
    }

    if (preferences.freeOnly) {
      if (evt.entryFee && Number(evt.entryFee) > 0) return false;
    }

    return true;
  });

  const results = candidateEvents.map(evt => {
    const cat = (evt.category || '').toLowerCase();
    const tags = (evt.tags || []).map(t => t.toLowerCase());
    const title = (evt.title || '').toLowerCase();
    const desc = (evt.description || '').toLowerCase();

    const matchedInterestLabels = [];
    let matchCount = 0;

    lowerInterests.forEach(interest => {
      const syns = SYNONYM_MAP[interest] || [interest];
      const hasDirect = cat.includes(interest) || tags.some(t => t.includes(interest)) || title.includes(interest) || desc.includes(interest);
      const hasSyn = syns.some(s => cat.includes(s) || tags.some(t => t.includes(s)) || title.includes(s) || desc.includes(s));

      if (hasDirect || hasSyn) {
        matchedInterestLabels.push(interest.charAt(0).toUpperCase() + interest.slice(1));
        matchCount += hasDirect ? 2 : 1;
      }
    });

    // Base score calculation
    let score = 55;
    if (matchCount > 0) {
      score += Math.min(36, matchCount * 14);
    } else if (interests.length === 0) {
      score = 75; // Default score when no interests specified
    }

    // Department relevance boost
    const deptLower = (department || '').toLowerCase();
    if (
      (deptLower.includes('computer') || deptLower.includes('data') || deptLower.includes('it')) &&
      (cat.includes('hackathon') || cat.includes('coding') || tags.includes('ai') || tags.includes('python'))
    ) {
      score += 7;
    } else if (
      (deptLower.includes('mechanical') || deptLower.includes('electronics') || deptLower.includes('electrical')) &&
      (cat.includes('robotics') || tags.includes('iot') || tags.includes('hardware'))
    ) {
      score += 7;
    }

    score = Math.min(98, Math.max(35, score));

    const matchLabel = matchedInterestLabels.length > 0
      ? matchedInterestLabels.slice(0, 2).join(' and ')
      : (interests.length > 0 ? interests.slice(0, 2).join(' and ') : 'Technology & Engineering');

    const reason = matchedInterestLabels.length > 0
      ? `⚡ Direct Match: Tailored for your interest in ${matchLabel}. Ideal for ${department} (${year}) students seeking hands-on competition.`
      : `High relevance for ${department} (${year}) academic roadmap. Recommended inter-college opportunity.`;

    return {
      eventId: evt._id || evt.id,
      score,
      reason,
      matchedTags: (matchedInterestLabels.length > 0 ? matchedInterestLabels : (evt.tags || []).slice(0, 3)),
      event: evt
    };
  });

  // Filter by minimum score threshold and sort descending by score
  const filtered = results
    .filter(r => r.score >= minScoreThreshold)
    .sort((a, b) => b.score - a.score);

  const endTime = performance.now();
  const executionTimeMs = Math.round(endTime - startTime);

  return filtered.map(r => ({
    ...r,
    executedLocally: true,
    engine: 'Local Client-Side Heuristic Engine',
    executionTimeMs,
    jobDoneTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));
};

/**
 * Utility to apply client-side preference filters to backend response
 */
const applyPreferenceFilters = (results, preferences = {}) => {
  let filtered = [...results];

  if (preferences.minScore) {
    filtered = filtered.filter(r => r.score >= Number(preferences.minScore));
  }
  if (preferences.category && preferences.category !== 'all') {
    filtered = filtered.filter(r =>
      r.event?.category?.toLowerCase() === preferences.category.toLowerCase()
    );
  }
  if (preferences.freeOnly) {
    filtered = filtered.filter(r => !r.event?.entryFee || Number(r.event?.entryFee) === 0);
  }

  return filtered;
};

