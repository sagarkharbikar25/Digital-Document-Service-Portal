import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Application, DEMO_APPLICATIONS } from '../../shared/demoData';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { applicationApi } from '../../services/api';
import {
  FolderArchive,
  FileText,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Plus,
  Eye,
  Download,
  X,
  Paperclip,
  Activity,
  FileCheck,
} from 'lucide-react';

const STATUS_MAP: Record<string, { label: string; bg: string; color: string; dot: string }> = {
  pending: { label: 'Pending Clerk Review', bg: '#fef3c7', color: '#92400e', dot: 'var(--warn, #f59e0b)' },
  clerk_approved: { label: 'Clerk Verified', bg: '#dbeafe', color: '#1e40af', dot: 'var(--info, #3b82f6)' },
  hod_approved: { label: 'HOD Recommended', bg: '#ede9fe', color: '#5b21b6', dot: 'var(--violet, #8b5cf6)' },
  approved: { label: 'Principal Sanctioned', bg: '#d1fae5', color: '#065f46', dot: 'var(--success, #10b981)' },
  issued: { label: 'Ready for Download', bg: '#d1fae5', color: '#065f46', dot: 'var(--success, #10b981)' },
  rejected: { label: 'Rejected', bg: '#fee2e2', color: '#991b1b', dot: 'var(--error, #ef4444)' },
};

