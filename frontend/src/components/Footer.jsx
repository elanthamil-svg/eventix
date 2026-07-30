import React from 'react';
import { Sparkles, Heart, Shield, PhoneCall, Mail, MapPin } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          
          {/* Brand & Purpose */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">CampusConnect</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Smart Inter-College Event Discovery platform backed by AI travel safety scoring, personalized event recommendations, and accommodation planning.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Explore</h4>
            <ul className="space-y-2 text-xs">
              <li><Link to="/events" className="hover:text-primary-400 transition-colors">Hackathons & Workshops</Link></li>
              <li><Link to="/events?category=Robotics" className="hover:text-primary-400 transition-colors">Robotics Championships</Link></li>
              <li><Link to="/events?category=Coding" className="hover:text-primary-400 transition-colors">Coding Contests</Link></li>
              <li><Link to="/events?category=Design" className="hover:text-primary-400 transition-colors">UI/UX Summits</Link></li>
            </ul>
          </div>

          {/* Student Safety Helpline */}
          <div>
            <h4 className="text-sm font-semibold text-emerald-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
              <Shield className="w-4 h-4 text-emerald-400" /> Student Safety First
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <PhoneCall className="w-3.5 h-3.5 text-secondary-500" />
                <span>24/7 Helpline: 1800-CAMPUS-SAFE</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <Mail className="w-3.5 h-3.5 text-secondary-500" />
                <span>safety@campusconnect.edu</span>
              </div>
              <div className="flex items-center gap-2 text-slate-300">
                <MapPin className="w-3.5 h-3.5 text-secondary-500" />
                <span>Verified Inter-College Transit Network</span>
              </div>
            </div>
          </div>

          {/* Technology & AI */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Powered By AI</h4>
            <p className="text-xs text-slate-400 leading-relaxed mb-3">
              Driven by Google Gemini 2.5 Flash API for real-time safety reasoning and interest matching.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-[11px] text-primary-400 font-mono">
              ⚡ Gemini API Integrated
            </div>
          </div>

        </div>

        <div className="pt-8 border-t border-slate-800 text-center text-xs text-slate-500 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>© {new Date().getFullYear()} CampusConnect Platform. All rights reserved.</div>
          <div className="flex items-center gap-1">
            Built for college students nationwide with <Heart className="w-3.5 h-3.5 text-red-500 fill-red-500" />
          </div>
        </div>
      </div>
    </footer>
  );
}
