/**
 * AIAccommodationCard.jsx — Premium AI Accommodation Recommendation Card
 * Features: Large image with gradient overlay, AI rank glow badge, rating stars,
 * price/night with "Best Value" flag, distance tile, safety mini-ring,
 * amenity icon chips, Google Maps + Book Now buttons, structured AI explanation
 */
import React, { useState } from 'react';
import {
  Star, MapPin, ShieldCheck, ExternalLink, Sparkles,
  Wifi, Wind, Zap, Coffee, Lock, UtensilsCrossed, Car,
  ShowerHead, Tv, CheckCircle2, X, CreditCard, Navigation
} from 'lucide-react';

/* ── Amenity icon map ─────────────────────────────────────── */
const AMENITY_ICONS = {
  'Free Wi-Fi': <Wifi size={11} />,
  'Wi-Fi': <Wifi size={11} />,
  'Air Conditioned': <Wind size={11} />,
  'AC Deluxe': <Wind size={11} />,
  'Power Backup': <Zap size={11} />,
  'Breakfast': <Coffee size={11} />,
  'Meals Included': <UtensilsCrossed size={11} />,
  'CCTV Security': <Lock size={11} />,
  'Biometric Lock': <Lock size={11} />,
  '24/7 Security': <Lock size={11} />,
  'Shuttle Service': <Car size={11} />,
  'Parking': <Car size={11} />,
  'Washing Machine': <ShowerHead size={11} />,
  'Study Hall': <Tv size={11} />,
  'TV': <Tv size={11} />,
};

/* ── Star rating display ─────────────────────────────────── */
function StarRating({ rating }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          size={12}
          style={{
            color: i <= Math.floor(rating) ? '#F59E0B' : '#334155',
            fill: i <= Math.floor(rating) ? '#F59E0B' : 'none'
          }}
        />
      ))}
    </div>
  );
}

/* ── Mini Safety Ring ─────────────────────────────────────── */
function SafetyRing({ score }) {
  const r = 14, circ = 2 * Math.PI * r;
  const offset = circ - (circ * score) / 100;
  const color = score >= 85 ? '#10B981' : score >= 70 ? '#F59E0B' : '#EF4444';
  return (
    <div className="relative flex-shrink-0" style={{ width: 40, height: 40 }}>
      <svg width={40} height={40} viewBox="0 0 40 40" className="-rotate-90">
        <circle cx={20} cy={20} r={r} stroke="rgba(100,116,139,0.15)" strokeWidth={4} fill="none" />
        <circle cx={20} cy={20} r={r} stroke={color} strokeWidth={4} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <ShieldCheck size={11} style={{ color }} />
      </div>
    </div>
  );
}

