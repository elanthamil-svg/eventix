import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Search, ArrowRight, Sparkles, Trophy, Calendar, MapPin, Compass
} from 'lucide-react';
import EventCard from '../components/EventCard';
import api, { MOCK_EVENTS } from '../services/api';
import { useAuth } from '../context/AuthContext';

const DOMAINS = ['All', 'Hackathon', 'AI', 'Robotics', 'Coding', 'Design', 'Workshop'];

export default function HomePage() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDomain, setSelectedDomain] = useState('All');
  const [events, setEvents] = useState(MOCK_EVENTS);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    api.get('/events?featured=true')
      .then(res => {
        if (res.data.success && Array.isArray(res.data.data) && res.data.data.length > 0) {
          setEvents(res.data.data);
        }
      })
      .catch(() => setEvents(MOCK_EVENTS));
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(searchQuery.trim() ? `/events?search=${encodeURIComponent(searchQuery)}` : '/events');
  };

  const handleBookmark = (id) => setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));

  const filteredEvents = selectedDomain === 'All'
    ? events
    : events.filter(e => e.category === selectedDomain || e.tags?.includes(selectedDomain));

  return (
    <div className="space-y-12 max-w-6xl mx-auto py-4 sm:py-8">

      {/* ─── Hero Section (Bold, Elegant Black & Animated) ─── */}
      <div className="relative text-center max-w-3xl mx-auto pt-6 sm:pt-14 pb-2">

        {/* Main Headline */}
        <motion.h1
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.14]"
        >
          Discover college fests,{<br className="hidden sm:inline" />}{' '}
          <span>competitions & hackathons</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
          className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
        >
          Browse verified events across India, explore tech domains, and get personalized recommendations.
        </motion.p>

        {/* Floating Pill Search Bar */}
        <motion.form
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.22, ease: [0.16, 1, 0.3, 1] }}
          onSubmit={handleSearch}
          className="pt-6 max-w-xl mx-auto"
        >
          <div className="relative flex items-center bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:shadow-md hover:border-slate-400 dark:hover:border-slate-700 focus-within:border-slate-900 dark:focus-within:border-slate-100 focus-within:ring-2 focus-within:ring-slate-900/10 dark:focus-within:ring-white/10 transition-all p-1.5 pl-4">
            <Search className="w-4 h-4 text-slate-400 shrink-0 mr-2" />
            <input
              type="text"
              placeholder="Search hackathons, symposiums, colleges..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none py-2"
            />
            <button
              type="submit"
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-black dark:hover:bg-slate-100 p-2.5 rounded-full transition-all hover:scale-105 active:scale-95 shrink-0 shadow-sm"
              title="Search"
            >
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </motion.form>

        {/* Category Pills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-wrap items-center justify-center gap-1.5 pt-4"
        >
          {DOMAINS.map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-medium transition-all duration-200 ${
                selectedDomain === domain
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold shadow-sm scale-105'
                  : 'bg-white/80 dark:bg-[#141519]/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              {domain}
            </button>
          ))}
        </motion.div>
      </div>

      {/* ─── Featured Competitions (2 Columns) ─── */}
      <div className="space-y-4 pt-4">
        {/* 2-Column Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {filteredEvents.slice(0, 6).map(evt => (
            <EventCard
              key={evt._id || evt.id}
              event={evt}
              isBookmarked={!!bookmarks[evt._id || evt.id]}
              onBookmark={handleBookmark}
            />
          ))}
        </div>

        <div className="text-center pt-4">
          <Link
            to="/events"
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141519] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors shadow-sm"
          >
            <span>Explore all competitions</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

    </div>
  );
}
