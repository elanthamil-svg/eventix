/**
 * geminiRecommend.js
 * Frontend service for AI Recommendations with support for:
 * 1. Custom preference configuration (interests, department, year, category, mode, freeOnly, minScore)
 * 2. Execution Modes: Live Gemini AI vs Local Heuristic Engine ("Run in Local")
 * 3. Fine-tuned multi-factor local scoring engine with expanded synonym map
 */

import axios from 'axios';
import { MOCK_EVENTS } from './api';

const backendApi = axios.create({
  baseURL: '/api',
  headers: { 'Content-Type': 'application/json' },
  timeout: 30000,
});

/**
 * Fetches or executes AI recommendations based on user parameters and selected engine mode.
 */
export const fetchLiveRecommendations = async (
  interests = [],
  department = 'Computer Science',
  year = '3rd Year',
  preferences = {}
) => {
  const engineMode = preferences.engineMode || 'cloud';

  if (engineMode === 'local') {
    return new Promise((resolve) => {
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
      skills: preferences.skills || [],
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

      const filtered = applyPreferenceFilters(enriched, preferences);
      if (filtered.length > 0) {
        // Sort matched events by NIRF rank ascending (Rank 1, 2, 3... first)
        filtered.sort((a, b) => {
          const rankA = a.event?.nirfRank ?? 9999;
          const rankB = b.event?.nirfRank ?? 9999;
          if (rankA !== rankB) return rankA - rankB;
          return (b.score || 0) - (a.score || 0);
        });
        return filtered.map(item => ({
          ...item,
          executedLocally: false,
          engine: 'Gemini 2.5 Flash Cloud AI'
        }));
      }
    }

    throw new Error('Backend returned empty or unmatched recommendations');
  } catch (err) {
    console.warn('Gemini cloud unavailable, falling back to local engine:', err.message);
    // ✅ FIX: correctly mark fallback results as local — not Cloud AI
    const localResults = localHeuristicRecommend(interests, department, year, preferences);
    return localResults.map(r => ({
      ...r,
      executedLocally: true,
      engine: 'Local Heuristic Engine v2.0',
    }));
  }
};

/**
 * Expanded synonym dictionary covering ALL 22 event categories
 */
const SYNONYM_MAP = {
  // Core Tech
  'artificial intelligence': ['ai', 'machine learning', 'ml', 'deep learning', 'neural', 'python', 'nlp', 'llm', 'generative ai', 'transformers', 'hackathon', 'coding', 'tech', 'symposium'],
  'ai': ['ai', 'artificial intelligence', 'machine learning', 'python', 'deep learning', 'neural', 'nlp', 'generative', 'hackathon', 'coding', 'tech'],
  'machine learning': ['ml', 'ai', 'data science', 'python', 'deep learning', 'tensorflow', 'pytorch', 'sklearn', 'xgboost'],
  'data science': ['data science', 'big data', 'machine learning', 'python', 'analytics', 'visualization', 'sql', 'pandas', 'numpy'],
  'competitive coding': ['coding', 'algorithms', 'c++', 'data structures', 'icpc', 'competitive programming', 'leetcode', 'codeforces'],
  'coding': ['coding', 'algorithms', 'c++', 'python', 'software', 'programming', 'java', 'dynamic programming'],
  'web development': ['web', 'web3', 'react', 'node', 'frontend', 'backend', 'javascript', 'html', 'hackathon', 'fullstack', 'nextjs'],
  'cyber security': ['cyber security', 'ctf', 'hacking', 'forensics', 'networking', 'security', 'ethical hacking', 'penetration', 'osint', 'reverse engineering'],
  'cloud computing': ['cloud computing', 'cloud', 'aws', 'gcp', 'azure', 'devops', 'serverless', 'docker', 'kubernetes', 'terraform'],
  'blockchain & web3': ['web3', 'blockchain', 'crypto', 'smart contracts', 'solidity', 'ethereum', 'nft', 'defi', 'dao', 'polygon', 'solana'],
  'iot & embedded': ['iot', 'embedded', 'hardware', 'arduino', 'ros', 'microcontroller', 'raspberry pi', 'sensors', 'edge ai', 'fpga'],
  'robotics & drones': ['robotics', 'hardware', 'iot', 'autonomous', 'drone', 'mechatronics', 'robot', 'servo', 'actuator', 'pid'],
  'robotics': ['robotics', 'hardware', 'iot', 'autonomous', 'drone', 'robot', 'mechatronics'],
  'game development': ['game development', 'game', 'unity', 'unreal', '3d design', 'c++', 'gaming', 'xr', 'vr', 'game jam'],
  'ar/vr': ['ar', 'vr', 'xr', 'augmented reality', 'virtual reality', 'unity', 'metaverse', 'immersive', '3d', 'webxr', 'openxr'],
  'space technology': ['space', 'satellite', 'aerospace', 'isro', 'orbital', 'cubesat', 'astronomy', 'astrophysics', 'rocket', 'payload'],
  // Design & Arts
  'ui/ux design': ['design', 'ui/ux', 'figma', 'product design', 'user experience', 'user interface', 'wireframe', 'prototype', 'usability'],
  'design': ['design', 'ui/ux', 'figma', 'product design', 'graphic', 'visual', 'creative', 'branding'],
  'photography & film': ['photography', 'film', 'camera', 'video', 'cinematography', 'creative arts', 'media', 'short film', 'dslr'],
  // Business & Social
  'entrepreneurship': ['startup', 'entrepreneurship', 'business', 'pitch', 'venture', 'innovation', 'product', 'market', 'vc', 'angel'],
  'finance & fintech': ['finance', 'fintech', 'banking', 'payments', 'trading', 'investment', 'blockchain', 'economics', 'insurance', 'defi'],
  'social innovation': ['social', 'community', 'rural', 'ngo', 'education', 'healthcare access', 'inclusion', 'sustainability', 'sdg'],
  // Life Sciences
  'biomedical & health tech': ['biomedical', 'health tech', 'medical', 'healthcare', 'diagnostics', 'genomics', 'clinical', 'prosthetics', 'telemedicine'],
  'ai & healthcare': ['ai', 'healthcare', 'medical', 'biomedical', 'diagnostics', 'machine learning', 'python', 'medical imaging'],
  // Others
  'cultural': ['cultural', 'dance', 'drama', 'music', 'theatre', 'art', 'literature', 'festivity', 'carnival'],
  'music & performing arts': ['music', 'vocals', 'band', 'performance', 'cultural', 'arts', 'composition', 'melody', 'instrument'],
  'environment & sustainability': ['environment', 'climate', 'sustainability', 'green', 'carbon', 'renewable', 'ecology', 'clean energy'],
  'sports technology': ['sports', 'wearable', 'fitness', 'athlete', 'performance', 'iot', 'sensor', 'analytics', 'biomechanics'],
};

/** Department to category affinity — drives the Department Alignment factor */
const DEPT_AFFINITY_MAP = {
  'computer science': ['hackathon', 'coding', 'ai', 'machine learning', 'web development', 'cyber security', 'cloud computing', 'data science', 'blockchain', 'game development', 'ar/vr'],
  'information technology': ['hackathon', 'coding', 'web development', 'cloud computing', 'cyber security', 'data science', 'blockchain', 'ar/vr'],
  'data science': ['data science', 'machine learning', 'ai', 'hackathon', 'coding', 'cloud computing', 'biomedical', 'sports technology'],
  'electronics': ['robotics', 'iot', 'hardware', 'embedded', 'space technology', 'sports technology', 'ar/vr'],
  'mechanical': ['robotics', 'hardware', 'space technology', 'iot', 'embedded', 'sports technology'],
  'electrical': ['robotics', 'iot', 'hardware', 'embedded', 'space technology', 'renewable energy'],
  'biomedical': ['biomedical', 'health tech', 'ai & healthcare', 'social innovation', 'sports technology'],
  'design': ['ui/ux design', 'design', 'cultural', 'photography', 'ar/vr', 'game development', 'entrepreneurship'],
  'civil': ['environment', 'social innovation', 'space technology', 'sustainability'],
  'chemical': ['environment', 'biomedical', 'social innovation', 'sustainability'],
  'management': ['entrepreneurship', 'finance & fintech', 'social innovation', 'startup'],
};

/**
 * Fine-tuned multi-factor local heuristic AI recommendation engine.
 * Scoring breakdown:
 *   Interest-Category Match  → 0-40 pts
 *   Skill Applicability      → 0-25 pts
 *   Year Suitability         → 0-15 pts
 *   Department Alignment     → 0-15 pts
 *   Opportunity/Prestige     → 0-5  pts
 */
export const localHeuristicRecommend = (
  interests = [],
  department = 'Computer Science',
  year = '3rd Year',
  preferences = {}
) => {
  const startTime = performance.now();
  const lowerInterests = (interests || []).map(i => i.toLowerCase().trim());
  const lowerSkills = (preferences.skills || []).map(s => s.toLowerCase().trim());
  const minScoreThreshold = Number(preferences.minScore) || 40;
  const deptLower = (department || '').toLowerCase();
  const yearNum = parseInt(year) || 3;

  // Find department affinity list
  const deptKey = Object.keys(DEPT_AFFINITY_MAP).find(k => deptLower.includes(k));
  const deptAffinityList = deptKey ? DEPT_AFFINITY_MAP[deptKey] : [];

  // Build expanded token set from interests + synonyms
  const expandedTokens = new Set();
  lowerInterests.forEach(item => {
    expandedTokens.add(item);
    item.split(/\s+/).forEach(w => { if (w.length > 2) expandedTokens.add(w); });
    (SYNONYM_MAP[item] || []).forEach(syn => expandedTokens.add(syn));
    Object.keys(SYNONYM_MAP).forEach(key => {
      if (key.includes(item) || item.includes(key)) {
        SYNONYM_MAP[key].forEach(syn => expandedTokens.add(syn));
      }
    });
  });

  let candidateEvents = [...MOCK_EVENTS];

  // Hard preference filters
  candidateEvents = candidateEvents.filter(evt => {
    if (preferences.category && preferences.category !== 'all') {
      if (evt.category?.toLowerCase() !== preferences.category.toLowerCase()) return false;
    }
    if (preferences.mode && preferences.mode !== 'all') {
      const venueStr = (evt.venue || '') + ' ' + (evt.description || '');
      const isOnline = /online|virtual|remote/i.test(venueStr);
      if (preferences.mode === 'online' && !isOnline) return false;
      if (preferences.mode === 'offline' && isOnline) return false;
    }
    if (preferences.freeOnly && evt.entryFee && Number(evt.entryFee) > 0) return false;
    if (preferences.region === 'south') {
      const locationStr = `${evt.collegeName} ${evt.venue} ${(evt.tags || []).join(' ')} ${evt.location?.city || ''} ${evt.location?.address || ''}`.toLowerCase();
      const isSouth = /kerala|tamil nadu|karnataka|telangana|andhra|chennai|coimbatore|kozhikode|bengaluru|bangalore|hyderabad|trivandrum|thiruvananthapuram|mangaluru|surathkal|vellore|thanjavur|amrita|nitc|psg|ssn|ceg|iiit|bits|nitk|rvce|sastra|cet|iit madras|vvit/i.test(locationStr);
      if (!isSouth) return false;
    }
    return true;
  });

  const results = candidateEvents.map(evt => {
    const cat = (evt.category || '').toLowerCase();
    const tags = (evt.tags || []).map(t => t.toLowerCase());
    const title = (evt.title || '').toLowerCase();
    const desc = (evt.description || '').toLowerCase();
    const college = (evt.collegeName || '').toLowerCase();
    const allText = `${cat} ${tags.join(' ')} ${title} ${desc} ${college}`;

    const isSouthFest = /kerala|tamil nadu|karnataka|telangana|andhra|chennai|coimbatore|kozhikode|bengaluru|bangalore|hyderabad|trivandrum|mangaluru|surathkal|vellore|thanjavur|nitc|psg|ssn|ceg|iiit|bits|nitk|rvce|sastra|cet|amrita|iitm/i.test(allText);

    // ── Factor 1: Interest-Category Match (0-40 pts) ──────────────
    let interestScore = 0;
    const matchedInterestLabels = [];
    if (lowerInterests.length === 0) {
      interestScore = 20; // neutral when no interests set
    } else {
      lowerInterests.forEach(interest => {
        // All synonyms for this interest
        const syns = SYNONYM_MAP[interest] || [interest];
        // Check category and tags (exact/partial)
        const directCatHit = cat === interest || tags.includes(interest);
        const partialCatHit = cat.includes(interest) || tags.some(t => t.includes(interest));
        // Check title
        const titleHit = title.includes(interest);
        // Check full text (including description) using expanded synonyms
        const synHit = syns.some(s => allText.includes(s));
        // Also check using the expandedTokens set (covers cross-references)
        const expandedHit = [...expandedTokens].some(token => allText.includes(token));

        if (directCatHit) {
          interestScore += 22;
          matchedInterestLabels.push(interest);
        } else if (partialCatHit) {
          interestScore += 16;
          matchedInterestLabels.push(interest);
        } else if (titleHit) {
          interestScore += 12;
          matchedInterestLabels.push(interest);
        } else if (synHit) {
          // Synonym found in description/tags — strong signal
          interestScore += 14;
          if (!matchedInterestLabels.includes(interest)) matchedInterestLabels.push(interest);
        } else if (expandedHit) {
          // Weak expanded match
          interestScore += 6;
        }
      });
    }
    interestScore = Math.min(40, interestScore);

    // ── Factor 2: Skill Applicability (0-25 pts) ──────────────────
    let skillScore = lowerSkills.length === 0 ? 10 : 0;
    if (lowerSkills.length > 0) {
      const skillHits = lowerSkills.filter(s => allText.includes(s)).length;
      skillScore = Math.min(25, skillHits * 9);
      if (skillScore === 0) skillScore = 3; // baseline
    }

    // ── Factor 3: Year Suitability (0-15 pts) ─────────────────────
    let yearScore = 8;
    if (/hackathon|coding|competitive|game jam/.test(cat)) {
      yearScore = Math.min(15, 6 + yearNum * 2);
    } else if (/research|symposium|conference/.test(cat)) {
      yearScore = Math.min(15, yearNum * 3);
    } else if (/cultural|music|dance|drama|performing/.test(cat)) {
      yearScore = Math.max(5, 16 - yearNum * 2);
    } else if (/startup|entrepreneurship|business|finance/.test(cat)) {
      yearScore = Math.min(15, 3 + yearNum * 3);
    } else if (/space|aerospace|biomedical|ar\/vr/.test(cat)) {
      yearScore = Math.min(15, 5 + yearNum * 2);
    }

    // ── Factor 4: Department Alignment (0-15 pts) ─────────────────
    let deptScore = 3; // base for all events (networking value)
    const hasPrimaryAffinity = deptAffinityList.some(affin =>
      cat.includes(affin) || tags.some(t => t.includes(affin)) || allText.includes(affin)
    );
    if (hasPrimaryAffinity) {
      deptScore = 15;
    } else if ((deptLower.includes('computer') || deptLower.includes('it') || deptLower.includes('data')) &&
      /coding|hackathon|tech|digital|software|cloud|ai|data|web|cyber|blockchain|game|ar|vr/.test(allText)) {
      deptScore = 10;
    } else if ((deptLower.includes('mechanical') || deptLower.includes('electrical') || deptLower.includes('electronics')) &&
      /robot|hardware|iot|drone|space|embedded|sensor/.test(allText)) {
      deptScore = 10;
    }

    // ── Factor 5: Opportunity & Regional Prestige (0-5 pts) ───────
    const prizeStr = (evt.prizePool || '').replace(/[₹, ]/g, '');
    const prizeNum = parseInt(prizeStr) || 0;
    let opportunityScore = 2;
    if (prizeNum >= 500000) opportunityScore = 5;
    else if (prizeNum >= 200000) opportunityScore = 4;
    else if (prizeNum >= 100000) opportunityScore = 3;
    
    // Regional South India bonus
    if (isSouthFest) opportunityScore = Math.min(5, opportunityScore + 1);

    // ── Final score ───────────────────────────────────────────────
    let score = interestScore + skillScore + yearScore + deptScore + opportunityScore;
    if (lowerInterests.length === 0) score = Math.max(60, score); // show all events when no preference
    score = Math.min(98, Math.max(35, Math.round(score)));

    // ── Rich reason generation ────────────────────────────────────
    const fmtInterests = matchedInterestLabels.slice(0, 2).map(i => i.charAt(0).toUpperCase() + i.slice(1));
    let reason;
    if (isSouthFest && matchedInterestLabels.length >= 1) {
      reason = `🌴 Top South Indian Fest: ${evt.collegeName}'s ${evt.title} directly matches your interest in ${fmtInterests[0] || 'technology'}. Highly recommended for ${department} students across South Indian institutions.`;
    } else if (matchedInterestLabels.length >= 2) {
      reason = `🤖 Highly Recommended: This event directly aligns with your interests in ${fmtInterests.join(' and ')}. As a ${year} ${department} student, this competition offers exceptional hands-on exposure and strong career portfolio value.`;
    } else if (matchedInterestLabels.length === 1) {
      reason = `🤖 Strong Match: ${evt.collegeName}'s ${evt.category} fest matches your interest in ${fmtInterests[0]}. Attending will sharpen relevant skills and connect you with top peers.`;
    } else if (deptScore >= 10) {
      reason = `🤖 Department Fit: This ${evt.category} event at ${evt.collegeName} is well-suited for ${department} students, offering strong domain networking and skill-building opportunities.`;
    } else {
      reason = `🤖 Explore & Discover: This ${evt.category} event at ${evt.collegeName} provides valuable cross-disciplinary exposure. Consider attending to expand your inter-college network.`;
    }

    return {
      eventId: evt._id || evt.id,
      score,
      reason,
      matchedTags: matchedInterestLabels.length > 0
        ? matchedInterestLabels.slice(0, 3).map(i => i.charAt(0).toUpperCase() + i.slice(1))
        : (evt.tags || []).slice(0, 3),
      scoreBreakdown: {
        interest: interestScore,
        skills: skillScore,
        year: yearScore,
        department: deptScore,
        opportunity: opportunityScore,
      },
      event: evt
    };
  });

  let filtered = results
    .filter(r => r.score >= minScoreThreshold)
    .sort((a, b) => {
      const rankA = a.event?.nirfRank ?? 9999;
      const rankB = b.event?.nirfRank ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return b.score - a.score;
    });

  // Fine-tuning fallback: If threshold filtering produces 0 results, return top ranked events regardless of minScore threshold
  if (filtered.length === 0 && results.length > 0) {
    filtered = [...results].sort((a, b) => {
      const rankA = a.event?.nirfRank ?? 9999;
      const rankB = b.event?.nirfRank ?? 9999;
      if (rankA !== rankB) return rankA - rankB;
      return b.score - a.score;
    }).slice(0, 12);
  }

  const endTime = performance.now();
  const executionTimeMs = Math.round(endTime - startTime);

  return filtered.map(r => ({
    ...r,
    executedLocally: true,
    engine: 'Local Client-Side Heuristic Engine v2.0',
    executionTimeMs,
    jobDoneTime: new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })
  }));
};

/**
 * Apply client-side preference filters to backend response
 */
const applyPreferenceFilters = (results, preferences = {}) => {
  let filtered = [...results];
  if (preferences.minScore) filtered = filtered.filter(r => r.score >= Number(preferences.minScore));
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
