import { useState } from 'react';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import { Bell, Megaphone, Zap, CalendarOff, CheckCircle2, Inbox, Check } from 'lucide-react';

type NotifType = 'announcement' | 'update' | 'closure' | 'approval';
type FilterTab = 'all' | 'unread' | 'announcements' | 'updates';

interface Notification {
  id: number;
  type: NotifType;
  title: string;
  description: string;
  time: string;
  read: boolean;
}

function renderNotifIcon(type: NotifType) {
  switch (type) {
    case 'announcement':
      return <Megaphone size={18} style={{ color: '#1d4ed8' }} />;
    case 'update':
      return <Zap size={18} style={{ color: '#d97706' }} />;
    case 'closure':
      return <CalendarOff size={18} style={{ color: '#dc2626' }} />;
    case 'approval':
      return <CheckCircle2 size={18} style={{ color: '#15803d' }} />;
  }
}

const INITIAL: Notification[] = [
  {
    id: 1,
    type: 'announcement',
    title: 'Sem VI Hall Tickets Released',
    description: 'Hall tickets for Semester VI examinations are now available. Download from the portal immediately.',
    time: '2 hours ago',
    read: false,
  },
  {
    id: 2,
    type: 'update',
    title: 'Bonafide Processing: Now 2 Days',
    description: 'Processing time for bonafide certificate requests has been reduced to 2 working days.',
    time: 'Yesterday',
    read: false,
  },
  {
    id: 3,
    type: 'approval',
    title: 'Your Bonafide Certificate APP-2026-001 is Approved',
    description: 'Your bonafide certificate application has been approved and is ready to download.',
    time: '2 days ago',
    read: true,
  },
  {
    id: 4,
    type: 'closure',
    title: 'Office Holiday – 26 Jan',
    description: 'The administrative office will remain closed on 26th January for Republic Day. Applications will resume on 27th Jan.',
    time: '3 days ago',
    read: true,
  },
  {
    id: 5,
    type: 'approval',
    title: 'Application APP-2026-003 forwarded to HOD',
    description: 'Your application has been reviewed by the clerk and forwarded to the HOD for further approval.',
    time: '5 days ago',
    read: true,
  },
];

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>(INITIAL);
  const [activeTab, setActiveTab] = useState<FilterTab>('all');

  function markAllRead() {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }

  function markRead(id: number) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  const filtered = notifications.filter((n) => {
    if (activeTab === 'unread') return !n.read;
    if (activeTab === 'announcements') return n.type === 'announcement';
    if (activeTab === 'updates') return n.type === 'update' || n.type === 'approval';
    return true;
  });

  const unreadCount = notifications.filter((n) => !n.read).length;

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'unread', label: 'Unread' },
    { key: 'announcements', label: 'Announcements' },
    { key: 'updates', label: 'Updates' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Hero */}
      <div className="card" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
        <div>
          <Breadcrumb items={[
            { label: 'Dashboard', to: '/dashboard' },
            { label: 'Notifications' },
          ]} />
          <h1 style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 4px', color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
            <Bell size={22} style={{ color: 'var(--saffron)' }} /> Notifications
          </h1>
          <p style={{ color: 'var(--muted)', fontSize: 14, margin: 0 }}>
            {unreadCount > 0
              ? `You have ${unreadCount} unread notification${unreadCount > 1 ? 's' : ''}`
              : 'All caught up — no unread notifications'}
          </p>
        </div>
        {unreadCount > 0 && (
          <button className="secondary-button" onClick={markAllRead} style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <Check size={14} /> Mark all read
          </button>
        )}
      </div>

      {/* Filter tabs */}
      <div
        style={{
          display: 'flex',
          gap: 4,
          borderBottom: '1px solid var(--line)',
          marginBottom: 24,
        }}
      >
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            style={{
              border: 'none',
              background: 'none',
              padding: '0 4px 11px',
              marginRight: 16,
              fontSize: 13,
              fontWeight: 700,
              color: activeTab === tab.key ? 'var(--forest)' : 'var(--muted)',
              borderBottom: activeTab === tab.key ? '2px solid #d7a64e' : '2px solid transparent',
              cursor: 'pointer',
              position: 'relative',
              top: 1,
            }}
          >
            {tab.label}
            {tab.key === 'unread' && unreadCount > 0 && (
              <span
                style={{
                  marginLeft: 6,
                  background: '#d8674f',
                  color: '#fff',
                  borderRadius: 10,
                  fontSize: 10,
                  fontWeight: 700,
                  padding: '1px 6px',
                }}
              >
                {unreadCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Notification list */}
      {filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: 'var(--muted)',
          }}
        >
          <div style={{ marginBottom: 12, display: 'flex', justifyContent: 'center' }}>
            <Inbox size={42} style={{ color: 'var(--muted)', strokeWidth: 1.5 }} />
          </div>
          <p style={{ fontSize: 14, margin: 0 }}>No notifications in this category</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 8 }}>
          {filtered.map((n) => (
            <div
              key={n.id}
              onClick={() => markRead(n.id)}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 14,
                padding: '16px 20px',
                background: n.read ? '#fff' : '#f0f9f4',
                borderRadius: 10,
                border: '1px solid var(--line)',
                cursor: 'pointer',
                transition: 'background 0.15s',
                position: 'relative',
              }}
            >
              {/* Unread dot */}
              {!n.read && (
                <span
                  style={{
                    position: 'absolute',
                    left: 8,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    background: '#3b82f6',
                    flexShrink: 0,
                  }}
                />
              )}

              {/* Type icon */}
              <div
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: n.read ? '#f3f4f6' : '#ecfdf5',
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0,
                  marginLeft: 6,
                }}
              >
                {renderNotifIcon(n.type)}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
                  <strong
                    style={{
                      fontSize: 13,
                      color: 'var(--ink)',
                      fontWeight: n.read ? 500 : 700,
                    }}
                  >
                    {n.title}
                  </strong>
                  <span style={{ fontSize: 11, color: 'var(--muted)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                    {n.time}
                  </span>
                </div>
                <p style={{ margin: '4px 0 0', fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>
                  {n.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
