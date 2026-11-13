import { useState, useEffect } from 'react';
import { DEMO_APPLICATIONS } from '../../shared/demoData';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { applicationApi, certificateApi } from '../../services/api';
import {
  DownloadCloud,
  Search,
  FileBadge,
  ShieldCheck,
  Download,
  CheckCircle2,
  Clock,
  QrCode,
} from 'lucide-react';

export function DownloadsPage() {
  const [apps, setApps] = useState<any[]>(DEMO_APPLICATIONS);
  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    applicationApi.getMy().then(res => {
      if (res.success && res.data && res.data.length > 0) {
        const mapped = res.data.map(item => ({
          id: item.application_number || `APP-2026-${String(item.id).padStart(4, '0')}`,
          docCode: item.certificate_type,
          docTitle: (item.certificate_type || 'Document').replace('_', ' ').replace(/\b\w/g, (c: string) => c.toUpperCase()),
          dateApplied: item.created_at ? item.created_at.split('T')[0] : '2026-11-01',
          status: item.status,
          appId: item.id,
          certNumber: item.cert_no || item.certificate_number,
        }));
        setApps(mapped);
      }
    }).catch(() => {});
  }, []);

  const readyApps = apps.filter(a => a.status === 'issued' || a.status === 'approved');

  const filtered = readyApps.filter(a =>
    a.docTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = (id: string, title: string, appId?: number | string) => {
    setDownloadingId(id);
    const targetId = appId || id;
    window.open(certificateApi.getDownloadUrl(targetId), '_blank');
    setTimeout(() => {
      setDownloadingId(null);
    }, 1000);
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* ── PAGE HERO ── */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Downloads' },
          ]} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <DownloadCloud size={24} color="var(--saffron)" /> Official Document Downloads
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13.5 }}>
            Access and download your verified, digitally signed certificates and institutional transcripts.
          </p>
        </div>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', padding: '10px 18px', borderRadius: 8, textAlign: 'center' }}>
          <div style={{ fontSize: 20, fontWeight: 700, color: '#166534', fontFamily: 'var(--font-serif)' }}>{readyApps.length}</div>
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600 }}>Ready for Download</div>
        </div>
      </div>

      {/* ── SEARCH BAR ── */}
      <div className="card" style={{ padding: '16px 20px' }}>
        <div style={{ width: '100%', maxWidth: 440, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px', background: '#fff' }}>
          <Search size={15} color="#94a3b8" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search by certificate title or application ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
          />
        </div>
      </div>

      {/* ── DOWNLOAD CARDS ── */}
      {filtered.length === 0 ? (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <DownloadCloud size={24} color="#94a3b8" />
          </div>
          <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>No Completed Downloads</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>
            Once your applied documents receive final executive approval, they will appear here with cryptographic QR seals.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 20 }}>
          {filtered.map(app => (
            <div key={app.id} className="card" style={{ padding: 22, borderTop: '3px solid #10b981', display: 'flex', flexDirection: 'column', background: '#fff' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <div style={{ width: 42, height: 42, borderRadius: 10, background: 'rgba(10,22,40,0.06)', display: 'grid', placeItems: 'center', color: 'var(--navy)' }}>
                  <FileBadge size={22} color="var(--navy)" />
                </div>
                <span style={{
                  padding: '4px 10px',
                  borderRadius: 20,
                  fontSize: 11.5,
                  fontWeight: 700,
                  background: '#d1fae5',
                  color: '#065f46',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                }}>
                  <ShieldCheck size={13} /> Digitally Sealed
                </span>
              </div>

              <h3 style={{ margin: '0 0 4px', fontSize: 16, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>
                {app.docTitle}
              </h3>
              <div style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: '#64748b', marginBottom: 14 }}>
                Reference: {app.id}
              </div>

              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: 12, marginBottom: 18, fontSize: 12.5, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 7, flex: 1 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Sanction Date:</span>
                  <strong style={{ color: 'var(--navy)' }}>{app.dateApplied}</strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Document Format:</span>
                  <strong style={{ color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <QrCode size={13} /> PDF with QR Seal
                  </strong>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span>Autonomous Validity:</span>
                  <strong style={{ color: '#059669', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <CheckCircle2 size={13} /> Official &amp; Verifiable
                  </strong>
                </div>
              </div>

              <button
                onClick={() => handleDownload(app.id, app.docTitle)}
                disabled={downloadingId === app.id}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: 8,
                  background: '#10b981',
                  color: '#fff',
                  border: 'none',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: downloadingId === app.id ? 'wait' : 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  boxShadow: '0 2px 6px rgba(16,185,129,0.2)',
                }}
              >
                <Download size={14} />
                {downloadingId === app.id ? 'Rendering PDF...' : 'Download Official PDF'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default DownloadsPage;
