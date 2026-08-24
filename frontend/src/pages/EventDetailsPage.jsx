import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  MapPin, 
  Trophy, 
  User, 
  Phone, 
  Mail, 
  Share2, 
  ShieldCheck, 
  Sparkles, 
  BedDouble, 
  CheckCircle2,
  Navigation,
  ChevronLeft,
  Bookmark,
  Users,
  FileText,
  Download,
  ExternalLink,
  Compass,
  RefreshCw,
  SlidersHorizontal,
  Info
} from 'lucide-react';
import AISafetyScoreCard from '../components/AISafetyScoreCard';
import AIAccommodationCard from '../components/AIAccommodationCard';
import BrochureModal from '../components/BrochureModal';
import EventChatbot from '../components/EventChatbot';
import Toast from '../components/Toast';
import api, { MOCK_EVENTS, getMockAccommodations } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, brochure, safety, accommodations
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [accommodations, setAccommodations] = useState([]);
  const [accLoading, setAccLoading] = useState(false);
  const [userBudget, setUserBudget] = useState(5000);
  const [travelDistance, setTravelDistance] = useState(120);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${id}`)
      .then(res => {
        if (res.data.success && res.data.data) setEvent(res.data.data);
      })
      .catch(() => {
        const found = MOCK_EVENTS.find(e => (e._id || e.id) === id) || MOCK_EVENTS[0];
        setEvent(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  const loadAccommodations = (budgetVal = userBudget, distVal = travelDistance) => {
    if (!event) return;
    setAccLoading(true);
    api.post('/ai/accommodations', {
      eventId: id,
      userBudget: budgetVal || 5000,
      distanceKm: distVal || 120,
      collegeName: event.collegeName,
      city: event.location?.city,
      lat: event.location?.lat,
      lng: event.location?.lng
    })
    .then(res => {
      if (res.data?.success && res.data?.data && res.data.data.length > 0) {
        setAccommodations(res.data.data);
      } else {
        const fallback = getMockAccommodations(event.collegeName, event.location?.city);
        setAccommodations(fallback);
      }
    })
    .catch(() => {
      const fallback = getMockAccommodations(event.collegeName, event.location?.city);
      setAccommodations(fallback);
    })
    .finally(() => setAccLoading(false));
  };

  useEffect(() => {
    if (event) {
      loadAccommodations(userBudget, travelDistance);
    }
  }, [id, event, travelDistance, userBudget]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    api.post('/registrations/register', {
      eventId: event._id || event.id,
      teamName,
      teamMembersCount: teamSize
    }).catch(() => {});

    setRegSuccess(true);
    setToastMsg('Registration Confirmed! Ticket token generated.');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMsg('Competition link copied to clipboard!');
    }
  };

  const formatDeadline = (dateStr) => {
    if (!dateStr) return 'Rolling Registration';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Registration Open';
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return 'Registration Open';
    }
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'TBA';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
      return dateStr;
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center space-y-3">
        <div className="w-6 h-6 border-2 border-slate-900 dark:border-white border-t-transparent animate-spin rounded-full mx-auto" />
        <p className="text-xs text-slate-500">Loading competition specifications...</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          to="/events"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="w-4 h-4" /> Back to Competitions
        </Link>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsBookmarked(!isBookmarked)}
            className={`p-2 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-colors ${
              isBookmarked
                ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-transparent'
                : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400'
            }`}
            title="Save to bookmarks"
          >
            <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? 'fill-current' : ''}`} />
            <span className="hidden sm:inline">{isBookmarked ? 'Saved' : 'Save'}</span>
          </button>

          <button
            onClick={handleShare}
            className="p-2 rounded-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:border-slate-400 text-xs font-semibold flex items-center gap-1.5 transition-colors"
            title="Share competition link"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Share</span>
          </button>
        </div>
      </div>

      {/* Main Header Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          
          {/* Left Details */}
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                {event.category || 'Competition'}
              </span>
              {event.prizePool && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                  Prize Pool: {event.prizePool}
                </span>
              )}
              {event.nirfRank && (
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400">
                  NIRF #{event.nirfRank}
                </span>
              )}
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hosted by <strong className="text-slate-900 dark:text-white font-semibold">{event.collegeName}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
              {event.title}
            </h1>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-3xl">
              {event.description}
            </p>
          </div>

          {/* Right Action Buttons */}
          <div className="shrink-0 flex flex-col gap-2.5 w-full sm:w-auto min-w-[200px]">
            <button
              onClick={() => setShowRegModal(true)}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 py-3 px-6 rounded-full text-xs font-bold transition-colors shadow-sm text-center"
            >
              Enter Competition / Register
            </button>
            <button
              onClick={() => setShowBrochureModal(true)}
              className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 py-2.5 px-4 rounded-full text-xs font-semibold transition-colors flex items-center justify-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Official Brochure</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center font-medium">
              Deadline: {formatDeadline(event.registrationDeadline)}
            </div>
          </div>

        </div>

        {/* Metrics Row */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center gap-6 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-slate-400" />
            <span><strong>540</strong> Teams Entered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span>Date: <strong>{formatEventDate(event.eventDate)}</strong></span>
          </div>
          {event.startTime && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              <span>Time: <strong>{event.startTime} {event.endTime ? `- ${event.endTime}` : ''}</strong></span>
            </div>
          )}
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-slate-400" />
            <span>Brochure: <strong>Available (PDF)</strong></span>
          </div>
        </div>
      </div>

      {/* Clean Monochrome Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview & Rules' },
          { key: 'brochure', label: 'Official Brochure' },
          { key: 'safety', label: 'AI Route & Safety Agent' },
          { key: 'accommodations', label: 'Accommodations' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 text-xs rounded-full transition-colors whitespace-nowrap ${
              activeTab === tab.key
                ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold shadow-sm'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 font-medium'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Main Grid: Details & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              
              {/* Competition Description Card */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-4 shadow-sm">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Competition Description</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>

                {/* Brochure Callout */}
                <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">Official Event Brochure</h4>
                      <p className="text-[11px] text-slate-500">Complete schedule, rules, guidelines, and prize specs.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="px-4 py-2 text-xs font-bold rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
                  >
                    <Download className="w-3.5 h-3.5" /> Download Brochure
                  </button>
                </div>

                {/* Venue & Maps */}
                <div className="pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Venue & Campus Location</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{event.venue}, {event.location?.address || event.location?.city}</p>
                  
                  <a
                    href={event.location?.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(event.venue || event.collegeName)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 dark:text-white hover:underline pt-1"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Open Google Maps Campus Location
                  </a>
                </div>
              </div>

              {/* Registration & Actions Box */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 space-y-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
                  <div>
                    <div className="text-[11px] text-slate-400 uppercase font-semibold tracking-wider">Registration Status</div>
                    <div className="text-lg font-bold text-slate-900 dark:text-white">Registration Open</div>
                  </div>
                  <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 self-start sm:self-auto">
                    Verified Student Event
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <button
                    onClick={() => setShowRegModal(true)}
                    className="sm:col-span-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 py-3 rounded-full text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>Enter Competition / Register</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="py-2.5 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Share2 className="w-3.5 h-3.5" /> Share
                  </button>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="space-y-0.5">
                      <div className="font-semibold text-slate-900 dark:text-white">Host Contact Person</div>
                      <div className="text-slate-500 dark:text-slate-400">{event.contactPerson?.name || 'Student Affairs Cell'}</div>
                    </div>
                    {event.contactPerson?.phone && (
                      <div className="space-y-0.5 border-l border-slate-200 dark:border-slate-800 pl-4">
                        <div className="font-semibold text-slate-900 dark:text-white">Helpline Phone</div>
                        <div className="text-slate-500 dark:text-slate-400">{event.contactPerson.phone}</div>
                      </div>
                    )}
                  </div>

                  <button
                    onClick={() => setActiveTab('safety')}
                    className="text-xs font-bold text-slate-700 dark:text-slate-300 hover:underline flex items-center gap-1 self-start sm:self-auto"
                  >
                    <Compass className="w-3.5 h-3.5" /> Check Route & Safety ➔
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Brochure */}
          {activeTab === 'brochure' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0 font-bold">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900 dark:text-white">Official Event Brochure</h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Published by {event.collegeName} • Full Rules & Schedule</p>
                  </div>
                </div>

                <button
                  onClick={() => setShowBrochureModal(true)}
                  className="bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs px-5 py-2.5 rounded-full font-bold flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" /> Download Full PDF
                </button>
              </div>

              {/* Brochure Sheet Display */}
              <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider font-bold text-slate-400">{event.collegeName}</span>
                      <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white mt-0.5">{event.title}</h2>
                    </div>
                    <span className="px-2.5 py-1 rounded-full text-xs font-semibold border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300">
                      Verified
                    </span>
                  </div>

                  {event.poster && (
                    <div className="rounded-xl overflow-hidden max-h-72 border border-slate-200 dark:border-slate-800">
                      <img src={event.poster} alt={event.title} className="w-full h-full object-cover" />
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Overview & Details</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                    {event.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: AI Safety Score */}
          {activeTab === 'safety' && (
            <AISafetyScoreCard event={event} initialDistance={travelDistance} />
          )}

          {/* Tab 4: AI Accommodations */}
          {activeTab === 'accommodations' && (
            <div className="space-y-5">
              {/* Accommodation Header */}
              <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
                      <BedDouble className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900 dark:text-white">Student Stays & Accommodations</h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400">Top verified hostels, PGs & hotels near {event?.collegeName}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => loadAccommodations(userBudget, travelDistance)}
                    disabled={accLoading}
                    className="px-4 py-2 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 transition-colors flex items-center gap-1.5 self-start sm:self-auto disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${accLoading ? 'animate-spin' : ''}`} />
                    <span>{accLoading ? 'Fetching...' : 'Refresh Stays'}</span>
                  </button>
                </div>
              </div>

              {/* Accommodations List */}
              {!accLoading && accommodations.length > 0 && (
                <div className="space-y-4">
                  {accommodations
                    .filter((acc) => !userBudget || userBudget >= 5000 || acc.pricePerNight <= userBudget)
                    .map((acc, i) => (
                      <AIAccommodationCard key={acc.id || i} accommodation={acc} rank={i + 1} />
                    ))}
                </div>
              )}

              {/* Fallback */}
              {!accLoading && accommodations.length === 0 && (
                <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center space-y-3">
                  <BedDouble className="w-8 h-8 text-slate-400 mx-auto" />
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Stays Found</h4>
                  <p className="text-xs text-slate-500">Click below to fetch recommended student hostels near campus.</p>
                  <button
                    onClick={() => loadAccommodations(userBudget, travelDistance)}
                    className="px-4 py-2 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold"
                  >
                    Fetch Stays
                  </button>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Sidebar: Event Snapshot */}
        <div className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 space-y-4 shadow-sm">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">Event Snapshot</h4>
            
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Prize Pool</span>
                <span className="font-bold text-slate-900 dark:text-white">{event.prizePool || 'Certificate'}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Entry Fee</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}
                </span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Host College</span>
                <span className="font-semibold text-slate-900 dark:text-white truncate max-w-[140px] text-right">{event.collegeName}</span>
              </div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                <span className="text-slate-500">Venue</span>
                <span className="font-medium text-slate-600 dark:text-slate-400 truncate max-w-[140px] text-right">{event.venue}</span>
              </div>
              {event.nirfRank && (
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
                  <span className="text-slate-500">NIRF Ranking</span>
                  <span className="font-bold text-slate-900 dark:text-white">#{event.nirfRank}</span>
                </div>
              )}
            </div>

            {event.contactPerson && (
              <div className="pt-2 space-y-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                <div className="text-[11px] font-bold text-slate-400">Organizer Contact</div>
                {event.contactPerson.name && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{event.contactPerson.name}</span>
                  </div>
                )}
                {event.contactPerson.phone && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`tel:${event.contactPerson.phone}`} className="hover:underline">{event.contactPerson.phone}</a>
                  </div>
                )}
                {event.contactPerson.email && (
                  <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <a href={`mailto:${event.contactPerson.email}`} className="hover:underline truncate">{event.contactPerson.email}</a>
                  </div>
                )}
              </div>
            )}

            <button
              onClick={() => setShowRegModal(true)}
              className="w-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 py-2.5 rounded-full text-xs font-bold shadow-sm transition-colors"
            >
              Register Now
            </button>
          </div>

        </div>

      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-md w-full space-y-4 shadow-xl">
            
            {!regSuccess ? (
              <>
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Confirm Registration</h3>
                <p className="text-xs text-slate-500">{event.title}</p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Team Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CodeForge"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-500 font-semibold mb-1">Team Members Count</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="6"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button type="button" onClick={() => setShowRegModal(false)} className="px-3 py-1.5 text-slate-500 font-semibold">Cancel</button>
                    <button type="submit" className="px-5 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 rounded-full font-bold">Confirm Entry</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-slate-900 dark:text-white mx-auto" />
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Registration Confirmed!</h3>
                <p className="text-xs text-slate-500">Your registration has been confirmed and added to your dashboard.</p>
                <button onClick={() => { setShowRegModal(false); setRegSuccess(false); }} className="px-6 py-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-xs font-bold mx-auto">Close</button>
              </div>
            )}

          </div>
        </div>
      )}

      {showBrochureModal && (
        <BrochureModal event={event} onClose={() => setShowBrochureModal(false)} />
      )}

      {toastMsg && <Toast message={toastMsg} onClose={() => setToastMsg('')} />}

    </div>
  );
}