export function ApplicationsPage() {
  const navigate = useNavigate();
  const { id: paramId } = useParams();
  const [apps, setApps] = useState<Application[]>(DEMO_APPLICATIONS);

  useEffect(() => {
    applicationApi.getMy().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        const mapped: Application[] = res.data.map(item => ({
          id: item.application_number || `APP-2026-${String(item.id).padStart(4, '0')}`,
          docCode: item.certificate_type,
          docTitle: (item.certificate_type || 'Document').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          dateApplied: item.created_at ? item.created_at.split('T')[0] : '2026-11-01',
          status: item.status === 'issued' ? 'issued' : item.status === 'pending_principal' ? 'approved' : item.status === 'pending_hod' ? 'clerk_approved' : item.status === 'rejected' ? 'rejected' : 'pending',
          statusLabel: item.status === 'issued' ? 'Ready for Download' : item.status === 'pending_principal' ? 'Principal Sanction Pending' : item.status === 'pending_hod' ? 'HOD Review' : item.status === 'rejected' ? 'Rejected' : 'Pending Clerk Review',
          processingDays: '2–3 Days',
          purpose: item.purpose || 'Official Document Submission',
          files: item.files || ['verified_submission.pdf'],
        }));
        setApps(mapped);
      }
    }).catch(err => {
      console.warn('API error, using fallback demo applications:', err.message);
    });
  }, []);
  const [selectedApp, setSelectedApp] = useState<Application | null>(
    paramId ? (DEMO_APPLICATIONS.find(a => a.id === paramId) ?? null) : null
  );
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');

  const filteredApps = apps.filter(app => {
    const matchesSearch = app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.docTitle.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !statusFilter || (
      (statusFilter === 'Pending' && app.status === 'pending') ||
      (statusFilter === 'Verified' && app.status === 'clerk_approved') ||
      (statusFilter === 'Processing' && app.status === 'hod_approved') ||
      (statusFilter === 'Approved' && (app.status === 'approved' || app.status === 'issued')) ||
      (statusFilter === 'Rejected' && app.status === 'rejected')
    );
    const matchesType = !typeFilter || app.docTitle === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const counts = {
    total: apps.length,
    pending: apps.filter(a => a.status === 'pending' || a.status === 'clerk_approved' || a.status === 'hod_approved').length,
    approved: apps.filter(a => a.status === 'approved' || a.status === 'issued').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* ── PAGE HERO ── */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Applications' },
          ]} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FolderArchive size={24} color="var(--saffron)" /> My Applications
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13.5 }}>
            View and track all formal certificate and transcript requests submitted by you.
          </p>
        </div>
        <button
          className="btn"
          style={{
            background: '#fff8eb',
            color: '#b45309',
            border: '1.5px solid #d4781a',
            padding: '10px 18px',
            borderRadius: 8,
            fontWeight: 700,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            boxShadow: '0 1px 3px rgba(212, 120, 26, 0.12)',
            transition: 'all 0.2s',
          }}
          onMouseOver={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#d4781a';
            (e.currentTarget as HTMLButtonElement).style.color = '#fff';
          }}
          onMouseOut={e => {
            (e.currentTarget as HTMLButtonElement).style.background = '#fff8eb';
            (e.currentTarget as HTMLButtonElement).style.color = '#b45309';
          }}
          onClick={() => navigate('/documents')}
        >
          <Plus size={16} /> Apply for New Document
        </button>
      </div>

      {/* ── SUMMARY STATS ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #3b82f6', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Total Submissions</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center' }}>
              <FileText size={18} color="#2563eb" />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>{counts.total}</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #f59e0b', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Under Review</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fffbeb', display: 'grid', placeItems: 'center' }}>
              <Clock size={18} color="#d97706" />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>{counts.pending}</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #10b981', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Sanctioned / Issued</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'grid', placeItems: 'center' }}>
              <CheckCircle2 size={18} color="#059669" />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>{counts.approved}</div>
        </div>
        <div className="card" style={{ padding: 18, borderLeft: '4px solid #ef4444', background: '#fff' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Rejected / Requires Action</span>
            <div style={{ width: 34, height: 34, borderRadius: 8, background: '#fef2f2', display: 'grid', placeItems: 'center' }}>
              <XCircle size={18} color="#dc2626" />
            </div>
          </div>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--navy)', marginTop: 8, fontFamily: 'var(--font-serif)' }}>{counts.rejected}</div>
        </div>
      </div>

      {/* ── FILTER BAR ── */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px', background: '#fff' }}>
          <Search size={15} color="#94a3b8" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search App ID or document title…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: 13 }}
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
        >
          <option value="">All Review Stages</option>
          <option>Pending</option>
          <option>Verified</option>
          <option>Processing</option>
          <option>Approved</option>
          <option>Rejected</option>
        </select>
        <select
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
        >
          <option value="">All Document Types</option>
          {Array.from(new Set(apps.map(a => a.docTitle))).map(title => (
            <option key={title} value={title}>{title}</option>
          ))}
        </select>
        <span style={{ fontSize: 13, color: '#64748b' }}>
          Showing <b>{filteredApps.length}</b> of <b>{apps.length}</b>
        </span>
        {(searchTerm || statusFilter || typeFilter) && (
          <button
            onClick={() => { setSearchTerm(''); setStatusFilter(''); setTypeFilter(''); }}
            style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', fontSize: 13, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
          >
            <X size={14} /> Clear filters
          </button>
        )}
      </div>

      {/* ── TABLE CARD ── */}
      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        {filteredApps.length === 0 ? (
          <div style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
              <FolderArchive size={24} color="#94a3b8" />
            </div>
            <h3 style={{ margin: 0, color: 'var(--navy)' }}>No Applications Found</h3>
            <p style={{ color: '#64748b', fontSize: 14 }}>Try adjusting your search or stage filters.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Application ID</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Document Title</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Submission Date</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Processing Window</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600 }}>Current Status</th>
                  <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredApps.map(app => {
                  const s = STATUS_MAP[app.status] ?? { label: app.status, bg: '#f3f4f6', color: '#374151' };
                  return (
                    <tr key={app.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '14px 20px', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--navy)' }}>
                        {app.id}
                      </td>
                      <td style={{ padding: '14px 20px', fontWeight: 600, color: 'var(--navy)' }}>
                        {app.docTitle}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {app.dateApplied}
                      </td>
                      <td style={{ padding: '14px 20px', color: '#64748b' }}>
                        {app.processingDays}
                      </td>
                      <td style={{ padding: '14px 20px' }}>
                        <span style={{
                          padding: '4px 10px',
                          borderRadius: 20,
                          fontSize: 11.5,
                          fontWeight: 700,
                          background: s.bg,
                          color: s.color,
                        }}>
                          {s.label}
                        </span>
                      </td>
                      <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => setSelectedApp(app)}
                            style={{
                              padding: '6px 12px',
                              borderRadius: 6,
                              border: '1px solid #cbd5e1',
                              background: '#fff',
                              fontSize: 12,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              color: 'var(--navy)',
                            }}
                          >
                            <Eye size={13} /> View
                          </button>
                          {(app.status === 'issued' || app.status === 'approved') && (
                            <button
                              onClick={() => alert(`Downloading official certificate for ${app.id}...`)}
                              style={{
                                padding: '6px 12px',
                                borderRadius: 6,
                                border: 'none',
                                background: '#10b981',
                                color: '#fff',
                                fontSize: 12,
                                fontWeight: 600,
                                cursor: 'pointer',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: 6,
                              }}
                            >
                              <Download size={13} /> PDF
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── DETAIL DRAWER / MODAL ── */}
      {selectedApp && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(10,22,40,0.5)',
            backdropFilter: 'blur(3px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
            padding: 20,
          }}
          onClick={() => setSelectedApp(null)}
        >
          <div
            className="card"
            style={{
              maxWidth: 620,
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              padding: 28,
              boxShadow: '0 20px 40px rgba(10,22,40,0.25)',
              border: '1px solid #cbd5e1',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, borderBottom: '1px solid #e2e8f0', paddingBottom: 16 }}>
              <div>
                <h3 style={{ margin: 0, fontSize: 18, color: 'var(--navy)', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: 8 }}>
                  <FileCheck size={20} color="var(--saffron)" /> Application Record
                </h3>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#64748b' }}>{selectedApp.id}</span>
              </div>
              <button
                onClick={() => setSelectedApp(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', display: 'grid', placeItems: 'center' }}
              >
                <X size={20} />
              </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, marginBottom: 20 }}>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Document Type</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--navy)', marginTop: 2 }}>{selectedApp.docTitle}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Review Status</div>
                <div style={{ marginTop: 2 }}>
                  <span style={{
                    padding: '3px 10px',
                    borderRadius: 20,
                    fontSize: 11.5,
                    fontWeight: 700,
                    background: STATUS_MAP[selectedApp.status]?.bg,
                    color: STATUS_MAP[selectedApp.status]?.color,
                  }}>
                    {STATUS_MAP[selectedApp.status]?.label}
                  </span>
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Date Submitted</div>
                <div style={{ fontSize: 13.5, color: 'var(--navy)', marginTop: 2 }}>{selectedApp.dateApplied}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600 }}>Standard Processing</div>
                <div style={{ fontSize: 13.5, color: 'var(--navy)', marginTop: 2 }}>{selectedApp.processingDays}</div>
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Declared Purpose</div>
              <div style={{ padding: 12, background: '#f8faf9', borderRadius: 8, fontSize: 13, color: 'var(--navy)', border: '1px solid #e2e8f0' }}>
                {selectedApp.purpose || 'No special purpose remarks provided.'}
              </div>
            </div>

            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, color: '#64748b', textTransform: 'uppercase', fontWeight: 600, marginBottom: 6 }}>Uploaded Mandatory Attachments</div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {selectedApp.files.map((file, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', background: '#f8faf9', borderRadius: 6, fontSize: 12.5, border: '1px solid #edf2f7' }}>
                    <Paperclip size={14} color="#64748b" />
                    <span style={{ flex: 1, fontFamily: 'var(--font-mono)' }}>{file}</span>
                    <span style={{ color: '#059669', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> Verified
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24, borderTop: '1px solid #e2e8f0', paddingTop: 16 }}>
              <button
                onClick={() => navigate('/track-status')}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Activity size={14} /> Live Timeline
              </button>
              {(selectedApp.status === 'issued' || selectedApp.status === 'approved') && (
                <button
                  onClick={() => alert(`Downloading ${selectedApp.id}...`)}
                  style={{ padding: '8px 16px', borderRadius: 6, border: 'none', background: '#10b981', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                >
                  <Download size={14} /> Download Certificate
                </button>
              )}
              <button
                onClick={() => setSelectedApp(null)}
                style={{ padding: '8px 16px', borderRadius: 6, border: '1px solid #cbd5e1', background: '#f1f5f9', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ApplicationsPage;
