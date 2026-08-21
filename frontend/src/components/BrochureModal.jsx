import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2,
  Clock,
  BookOpen
} from 'lucide-react';
import { downloadEventBrochurePdf } from '../utils/generateBrochurePdf';

export default function BrochureModal({ event, onClose }) {
  const [viewMode, setViewMode] = useState('doc'); // 'doc' | 'pdf'
  const [downloading, setDownloading] = useState(false);

  if (!event) return null;

  const hasPdfUrl = event.brochure && event.brochure.endsWith('.pdf') && !event.brochure.includes('dummy.pdf');
  const pdfUrl = hasPdfUrl ? event.brochure : null;
  const embedUrl = pdfUrl ? `https://docs.google.com/viewer?url=${encodeURIComponent(pdfUrl)}&embedded=true` : null;

  const handleDownloadPdf = () => {
    try {
      setDownloading(true);
      downloadEventBrochurePdf(event);
      setTimeout(() => setDownloading(false), 1200);
    } catch (err) {
      console.error('Error generating brochure PDF:', err);
      setDownloading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div 
        className="kaggle-card w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl border-purple-500/30"
        style={{ background: '#0F1117' }}
      >
        
        {/* Modal Top Toolbar */}
        <div className="p-4 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-black text-white truncate">{event.title}</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30 shrink-0">
                  Official Brochure
                </span>
              </div>
              <p className="text-[11px] text-slate-400 truncate">{event.collegeName} • Published Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* View Mode Switcher */}
            <div className="hidden sm:flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setViewMode('doc')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewMode === 'doc' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Visual Sheet
              </button>
              <button
                onClick={() => setViewMode('pdf')}
                className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                  viewMode === 'pdf' ? 'bg-purple-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                PDF View
              </button>
            </div>

            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              title="Download Brochure as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          
          {viewMode === 'pdf' ? (
            /* PDF Embedded Iframe Viewer */
            <div className="w-full h-[65vh] rounded-xl overflow-hidden border border-slate-800 bg-slate-900 relative">
              <iframe
                src={embedUrl}
                title="Event Brochure PDF"
                className="w-full h-full border-0"
              />
              <div className="absolute bottom-3 right-3 bg-slate-950/90 backdrop-blur-md px-3 py-1.5 rounded-lg border border-slate-800 text-[11px] text-slate-400 flex items-center gap-2">
                <span>PDF Embedded Viewer</span>
                <a
                  href={pdfUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-kaggle-cyan hover:underline font-bold flex items-center gap-1"
                >
                  <ExternalLink className="w-3 h-3" /> Open Link
                </a>
              </div>
            </div>
          ) : (
            /* Visual Brochure Document Paper Sheet */
            <div id="brochure-content" className="max-w-3xl mx-auto bg-slate-900 rounded-2xl border border-purple-500/30 p-6 sm:p-8 space-y-8 relative overflow-hidden shadow-xl">
              
              {/* Top Watermark / Badge */}
              <div className="absolute top-0 right-0 translate-x-4 -translate-y-4 w-36 h-36 bg-purple-500/5 rounded-full blur-2xl pointer-events-none" />
              
              {/* Brochure Header */}
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
                    <span>Official Verified Pamphlet</span>
                  </div>
                </div>

                {/* Main Poster Image */}
                <div className="relative rounded-xl overflow-hidden h-48 sm:h-64 border border-slate-800">
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

              {/* Event Overview & Key Info Grid */}
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

              {/* Full Description & Rules */}
              <div className="space-y-3 border-t border-slate-800 pt-6">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-400" />
                  <span>Event Overview & Problem Statement</span>
                </h3>
                <p className="text-xs text-slate-300 leading-relaxed whitespace-pre-line bg-slate-950/40 p-4 rounded-xl border border-slate-800/80">
                  {event.description}
                </p>
              </div>

              {/* Rules & Guidelines Section */}
              <div className="space-y-3">
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Rules & Eligibility Requirements</span>
                </h3>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-300">
                  <li className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Open to undergraduate and postgraduate college students across India.</span>
                  </li>
                  <li className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Teams can consist of 1 to 4 members. Cross-college teams are allowed.</span>
                  </li>
                  <li className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Participants must bring valid college ID card during venue check-in.</span>
                  </li>
                  <li className="p-3 rounded-lg bg-slate-950/50 border border-slate-800/60 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <span>Plagiarism or pre-existing code submission leads to immediate disqualification.</span>
                  </li>
                </ul>
              </div>

              {/* Venue & Contact Footer */}
              <div className="p-5 rounded-xl bg-purple-500/5 border border-purple-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6">
                <div>
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Venue Location</div>
                  <div className="text-sm font-bold text-white mt-0.5">{event.venue}</div>
                  <div className="text-xs text-slate-400">{event.location?.address}</div>
                </div>

                <div className="shrink-0 text-left sm:text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-4">
                  <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Student Contact</div>
                  <div className="text-xs font-bold text-purple-400 mt-0.5">{event.contactPerson?.name || 'Event Coordinator'}</div>
                  <div className="text-xs text-slate-400">{event.contactPerson?.phone || '+91 98765 43210'}</div>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Modal Bottom Bar */}
        <div className="p-4 bg-slate-900/90 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-400 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-purple-400" />
            <span>Official Fest Brochure verified by Eventix Engine</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-500 text-white flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Generating & Downloading PDF...' : 'Download PDF'}</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Close
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
