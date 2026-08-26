import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { 
  Sun, 
  Moon, 
  LogOut, 
  ShieldCheck, 
  Menu
} from 'lucide-react';

export default function Navbar({ onToggleSidebar }) {
  const { user, logout, switchRoleDemo, role } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [roleMenuOpen, setRoleMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-white/95 dark:bg-[#121316]/95 backdrop-blur-md border-b border-[#E5E7EB] dark:border-[#1F2023] transition-colors duration-200">
      <div className="w-full px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        
        {/* Left: Brand + Toggle */}
        <div className="flex items-center gap-3">
          {onToggleSidebar && (
            <button
              onClick={onToggleSidebar}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
              title="Toggle Sidebar"
            >
              <Menu className="w-5 h-5 stroke-[1.75]" />
            </button>
          )}

          <Link to="/" className="flex items-center gap-2">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Eventix
            </span>
          </Link>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-2.5">

          {/* Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleMenuOpen(!roleMenuOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-full border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
              title="Switch user role"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span className="capitalize">{role}</span>
            </button>

            {roleMenuOpen && (
              <div className="absolute right-0 mt-2 w-48 rounded-xl bg-white dark:bg-[#15161A] shadow-xl border border-slate-200 dark:border-slate-800 py-1.5 z-50">
                <div className="px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Switch Active Role
                </div>
                <button 
                  onClick={() => { switchRoleDemo('student'); setRoleMenuOpen(false); navigate('/'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${role === 'student' ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Student Mode
                </button>
                <button 
                  onClick={() => { switchRoleDemo('admin'); setRoleMenuOpen(false); navigate('/admin'); }}
                  className={`w-full text-left px-3 py-2 text-xs font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${role === 'admin' ? 'font-bold text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-400'}`}
                >
                  Admin Mode
                </button>
              </div>
            )}
          </div>

          {/* Theme Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 stroke-[1.75]" /> : <Moon className="w-4 h-4 stroke-[1.75]" />}
          </button>

          {/* User Profile / Sign In */}
          {user ? (
            <div className="flex items-center gap-2">
              <Link to="/dashboard">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
                  {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                </div>
              </Link>
              <button 
                onClick={handleLogout}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4 stroke-[1.75]" />
              </button>
            </div>
          ) : (
            <Link 
              to="/login" 
              className="bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 text-xs font-semibold px-4 py-1.5 rounded-full transition-colors"
            >
              Sign in
            </Link>
          )}

        </div>

      </div>
    </header>
  );
}
