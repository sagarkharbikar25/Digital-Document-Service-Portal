import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings,
  ShieldCheck,
  UserPlus,
  Users,
  Trash2,
  ArrowLeft,
  CheckCircle2,
  Building2,
} from 'lucide-react';

export function AdminSetupPage() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([
    { id: 1, name: 'Academic Clerk Office', email: 'clerk@jdcoem.ac.in', role: 'Clerk', dept: 'Student Section' },
    { id: 2, name: 'Dr. HOD CSE', email: 'hod@jdcoem.ac.in', role: 'HOD', dept: 'Computer Science & Engineering' },
    { id: 3, name: 'Dr. S. K. Principal', email: 'principal@jdcoem.ac.in', role: 'Principal', dept: 'Administration' },
    { id: 4, name: 'System Administrator', email: 'admin@jdcoem.ac.in', role: 'Super Admin', dept: 'IT Operations' },
  ]);

  const [newUser, setNewUser] = useState({ name: '', email: '', role: 'Clerk', dept: '' });
  const [showToast, setShowToast] = useState(false);

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUser.name || !newUser.email) return;
    setUsers(prev => [...prev, { id: Date.now(), ...newUser }]);
    setNewUser({ name: '', email: '', role: 'Clerk', dept: '' });
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleDeleteUser = (id: number) => {
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  return (
    <div style={{ minHeight: '100vh', background: '#06122a', color: '#fff', fontFamily: 'var(--font-sans)', padding: '36px 20px 60px' }}>
      {/* ── TOPBAR ── */}
      <div style={{ maxWidth: 960, margin: '0 auto 36px', display: 'flex', alignItems: 'center', gap: 14 }}>
        <div
          style={{
            width: 44,
            height: 44,
            borderRadius: 12,
            background: 'linear-gradient(135deg, #c8922a, #e8b84b)',
            display: 'grid',
            placeItems: 'center',
            color: '#06122a',
            boxShadow: '0 2px 12px rgba(200,146,42,.4)',
          }}
        >
          <Settings size={22} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 16, fontWeight: 700, color: '#fff' }}>
            Portal Setup &amp; Configuration
          </div>
          <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.45)' }}>JDCOEM Admin Portal</div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/admin')}
          style={{
            marginLeft: 'auto',
            background: 'rgba(255,255,255,0.07)',
            border: '1px solid rgba(255,255,255,0.12)',
            color: 'rgba(255,255,255,0.8)',
            borderRadius: 6,
            padding: '7px 16px',
            fontSize: 12.5,
            fontWeight: 600,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <ArrowLeft size={13} /> Back to Admin Login
        </button>
      </div>

      {/* ── HERO BANNER ── */}
      <div
        style={{
          maxWidth: 960,
          margin: '0 auto 28px',
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          borderRadius: 18,
          padding: '24px 32px',
          display: 'flex',
          alignItems: 'center',
          gap: 20,
        }}
      >
        <div
          style={{
            width: 52,
            height: 52,
            borderRadius: 14,
            background: 'rgba(200,146,42,0.15)',
            border: '1px solid rgba(200,146,42,0.3)',
            display: 'grid',
            placeItems: 'center',
            color: '#e8b84b',
            flexShrink: 0,
          }}
        >
          <Building2 size={26} />
        </div>
        <div>
          <div style={{ fontFamily: 'var(--font-serif)', fontSize: 20, fontWeight: 700, color: '#fff' }}>
            Administrative Access &amp; Department RBAC
          </div>
          <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>
            Configure segregated accounts for Academic Clerk, Department HOD, and Principal Authorities.
          </div>
        </div>
      </div>

      {showToast && (
        <div style={{ maxWidth: 960, margin: '0 auto 20px', background: '#edfaf3', border: '1px solid #a3dfc3', color: '#0a7c4e', padding: '12px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} /> Staff account configured and access permissions established.
        </div>
      )}

      {/* ── TWO COLUMN GRID ── */}
      <div style={{ maxWidth: 960, margin: '0 auto', display: 'grid', gridTemplateColumns: '1.1fr 1fr', gap: 24, alignItems: 'start' }}>
        {/* Account Form */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', color: '#0f1e3a' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #e0e4f0', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#eff6ff', display: 'grid', placeItems: 'center', color: '#1a4fa3' }}>
              <UserPlus size={16} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: '#06122a' }}>
                Add Administrative Staff
              </div>
              <div style={{ fontSize: 11.5, color: '#7a88a8' }}>Grant isolated portal role access</div>
            </div>
          </div>

          <form onSubmit={handleAddUser} style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#3d4f72', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                Full Name
              </label>
              <input
                type="text"
                required
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="e.g. Dr. Rajesh Kulkarni"
                style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #cdd2e8', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#3d4f72', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                Official College Email
              </label>
              <input
                type="email"
                required
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="user@jdcoem.ac.in"
                style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #cdd2e8', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#3d4f72', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                Designated Role
              </label>
              <select
                value={newUser.role}
                onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #cdd2e8', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box', background: '#fff' }}
              >
                <option value="Clerk">Clerk (Document Verification &amp; Forwarding)</option>
                <option value="HOD">HOD (Departmental Endorsement &amp; Review)</option>
                <option value="Principal">Principal (Final Signing &amp; Issuance Authority)</option>
                <option value="Super Admin">System Administrator</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: 11.5, fontWeight: 700, color: '#3d4f72', textTransform: 'uppercase', letterSpacing: '0.6px', display: 'block', marginBottom: 4 }}>
                Department
              </label>
              <input
                type="text"
                value={newUser.dept}
                onChange={(e) => setNewUser({ ...newUser, dept: e.target.value })}
                placeholder="e.g. Computer Science / Academic Cell"
                style={{ width: '100%', padding: '9px 13px', border: '1.5px solid #cdd2e8', borderRadius: 8, fontSize: 13.5, outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <button
              type="submit"
              style={{
                width: '100%',
                padding: 11,
                border: 'none',
                borderRadius: 8,
                background: 'linear-gradient(135deg, #06122a, #152d60)',
                color: '#fff',
                fontSize: 14,
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 14px rgba(6,18,42,.22)',
                marginTop: 6,
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              <UserPlus size={16} /> Create Staff Access
            </button>
          </form>
        </div>

        {/* User List */}
        <div style={{ background: '#fff', borderRadius: 18, overflow: 'hidden', boxShadow: '0 8px 40px rgba(0,0,0,0.35)', color: '#0f1e3a' }}>
          <div style={{ padding: '16px 22px', borderBottom: '1px solid #e0e4f0', display: 'flex', alignItems: 'center', gap: 11 }}>
            <div style={{ width: 32, height: 32, borderRadius: 8, background: '#fdf6e3', display: 'grid', placeItems: 'center', color: '#c8922a' }}>
              <ShieldCheck size={16} />
            </div>
            <div>
              <div style={{ fontFamily: 'var(--font-serif)', fontSize: 15, fontWeight: 700, color: '#06122a' }}>
                Active Administrative Staff
              </div>
              <div style={{ fontSize: 11.5, color: '#7a88a8' }}>{users.length} configured credentials</div>
            </div>
          </div>

          <div style={{ padding: 22, display: 'flex', flexDirection: 'column', gap: 10 }}>
            {users.map((u) => {
              const roleBg =
                u.role === 'Clerk'
                  ? '#eff6ff'
                  : u.role === 'HOD'
                  ? '#f5f3ff'
                  : u.role === 'Principal'
                  ? '#fdf2f8'
                  : '#fef3c7';
              const roleColor =
                u.role === 'Clerk'
                  ? '#1a4fa3'
                  : u.role === 'HOD'
                  ? '#5b21b6'
                  : u.role === 'Principal'
                  ? '#be185d'
                  : '#92400e';

              return (
                <div
                  key={u.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '11px 14px',
                    borderRadius: 8,
                    border: '1px solid #e0e4f0',
                    background: '#f4f6fb',
                  }}
                >
                  <div
                    style={{
                      width: 36,
                      height: 36,
                      borderRadius: '50%',
                      background: 'linear-gradient(135deg, #0d1f45, #152d60)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: 12.5,
                      fontWeight: 700,
                      color: '#fff',
                      flexShrink: 0,
                    }}
                  >
                    {u.role.charAt(0)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#0f1e3a' }}>{u.name}</div>
                    <div style={{ fontSize: 11, color: '#7a88a8' }}>{u.email} · {u.dept}</div>
                  </div>
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: '2px 9px',
                      borderRadius: 20,
                      background: roleBg,
                      color: roleColor,
                      flexShrink: 0,
                    }}
                  >
                    {u.role}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleDeleteUser(u.id)}
                    title="Revoke access"
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#94a3b8',
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '4px 6px',
                      transition: 'color 0.15s',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#dc2626')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
export default AdminSetupPage;
