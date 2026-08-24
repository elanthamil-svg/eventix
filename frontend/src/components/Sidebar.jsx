import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Trophy, 
  Sparkles, 
  LayoutDashboard, 
  ShieldCheck, 
  Home,
  ChevronRight,
  User,
  Compass
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Sidebar({ isOpen, onClose }) {
  const location = useLocation();
  const { role, user } = useAuth();

  const isActive = (path) => {
    if (path === '/events' && location.pathname === '/events') return true;
    if (path === '/' && location.pathname === '/') return true;
    return location.pathname + location.search === path || location.pathname === path;
  };

  const handleNavClick = () => {
    if (onClose) onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile Backdrop */}
      <div 
        className="fixed inset-0 bg-black/30 backdrop-blur-xs z-40 md:hidden"
        onClick={onClose} 
      />

      <aside className="fixed top-16 left-0 bottom-0 z-40 w-64 bg-[#F7F7F8] dark:bg-[#121316] border-r border-[#E5E7EB] dark:border-[#1F2023] flex flex-col justify-between shrink-0 overflow-y-auto shadow-xl md:shadow-none md:sticky md:top-16 md:self-start md:h-[calc(100vh-4rem)] md:z-30 transition-colors duration-200">
        
        <div className="p-4 space-y-6">
          
          {/* Main Navigation */}
          <div className="space-y-1">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Menu
            </div>

            {role === 'student' && (
              <>
                <Link
                  to="/dashboard"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/dashboard') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <LayoutDashboard className="w-4 h-4 stroke-[1.75]" />
                    <span>Dashboard</span>
                  </div>
                </Link>

                <Link
                  to="/"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4 stroke-[1.75]" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/events"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/events') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 stroke-[1.75]" />
                  <span>Explore Events</span>
                </Link>

                <Link
                  to="/ai-match"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/ai-match')
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Sparkles className="w-4 h-4 stroke-[1.75]" />
                    <span>AI Match Fest</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold">
                    AI
                  </span>
                </Link>
              </>
            )}

            {role === 'admin' && (
              <>
                <Link
                  to="/admin"
                  onClick={handleNavClick}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShieldCheck className="w-4 h-4 stroke-[1.75]" />
                    <span>Admin Moderation</span>
                  </div>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold">
                    Admin
                  </span>
                </Link>

                <Link
                  to="/admin/profile"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/admin/profile')
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <User className="w-4 h-4 stroke-[1.75]" />
                  <span>My Profile</span>
                </Link>

                <Link
                  to="/"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Home className="w-4 h-4 stroke-[1.75]" />
                  <span>Home</span>
                </Link>

                <Link
                  to="/events"
                  onClick={handleNavClick}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive('/events') 
                      ? 'bg-[#EAEAEA] dark:bg-[#1E1F24] text-slate-900 dark:text-white font-semibold' 
                      : 'text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  <Trophy className="w-4 h-4 stroke-[1.75]" />
                  <span>All Events</span>
                </Link>
              </>
            )}

          </div>

          {/* Categories / Technical Domains */}
          <div className="space-y-1 pt-4 border-t border-[#E5E7EB] dark:border-[#1F2023]">
            <div className="px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
              Categories
            </div>
            {['Hackathons', 'AI & ML', 'Robotics', 'Coding', 'Design'].map((domain) => (
              <Link
                key={domain}
                to={`/events?category=${encodeURIComponent(domain.replace('AI & ML', 'AI'))}`}
                onClick={handleNavClick}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-400 hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <span>{domain}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-400 stroke-[1.5]" />
              </Link>
            ))}
          </div>

        </div>

        {/* User Account Footer */}
        <div className="p-3 border-t border-[#E5E7EB] dark:border-[#1F2023] bg-[#F7F7F8] dark:bg-[#121316]">
          <div className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-[#EFEFF0] dark:hover:bg-[#18191E] transition-colors">
            <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="truncate flex-1 min-w-0">
              <div className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                {user?.name || 'Aarav Sharma'}
              </div>
              <div className="text-[11px] text-slate-500 dark:text-slate-400 capitalize">
                {role} account
              </div>
            </div>
          </div>
        </div>

      </aside>
    </>
  );
}
