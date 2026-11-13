import { useNavigate } from 'react-router-dom';
import { Home, ChevronRight } from 'lucide-react';

export interface CrumbItem {
  label: string;
  to?: string;
}

export function Breadcrumb({ items }: { items: CrumbItem[] }) {
  const navigate = useNavigate();

  return (
    <nav
      aria-label="Breadcrumb"
      style={{
        fontSize: 12.5,
        color: '#64748b',
        marginBottom: 8,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      {items.map((item, index) => {
        const isLast = index === items.length - 1;
        const cleanLabel = item.label.replace(/^🏠\s*/, '');
        const isHome = index === 0;

        return (
          <span key={index} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            {index > 0 && <ChevronRight size={12} color="#94a3b8" style={{ flexShrink: 0 }} />}
            {item.to && !isLast ? (
              <span
                role="button"
                tabIndex={0}
                onClick={() => navigate(item.to!)}
                onKeyDown={(e) => { if (e.key === 'Enter') navigate(item.to!); }}
                style={{
                  color: 'var(--navy)',
                  cursor: 'pointer',
                  fontWeight: 500,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 4,
                  transition: 'color 0.15s ease',
                }}
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--saffron)'; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.color = 'var(--navy)'; }}
              >
                {isHome && <Home size={13} style={{ flexShrink: 0 }} />}
                {cleanLabel}
              </span>
            ) : (
              <span style={{ fontWeight: 600, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                {isHome && <Home size={13} style={{ flexShrink: 0 }} />}
                {cleanLabel}
              </span>
            )}
          </span>
        );
      })}
    </nav>
  );
}

export default Breadcrumb;
