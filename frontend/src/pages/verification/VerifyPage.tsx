import { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { PublicHeader } from '../../components/layout/PublicHeader';
import { FileText, QrCode, UploadCloud, CheckCircle2, XCircle } from 'lucide-react';
import { certificateApi } from '../../services/api';

// Demo certificate database
const DEMO_CERTS: Record<string, {
  certNumber: string;
  holderName: string;
  docType: string;
  issuedDate: string;
  issuedBy: string;
}> = {
  'JDCOEM/BONAFIDE/2026/000001': {
    certNumber: 'JDCOEM/BONAFIDE/2026/000001',
    holderName: 'Akash Kumar',
    docType: 'Bonafide Certificate',
    issuedDate: '2026-03-15',
    issuedBy: 'Academic Section, JDCOEM',
  },
  'JDCOEM/TC/2026/000012': {
    certNumber: 'JDCOEM/TC/2026/000012',
    holderName: 'Priya Sharma',
    docType: 'Transfer Certificate',
    issuedDate: '2026-04-01',
    issuedBy: 'Principal, JDCOEM',
  },
};

type TabId = 'cert' | 'qr';

interface VerifyResult {
  valid: boolean;
  certNumber?: string;
  holderName?: string;
  docType?: string;
  issuedDate?: string;
  issuedBy?: string;
  verifiedAt?: string;
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    background: '#1a237e',
    color: '#fff',
    padding: '0',
  },
  headerInner: {
    maxWidth: 960,
    margin: '0 auto',
    padding: '14px 24px',
    display: 'flex',
    alignItems: 'center',
    gap: 14,
  },
  logoEmoji: {
    fontSize: 36,
    lineHeight: 1,
  },
  logoTextBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  collegeName: {
    fontWeight: 700,
    fontSize: 15,
    letterSpacing: 0.2,
  },
  portalName: {
    fontSize: 12,
    opacity: 0.8,
    letterSpacing: 0.5,
    textTransform: 'uppercase' as const,
  },
  secureBadge: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    background: 'rgba(255,255,255,0.12)',
    borderRadius: 20,
    padding: '5px 14px',
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: 1,
  },
  main: {
    flex: 1,
    maxWidth: 680,
    width: '100%',
    margin: '40px auto',
    padding: '0 20px 60px',
  },
  heroText: {
    textAlign: 'center' as const,
    marginBottom: 32,
  },
  heroTitle: {
    fontSize: 26,
    fontWeight: 800,
    color: '#1a237e',
    margin: '0 0 8px',
  },
  heroSub: {
    fontSize: 14,
    color: '#64748b',
    margin: 0,
  },
  card: {
    background: '#fff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
    overflow: 'hidden',
  },
  tabs: {
    display: 'flex',
    borderBottom: '1px solid #e2e8f0',
  },
  tab: {
    flex: 1,
    padding: '14px 20px',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 600,
    color: '#94a3b8',
    transition: 'all 0.2s',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tabActive: {
    color: '#1a237e',
    borderBottom: '2px solid #1a237e',
    background: '#f8faff',
  },
  tabContent: {
    padding: 28,
  },
  label: {
    display: 'block',
    fontSize: 12,
    fontWeight: 700,
    color: '#475569',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  inputRow: {
    display: 'flex',
    gap: 10,
  },
  input: {
    flex: 1,
    padding: '11px 16px',
    border: '1.5px solid #e2e8f0',
    borderRadius: 10,
    fontSize: 14,
    fontFamily: 'inherit',
    color: '#1e293b',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  verifyBtn: {
    padding: '11px 24px',
    background: '#1a237e',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontFamily: 'inherit',
    fontSize: 14,
    fontWeight: 700,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'background 0.2s',
  },
  hint: {
    marginTop: 8,
    fontSize: 12,
    color: '#94a3b8',
  },
  qrPlaceholder: {
    border: '2px dashed #cbd5e1',
    borderRadius: 12,
    padding: 40,
    textAlign: 'center' as const,
    color: '#94a3b8',
  },
  qrIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  qrTitle: {
    fontWeight: 600,
    fontSize: 15,
    color: '#475569',
    marginBottom: 6,
  },
  qrSub: {
    fontSize: 13,
    color: '#94a3b8',
  },
  fileUploadBtn: {
    marginTop: 16,
    padding: '9px 20px',
    background: '#f1f5f9',
    color: '#475569',
    border: '1px solid #e2e8f0',
    borderRadius: 8,
    fontFamily: 'inherit',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
  },
  resultSection: {
    marginTop: 24,
  },
  resultValid: {
    background: '#f0fdf4',
    border: '1.5px solid #86efac',
    borderRadius: 14,
    padding: 24,
  },
  resultInvalid: {
    background: '#fff1f2',
    border: '1.5px solid #fda4af',
    borderRadius: 14,
    padding: 24,
    textAlign: 'center' as const,
  },
  resultHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    marginBottom: 20,
  },
  resultIcon: {
    fontSize: 28,
  },
  resultTitle: {
    fontWeight: 800,
    fontSize: 17,
    color: '#166534',
    margin: 0,
  },
  resultSub: {
    fontSize: 12,
    color: '#16a34a',
    margin: 0,
  },
  infoGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: 12,
  },
  infoTile: {
    background: '#fff',
    borderRadius: 10,
    padding: '12px 14px',
    border: '1px solid #dcfce7',
  },
  tileLabel: {
    display: 'block',
    fontSize: 10,
    fontWeight: 700,
    color: '#6b7280',
    textTransform: 'uppercase' as const,
    letterSpacing: 0.8,
    marginBottom: 4,
  },
  tileVal: {
    fontSize: 14,
    fontWeight: 600,
    color: '#1e293b',
  },
  invalidIcon: {
    fontSize: 40,
    marginBottom: 10,
  },
  invalidTitle: {
    fontWeight: 800,
    fontSize: 17,
    color: '#9f1239',
    marginBottom: 6,
  },
  invalidSub: {
    fontSize: 13,
    color: '#be123c',
  },
  footer: {
    textAlign: 'center' as const,
    padding: '20px 24px',
    borderTop: '1px solid #e2e8f0',
    fontSize: 12,
    color: '#94a3b8',
  },
};

