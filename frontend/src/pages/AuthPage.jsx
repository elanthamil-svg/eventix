import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  ShieldCheck,
  Mail,
  Lock,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  Zap
} from 'lucide-react';

const ROLES = [
  {
    key: 'student',
    label: 'Student',
    emoji: '🎓',
    Icon: GraduationCap,
    description: 'Discover events, register for fests, and get AI-powered recommendations.',
    color: '#20BEFF',
    bg: 'rgba(32, 190, 255, 0.08)',
    border: 'rgba(32, 190, 255, 0.35)',
    shadow: '0 0 0 4px rgba(32,190,255,0.12)',
    redirectTo: '/',
    demoEmail: 'student@campusconnect.edu',
    demoPwd: 'demo123'
  },
  {
    key: 'admin',
    label: 'Admin',
    emoji: '🛡️',
    Icon: ShieldCheck,
    description: 'Create & manage events, moderate the platform, and oversee all activities.',
    color: '#F59E0B',
    bg: 'rgba(245, 158, 11, 0.08)',
    border: 'rgba(245, 158, 11, 0.35)',
    shadow: '0 0 0 4px rgba(245,158,11,0.12)',
    redirectTo: '/admin',
    demoEmail: 'admin@campusconnect.edu',
    demoPwd: 'demo123'
  }
];

