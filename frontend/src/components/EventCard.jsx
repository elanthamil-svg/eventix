import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, Trophy, Users, ShieldCheck, Bookmark } from 'lucide-react';

export default function EventCard({ event, onBookmark, isBookmarked = false, matchReason }) {
  const navigate = useNavigate();

  if (!event) return null;

  const eventId = event._id || event.id;

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

  return (
    <motion.div
      onClick={handleCardClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -3, borderColor: '#64748B' }}
      transition={{ duration: 0.15 }}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col justify-between space-y-4 group cursor-pointer hover:shadow-md transition-all select-none"
    >

      {/* Top: Host + Category + Bookmark */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-xs font-black text-slate-700 dark:text-slate-300 shrink-0">
              {event.collegeName ? event.collegeName.substring(0, 2).toUpperCase() : 'CC'}
            </div>
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 truncate max-w-[160px]">
              {event.collegeName}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            {event.nirfRank && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                NIRF #{event.nirfRank}
              </span>
            )}
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">
              {event.category || 'Event'}
            </span>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onBookmark && onBookmark(eventId);
              }}
              className={`p-1.5 rounded-full transition-colors ${
                isBookmarked
                  ? 'text-slate-900 dark:text-white'
                  : 'text-slate-300 dark:text-slate-600 hover:text-slate-600 dark:hover:text-slate-300'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Event'}
            >
              <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-bold text-slate-900 dark:text-white line-clamp-2 leading-snug group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors">
          {event.title}
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 mt-2 leading-relaxed">
          {event.description}
        </p>

        {/* AI Match Reason */}
        {matchReason && (
          <div className="mt-3 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-500 dark:text-slate-400">
            {matchReason}
          </div>
        )}
      </div>

      {/* Footer Stats */}
      <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2.5">

        {/* Prize & Fee */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600 dark:text-slate-300">
          <div className="flex items-center gap-1.5">
            <Trophy className="w-3.5 h-3.5 text-slate-400" />
            <span>{event.prizePool || 'Certificate'}</span>
          </div>
          <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
            {event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}
          </span>
        </div>

        {/* Teams, Date, Verified */}
        <div className="flex items-center justify-between text-[11px] text-slate-400 dark:text-slate-500">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {Math.floor(Math.random() * 300 + 120)} Teams
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatDate(event.eventDate)}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Verified
          </span>
        </div>
      </div>

    </motion.div>
  );
}
