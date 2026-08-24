import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, PhoneCall, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-white dark:bg-[#0D0E11] text-slate-600 dark:text-slate-400 pt-12 pb-8 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="w-full max-w-6xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8 mb-10">
          
          {/* Brand & Purpose */}
          <div className="space-y-3">
            <Link to="/" className="inline-block">
              <span className="text-base font-bold text-slate-900 dark:text-white tracking-tight">
                Eventix
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Inter-college event discovery platform with verified listings, safety analysis, and personalized AI event matching.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Explore
            </h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/events" className="hover:text-slate-900 dark:hover:text-white transition-colors">All Competitions</Link></li>
              <li><Link to="/events?category=Hackathon" className="hover:text-slate-900 dark:hover:text-white transition-colors">Hackathons & Summits</Link></li>
              <li><Link to="/events?category=Coding" className="hover:text-slate-900 dark:hover:text-white transition-colors">Coding Contests</Link></li>
              <li><Link to="/ai-match" className="hover:text-slate-900 dark:hover:text-white transition-colors">AI Match Fest</Link></li>
            </ul>
          </div>

          {/* Student Support & Safety */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Student Safety
            </h4>
            <div className="space-y-2 text-xs text-slate-500 dark:text-slate-400">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Helpline: 1800-CAMPUS-SAFE</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>support@eventix.edu</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                <span>Verified Transit Safety Data</span>
              </div>
            </div>
          </div>

          {/* Platform Intelligence */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Intelligence
            </h4>
            <p className="text-xs leading-relaxed text-slate-500 dark:text-slate-400">
              Personalized semantic ranking and safety scoring evaluated with Gemini AI and local client heuristics.
            </p>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-800 text-[11px] font-semibold text-slate-700 dark:text-slate-300">
              <span>Gemini AI Connected</span>
            </div>
          </div>

        </div>

        {/* Bottom Bar */}
        <div className="pt-6 border-t border-slate-100 dark:border-slate-800/80 text-xs text-slate-400 dark:text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div>© {new Date().getFullYear()} Eventix. All rights reserved.</div>
          <div>Built for college students nationwide</div>
        </div>
      </div>
    </footer>
  );
}
