import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Search, ArrowRight, Sparkles, Trophy, Calendar, MapPin
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
    <div className="space-y-10 max-w-6xl mx-auto py-4 sm:py-8">

      {/* ─── Hero Section (Minimalist & Centered) ─── */}
      <div className="text-center space-y-4 max-w-2xl mx-auto pt-4 sm:pt-8">
        <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
          Discover college fests, competitions & hackathons
        </h1>
        <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
          Browse verified events across India, explore tech domains, and get personalized recommendations.
        </p>

        {/* Floating Pill Search Bar */}
        <form onSubmit={handleSearch} className="pt-3 max-w-xl mx-auto">
          <div className="relative flex items-center bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-full shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all p-1.5 pl-4">
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
              className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 p-2.5 rounded-full transition-colors shrink-0"
              title="Search"
            >
              <ArrowRight className="w-4 h-4 stroke-[2]" />
            </button>
          </div>
        </form>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-2">
          {DOMAINS.map(domain => (
            <button
              key={domain}
              onClick={() => setSelectedDomain(domain)}
              className={`px-3.5 py-1.5 rounded-full text-xs transition-colors ${
                selectedDomain === domain
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold'
                  : 'bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 dark:hover:border-slate-600'
              }`}
            >
              {domain}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Featured Competitions (2 Columns) ─── */}
      <div className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">
              Featured Events
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Top events and hackathons from premier institutions
            </p>
          </div>

          <Link
            to="/events"
            className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
          >
            <span>View all</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

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
