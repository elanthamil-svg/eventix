import React, { useState } from 'react';
import { 
  X, 
  FileText, 
  Download, 
  ExternalLink, 
  Calendar, 
  Trophy, 
  ShieldCheck, 
  CheckCircle2,
  Clock
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/60 backdrop-blur-xs">
      <div 
        className="w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden rounded-2xl bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 shadow-2xl"
      >
        
        {/* Modal Top Toolbar */}
        <div className="p-4 bg-white dark:bg-[#141519] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-700 dark:text-slate-300 shrink-0">
              <FileText className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white truncate">{event.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 shrink-0">
                  Brochure
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{event.collegeName} • Official Document</p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={handleDownloadPdf}
              disabled={downloading}
              className="px-3.5 py-1.5 rounded-full bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              title="Download Brochure as PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
              title="Close Viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6 bg-slate-50 dark:bg-[#0E0E10]">
          
          <div id="brochure-content" className="max-w-3xl mx-auto bg-white dark:bg-[#141519] rounded-xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 space-y-6 shadow-sm">
            
            {/* Header */}
            <div className="border-b border-slate-100 dark:border-slate-800 pb-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-300 text-sm shrink-0">
                    {event.collegeName ? event.collegeName.substring(0, 2).toUpperCase() : 'CC'}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold tracking-wider uppercase text-slate-500">{event.collegeName}</h4>
                    <p className="text-[11px] text-slate-400">Department of Student Affairs</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300 font-semibold text-xs border border-slate-200 dark:border-slate-700 px-2.5 py-1 rounded-full self-start sm:self-auto">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>Verified Document</span>
                </div>
              </div>

              {/* Main Event Poster */}
              {event.poster && (
                <div className="rounded-xl overflow-hidden max-h-64 border border-slate-200 dark:border-slate-800">
                  <img 
                    src={event.poster} 
                    alt={event.title}
                    className="w-full h-full object-cover" 
                  />
                </div>
              )}
            </div>

            {/* Metrics */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Prize Pool</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">{event.prizePool || 'Certificate'}</div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Event Date</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {event.eventDate ? new Date(event.eventDate).toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' }) : 'TBA'}
                </div>
              </div>

              <div className="p-3.5 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 space-y-0.5">
                <span className="text-[11px] text-slate-400 font-medium">Entry Fee</span>
                <div className="text-sm font-bold text-slate-900 dark:text-white">
                  {event.entryFee === 0 ? 'Free Entry' : `₹${event.entryFee}`}
                </div>
              </div>
            </div>

            {/* Overview */}
            <div className="space-y-2 border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Specifications & Summary
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
                {event.description}
              </p>
            </div>

            {/* Rules */}
            <div className="space-y-2.5 border-t border-slate-100 dark:border-slate-800 pt-5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                Guidelines
              </h3>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-slate-600 dark:text-slate-300">
                <li className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Open to all undergraduate & postgraduate students nationwide.</span>
                </li>
                <li className="p-3 rounded-lg border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-500 shrink-0 mt-0.5" />
                  <span>Teams can have 1 to 4 members with cross-college participation allowed.</span>
                </li>
              </ul>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
