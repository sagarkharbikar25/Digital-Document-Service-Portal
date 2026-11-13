import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../services/api';
import {
  FileText,
  Users,
  Award,
  FileSpreadsheet,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  ShieldCheck,
  CheckCircle2,
  Settings,
  Phone,
  Clock,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react';

const ROLES: Record<string, string> = {
  'clerk@jdcoem.ac.in': 'clerk',
  'saar@jdcoem.ac.in': 'clerk',
  'hod@jdcoem.ac.in': 'hod',
  'skhod@jdcoem.ac.in': 'hod',
  'principal@jdcoem.ac.in': 'principal',
  'sagar@jdcoem.ac.in': 'principal',
  'admin@jdcoem.ac.in': 'admin',
};

export function AdminLoginPage() {
  const navigate = useNavigate();
  const [tab, setTab] = useState<'signin' | 'setup'>('signin');
  const [email, setEmail] = useState('saar@jdcoem.ac.in');
  const [password, setPassword] = useState('password123');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Invalid credentials. Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await authApi.login(email, password);
      if (res.token) {
        localStorage.setItem('token', res.token);
      }
      if (res.user) {
        localStorage.setItem('user', JSON.stringify(res.user));
        const userRole = res.user.role || ROLES[email.toLowerCase().trim()] || 'clerk';
        if (userRole === 'hod') navigate('/admin/hod');
        else if (userRole === 'principal') navigate('/admin/principal');
        else if (userRole === 'admin') navigate('/admin/setup');
        else navigate('/admin/clerk');
        return;
      }
    } catch (err: any) {
      console.warn('Backend login fallback:', err.message);
    } finally {
      setLoading(false);
    }

    // Role-based route fallback
    const role = ROLES[email.toLowerCase().trim()] || 'clerk';
    if (role === 'hod') {
      navigate('/admin/hod');
    } else if (role === 'principal') {
      navigate('/admin/principal');
    } else if (role === 'admin') {
      navigate('/admin/setup');
    } else {
      navigate('/admin/clerk');
    }
  };

  const setRolePreset = (presetEmail: string) => {
    setEmail(presetEmail);
    setPassword('password123');
    setError('');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#faf8f3', fontFamily: 'var(--font-sans)' }}>
      {/* ── TOP HEADER ── */}
      <header
        style={{
          background: '#fff',
          borderBottom: '1px solid #e2e8f0',
          padding: '16px 40px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 18,
          boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <img
            src="/assets/logo_left.png"
            alt="JDCOEM Crest"
            style={{ width: 60, height: 60, objectFit: 'contain' }}
            onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo_left.png'; }}
          />
          <div>
            <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, color: 'var(--navy)', lineHeight: 1.15, margin: 0 }}>
              JD College of Engineering and Management
            </h1>
            <div style={{ fontSize: 13, color: '#64748b', marginTop: 3 }}>
              Nagpur, Maharashtra – 441501
            </div>
            <span
              style={{
                display: 'inline-block',
                background: 'var(--saffron)',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 8px',
                borderRadius: 4,
                letterSpacing: '0.5px',
                textTransform: 'uppercase',
                marginTop: 4,
              }}
            >
              An Autonomous Institute
            </span>
          </div>
        </div>

        <div style={{ textAlign: 'right', fontSize: 12.5, color: '#475569', lineHeight: 1.6 }}>
          <strong style={{ fontSize: 13.5, color: 'var(--navy)', display: 'block' }}>Digital Document Services</strong>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', marginTop: 2 }}>
            <Phone size={12} color="var(--saffron)" /> Helpline: 0712-000-0000
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end', fontSize: 11.5, color: '#94a3b8' }}>
            <Clock size={12} color="#94a3b8" /> Mon–Sat: 9:00 AM – 5:30 PM
          </div>
        </div>
      </header>

      {/* ── PAGE BODY ── */}
      <main style={{ flex: 1, padding: '40px 40px 60px' }}>
        <div
          style={{
            maxWidth: 1200,
            margin: '0 auto',
            display: 'grid',
            gridTemplateColumns: '1fr 480px',
            gap: 48,
            alignItems: 'start',
          }}
        >
          {/* LEFT COL: Institutional Info */}
          <aside>
            <h2
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 24,
                fontWeight: 700,
                color: 'var(--navy)',
                marginBottom: 12,
                paddingBottom: 8,
                borderBottom: '2px solid var(--saffron)',
                display: 'inline-block',
              }}
            >
              About This Portal
            </h2>
            <p style={{ fontSize: 14, color: '#475569', lineHeight: 1.7, marginBottom: 28, maxWidth: 520 }}>
              The JDCOEM Digital Document Services Admin Portal is the secure institutional platform for authorised
              faculty and administrative officials to review, verify, approve, and digitally seal academic documents.
            </p>

            {/* Administrator Roles */}
            <div style={{ marginBottom: 30 }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--navy)', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                ADMINISTRATOR ACCESS ROLES
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {/* Clerk Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 2px rgba(10,22,40,0.03)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', color: '#1e40af', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <FileText size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>Academic Clerk</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Primary document verification, dues checks &amp; dispatch to HOD</div>
                  </div>
                </div>

                {/* HOD Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 2px rgba(10,22,40,0.03)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f5f3ff', color: '#5b21b6', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Users size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>Head of Department (HOD)</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Departmental conduct review, attendance audit &amp; recommendation</div>
                  </div>
                </div>

                {/* Principal Card */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, padding: '12px 16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: 8, boxShadow: '0 1px 2px rgba(10,22,40,0.03)' }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fdf2f8', color: '#be185d', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                    <Award size={18} />
                  </div>
                  <div>
                    <div style={{ fontSize: 13.5, fontWeight: 700, color: 'var(--navy)' }}>Principal / Director</div>
                    <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>Final institutional sanction and cryptographic certificate seal generation</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Document Badges */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[
                { icon: <FileText size={16} />, label: 'Bonafide Certificates' },
                { icon: <Award size={16} />, label: 'Character & Conduct Certificates' },
                { icon: <GraduationCap size={16} />, label: 'Leaving / Transfer Certificates' },
                { icon: <FileSpreadsheet size={16} />, label: 'Official Grade Transcripts' },
              ].map((doc, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 12, color: 'var(--navy)', fontSize: 13, fontWeight: 600 }}>
                  <div style={{ width: 30, height: 30, borderRadius: 6, background: 'rgba(10,22,40,0.06)', display: 'grid', placeItems: 'center', color: 'var(--navy)' }}>
                    {doc.icon}
                  </div>
                  <span>{doc.label}</span>
                </div>
              ))}
            </div>
          </aside>

          {/* RIGHT COL: ADMIN LOGIN CARD */}
          <div
            style={{
              background: '#fff',
              borderRadius: 12,
              overflow: 'hidden',
              boxShadow: '0 4px 20px rgba(10,22,40,0.08), 0 1px 3px rgba(10,22,40,0.04)',
              border: '1px solid #e2e8f0',
            }}
          >
            {/* Header */}
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
                  Admin Login Portal
                </h2>
                <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', margin: '3px 0 0' }}>
                  Restricted Access • JDCOEM Document Registry
                </p>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e2e8f0', background: '#faf8f5' }}>
              <button
                type="button"
                onClick={() => setTab('signin')}
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
                onClick={() => setTab('setup')}
                style={{
                  flex: 1,
                  padding: '14px 20px',
                  fontSize: 13.5,
                  fontWeight: tab === 'setup' ? 700 : 500,
                  color: tab === 'setup' ? 'var(--navy)' : '#64748b',
                  background: tab === 'setup' ? '#fff' : 'none',
                  border: 'none',
                  borderBottom: tab === 'setup' ? '3px solid var(--saffron)' : '3px solid transparent',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                First-Time Setup
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
                  <strong>Administrative Staff Only:</strong> Use your official institutional email (ending in <strong>@jdcoem.ac.in</strong>) and password.
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

              {tab === 'signin' ? (
                <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
                  <div>
                    <label style={{ display: 'block', fontSize: 11.5, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>
                      COLLEGE EMAIL ID <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: '#fff',
                        padding: '0 12px',
                      }}
                    >
                      <Mail size={16} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="clerk@jdcoem.ac.in"
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
                      PASSWORD <span style={{ color: '#dc2626' }}>*</span>
                    </label>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #cbd5e1',
                        borderRadius: 8,
                        background: '#fff',
                        padding: '0 12px',
                      }}
                    >
                      <Lock size={16} color="#94a3b8" style={{ marginRight: 10, flexShrink: 0 }} />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter your password"
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

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 }}>
                      <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12.5, color: '#64748b', cursor: 'pointer' }}>
                        <input
                          type="checkbox"
                          checked={showPassword}
                          onChange={(e) => setShowPassword(e.target.checked)}
                          style={{ accentColor: 'var(--navy)' }}
                        />
                        Show Password
                      </label>
                      <span style={{ fontSize: 12.5, color: 'var(--saffron)', fontWeight: 600, cursor: 'pointer' }}>
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
                      boxShadow: '0 2px 8px rgba(10,22,40,0.15)',
                    }}
                  >
                    Sign In to Admin Portal
                  </button>

                  {/* Demo Role Selector */}
                  <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Sparkles size={12} color="var(--saffron)" /> Quick Role Switcher (For Evaluation)
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
                      <button
                        type="button"
                        onClick={() => setRolePreset('clerk@jdcoem.ac.in')}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: email.startsWith('clerk') ? '2px solid #2563eb' : '1px solid #cbd5e1',
                          background: email.startsWith('clerk') ? '#eff6ff' : '#fff',
                          color: '#1e40af',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Clerk
                      </button>
                      <button
                        type="button"
                        onClick={() => setRolePreset('hod@jdcoem.ac.in')}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: email.startsWith('hod') ? '2px solid #7c3aed' : '1px solid #cbd5e1',
                          background: email.startsWith('hod') ? '#f5f3ff' : '#fff',
                          color: '#5b21b6',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        HOD
                      </button>
                      <button
                        type="button"
                        onClick={() => setRolePreset('principal@jdcoem.ac.in')}
                        style={{
                          padding: '7px 10px',
                          borderRadius: 6,
                          border: email.startsWith('principal') ? '2px solid #be185d' : '1px solid #cbd5e1',
                          background: email.startsWith('principal') ? '#fdf2f8' : '#fff',
                          color: '#be185d',
                          fontSize: 11.5,
                          fontWeight: 700,
                          cursor: 'pointer',
                        }}
                      >
                        Principal
                      </button>
                    </div>
                  </div>
                </form>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  <p style={{ fontSize: 13, color: '#475569', lineHeight: 1.6, margin: 0 }}>
                    First-time institutional administrator setup initializes cryptographic security keys, DB connection credentials, and system settings.
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('/admin/setup')}
                    style={{
                      width: '100%',
                      padding: '12px',
                      background: 'var(--navy)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: 8,
                      fontSize: 13.5,
                      fontWeight: 700,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                    }}
                  >
                    <Settings size={16} /> Open Institutional Setup Portal <ArrowRight size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer style={{ background: 'var(--navy)', color: 'rgba(255,255,255,0.7)', padding: '20px 40px', textAlign: 'center', fontSize: 12.5, borderTop: '3px solid var(--saffron)' }}>
        &copy; 2026 JD College of Engineering and Management. Secure Administrative Portal • All Rights Reserved.
      </footer>
    </div>
  );
}

export default AdminLoginPage;
