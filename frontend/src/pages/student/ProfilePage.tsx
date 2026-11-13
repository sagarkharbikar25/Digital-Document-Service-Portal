import { useState } from 'react';
import { DEMO_STUDENT } from '../../shared/demoData';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import {
  UserCheck,
  User,
  GraduationCap,
  ShieldCheck,
  CheckCircle2,
  Edit3,
  Save,
  X,
  FileCheck,
  Building,
  Calendar,
  Hash,
} from 'lucide-react';

export function ProfilePage() {
  const [activeTab, setActiveTab] = useState<'personal' | 'academic' | 'kyc'>('personal');
  const [isEditing, setIsEditing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const [formData, setFormData] = useState({
    name: DEMO_STUDENT.name,
    email: 'akash.kumar@jdcoem.ac.in',
    phone: '+91 98765 43210',
    dob: '2004-08-15',
    gender: 'Male',
    address: 'Plot 42, Civil Lines, Nagpur, Maharashtra – 440001',
    bloodGroup: 'O+',
    emergencyContact: '+91 98220 11223 (Father)',
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setIsEditing(false);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* ── HEADER ── */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <Breadcrumb items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'My Profile' },
        ]} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: 0, color: 'var(--navy)', fontFamily: 'var(--font-serif)', letterSpacing: '-0.01em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <UserCheck size={24} color="var(--saffron)" /> Student Profile Registry
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: 13.5 }}>
          Official student identity, enrollment records, and verified KYC documentation.
        </p>
      </div>

      {savedSuccess && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#166534', padding: '12px 18px', borderRadius: 8, fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
          <CheckCircle2 size={16} color="#059669" /> Profile information successfully updated.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 300px) 1fr', gap: 24 }}>
        {/* ── LEFT PROFILE CARD ── */}
        <div className="card" style={{ padding: 24, textAlign: 'center', height: 'fit-content', background: '#fff' }}>
          <div style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: 'var(--navy)',
            color: '#fff',
            display: 'grid',
            placeItems: 'center',
            fontSize: 26,
            fontWeight: 700,
            fontFamily: 'var(--font-serif)',
            margin: '0 auto 16px',
            boxShadow: '0 4px 12px rgba(10,22,40,0.15)',
          }}>
            AK
          </div>
          <h2 style={{ margin: 0, fontSize: 18, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>{formData.name}</h2>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: '#64748b', marginTop: 4 }}>{DEMO_STUDENT.id}</div>

          <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 12, flexWrap: 'wrap' }}>
            <span style={{ background: '#eff6ff', color: '#1e40af', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <GraduationCap size={12} /> {DEMO_STUDENT.branch}
            </span>
            <span style={{ background: '#f5f3ff', color: '#5b21b6', padding: '4px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
              <Calendar size={12} /> {DEMO_STUDENT.year}
            </span>
          </div>

          <div style={{ borderTop: '1px solid #e2e8f0', marginTop: 20, paddingTop: 16, textAlign: 'left', fontSize: 12.5, color: '#64748b', display: 'flex', flexDirection: 'column', gap: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Enrollment Status:</strong>
              <span style={{ color: '#059669', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                <CheckCircle2 size={12} /> Active Student
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Admission Year:</strong>
              <span style={{ color: 'var(--navy)', fontWeight: 600 }}>2022</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <strong>Affiliation:</strong>
              <span style={{ color: 'var(--navy)', fontWeight: 600 }}>DBATU Lonere</span>
            </div>
          </div>
        </div>

        {/* ── RIGHT TABS AND DETAILS ── */}
        <div className="card" style={{ padding: 28, background: '#fff' }}>
          {/* Tabs header */}
          <div style={{ display: 'flex', gap: 10, borderBottom: '1px solid #e2e8f0', paddingBottom: 14, marginBottom: 20 }}>
            {[
              { id: 'personal', label: 'Personal Particulars', icon: User },
              { id: 'academic', label: 'Academic Records', icon: GraduationCap },
              { id: 'kyc', label: 'Identity & Enclosures', icon: ShieldCheck },
            ].map(tab => {
              const Icon = tab.icon;
              const isAct = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: 8,
                    border: 'none',
                    background: isAct ? 'var(--navy)' : '#f1f5f9',
                    color: isAct ? '#fff' : '#64748b',
                    fontSize: 12.5,
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    transition: 'background 0.15s, color 0.15s',
                  }}
                >
                  <Icon size={14} />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Personal Details */}
          {activeTab === 'personal' && (
            <form onSubmit={handleSave} className="stack" style={{ gap: 16 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                <h3 style={{ margin: 0, fontSize: 15, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Contact &amp; Personal Information</h3>
                <button
                  type="button"
                  onClick={() => setIsEditing(!isEditing)}
                  style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  {isEditing ? <><X size={14} /> Cancel</> : <><Edit3 size={14} /> Edit Details</>}
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Full Name</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Email Address</label>
                  <input
                    type="email"
                    disabled
                    value={formData.email}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: '#f8faf9', color: '#64748b' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Mobile Contact</label>
                  <input
                    type="tel"
                    disabled={!isEditing}
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Date of Birth</label>
                  <input
                    type="date"
                    disabled={!isEditing}
                    value={formData.dob}
                    onChange={(e) => setFormData({ ...formData, dob: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Blood Group</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.bloodGroup}
                    onChange={(e) => setFormData({ ...formData, bloodGroup: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Emergency Contact</label>
                  <input
                    type="text"
                    disabled={!isEditing}
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                    style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontSize: 11, fontWeight: 700, color: 'var(--navy)', textTransform: 'uppercase' }}>Residential Address</label>
                <textarea
                  rows={2}
                  disabled={!isEditing}
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  style={{ width: '100%', padding: '9px 12px', borderRadius: 6, border: '1px solid #cbd5e1', marginTop: 4, fontSize: 13, background: isEditing ? '#fff' : '#f8faf9' }}
                />
              </div>

              {isEditing && (
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
                  <button
                    type="submit"
                    style={{ padding: '8px 20px', borderRadius: 6, background: 'var(--navy)', color: '#fff', border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
                  >
                    <Save size={14} /> Save Changes
                  </button>
                </div>
              )}
            </form>
          )}

          {/* TAB 2: Academic Details */}
          {activeTab === 'academic' && (
            <div className="stack" style={{ gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Academic Enrollment Record</h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16, fontSize: 13 }}>
                <div style={{ padding: 14, background: '#f8faf9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>DEGREE PROGRAMME</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 2, fontSize: 14 }}>Bachelor of Technology (B.Tech)</div>
                </div>
                <div style={{ padding: 14, background: '#f8faf9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>DEPARTMENT</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 2, fontSize: 14 }}>Computer Science &amp; Engineering</div>
                </div>
                <div style={{ padding: 14, background: '#f8faf9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>AFFILIATING UNIVERSITY</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 2, fontSize: 14 }}>DBATU, Lonere</div>
                </div>
                <div style={{ padding: 14, background: '#f8faf9', borderRadius: 8, border: '1px solid #e2e8f0' }}>
                  <div style={{ color: '#64748b', fontSize: 11, fontWeight: 700 }}>SEMESTER &amp; SECTION</div>
                  <div style={{ fontWeight: 700, color: 'var(--navy)', marginTop: 2, fontSize: 14 }}>Semester VI • Section A</div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: KYC Documents */}
          {activeTab === 'kyc' && (
            <div className="stack" style={{ gap: 16 }}>
              <h3 style={{ margin: 0, fontSize: 15, color: 'var(--navy)', fontFamily: 'var(--font-serif)' }}>Verified Identity Documents</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  { name: 'Aadhaar Card (UIDAI)', id: 'XXXX-XXXX-8912', status: 'Verified' },
                  { name: 'College Admission Proof', id: 'ADM-2022-CSE-041', status: 'Verified' },
                  { name: 'Class 12th Passing Certificate', id: 'MSBSHSE-2022-7718', status: 'Verified' },
                ].map((doc, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 14, border: '1px solid #e2e8f0', borderRadius: 8, background: '#fff' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 34, height: 34, borderRadius: 8, background: '#f0fdf4', display: 'grid', placeItems: 'center', color: '#16a34a' }}>
                        <FileCheck size={18} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--navy)', fontSize: 13.5 }}>{doc.name}</div>
                        <div style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#64748b' }}>{doc.id}</div>
                      </div>
                    </div>
                    <span style={{ background: '#d1fae5', color: '#065f46', padding: '4px 12px', borderRadius: 20, fontSize: 11.5, fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <CheckCircle2 size={12} /> {doc.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
