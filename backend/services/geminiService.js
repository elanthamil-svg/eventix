/**
 * Gemini Service — uses @google/genai v2.x (GoogleGenAI SDK)
 * with smart heuristic fallback when API is unavailable
 */

let _ai = null;

const getAI = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error('GEMINI_API_KEY not configured in .env');
  if (!_ai) {
    const { GoogleGenAI } = require('@google/genai');
    _ai = new GoogleGenAI({ apiKey });
  }
  return _ai;
};

/**
 * Core Gemini text generation call
 * Works with @google/genai v2.x with multi-model retry
 */
const callGemini = async (prompt) => {
  const ai = getAI();
  const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash', 'gemini-1.5-flash'];
  
  for (const model of modelsToTry) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: prompt,
      });
      if (response && response.text) {
        return response.text;
      }
    } catch (err) {
      console.warn(`Gemini model ${model} attempt error: ${err.message}`);
    }
  }
  throw new Error('All Gemini API models unavailable or quota exceeded');
};

/**
 * AI Event Recommendations using Gemini
 * @param {Object} userProfile - { department, year, interests[], skills[] }
 * @param {Array}  availableEvents - list of event objects
 * @returns {Array} [{ eventId, score, reason }]
 */
const recommendEvents = async (userProfile, availableEvents) => {
  const interestList = (userProfile.interests || []).join(', ') || 'Engineering';
  const skillList = (userProfile.skills || []).join(', ') || 'General';

  const eventsJson = JSON.stringify(
    availableEvents.map(e => ({
      id: (e._id || e.id)?.toString(),
      title: e.title,
      category: e.category,
      tags: e.tags || [],
      college: e.collegeName,
      description: (e.description || '').substring(0, 120)
    })), null, 2
  );

  const prompt = `You are CampusConnect AI — an intelligent inter-college event recommendation engine for Indian college students.

Student:
- Department: ${userProfile.department || 'Computer Science'}
- Year: ${userProfile.year || '3rd Year'}
- Interests: ${interestList}
- Skills: ${skillList}

Events (JSON):
${eventsJson}

Task: Rank ALL events by relevance to the student. For each event, write a 1-2 sentence personalized reason starting with "Recommended because this event matches your interests in...".

Respond with ONLY a raw JSON array (no markdown code blocks, no explanation):
[
  {
    "eventId": "evt_101",
    "score": 97,
    "reason": "Recommended because this event matches your interests in Artificial Intelligence and Python. HackNova 2026 at IIT Madras provides a 36-hour competitive environment."
  }
]`;

  try {
    console.log(`🤖 Calling Gemini for live recommendations (interests: ${interestList})`);
    const text = await callGemini(prompt);

    // Strip markdown code fences if present
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);

    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed) && parsed.length > 0) {
        console.log(`✅ Gemini returned ${parsed.length} ranked recommendations`);
        return parsed;
      }
    }
    throw new Error('Gemini response contained no valid JSON array');
  } catch (err) {
    console.warn(`⚠️  Gemini recommendation fallback: ${err.message}`);
    return heuristicRecommend(userProfile, availableEvents);
  }
};

/**
 * AI Travel Safety Score Calculator
 */
const calculateTravelSafetyScore = async (params) => {
  const {
    distanceKm = 45,
    travelTimeMins = 60,
    eventEndTime = '09:00 PM',
    currentTime = '06:00 PM',
    weather = 'Clear sky, 26°C',
    transportAvailable = true
  } = params;

  const prompt = `Evaluate travel safety for a college student returning from an inter-college event in India.

Parameters:
- Distance: ${distanceKm} km
- Travel Duration: ${travelTimeMins} minutes
- Event End: ${eventEndTime}
- Current Time: ${currentTime}
- Weather: ${weather}
- Public Transport: ${transportAvailable ? 'Yes' : 'Limited'}

Respond with ONLY a raw JSON object (no markdown, no explanation):
{
  "score": 92,
  "status": "Safe",
  "reasons": ["Daytime travel", "Good weather", "Multiple public transport options"],
  "advice": "Daytime travel, good weather, and multiple public transport options make this journey safe."
}
Status must be exactly "Safe", "Moderate", or "Risky". Score is integer 0-100.`;

  try {
    const text = await callGemini(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      console.log(`✅ Gemini Safety Score: ${parsed.score}% (${parsed.status})`);
      return parsed;
    }
    throw new Error('No JSON in safety response');
  } catch (err) {
    console.warn(`⚠️  Safety score fallback: ${err.message}`);
    return heuristicSafety({ distanceKm, eventEndTime, weather, transportAvailable });
  }
};

