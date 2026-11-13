import { useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Calendar,
  Hash,
  FileText,
  FolderArchive,
  Clock3,
  DownloadCloud,
  FileCheck,
  ShieldCheck,
  Activity,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Bell,
  Megaphone,
  Zap,
  HelpCircle,
  Phone,
  ArrowRight,
  Sparkles,
  FileBadge,
  Award,
  Ticket,
  LogOut,
  Check,
} from 'lucide-react';

const STUDENT = { name: 'Akash Kumar', id: 'BT22CSE041', branch: 'B.Tech – CSE', year: '3rd Year' };

interface DocPreview {
  code: string;
  icon: any;
  iconBg: string;
  iconColor: string;
  title: string;
  desc: string;
  time: string;
  requiredDocs: string;
  category: 'academic' | 'conduct';
  stripeClass: string;
}

const PREVIEW_DOCS: DocPreview[] = [
  // Academic
  { code: 'admission', icon: FileText, iconBg: '#fef3c7', iconColor: '#d97706', title: 'Admission Letter', desc: 'Course, year, roll no. & student details after admission confirmation.', time: '3–5 Days', requiredDocs: 'ID Card + Fee Receipt', category: 'academic', stripeClass: '#f59e0b' },
  { code: 'idcard', icon: Award, iconBg: '#dbeafe', iconColor: '#2563eb', title: 'Identity Card (College ID)', desc: 'Mandatory for campus entry, exams, library & labs.', time: '2–3 Days', requiredDocs: 'Photo + Admission Proof', category: 'academic', stripeClass: '#3b82f6' },
  { code: 'bonafide', icon: FileBadge, iconBg: '#d1fae5', iconColor: '#059669', title: 'Bonafide Certificate', desc: 'Proof of enrollment. Used for scholarships, bank loans, internships, passport.', time: '2 Days', requiredDocs: 'ID + Fee Receipt', category: 'academic', stripeClass: '#10b981' },
  { code: 'hall_ticket', icon: Ticket, iconBg: '#fef9c3', iconColor: '#ca8a04', title: 'Hall Ticket / Admit Card', desc: 'Issued before internal & university exams. Required for exam entry.', time: '1 Day', requiredDocs: 'Fee Clearance', category: 'academic', stripeClass: '#eab308' },
  // Verification & Conduct
  { code: 'leaving', icon: LogOut, iconBg: '#fee2e2', iconColor: '#dc2626', title: 'Transfer Certificate (TC)', desc: 'Issued when leaving the institution. Mandatory for higher education admissions.', time: '7–10 Days', requiredDocs: 'No-Dues + All Marksheets', category: 'conduct', stripeClass: '#ef4444' },
  { code: 'character', icon: Award, iconBg: '#ecfdf5', iconColor: '#059669', title: 'Character / Conduct Certificate', desc: 'Confirms student behavior and discipline throughout the course.', time: '5–7 Days', requiredDocs: 'ID + Attendance Record', category: 'conduct', stripeClass: '#059669' },
  { code: 'noc', icon: Check, iconBg: '#fff7ed', iconColor: '#ea580c', title: 'No Objection Certificate (NOC)', desc: 'For internships, projects, external exams, passport & other purposes.', time: '3–5 Days', requiredDocs: 'ID + Purpose Letter', category: 'conduct', stripeClass: '#ea580c' },
  { code: 'transcript', icon: FileText, iconBg: '#e0f2fe', iconColor: '#0284c7', title: 'Official Transcript', desc: 'Complete academic records with all semester marks. Required for employment & higher studies.', time: '10–15 Days', requiredDocs: 'ID + All Marksheets', category: 'conduct', stripeClass: '#0284c7' },
];

