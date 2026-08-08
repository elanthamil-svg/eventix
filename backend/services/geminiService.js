/**
 * Gemini Service — calls Gemini REST API directly
 * Supports API keys obtained from Google AI Studio (AIza...) and other formats
 */

const https = require('https');

/**
 * Core Gemini text generation call via REST
 */
const callGemini = (prompt) => {
  return new Promise((resolve, reject) => {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) return reject(new Error('GEMINI_API_KEY not configured in .env'));

    const modelsToTry = ['gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'];

    const tryModel = (index) => {
      if (index >= modelsToTry.length) {
        return reject(new Error('All Gemini API models unavailable or quota exceeded'));
      }
      const model = modelsToTry[index];
      const body = JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { maxOutputTokens: 1024, temperature: 0.7 }
      });

      const options = {
        hostname: 'generativelanguage.googleapis.com',
        port: 443,
        path: `/v1beta/models/${model}:generateContent?key=${apiKey}`,
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Content-Length': Buffer.byteLength(body)
        }
      };

      const req = https.request(options, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => {
          try {
            const parsed = JSON.parse(data);
            if (parsed.candidates && parsed.candidates[0]?.content?.parts[0]?.text) {
              resolve(parsed.candidates[0].content.parts[0].text);
            } else if (parsed.error) {
              const msg = parsed.error.message || JSON.stringify(parsed.error);
              console.warn(`Gemini model ${model} error: ${msg}`);
              if (parsed.error.code === 401 || msg.includes('API_KEY_SERVICE_BLOCKED') || msg.includes('ACCESS_TOKEN_TYPE_UNSUPPORTED') || msg.includes('authentication')) {
                return reject(new Error('INVALID_API_KEY'));
              }
              tryModel(index + 1);
            } else {
              tryModel(index + 1);
            }
          } catch (e) {
            tryModel(index + 1);
          }
        });
      });
      req.on('error', (e) => {
        console.warn(`Gemini model ${model} network error: ${e.message}`);
        tryModel(index + 1);
      });
      req.write(body);
      req.end();
    };

    tryModel(0);
  });
};

/**
 * AI Event Recommendations using Gemini
 * @param {Object} userProfile - { department, year, interests[], skills[] }
 * @param {Array}  availableEvents - list of event objects
 * @returns {Array} [{ eventId, score, reason }]
 */
