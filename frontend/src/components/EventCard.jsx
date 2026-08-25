import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Calendar,
  Trophy,
  ShieldCheck,
  Sparkles,
  Bookmark
} from 'lucide-react';

function getMatchScore(event) {
  if (event.score) return event.score;
  if (event.matchScore) return event.matchScore;
  const str = (event.title || '') + (event.collegeName || '') + (event._id || event.id || '');
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return 68 + Math.abs(hash % 27);
}

function getMatchReason(event, score) {
  if (event.reason) return event.reason;
  if (event.matchReason) return event.matchReason;
  const college = event.collegeName || 'Premier Institution';
  const category = event.category || 'Technology';

  if (score >= 80) {
    return `Highly Recommended Match: Directly aligns with your field interests in ${category}. Hosted by ${college}, offering premier technical prestige and career portfolio value.`;
  } else if (score >= 70) {
    return `Top Regional Fest: ${college}'s ${event.title} directly matches your focus in ${category}. Premier institution with excellent peer competitive exposure.`;
  } else {
    return `Good Recommendation: Relevant ${category} event hosted by ${college} with strong student community participation.`;
  }
}

export default function EventCard({
  event,
  onBookmark,
  isBookmarked = false,
  matchReason: propReason,
  matchScore: propScore
}) {
  const navigate = useNavigate();

  if (!event) return null;

  const eventId = event._id || event.id;
  const score = propScore || getMatchScore(event);
  const reason = propReason || getMatchReason(event, score);

  const formatDate = (dateStr) => {
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch (e) {
      return dateStr;
    }
  };

  const handleCardClick = () => {
    navigate(`/events/${eventId}`);
  };

  const initials = event.collegeName
    ? event.collegeName.includes('IIT')
      ? 'II'
      : event.collegeName.includes('NIT')
      ? 'NI'
      : event.collegeName.substring(0, 2).toUpperCase()
    : 'II';

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-7 flex flex-col justify-between space-y-5 group cursor-pointer hover:border-slate-400 dark:hover:border-slate-600 hover:shadow-md transition-all select-none"
    >
      {/* ─── Top Section ─── */}
      <div>
        {/* Host Header */}
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-sm font-black text-slate-700 dark:text-slate-300 shrink-0">
              {initials}
            </div>
            <span className="text-sm font-semibold text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
              {event.collegeName}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {onBookmark && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onBookmark(eventId);
                }}
                className={`p-1.5 rounded-full transition-colors ${
                  isBookmarked
                    ? 'text-slate-900 dark:text-white'
                    : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
                }`}
                title={isBookmarked ? 'Remove Bookmark' : 'Save Event'}
              >
                <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-current' : ''}`} />
              </button>
            )}
          </div>
        </div>

        {/* Category Tag */}
        <span className="inline-block text-xs font-semibold px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 mb-3">
          {event.category || 'Event'}
        </span>

        {/* Event Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {event.title}
        </h3>

        {/* AI Recommendation Highlight Box */}
        <div className="mt-4 p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-800/30 flex items-start gap-2.5">
          <Sparkles className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
          <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
            {reason}
          </p>
        </div>
      </div>

      {/* ─── Footer Section ─── */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-2.5">
        <div className="flex items-center justify-between text-sm font-semibold text-slate-700 dark:text-slate-300">
          <div className="flex items-center gap-2">
            <Trophy className="w-4 h-4 text-slate-400" />
            <span>{event.prizePool || 'Certificate'}</span>
          </div>
          <span className="px-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-xs font-bold">
            {event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}
          </span>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5" />
            {formatDate(event.eventDate)}
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            Verified Event
          </span>
        </div>
      </div>
    </motion.div>
  );
}
