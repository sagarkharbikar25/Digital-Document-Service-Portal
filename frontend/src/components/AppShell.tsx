import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FolderArchive,
  Clock3,
  DownloadCloud,
  UserCheck,
  Bell,
  HelpCircle,
  LogOut,
  MapPin,
  Phone,
  Mail,
  GraduationCap,
  ExternalLink,
} from 'lucide-react';

export function AppShell() {
  const navigate = useNavigate();
  const [showNotifMenu, setShowNotifMenu] = useState(false);

  const handleLogout = () => {
    navigate('/login');
  };

  return (
    <div className="portal-frame">
      {/* ── TOP RECOGNITION STRIP ── */}
      <div className="top-strip">
        Government of Maharashtra recognized &nbsp;|&nbsp; NAAC Accredited &nbsp;|&nbsp; Affiliated to RTM Nagpur University
      </div>

      {/* ── STICKY SITE HEADER (White Institutional Theme) ── */}
      <header className="site-header">
        <div className="header-inner">
          {/* Logo with institution crest and autonomous badge */}
          <div
            className="logo-wrap"
            onClick={() => navigate('/dashboard')}
            style={{ cursor: 'pointer' }}
          >
            <img
              src="/assets/logo_left.png"
              alt="JDCOEM Crest"
              className="college-logo"
              style={{ width: 50, height: 50, objectFit: 'contain' }}
              onError={(e) => { (e.target as HTMLImageElement).src = '/assets/logo_left.png'; }}
            />
            <div className="logo-text">
              <div className="college-name">JD College of Engineering and Management</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                <span className="portal-name">Student Digital Document Services</span>
                <span className="autonomous-tag" style={{ fontSize: 9.5, padding: '1px 6px', margin: 0 }}>An Autonomous Institute</span>
              </div>
            </div>
          </div>

          <div className="header-spacer" />

          {/* Tools: Bell, User Chip, Logout */}
          <div className="header-tools">
            {/* Notification Bell */}
            <div style={{ position: 'relative' }}>
              <button
                type="button"
                className="notif-btn"
                onClick={() => setShowNotifMenu(!showNotifMenu)}
                title="Notifications"
                aria-label="View notifications"
                style={{ display: 'grid', placeItems: 'center' }}
              >
                <Bell size={18} />
                <span className="notif-badge" />
              </button>

              {showNotifMenu && (
                <div style={{
                  position: 'absolute',
                  right: 0,
                  top: 48,
                  width: 320,
                  background: '#fff',
                  borderRadius: 10,
                  boxShadow: '0 10px 30px rgba(10,22,40,0.18)',
                  border: '1px solid #e2e8f0',
                  zIndex: 200,
                  overflow: 'hidden',
                }}>
                  <div style={{ padding: '12px 16px', background: 'var(--navy)', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <strong style={{ fontSize: 13 }}>Notifications</strong>
                    <span
                      style={{ fontSize: 11.5, color: 'var(--gold)', cursor: 'pointer', fontWeight: 600 }}
                      onClick={() => { setShowNotifMenu(false); navigate('/notifications'); }}
                    >
                      View all →
                    </span>
                  </div>
                  <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8, fontSize: 12, color: '#333' }}>
                    <div style={{ padding: '8px 10px', borderRadius: 6, background: '#f8faf9', border: '1px solid #edf2f7' }}>
                      <strong style={{ display: 'block', color: 'var(--navy)' }}>Sem VI Hall Tickets Released</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>Download from Hall Ticket section now.</span>
                    </div>
                    <div style={{ padding: '8px 10px', borderRadius: 6, background: '#f8faf9', border: '1px solid #edf2f7' }}>
                      <strong style={{ display: 'block', color: 'var(--navy)' }}>Bonafide Processing: Now 2 Days</strong>
                      <span style={{ fontSize: 11.5, color: '#64748b' }}>Processing time reduced effective immediately.</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile Chip */}
            <div
              className="user-chip"
              onClick={() => navigate('/profile')}
              style={{ cursor: 'pointer' }}
            >
              <div className="user-avatar">AK</div>
              <div className="user-info">
                <div className="user-name">Akash Kumar</div>
                <div className="user-id">BT22CSE041</div>
              </div>
            </div>

            {/* Logout Button */}
            <button
              type="button"
              className="logout-btn"
              onClick={handleLogout}
              style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            >
              <LogOut size={15} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── PORTAL BODY: SIDEBAR + MAIN ── */}
      <div className="portal-body">
        {/* Sidebar */}
        <aside className="sidebar">
          <span className="nav-section-label">Main Menu</span>

          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><LayoutDashboard size={18} /></span> Dashboard
          </NavLink>

          <NavLink
            to="/documents"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><FileText size={18} /></span> Apply for Document
          </NavLink>

          <NavLink
            to="/applications"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><FolderArchive size={18} /></span> My Applications
            <span className="nav-badge">2</span>
          </NavLink>

          <NavLink
            to="/track-status"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><Clock3 size={18} /></span> Track Status
          </NavLink>

          <NavLink
            to="/downloads"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><DownloadCloud size={18} /></span> Downloads
          </NavLink>

          <span className="nav-section-label" style={{ marginTop: 14 }}>Account</span>

          <NavLink
            to="/profile"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><UserCheck size={18} /></span> My Profile
          </NavLink>

          <NavLink
            to="/notifications"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><Bell size={18} /></span> Notifications
            <span className="nav-badge">3</span>
          </NavLink>

          <NavLink
            to="/help"
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            <span className="nav-icon"><HelpCircle size={18} /></span> Help &amp; Support
          </NavLink>
        </aside>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {/* ── 3-COLUMN INSTITUTIONAL FOOTER ── */}
      <footer className="site-footer">
        <div className="footer-grid">
          <div className="footer-brand">
            <div className="brand-name">JD College of Engineering and Management</div>
            <p style={{ letterSpacing: '0.5px' }}>Education to Eternity</p>
            <div className="f-contact" style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                <MapPin size={15} style={{ flexShrink: 0, marginTop: 2, color: 'var(--saffron)' }} />
                <span>Khandala, Post: Valni, Near Hanuman Temple, Borgoan Phata, Kalmeshwar Road, Nagpur – 441501</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ flexShrink: 0, color: 'var(--saffron)' }} />
                <span>Helpline: 9011010038 &nbsp;|&nbsp; Fax: (0712) 2023003</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} style={{ flexShrink: 0, color: 'var(--saffron)' }} />
                <span>Support: <a href="mailto:info@jdcoem.ac.in">info@jdcoem.ac.in</a></span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <GraduationCap size={14} style={{ flexShrink: 0, color: 'var(--saffron)' }} />
                <span>Admissions: <a href="mailto:admission@jdcoem.ac.in">admission@jdcoem.ac.in</a> (7774041329)</span>
              </div>
            </div>
          </div>
          <div className="footer-col">
            <h4>Quick Links</h4>
            <ul>
              <li><NavLink to="/dashboard">Dashboard</NavLink></li>
              <li><NavLink to="/documents">Apply for Document</NavLink></li>
              <li><NavLink to="/applications">My Applications</NavLink></li>
              <li><NavLink to="/track-status">Track Application</NavLink></li>
              <li><NavLink to="/downloads">Download Documents</NavLink></li>
              <li><NavLink to="/profile">My Profile</NavLink></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Accreditation &amp; Affiliation</h4>
            <ul>
              <li>Dr. Babasaheb Ambedkar Technological University (DBATU)</li>
              <li>University Grants Commission (UGC Autonomous)</li>
              <li>All India Council for Technical Education (AICTE)</li>
              <li>National Assessment &amp; Accreditation Council (NAAC)</li>
              <li>Government of Maharashtra Higher &amp; Technical Education</li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          &copy; 2026 JD College of Engineering and Management, Nagpur. All Rights Reserved. &nbsp;|&nbsp; Student Digital Document Services Portal
        </div>
      </footer>
    </div>
  );
}

export default AppShell;
