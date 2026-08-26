import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Filter, LayoutGrid, List, Sparkles, X, Trophy, FileText, Download } from 'lucide-react';
import EventCard from '../components/EventCard';
import BrochureModal from '../components/BrochureModal';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api, { MOCK_EVENTS } from '../services/api';

const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Symposium', 'Coding', 'AI', 'Robotics', 'Design'];

function sortEvents(list, sortType) {
  if (!Array.isArray(list)) return [];
  const copy = [...list];
  if (sortType === 'nirf') {
    return copy.sort((a, b) => {
      const rA = a.nirfRank ?? 9999;
      const rB = b.nirfRank ?? 9999;
      return rA - rB;
    });
  } else if (sortType === 'prize') {
    return copy.sort((a, b) => {
      const pA = parseInt((a.prizePool || '').replace(/[^\d]/g, '')) || 0;
      const pB = parseInt((b.prizePool || '').replace(/[^\d]/g, '')) || 0;
      return pB - pA;
    });
  } else if (sortType === 'date') {
    return copy.sort((a, b) => new Date(a.eventDate) - new Date(b.eventDate));
  }
  return copy;
}

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [feeFilter, setFeeFilter] = useState('all'); // all, free, paid
  const [sortBy, setSortBy] = useState('nirf'); // nirf, date, prize
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [events, setEvents] = useState(() => {
    // Initial instant load with zero delay
    return sortEvents(MOCK_EVENTS, 'nirf');
  });
  const [loading, setLoading] = useState(false);
  const [bookmarks, setBookmarks] = useState({});
  const [selectedBrochureEvent, setSelectedBrochureEvent] = useState(null);

  // Scroll to top immediately on mount
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.body.scrollTo({ top: 0, left: 0, behavior: 'instant' });
  }, []);

  // Apply filters instantly locally first, then sync with API
  useEffect(() => {
    // 1. Instant local filter for 0ms response time
    let filtered = [...MOCK_EVENTS];

    if (category !== 'All') {
      filtered = filtered.filter(e => e.category === category || e.tags?.includes(category));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(e => 
        e.title?.toLowerCase().includes(q) ||
        e.description?.toLowerCase().includes(q) ||
        e.collegeName?.toLowerCase().includes(q) ||
        e.tags?.some(t => t.toLowerCase().includes(q))
      );
    }

    if (feeFilter === 'free') {
      filtered = filtered.filter(e => e.entryFee === 0);
    } else if (feeFilter === 'paid') {
      filtered = filtered.filter(e => e.entryFee > 0);
    }

    filtered = sortEvents(filtered, sortBy);
    setEvents(filtered);

    // 2. Background API sync (non-blocking)
    let url = `/events?category=${category !== 'All' ? category : ''}&search=${searchQuery}&fee=${feeFilter}`;
    api.get(url)
      .then((res) => {
        if (res.data && res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          let list = sortEvents(res.data.data, sortBy);
          setEvents(list);
        }
      })
      .catch(() => {
        // Silently keep the instant filtered mock data
      });
  }, [category, searchQuery, feeFilter, sortBy]);



  const handleBookmark = (id) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setCategory('All');
    setSearchQuery('');
    setFeeFilter('all');
    setSortBy('nirf');
    setSearchParams({});
  };

  return (
    <div className="space-y-10 max-w-6xl mx-auto py-4 sm:py-8">
      
      {/* ─── Hero / Filter Section (Centered, Matching Home Page) ─── */}
      <div className="relative text-center max-w-3xl mx-auto pt-6 sm:pt-14 pb-2">

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.14]"
        >
          Inter-College Competitions
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Browse nationwide hackathons, robotics challenges, and coding contests.
        </motion.p>

        {/* Floating Pill Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="pt-6 max-w-xl mx-auto"
        >
          <div className="relative flex items-center bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-700 focus-within:border-slate-900 dark:focus-within:border-slate-100 focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-white/10 transition-all p-1.5 pl-4">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search hackathons, symposiums, colleges..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-2"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
                title="Clear search"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </motion.div>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.32, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-1.5 pt-4"
        >
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setSearchParams({ category: cat }); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                category === cat
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm scale-105'
                  : 'bg-white/80 dark:bg-[#141519]/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </motion.div>
      </div>

      {/* Events Grid / List View */}
      {loading ? (
        <LoadingSkeleton count={6} />
      ) : events.length === 0 ? (
        <div className="kaggle-card p-12 text-center space-y-4">
          <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-400">
            <Trophy className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 dark:text-white">No Competitions Found</h3>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            No events match your current filter selections. Try searching with a broader query or clear filters.
          </p>
          <button onClick={clearFilters} className="kaggle-btn-primary mx-auto text-xs px-4 py-2">
            Reset Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {events.map((evt) => (
            <EventCard
              key={evt._id || evt.id}
              event={evt}
              isBookmarked={!!bookmarks[evt._id || evt.id]}
              onBookmark={handleBookmark}
            />
          ))}
        </div>
      ) : (
        /* Kaggle List View Table */
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((evt) => {
              const evtId = evt._id || evt.id;
              return (
                <Link
                  key={evtId}
                  to={`/events/${evtId}`}
                  className="p-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 flex items-center justify-between gap-4 transition-colors cursor-pointer block sm:flex"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm shrink-0">
                      {evt.collegeName ? evt.collegeName.substring(0, 2).toUpperCase() : 'CC'}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-bold text-slate-900 dark:text-white truncate">
                          {evt.title}
                        </h4>
                        {evt.nirfRank && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                            NIRF #{evt.nirfRank}
                          </span>
                        )}
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300">
                          {evt.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{evt.collegeName}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0 text-xs mt-2 sm:mt-0 justify-between sm:justify-end">
                    <div className="font-bold text-slate-700 dark:text-slate-300">{evt.prizePool}</div>
                    <span className="px-2 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-400 text-[10px] font-bold">
                      {evt.entryFee === 0 ? 'Free Entry' : `₹${evt.entryFee}`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {selectedBrochureEvent && (
        <BrochureModal
          event={selectedBrochureEvent}
          onClose={() => setSelectedBrochureEvent(null)}
        />
      )}

    </div>
  );
}
