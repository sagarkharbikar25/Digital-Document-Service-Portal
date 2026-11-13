import { useNavigate } from 'react-router-dom';
import { Home, FileText, Activity, HelpCircle, Phone } from 'lucide-react';

interface PublicHeaderProps {
  activeTab?: 'home' | 'documents' | 'track' | 'help' | 'contact';
  showNav?: boolean;
  breadcrumb?: string;
}

export function PublicHeader({ activeTab = 'home', showNav = false, breadcrumb }: PublicHeaderProps) {
  const navigate = useNavigate();

  return (
    <>
      {/* ── TOP STRIP ── */}
      <div className="top-strip">
        Government of Maharashtra recognized &nbsp;|&nbsp; NAAC Accredited &nbsp;|&nbsp; Affiliated to RTM Nagpur University
      </div>

      {/* ── HEADER ── */}
      <header className="login-header">
        <div className="header-inner">
          <img
            src="/assets/logo_left.png"
            alt="JDCOEM Logo"
            className="college-logo"
            onClick={() => navigate('/login')}
            style={{ cursor: 'pointer' }}
          />
          <div className="college-text" onClick={() => navigate('/login')} style={{ cursor: 'pointer' }}>
            <h1>JD College of Engineering and Management</h1>
            <div className="subtitle">Nagpur, Maharashtra – 441501</div>
            <span className="autonomous-tag">An Autonomous Institute</span>
          </div>
          <div className="header-right">
            <strong>Digital Document Services</strong>
            <div>Helpline: 0712-2821100 / 9011010038</div>
            <div>Mon–Sat: 9:00 AM – 5:30 PM</div>
          </div>
        </div>
      </header>

      {/* ── NAVIGATION STRIP (ONLY WHEN SHOWN) ── */}
      {showNav && (
        <nav className="nav-bar-public">
          <div className="nav-bar-inner">
            <button
              type="button"
              className={`nav-link-public ${activeTab === 'home' ? 'active' : ''}`}
              onClick={() => navigate('/login')}
              style={{ border: 'none', background: 'none' }}
            >
              <Home size={14} /> Home
            </button>
            <button
              type="button"
              className={`nav-link-public ${activeTab === 'documents' ? 'active' : ''}`}
              onClick={() => navigate('/documents')}
              style={{ border: 'none', background: 'none' }}
            >
              <FileText size={14} /> Documents
            </button>
            <button
              type="button"
              className={`nav-link-public ${activeTab === 'track' ? 'active' : ''}`}
              onClick={() => navigate('/track-status')}
              style={{ border: 'none', background: 'none' }}
            >
              <Activity size={14} /> Track Application
            </button>
            <button
              type="button"
              className={`nav-link-public ${activeTab === 'help' ? 'active' : ''}`}
              onClick={() => navigate('/help')}
              style={{ border: 'none', background: 'none' }}
            >
              <HelpCircle size={14} /> Help &amp; FAQ
            </button>
            <button
              type="button"
              className={`nav-link-public ${activeTab === 'contact' ? 'active' : ''}`}
              onClick={() => navigate('/help')}
              style={{ border: 'none', background: 'none' }}
            >
              <Phone size={14} /> Contact
            </button>
          </div>
        </nav>
      )}

      {/* ── BREADCRUMB STRIP (ONLY WHEN SHOWN) ── */}
      {showNav && breadcrumb && (
        <div className="breadcrumb-bar">
          <div className="breadcrumb-bar-inner">
            <span style={{ cursor: 'pointer' }} onClick={() => navigate('/login')}>Home</span> &rsaquo;{' '}
            <span className="active-crumb">{breadcrumb}</span>
          </div>
        </div>
      )}
    </>
  );
}
