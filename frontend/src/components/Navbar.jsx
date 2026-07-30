import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sparkles, 
  Search, 
  Sun, 
  Moon, 
  LogOut, 
  ShieldCheck, 
  PlusCircle, 
  Menu,
  Trophy,
  LayoutDashboard
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, switchRoleDemo, role, isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [searchVal, setSearchVal] = useState('');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchVal)}`);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-kaggle-darkcard/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Left Brand & Sidebar Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Toggle Sidebar"
            >
              <Menu className="w-6 h-6" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-9 h-9 rounded-xl bg-kaggle-cyan flex items-center justify-center font-black text-slate-950 text-xl shadow-sm group-hover:scale-105 transition-transform">
              K
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white font-sans">
              Campus<span className="text-kaggle-cyan">Connect</span>
            </span>
          </Link>
        </div>

        {/* Global Search Bar */}
        <form onSubmit={handleSearch} className="hidden sm:flex items-center flex-1 max-w-md relative">
          <Search className="absolute left-3.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search inter-college events, hackathons, colleges..."
            value={searchVal}
            onChange={(e) => setSearchVal(e.target.value)}
            className="w-full pl-10 pr-12 py-2 bg-slate-100 dark:bg-slate-900 border border-transparent focus:border-kaggle-cyan text-sm rounded-full text-slate-900 dark:text-white focus:outline-none placeholder-slate-400"
          />
          <kbd className="absolute right-3.5 px-1.5 py-0.5 text-xs font-mono text-slate-400 bg-slate-200 dark:bg-slate-800 rounded">
            /
          </kbd>
        </form>

        {/* Desktop Quick Nav Links strictly based on role */}
        <nav className="hidden lg:flex items-center space-x-2">
          {role === 'student' && (
            <Link 
              to="/dashboard" 
              className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-1.5 transition-colors ${
                isActive('/dashboard') 
                  ? 'bg-kaggle-cyan text-slate-950' 
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Student Dashboard</span>
            </Link>
          )}

          <Link 
            to="/events" 
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold transition-colors ${
              isActive('/events') 
                ? 'text-kaggle-cyan font-bold' 
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            Explore Events
          </Link>

          {role === 'organizer' && (
            <Link 
              to="/organizer" 
              className={`px-3 py-1.5 rounded-lg text-sm font-bold text-emerald-500 hover:bg-emerald-500/10 transition-colors ${
                isActive('/organizer') ? 'bg-emerald-500/20' : ''
              }`}
            >
              Event Manager Hub
            </Link>
          )}

          {role === 'admin' && (
            <Link 
              to="/admin" 
              className={`px-3 py-1.5 rounded-lg text-sm font-bold text-amber-500 hover:bg-amber-500/10 transition-colors ${
                isActive('/admin') ? 'bg-amber-500/20' : ''
              }`}
            >
              Admin Moderation
            </Link>
          )}
        </nav>

        {/* Right Controls: Role Switcher & Profile */}
        <div className="flex items-center gap-3">

          {/* Quick Create Button for Organizers */}
          {role === 'organizer' && (
            <Link
              to="/organizer"
              className="kaggle-btn-primary hidden sm:flex text-xs px-3.5 py-1.5 font-bold"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          )}

          {/* Demo Role Switcher Dropdown */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-full bg-slate-100 dark:bg-slate-900 text-slate-800 dark:text-slate-200 border border-slate-300 dark:border-slate-700 hover:border-kaggle-cyan transition-colors"
              title="Switch user role"
            >
              <ShieldCheck className="w-4 h-4 text-kaggle-cyan" />
              <span className="capitalize">{role} Mode</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200 dark:border-slate-800 py-2 z-50">
                <div className="px-3.5 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role
                </div>
                <button 
                  onClick={() => { switchRoleDemo('student'); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-kaggle-cyan/10 ${role === 'student' ? 'text-kaggle-cyan font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  🎓 Student Mode
                </button>
                <button 
                  onClick={() => { switchRoleDemo('organizer'); setRoleMenuOpen(false); navigate('/organizer'); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-kaggle-cyan/10 ${role === 'organizer' ? 'text-kaggle-cyan font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  📢 Event Manager Mode
                </button>
                <button 
                  onClick={() => { switchRoleDemo('admin'); setRoleMenuOpen(false); }}
                  className={`w-full text-left px-3.5 py-2 text-xs font-bold hover:bg-kaggle-cyan/10 ${role === 'admin' ? 'text-kaggle-cyan font-extrabold' : 'text-slate-700 dark:text-slate-300'}`}
                >
                  🛡️ Admin Moderator Mode
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle Dark / Light Mode"
          >
            {isDark ? <Sun className="w-5 h-5 text-accent-400" /> : <Moon className="w-5 h-5 text-slate-700" />}
          </button>

          {/* User Profile */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <img 
                  src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=400'} 
                  alt={user.name} 
                  className="w-9 h-9 rounded-full border-2 border-kaggle-cyan object-cover shadow-sm"
                />
              </Link>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="kaggle-btn-primary text-xs px-4 py-2 font-bold"
            >
              Sign In
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
