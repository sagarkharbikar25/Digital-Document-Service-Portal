import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOC_TYPES, getDocIcon } from '../../shared/documentTypes';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import {
  FileText,
  Search,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Info,
  ArrowRight,
  Sparkles,
} from 'lucide-react';

export function DocumentCataloguePage() {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'all' | 'academic' | 'conduct' | 'free'>('all');

  const filteredDocs = DOC_TYPES.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.keywords.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doc.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'all' ||
      (activeTab === 'academic' && doc.category === 'academic') ||
      (activeTab === 'conduct' && doc.category === 'conduct') ||
      (activeTab === 'free' && doc.fee === 'free');
    return matchesSearch && matchesTab;
  });

  const academicDocs = filteredDocs.filter(d => d.category === 'academic');
  const conductDocs = filteredDocs.filter(d => d.category === 'conduct');

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* ── PAGE HERO ── */}
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Available Documents' },
          ]} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileText size={24} color="var(--saffron)" /> Available Documents
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13.5 }}>
            Browse official academic and conduct documents. Submit applications with mandatory attachments online.
          </p>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ background: '#f8faf9', padding: '10px 18px', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>{DOC_TYPES.length}</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Documents Available</div>
          </div>
          <div style={{ background: '#f8faf9', padding: '10px 18px', borderRadius: 8, textAlign: 'center', border: '1px solid #e2e8f0' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>2</div>
            <div style={{ fontSize: 11, color: '#64748b', fontWeight: 600 }}>Days Avg. Turnaround</div>
          </div>
        </div>
      </div>

      {/* ── SEARCH & FILTER TABS ── */}
      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 240, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px', background: '#fff' }}>
          <Search size={15} color="#94a3b8" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Search documents by title, keyword, or purpose..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ width: '100%', padding: '9px 0', border: 'none', outline: 'none', fontSize: 13 }}
          />
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['all', 'academic', 'conduct', 'free'] as const).map(tab => {
            const labels = {
              all: 'All Documents',
              academic: 'Academic',
              conduct: 'Verification & Conduct',
              free: 'No Fee',
            };
            const icons = {
              all: <FileText size={13} />,
              academic: <GraduationCap size={13} />,
              conduct: <ShieldCheck size={13} />,
              free: <CheckCircle2 size={13} />,
            };
            const isActive = activeTab === tab;
            return (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                style={{
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: isActive ? 'none' : '1px solid #cbd5e1',
                  background: isActive ? 'var(--navy)' : '#fff',
                  color: isActive ? '#fff' : 'var(--navy)',
                  fontSize: 12.5,
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'background 0.15s, color 0.15s',
                }}
              >
                {icons[tab]} {labels[tab]}
              </button>
            );
          })}
        </div>
        <div style={{ fontSize: 13, color: '#64748b' }}>
          Showing <b>{filteredDocs.length}</b> documents
        </div>
      </div>

      {/* ── INFO BANNER ── */}
      <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 18px', display: 'flex', gap: 12, alignItems: 'center', fontSize: 13, color: '#1e40af' }}>
        <Info size={18} color="#2563eb" style={{ flexShrink: 0 }} />
        <div>
          <strong>Autonomous Application Procedure:</strong> Select required certificate → Fill candidate particulars &amp; reason → Attach scanned credentials → Submit.
          Track approval stages live and download verifiable signed PDF with QR seal under <strong>My Applications</strong>.
        </div>
      </div>

      {/* ── EMPTY STATE ── */}
      {filteredDocs.length === 0 && (
        <div className="card" style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#f1f5f9', display: 'grid', placeItems: 'center', margin: '0 auto 12px' }}>
            <Search size={22} color="#94a3b8" />
          </div>
          <h3 style={{ margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>No documents found</h3>
          <p style={{ color: '#64748b', fontSize: 14 }}>Try adjusting your search criteria or switching category filters.</p>
        </div>
      )}

      {/* ── ACADEMIC SECTION ── */}
      {academicDocs.length > 0 && (activeTab === 'all' || activeTab === 'academic' || activeTab === 'free') && (
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#eff6ff', width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', color: '#1e40af' }}>
              <GraduationCap size={16} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Academic Documents</h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>({academicDocs.length} available)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {academicDocs.map(doc => (
              <div
                key={doc.code}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 20,
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: '3px solid #3b82f6',
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: doc.iconBg, display: 'grid', placeItems: 'center', color: 'var(--navy)', flexShrink: 0 }}>
                    {getDocIcon(doc.code, 20)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{doc.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{doc.description}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {doc.processingDays}
                  </span>
                  <span style={{
                    background: doc.fee === 'free' ? '#d1fae5' : '#fef3c7',
                    color: doc.fee === 'free' ? '#065f46' : '#92400e',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {doc.fee === 'free' ? 'Nil / Free' : 'Fee Applicable'}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 16, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 10.5 }}>Mandatory Attachments:</div>
                  {doc.requiredDocs.map((req, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '2px 0' }}>
                      <span style={{ color: 'var(--saffron)' }}>•</span> {req}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/applications/new?type=${doc.code}`)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    background: '#fff8eb',
                    color: '#b45309',
                    border: '1.5px solid #f59e0b',
                    fontWeight: 700,
                    fontSize: 13,
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
                  Apply Now <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── VERIFICATION & CONDUCT SECTION ── */}
      {conductDocs.length > 0 && (activeTab === 'all' || activeTab === 'conduct') && (
        <div style={{ marginTop: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
            <div style={{ background: '#fff7ed', width: 32, height: 32, borderRadius: 8, display: 'grid', placeItems: 'center', color: '#ea580c' }}>
              <ShieldCheck size={16} />
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Verification &amp; Conduct Documents</h2>
            <span style={{ fontSize: 12, color: '#94a3b8' }}>({conductDocs.length} available)</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18 }}>
            {conductDocs.map(doc => (
              <div
                key={doc.code}
                className="card"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  padding: 20,
                  position: 'relative',
                  overflow: 'hidden',
                  borderTop: '3px solid #f97316',
                  background: '#fff',
                }}
              >
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <div style={{ width: 42, height: 42, borderRadius: 10, background: doc.iconBg, display: 'grid', placeItems: 'center', color: 'var(--navy)', flexShrink: 0 }}>
                    {getDocIcon(doc.code, 20)}
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--navy)' }}>{doc.title}</h3>
                    <p style={{ margin: '4px 0 0', fontSize: 12, color: '#64748b', lineHeight: 1.4 }}>{doc.description}</p>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
                  <span style={{ background: '#f8faf9', border: '1px solid #e2e8f0', padding: '3px 8px', borderRadius: 6, fontSize: 11, fontWeight: 600, color: '#475569', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    <Clock size={11} /> {doc.processingDays}
                  </span>
                  <span style={{
                    background: doc.fee === 'free' ? '#d1fae5' : '#fef3c7',
                    color: doc.fee === 'free' ? '#065f46' : '#92400e',
                    padding: '3px 8px',
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: 700,
                  }}>
                    {doc.fee === 'free' ? 'Nil / Free' : 'Fee Applicable'}
                  </span>
                </div>

                <div style={{ fontSize: 11.5, color: '#64748b', marginBottom: 16, flex: 1 }}>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.4px', fontSize: 10.5 }}>Mandatory Attachments:</div>
                  {doc.requiredDocs.map((req, i) => (
                    <div key={i} style={{ display: 'flex', gap: 6, alignItems: 'center', margin: '2px 0' }}>
                      <span style={{ color: 'var(--saffron)' }}>•</span> {req}
                    </div>
                  ))}
                </div>

                <button
                  onClick={() => navigate(`/applications/new?type=${doc.code}`)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: 8,
                    background: '#fff8eb',
                    color: '#b45309',
                    border: '1.5px solid #f59e0b',
                    fontWeight: 700,
                    fontSize: 13,
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
                  Apply Now <ArrowRight size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default DocumentCataloguePage;
