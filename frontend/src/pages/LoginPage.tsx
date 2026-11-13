import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '../components/layout/PublicHeader';
import { authApi } from '../services/api';
import {
  ShieldCheck,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  FileBadge,
  Award,
  GraduationCap,
  FileSpreadsheet,
  AlertCircle,
  User,
  Hash,
  Building,
  Calendar,
  CheckCircle2,
} from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'register'>('signin');
  const [email, setEmail] = useState('bt22cse041@jdcoem.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<'credentials' | 'otp'>('credentials');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Registration state
  const [regData, setRegData] = useState({
    name: '',
    rollNo: '',
    branch: 'Computer Science & Engineering',
    year: '3rd Year',
    email: '',
    password: '',
    confirmPassword: '',
    agreed: false,
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please enter your college email ID and password.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.login(email, password);
      if (res.requires_otp) {
        setStep('otp');
      } else if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
        navigate('/dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err: any) {
      // Fallback navigation for dev demo mode
      console.warn('Backend login notice, falling back:', err.message);
      navigate('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otp) {
      setError('Please enter the 6-digit OTP code.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const res = await authApi.verifyOtp(email, otp);
      if (res.token) {
        localStorage.setItem('token', res.token);
        if (res.user) localStorage.setItem('user', JSON.stringify(res.user));
      }
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Invalid or expired OTP code');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!regData.name || !regData.rollNo || !regData.email || !regData.password) {
      setError('Please fill in all required registration fields.');
      return;
    }
    if (regData.password !== regData.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!regData.agreed) {
      setError('Please accept the institutional declaration.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await authApi.register({
        name: regData.name,
        roll_number: regData.rollNo,
        bt_id: regData.rollNo,
        department: regData.branch,
        year: regData.year,
        email: regData.email,
        password: regData.password,
        role: 'student',
      });
      alert('Registration successful! Please sign in with your credentials.');
      setTab('signin');
      setEmail(regData.email);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)' }}>
      {/* ── HEADER (CLEAN INSTITUTIONAL HEADER WITH NO INTERNAL NAVIGATION) ── */}
      <PublicHeader showNav={false} />

      {/* ── MAIN CONTENT (2 COLUMNS MATCHING EXACT HTML) ── */}
      <main style={{ flex: 1, padding: '40px 32px 64px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: 'minmax(320px, 1fr) 480px',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* ── LEFT COLUMN: ABOUT PORTAL & NOTICES ── */}
          <aside>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--navy)',
                marginBottom: 14,
                paddingBottom: 8,
                borderBottom: '2px solid var(--saffron)',
                display: 'inline-block',
                letterSpacing: '-0.01em',
              }}
            >
              About This Portal
            </h2>

            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 26, maxWidth: 520 }}>
              The JDCOEM Digital Document Services Portal is the official institutional platform for students
              to request, track, and receive digitally verified academic certificates and records online.
            </p>

            {/* Document Shortcuts with clean SVG icons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 30 }}>
              {[
                { icon: <FileBadge size={18} color="var(--gold)" />, title: 'Bonafide Certificate', desc: 'Proof of current enrollment for visas, scholarships & banking' },
                { icon: <Award size={18} color="var(--gold)" />, title: 'Character Certificate', desc: 'Institutional conduct and disciplinary clearance record' },
                { icon: <GraduationCap size={18} color="var(--gold)" />, title: 'Leaving / Transfer Certificate (TC)', desc: 'Official academic migration & completion credential' },
                { icon: <FileSpreadsheet size={18} color="var(--gold)" />, title: 'Official Academic Transcript', desc: 'Comprehensive multi-semester grade records under autonomous seal' },
              ].map((item, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    padding: '10px 14px',
                    background: '#fff',
                    borderRadius: 8,
                    border: '1px solid #e2e8f0',
                    boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: 8,
                      background: 'rgba(10, 22, 40, 0.05)',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {item.icon}
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>
                      {item.title}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>
                      {item.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Institutional Notice Box */}
            <div
              style={{
                background: '#fffbeb',
                border: '1px solid #fef3c7',
                borderLeft: '4px solid var(--saffron)',
                borderRadius: 8,
                padding: '16px 20px',
                fontSize: 13,
                color: '#78350f',
                lineHeight: 1.6,
                boxShadow: '0 1px 3px rgba(212, 120, 26, 0.06)',
              }}
            >
              <div style={{ fontSize: 13.5, fontWeight: 700, color: '#92400e', marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8 }}>
                <AlertCircle size={16} color="var(--saffron)" /> Official Academic Advisory
              </div>
              Students must authenticate using their official institutional email ID (ending in <strong>@jdcoem.ac.in</strong>) and University BT Registration ID.
              For profile verification discrepancies, visit the Academic Administration Counter at Block A, Room 101.
            </div>
          </aside>

          {/* ── RIGHT COLUMN: STUDENT LOGIN / REGISTER CARD ── */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(10,22,40,0.08), 0 1px 3px rgba(10,22,40,0.04)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Card Header (Deep Navy #0a1628 with crisp SVG badge) */}
            <div
              style={{
                background: 'linear-gradient(135deg, var(--navy) 0%, #152744 100%)',
                padding: '22px 28px',
                display: 'flex',
                alignItems: 'center',
                gap: 16,
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.12)',
                  border: '1px solid rgba(255,255,255,0.2)',
                  display: 'grid',
                  placeItems: 'center',
                  color: 'var(--gold)',
                  flexShrink: 0,
                }}
              >
                <ShieldCheck size={24} />
              </div>
              <div>
                <h2 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, fontWeight: 700, color: '#fff', margin: 0 }}>
                  Student Login Portal
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '3px 0 0' }}>
                  Secure Access to JDCOEM Digital Document Services
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#faf8f5' }}>
              <button
                type="button"
                onClick={() => { setTab('signin'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: 13.5,
                  fontWeight: tab === 'signin' ? 700 : 500,
                  color: tab === 'signin' ? 'var(--navy)' : '#64748b',
                  background: tab === 'signin' ? '#fff' : 'none',
                  border: 'none',
                  borderBottom: tab === 'signin' ? '3px solid var(--saffron)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => { setTab('register'); setError(''); }}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: 13.5,
                  fontWeight: tab === 'register' ? 700 : 500,
                  color: tab === 'register' ? 'var(--navy)' : '#64748b',
                  background: tab === 'register' ? '#fff' : 'none',
                  border: 'none',
                  borderBottom: tab === 'register' ? '3px solid var(--saffron)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                New Registration
              </button>
            </div>

            {/* Card Body */}
            <div style={{ padding: 28 }}>
              {/* Notice Banner */}
              <div
                style={{
                  background: '#eff6ff',
                  border: '1px solid #bfdbfe',
                  borderRadius: 8,
                  padding: '12px 16px',
                  marginBottom: 20,
                  fontSize: 12.5,
                  color: '#1e40af',
                  lineHeight: 1.5,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                }}
              >
                <AlertCircle size={16} color="#2563eb" style={{ flexShrink: 0 }} />
                <div>
                  <strong>Students Only:</strong> Use your official <strong>@jdcoem.ac.in</strong> email ID and registered password. First-time students must{' '}
                  <span
                    style={{ color: 'var(--saffron)', fontWeight: 700, cursor: 'pointer', textDecoration: 'underline' }}
                    onClick={() => setTab('register')}
                  >
                    register here
                  </span>.
                </div>
              </div>

              {error && (
                <div
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#991b1b',
                    borderRadius: 8,
                    padding: '10px 14px',
                    fontSize: 12.5,
                    marginBottom: 16,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 8,
                  }}
                >
                  <AlertCircle size={16} color="#dc2626" /> {error}
                </div>
              )}

              {/* TAB 1: SIGN IN - STEP 2: OTP */}
              {tab === 'signin' && step === 'otp' && (
                <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div
                    style={{
                      background: '#ecfdf5',
                      border: '1px solid #a7f3d0',
                      borderRadius: 8,
                      padding: '12px 16px',
                      fontSize: 12.5,
                      color: '#065f46',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <CheckCircle2 size={18} color="#059669" />
                    <div>
                      One-Time Password (OTP) dispatched to <strong>{email}</strong>. Enter code below (Dev OTP: <strong>123456</strong>).
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      Enter 6-Digit OTP <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      placeholder="123456"
                      style={{
                        width: '100%',
                        padding: '14px',
                        textAlign: 'center',
                        fontSize: 22,
                        fontWeight: 700,
                        letterSpacing: '8px',
                        border: '2px solid var(--saffron)',
                        borderRadius: 8,
                        outline: 'none',
                        color: 'var(--navy)',
                      }}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--navy)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: loading ? 'not-allowed' : 'pointer',
                      opacity: loading ? 0.7 : 1,
                    }}
                  >
                    {loading ? 'Verifying OTP...' : 'Verify & Access Portal →'}
                  </button>

                  <div style={{ textAlign: 'center' }}>
                    <button
                      type="button"
                      onClick={() => setStep('credentials')}
                      style={{ background: 'none', border: 'none', color: '#64748b', fontSize: 12.5, cursor: 'pointer', textDecoration: 'underline' }}
                    >
                      ← Back to Email & Password
                    </button>
                  </div>
                </form>
              )}

              {/* TAB 1: SIGN IN - STEP 1: CREDENTIALS */}
              {tab === 'signin' && step === 'credentials' && (
                <form onSubmit={handleSignIn} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      College Email ID <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        padding: '0 12px',
                      }}
                    >
                      <Mail size={16} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="btid@jdcoem.ac.in"
                        style={{
                          flex: 1,
                          padding: '11px 0',
                          border: 'none',
                          outline: 'none',
                          fontSize: 13.5,
                          background: 'transparent',
                          color: 'var(--navy)',
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      Password <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: '#fff',
                        transition: 'border-color 0.2s',
                        padding: '0 12px',
                      }}
                    >
                      <Lock size={16} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your registered password"
                        style={{
                          flex: 1,
                          padding: '11px 0',
                          border: 'none',
                          outline: 'none',
                          fontSize: 13.5,
                          background: 'transparent',
                          color: 'var(--navy)',
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        style={{ background: 'none', border: 'none', padding: '0 4px', color: '#94a3b8', cursor: 'pointer', display: 'grid', placeItems: 'center' }}
                      >
                        {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                      </button>
                    </div>
                    <div style={{ textAlign: 'right', marginTop: 6 }}>
                      <span style={{ fontSize: 12, color: 'var(--saffron)', fontWeight: 600, cursor: 'pointer' }}>
                        Forgot Password?
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--navy)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'background 0.2s, box-shadow 0.2s',
                      boxShadow: '0 2px 8px rgba(10,22,40,0.15)',
                    }}
                  >
                    Sign In to Portal
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '2px 0' }}>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                    <span style={{ fontSize: 11, color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase' }}>or quick access</span>
                    <div style={{ flex: 1, height: 1, background: '#e2e8f0' }} />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEmail('bt22cse041@jdcoem.ac.in');
                      setPassword('password123');
                      navigate('/dashboard');
                    }}
                    style={{
                      width: '100%',
                      padding: '10px 14px',
                      background: '#fff',
                      border: '1px solid #cbd5e1',
                      borderRadius: 8,
                      fontSize: 12.5,
                      fontWeight: 600,
                      color: 'var(--navy)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      transition: 'border-color 0.2s',
                    }}
                  >
                    <Sparkles size={14} color="var(--saffron)" />
                    Demo Student: Akash Kumar (BT22CSE041)
                  </button>
                </form>
              )}

              {/* TAB 2: NEW REGISTRATION */}
              {tab === 'register' && (
                <form onSubmit={handleRegister} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Full Name *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <User size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <input
                          type="text"
                          required
                          value={regData.name}
                          onChange={(e) => setRegData({ ...regData, name: e.target.value })}
                          placeholder="e.g. Akash Kumar"
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>BT ID / Roll No *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <Hash size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <input
                          type="text"
                          required
                          value={regData.rollNo}
                          onChange={(e) => setRegData({ ...regData, rollNo: e.target.value })}
                          placeholder="BT22CSE041"
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13, fontFamily: 'monospace' }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Department *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <Building size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <select
                          value={regData.branch}
                          onChange={(e) => setRegData({ ...regData, branch: e.target.value })}
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 12.5, background: 'transparent' }}
                        >
                          <option>Computer Science & Engineering</option>
                          <option>Information Technology</option>
                          <option>Electronics & Telecommunication</option>
                          <option>Mechanical Engineering</option>
                          <option>Civil Engineering</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Current Year *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <Calendar size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <select
                          value={regData.year}
                          onChange={(e) => setRegData({ ...regData, year: e.target.value })}
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 12.5, background: 'transparent' }}
                        >
                          <option>1st Year</option>
                          <option>2nd Year</option>
                          <option>3rd Year</option>
                          <option>4th Year</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>College Email ID *</label>
                    <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                      <Mail size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                      <input
                        type="email"
                        required
                        value={regData.email}
                        onChange={(e) => setRegData({ ...regData, email: e.target.value })}
                        placeholder="yourname@jdcoem.ac.in"
                        style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Password *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <Lock size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <input
                          type="password"
                          required
                          value={regData.password}
                          onChange={(e) => setRegData({ ...regData, password: e.target.value })}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
                        />
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Confirm Password *</label>
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 10px', marginTop: 4 }}>
                        <Lock size={14} color="#94a3b8" style={{ marginRight: 6 }} />
                        <input
                          type="password"
                          required
                          value={regData.confirmPassword}
                          onChange={(e) => setRegData({ ...regData, confirmPassword: e.target.value })}
                          placeholder="••••••••"
                          style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
                        />
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginTop: 4 }}>
                    <input
                      type="checkbox"
                      id="reg-terms"
                      checked={regData.agreed}
                      onChange={(e) => setRegData({ ...regData, agreed: e.target.checked })}
                      style={{ marginTop: 3, accentColor: 'var(--saffron)' }}
                    />
                    <label htmlFor="reg-terms" style={{ fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>
                      I solemnly affirm that the details furnished above are accurate and true according to my official college admission records.
                    </label>
                  </div>

                  <button
                    type="submit"
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--navy)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 14,
                      fontWeight: 700,
                      cursor: 'pointer',
                      marginTop: 6,
                    }}
                  >
                    Submit Student Registration
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.7)', padding: '24px 32px', textAlign: 'center', fontSize: 12.5, borderTop: '3px solid var(--saffron)' }}>
        <div style={{ maxWidth: 1200, margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            &copy; 2026 JD College of Engineering and Management, Nagpur. All Rights Reserved.
          </div>
          <div style={{ display: 'flex', gap: 20 }}>
            <span>Autonomous Institute</span>
            <span>NAAC Accredited</span>
            <span>Affiliated to DBATU Lonere</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default LoginPage;
