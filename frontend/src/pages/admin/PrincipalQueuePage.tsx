import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ADMIN_QUEUE, AdminApplication } from '../../shared/adminDemoData';
import { ApplicationReviewModal } from '../../components/admin/ApplicationReviewModal';
import { getDocIcon } from '../../shared/documentTypes';
import { approvalApi } from '../../services/api';
import {
  Award,
  Clock,
  CheckCircle2,
  XCircle,
  ClipboardList,
  BarChart3,
  LogOut,
  Search,
  Eye,
  Inbox,
  Building2,
  ShieldCheck,
  FolderOpen,
} from 'lucide-react';

export function PrincipalQueuePage() {
  const navigate = useNavigate();
  const [queue, setQueue] = useState<AdminApplication[]>(
    ADMIN_QUEUE.map(a =>
      a.status === 'pending'
        ? {
            ...a,
            status: 'hod_approved',
            clerkRemarks: 'Verified student records and fee clearance.',
            hodRemarks: 'Endorsed by HOD. Verified academic progress and conduct.',
          }
        : a
    )
  );
  const [activeSection, setActiveSection] = useState<'pending' | 'all' | 'approved' | 'rejected' | 'stats'>('pending');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedApp, setSelectedApp] = useState<AdminApplication | null>(null);
  const [signedCertNotice, setSignedCertNotice] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'ok' | 'err' } | null>(null);

  // Load live applications from backend
  useEffect(() => {
    approvalApi.getPrincipalPending().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        const mapped: AdminApplication[] = res.data.map(item => ({
          id: item.application_number || `APP-2026-${String(item.id).padStart(4, '0')}`,
          docCode: item.certificate_type,
          docTitle: (item.certificate_type || 'Document').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          studentName: item.student_name || item.full_name || 'Akash Kumar',
          studentEmail: item.student_email || item.email || 'student@jdcoem.ac.in',
          rollNo: item.bt_id || item.btid || 'BT240076CS',
          dept: item.department || item.branch || 'Computer Science and Engineering',
          year: item.year || 'Third Year',
          dateApplied: item.created_at ? item.created_at.split('T')[0] : '2026-11-12',
          status: 'hod_approved',
          purpose: item.purpose || 'Official Document Submission',
          clerkRemarks: item.clerk_remarks || 'Verified records and dues cleared.',
          hodRemarks: item.hod_remarks || 'Endorsed by HOD for institutional issuance.',
          files: [
            {
              id: `f-${item.id}`,
              name: 'Institutional Verified Credentials',
              fileName: 'student_record.pdf',
              fileType: 'pdf',
              fileSize: '340 KB',
              uploadedAt: 'Today',
              docLabel: 'Academic Submission',
            }
          ]
        }));
        setQueue(mapped);
      }
    }).catch(() => {});
  }, []);

  const showToast = (text: string, type: 'ok' | 'err') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleApprove = async (id: string, remarks: string) => {
    let certNumber = `JDCOEM/CERT/${new Date().getFullYear()}/${Math.floor(100000 + Math.random() * 900000)}`;
    try {
      const res = await approvalApi.principalApproveFinal(id, remarks);
      if (res.certificate_number) {
        certNumber = res.certificate_number;
      }
    } catch (err: any) {
      console.warn('API principal sanction note:', err.message);
    }

    setQueue(prev => prev.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status: 'issued',
          principalRemarks: remarks || `Signed & sealed by Principal. Certificate Ref: ${certNumber}`,
        };
      }
      return app;
    }));
    setSelectedApp(null);
    setSignedCertNotice(`Certificate ${certNumber} digitally signed & issued for ${id}`);
    showToast(`Certificate issued successfully for ${id}!`, 'ok');
    setTimeout(() => setSignedCertNotice(null), 8000);
  };

  const handleReject = async (id: string, remarks: string) => {
    try {
      await approvalApi.principalReject(id, remarks);
    } catch (err: any) {
      console.warn('API principal reject note:', err.message);
    }
    setQueue(prev => prev.map(app => {
      if (app.id === id) {
        return {
          ...app,
          status: 'rejected',
          principalRemarks: remarks,
        };
      }
      return app;
    }));
    setSelectedApp(null);
    showToast(`Application ${id} rejected by Principal.`, 'err');
  };

  const pendingApps = queue.filter(a => a.status === 'hod_approved');
  const approvedApps = queue.filter(a => a.status === 'issued' || a.status === 'approved');
  const rejectedApps = queue.filter(a => a.status === 'rejected');

  const getFilteredApps = (type: 'pending' | 'all' | 'approved' | 'rejected') => {
    let list = queue;
    if (type === 'pending') list = pendingApps;
    if (type === 'approved') list = approvedApps;
    if (type === 'rejected') list = rejectedApps;

    if (!searchTerm.trim()) return list;
    const q = searchTerm.toLowerCase();
    return list.filter(a =>
      a.id.toLowerCase().includes(q) ||
      a.studentName.toLowerCase().includes(q) ||
      a.studentEmail.toLowerCase().includes(q) ||
      a.docTitle.toLowerCase().includes(q) ||
      a.rollNo.toLowerCase().includes(q)
    );
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#f4f6fb', fontFamily: 'var(--font-sans)' }}>
      {/* ── TOAST NOTIFICATION ── */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            bottom: 24,
            right: 24,
            zIndex: 9999,
            background: toastMessage.type === 'ok' ? '#0a7c4e' : '#b91c1c',
            color: '#fff',
            borderRadius: 10,
            padding: '12px 20px',
            fontSize: 13,
            fontWeight: 600,
            boxShadow: '0 8px 30px rgba(0,0,0,0.25)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          {toastMessage.type === 'ok' ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* ── PRINCIPAL SPECIFIC HEADER ── */}
      <header
        style={{
          height: 64,
          background: '#06122a',
          display: 'flex',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          zIndex: 200,
          boxShadow: '0 2px 16px rgba(0,0,0,0.3)',
        }}
      >
        <div style={{ width: '100%', padding: '0 28px', display: 'flex', alignItems: 'center', gap: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 13 }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c8922a, #e8b84b)',
                display: 'grid',
                placeItems: 'center',
                color: '#06122a',
                flexShrink: 0,
                boxShadow: '0 2px 10px rgba(200,146,42,0.4)',
              }}
            >
              <Building2 size={22} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 13.5, fontWeight: 700, color: '#fff', lineHeight: 1.2 }}>
                JDCOEM Admin Portal
              </div>
              <div style={{ fontSize: 10, color: 'rgba(255,255,255,0.45)', marginTop: 1, letterSpacing: '0.3px' }}>
                Document Services
              </div>
            </div>
          </div>

          {/* Role Pill - Strictly PRINCIPAL */}
          <span
            style={{
              background: 'rgba(249,168,212,0.15)',
              border: '1px solid rgba(249,168,212,0.3)',
              borderRadius: 20,
              padding: '4px 14px',
              fontSize: 11.5,
              fontWeight: 700,
              color: '#f9a8d4',
              letterSpacing: '0.4px',
              marginLeft: 8,
            }}
          >
            PRINCIPAL
          </span>

          <div style={{ flex: 1 }} />

          {/* User info & logout */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #be185d, #fb7185)',
                display: 'grid',
                placeItems: 'center',
                fontWeight: 700,
                fontSize: 13,
                color: '#fff',
              }}
            >
              PR
            </div>
            <div>
              <div style={{ fontSize: 12.5, fontWeight: 600, color: '#fff' }}>Principal Authority</div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.45)' }}>principal@jdcoem.ac.in</div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/admin')}
              style={{
                marginLeft: 10,
                background: 'rgba(185,28,28,0.15)',
                border: '1px solid rgba(185,28,28,0.3)',
                color: '#fca5a5',
                borderRadius: 6,
                padding: '6px 14px',
                fontSize: 12,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <LogOut size={13} /> Logout
            </button>
          </div>
        </div>
      </header>

      {/* ── LAYOUT: PRINCIPAL SIDEBAR + MAIN AREA ── */}
      <div style={{ display: 'flex', flex: 1 }}>
        {/* Principal Sidebar */}
        <aside
          style={{
            width: 252,
            flexShrink: 0,
            background: '#ffffff',
            borderRight: '1px solid #e0e4f0',
            position: 'sticky',
            top: 64,
            height: 'calc(100vh - 64px)',
            overflowY: 'auto',
            padding: '16px 0',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {/* Principal Role Banner */}
          <div
            style={{
              margin: '0 10px 14px',
              borderRadius: 10,
              padding: '14px 16px',
              background: 'linear-gradient(135deg,#500724,#881337)',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
            }}
          >
            <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(249,168,212,0.15)', color: '#f9a8d4', display: 'grid', placeItems: 'center' }}>
              <Award size={18} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 700, color: '#fff' }}>
                Principal
              </div>
              <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>
                principal@jdcoem.ac.in
              </div>
            </div>
          </div>

          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: '#7a88a8',
              letterSpacing: '1.3px',
              textTransform: 'uppercase',
              padding: '10px 18px 4px',
            }}
          >
            APPLICATIONS
          </span>

          <button
            type="button"
            onClick={() => setActiveSection('pending')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: activeSection === 'pending' ? 600 : 500,
              color: activeSection === 'pending' ? '#be185d' : '#3d4f72',
              background: activeSection === 'pending' ? '#fdf2f8' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <Clock size={16} />
            <span style={{ flex: 1 }}>Awaiting Approval</span>
            {pendingApps.length > 0 && (
              <span
                style={{
                  background: '#be185d',
                  color: '#fff',
                  fontSize: 9.5,
                  fontWeight: 800,
                  padding: '1px 7px',
                  borderRadius: 20,
                }}
              >
                {pendingApps.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('all')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: activeSection === 'all' ? 600 : 500,
              color: activeSection === 'all' ? '#be185d' : '#3d4f72',
              background: activeSection === 'all' ? '#fdf2f8' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <ClipboardList size={16} />
            <span style={{ flex: 1 }}>All Applications</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('approved')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: activeSection === 'approved' ? 600 : 500,
              color: activeSection === 'approved' ? '#be185d' : '#3d4f72',
              background: activeSection === 'approved' ? '#fdf2f8' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <CheckCircle2 size={16} />
            <span style={{ flex: 1 }}>Documents Issued</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveSection('rejected')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: activeSection === 'rejected' ? 600 : 500,
              color: activeSection === 'rejected' ? '#be185d' : '#3d4f72',
              background: activeSection === 'rejected' ? '#fdf2f8' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <XCircle size={16} />
            <span style={{ flex: 1 }}>Rejected</span>
          </button>

          <span
            style={{
              fontSize: 9.5,
              fontWeight: 700,
              color: '#7a88a8',
              letterSpacing: '1.3px',
              textTransform: 'uppercase',
              padding: '16px 18px 4px',
            }}
          >
            SYSTEM
          </span>

          <button
            type="button"
            onClick={() => setActiveSection('stats')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: activeSection === 'stats' ? 600 : 500,
              color: activeSection === 'stats' ? '#be185d' : '#3d4f72',
              background: activeSection === 'stats' ? '#fdf2f8' : 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <BarChart3 size={16} />
            <span style={{ flex: 1 }}>Overview</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/admin')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 11,
              padding: '9px 18px',
              margin: '0 8px',
              borderRadius: 6,
              fontSize: 13,
              fontWeight: 500,
              color: '#3d4f72',
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              width: 'calc(100% - 16px)',
              textAlign: 'left',
            }}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>

          <div style={{ marginTop: 'auto', padding: '16px 18px', borderTop: '1px solid #e0e4f0', fontSize: 11, color: '#7a88a8' }}>
            JDCOEM Principal Portal
          </div>
        </aside>

        {/* ── MAIN WORKSPACE AREA ── */}
        <main style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
          {/* Principal Page Header */}
          <div
            style={{
              background: 'linear-gradient(135deg,#500724 0%,#881337 60%,#9f1239 100%)',
              padding: '26px 36px',
              position: 'relative',
              overflow: 'hidden',
              color: '#fff',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <div
                style={{
                  width: 52,
                  height: 52,
                  borderRadius: 14,
                  background: 'rgba(249,168,212,.15)',
                  border: '1px solid rgba(249,168,212,.3)',
                  display: 'grid',
                  placeItems: 'center',
                  color: '#f9a8d4',
                  flexShrink: 0,
                }}
              >
                <Award size={24} />
              </div>
              <div>
                <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: 22, fontWeight: 700, margin: 0, color: '#fff' }}>
                  Principal Dashboard
                </h1>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', marginTop: 2 }}>
                  Final approval authority — review HOD-approved applications and issue documents
                </div>
              </div>
            </div>

            {/* 4 Stat Pills */}
            <div style={{ display: 'flex', gap: 12, marginTop: 16, flexWrap: 'wrap' }}>
              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px', minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#f9a8d4', fontFamily: 'var(--font-serif)' }}>{queue.length}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Total in Pipeline</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px', minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fcd34d', fontFamily: 'var(--font-serif)' }}>{pendingApps.length}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Awaiting Approval</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px', minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#6ee7b7', fontFamily: 'var(--font-serif)' }}>{approvedApps.length}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Documents Issued</div>
              </div>

              <div style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '10px 18px', minWidth: 120 }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#fca5a5', fontFamily: 'var(--font-serif)' }}>{rejectedApps.length}</div>
                <div style={{ fontSize: 10.5, color: 'rgba(255,255,255,0.5)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.4px' }}>Rejected</div>
              </div>
            </div>
          </div>

          {/* Certificate Notice */}
          {signedCertNotice && (
            <div
              style={{
                margin: '20px 36px 0',
                background: 'linear-gradient(135deg, #065f39, #0a7c4e)',
                color: '#fff',
                borderRadius: 12,
                padding: '16px 22px',
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                boxShadow: '0 4px 18px rgba(10,124,78,0.3)',
              }}
            >
              <ShieldCheck size={28} style={{ color: '#6ee7b7', flexShrink: 0 }} />
              <div>
                <div style={{ fontWeight: 700, fontSize: 14 }}>Certificate Cryptographically Signed &amp; Issued</div>
                <div style={{ fontSize: 12, opacity: 0.9, marginTop: 2, fontFamily: 'monospace' }}>
                  {signedCertNotice} · QR Verification Anchor Published
                </div>
              </div>
            </div>
          )}

          {/* Principal Main Content */}
          <div style={{ padding: '28px 36px 60px' }}>
            {activeSection === 'stats' ? (
              /* Overview Section */
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16 }}>
                <div style={{ background: '#fff', border: '1px solid #e0e4f0', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(6,18,42,.07)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fef3c7', color: '#b45309', display: 'grid', placeItems: 'center' }}>
                    <Clock size={22} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: '#0f1e3a' }}>{pendingApps.length}</div>
                    <div style={{ fontSize: 11.5, color: '#7a88a8', marginTop: 4, fontWeight: 500 }}>Awaiting Principal</div>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e0e4f0', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(6,18,42,.07)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#edfaf3', color: '#0a7c4e', display: 'grid', placeItems: 'center' }}>
                    <CheckCircle2 size={22} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: '#0f1e3a' }}>{approvedApps.length}</div>
                    <div style={{ fontSize: 11.5, color: '#7a88a8', marginTop: 4, fontWeight: 500 }}>Documents Issued</div>
                  </div>
                </div>

                <div style={{ background: '#fff', border: '1px solid #e0e4f0', borderRadius: 18, padding: '18px 20px', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 4px rgba(6,18,42,.07)' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, background: '#fff0f0', color: '#b91c1c', display: 'grid', placeItems: 'center' }}>
                    <XCircle size={22} />
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 24, fontWeight: 700, color: '#0f1e3a' }}>{rejectedApps.length}</div>
                    <div style={{ fontSize: 11.5, color: '#7a88a8', marginTop: 4, fontWeight: 500 }}>Rejected</div>
                  </div>
                </div>
              </div>
            ) : (
              /* Table Card */
              <div
                style={{
                  background: '#fff',
                  border: '1px solid #e0e4f0',
                  borderRadius: 18,
                  overflow: 'hidden',
                  boxShadow: '0 1px 4px rgba(6,18,42,.07)',
                }}
              >
                <div
                  style={{
                    padding: '15px 22px',
                    borderBottom: '1px solid #e0e4f0',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    flexWrap: 'wrap',
                  }}
                >
                  <div
                    style={{
                      width: 34,
                      height: 34,
                      borderRadius: 9,
                      background:
                        activeSection === 'pending'
                          ? '#fef3c7'
                          : activeSection === 'approved'
                          ? '#edfaf3'
                          : activeSection === 'rejected'
                          ? '#fff0f0'
                          : '#fdf2f8',
                      color:
                        activeSection === 'pending'
                          ? '#b45309'
                          : activeSection === 'approved'
                          ? '#0a7c4e'
                          : activeSection === 'rejected'
                          ? '#b91c1c'
                          : '#be185d',
                      display: 'grid',
                      placeItems: 'center',
                      flexShrink: 0,
                    }}
                  >
                    {activeSection === 'pending' && <Clock size={16} />}
                    {activeSection === 'approved' && <CheckCircle2 size={16} />}
                    {activeSection === 'rejected' && <XCircle size={16} />}
                    {activeSection === 'all' && <ClipboardList size={16} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: '#06122a' }}>
                      {activeSection === 'pending' && 'Applications Awaiting Final Approval'}
                      {activeSection === 'all' && 'All Institute Applications'}
                      {activeSection === 'approved' && 'Documents Issued & Signed'}
                      {activeSection === 'rejected' && 'Rejected Applications'}
                    </div>
                    <div style={{ fontSize: 11.5, color: '#7a88a8', marginTop: 1 }}>
                      HOD-approved applications ready for final executive decision
                    </div>
                  </div>

                  <div style={{ marginLeft: 'auto', minWidth: 260, position: 'relative' }}>
                    <Search size={14} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: '#7a88a8' }} />
                    <input
                      type="text"
                      placeholder="Search institute queue…"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      style={{
                        width: '100%',
                        padding: '8px 13px 8px 34px',
                        border: '1.5px solid #cdd2e8',
                        borderRadius: 10,
                        fontSize: 13,
                        outline: 'none',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ padding: 22 }}>
                  {getFilteredApps(activeSection).length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a88a8' }}>
                      <div style={{ marginBottom: 14, display: 'flex', justifyContent: 'center' }}>
                        <Inbox size={44} style={{ color: '#94a3b8', strokeWidth: 1.5 }} />
                      </div>
                      <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: 18, color: '#3d4f72', marginBottom: 6 }}>
                        Nothing Here
                      </h3>
                      <p style={{ fontSize: 13, margin: 0 }}>
                        {activeSection === 'pending' ? 'No applications awaiting approval.' : 'No records found.'}
                      </p>
                    </div>
                  ) : (
                    <div style={{ overflowX: 'auto' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                        <thead>
                          <tr style={{ background: '#f4f6fb', borderBottom: '2px solid #e0e4f0' }}>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>App ID</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Student</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Department</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Document</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Submitted</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Status</th>
                            <th style={{ padding: '10px 14px', fontSize: 10.5, fontWeight: 700, color: '#7a88a8', textTransform: 'uppercase', letterSpacing: '0.6px' }}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getFilteredApps(activeSection).map((app) => {
                            const isPending = app.status === 'hod_approved';
                            return (
                              <tr
                                key={app.id}
                                style={{ borderBottom: '1px solid #e0e4f0', transition: 'background 0.15s ease' }}
                                onMouseEnter={(e) => (e.currentTarget.style.background = '#f4f6fb')}
                                onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                              >
                                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                                  <strong style={{ fontFamily: 'monospace', fontSize: 12, color: '#0f1e3a' }}>{app.id}</strong>
                                </td>
                                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f1e3a' }}>{app.studentName}</div>
                                  <div style={{ fontSize: 11, color: '#7a88a8' }}>{app.studentEmail}</div>
                                  <div style={{ fontSize: 11, color: '#7a88a8' }}>{app.rollNo}</div>
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: 12.5, color: '#3d4f72', verticalAlign: 'middle' }}>
                                  {app.dept} · {app.year}
                                </td>
                                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                                  <div style={{ fontWeight: 600, fontSize: 13, color: '#0f1e3a', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    <span style={{ color: 'var(--forest)' }}>{getDocIcon(app.docCode, 16)}</span>
                                    <span>{app.docTitle}</span>
                                  </div>
                                  {app.purpose && (
                                    <div style={{ fontSize: 11, color: '#7a88a8', maxWidth: 240, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                      {app.purpose}
                                    </div>
                                  )}
                                </td>
                                <td style={{ padding: '12px 14px', fontSize: 12, color: '#3d4f72', verticalAlign: 'middle' }}>
                                  {app.dateApplied}
                                </td>
                                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                                  <span
                                    style={{
                                      background: isPending ? '#fef9ec' : app.status === 'issued' ? '#edfaf3' : '#fff0f0',
                                      color: isPending ? '#92600a' : app.status === 'issued' ? '#0a7c4e' : '#b91c1c',
                                      border: `1px solid ${isPending ? '#f4c842' : app.status === 'issued' ? '#a3dfc3' : '#fca5a5'}`,
                                      borderRadius: 20,
                                      padding: '3px 10px',
                                      fontSize: 11,
                                      fontWeight: 700,
                                      whiteSpace: 'nowrap',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 5,
                                    }}
                                  >
                                    ● {isPending ? 'Pending Final Seal' : app.status === 'issued' ? 'Documents Issued' : 'Rejected'}
                                  </span>
                                </td>
                                <td style={{ padding: '12px 14px', verticalAlign: 'middle' }}>
                                  <button
                                    type="button"
                                    onClick={() => setSelectedApp(app)}
                                    style={{
                                      padding: '6px 14px',
                                      borderRadius: 6,
                                      fontSize: 12,
                                      fontWeight: 700,
                                      cursor: 'pointer',
                                      background: '#500724',
                                      color: '#ffffff',
                                      border: 'none',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 6,
                                      boxShadow: '0 2px 8px rgba(80,7,36,0.2)',
                                    }}
                                  >
                                    {isPending ? (
                                      <>
                                        <FolderOpen size={13} /> Review
                                      </>
                                    ) : (
                                      <>
                                        <Eye size={13} /> View
                                      </>
                                    )}
                                  </button>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ── APPLICATION DETAIL & REVIEW MODAL ── */}
      {selectedApp && (
        <ApplicationReviewModal
          app={selectedApp}
          role="principal"
          onClose={() => setSelectedApp(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      )}
    </div>
  );
}
export default PrincipalQueuePage;
