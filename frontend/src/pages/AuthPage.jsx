import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  Zap,
  Sun,
  Moon,
  Check,
  Building2,
  UserCheck
} from 'lucide-react';

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    Icon: GraduationCap,
    badge: 'Student Portal',
    description: 'Discover events, register for fests, and get AI-powered recommendations tailored to your academic profile.',
    redirectTo: '/',
    demoEmail: 'student@campusconnect.edu',
    demoPwd: 'demo123',
    features: [
      'Personalized AI Event Matching',
      'Instant Digital QR Entry Passes',
      'Travel Safety & Accommodation Guide'
    ]
  },
  {
    key: 'admin',
    label: 'Admin',
    Icon: ShieldCheck,
    badge: 'Admin Console',
    description: 'Create & manage events, review registrations, track live fest analytics, and oversee platform moderation.',
    redirectTo: '/admin',
    demoEmail: 'admin@campusconnect.edu',
    demoPwd: 'demo123',
    features: [
      'Event Creation & Moderation',
      'Real-time Analytics & Revenue',
      'Participant & Verification Management'
    ]
  }
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register, switchRoleDemo } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [step, setStep] = useState('select-role'); // 'select-role' | 'form'
  const [selectedRole, setSelectedRole] = useState(null);
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
    setEmail(role.demoEmail);
    setPassword(role.demoPwd);
    setStep('form');
    setError('');
  };

  const handleQuickDemo = (roleKey) => {
    const roleObj = ROLES.find(r => r.key === roleKey);
    switchRoleDemo(roleKey);
    navigate(roleObj ? roleObj.redirectTo : '/');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isLogin) {
        res = await login(email, password, selectedRole?.key || 'student');
      } else {
        res = await register({
          name,
          email,
          password,
          role: selectedRole?.key || 'student',
          college: college || 'National Institute of Technology'
        });
      }
      if (res?.success) {
        navigate(selectedRole?.redirectTo || '/');
      } else {
        setError('Invalid credentials. Try the 1-Click Demo Access.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FAFAFA] dark:bg-[#0D0E11] text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-200">
      
      {/* ─── Top Header (Home Page Navbar style) ─── */}
      <header className="w-full border-b border-slate-200 dark:border-slate-800/80 bg-white/80 dark:bg-[#121316]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="text-lg font-bold tracking-tight text-slate-900 dark:text-white">
              Eventix
            </span>
          </Link>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            title="Toggle theme"
          >
            {isDark ? <Sun className="w-4 h-4 stroke-[1.75]" /> : <Moon className="w-4 h-4 stroke-[1.75]" />}
          </button>
        </div>
      </header>

      {/* ─── Main Body ─── */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 flex flex-col justify-center">
        
        {/* ─── Hero Section ─── */}
        <div className="text-center space-y-3 max-w-2xl mx-auto mb-8 sm:mb-10">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
            Connect. Compete. Achieve.
          </h1>

          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 font-normal leading-relaxed">
            Discover inter-college fests, hackathons, and competitions — matched to your academic profile with AI.
          </p>
        </div>

        {/* ─── Content Container ─── */}
        <div className="w-full">
          <AnimatePresence mode="wait">
            {step === 'select-role' ? (
              /* ── Step 1: Neatly Organized 2-Column Role Selection ── */
              <motion.div
                key="select-role"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    Welcome back
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select your access module to continue
                  </p>
                </div>

                {/* 2-Column Grid for Student & Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-4xl mx-auto">
                  {ROLES.map((r) => {
                    const RoleIcon = r.Icon;
                    return (
                      <div
                        key={r.key}
                        className="bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 hover:border-slate-400 dark:hover:border-slate-700 hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
                      >
                        {/* Top Header */}
                        <div>
                          <div className="flex items-center justify-between gap-3 mb-4">
                            <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-900 dark:text-white group-hover:scale-105 transition-transform">
                              <RoleIcon className="w-5 h-5 stroke-[1.75]" />
                            </div>
                            <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50">
                              {r.badge}
                            </span>
                          </div>

                          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                            {r.label} Module
                          </h3>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed min-h-[40px]">
                            {r.description}
                          </p>

                          {/* Features List */}
                          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 space-y-2">
                            {r.features.map((feat) => (
                              <div key={feat} className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
                                <Check className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0 stroke-[2.5]" />
                                <span>{feat}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="space-y-2.5 pt-2">
                          <button
                            type="button"
                            onClick={() => handleRoleSelect(r)}
                            className="w-full py-2.5 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Enter as {r.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => handleQuickDemo(r.key)}
                            className="w-full py-2 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1A1B20] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                          >
                            <Zap className="w-3 h-3 text-amber-500 fill-amber-500" />
                            <span>1-Click Demo Login</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Select any module above or use 1-Click Demo for instant access.</span>
                  </span>
                </div>
              </motion.div>
            ) : (
              /* ── Step 2: Login / Register Form (Centered & Neatly Organized) ── */
              <motion.div
                key="form-step"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="max-w-md mx-auto bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-sm space-y-6"
              >
                {/* Back button + Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={() => { setStep('select-role'); setError(''); }}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    <ArrowRight className="w-3.5 h-3.5 rotate-180" />
                    <span>Back to Modules</span>
                  </button>

                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-semibold text-slate-800 dark:text-slate-200">
                    {selectedRole && <selectedRole.Icon className="w-3.5 h-3.5 stroke-[2]" />}
                    <span>{selectedRole?.label} Portal</span>
                  </div>
                </div>

                {/* Pill Segmented Switcher */}
                <div className="flex p-1 bg-slate-100 dark:bg-[#1A1B20] border border-slate-200 dark:border-slate-800 rounded-full">
                  <button
                    type="button"
                    onClick={() => { setIsLogin(true); setError(''); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      isLogin
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => { setIsLogin(false); setError(''); }}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-full transition-all cursor-pointer ${
                      !isLogin
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    Create Account
                  </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                  {!isLogin && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          Full Name
                        </label>
                        <input
                          type="text"
                          required
                          value={name}
                          onChange={e => setName(e.target.value)}
                          placeholder="e.g. Aarav Sharma"
                          className="kaggle-input"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                          College / Institution
                        </label>
                        <div className="relative">
                          <Building2 className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input
                            type="text"
                            required
                            value={college}
                            onChange={e => setCollege(e.target.value)}
                            placeholder="e.g. National Institute of Technology"
                            className="kaggle-input pl-10"
                          />
                        </div>
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        placeholder="you@college.edu"
                        className="kaggle-input pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="••••••••"
                        className="kaggle-input pl-10 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-xl border border-rose-200 dark:border-rose-900/50 bg-rose-50 dark:bg-rose-950/20 text-xs text-rose-600 dark:text-rose-400 font-medium">
                      {error}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                    ) : (
                      <>
                        <span>{isLogin ? `Sign In as ${selectedRole?.label}` : 'Create Account'}</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </form>

                {/* Instant Demo Access */}
                <div className="pt-1">
                  <div className="relative flex py-2 items-center">
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                    <span className="flex-shrink mx-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                      Or Instant Access
                    </span>
                    <div className="flex-grow border-t border-slate-200 dark:border-slate-800"></div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleQuickDemo(selectedRole?.key || 'student')}
                    className="w-full mt-2 py-2.5 rounded-full border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-[#1A1B20] text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span>1-Click Demo Login as {selectedRole?.label}</span>
                  </button>
                </div>

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Highlights / Stat Pills ─── */}
        <div className="mt-12 pt-8 border-t border-slate-200 dark:border-slate-800/80 max-w-4xl mx-auto w-full">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            {[
              { label: 'Active Colleges', val: '500+' },
              { label: 'Prize Pool', val: '₹25L+' },
              { label: 'AI Match Rate', val: '97%' },
              { label: 'Digital Passes', val: 'Instant QR' }
            ].map(item => (
              <div key={item.label} className="p-3 rounded-xl bg-white dark:bg-[#141519] border border-slate-200 dark:border-slate-800/80">
                <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
                  {item.val}
                </div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                  {item.label}
                </div>
              </div>
            ))}
          </div>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-6">
            {['Hackathons', 'Symposiums', 'Travel Safety & Stay', 'AI Team Matching', 'Verified Hosts'].map(tag => (
              <span
                key={tag}
                className="px-3 py-1 rounded-full text-xs font-medium border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#141519] text-slate-600 dark:text-slate-400"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>

      </main>

      {/* ─── Minimal Footer ─── */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-slate-200 dark:border-slate-800/80">
        Eventix &copy; {new Date().getFullYear()} — Smart Inter-College Fest Platform
      </footer>

    </div>
  );
}
