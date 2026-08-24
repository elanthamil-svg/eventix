/**
 * SingleRouteMap.jsx — Google Maps–style Route Display
 * Uses real Google Maps tiles + Leaflet + OSRM routing (no API key needed).
 */
import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// ── Fix Leaflet default icon paths ──────────────────────────────────
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// ── Google-style markers ──────────────────────────────────────────
function makeGoogleOriginIcon() {
  return L.divIcon({
    className: '',
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -18],
    html: `<div style="
      width:32px;height:32px;border-radius:50%;
      background:#34A853;border:3px solid #fff;
      box-shadow:0 2px 8px rgba(0,0,0,0.35);
      display:flex;align-items:center;justify-content:center;
      font-weight:900;font-size:14px;color:#fff;
      font-family:'Google Sans',Roboto,Arial,sans-serif;">A</div>`
  });
}

function makeGoogleDestIcon() {
  return L.divIcon({
    className: '',
    iconSize: [28, 40],
    iconAnchor: [14, 40],
    popupAnchor: [0, -42],
    html: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 36" width="28" height="40">
      <path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 24 12 24S24 20.25 24 12C24 5.37 18.63 0 12 0z" fill="#EA4335"/>
      <circle cx="12" cy="12" r="5" fill="#fff"/>
    </svg>`
  });
}

// ── Helper formatters ─────────────────────────────────────────────
function fmtDuration(mins) {
  if (!mins) return '–';
  if (mins < 60) return `${mins} min`;
  const h = Math.floor(mins / 60), m = mins % 60;
  return m > 0 ? `${h} hr ${m} min` : `${h} hr`;
}
function fmtETA(mins) {
  if (!mins) return '–';
  const d = new Date(); d.setMinutes(d.getMinutes() + mins);
  return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function SingleRouteMap({
  originLat = 13.0827,
  originLng = 80.2707,
  originName = 'Your Location',
  venueLat = 17.4455,
  venueLng = 78.3489,
  venueName = 'Host College Venue',
  mode = 'car',
  onRouteCalculated
}) {
  const containerRef = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const cbRef = useRef(onRouteCalculated);
  const [state, setState] = useState('loading'); // loading | ready | error
  const [info, setInfo] = useState(null);
  const [showSteps, setShowSteps] = useState(false);

  useEffect(() => { cbRef.current = onRouteCalculated; }, [onRouteCalculated]);

  // ── Init map once ─────────────────────────────────────────────
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = L.map(containerRef.current, {
      center: [15.5, 79.5],
      zoom: 6,
      zoomControl: false,
      attributionControl: true,
    });

    // Real Google Maps tiles
    L.tileLayer(
      'https://mt{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}',
      { subdomains: '0123', maxZoom: 20, attribution: '© Google' }
    ).addTo(map);

    // Leaflet zoom control positioned like Google Maps (bottom right)
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    layerRef.current = L.layerGroup().addTo(map);
    mapRef.current = map;

    return () => {
      map.remove();
      mapRef.current = null;
      layerRef.current = null;
    };
  }, []);

  // ── Fetch & draw route when coordinates change ────────────────
  useEffect(() => {
    const map = mapRef.current;
    const layers = layerRef.current;
    if (!map || !layers) return;

    let cancelled = false;
    setState('loading');
    setInfo(null);
    layers.clearLayers();

    const sLat = Number(originLat) || 13.0827;
    const sLng = Number(originLng) || 80.2707;
    const eLat = Number(venueLat) || 12.9915;
    const eLng = Number(venueLng) || 80.2337;

    map.setView([(sLat + eLat) / 2, (sLng + eLng) / 2], 7);
    setTimeout(() => map.invalidateSize(), 120);

    const osrmUrl =
      `https://router.project-osrm.org/route/v1/driving/${sLng},${sLat};${eLng},${eLat}` +
      `?overview=full&geometries=geojson&steps=true&annotations=false`;

    fetch(osrmUrl)
      .then(r => r.json())
      .then(data => {
        if (cancelled) return;
        if (data.code !== 'Ok' || !data.routes?.[0]) { setState('error'); return; }

        const route = data.routes[0];
        const coords = route.geometry.coordinates.map(([lng, lat]) => [lat, lng]);
        const distKm = Math.round(route.distance / 1000);
        const durMins = Math.round(route.duration / 60);

        // ── Draw route: shadow + blue line (Google Maps look) ──
        L.polyline(coords, { color: '#fff', weight: 10, opacity: 0.55, lineCap: 'round', lineJoin: 'round' }).addTo(layers);
        L.polyline(coords, { color: '#1A73E8', weight: 6, opacity: 1, lineCap: 'round', lineJoin: 'round' }).addTo(layers);

        // ── Origin pin (green circle A) ──
        L.marker([sLat, sLng], { icon: makeGoogleOriginIcon(), zIndexOffset: 1000 })
          .bindPopup(`<b>Start:</b> ${originName}`, { className: 'gmaps-popup' })
          .addTo(layers);

        // ── Destination pin (red teardrop) ──
        L.marker([eLat, eLng], { icon: makeGoogleDestIcon(), zIndexOffset: 1000 })
          .bindPopup(`<b>Destination:</b> ${venueName}`, { className: 'gmaps-popup' })
          .addTo(layers);

        // ── Fit map to route ──
        const line = L.polyline(coords);
        map.fitBounds(line.getBounds(), { padding: [80, 80], maxZoom: 13, animate: true });

        // ── Parse steps ──
        const steps = route.legs[0]?.steps?.map(s => ({
          name: s.name || 'Continue',
          distance: s.distance > 999 ? `${(s.distance / 1000).toFixed(1)} km` : `${Math.round(s.distance)} m`,
          duration: `${Math.round(s.duration / 60)} min`,
          maneuver: s.maneuver?.type || ''
        })) || [];

        setInfo({ distKm, durMins, steps, distText: `${distKm} km`, durText: fmtDuration(durMins) });

        if (cbRef.current) cbRef.current({ distanceKm: distKm, durationMins: durMins });
        setState('ready');
      })
      .catch(() => { if (!cancelled) setState('error'); });

    return () => { cancelled = true; };
  }, [originLat, originLng, originName, venueLat, venueLng, venueName]);

  const mapsUrl =
    `https://www.google.com/maps/dir/?api=1&origin=${originLat},${originLng}&destination=${venueLat},${venueLng}&travelmode=driving`;

  const gmStyle = {
    fontFamily: "'Google Sans',Roboto,Arial,sans-serif",
    letterSpacing: 0
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: 480, background: '#e8eaed', ...gmStyle }}>

      {/* ── Map canvas ──────────────────────────── */}
      <div ref={containerRef} style={{ position: 'absolute', inset: 0, zIndex: 0 }} />

      {/* ── Google-style popup CSS ───────────────  */}
      <style>{`
        .gmaps-popup .leaflet-popup-content-wrapper {
          border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.2);
          padding: 0; font-family: 'Google Sans',Roboto,Arial,sans-serif;
        }
        .gmaps-popup .leaflet-popup-content { margin: 10px 14px; font-size: 13px; color: #202124; }
        .leaflet-control-attribution { font-size: 9px !important; }
      `}</style>

      {/* ── Loading overlay ──────────────────────── */}
      {state === 'loading' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(232,234,237,0.85)', backdropFilter: 'blur(2px)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
          <div style={{ width: 40, height: 40, border: '4px solid #E8EAED', borderTop: '4px solid #1A73E8', borderRadius: '50%', animation: 'gmspin 0.85s linear infinite' }} />
          <span style={{ fontSize: 13, color: '#5F6368', fontWeight: 500 }}>Getting directions…</span>
          <style>{`@keyframes gmspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {/* ── Error overlay ────────────────────────── */}
      {state === 'error' && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 20, background: 'rgba(232,234,237,0.9)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 24 }}>⚠️</div>
          <p style={{ fontSize: 14, fontWeight: 600, color: '#202124' }}>Directions unavailable</p>
          <p style={{ fontSize: 12, color: '#5F6368' }}>Check your connection and try again</p>
        </div>
      )}

      {/* ── TOP: Route header (Google Maps style) ── */}
      {state === 'ready' && info && (
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, background: '#fff', boxShadow: '0 2px 6px rgba(0,0,0,0.18)', padding: '10px 14px 9px' }}>

          {/* Origin & Destination with connector dots */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 9 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#34A853', border: '2px solid #fff', boxShadow: '0 0 0 2px #34A853' }} />
              <div style={{ width: 1.5, height: 16, background: '#DADCE0' }} />
              <svg width="10" height="14" viewBox="0 0 24 36"><path d="M12 0C5.37 0 0 5.37 0 12c0 8.25 12 24 12 24S24 20.25 24 12C24 5.37 18.63 0 12 0z" fill="#EA4335"/></svg>
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 12, color: '#5F6368', fontWeight: 500, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {originName}
              </div>
              <div style={{ fontSize: 12.5, color: '#202124', fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', marginTop: 11 }}>
                {venueName}
              </div>
            </div>

            <div style={{ flexShrink: 0, textAlign: 'right' }}>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A73E8', lineHeight: 1.1 }}>{info.durText}</div>
              <div style={{ fontSize: 11, color: '#5F6368', marginTop: 2 }}>{info.distText} · ETA {fmtETA(info.durMins)}</div>
            </div>
          </div>

          {/* Chips row */}
          <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 11px', borderRadius: 20, background: mode === 'bike' ? '#E6FFFA' : '#E8F0FE', color: mode === 'bike' ? '#0D9488' : '#1A73E8', fontSize: 11, fontWeight: 600, border: mode === 'bike' ? '1px solid #99F6E4' : '1px solid #BFDBFE' }}>
              {mode === 'bike' ? 'Via 2-Wheeler Paved Arterial' : 'Via Fastest Highway'}
            </span>
            {info.steps.length > 0 && (
              <button
                onClick={() => setShowSteps(v => !v)}
                style={{ marginLeft: 'auto', padding: '3px 11px', borderRadius: 20, background: '#F1F3F4', color: '#3C4043', fontSize: 11, fontWeight: 600, border: 'none', cursor: 'pointer' }}>
                {showSteps ? '▲ Hide steps' : '▾ Show steps'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* ── Turn-by-turn steps panel ─────────────── */}
      {state === 'ready' && showSteps && info?.steps?.length > 0 && (
        <div style={{ position: 'absolute', top: 127, left: 0, right: 0, zIndex: 15, maxHeight: 220, overflowY: 'auto', background: '#fff', borderTop: '1px solid #E8EAED', boxShadow: '0 4px 12px rgba(0,0,0,0.13)' }}>
          {info.steps.map((step, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '8px 14px', borderBottom: '1px solid #F1F3F4' }}>
              <div style={{ flexShrink: 0, width: 24, height: 24, borderRadius: '50%', background: '#E8F0FE', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: '#1A73E8', marginTop: 1 }}>
                {i + 1}
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 12.5, color: '#202124', fontWeight: 500, lineHeight: 1.45 }}>{step.name}</div>
                <div style={{ fontSize: 10.5, color: '#5F6368', marginTop: 2 }}>{step.distance} · {step.duration}</div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── BOTTOM: Google Maps–style info bar ────── */}
      {state === 'ready' && info && (
        <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, zIndex: 10, background: '#fff', boxShadow: '0 -2px 8px rgba(0,0,0,0.13)', padding: '10px 14px 12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>

            {/* Stats */}
            <div style={{ display: 'flex', gap: 18, alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>{info.durText}</div>
                <div style={{ fontSize: 11, color: '#5F6368', marginTop: 2 }}>in current traffic</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#E8EAED' }} />
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#202124', lineHeight: 1.1 }}>{info.distText}</div>
                <div style={{ fontSize: 11, color: '#5F6368', marginTop: 2 }}>total distance</div>
              </div>
              <div style={{ width: 1, height: 32, background: '#E8EAED' }} />
              <div>
                <div style={{ fontSize: 19, fontWeight: 700, color: '#1A73E8', lineHeight: 1.1 }}>{fmtETA(info.durMins)}</div>
                <div style={{ fontSize: 11, color: '#5F6368', marginTop: 2 }}>arrival time</div>
              </div>
            </div>

            {/* Open in Google Maps button */}
            <a
              href={mapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '9px 18px', borderRadius: 22, background: '#1A73E8', color: '#fff', fontSize: 12.5, fontWeight: 700, textDecoration: 'none', boxShadow: '0 1px 5px rgba(26,115,232,0.35)', whiteSpace: 'nowrap', flexShrink: 0 }}>
              <svg viewBox="0 0 24 24" width="14" height="14" fill="white" style={{ flexShrink: 0 }}>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/>
              </svg>
              Open in Maps
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