export function StudentDashboardPage() {
  const navigate = useNavigate();

  const academicDocs = PREVIEW_DOCS.filter(d => d.category === 'academic');
  const conductDocs = PREVIEW_DOCS.filter(d => d.category === 'conduct');

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
      {/* ── HERO BANNER (Light Institutional Theme) ── */}
      <div style={{
        background: 'linear-gradient(135deg, #ffffff 0%, #fffbf2 60%, #fff8eb 100%)',
        border: '1.5px solid #fed7aa',
        borderLeft: '5px solid var(--saffron)',
        borderRadius: 14,
        padding: '30px 36px',
        color: 'var(--navy)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 20,
        boxShadow: '0 4px 16px rgba(212, 120, 26, 0.08)',
      }}>
        <div style={{ maxWidth: 580 }}>
          <div style={{ fontSize: 24, fontWeight: 700, margin: '0 0 6px', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', color: 'var(--navy)' }}>
            Welcome back, <span style={{ color: 'var(--saffron)' }}>{STUDENT.name}</span>
          </div>
          <div style={{ fontSize: 13.5, color: '#4b5563', lineHeight: 1.6, marginBottom: 18 }}>
            Access all academic document applications, track administrative processing live, and download signed certificates.
          </div>
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <span style={{ background: '#fff', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <GraduationCap size={14} color="var(--saffron)" /> {STUDENT.branch}
            </span>
            <span style={{ background: '#fff', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <Calendar size={13} color="var(--saffron)" /> {STUDENT.year}
            </span>
            <span style={{ background: '#fff', border: '1px solid #fed7aa', padding: '5px 12px', borderRadius: 20, fontSize: 12, fontWeight: 600, color: 'var(--navy)', fontFamily: 'var(--font-mono)', display: 'inline-flex', alignItems: 'center', gap: 6, boxShadow: '0 1px 2px rgba(0,0,0,0.04)' }}>
              <Hash size={13} color="var(--saffron)" /> {STUDENT.id}
            </span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 14 }}>
          <div style={{ background: '#fff', border: '1.5px solid #fed7aa', borderRadius: 10, padding: '16px 22px', textAlign: 'center', minWidth: 110, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--saffron)', fontFamily: 'var(--font-serif)' }}>2</div>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2, fontWeight: 700 }}>Active Apps</div>
          </div>
          <div style={{ background: '#fff', border: '1.5px solid #bbf7d0', borderRadius: 10, padding: '16px 22px', textAlign: 'center', minWidth: 110, boxShadow: '0 2px 8px rgba(0,0,0,0.03)' }}>
            <div style={{ fontSize: 28, fontWeight: 700, color: '#16a34a', fontFamily: 'var(--font-serif)' }}>1</div>
            <div style={{ fontSize: 11, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px', marginTop: 2, fontWeight: 700 }}>Ready to DL</div>
          </div>
        </div>
      </div>

      {/* ── QUICK ACTIONS (4 CARDS) ── */}
      <div>
        <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--navy)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Zap size={16} color="var(--saffron)" /> Quick Actions
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 14 }}>
          {[
            { to: '/documents', icon: FileText, label: 'Apply for Document', sub: 'Submit a new request', bg: '#eff6ff', c: '#1e40af' },
            { to: '/applications', icon: FolderArchive, label: 'My Applications', sub: 'View all submissions', bg: '#fef3c7', c: '#92400e' },
            { to: '/track-status', icon: Clock3, label: 'Track Status', sub: 'Check progress live', bg: '#f3e8ff', c: '#6b21a8' },
            { to: '/downloads', icon: DownloadCloud, label: 'Downloads', sub: 'Get approved docs', bg: '#dcfce7', c: '#166534' },
          ].map((act, i) => {
            const Icon = act.icon;
            return (
              <div
                key={i}
                onClick={() => navigate(act.to)}
                style={{
                  background: '#fff',
                  border: '1px solid #e2e8f0',
                  borderRadius: 10,
                  padding: '18px 20px',
                  cursor: 'pointer',
                  transition: 'transform 0.15s, box-shadow 0.15s, border-color 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 14,
                  boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(10,22,40,0.08)';
                  e.currentTarget.style.borderColor = 'var(--saffron)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'none';
                  e.currentTarget.style.boxShadow = '0 1px 3px rgba(10,22,40,0.04)';
                  e.currentTarget.style.borderColor = '#e2e8f0';
                }}
              >
                <div style={{ width: 44, height: 44, borderRadius: 10, background: act.bg, color: act.c, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <Icon size={20} />
                </div>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{act.label}</div>
                  <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 2 }}>{act.sub}</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── AVAILABLE DOCUMENTS SECTION ── */}
      <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
          <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <FileCheck size={18} color="var(--saffron)" /> Available Documents
          </div>
          <span
            onClick={() => navigate('/documents')}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--saffron)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            View All Documents <ArrowRight size={14} />
          </span>
        </div>

        {/* Academic category */}
        <div style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <GraduationCap size={16} color="var(--navy)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Academic Documents</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>• 4 documents preview</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {academicDocs.map(doc => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.code}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderTop: `4px solid ${doc.stripeClass}`,
                    borderRadius: 10,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: doc.iconBg, color: doc.iconColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{doc.title}</h4>
                      <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>{doc.desc}</p>
                    </div>
                  </div>

                  <div style={{ margin: '8px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {doc.time}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14, flex: 1 }}>
                    <strong style={{ color: 'var(--navy)' }}>Required:</strong> {doc.requiredDocs}
                  </div>

                  <button
                    onClick={() => navigate(`/applications/new?type=${doc.code}`)}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 8,
                      background: '#fff8eb',
                      color: '#b45309',
                      border: '1.5px solid #f59e0b',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#f59e0b';
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fff8eb';
                      (e.currentTarget as HTMLButtonElement).style.color = '#b45309';
                    }}
                  >
                    Apply Now <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification & Conduct category */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <ShieldCheck size={16} color="var(--navy)" />
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>Verification &amp; Conduct</span>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>• 4 documents preview</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
            {conductDocs.map(doc => {
              const Icon = doc.icon;
              return (
                <div
                  key={doc.code}
                  style={{
                    background: '#fff',
                    border: '1px solid #e2e8f0',
                    borderTop: `4px solid ${doc.stripeClass}`,
                    borderRadius: 10,
                    padding: 18,
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 1px 3px rgba(10,22,40,0.04)',
                  }}
                >
                  <div style={{ display: 'flex', gap: 12, marginBottom: 10 }}>
                    <div style={{ width: 38, height: 38, borderRadius: 8, background: doc.iconBg, color: doc.iconColor, display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                      <Icon size={18} />
                    </div>
                    <div>
                      <h4 style={{ margin: 0, fontSize: 14, fontWeight: 700, color: 'var(--navy)' }}>{doc.title}</h4>
                      <p style={{ margin: '3px 0 0', fontSize: 11.5, color: '#64748b', lineHeight: 1.4 }}>{doc.desc}</p>
                    </div>
                  </div>

                  <div style={{ margin: '8px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 4, fontSize: 11, fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={11} /> {doc.time}
                    </span>
                  </div>

                  <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 14, flex: 1 }}>
                    <strong style={{ color: 'var(--navy)' }}>Required:</strong> {doc.requiredDocs}
                  </div>

                  <button
                    onClick={() => navigate(`/applications/new?type=${doc.code}`)}
                    style={{
                      width: '100%',
                      padding: '9px',
                      borderRadius: 8,
                      background: '#fff8eb',
                      color: '#b45309',
                      border: '1.5px solid #f59e0b',
                      fontWeight: 700,
                      fontSize: 12.5,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 6,
                      transition: 'all 0.2s',
                    }}
                    onMouseOver={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#f59e0b';
                      (e.currentTarget as HTMLButtonElement).style.color = '#fff';
                    }}
                    onMouseOut={e => {
                      (e.currentTarget as HTMLButtonElement).style.background = '#fff8eb';
                      (e.currentTarget as HTMLButtonElement).style.color = '#b45309';
                    }}
                  >
                    Apply Now <ArrowRight size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* ── APPLICATION STATUS MINI-TABLE ── */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <Activity size={17} color="var(--saffron)" /> My Application Status
          </h3>
          <span
            onClick={() => navigate('/applications')}
            style={{ fontSize: 13, fontWeight: 600, color: 'var(--saffron)', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            View All <ArrowRight size={13} />
          </span>
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
              <th style={{ padding: '10px 14px' }}>App ID</th>
              <th style={{ padding: '10px 14px' }}>Document Type</th>
              <th style={{ padding: '10px 14px' }}>Date Applied</th>
              <th style={{ padding: '10px 14px' }}>Status</th>
              <th style={{ padding: '10px 14px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy)' }}>APP-2026-0041</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--navy)' }}>Bonafide Certificate</td>
              <td style={{ padding: '12px 14px', color: '#64748b' }}>01 Nov 2026</td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{ background: '#d1fae5', color: '#065f46', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <CheckCircle2 size={12} /> Approved
                </span>
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                <button
                  onClick={() => navigate('/downloads')}
                  style={{ padding: '6px 14px', borderRadius: 6, background: '#dcfce7', color: '#166534', border: '1px solid #86efac', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}
                >
                  <Download size={12} /> Download
                </button>
              </td>
            </tr>
            <tr>
              <td style={{ padding: '12px 14px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy)' }}>APP-2026-0063</td>
              <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--navy)' }}>Official Transcript</td>
              <td style={{ padding: '12px 14px', color: '#64748b' }}>08 Nov 2026</td>
              <td style={{ padding: '12px 14px' }}>
                <span style={{ background: '#fef3c7', color: '#92400e', padding: '3px 10px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                  <Clock size={12} /> Pending HOD
                </span>
              </td>
              <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                <button
                  onClick={() => navigate('/track-status')}
                  style={{ padding: '5px 12px', borderRadius: 6, background: '#f1f5f9', color: 'var(--navy)', border: '1px solid #cbd5e1', fontSize: 12, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  <Eye size={12} /> View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* ── TWO COLUMN: ANNOUNCEMENTS + HELP ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 20 }}>
        {/* Announcements */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
              <Bell size={17} color="var(--saffron)" /> Official Notices
            </h3>
            <span onClick={() => navigate('/notifications')} style={{ fontSize: 12, color: 'var(--saffron)', cursor: 'pointer', fontWeight: 600 }}>
              See all
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
              <Megaphone size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 13, color: 'var(--navy)' }}>Semester VI Hall Tickets Released</strong>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Today, 10:00 AM • Examination Cell</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10, paddingBottom: 10, borderBottom: '1px solid #f1f5f9' }}>
              <Zap size={16} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 13, color: 'var(--navy)' }}>Bonafide Processing Time: Now 2 Days</strong>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Yesterday, 3:30 PM • Academic Section</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <Calendar size={16} color="#dc2626" style={{ flexShrink: 0, marginTop: 2 }} />
              <div>
                <strong style={{ fontSize: 13, color: 'var(--navy)' }}>Office Closed – Public Holiday</strong>
                <div style={{ fontSize: 11.5, color: '#94a3b8', marginTop: 2 }}>Document counter closed on national holiday</div>
              </div>
            </div>
          </div>
        </div>

        {/* 4-Step Support Overview */}
        <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10, padding: 22, boxShadow: '0 1px 3px rgba(10,22,40,0.04)' }}>
          <h3 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--navy)', display: 'flex', alignItems: 'center', gap: 8 }}>
            <HelpCircle size={17} color="var(--saffron)" /> Academic Document Desk
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, fontSize: 13, color: '#475569' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Phone size={14} color="var(--navy)" style={{ flexShrink: 0, marginTop: 3 }} />
              <div>
                <strong>Student Helpline:</strong> 9011010038 / 7774041329
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
              <Clock size={14} color="var(--navy)" style={{ flexShrink: 0, marginTop: 3 }} />
              <div>
                <strong>Counter Working Hours:</strong> Mon–Sat | 9:00 AM – 5:30 PM
              </div>
            </div>
          </div>
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid #f1f5f9' }}>
            <button
              onClick={() => navigate('/help')}
              style={{
                width: '100%',
                padding: '9px',
                borderRadius: 6,
                background: '#f8faf9',
                border: '1px solid #cbd5e1',
                color: 'var(--navy)',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
              }}
            >
              <HelpCircle size={14} /> Open FAQs &amp; Help Desk
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default StudentDashboardPage;