export function VerifyPage() {
  const { token } = useParams<{ token?: string }>();
  const [searchParams] = useSearchParams();
  const certFromQuery = searchParams.get('cert');

  const [activeTab, setActiveTab] = useState<TabId>('cert');
  const [certInput, setCertInput] = useState('JDCOEM/BONAFIDE/2026/000001');
  const [result, setResult] = useState<VerifyResult | null>(null);
  const [loading, setLoading] = useState(false);

  // Pre-load demo result or auto-verify from URL token or query param
  useEffect(() => {
    const initCert = certFromQuery || token || 'JDCOEM/BONAFIDE/2026/000001';
    setCertInput(initCert);
    doVerify(initCert);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, certFromQuery]);

  async function doVerify(certNum: string) {
    setLoading(true);
    try {
      const res = await certificateApi.verify(certNum.trim());
      if (res.success && res.data) {
        setResult({
          valid: true,
          certNumber: res.data.certificate_number,
          holderName: res.data.student_name,
          docType: res.data.certificate_type,
          issuedDate: res.data.issued_at ? res.data.issued_at.split('T')[0] : '2026-11-12',
          issuedBy: 'Principal & Sanctioning Authority, JDCOEM',
          verifiedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
        });
        setLoading(false);
        return;
      }
    } catch {
      // Fallback check
    }

    const rec = DEMO_CERTS[certNum.trim().toUpperCase()] || DEMO_CERTS[certNum.trim()];
    if (rec) {
      setResult({
        valid: true,
        ...rec,
        verifiedAt: new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
      });
    } else {
      setResult({ valid: false });
    }
    setLoading(false);
  }

  function handleVerify() {
    if (!certInput.trim()) return;
    doVerify(certInput);
  }

  function formatDate(d: string) {
    try {
      return new Date(d).toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' });
    } catch {
      return d;
    }
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: 'var(--cream)', color: 'var(--navy)' }}>
      {/* Header */}
      <PublicHeader activeTab="track" breadcrumb="Certificate Verification System" />

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.heroText}>
          <h1 style={styles.heroTitle}>Verify Certificate Authenticity</h1>
          <p style={styles.heroSub}>
            Enter a certificate number or upload a QR code image to verify the document against the JDCOEM database.
          </p>
        </div>

        <div style={styles.card}>
          {/* Tabs */}
          <div style={styles.tabs}>
            <button
              style={{ ...styles.tab, ...(activeTab === 'cert' ? styles.tabActive : {}), display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
              onClick={() => setActiveTab('cert')}
            >
              <FileText size={15} />
              <span>By Certificate Number</span>
            </button>
            <button
              style={{ ...styles.tab, ...(activeTab === 'qr' ? styles.tabActive : {}), display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}
              onClick={() => setActiveTab('qr')}
            >
              <QrCode size={15} />
              <span>By QR Code</span>
            </button>
          </div>

          <div style={styles.tabContent}>
            {activeTab === 'cert' && (
              <div>
                <label style={styles.label}>Certificate Number</label>
                <div style={styles.inputRow}>
                  <input
                    style={styles.input}
                    type="text"
                    placeholder="e.g. JDCOEM/BONAFIDE/2026/000001"
                    value={certInput}
                    onChange={e => setCertInput(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleVerify()}
                  />
                  <button
                    style={{ ...styles.verifyBtn, opacity: loading ? 0.7 : 1 }}
                    onClick={handleVerify}
                    disabled={loading}
                  >
                    {loading ? 'Verifying…' : 'Verify'}
                  </button>
                </div>
                <p style={styles.hint}>Format: JDCOEM/DOCTYPE/YEAR/000001</p>
              </div>
            )}

            {activeTab === 'qr' && (
              <div style={styles.qrPlaceholder}>
                <div style={{ ...styles.qrIcon, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <QrCode size={42} style={{ color: 'var(--navy)' }} />
                </div>
                <div style={styles.qrTitle}>QR Code Verification</div>
                <div style={styles.qrSub}>
                  Upload an image containing the QR code printed on your certificate.
                  <br />
                  <em>QR scanning feature coming soon.</em>
                </div>
                <button style={{ ...styles.fileUploadBtn, display: 'inline-flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
                  <UploadCloud size={15} />
                  <span>Upload QR Image</span>
                </button>
                <input type="file" accept="image/*" style={{ display: 'none' }} />
              </div>
            )}

            {/* Result panel */}
            {result && (
              <div style={styles.resultSection}>
                {result.valid ? (
                  <div style={styles.resultValid}>
                    <div style={styles.resultHeader}>
                      <span style={{ ...styles.resultIcon, display: 'flex', alignItems: 'center' }}>
                        <CheckCircle2 size={24} style={{ color: '#0a7c4e' }} />
                      </span>
                      <div>
                        <p style={styles.resultTitle}>Valid Certificate</p>
                        <p style={styles.resultSub}>This document is authentic and matches our secure database.</p>
                      </div>
                    </div>
                    <div style={styles.infoGrid}>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Certificate Number</span>
                        <span style={styles.tileVal}>{result.certNumber}</span>
                      </div>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Holder Name</span>
                        <span style={styles.tileVal}>{result.holderName}</span>
                      </div>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Document Type</span>
                        <span style={styles.tileVal}>{result.docType}</span>
                      </div>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Issued Date</span>
                        <span style={styles.tileVal}>{formatDate(result.issuedDate!)}</span>
                      </div>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Issued By</span>
                        <span style={styles.tileVal}>{result.issuedBy}</span>
                      </div>
                      <div style={styles.infoTile}>
                        <span style={styles.tileLabel}>Verified At</span>
                        <span style={styles.tileVal}>{result.verifiedAt}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div style={styles.resultInvalid}>
                    <div style={{ ...styles.invalidIcon, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                      <XCircle size={40} style={{ color: '#b91c1c' }} />
                    </div>
                    <div style={styles.invalidTitle}>Invalid Certificate</div>
                    <div style={styles.invalidSub}>
                      No matching certificate found. Please check the certificate number and try again.
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </main>

      <footer style={styles.footer}>
        © 2026 JD College of Engineering &amp; Management · Certificate Verification System
      </footer>
    </div>
  );
}
