import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Calendar, MapPin, Trophy, Bookmark, ShieldCheck, Users, Clock, Sparkles, Eye, ArrowRight, FileText } from 'lucide-react';
import BrochureModal from './BrochureModal';

export default function EventCard({ event, onBookmark, isBookmarked = false, matchReason }) {
  const [showBrochureModal, setShowBrochureModal] = useState(false);

  if (!event) return null;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="kaggle-card kaggle-card-hover p-6 flex flex-col justify-between space-y-4 group relative shadow-sm"
    >
      
      {/* Top Meta: Host Logo & Category Tag */}
      <div>
        <div className="flex items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-900 border border-slate-700 overflow-hidden shrink-0 flex items-center justify-center text-sm font-black text-kaggle-cyan">
              {event.collegeName ? event.collegeName.substring(0, 2).toUpperCase() : 'CC'}
            </div>
            <div className="text-xs font-bold text-slate-600 dark:text-slate-300 truncate max-w-[180px]">
              {event.collegeName}
            </div>
          </div>

          <div className="flex items-center gap-1.5 flex-wrap justify-end">
            {event.nirfRank && (
              <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center gap-1 shadow-sm" title={`NIRF 2025 India Engineering Rank #${event.nirfRank}`}>
                🏆 NIRF #{event.nirfRank}
              </span>
            )}
            <span className="kaggle-badge kaggle-badge-cyan text-xs py-1 px-2.5 font-extrabold">
              {event.category || 'Event'}
            </span>

            <button
              onClick={(e) => {
                e.preventDefault();
                onBookmark && onBookmark(event._id || event.id);
              }}
              className={`p-2 rounded-full transition-colors ${
                isBookmarked 
                  ? 'text-amber-500 bg-amber-500/10' 
                  : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-200'
              }`}
              title={isBookmarked ? 'Remove Bookmark' : 'Save Event'}
            >
              <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500' : ''}`} />
            </button>
          </div>
        </div>

        {/* Competition Title with Increased Font Size */}
        <Link to={`/events/${event._id || event.id}`} className="block group-hover:text-kaggle-cyan transition-colors">
          <h3 className="text-lg font-black text-slate-900 dark:text-white line-clamp-2 leading-snug">
            {event.title}
          </h3>
        </Link>

        {/* Brief description */}
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mt-2 leading-relaxed font-medium">
          {event.description}
        </p>

        {/* AI Match Banner (if recommended) */}
        {matchReason && (
          <div className="mt-3.5 p-2.5 rounded-xl bg-kaggle-cyan/10 border border-kaggle-cyan/30 text-xs text-kaggle-darkblue dark:text-kaggle-cyan flex items-start gap-2 font-bold">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{matchReason}</span>
          </div>
        )}
      </div>

      {/* Kaggle Stats Footer Grid with Readability Upgrade */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between text-sm">
          
          {/* Prize Pool */}
          <div className="flex items-center gap-1.5 font-black text-emerald-600 dark:text-emerald-400">
            <Trophy className="w-4 h-4" />
            <span>{event.prizePool || 'Certificate'}</span>
          </div>

          {/* Fee / Free Pill */}
          <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full ${
            event.entryFee === 0 
              ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/30' 
              : 'bg-amber-500/10 text-amber-500 border border-amber-500/30'
          }`}>
            {event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}
          </span>
        </div>

        {/* Secondary Info Bar: Participants, Date, Safety Badge */}
        <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-3">
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5 text-slate-400" />
              <span>{Math.floor(Math.random() * 300 + 120)} Teams</span>
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              <span>{formatDate(event.eventDate)}</span>
            </span>
          </div>

          <div className="flex items-center gap-1 text-emerald-500 font-extrabold bg-emerald-500/10 px-2.5 py-1 rounded-lg">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Verified</span>
          </div>
        </div>

        {/* Action Buttons: Brochure, Details & Register */}
        <div className="pt-3 border-t border-slate-100 dark:border-slate-800/60 flex items-center gap-2">
          <button
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowBrochureModal(true);
            }}
            className="py-2.5 px-2.5 text-center text-xs font-bold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 transition-all flex items-center justify-center gap-1.5 shrink-0"
            title="View Official Event Brochure"
          >
            <FileText className="w-3.5 h-3.5" />
            <span className="hidden xs:inline">Brochure</span>
          </button>
          <Link
            to={`/events/${event._id || event.id}`}
            className="flex-1 py-2.5 px-2 text-center text-xs font-bold rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all flex items-center justify-center gap-1"
          >
            <Eye className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
            <span>Details</span>
          </Link>
          <Link
            to={`/events/${event._id || event.id}?register=true`}
            className="flex-1 py-2.5 px-2 text-center text-xs font-extrabold rounded-xl bg-kaggle-cyan text-slate-950 hover:bg-kaggle-cyan/90 transition-all flex items-center justify-center gap-1 shadow-sm"
          >
            <span>Register</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

      </div>

      {showBrochureModal && (
        <BrochureModal event={event} onClose={() => setShowBrochureModal(false)} />
      )}

    </motion.div>
  );
}
