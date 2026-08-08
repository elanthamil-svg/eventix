import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Search, Filter, LayoutGrid, List, Sparkles, X, Trophy } from 'lucide-react';
import EventCard from '../components/EventCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import api, { MOCK_EVENTS } from '../services/api';

const CATEGORIES = ['All', 'Hackathon', 'Workshop', 'Symposium', 'Coding', 'AI', 'Robotics', 'Design'];

export default function EventsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialCategory = searchParams.get('category') || 'All';
  const initialSearch = searchParams.get('search') || '';

  const [category, setCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [feeFilter, setFeeFilter] = useState('all'); // all, free, paid
  const [viewMode, setViewMode] = useState('grid'); // grid, list
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [bookmarks, setBookmarks] = useState({});

  useEffect(() => {
    setLoading(true);
    let url = `/events?category=${category !== 'All' ? category : ''}&search=${searchQuery}&fee=${feeFilter}`;

    api.get(url)
      .then((res) => {
        if (res.data.success) {
          setEvents(res.data.data);
        }
      })
      .catch(() => {
        let filtered = [...MOCK_EVENTS];

        if (category !== 'All') {
          filtered = filtered.filter(e => e.category === category || e.tags?.includes(category));
        }

        if (searchQuery) {
          const q = searchQuery.toLowerCase();
          filtered = filtered.filter(e => 
            e.title.toLowerCase().includes(q) ||
            e.description.toLowerCase().includes(q) ||
            e.collegeName.toLowerCase().includes(q)
          );
        }

        if (feeFilter === 'free') {
          filtered = filtered.filter(e => e.entryFee === 0);
        } else if (feeFilter === 'paid') {
          filtered = filtered.filter(e => e.entryFee > 0);
        }

        setEvents(filtered);
      })
      .finally(() => setLoading(false));
  }, [category, searchQuery, feeFilter]);

  const handleBookmark = (id) => {
    setBookmarks(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const clearFilters = () => {
    setCategory('All');
    setSearchQuery('');
    setFeeFilter('all');
    setSearchParams({});
  };

  return (
    <div className="space-y-6">
      
      {/* Kaggle Header & View Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <span>Inter-College Competitions</span>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-kaggle-cyan/10 text-kaggle-cyan border border-kaggle-cyan/30">
              {events.length} Active
            </span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Browse nationwide hackathons, robotics challenges, and coding contests.</p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 self-start sm:self-auto">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewMode === 'grid' ? 'bg-white dark:bg-slate-800 text-kaggle-cyan shadow-sm' : 'text-slate-500'
            }`}
            title="Grid View"
          >
            <LayoutGrid className="w-4 h-4" /> Grid
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-1.5 rounded-lg text-xs font-semibold flex items-center gap-1 transition-colors ${
              viewMode === 'list' ? 'bg-white dark:bg-slate-800 text-kaggle-cyan shadow-sm' : 'text-slate-500'
            }`}
            title="List View"
          >
            <List className="w-4 h-4" /> List
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="kaggle-card p-4 space-y-4">
        
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative sm:col-span-2">
            <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Filter by title, college, tech tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-100 dark:bg-slate-900 text-xs rounded-xl border border-transparent focus:border-kaggle-cyan text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2">
            <select
              value={feeFilter}
              onChange={(e) => setFeeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 text-xs rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white font-medium"
            >
              <option value="all">All Fees</option>
              <option value="free">Free Entry Only</option>
              <option value="paid">Paid Registration</option>
            </select>

            <button
              onClick={clearFilters}
              className="p-2 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-500 hover:text-rose-500"
              title="Clear Filters"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Category Pills Slider */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => { setCategory(cat); setSearchParams({ category: cat }); }}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                category === cat 
                  ? 'bg-kaggle-cyan text-slate-950 font-bold shadow-sm' 
                  : 'bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-4 gap-4">
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
        <div className="kaggle-card overflow-hidden">
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {events.map((evt) => (
              <div key={evt._id || evt.id} className="p-4 hover:bg-slate-50 dark:hover:bg-slate-900/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-bold text-kaggle-cyan text-sm shrink-0">
                    {evt.collegeName ? evt.collegeName.substring(0, 2).toUpperCase() : 'CC'}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900 dark:text-white hover:text-kaggle-cyan cursor-pointer">
                      {evt.title}
                    </h4>
                    <p className="text-xs text-slate-500">{evt.collegeName} • {evt.category}</p>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 text-xs">
                  <div className="font-bold text-emerald-500 hidden sm:block">{evt.prizePool}</div>
                  <div className="flex items-center gap-2">
                    <Link to={`/events/${evt._id || evt.id}`} className="px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors">
                      View Details
                    </Link>
                    <Link to={`/events/${evt._id || evt.id}?register=true`} className="kaggle-btn-primary text-xs px-3 py-1.5 font-extrabold">
                      Register Now
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
}
