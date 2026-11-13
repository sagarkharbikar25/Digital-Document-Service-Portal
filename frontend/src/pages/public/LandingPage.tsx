import { useNavigate } from 'react-router-dom';
import { PublicHeader } from '../../components/layout/PublicHeader';
import {
  Sparkles,
  ShieldCheck,
  Activity,
  Lock,
  MapPin,
  Phone,
  Mail,
  ArrowRight,
} from 'lucide-react';

export function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)', color: 'var(--navy)', fontFamily: 'var(--font-sans)' }}>
      {/* ── SHARED PUBLIC HEADER ── */}
      <PublicHeader activeTab="home" showNav={true} breadcrumb="Home" />

      {/* ── HERO ── */}
      <section style={{ padding: '64px 36px', textAlign: 'center', maxWidth: 880, margin: '0 auto' }}>
        <span style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
          padding: '5px 16px',
          borderRadius: 20,
          background: 'var(--saffron-pale)',
          color: 'var(--saffron)',
          fontSize: 12,
          fontWeight: 700,
          marginBottom: 16,
          border: '1px solid #fed7aa',
        }}>
          <Sparkles size={13} /> Student Digital Document Services Portal
        </span>

        <h1 style={{
          fontFamily: 'var(--font-serif)',
          fontSize: 40,
          fontWeight: 800,
          lineHeight: 1.25,
          margin: '0 0 16px',
          color: 'var(--navy)',
        }}>
          Official College Documents, Online &amp; Fast
        </h1>

        <p style={{ fontSize: 16, color: 'var(--gray-600)', lineHeight: 1.7, margin: '0 0 32px' }}>
          Apply for Bonafide certificates, Transcripts, Leaving Certificates, NOCs, and more in less than 5 minutes.
          Track approval status live and download digitally signed PDFs with verifiable QR seals.
        </p>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              padding: '13px 30px',
              borderRadius: 6,
              background: 'var(--navy)',
              color: '#fff',
              fontSize: 14.5,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: '0 4px 16px rgba(10,22,40,0.2)',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
            }}
          >
            <span>Student Login / Register</span>
            <ArrowRight size={15} />
          </button>
          <button
            onClick={() => navigate('/documents')}
            style={{
              padding: '13px 26px',
              borderRadius: 6,
              background: '#fff',
              border: '1.5px solid var(--gray-300)',
              color: 'var(--navy)',
              fontSize: 14.5,
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Browse Available Documents
          </button>
          <button
            onClick={() => navigate('/admin')}
            style={{
              padding: '13px 22px',
              borderRadius: 6,
              background: '#fff',
              border: '1.5px solid var(--saffron)',
              color: 'var(--saffron)',
              fontSize: 14.5,
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>Staff Admin Portal</span>
            <Lock size={14} />
          </button>
        </div>
      </section>

      {/* ── 3 KEY FEATURES ── */}
      <section style={{ maxWidth: 1100, margin: '0 auto', padding: '0 36px 60px', width: '100%' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderTop: '4px solid var(--saffron)', borderRadius: 10, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#fef3c7', color: 'var(--saffron)', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <Sparkles size={22} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Fast Turnaround</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
              Standard certificates processed in 2–3 working days with streamlined digital clerk, HOD, and principal endorsements.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderTop: '4px solid #10b981', borderRadius: 10, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#d1fae5', color: '#059669', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <ShieldCheck size={22} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>QR Cryptographic Verification</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
              Every issued certificate bears a tamper-proof QR code verifiable in real-time by employers and universities.
            </p>
          </div>

          <div style={{ background: '#fff', border: '1px solid var(--gray-200)', borderTop: '4px solid var(--navy)', borderRadius: 10, padding: 24, boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: '#e0e7ff', color: '#3730a3', display: 'grid', placeItems: 'center', marginBottom: 14 }}>
              <Activity size={22} />
            </div>
            <h3 style={{ margin: '0 0 8px', fontSize: 16, fontWeight: 700, color: 'var(--navy)' }}>Transparent Live Tracking</h3>
            <p style={{ margin: 0, fontSize: 13, color: 'var(--gray-500)', lineHeight: 1.6 }}>
              Enter your Application ID to track the step-by-step progress and receive notifications as your application moves.
            </p>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="site-footer" style={{ marginTop: 'auto' }}>
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-name">JD College of Engineering and Management</div>
            <p>Education to Eternity</p>
            <div className="f-contact" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 6 }}>
                <MapPin size={14} style={{ marginTop: 2, flexShrink: 0 }} />
                <span>Khandala, Post: Valni, Near Hanuman Temple, Borgoan Phata, Kalmeshwar Road, Nagpur – 441501</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Phone size={14} style={{ flexShrink: 0 }} />
                <span>0712-2821100 / 9011010038</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <Mail size={14} style={{ flexShrink: 0 }} />
                <a href="mailto:info@jdcoem.ac.in" style={{ color: 'inherit' }}>info@jdcoem.ac.in</a>
              </div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><a href="/login">Student Login</a></li>
              <li><a href="/documents">Apply for Document</a></li>
              <li><a href="/track-status">Track Application</a></li>
              <li><a href="/admin">Staff Admin Portal</a></li>
              <li><a href="/verify">Verify Certificate</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Governing Bodies</h4>
            <ul>
              <li>Dr. Babasaheb Ambedkar Technological University</li>
              <li>University Grants Commission (UGC)</li>
              <li>Directorate of Technical Education, Maharashtra</li>
              <li>All India Council for Technical Education (AICTE)</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; {new Date().getFullYear()} JD College of Engineering and Management, Nagpur. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