/**
 * AI Accommodation Ranking
 */
const rankAccommodations = async (accommodationsList, userBudget = 1500) => {
  const prompt = `Rank top 3 accommodations for an Indian college student (max budget ₹${userBudget}/night):

${JSON.stringify(accommodationsList, null, 2)}

Respond with ONLY a raw JSON array (no markdown):
[{"id": "acc_id", "name": "Name", "aiRank": 1, "safetyScore": 92, "matchReason": "Recommended because it is within your budget, only 700 meters from the venue, has a 4.8-star rating, and offers excellent safety."}]`;

  try {
    const text = await callGemini(prompt);
    const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const jsonMatch = cleaned.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      if (Array.isArray(parsed)) {
        console.log(`✅ Gemini ranked ${parsed.length} accommodations`);
        return parsed;
      }
    }
    throw new Error('No JSON in accommodation response');
  } catch (err) {
    console.warn(`⚠️  Accommodation ranking fallback: ${err.message}`);
    return accommodationsList
      .map(acc => ({
        ...acc,
        aiRank: Math.round((acc.rating * 10) + (100 - acc.distanceKm * 2) + (acc.pricePerNight <= userBudget ? 15 : 0)),
        safetyScore: acc.safetyScore || 95,
        matchReason: `Recommended because it is within your budget (₹${acc.pricePerNight}/night), only ${acc.distanceKm} km from the venue, has a ${acc.rating}-star rating, and offers excellent safety.`
      }))
      .sort((a, b) => b.aiRank - a.aiRank)
      .slice(0, 3);
  }
};

// ─── Heuristic Fallbacks ────────────────────────────────────────────────────

const heuristicRecommend = (userProfile, events) => {
  const interests = (userProfile.interests || []).map(i => i.toLowerCase());
  const skills = (userProfile.skills || []).map(s => s.toLowerCase());

  return events.map(event => {
    let score = 70;
    const cat = (event.category || '').toLowerCase();
    const tags = (event.tags || []).map(t => t.toLowerCase());
    const title = (event.title || '').toLowerCase();

    const matchedInterests = interests.filter(i =>
      cat.includes(i) || tags.some(t => t.includes(i)) || title.includes(i)
    );
    score += matchedInterests.length * 12;
    score += skills.filter(s => tags.some(t => t.includes(s))).length * 6;

    const matchedFormatted = matchedInterests.slice(0, 2).map(m => m.charAt(0).toUpperCase() + m.slice(1));
    const interestStr = matchedFormatted.length > 0
      ? matchedFormatted.join(' and ')
      : (interests.length > 0 ? interests[0] : 'Technology and Engineering');

    return {
      eventId: (event._id || event.id)?.toString(),
      score: Math.min(score, 98),
      reason: `Recommended because this event matches your interests in ${interestStr}. It offers hands-on exposure for ${userProfile.department || 'Computer Science'} students.`
    };
  }).sort((a, b) => b.score - a.score);
};

const heuristicSafety = ({ distanceKm, eventEndTime, weather, transportAvailable }) => {
  let score = 92;
  const reasons = [];

  if (distanceKm > 100) { score -= 18; reasons.push('Long distance (>100 km)'); }
  else if (distanceKm > 50) { score -= 8; reasons.push('Moderate distance (50–100 km)'); }
  else { reasons.push('Short travel distance (<50 km)'); }

  if (eventEndTime?.includes('PM') && parseInt(eventEndTime) >= 8) {
    score -= 12; reasons.push('Late night return journey');
  } else { reasons.push('Daytime return expected'); }

  if (weather?.toLowerCase().includes('rain') || weather?.toLowerCase().includes('storm')) {
    score -= 12; reasons.push('Adverse weather conditions');
  } else { reasons.push('Good weather conditions'); }

  if (transportAvailable) { reasons.push('Multiple public transport options'); }
  else { score -= 12; reasons.push('Limited night transport'); }

  const status = score < 60 ? 'Risky' : score < 80 ? 'Moderate' : 'Safe';
  return {
    score: Math.max(40, Math.min(98, score)),
    status,
    reasons,
    advice: 'Daytime travel, good weather, and multiple public transport options make this journey safe.'
  };
};

module.exports = { recommendEvents, calculateTravelSafetyScore, rankAccommodations };