const recommendEvents = async (userProfile, availableEvents) => {
  const interestList = (userProfile.interests || []).join(', ') || 'Engineering & Technology';
  const skillList = (userProfile.skills || []).join(', ') || 'General';
  const dept = userProfile.department || 'Computer Science & Engineering';
  const year = userProfile.year || '3rd Year';

  const eventsJson = JSON.stringify(
    availableEvents.map(e => ({
      id: (e._id || e.id)?.toString(),
      title: e.title,
      category: e.category,
      tags: (e.tags || []).join(', '),
      college: e.collegeName,
      entryFee: e.entryFee || 0,
      prizePool: e.prizePool || 'N/A',
      description: (e.description || '').substring(0, 200)
    })), null, 2
  );

  const prompt = `You are Eventix AI — an expert inter-college fest and competition recommendation engine for Indian undergraduate students. Your recommendations must be HIGHLY ACCURATE, TRANSPARENT, and PERSONALIZED based on deep analysis of the student profile.

=== STUDENT PROFILE ===
Department: ${dept}
Year of Study: ${year}
Interests: ${interestList}
Technical Skills: ${skillList}

=== SCORING RUBRIC (compute each component accurately) ===
1. Interest Match (0-40 pts): Direct/semantic alignment with student's interests.
2. Skill Applicability (0-25 pts): Requires or rewards student's specific technical skills.
3. Year Suitability (0-15 pts): Event difficulty/nature matches student's year level.
4. Department Alignment (0-15 pts): Academic fit for the student's department.
5. Growth Opportunity (0-5 pts): Prize pool, host college prestige, or networking value.

Total score = interest + skills + year + department + opportunity. Minimum 35, maximum 98.

=== EVENTS TO RANK ===
${eventsJson}

=== TASK ===
For EVERY event in the list above, compute an accurate score using the rubric above. Write a 2-sentence personalized reason explaining WHY this specific student should or should not prioritize this event. Higher scores go to events that align closely with the student's interests, skills, and department. Events with NO relevance should score 35-50.

=== OUTPUT FORMAT ===
Respond with ONLY a raw JSON array. No markdown, no code fences, no text outside the array:
[
  {
    "eventId": "<exact id from the events list>",
    "score": <integer 35-98>,
    "reason": "Recommended because this event directly matches your interest in <specific interest>. As a <year> student in <dept>, <specific benefit of attending this event>.",
    "scoreBreakdown": {
      "interest": <0-40>,
      "skills": <0-25>,
      "year": <0-15>,
      "department": <0-15>,
      "opportunity": <0-5>
    }
  }
]

Order results from highest score to lowest. Include ALL events.`;

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
    const college = (event.collegeName || '').toLowerCase();
    const allText = `${cat} ${tags.join(' ')} ${title} ${college}`;

    const isSouthFest = /kerala|tamil nadu|karnataka|telangana|andhra|chennai|coimbatore|kozhikode|bengaluru|hyderabad|trivandrum|mangaluru|surathkal|vellore|thanjavur|nitc|psg|ssn|ceg|iiit|bits|nitk|rvce|sastra|cet|amrita|iitm/i.test(allText);

    const matchedInterests = interests.filter(i =>
      cat.includes(i) || tags.some(t => t.includes(i)) || title.includes(i)
    );
    score += matchedInterests.length * 12;
    score += skills.filter(s => tags.some(t => t.includes(s))).length * 6;

    if (isSouthFest) score += 5; // South Indian regional fest affinity bonus

    const matchedFormatted = matchedInterests.slice(0, 2).map(m => m.charAt(0).toUpperCase() + m.slice(1));
    const interestStr = matchedFormatted.length > 0
      ? matchedFormatted.join(' and ')
      : (interests.length > 0 ? interests[0] : 'Technology and Engineering');

    const reason = isSouthFest
      ? `🌴 Recommended South Indian Fest: ${event.collegeName}'s ${event.title} matches your profile in ${interestStr}. Highly suitable for ${userProfile.department || 'Engineering'} students.`
      : `Recommended because this event matches your interests in ${interestStr}. It offers hands-on exposure for ${userProfile.department || 'Computer Science'} students.`;

    return {
      eventId: (event._id || event.id)?.toString(),
      score: Math.min(98, score),
      reason
    };
  }).sort((a, b) => b.score - a.score);
};

const heuristicSafety = ({ distanceKm, eventEndTime, weather, transportAvailable, companion = 'group', selectedTransport = 'auto' }) => {
  let score = 95;
  const reasons = [];

  if (distanceKm > 100) { score -= 18; reasons.push('Long distance transit (>100 km)'); }
  else if (distanceKm > 50) { score -= 8; reasons.push('Moderate distance transit (50–100 km)'); }
  else { reasons.push('Short transit distance (<50 km)'); }

  if (eventEndTime?.includes('PM') && parseInt(eventEndTime) >= 8) {
    score -= 12; reasons.push('Late night return journey');
  } else { reasons.push('Daytime or early evening return expected'); }

  if (companion === 'solo') {
    score -= 10; reasons.push('Solo student travel mode');
  } else {
    reasons.push('Group companion travel mode (2+ peers)');
  }

  if (weather?.toLowerCase().includes('rain') || weather?.toLowerCase().includes('storm')) {
    score -= 12; reasons.push('Adverse weather conditions');
  } else { reasons.push('Good weather conditions'); }

  if (transportAvailable) { reasons.push(`Transport mode: ${selectedTransport !== 'auto' ? selectedTransport.toUpperCase() : 'Express Transit'}`); }
  else { score -= 12; reasons.push('Limited night transport'); }

  const status = score < 60 ? 'High Risk' : score < 80 ? 'Moderate' : 'Safe';
  return {
    score: Math.max(40, Math.min(98, score)),
    status,
    reasons,
    advice: companion === 'solo'
      ? 'Share live GPS location with campus emergency contacts and stay in well-lit public transit areas.'
      : 'Daytime travel, group travel, good weather, and public transport make this journey safe.'
  };
};

/**
 * Smart local fallback chatbot — answers event questions from structured data
 * without requiring the Gemini API.
 */
