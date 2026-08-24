import React, { useState } from 'react';
import {
  Star, MapPin, ShieldCheck, Sparkles,
  Wifi, Wind, Zap, Coffee, Lock, UtensilsCrossed, Car,
  ShowerHead, Tv, CheckCircle2, X, CreditCard, Navigation
} from 'lucide-react';

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

function BookNowModal({ accommodation, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full space-y-4 shadow-xl">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">{accommodation.name}</h3>
            <p className="text-xs text-slate-500">{accommodation.type}</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
            <X size={15} className="text-slate-400" />
          </button>
        </div>

        <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-slate-500">Price / Night</span>
            <span className="font-bold text-slate-900 dark:text-white">₹{accommodation.pricePerNight}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Distance</span>
            <span className="font-medium text-slate-700 dark:text-slate-300">{accommodation.distanceKm} km from venue</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-500">Safety Score</span>
            <span className="font-semibold text-slate-900 dark:text-white">{accommodation.safetyScore}%</span>
          </div>
        </div>

        <div className="flex gap-2 pt-1">
          <a
            href={accommodation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((accommodation.name || '') + ' ' + (accommodation.address || ''))}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-full text-xs font-semibold border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <Navigation size={13} /> Maps
          </a>
          <a
            href={accommodation.bookingUrl || `https://www.google.com/travel/hotels?q=${encodeURIComponent((accommodation.name || '') + ' ' + (accommodation.address || ''))}`}
            target="_blank" rel="noopener noreferrer"
            className="flex-1 bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs py-2.5 rounded-full flex items-center justify-center gap-1.5 font-bold transition-colors"
          >
            <CreditCard size={13} /> Book Now
          </a>
        </div>
      </div>
    </div>
  );
}

export default function AIAccommodationCard({ accommodation, rank }) {
  const [showBookModal, setShowBookModal] = useState(false);

  if (!accommodation) return null;

  return (
    <>
      <div className="bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-sm hover:border-slate-400 dark:hover:border-slate-700 transition-all group">
        <div className="flex flex-col sm:flex-row">
          
          {/* Image */}
          <div className="relative sm:w-56 h-44 sm:h-auto overflow-hidden shrink-0">
            <img
              src={accommodation.image || 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&q=80&w=800'}
              alt={accommodation.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
            <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-black/60 text-white backdrop-blur-xs">
              Rank #{rank}
            </div>
            <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-semibold bg-black/60 text-slate-200 backdrop-blur-xs">
              {accommodation.type || 'Hostel'}
            </div>
          </div>

          {/* Body Content */}
          <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {accommodation.name}
                  </h3>
                  <div className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400 mt-1">
                    <MapPin size={11} />
                    <span>{accommodation.distanceKm} km from venue • {accommodation.address || 'Campus Area'}</span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    ₹{accommodation.pricePerNight}
                  </div>
                  <span className="text-[10px] text-slate-400">/ night</span>
                </div>
              </div>

              {/* Amenities */}
              {accommodation.amenities && (
                <div className="flex flex-wrap gap-1.5 mt-3">
                  {accommodation.amenities.slice(0, 4).map(amenity => (
                    <span
                      key={amenity}
                      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400"
                    >
                      {AMENITY_ICONS[amenity] || null}
                      {amenity}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
                <ShieldCheck size={13} className="text-slate-500" />
                <span>Safety Score: <strong>{accommodation.safetyScore}%</strong></span>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={accommodation.mapUrl || `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent((accommodation.name || '') + ' ' + (accommodation.address || ''))}`}
                  target="_blank" rel="noopener noreferrer"
                  className="p-2 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  title="View on Google Maps"
                >
                  <Navigation size={13} />
                </a>
                <button
                  onClick={() => setShowBookModal(true)}
                  className="px-4 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-slate-100 text-xs font-bold transition-colors"
                >
                  Book / Details
                </button>
              </div>
            </div>

          </div>

        </div>
      </div>

      {showBookModal && (
        <BookNowModal accommodation={accommodation} onClose={() => setShowBookModal(false)} />
      )}
    </>
  );
}
