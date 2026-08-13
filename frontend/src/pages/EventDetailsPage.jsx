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
  Compass
} from 'lucide-react';
import AISafetyScoreCard from '../components/AISafetyScoreCard';
import AIAccommodationCard from '../components/AIAccommodationCard';
import BrochureModal from '../components/BrochureModal';
import EventChatbot from '../components/EventChatbot';
import Toast from '../components/Toast';
import api, { MOCK_EVENTS } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function EventDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, safety, accommodations, venue
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [showRegModal, setShowRegModal] = useState(false);
  const [showBrochureModal, setShowBrochureModal] = useState(false);
  const [regSuccess, setRegSuccess] = useState(false);
  const [teamName, setTeamName] = useState('');
  const [teamSize, setTeamSize] = useState(1);
  const [accommodations, setAccommodations] = useState([]);
  const [travelDistance, setTravelDistance] = useState(120);
  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get(`/events/${id}`)
      .then(res => {
        if (res.data.success) setEvent(res.data.data);
      })
      .catch(() => {
        const found = MOCK_EVENTS.find(e => (e._id || e.id) === id) || MOCK_EVENTS[0];
        setEvent(found);
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (event) {
      api.post('/ai/accommodations', {
        eventId: id,
        userBudget: 1500,
        distanceKm: travelDistance || 120,
        collegeName: event.collegeName,
        city: event.location?.city,
        lat: event.location?.lat,
        lng: event.location?.lng
      })
      .then(res => {
        if (res.data.success && res.data.data) setAccommodations(res.data.data);
      })
      .catch(() => {});
    }
  }, [id, event, travelDistance]);

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    api.post('/registrations/register', {
      eventId: event._id || event.id,
      teamName,
      teamMembersCount: teamSize
    }).catch(() => {});

    setRegSuccess(true);
    setToastMsg('🎉 Registration Confirmed! Ticket token generated.');
  };

  const handleShare = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(window.location.href);
      setToastMsg('Competition link copied!');
    }
  };

  if (loading) {
    return (
      <div className="py-16 text-center">
        <div className="w-8 h-8 rounded-full border-2 border-kaggle-cyan border-t-transparent animate-spin mx-auto" />
        <p className="text-xs text-slate-400 mt-4">Loading Competition Specs...</p>
      </div>
    );
  }

  if (!event) return null;

  return (
    <div className="space-y-6">
      
      {/* Back Button */}
      <Link to="/events" className="inline-flex items-center gap-1 text-xs font-bold text-slate-400 hover:text-kaggle-cyan transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Competitions
      </Link>

      {/* AI Modules Banner */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl flex-wrap"
        style={{ background: 'linear-gradient(135deg,rgba(32,190,255,0.08) 0%,rgba(139,92,246,0.05) 50%,rgba(16,185,129,0.05) 100%)', border: '1px solid rgba(32,190,255,0.18)' }}>
        <div className="flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5" style={{ color: '#20BEFF' }} />
          <span style={{ fontSize: 12, fontWeight: 700, color: '#20BEFF' }}>3 AI Modules Active</span>
        </div>
        <div className="h-3 w-px" style={{ background: 'rgba(100,116,139,0.3)' }} />
        {[
          { emoji: '🎯', label: 'Travel Safety Score', color: '#10B981' },
          { emoji: '🏨', label: 'Accommodation AI', color: '#8B5CF6' },
          { emoji: '🔒', label: 'Route Risk Analysis', color: '#F59E0B' }
        ].map(({ emoji, label, color }) => (
          <span key={label} className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
            {emoji} {label}
          </span>
        ))}
      </div>

      {/* Kaggle Competition Banner Header */}
      <div className="kaggle-card p-6 border-kaggle-cyan/30 space-y-4 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="kaggle-badge kaggle-badge-cyan">
                {event.category}
              </span>
              <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded border border-emerald-500/30">
                Prize Pool: {event.prizePool}
              </span>
              <span className="text-xs text-slate-500 dark:text-slate-400">
                Hosted by <strong className="text-slate-900 dark:text-white">{event.collegeName}</strong>
              </span>
            </div>

            <h1 className="text-2xl md:text-4xl font-black tracking-tight text-slate-900 dark:text-white">{event.title}</h1>
            <p className="text-xs text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed">{event.description}</p>
          </div>

          {/* Join / Register Action Button & Brochure */}
          <div className="shrink-0 flex flex-col sm:flex-row md:flex-col gap-2">
            <button
              onClick={() => setShowRegModal(true)}
              className="kaggle-btn-primary px-6 py-3 text-xs font-extrabold shadow-md"
            >
              Enter Competition / Register
            </button>
            <button
              onClick={() => setShowBrochureModal(true)}
              className="px-5 py-2.5 text-xs font-bold rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-400 border border-purple-500/30 flex items-center justify-center gap-2 transition-all"
            >
              <FileText className="w-4 h-4 text-purple-400" />
              <span>View / Print Official Brochure</span>
            </button>
            <div className="text-[11px] text-slate-400 text-center">
              Deadline: {new Date(event.registrationDeadline).toLocaleDateString()}
            </div>
          </div>

        </div>

        {/* Competition Metrics Line */}
        <div className="pt-4 border-t border-slate-800 flex flex-wrap gap-6 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Users className="w-4 h-4 text-kaggle-cyan" />
            <span><strong>540</strong> Teams Entered</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-emerald-400" />
            <span>Event Date: <strong>{new Date(event.eventDate).toLocaleDateString()}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-amber-400" />
            <span>Time: <strong>{event.startTime} - {event.endTime}</strong></span>
          </div>
          <div className="flex items-center gap-1.5">
            <FileText className="w-4 h-4 text-purple-400" />
            <span>Brochure: <strong className="text-purple-300">Available (PDF)</strong></span>
          </div>
        </div>
      </div>

      {/* Kaggle Navigation Tabs Bar */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
            activeTab === 'overview'
              ? 'bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan border-b-2 border-kaggle-cyan'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          📋 Overview & Rules
        </button>

        <button
          onClick={() => setActiveTab('brochure')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'brochure'
              ? 'bg-purple-500/10 text-purple-400 border-b-2 border-purple-500'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-purple-400" /> Event Brochure
        </button>

        <button
          onClick={() => setActiveTab('safety')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'safety'
              ? 'bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan border-b-2 border-kaggle-cyan'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <Compass className="w-3.5 h-3.5 text-cyan-400" /> AI Suited Route Agent
        </button>

        <button
          onClick={() => setActiveTab('accommodations')}
          className={`px-4 py-2 text-xs font-bold rounded-lg transition-colors flex items-center gap-1 whitespace-nowrap ${
            activeTab === 'accommodations'
              ? 'bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan border-b-2 border-kaggle-cyan'
              : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
          }`}
        >
          <BedDouble className="w-3.5 h-3.5 text-kaggle-cyan" /> AI Accommodations (&gt;100km)
        </button>
      </div>

      {/* Main Grid: Details & Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Columns Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Tab 1: Overview */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              <div className="kaggle-card p-6 space-y-4">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Competition Description</h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                  {event.description}
                </p>

                {/* Official Event Brochure Card */}
                <div className="p-4 rounded-xl bg-purple-500/10 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-xl bg-purple-500/20 text-purple-400 shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-slate-900 dark:text-white">Official Event Brochure</h4>
                      <p className="text-[11px] text-slate-400">Complete schedule, rules, guidelines, and prize distribution specs.</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="px-4 py-2 text-xs font-bold rounded-lg bg-purple-600 hover:bg-purple-500 text-white flex items-center justify-center gap-1.5 shrink-0 transition-colors shadow-sm"
                  >
                    <FileText className="w-3.5 h-3.5" /> View Official Brochure
                  </button>
                </div>

                <div className="pt-4 border-t border-slate-200 dark:border-slate-800">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Venue & Location</h4>
                  <p className="text-xs text-slate-600 dark:text-slate-300">{event.venue}, {event.location?.address}</p>
                  
                  <a
                    href={event.location?.googleMapUrl || `https://maps.google.com/?q=${encodeURIComponent(event.venue)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-kaggle-cyan hover:underline"
                  >
                    <Navigation className="w-3.5 h-3.5" /> Open Google Maps Location
                  </a>
                </div>
              </div>

              {/* Modules moved below Competition Description */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Action Box */}
                <div className="kaggle-card p-5 space-y-4">
                  <div className="text-xs text-slate-400 uppercase font-bold tracking-wider">Registration Status</div>
                  <div className="text-xl font-black text-slate-900 dark:text-white">Registration Open</div>

                  <button
                    onClick={() => setShowRegModal(true)}
                    className="w-full kaggle-btn-primary py-3 text-xs font-extrabold shadow-sm"
                  >
                    Enter Competition
                  </button>

                  <div className="flex gap-2">
                    <button
                      onClick={() => setIsBookmarked(!isBookmarked)}
                      className={`flex-1 py-2 rounded-lg border text-xs font-bold flex items-center justify-center gap-1 ${
                        isBookmarked ? 'bg-amber-500/10 text-amber-500 border-amber-500/30' : 'border-slate-200 dark:border-slate-700 text-slate-400'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" /> {isBookmarked ? 'Saved' : 'Bookmark'}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 py-2 rounded-lg border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-400 flex items-center justify-center gap-1"
                    >
                      <Share2 className="w-3.5 h-3.5" /> Share
                    </button>
                  </div>

                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800 text-xs space-y-1">
                    <div className="font-bold text-slate-900 dark:text-white">Host Contact</div>
                    <div className="text-slate-400">{event.contactPerson?.name || 'College Student Cell'}</div>
                    <div className="text-slate-400">{event.contactPerson?.phone || '+91 98765 43210'}</div>
                  </div>
                </div>

                {/* AI Travel Safety Quick Card (compact sidebar version) */}
                <AISafetyScoreCard event={event} initialDistance={travelDistance} compact={true} />
              </div>
            </div>
          )}

          {/* Tab: Brochure */}
          {activeTab === 'brochure' && (
            <div className="space-y-6">
              {/* Header bar */}
              <div className="kaggle-card p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-slate-900 dark:text-white">Official Event Brochure</h3>
                    <p className="text-xs text-slate-400">Published by {event.collegeName} • Full Rules & Schedule</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="kaggle-btn-primary text-xs px-4 py-2 font-bold flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" /> View / Print Full Brochure
                  </button>
                </div>
              </div>

              {/* Displayed Brochure Sheet */}
              <div className="bg-slate-900 rounded-2xl border border-purple-500/30 p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-xl">
                
                {/* Header */}
                <div className="border-b border-slate-800 pb-6 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-slate-950 border border-slate-800 overflow-hidden flex items-center justify-center font-black text-kaggle-cyan text-lg shrink-0">
                        {event.collegeName ? event.collegeName.substring(0, 2).toUpperCase() : 'CC'}
                      </div>
                      <div>
                        <h4 className="text-xs font-bold tracking-wider uppercase text-purple-400">{event.collegeName}</h4>
                        <p className="text-[11px] text-slate-400">Department of Student Affairs & Technology Cell</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold text-xs bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/30 self-start sm:self-auto">
                      <ShieldCheck className="w-4 h-4" />
                      <span>Official Verified Brochure</span>
                    </div>
                  </div>

                  {/* Main Event Cover Poster */}
                  <div className="relative rounded-xl overflow-hidden h-56 sm:h-72 border border-slate-800">
                    <img 
                      src={event.poster} 
                      alt={event.title}
                      className="w-full h-full object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent flex flex-col justify-end p-6">
                      <span className="kaggle-badge kaggle-badge-cyan self-start mb-2">
                        {event.category || 'National Competition'}
                      </span>
                      <h1 className="text-xl sm:text-3xl font-black text-white leading-tight">
                        {event.title}
                      </h1>
                    </div>
                  </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Trophy className="w-4 h-4 text-emerald-400" />
                      <span>Total Prize Pool</span>
                    </div>
                    <div className="text-lg font-black text-emerald-400">{event.prizePool}</div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Calendar className="w-4 h-4 text-kaggle-cyan" />
                      <span>Event Date</span>
                    </div>
                    <div className="text-sm font-bold text-white">
                      {new Date(event.eventDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>

                  <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800 space-y-1">
                    <div className="flex items-center gap-1.5 text-xs text-slate-400 font-bold">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span>Registration Deadline</span>
                    </div>
                    <div className="text-sm font-bold text-amber-400">
                      {new Date(event.registrationDeadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </div>
                  </div>
                </div>

                {/* Detailed Description */}
                <div className="space-y-3 border-t border-slate-800 pt-6">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <FileText className="w-4 h-4 text-purple-400" />
                    <span>Event Structure & Specifications</span>
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-5 rounded-xl border border-slate-800/80">
                    {event.description}
                  </p>
                </div>

                {/* Rules & Guidelines Section */}
                <div className="space-y-3">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span>Official Rules & Guidelines</span>
                  </h3>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-slate-300">
                    <li className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Open to all undergraduate & postgraduate students nationwide.</span>
                    </li>
                    <li className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Teams can have 1 to 4 members with cross-college participation allowed.</span>
                    </li>
                    <li className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Mandatory college ID card verification at check-in counter.</span>
                    </li>
                    <li className="p-3.5 rounded-xl bg-slate-950/50 border border-slate-800 flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>Certificates awarded to all verified registered team attendees.</span>
                    </li>
                  </ul>
                </div>

                <div className="space-y-3 border-t border-slate-800 pt-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span>Printable Verified Pamphlet</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">Generated dynamically with schedule, rules, eligibility and campus contact details.</p>
                  </div>
                  <button
                    onClick={() => setShowBrochureModal(true)}
                    className="kaggle-btn-primary text-xs px-5 py-2.5 font-bold flex items-center justify-center gap-2 shrink-0"
                  >
                    <FileText className="w-4 h-4" /> Open Full Brochure Viewer
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Tab 2: AI Safety Score */}
          {activeTab === 'safety' && (
            <AISafetyScoreCard event={event} initialDistance={travelDistance} />
          )}

          {/* Tab 3: AI Accommodations */}
          {activeTab === 'accommodations' && (
            <div className="space-y-5">
              {/* AI Accommodation Header */}
              <div className="p-5 rounded-2xl relative overflow-hidden"
                style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.1) 0%,rgba(32,190,255,0.06) 100%)', border: '1px solid rgba(139,92,246,0.25)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 rounded-full pointer-events-none"
                  style={{ background: 'radial-gradient(circle,rgba(139,92,246,0.15) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }} />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2.5 rounded-xl" style={{ background: 'rgba(139,92,246,0.15)' }}>
                    <BedDouble className="w-5 h-5" style={{ color: '#8B5CF6' }} />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      <h3 className="text-base font-black text-slate-900 dark:text-white">Gemini AI Accommodation Agent</h3>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black" style={{ background: '#8B5CF6', color: '#fff' }}>Gemini AI</span>
                    </div>
                    <p className="text-xs text-slate-400">Top 5 picks near campus ranked live by Gemini AI Agent & Google Places</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 mt-3 pt-3 relative z-10" style={{ borderTop: '1px solid rgba(139,92,246,0.15)' }}>
                  {[{ label: 'Budget Match', val: '✓' }, { label: 'Safety Verified', val: '✓' }, { label: 'Live Google Places', val: 'Active' }, { label: 'Gemini AI Agent', val: 'Top 5 Picks' }].map(({ label, val }) => (
                    <div key={label} className="text-xs">
                      <span style={{ color: '#64748B' }}>{label}: </span>
                      <strong style={{ color: '#8B5CF6' }}>{val}</strong>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                {accommodations.map((acc, i) => (
                  <AIAccommodationCard key={acc.id || i} accommodation={acc} rank={i + 1} />
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar Widget */}
        <div className="space-y-6 lg:sticky lg:top-24 lg:self-start">
          
          {/* Event AI Chatbot */}
          <EventChatbot event={event} />



        </div>

      </div>

      {/* Registration Modal */}
      {showRegModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          <div className="kaggle-card p-6 max-w-md w-full space-y-4">
            
            {!regSuccess ? (
              <>
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Confirm Registration</h3>
                <p className="text-xs text-slate-400">{event.title}</p>

                <form onSubmit={handleRegisterSubmit} className="space-y-3 text-xs">
                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Team Name (Optional)</label>
                    <input 
                      type="text" 
                      placeholder="e.g. CyberKnights"
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div>
                    <label className="block text-slate-400 font-semibold mb-1">Team Size</label>
                    <input 
                      type="number" 
                      min="1" 
                      max="6"
                      value={teamSize}
                      onChange={(e) => setTeamSize(Number(e.target.value))}
                      className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-900 dark:text-white"
                    />
                  </div>

                  <div className="flex justify-end gap-2 pt-3">
                    <button type="button" onClick={() => setShowRegModal(false)} className="px-3 py-1.5 text-slate-400 font-bold">Cancel</button>
                    <button type="submit" className="kaggle-btn-primary text-xs px-4 py-2">Confirm Entry</button>
                  </div>
                </form>
              </>
            ) : (
              <div className="text-center py-4 space-y-3">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
                <h3 className="text-lg font-bold text-slate-900 dark:text-white">Registration Confirmed!</h3>
                <p className="text-xs text-slate-400">Digital pass added to your dashboard.</p>
                <button onClick={() => { setShowRegModal(false); setRegSuccess(false); }} className="kaggle-btn-primary text-xs mx-auto px-6 py-2">Close</button>
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