const localChatbot = (eventDetails, message) => {
  const msg = message.toLowerCase();
  const date = eventDetails.eventDate
    ? new Date(eventDetails.eventDate).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
    : 'TBA';
  const fee = eventDetails.entryFee != null
    ? (eventDetails.entryFee === 0 ? 'Free entry (no registration fee)' : `₹${eventDetails.entryFee}`)
    : 'Not specified';
  const prize = eventDetails.prizePool || 'Not announced yet';
  const tags = (eventDetails.tags || []).join(', ') || 'None listed';
  const desc = eventDetails.description || 'No description available.';
  const venue = eventDetails.venue || 'Venue TBA';
  const college = eventDetails.collegeName || 'Host college TBA';
  const category = eventDetails.category || 'General';
  const title = eventDetails.title || 'This event';

  // Keyword-based routing
  if (/explain|about|what is|overview|tell me|describe|summary/.test(msg)) {
    return `**${title}** is a **${category}** event hosted by **${college}**.\n\n📍 *Venue:* ${venue}\n📅 *Date:* ${date}\n💰 *Entry:* ${fee}\n🏆 *Prize Pool:* ${prize}\n\n${desc}\n\n🏷️ *Tags:* ${tags}`;
  }
  if (/date|when|schedule|time/.test(msg)) {
    return `📅 **${title}** is scheduled for **${date}** at ${venue}, hosted by ${college}.`;
  }
  if (/venue|where|location|place/.test(msg)) {
    return `📍 The event is held at **${venue}**, organised by **${college}**.`;
  }
  if (/fee|cost|price|register|entry|paid|free/.test(msg)) {
    return `💰 **Entry Fee:** ${fee}\n\nYou can register directly through the Eventix platform by clicking the **Register** button on the event page.`;
  }
  if (/prize|cash|award|winner|reward/.test(msg)) {
    return `🏆 **Prize Pool:** ${prize}\n\nWinners will be announced by the organising committee of **${college}** on the day of the event.`;
  }
  if (/category|type|kind|domain|field/.test(msg)) {
    return `This is a **${category}** event. Related areas include: ${tags}.`;
  }
  if (/tag|topic|skill|requirement|tech/.test(msg)) {
    return `🏷️ **Tags & Topics:** ${tags}\n\nMake sure you have a foundational understanding of the relevant areas before participating.`;
  }
  if (/college|host|organis|organiz|who/.test(msg)) {
    return `🏫 **${title}** is organised by **${college}**. For specific queries, reach out to the event organisers through the contact details on the event page.`;
  }
  if (/contact|email|phone|reach|support/.test(msg)) {
    return `📞 For direct queries, please contact the organising team at **${college}**. You can also message them via the event page on Eventix.`;
  }
  if (/team|solo|group|individual|participant/.test(msg)) {
    return `👥 Team/participation format details are managed by the organisers at **${college}**. Please check the event description or contact the team directly for specifics.`;
  }
  if (/hi|hello|hey|hii|howdy/.test(msg)) {
    return `Hi there! 👋 I'm the Eventix AI assistant for **${title}**. Ask me anything about this event — dates, fees, prizes, venue, and more!`;
  }
  // Default
  return `Great question! Here's a quick summary of **${title}**:\n\n📅 **Date:** ${date}\n📍 **Venue:** ${venue}\n🏫 **Host:** ${college}\n💰 **Fee:** ${fee}\n🏆 **Prize:** ${prize}\n\n${desc}\n\nFeel free to ask me anything more specific!`;
};

const eventChatbot = async (eventDetails, message, history = []) => {
  const historyText = history.map(h => `${h.role === 'user' ? 'Student' : 'AI'}: ${h.text}`).join('\n');
  
  const prompt = `You are Eventix AI Chatbot — an expert virtual assistant for inter-college events.
You are currently answering questions specifically about this event:

Event Title: ${eventDetails.title}
Category: ${eventDetails.category}
College/Host: ${eventDetails.collegeName}
Venue: ${eventDetails.venue}
Date/Time: ${new Date(eventDetails.eventDate).toLocaleDateString()}
Prize Pool: ${eventDetails.prizePool}
Description: ${eventDetails.description}
Tags: ${(eventDetails.tags || []).join(', ')}

Chat History:
${historyText}

Student: ${message}
AI:`;

  try {
    const text = await callGemini(prompt);
    return text.trim();
  } catch (err) {
    console.warn(`⚠️ Event Chatbot error: ${err.message}`);
    // Silently fall back to local chatbot — no error shown to user
    return localChatbot(eventDetails, message);
  }
};

module.exports = { recommendEvents, calculateTravelSafetyScore, rankAccommodations, eventChatbot };

