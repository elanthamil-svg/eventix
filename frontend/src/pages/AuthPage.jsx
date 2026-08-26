import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  Check,
  UserCheck
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const DOMAINS = ['All', 'Hackathon', 'AI', 'Robotics', 'Coding', 'Design', 'Workshop'];

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    Icon: GraduationCap,
    badge: 'Student Portal',
    description: 'Discover events, register for fests, and get AI-powered recommendations tailored to your academic profile.',
    redirectTo: '/',
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
    features: [
      'Event Creation & Moderation',
      'Real-time Analytics & Revenue',
      'Participant & Verification Management'
    ]
  }
];

export default function AuthPage() {
  const navigate = useNavigate();
  const { login, register } = useAuth();

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
    setEmail('');
    setPassword('');
    setName('');
    setCollege('');
    setStep('form');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      if (isLogin) {
        const res = await login(email, password, selectedRole?.key || 'student');
        if (res?.success) {
          navigate(selectedRole?.redirectTo || '/');
        } else {
          setError('Invalid credentials. Please check your email and password.');
        }
      } else {
        const res = await register({
          name,
          email,
          password,
          role: selectedRole?.key || 'student',
          college: college || 'National Institute of Technology'
        });
        if (res?.success) {
          navigate(selectedRole?.redirectTo || '/');
        } else {
          setError(res?.message || 'Registration failed. Please try again.');
        }
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#FAFAFA] dark:bg-[#0D0E11] text-[#111827] dark:text-[#F3F4F6] transition-colors duration-200">
      
      {/* Unified Navbar from Home */}
      <Navbar />

      {/* Main Body with same Max Width & Spacing as Home */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10 flex flex-col justify-center">
        
        {/* ─── Hero Section (Identical typography & layout as HomePage) ─── */}
        <div className="relative text-center max-w-3xl mx-auto pt-4 sm:pt-8 pb-6">
          <motion.h1
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12] sm:leading-[1.14]"
          >
            Discover college fests,{<br className="hidden sm:inline" />}{' '}
            <span>competitions & hackathons</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
            className="mt-4 text-base sm:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Sign in to discover verified events across India, explore tech domains, and get personalized recommendations.
          </motion.p>

          {/* Category Pills matching Home Page */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap items-center justify-center gap-1.5 pt-4"
          >
            {DOMAINS.map(domain => (
              <span
                key={domain}
                className="px-3.5 py-1 rounded-full text-xs font-medium bg-white/80 dark:bg-[#141519]/80 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400"
              >
                {domain}
              </span>
            ))}
          </motion.div>
        </div>

        {/* ─── Content Container ─── */}
        <div className="w-full max-w-4xl mx-auto mt-2">
          <AnimatePresence mode="wait">
            {step === 'select-role' ? (
              /* ── Step 1: 2-Column Role Selection ── */
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
                    Welcome to Eventix
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
                    Select your access module to continue
                  </p>
                </div>

                {/* 2-Column Grid for Student & Admin */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-3xl mx-auto">
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

                        {/* Action */}
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => handleRoleSelect(r)}
                            className="w-full py-3 rounded-full bg-slate-900 hover:bg-slate-800 dark:bg-white dark:hover:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <span>Enter as {r.label}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="text-center pt-2">
                  <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                    <UserCheck className="w-3.5 h-3.5" />
                    <span>Select your module above to sign in or create an account.</span>
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
                        <input
                          type="text"
                          required
                          value={college}
                          onChange={e => setCollege(e.target.value)}
                          placeholder="e.g. National Institute of Technology"
                          className="kaggle-input"
                        />
                      </div>
                    </>
                  )}

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="e.g. name@college.edu"
                      className="kaggle-input"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      Password
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        placeholder="Enter your password"
                        className="kaggle-input pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer p-1"
                        title={showPassword ? "Hide password" : "Show password"}
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

              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* ─── Highlights / Stat Pills matching Home UI ─── */}
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
        </div>

      </main>

      {/* Unified Footer component from Home */}
      <Footer />

    </div>
  );
}
