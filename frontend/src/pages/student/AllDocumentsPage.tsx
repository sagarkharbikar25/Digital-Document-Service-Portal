import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DOC_TYPES, getDocIcon } from '../../shared/documentTypes';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import {
  FileSpreadsheet,
  Search,
  ArrowRight,
  GraduationCap,
  ShieldCheck,
} from 'lucide-react';

export function AllDocumentsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'academic' | 'conduct'>('all');

  const filtered = DOC_TYPES.filter(d => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase()) ||
      d.description.toLowerCase().includes(search.toLowerCase());
    const matchesCat = categoryFilter === 'all' || d.category === categoryFilter;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="stack" style={{ gap: 24 }}>
      <div className="card" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '24px 28px', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'All Documents' },
          ]} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
            <FileSpreadsheet size={24} color="var(--saffron)" /> Complete Document Directory
          </h1>
          <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13.5 }}>
            Comprehensive directory of official institutional certificates, clearances, and academic transcripts.
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '16px 20px', display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: 220, display: 'flex', alignItems: 'center', border: '1px solid #cbd5e1', borderRadius: 8, padding: '0 12px', background: '#fff' }}>
          <Search size={15} color="#94a3b8" style={{ marginRight: 8 }} />
          <input
            type="text"
            placeholder="Filter directory by certificate name or keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ width: '100%', padding: '8px 0', border: 'none', outline: 'none', fontSize: 13 }}
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value as any)}
          style={{ padding: '8px 12px', borderRadius: 8, border: '1px solid #cbd5e1', fontSize: 13, background: '#fff' }}
        >
          <option value="all">All Classifications</option>
          <option value="academic">Academic Credentials</option>
          <option value="conduct">Conduct &amp; Clearance</option>
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8faf9', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: 11.5, textTransform: 'uppercase', letterSpacing: '0.4px' }}>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Document Title</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Classification</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Standard Processing</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Fee Type</th>
                <th style={{ padding: '14px 20px', fontWeight: 600 }}>Mandatory Enclosures</th>
                <th style={{ padding: '14px 20px', fontWeight: 600, textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(doc => (
                <tr key={doc.code} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: doc.iconBg, display: 'grid', placeItems: 'center', color: 'var(--navy)', flexShrink: 0 }}>
                        {getDocIcon(doc.code, 18)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--navy)' }}>{doc.title}</div>
                        <div style={{ fontSize: 11.5, color: '#64748b', marginTop: 1 }}>{doc.description}</div>
                      </div>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 600,
                      background: doc.category === 'academic' ? '#eff6ff' : '#fff7ed',
                      color: doc.category === 'academic' ? '#1e40af' : '#c2410c',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 4,
                    }}>
                      {doc.category === 'academic' ? <GraduationCap size={12} /> : <ShieldCheck size={12} />}
                      {doc.category === 'academic' ? 'Academic' : 'Conduct'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', color: '#64748b' }}>{doc.processingDays}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 6,
                      fontSize: 11,
                      fontWeight: 700,
                      background: doc.fee === 'free' ? '#d1fae5' : '#fef3c7',
                      color: doc.fee === 'free' ? '#065f46' : '#92400e',
                    }}>
                      {doc.fee === 'free' ? 'Nil / Free' : 'Institutional Standard'}
                    </span>
                  </td>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#64748b' }}>
                    {doc.requiredDocs.join(', ')}
                  </td>
                  <td style={{ padding: '14px 20px', textAlign: 'right' }}>
                    <button
                      onClick={() => navigate(`/applications/new?type=${doc.code}`)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: 6,
                        background: '#fff8eb',
                        color: '#b45309',
                        border: '1.5px solid #f59e0b',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 4,
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
                      Apply <ArrowRight size={12} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default AllDocumentsPage;
