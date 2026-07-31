import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  LayoutDashboard, 
  PlusCircle, 
  ShieldCheck, 
  Compass, 
  Home,
  Bookmark,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen }) {
  const location = useLocation();
  const { role, user } = useAuth();

  const isActive = (path) => {
    if (path === '/events' && location.pathname === '/events') return true;
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname + location.search === path || location.pathname === path;
  };

  return (
    <aside className={`w-72 bg-white dark:bg-kaggle-darkcard border-r border-slate-200 dark:border-slate-800 flex flex-col justify-between shrink-0 transition-all duration-200 ${isOpen ? 'block' : 'hidden md:block'}`}>
      
      <div className="p-5 space-y-6">
        
        {/* Navigation Section */}
        <div className="space-y-2">
          <div className="px-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-3">
            Menu Navigation
          </div>

          {/* STUDENT ROLE LINKS */}
          {role === 'student' && (
            <>
              {/* Dashboard Placed ABOVE Home as requested */}
              <Link
                to="/dashboard"
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive('/dashboard') 
                    ? 'bg-kaggle-cyan text-slate-950 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <LayoutDashboard className="w-5 h-5" />
                  <span>Student Dashboard</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded-md bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-mono">
                  Interests
                </span>
              </Link>

              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/events"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/events') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>Explore Events & Fests</span>
              </Link>

              <Link
                to="/ai-match"
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/ai-match')
                    ? 'bg-gradient-to-r from-kaggle-cyan to-purple-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
                style={isActive('/ai-match') ? {} : {}}
              >
                <div className="flex items-center gap-3">
                  <Sparkles className="w-5 h-5 text-kaggle-cyan" />
                  <span>AI Match Fest</span>
                </div>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-black uppercase"
                  style={{ background: 'rgba(32,190,255,0.12)', color: '#20BEFF', border: '1px solid rgba(32,190,255,0.25)' }}>
                  NEW
                </span>
              </Link>
            </>
          )}

          {/* ORGANIZER ROLE LINKS */}
          {role === 'organizer' && (
            <>
              <Link
                to="/organizer"
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive('/organizer') 
                    ? 'bg-kaggle-cyan text-slate-950 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <PlusCircle className="w-5 h-5" />
                  <span>Organizer Hub</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-mono">
                  Host
                </span>
              </Link>

              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/events"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/events') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>Explore Events Marketplace</span>
              </Link>
            </>
          )}

          {/* ADMIN ROLE LINKS */}
          {role === 'admin' && (
            <>
              <Link
                to="/admin"
                className={`flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                  isActive('/admin') 
                    ? 'bg-kaggle-cyan text-slate-950 shadow-sm' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShieldCheck className="w-5 h-5" />
                  <span>Admin Moderation</span>
                </div>
                <span className="text-xs px-2 py-0.5 rounded bg-amber-500/20 text-amber-400 font-mono">
                  Admin
                </span>
              </Link>

              <Link
                to="/"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Home className="w-5 h-5" />
                <span>Home</span>
              </Link>

              <Link
                to="/events"
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all ${
                  isActive('/events') 
                    ? 'bg-kaggle-lightcyan/60 dark:bg-kaggle-cyan/10 text-kaggle-darkblue dark:text-kaggle-cyan font-bold' 
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Trophy className="w-5 h-5" />
                <span>All Competitions</span>
              </Link>
            </>
          )}

        </div>

        {/* Technical Domain Shortcuts */}
        <div className="space-y-2 pt-4 border-t border-slate-200 dark:border-slate-800">
          <div className="px-3 text-xs font-extrabold uppercase tracking-wider text-slate-400 mb-2">
            Technical Domains
          </div>
          {['Hackathons', 'Artificial Intelligence', 'Robotics', 'Coding Contests', 'UI/UX Design'].map((domain) => (
            <Link
              key={domain}
              to={`/events?category=${encodeURIComponent(domain.replace('Artificial ', '').replace(' Contests', ''))}`}
              className="flex items-center justify-between px-3.5 py-2 rounded-lg text-sm text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              <span>{domain}</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </Link>
          ))}
        </div>

      </div>

      {/* Active User Card Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
        <div className="flex items-center gap-3">
          <img 
            src={user?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
            alt={user?.name} 
            className="w-9 h-9 rounded-full border-2 border-kaggle-cyan object-cover"
          />
          <div className="truncate">
            <div className="text-sm font-bold text-slate-900 dark:text-white truncate">{user?.name || 'Aarav Sharma'}</div>
            <div className="text-xs text-kaggle-cyan font-semibold capitalize">{role} Account</div>
          </div>
        </div>
      </div>

    </aside>
  );
}
