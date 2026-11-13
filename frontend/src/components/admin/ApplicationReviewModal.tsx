import { useState } from 'react';
import { AdminApplication, UploadedDocFile } from '../../shared/adminDemoData';
import {
  FileText,
  FileQuestion,
  Image as ImageIcon,
  Paperclip,
  Check,
  CheckCircle2,
  X,
  XCircle,
  Eye,
  EyeOff,
  Download,
  AlertCircle,
  AlertTriangle,
  Award,
  User,
  ShieldCheck,
} from 'lucide-react';

interface ApplicationReviewModalProps {
  app: AdminApplication | null;
  role: 'clerk' | 'hod' | 'principal';
  onClose: () => void;
  onApprove: (id: string, remarks: string) => void;
  onReject: (id: string, remarks: string) => void;
}

export function ApplicationReviewModal({
  app,
  role,
  onClose,
  onApprove,
  onReject,
}: ApplicationReviewModalProps) {
  const [remarks, setRemarks] = useState('');
  const [remarksError, setRemarksError] = useState(false);
  const [confirmState, setConfirmState] = useState<'approve' | 'reject' | null>(null);
  const [activePreviewDoc, setActivePreviewDoc] = useState<string | null>(null);
  const [verifiedFiles, setVerifiedFiles] = useState<Record<string, boolean>>({});

  if (!app) return null;

  const toggleVerify = (fileId: string) => {
    setVerifiedFiles(prev => ({ ...prev, [fileId]: !prev[fileId] }));
  };

  const handleActionClick = (action: 'approve' | 'reject') => {
    if (!remarks.trim()) {
      setRemarksError(true);
      return;
    }
    setRemarksError(false);
    setConfirmState(action);
  };

  const handleConfirmAction = () => {
    if (!confirmState) return;
    if (confirmState === 'approve') {
      onApprove(app.id, remarks.trim());
    } else {
      onReject(app.id, remarks.trim());
    }
    setConfirmState(null);
  };

  // Status badge style helper
  const getBadgeStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return { bg: '#fef9ec', text: '#92600a', border: '#f4c842', label: 'Pending at Clerk' };
      case 'clerk_approved':
        return { bg: '#eff6ff', text: '#1a4fa3', border: '#93c5fd', label: 'Forwarded to HOD' };
      case 'hod_approved':
        return { bg: '#f5f3ff', text: '#5b21b6', border: '#c4b5fd', label: 'Forwarded to Principal' };
      case 'approved':
      case 'issued':
        return { bg: '#edfaf3', text: '#0a7c4e', border: '#a3dfc3', label: 'Fully Approved / Issued' };
      case 'rejected':
        return { bg: '#fff0f0', text: '#b91c1c', border: '#fca5a5', label: 'Rejected' };
      default:
        return { bg: '#f4f6fb', text: '#3d4f72', border: '#cdd2e8', label: status };
    }
  };

  const badge = getBadgeStyle(app.status);

  return (
    <>
      {/* ════ MAIN DETAIL & REVIEW MODAL ════ */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          background: 'rgba(6, 18, 42, 0.72)',
          zIndex: 900,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backdropFilter: 'blur(6px)',
          padding: 20,
        }}
        onClick={(e) => {
          if (e.target === e.currentTarget) onClose();
        }}
      >
        <div
          style={{
            background: '#ffffff',
            borderRadius: 16,
            padding: 32,
            maxWidth: 820,
            width: '100%',
            boxShadow: '0 12px 48px rgba(6,18,42,0.25)',
            maxHeight: '92vh',
            overflowY: 'auto',
            fontFamily: 'var(--font-sans)',
            animation: 'fadeIn 0.25s ease',
          }}
        >
          {/* ── MODAL HEAD ── */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 14,
              marginBottom: 20,
              paddingBottom: 16,
              borderBottom: '1px solid #e0e4f0',
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: 10,
                background: 'linear-gradient(135deg, #c8922a, #e8b84b)',
                display: 'grid',
                placeItems: 'center',
                color: '#06122a',
                flexShrink: 0,
              }}
            >
              <FileText size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <h3
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontSize: 20,
                    fontWeight: 700,
                    color: 'var(--navy)',
                    margin: 0,
                  }}
                >
                  {app.id}
                </h3>
                <span
                  style={{
                    background: badge.bg,
                    color: badge.text,
                    border: `1px solid ${badge.border}`,
                    borderRadius: 20,
                    padding: '2px 10px',
                    fontSize: 11,
                    fontWeight: 700,
                  }}
                >
                  ● {badge.label}
                </span>
              </div>
              <div style={{ fontSize: 12, color: '#7a88a8', marginTop: 2 }}>
                Submitted on {app.dateApplied} · Review Authority: {role.toUpperCase()}
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              style={{
                marginLeft: 'auto',
                background: '#fff',
                border: '1.5px solid #cdd2e8',
                color: '#3d4f72',
                borderRadius: 8,
                padding: '6px 14px',
                fontSize: 12.5,
                fontWeight: 600,
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <X size={14} /> Close
            </button>
          </div>

          {/* ── APPLICANT & DETAILS GRID ── */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 12,
              marginBottom: 20,
            }}
          >
            <DetailField label="Student Name" value={app.studentName} />
            <DetailField label="Student Email" value={app.studentEmail} />
            <DetailField label="Student ID / Roll No" value={app.rollNo} />
            <DetailField label="Department" value={app.dept} />
            <DetailField label="Academic Year" value={app.year} />
            <DetailField label="Document Requested" value={app.docTitle} highlight />
            <DetailField label="Application ID" value={app.id} mono />
            <DetailField label="Date Submitted" value={app.dateApplied} />
          </div>

          <div style={{ marginBottom: 20 }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: '#7a88a8',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: 4,
              }}
            >
              Purpose Stated by Student
            </div>
            <div
              style={{
                background: '#f8fafc',
                border: '1px solid #e0e4f0',
                borderRadius: 6,
                padding: '10px 14px',
                fontSize: 13,
                color: '#1e293b',
                lineHeight: 1.5,
              }}
            >
              {app.purpose || 'No additional remarks submitted by applicant.'}
            </div>
          </div>

          {/* ── PREVIOUS REMARKS / AUDIT TRAIL ── */}
          {(app.clerkRemarks || app.hodRemarks) && (
            <div style={{ marginBottom: 20 }}>
              <div
                style={{
                  fontSize: 10.5,
                  fontWeight: 700,
                  color: '#7a88a8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: 8,
                }}
              >
                Previous Stage Verification Trail
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {app.clerkRemarks && (
                  <div
                    style={{
                      background: '#f0fdf4',
                      border: '1px solid #bbf7d0',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontSize: 12.5,
                    }}
                  >
                    <strong style={{ color: '#166534' }}>Clerk Verification Remarks:</strong>{' '}
                    <span style={{ color: '#14532d' }}>{app.clerkRemarks}</span>
                    <div style={{ fontSize: 11, color: '#15803d', marginTop: 4 }}>
                      Verified by: Academic Section Clerk
                    </div>
                  </div>
                )}
                {app.hodRemarks && (
                  <div
                    style={{
                      background: '#faf5ff',
                      border: '1px solid #e9d5ff',
                      borderRadius: 6,
                      padding: '10px 14px',
                      fontSize: 12.5,
                    }}
                  >
                    <strong style={{ color: '#6b21a8' }}>HOD Endorsement Remarks:</strong>{' '}
                    <span style={{ color: '#581c87' }}>{app.hodRemarks}</span>
                    <div style={{ fontSize: 11, color: '#7e22ce', marginTop: 4 }}>
                      Endorsed by: Head of Department
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ── STUDENT UPLOADED DOCUMENTS SECTION ── */}
          <div style={{ marginBottom: 24 }}>
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7a88a8',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                margin: '22px 0 14px',
              }}
            >
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                <Paperclip size={14} /> Student Uploaded Documents ({app.files?.length || 0})
              </span>
              <div style={{ flex: 1, height: 1, background: '#e0e4f0' }} />
            </div>

            {!app.files || app.files.length === 0 ? (
              <div
                style={{
                  padding: 24,
                  textAlign: 'center',
                  background: '#f4f6fb',
                  border: '1px dashed #cdd2e8',
                  borderRadius: 8,
                  color: '#7a88a8',
                  fontSize: 13,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <FileQuestion size={24} style={{ color: '#7a88a8' }} />
                <span>No documents were required or uploaded for this application.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {app.files.map((file, idx) => {
                  const isPreviewOpen = activePreviewDoc === file.id;
                  const isChecked = !!verifiedFiles[file.id];

                  return (
                    <div
                      key={file.id || idx}
                      style={{
                        border: '1px solid #e0e4f0',
                        borderRadius: 10,
                        overflow: 'hidden',
                        background: '#ffffff',
                        boxShadow: '0 2px 8px rgba(6,18,42,0.04)',
                      }}
                    >
                      {/* Document Item Bar */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '12px 16px',
                          background: '#f4f6fb',
                          borderBottom: isPreviewOpen ? '1px solid #e0e4f0' : 'none',
                          flexWrap: 'wrap',
                          gap: 10,
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <div
                            style={{
                              width: 36,
                              height: 36,
                              borderRadius: 8,
                              background: file.fileType === 'pdf' ? '#fee2e2' : '#dbeafe',
                              display: 'grid',
                              placeItems: 'center',
                              flexShrink: 0,
                            }}
                          >
                            {file.fileType === 'pdf' ? (
                              <FileText size={18} style={{ color: '#dc2626' }} />
                            ) : (
                              <ImageIcon size={18} style={{ color: '#2563eb' }} />
                            )}
                          </div>
                          <div>
                            <div style={{ fontSize: 13.5, fontWeight: 700, color: '#06122a' }}>
                              {file.name}
                            </div>
                            <div style={{ fontSize: 11, color: '#7a88a8', marginTop: 1 }}>
                              <span style={{ fontFamily: 'monospace' }}>{file.fileName}</span> ·{' '}
                              <span>{file.fileSize}</span> · Uploaded: {file.uploadedAt}
                            </div>
                          </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {/* Verification Checkbox */}
                          <label
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: 6,
                              fontSize: 12,
                              fontWeight: 600,
                              color: isChecked ? '#0a7c4e' : '#3d4f72',
                              cursor: 'pointer',
                              background: isChecked ? '#edfaf3' : '#fff',
                              border: isChecked ? '1px solid #a3dfc3' : '1px solid #cdd2e8',
                              padding: '5px 10px',
                              borderRadius: 6,
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => toggleVerify(file.id)}
                            />
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              {isChecked && <Check size={12} />}
                              {isChecked ? 'Verified' : 'Mark Verified'}
                            </span>
                          </label>

                          {/* Toggle Preview Button */}
                          <button
                            type="button"
                            onClick={() => setActivePreviewDoc(isPreviewOpen ? null : file.id)}
                            style={{
                              fontSize: 12,
                              padding: '6px 14px',
                              background: isPreviewOpen ? '#1e3d7a' : '#eff6ff',
                              color: isPreviewOpen ? '#fff' : '#1e40af',
                              border: '1px solid #bfdbfe',
                              borderRadius: 6,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            {isPreviewOpen ? (
                              <>
                                <EyeOff size={13} />
                                <span>Hide</span>
                              </>
                            ) : (
                              <>
                                <Eye size={13} />
                                <span>View Document</span>
                              </>
                            )}
                          </button>

                          {/* Download Button */}
                          <button
                            type="button"
                            onClick={() => alert(`Downloading student document: ${file.fileName}`)}
                            style={{
                              fontSize: 12,
                              padding: '6px 12px',
                              background: '#edfaf3',
                              color: '#0a7c4e',
                              border: '1px solid #a3dfc3',
                              borderRadius: 6,
                              fontWeight: 600,
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 5,
                            }}
                          >
                            <Download size={13} /> Download
                          </button>
                        </div>
                      </div>

                      {/* ── EXPANDED LIVE DOCUMENT PREVIEW ── */}
                      {isPreviewOpen && (
                        <div
                          style={{
                            padding: 20,
                            background: '#f8fafc',
                            borderTop: '1px solid #e0e4f0',
                          }}
                        >
                          <DocumentViewerPreview file={file} app={app} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── CLERK / HOD / PRINCIPAL ACTION AREA ── */}
          <div
            style={{
              marginTop: 24,
              paddingTop: 20,
              borderTop: '2px solid #e0e4f0',
            }}
          >
            <div
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: '#7a88a8',
                textTransform: 'uppercase',
                letterSpacing: '1px',
                marginBottom: 12,
              }}
            >
              Your Verification Action & Remarks
            </div>

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: 'block',
                  fontSize: 12.5,
                  fontWeight: 600,
                  color: '#0f1e3a',
                  marginBottom: 6,
                }}
              >
                Verification Remarks <span style={{ color: '#b91c1c' }}>*</span>{' '}
                <span style={{ fontWeight: 400, color: '#7a88a8' }}>
                  (Mandatory — will be permanently recorded and visible to student)
                </span>
              </label>

              <textarea
                value={remarks}
                onChange={(e) => {
                  setRemarks(e.target.value);
                  if (remarksError && e.target.value.trim()) setRemarksError(false);
                }}
                placeholder="Describe your verification findings, eligibility checks, fee verification, or reason for decision..."
                style={{
                  width: '100%',
                  minHeight: 90,
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: remarksError ? '2px solid #b91c1c' : '1.5px solid #cdd2e8',
                  fontSize: 13.5,
                  fontFamily: 'var(--font-sans)',
                  color: '#0f1e3a',
                  outline: 'none',
                  resize: 'vertical',
                  boxSizing: 'border-box',
                }}
              />
              {remarksError && (
                <div style={{ fontSize: 11.5, color: '#b91c1c', marginTop: 4, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 6 }}>
                  <AlertCircle size={14} /> Please enter remarks before approving or rejecting.
                </div>
              )}
            </div>

            {/* Role Action Buttons */}
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => handleActionClick('reject')}
                style={{
                  background: '#fff0f0',
                  color: '#b91c1c',
                  border: '1.5px solid #fca5a5',
                  borderRadius: 8,
                  padding: '10px 20px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <XCircle size={15} /> Reject & Return to Student
              </button>

              <button
                type="button"
                onClick={() => handleActionClick('approve')}
                style={{
                  background: '#0a7c4e',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: 8,
                  padding: '10px 24px',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  boxShadow: '0 4px 14px rgba(10,124,78,0.28)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                {role === 'clerk' && (
                  <>
                    <CheckCircle2 size={16} /> Approve & Forward to HOD
                  </>
                )}
                {role === 'hod' && (
                  <>
                    <CheckCircle2 size={16} /> Endorse & Forward to Principal
                  </>
                )}
                {role === 'principal' && (
                  <>
                    <Award size={16} /> Sign & Issue Certificate
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ════ CONFIRMATION MODAL ════ */}
      {confirmState && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(6, 18, 42, 0.8)',
            zIndex: 999,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: 20,
            backdropFilter: 'blur(4px)',
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: 14,
              padding: 28,
              maxWidth: 480,
              width: '100%',
              boxShadow: '0 12px 48px rgba(6,18,42,0.3)',
              fontFamily: 'var(--font-sans)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              {confirmState === 'approve' ? (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#ecfdf5', color: '#0a7c4e', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <ShieldCheck size={24} />
                </div>
              ) : (
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: '#fee2e2', color: '#b91c1c', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                  <AlertTriangle size={24} />
                </div>
              )}
              <h3
                style={{
                  fontFamily: 'var(--font-serif)',
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--navy)',
                  margin: 0,
                }}
              >
                {confirmState === 'approve'
                  ? role === 'principal'
                    ? 'Confirm Certificate Issuance?'
                    : 'Confirm Approval & Forward?'
                  : 'Confirm Application Rejection?'}
              </h3>
            </div>

            <p style={{ fontSize: 13.5, color: '#3d4f72', lineHeight: 1.6, margin: '0 0 20px' }}>
              {confirmState === 'approve' ? (
                role === 'clerk' ? (
                  <>Application <strong>{app.id}</strong> will be forwarded to the Head of Department (HOD) for academic clearance. Student will receive status notification.</>
                ) : role === 'hod' ? (
                  <>Application <strong>{app.id}</strong> will be approved and sent to the Principal for final digital signature.</>
                ) : (
                  <>A verifiable certificate with cryptographic QR code will be generated and signed for <strong>{app.studentName}</strong>.</>
                )
              ) : (
                <>Application <strong>{app.id}</strong> will be rejected and returned to <strong>{app.studentName}</strong> with your recorded remarks.</>
              )}
            </p>

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={() => setConfirmState(null)}
                style={{
                  padding: '8px 18px',
                  borderRadius: 6,
                  border: '1.5px solid #cdd2e8',
                  background: '#fff',
                  color: '#3d4f72',
                  fontSize: 13,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmAction}
                style={{
                  padding: '8px 20px',
                  borderRadius: 6,
                  border: 'none',
                  background: confirmState === 'approve' ? '#0a7c4e' : '#b91c1c',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 700,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                {confirmState === 'approve' ? (
                  <>
                    <Check size={14} /> Confirm Proceed
                  </>
                ) : (
                  <>
                    <X size={14} /> Confirm Reject
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

function DetailField({
  label,
  value,
  highlight,
  mono,
}: {
  label: string;
  value: string;
  highlight?: boolean;
  mono?: boolean;
}) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: '#7a88a8',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        }}
      >
        {label}
      </div>
      <div
        style={{
          background: highlight ? '#fef9ec' : '#f4f6fb',
          border: highlight ? '1px solid #f4c842' : '1px solid #e0e4f0',
          borderRadius: 6,
          padding: '7px 11px',
          fontSize: 13,
          fontWeight: 600,
          color: highlight ? '#92600a' : '#0f1e3a',
          fontFamily: mono ? 'monospace' : 'inherit',
        }}
      >
        {value || '—'}
      </div>
    </div>
  );
}

// ── HIGH-FIDELITY DOCUMENT PREVIEW COMPONENT ──
function DocumentViewerPreview({ file, app }: { file: UploadedDocFile; app: AdminApplication }) {
  if (file.fileType === 'image') {
    return (
      <div
        style={{
          background: '#ffffff',
          borderRadius: 8,
          border: '1px solid #e0e4f0',
          padding: 16,
          textAlign: 'center',
        }}
      >
        <div style={{ fontSize: 11, color: '#7a88a8', marginBottom: 12 }}>
          Document Image Inspection Preview · {file.docLabel}
        </div>

        {/* Visual Student ID / Photo Preview */}
        <div
          style={{
            display: 'inline-block',
            maxWidth: 380,
            width: '100%',
            background: 'linear-gradient(135deg, #0a1628, #1a2a4a)',
            color: '#fff',
            borderRadius: 12,
            padding: '16px 20px',
            textAlign: 'left',
            boxShadow: '0 4px 16px rgba(0,0,0,0.18)',
            border: '2px solid #d4781a',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: 10, marginBottom: 12 }}>
            <img src="/assets/logo_left.png" alt="JDCOEM" style={{ width: 34, height: 34, objectFit: 'contain' }} />
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.5px' }}>JD COLLEGE OF ENGINEERING</div>
              <div style={{ fontSize: 9, color: '#e8b84b' }}>STUDENT IDENTITY CARD</div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 14, alignItems: 'center' }}>
            <div
              style={{
                width: 72,
                height: 84,
                borderRadius: 6,
                background: '#e2e8f0',
                display: 'grid',
                placeItems: 'center',
                color: '#64748b',
                border: '1px solid rgba(255,255,255,0.3)',
              }}
            >
              <User size={36} style={{ color: '#475569' }} />
            </div>
            <div style={{ fontSize: 11, display: 'flex', flexDirection: 'column', gap: 3 }}>
              <div><strong>Name:</strong> {app.studentName}</div>
              <div><strong>Roll No:</strong> {app.rollNo}</div>
              <div><strong>Dept:</strong> {app.dept}</div>
              <div><strong>Valid Upto:</strong> June 2027</div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // PDF Preview Simulation Sheet
  return (
    <div
      style={{
        background: '#ffffff',
        borderRadius: 8,
        border: '1px solid #cdd2e8',
        padding: '24px 28px',
        boxShadow: '0 4px 14px rgba(0,0,0,0.06)',
        position: 'relative',
      }}
    >
      {/* Official Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', borderBottom: '2px solid #06122a', paddingBottom: 12, marginBottom: 14 }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <img src="/assets/logo_left.png" alt="Logo" style={{ width: 44, height: 44, objectFit: 'contain' }} />
          <div>
            <div style={{ fontFamily: 'var(--font-serif)', fontSize: 14, fontWeight: 700, color: '#06122a' }}>
              JD COLLEGE OF ENGINEERING AND MANAGEMENT
            </div>
            <div style={{ fontSize: 10, color: '#64748b' }}>
              Nagpur, Maharashtra · Autonomous Institute Affiliated to DBATU / RTMNU
            </div>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 10, fontWeight: 700, color: '#0a7c4e', background: '#edfaf3', border: '1px solid #a3dfc3', padding: '2px 8px', borderRadius: 4 }}>
            VERIFIED COPY
          </div>
          <div style={{ fontSize: 9, color: '#64748b', marginTop: 3 }}>REF: {file.fileName}</div>
        </div>
      </div>

      {/* Sheet Content */}
      <div style={{ fontSize: 12, color: '#1e293b', lineHeight: 1.6 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, background: '#f8fafc', padding: 8, borderRadius: 6 }}>
          <div><strong>Document:</strong> {file.name}</div>
          <div><strong>Student ID:</strong> {app.rollNo}</div>
        </div>

        <p style={{ margin: '8px 0' }}>
          This document certifies student verification details submitted by <strong>{app.studentName}</strong>, 
          enrolled in <strong>{app.dept}</strong> ({app.year}).
        </p>

        <div style={{ margin: '14px 0', border: '1px solid #e2e8f0', borderRadius: 6, overflow: 'hidden' }}>
          <table style={{ width: '100%', fontSize: 11, borderCollapse: 'collapse' }}>
            <tbody>
              <tr style={{ background: '#f1f5f9' }}>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Verification Item</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Status</td>
                <td style={{ padding: '6px 10px', fontWeight: 600 }}>Authority Check</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0' }}>Institutional Enrolment</td>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0', color: '#0a7c4e', fontWeight: 600 }}>Active &amp; Clear</td>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0' }}>ERP System Matched</td>
              </tr>
              <tr>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0' }}>Fee Clearance Record</td>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0', color: '#0a7c4e', fontWeight: 600 }}>Paid In Full</td>
                <td style={{ padding: '6px 10px', borderTop: '1px solid #e2e8f0' }}>Accounts Section</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: 18, paddingTop: 10, borderTop: '1px dashed #cbd5e1' }}>
          <div style={{ fontSize: 10, color: '#64748b' }}>
            <div>Digital File Hash: <span style={{ fontFamily: 'monospace' }}>SHA256:7f83b1657ff1...</span></div>
            <div>File Size: {file.fileSize} · Scanned Document Format</div>
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ width: 80, height: 28, borderBottom: '1px solid #000', margin: '0 auto 4px' }} />
            <div style={{ fontSize: 9, fontWeight: 700, textTransform: 'uppercase', color: '#334155' }}>
              Academic Registrar Seal
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