export default function LoginPage() {
  const navigate = useNavigate();
  const { login, register, switchRoleDemo } = useAuth();

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
    setStep('form');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      let res;
      if (isLogin) {
        res = await login(email, password, selectedRole.key);
      } else {
        res = await register({ name, email, password, role: selectedRole.key, college });
      }
      if (res?.success) {
        navigate(selectedRole.redirectTo);
      } else {
        setError('Invalid credentials. Try the Demo Login button.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    switchRoleDemo(selectedRole.key);
    navigate(selectedRole.redirectTo);
  };

  const role = selectedRole;

  return (
    <div
      className="min-h-screen flex"
      style={{ fontFamily: "'Inter', sans-serif", backgroundColor: '#0F1117' }}
    >
      {/* ─── Left Panel: Branding ──────────────────────────── */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #0F1117 0%, #141B2D 60%, #0D1520 100%)' }}
      >
        {/* Background glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div style={{
            position: 'absolute', top: '-10%', left: '-5%',
            width: '60%', height: '60%',
            background: 'radial-gradient(circle, rgba(32,190,255,0.06) 0%, transparent 70%)',
          }} />
          <div style={{
            position: 'absolute', bottom: '10%', right: '-10%',
            width: '50%', height: '50%',
            background: 'radial-gradient(circle, rgba(16,185,129,0.04) 0%, transparent 70%)',
          }} />
        </div>

        <div className="relative z-10">
          {/* Logo */}
          <div className="flex items-center gap-3 mb-16">
            <div style={{
              width: 40, height: 40, borderRadius: 12,
              background: '#20BEFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 900, fontSize: 20, color: '#0F1117'
            }}>E</div>
            <span style={{ fontSize: 22, fontWeight: 800, color: '#fff', letterSpacing: '-0.03em' }}>
              Eventix
            </span>
          </div>

          {/* Hero Text */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(32,190,255,0.1)', border: '1px solid rgba(32,190,255,0.2)' }}>
              <Sparkles size={13} style={{ color: '#20BEFF' }} />
              <span style={{ fontSize: 11, fontWeight: 700, color: '#20BEFF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                AI-Powered Event Discovery
              </span>
            </div>

            <h1 style={{ fontSize: 40, fontWeight: 900, color: '#fff', letterSpacing: '-0.04em', lineHeight: 1.1 }}>
              Connect. Compete.<br />
              <span style={{ color: '#20BEFF' }}>Achieve.</span>
            </h1>

            <p style={{ fontSize: 15, color: '#94A3B8', lineHeight: 1.7, maxWidth: 380 }}>
              Discover inter-college fests, hackathons, and competitions — powered by Gemini AI that matches events to your academic profile in real-time.
            </p>
          </div>

          {/* Stats Row */}
          <div className="flex items-center gap-8 mt-12">
            {[
              { label: 'Active Colleges', value: '500+' },
              { label: 'Prize Pool', value: '₹25L+' },
              { label: 'AI Accuracy', value: '97%' }
            ].map(stat => (
              <div key={stat.label}>
                <div style={{ fontSize: 22, fontWeight: 800, color: '#fff' }}>{stat.value}</div>
                <div style={{ fontSize: 11, color: '#64748B', fontWeight: 500, marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Feature Pills */}
        <div className="relative z-10 flex flex-wrap gap-2">
          {['AI Recommendations', 'Travel Safety', 'Digital Pass', 'Live Events'].map(feat => (
            <span key={feat} className="px-3 py-1.5 rounded-full text-xs font-semibold"
              style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', color: '#64748B' }}>
              {feat}
            </span>
          ))}
        </div>
      </div>

      {/* ─── Right Panel: Auth Form ─────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-10"
        style={{ background: '#0F1117' }}>

        <div className="w-full max-w-md">

          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center justify-center gap-2 mb-8">
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: '#20BEFF', display: 'flex', alignItems: 'center',
              justifyContent: 'center', fontWeight: 900, fontSize: 18, color: '#0F1117'
            }}>E</div>
            <span style={{ fontSize: 20, fontWeight: 800, color: '#fff' }}>Eventix</span>
          </div>

          {step === 'select-role' ? (
            /* ── Role Selection Step ── */
            <div className="animate-fade-in-up">
              <div className="mb-8 text-center">
                <h2 style={{ fontSize: 26, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.03em', marginBottom: 8 }}>
                  Welcome back
                </h2>
                <p style={{ fontSize: 14, color: '#64748B' }}>Select your role to continue</p>
              </div>

              <div className="space-y-3">
                {ROLES.map((r) => {
                  const RoleIcon = r.Icon;
                  return (
                    <button
                      key={r.key}
                      onClick={() => handleRoleSelect(r)}
                      className="w-full text-left rounded-2xl p-5 transition-all duration-200 hover:scale-[1.01] group"
                      style={{
                        background: r.bg,
                        border: `1.5px solid ${r.border}`,
                        cursor: 'pointer'
                      }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                          style={{ background: `${r.color}20`, border: `1px solid ${r.color}30` }}>
                          <RoleIcon size={22} style={{ color: r.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span style={{ fontSize: 15, fontWeight: 700, color: '#F1F5F9' }}>{r.emoji} {r.label}</span>
                          </div>
                          <p style={{ fontSize: 12, color: '#64748B', lineHeight: 1.5 }}>{r.description}</p>
                        </div>
                        <ArrowRight size={16} style={{ color: r.color, opacity: 0.7 }} className="shrink-0 group-hover:translate-x-1 transition-transform" />
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-6 p-4 rounded-xl flex items-center gap-3"
                style={{ background: 'rgba(32,190,255,0.06)', border: '1px solid rgba(32,190,255,0.12)' }}>
                <Zap size={14} style={{ color: '#20BEFF', flexShrink: 0 }} />
                <p style={{ fontSize: 12, color: '#64748B' }}>
                  Select a role to log in with demo credentials. No registration required.
                </p>
              </div>
            </div>
          ) : (
            /* ── Login / Register Form Step ── */
            <div className="animate-fade-in-up">
              {/* Back */}
              <button
                onClick={() => { setStep('select-role'); setError(''); }}
                className="flex items-center gap-1.5 mb-6 text-sm font-medium transition-colors hover:text-white"
                style={{ color: '#64748B', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
              >
                <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} />
                Change role
              </button>

              {/* Selected Role Badge */}
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                  style={{ background: `${role.color}20`, border: `1px solid ${role.color}30` }}>
                  <role.Icon size={20} style={{ color: role.color }} />
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 800, color: '#F1F5F9', letterSpacing: '-0.02em' }}>
                    {role.emoji} {role.label} {isLogin ? 'Sign In' : 'Sign Up'}
                  </div>
                  <div style={{ fontSize: 12, color: '#64748B' }}>{role.description.slice(0, 55)}…</div>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex rounded-xl p-1 mb-6"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)' }}>
                {['Sign In', 'Sign Up'].map((label, idx) => (
                  <button
                    key={label}
                    onClick={() => { setIsLogin(idx === 0); setError(''); }}
                    className="flex-1 py-2 rounded-lg text-sm font-semibold transition-all"
                    style={{
                      background: (isLogin ? idx === 0 : idx === 1) ? role.color : 'transparent',
                      color: (isLogin ? idx === 0 : idx === 1) ? '#0F1117' : '#64748B',
                      border: 'none', cursor: 'pointer'
                    }}
                  >
                    {label}
                  </button>
                ))}
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {!isLogin && (
                  <>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Full Name</label>
                      <input
                        type="text" required value={name}
                        onChange={e => setName(e.target.value)}
                        placeholder="e.g. Aarav Sharma"
                        className="kaggle-input"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>College Name</label>
                      <input
                        type="text" required value={college}
                        onChange={e => setCollege(e.target.value)}
                        placeholder="e.g. NIT Trichy"
                        className="kaggle-input"
                      />
                    </div>
                  </>
                )}

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Email Address</label>
                  <div className="relative">
                    <Mail size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type="email" required value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="you@college.edu"
                      className="kaggle-input"
                      style={{ paddingLeft: 40 }}
                    />
                  </div>
                </div>

                <div>
                  <label style={{ fontSize: 12, fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: 6 }}>Password</label>
                  <div className="relative">
                    <Lock size={15} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: '#475569' }} />
                    <input
                      type={showPassword ? 'text' : 'password'} required value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="kaggle-input"
                      style={{ paddingLeft: 40, paddingRight: 44 }}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#475569', padding: 0 }}>
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {error && (
                  <div className="rounded-xl px-4 py-3 text-sm"
                    style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#FB7185' }}>
                    {error}
                  </div>
                )}

                <button type="submit" disabled={loading}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all"
                  style={{
                    background: loading ? `${role.color}70` : role.color,
                    color: '#0F1117', border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                  {loading ? (
                    <div className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
                  ) : (
                    <>
                      {isLogin ? 'Sign In' : 'Create Account'}
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </form>

              {/* Demo Quick Login */}
              <div className="mt-4">
                <div className="flex items-center gap-3 my-4">
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                  <span style={{ fontSize: 11, color: '#475569', fontWeight: 500 }}>or</span>
                  <div style={{ flex: 1, height: 1, background: 'rgba(255,255,255,0.06)' }} />
                </div>

                <button
                  onClick={handleDemoLogin}
                  className="w-full py-3 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all hover:opacity-90"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: `1.5px solid ${role.color}40`,
                    color: role.color,
                    cursor: 'pointer',
                    fontFamily: "'Inter', sans-serif"
                  }}>
                  <Zap size={14} />
                  Quick Demo — {role.label} Access
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