/* ── Book Now Modal ───────────────────────────────────────── */
function BookNowModal({ accommodation, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(8px)' }}>
      <div className="kaggle-card p-6 max-w-sm w-full space-y-5 animate-fade-in-up"
        style={{ borderColor: 'rgba(32,190,255,0.25)' }}>
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-slate-900 dark:text-white">{accommodation.name}</h3>
            <p style={{ fontSize: 12, color: '#64748B' }}>{accommodation.type}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={16} className="text-slate-400" />
          </button>
        </div>

        <div className="p-4 rounded-xl space-y-2"
          style={{ background: 'rgba(32,190,255,0.05)', border: '1px solid rgba(32,190,255,0.15)' }}>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Price / Night</span>
            <span className="font-black text-emerald-400">₹{accommodation.pricePerNight}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Distance</span>
            <span className="font-bold text-slate-200">{accommodation.distanceKm} km from venue</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-slate-400">Safety Score</span>
            <span className="font-bold text-emerald-400">{accommodation.safetyScore}%</span>
          </div>
        </div>

        <div className="flex gap-3">
          <a
            href={accommodation.mapUrl || `https://maps.google.com/?q=${encodeURIComponent((accommodation.name || '') + ' ' + (accommodation.address || ''))}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold border"
            style={{ borderColor: 'rgba(32,190,255,0.3)', color: '#20BEFF', background: 'rgba(32,190,255,0.05)' }}>
            <Navigation size={13} /> Maps
          </a>
          <a
            href={accommodation.bookingUrl || `https://www.google.com/search?q=book+${encodeURIComponent(accommodation.name || '')}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 kaggle-btn-primary text-xs py-2.5">
            <CreditCard size={13} /> Book Now
          </a>
        </div>

        <p style={{ fontSize: 10, color: '#475569', textAlign: 'center' }}>
          Booking links open the provider's official page or Google Search.
        </p>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════════════ */
export default function AIAccommodationCard({ accommodation, rank }) {
  const [showBookModal, setShowBookModal] = useState(false);

  if (!accommodation) return null;

  const isLowest = rank === 1;
  const rankColors = {
    1: { label: '#FFD700', bg: 'rgba(255,215,0,0.12)', border: 'rgba(255,215,0,0.35)', glow: '0 0 20px rgba(255,215,0,0.2)' },
    2: { label: '#94A3B8', bg: 'rgba(148,163,184,0.08)', border: 'rgba(148,163,184,0.25)', glow: 'none' },
    3: { label: '#CD7F32', bg: 'rgba(205,127,50,0.08)', border: 'rgba(205,127,50,0.25)', glow: 'none' },
  };
  const rc = rankColors[rank] || rankColors[3];
  const safetyColor = accommodation.safetyScore >= 85 ? '#10B981' : accommodation.safetyScore >= 70 ? '#F59E0B' : '#EF4444';

  return (
    <>
      <div className="kaggle-card overflow-hidden group transition-all duration-300 hover:-translate-y-0.5"
        style={{
          borderColor: rc.border,
          boxShadow: rc.glow,
          fontFamily: "'Inter', sans-serif"
        }}>

        {/* ─── Image Section ─────────────────────────────────── */}
        <div className="relative h-48 overflow-hidden">
          <img
            src={accommodation.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'}
            alt={accommodation.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0"
            style={{ background: 'linear-gradient(to bottom, rgba(15,17,23,0.1) 0%, rgba(15,17,23,0.7) 100%)' }} />

          {/* AI Rank Badge */}
          <div className="absolute top-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black"
            style={{ background: rc.bg, border: `1px solid ${rc.border}`, color: rc.label, backdropFilter: 'blur(8px)' }}>
            <Sparkles size={11} /> AI Rank #{rank}
          </div>

          {/* Accommodation type badge */}
          <div className="absolute top-3 right-3 px-2.5 py-1 rounded-lg text-xs font-bold"
            style={{ background: 'rgba(0,0,0,0.6)', color: '#CBD5E1', backdropFilter: 'blur(4px)' }}>
            {accommodation.type || 'Hostel'}
          </div>

          {/* Best Value ribbon */}
          {isLowest && (
            <div className="absolute bottom-3 right-3 flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-black"
              style={{ background: '#10B981', color: '#fff' }}>
              <CheckCircle2 size={11} /> Best Value
            </div>
          )}

          {/* Bottom info bar */}
          <div className="absolute bottom-0 left-0 right-0 p-3 flex items-end justify-between">
            <div>
              <div className="text-white font-black" style={{ fontSize: 16, textShadow: '0 1px 4px rgba(0,0,0,0.5)' }}>
                {accommodation.name}
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <MapPin size={11} style={{ color: '#20BEFF' }} />
                <span style={{ fontSize: 11, color: '#CBD5E1' }}>{accommodation.distanceKm} km from venue</span>
              </div>
            </div>
            <div className="text-right">
              <div style={{ fontSize: 20, fontWeight: 900, color: '#34D399' }}>₹{accommodation.pricePerNight}</div>
              <div style={{ fontSize: 10, color: '#94A3B8' }}>/night</div>
            </div>
          </div>
        </div>

        {/* ─── Content Body ──────────────────────────────────── */}
        <div className="p-5 space-y-4">

          {/* Rating + Safety row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <StarRating rating={accommodation.rating || 4.5} />
              <span style={{ fontSize: 13, fontWeight: 800, color: '#F59E0B' }}>{accommodation.rating || 4.5}</span>
              <span style={{ fontSize: 11, color: '#64748B' }}>/ 5.0</span>
            </div>
            <div className="flex items-center gap-2">
              <SafetyRing score={accommodation.safetyScore || 90} />
              <div>
                <div style={{ fontSize: 11, fontWeight: 800, color: safetyColor }}>{accommodation.safetyScore || 90}% Safe</div>
                <div style={{ fontSize: 10, color: '#64748B' }}>AI Safety Score</div>
              </div>
            </div>
          </div>

          {/* Address */}
          <p style={{ fontSize: 12, color: '#64748B' }} className="flex items-center gap-1.5">
            <MapPin size={11} style={{ color: '#20BEFF', flexShrink: 0 }} />
            {accommodation.address}
          </p>

          {/* AI Explanation */}
          {accommodation.matchReason && (
            <div className="p-3.5 rounded-xl"
              style={{ background: 'rgba(32,190,255,0.05)', border: '1px solid rgba(32,190,255,0.15)' }}>
              <div className="flex items-start gap-2.5">
                <div className="p-1.5 rounded-lg flex-shrink-0"
                  style={{ background: 'rgba(32,190,255,0.1)' }}>
                  <Sparkles size={11} style={{ color: '#20BEFF' }} />
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 800, color: '#20BEFF', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 3 }}>
                    AI Recommendation Reason
                  </div>
                  <p style={{ fontSize: 12, color: '#94A3B8', lineHeight: 1.65 }}>
                    {accommodation.matchReason}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Amenities */}
          {accommodation.amenities && accommodation.amenities.length > 0 && (
            <div>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
                Amenities
              </div>
              <div className="flex flex-wrap gap-1.5">
                {accommodation.amenities.map((amenity, i) => (
                  <div key={i} className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold"
                    style={{ background: 'rgba(100,116,139,0.07)', color: '#94A3B8', border: '1px solid rgba(100,116,139,0.12)' }}>
                    <span style={{ color: '#20BEFF' }}>{AMENITY_ICONS[amenity] || <CheckCircle2 size={11} />}</span>
                    {amenity}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-2.5 pt-1">
            <a
              href={accommodation.mapUrl || `https://maps.google.com/?q=${encodeURIComponent((accommodation.name || '') + ' ' + (accommodation.address || ''))}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold border transition-all hover:border-cyan-400/40"
              style={{ borderColor: 'rgba(32,190,255,0.25)', color: '#20BEFF', background: 'rgba(32,190,255,0.05)' }}>
              <ExternalLink size={13} /> Google Maps
            </a>
            <button
              onClick={() => setShowBookModal(true)}
              className="flex-1 kaggle-btn-primary text-xs py-2.5 rounded-xl"
              style={{ borderRadius: 12 }}>
              <CreditCard size={13} /> Book Now
            </button>
          </div>

        </div>
      </div>

      {showBookModal && (
        <BookNowModal accommodation={accommodation} onClose={() => setShowBookModal(false)} />
      )}
    </>
  );
}
