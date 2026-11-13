import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { DEMO_APPLICATIONS } from '../../shared/demoData';
import { getDocIcon } from '../../shared/documentTypes';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { applicationApi } from '../../services/api';
import '../../styles/track-status.css';
import {
  Activity,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Download,
  FileCheck,
  UserCheck,
  ShieldCheck,
  Award,
  Calendar,
  Building2,
  MessageSquare,
  FileText,
  ArrowRight,
  ExternalLink,
  Check,
} from 'lucide-react';

export function TrackStatusPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  // Read initial ID from URL query or default
  const paramId = searchParams.get('id') || 'APP-2026-0041';
  const [lookupId, setLookupId] = useState(paramId);
  const [searchedId, setSearchedId] = useState(paramId);

  // Animated progress bar percentage state
  const [fillPercent, setFillPercent] = useState(0);
  const [liveApp, setLiveApp] = useState<any>(null);

  // Find matching application from demo data (or fallback)
  const fallbackApp = DEMO_APPLICATIONS.find(
    a => a.id.toLowerCase() === searchedId.trim().toLowerCase()
  );

  // Try to load real application from API
  useEffect(() => {
    if (searchedId) {
      applicationApi.trackStatus(searchedId).then(res => {
        if (res.success && res.data) {
          const d = res.data;
          setLiveApp({
            id: d.application_number || `APP-2026-${String(d.id).padStart(4, '0')}`,
            docCode: d.certificate_type,
            docTitle: (d.certificate_type || 'Document').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
            dateApplied: d.created_at ? d.created_at.split('T')[0] : '2026-11-01',
            status: d.status === 'issued' ? 'issued' : d.status === 'pending_principal' ? 'approved' : d.status === 'pending_hod' ? 'clerk_approved' : d.status === 'rejected' ? 'rejected' : 'pending',
            statusLabel: d.status === 'issued' ? 'Ready for Download' : d.status === 'pending_principal' ? 'Principal Sanction Pending' : d.status === 'pending_hod' ? 'HOD Review' : d.status === 'rejected' ? 'Rejected' : 'Pending Clerk Review',
            processingDays: '2–3 Days',
            purpose: d.purpose || 'Official Document Submission',
            files: ['verified_record.pdf'],
            appId: d.id,
            certNumber: d.certificate_number || d.cert_number,
          });
        }
      }).catch(() => {
        // Fallback silently
      });
    }
  }, [searchedId]);

  const application = liveApp || fallbackApp;

  const calculateProgressPercent = (status: string) => {
    switch (status) {
      case 'pending':
        return 25;
      case 'clerk_approved':
        return 50;
      case 'hod_approved':
        return 75;
      case 'approved':
      case 'issued':
        return 100;
      case 'rejected':
        return 50; // Halted at clerk/hod stage
      default:
        return 25;
    }
  };

  // Trigger smooth progress line fill animation whenever searched application changes
  useEffect(() => {
    if (application) {
      setFillPercent(0);
      const targetPercent = calculateProgressPercent(application.status);
      const timer = setTimeout(() => {
        setFillPercent(targetPercent);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [searchedId, application]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupId.trim()) return;
    setSearchedId(lookupId.trim());
    setSearchParams({ id: lookupId.trim() });
  };

  const handleSelectQuickPick = (id: string) => {
    setLookupId(id);
    setSearchedId(id);
    setSearchParams({ id });
  };

  const getTimelineSteps = (status: string) => {
    const isClerkDone = status === 'clerk_approved' || status === 'hod_approved' || status === 'approved' || status === 'issued';
    const isHodDone = status === 'hod_approved' || status === 'approved' || status === 'issued';
    const isApproved = status === 'approved' || status === 'issued';
    const isIssued = status === 'issued';
    const isRejected = status === 'rejected';

    return [
      {
        title: 'Application Lodged',
        sub: 'Submitted online & registered',
        desc: 'Request received into the autonomous ledger and queued for clerk verification.',
        state: 'done' as const,
        date: '01 Nov 2026, 10:14 AM',
        icon: FileCheck,
      },
      {
        title: 'Clerk Verification',
        sub: isRejected ? 'Verification halted' : isClerkDone ? 'Dues & identity verified' : 'In review at Counter 101',
        desc: isRejected
          ? 'Verification halted due to discrepancies in submitted records.'
          : 'Enrollment eligibility, fee receipts & no-dues cleared by academic registry.',
        state: isRejected ? 'error' as const : isClerkDone ? 'done' as const : 'active' as const,
        date: isClerkDone ? '02 Nov 2026, 02:30 PM' : isRejected ? '02 Nov 2026, 01:15 PM' : 'In progress',
        icon: UserCheck,
      },
      {
        title: 'HOD Recommendation',
        sub: isHodDone ? 'Department endorsed' : isClerkDone && !isRejected ? 'Awaiting HOD sign-off' : 'Pending',
        desc: 'Academic conduct, attendance records, and departmental endorsement.',
        state: isHodDone ? 'done' as const : isClerkDone && !isRejected ? 'active' as const : 'todo' as const,
        date: isHodDone ? '02 Nov 2026, 04:15 PM' : isClerkDone && !isRejected ? 'In review' : 'Estimated 1–2 days',
        icon: ShieldCheck,
      },
      {
        title: 'Principal Sanction',
        sub: isIssued ? 'Issued with digital seal' : isApproved ? 'Sanctioned by Principal' : 'Pending final seal',
        desc: 'Executive institutional sanction and cryptographic digital signature issuance.',
        state: isIssued ? 'done' as const : isApproved ? 'active' as const : 'todo' as const,
        date: isIssued ? '03 Nov 2026, 11:00 AM' : isApproved ? 'Ready for issue' : 'Pending',
        icon: Award,
      },
    ];
  };

  const getResponsibleAuthority = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Academic Section – Counter 101';
      case 'clerk_approved':
        return 'Department of Computer Science & Engineering (HOD Office)';
      case 'hod_approved':
        return "Principal's Executive Office";
      case 'approved':
      case 'issued':
        return 'Autonomous Examination & Certification Cell';
      case 'rejected':
        return 'Student Grievance & Academic Registry';
      default:
        return 'Academic Section';
    }
  };

  return (
    <div className="track-page-container">
      {/* ── BREADCRUMB & HERO SEARCH CARD ── */}
      <div className="track-hero-card">
        <Breadcrumb
          items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'My Applications', to: '/applications' },
            { label: 'Track Status' },
          ]}
        />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '8px 0 0', color: 'var(--navy)', fontFamily: 'var(--font-serif)', display: 'flex', alignItems: 'center', gap: 10 }}>
          <Activity size={24} color="var(--saffron)" /> Track Application Status
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--gray-500)', fontSize: 13.5 }}>
          Inspect the live multi-tier institutional approval chain for your requested academic documents.
        </p>

        {/* ── SEARCH STRIP ── */}
        <form onSubmit={handleSearch} className="track-search-strip">
          <div className="track-search-input-wrap">
            <Search size={16} color="var(--gray-400)" style={{ marginRight: 10, flexShrink: 0 }} />
            <input
              type="text"
              value={lookupId}
              onChange={e => setLookupId(e.target.value)}
              placeholder="Enter Application Reference ID (e.g. APP-2026-0041)"
              className="track-search-input"
            />
          </div>
          <button type="submit" className="track-search-btn">
            <Activity size={15} /> Track Application
          </button>
        </form>

        {/* ── QUICK SELECTION PILLS ── */}
        <div className="track-quick-picks">
          <span>Recent applications:</span>
          {DEMO_APPLICATIONS.slice(0, 4).map(app => (
            <button
              key={app.id}
              type="button"
              className={`track-quick-chip ${searchedId.toUpperCase() === app.id.toUpperCase() ? 'active' : ''}`}
              onClick={() => handleSelectQuickPick(app.id)}
            >
              {app.id} • {app.docTitle}
            </button>
          ))}
        </div>
      </div>

      {application ? (
        <>
          {/* ── APPLICATION IDENTITY CARD ── */}
          <div className="track-id-card">
            <div className="track-id-header">
              <div className="track-id-info">
                <div className="track-id-icon">
                  {getDocIcon(application.docCode, 28)}
                </div>
                <div>
                  <h2 className="track-id-title">{application.docTitle}</h2>
                  <div className="track-id-badge">{application.id}</div>
                </div>
              </div>

              <div>
                <span
                  style={{
                    padding: '6px 16px',
                    borderRadius: 20,
                    fontSize: 12.5,
                    fontWeight: 700,
                    background:
                      application.status === 'issued' || application.status === 'approved'
                        ? '#d1fae5'
                        : application.status === 'rejected'
                        ? '#fee2e2'
                        : '#fef3c7',
                    color:
                      application.status === 'issued' || application.status === 'approved'
                        ? '#065f46'
                        : application.status === 'rejected'
                        ? '#991b1b'
                        : '#92400e',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    boxShadow: '0 1px 4px rgba(0,0,0,0.1)',
                  }}
                >
                  {application.status === 'issued' || application.status === 'approved' ? (
                    <CheckCircle2 size={14} />
                  ) : application.status === 'rejected' ? (
                    <AlertCircle size={14} />
                  ) : (
                    <Clock size={14} />
                  )}
                  {application.statusLabel}
                </span>
              </div>
            </div>

            <div className="track-id-body">
              <div className="track-id-field">
                <label>Date Lodged</label>
                <div className="val">
                  <Calendar size={14} color="var(--gray-400)" />
                  <span>{application.dateApplied}</span>
                </div>
              </div>
              <div className="track-id-field">
                <label>Turnaround Window</label>
                <div className="val">
                  <Clock size={14} color="var(--gray-400)" />
                  <span>{application.processingDays}</span>
                </div>
              </div>
              <div className="track-id-field">
                <label>Responsible Authority</label>
                <div className="val">
                  <Building2 size={14} color="var(--gray-400)" />
                  <span>{getResponsibleAuthority(application.status)}</span>
                </div>
              </div>
              <div className="track-id-field">
                <label>Verification Format</label>
                <div className="val">
                  <ShieldCheck size={14} color="var(--success)" />
                  <span>Digitally Signed PDF</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── ANIMATED PROGRESS TRACKER CARD ── */}
          <div className="track-progress-card">
            <div className="track-progress-header">
              <Activity size={18} color="var(--saffron)" />
              <h3>Real-Time Approval Stepper</h3>
            </div>
            <div className="track-progress-body">
              {/* Horizontal animated stepper */}
              <div className="track-prog-steps">
                {/* Animated green progress bar fill */}
                <div
                  className="track-prog-fill"
                  style={{ width: `${Math.max(0, Math.min(100, (fillPercent / 100) * 88))}%` }}
                />

                {getTimelineSteps(application.status).map((step, i) => {
                  const Icon = step.icon;
                  return (
                    <div key={i} className="track-step-node">
                      <div className={`track-ps-dot ${step.state}`}>
                        {step.state === 'done' ? (
                          <Check size={24} strokeWidth={3} />
                        ) : step.state === 'error' ? (
                          <AlertCircle size={24} />
                        ) : (
                          <Icon size={22} />
                        )}
                      </div>
                      <div className={`track-ps-name ${step.state}`}>{step.title}</div>
                      <div className={`track-ps-sub ${step.state}`}>{step.sub}</div>
                      <div className="track-ps-date">{step.date}</div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── DETAILS & REMARKS 2-COLUMN GRID ── */}
          <div className="track-detail-grid">
            {/* Status Summary */}
            <div className="track-summary-card">
              <div className="track-summary-header">
                <FileText size={17} color="var(--saffron)" />
                <h4>Application Summary</h4>
              </div>
              <div className="track-summary-body">
                <div className="track-summary-row">
                  <span className="label">Reference ID:</span>
                  <span className="val" style={{ fontFamily: 'var(--font-mono)' }}>{application.id}</span>
                </div>
                <div className="track-summary-row">
                  <span className="label">Document Requested:</span>
                  <span className="val">{application.docTitle}</span>
                </div>
                <div className="track-summary-row">
                  <span className="label">Stated Purpose:</span>
                  <span className="val" style={{ maxWidth: 280, textAlign: 'right' }}>{application.purpose}</span>
                </div>
                <div className="track-summary-row">
                  <span className="label">Enclosures Attached:</span>
                  <span className="val">{application.files.join(', ')}</span>
                </div>
              </div>
            </div>

            {/* Officer Remarks & Next Steps */}
            <div className="track-summary-card">
              <div className="track-summary-header">
                <MessageSquare size={17} color="var(--saffron)" />
                <h4>Institutional Remarks &amp; Notes</h4>
              </div>
              <div className="track-summary-body">
                {application.status === 'issued' || application.status === 'approved' ? (
                  <div className="track-remark-item approved">
                    <CheckCircle2 size={20} color="var(--success)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div className="track-remark-content">
                      <strong>Document Approved &amp; Formally Issued</strong>
                      <p>
                        Your {application.docTitle} has received principal sanction and verified QR endorsement. It is valid for all official academic, governmental, and employment verifications.
                      </p>
                      <div className="track-remark-meta">Issued by: Principal Executive Seal • Certificate valid for 6 months</div>
                    </div>
                  </div>
                ) : application.status === 'rejected' ? (
                  <div className="track-remark-item rejected">
                    <AlertCircle size={20} color="var(--error)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div className="track-remark-content">
                      <strong>Correction Required – Discrepancy Found</strong>
                      <p>
                        Submitted fee receipt was unclear or mismatched with the current academic semester. Please re-upload legible documentation at the Academic Section.
                      </p>
                      <div className="track-remark-meta">Issued by: Academic Clerk (Counter 101)</div>
                    </div>
                  </div>
                ) : (
                  <div className="track-remark-item pending">
                    <Clock size={20} color="var(--warn)" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div className="track-remark-content">
                      <strong>Active Institutional Workflow</strong>
                      <p>
                        Your application is currently advancing through the verification chain. You will receive SMS &amp; email updates upon final sign-off.
                      </p>
                      <div className="track-remark-meta">Current Stage: {getResponsibleAuthority(application.status)}</div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* ── READY FOR DOWNLOAD ACTION BANNER ── */}
          {(application.status === 'issued' || application.status === 'approved') && (
            <div className="track-action-banner">
              <div>
                <strong style={{ color: '#166534', fontSize: 15, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <CheckCircle2 size={18} /> Official Verified Document Ready for Download
                </strong>
                <p style={{ margin: '4px 0 0', fontSize: 13, color: '#15803d' }}>
                  This certificate carries an autonomous digital cryptographic signature and verifiable QR code.
                </p>
              </div>

              <div style={{ display: 'flex', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => alert(`Downloading verified certificate for ${application.id}...`)}
                  className="app-btn-primary"
                  style={{ background: '#16a34a' }}
                >
                  <Download size={15} /> Download Verified PDF
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/applications')}
                  className="app-btn-secondary"
                >
                  View in My Applications
                </button>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
            <AlertCircle size={28} color="var(--gray-400)" />
          </div>
          <h3 style={{ margin: '0 0 8px', color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>No Application Found</h3>
          <p style={{ color: 'var(--gray-500)', fontSize: 14, margin: '0 0 20px' }}>
            We could not find any active application registered under ID <strong>"{searchedId}"</strong>.
          </p>
          <button
            type="button"
            className="app-btn-primary"
            style={{ margin: '0 auto' }}
            onClick={() => handleSelectQuickPick('APP-2026-0041')}
          >
            Load Demo Application (APP-2026-0041)
          </button>
        </div>
      )}
    </div>
  );
}

export default TrackStatusPage;
