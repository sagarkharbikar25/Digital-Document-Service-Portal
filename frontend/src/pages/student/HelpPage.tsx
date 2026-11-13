import { useState } from 'react';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import {
  HelpCircle,
  Phone,
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  UploadCloud,
  ShieldCheck,
  Download,
  Mail,
  Building2,
  AlertTriangle,
} from 'lucide-react';

export function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How long does document processing usually take?',
      a: 'Processing times vary depending on the document type. Simple documents like Bonafide Certificates take 2 working days, while certificates requiring university coordination (such as Degree or Transcripts) take 10 to 15 working days.',
    },
    {
      q: 'What documents do I need to upload when applying?',
      a: 'Each document card in the Document Catalogue lists specific mandatory attachments. Commonly required files include your College ID card, fee clearance receipts, passport-size photographs, and marksheets.',
    },
    {
      q: 'Can I track my application in real-time?',
      a: 'Yes. Every submitted request receives a unique Application ID (e.g. APP-2026-0041). Enter this ID in the "Track Status" section to see the step-by-step progress from clerk verification to principal issuance.',
    },
    {
      q: 'What should I do if my application is rejected?',
      a: 'If an application is rejected, the reviewing authority will leave specific remarks stating the reason (e.g. illegible marksheet or pending library dues). You can resolve the issue and submit a new request.',
    },
    {
      q: 'How do I download my approved certificate?',
      a: 'Once approved and signed, the certificate appears immediately in your "Downloads" section and under "My Applications" with a green "Download" button. The generated PDF includes a verification QR code.',
    },
    {
      q: 'Who should I contact for emergency or urgent certificate issuance?',
      a: 'For urgent academic matters, visit the Academic Section counter in the Administrative Block with your Application ID or reach out to the contacts listed below.',
    },
  ];

  const steps = [
    { num: '1', title: 'Choose Document', desc: 'Browse catalogue & pick required certificate', icon: FileText },
    { num: '2', title: 'Fill & Attach', desc: 'Complete form details & upload proof scans', icon: UploadCloud },
    { num: '3', title: 'Staff Verification', desc: 'Clerk, HOD, and Principal approve online', icon: ShieldCheck },
    { num: '4', title: 'Instant Download', desc: 'Get signed PDF with verifiable QR seal', icon: Download },
  ];

  return (
    <div className="stack" style={{ gap: 24 }}>
      {/* ── HEADER ── */}
      <div className="card" style={{ padding: '24px 28px' }}>
        <Breadcrumb items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Help & Support' },
        ]} />
        <h1 style={{ fontSize: 24, fontWeight: 700, margin: '6px 0 4px', color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 10 }}>
          <HelpCircle size={22} style={{ color: 'var(--saffron)' }} /> Help & Support Center
        </h1>
        <p style={{ margin: '4px 0 0', color: 'var(--muted)', fontSize: 14 }}>
          Official guidance, process walkthroughs, and administrative contact channels for JDCOEM students.
        </p>
      </div>

      {/* ── 4-STEP WORKFLOW ── */}
      <div className="card" style={{ padding: 24 }}>
        <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--navy)' }}>How Document Application Works</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16 }}>
          {steps.map(s => {
            const Icon = s.icon;
            return (
              <div key={s.num} style={{ padding: 18, background: '#f8faf9', borderRadius: 10, border: '1px solid #dfe6e2', display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                  <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'var(--navy)', color: '#fff', display: 'grid', placeItems: 'center', fontWeight: 700, fontSize: 12 }}>
                    {s.num}
                  </div>
                  <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ecfdf5', color: 'var(--forest)', display: 'grid', placeItems: 'center' }}>
                    <Icon size={16} />
                  </div>
                </div>
                <h4 style={{ margin: '0 0 4px', fontSize: 14, color: 'var(--navy)', fontWeight: 700 }}>{s.title}</h4>
                <p style={{ margin: 0, fontSize: 12, color: 'var(--muted)', lineHeight: 1.5 }}>{s.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr minmax(280px, 340px)', gap: 24 }}>
        {/* ── FAQS ── */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, color: 'var(--navy)' }}>Frequently Asked Questions</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {faqs.map((faq, i) => {
              const isOpen = openFaq === i;
              return (
                <div key={i} style={{ border: '1px solid #dfe6e2', borderRadius: 8, overflow: 'hidden' }}>
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : i)}
                    style={{
                      width: '100%',
                      padding: '14px 18px',
                      background: isOpen ? '#f8faf9' : '#fff',
                      border: 'none',
                      textAlign: 'left',
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--navy)',
                      cursor: 'pointer',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: 12,
                    }}
                  >
                    <span>{faq.q}</span>
                    <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                      {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </span>
                  </button>
                  {isOpen && (
                    <div style={{ padding: '14px 18px', fontSize: 13, color: 'var(--muted)', lineHeight: 1.6, background: '#fff', borderTop: '1px solid #dfe6e2' }}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── CONTACT DESK ── */}
        <div className="stack" style={{ gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h3 style={{ margin: '0 0 12px', fontSize: 15, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
              <Building2 size={16} style={{ color: 'var(--saffron)' }} /> Student Document Section
            </h3>
            <p style={{ fontSize: 13, color: 'var(--muted)', margin: '0 0 14px', lineHeight: 1.5 }}>
              Academic Office, Ground Floor, Administrative Block, JDCOEM Campus.
            </p>
            <div style={{ fontSize: 13, display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ color: 'var(--forest)' }} />
                <span><strong>Helpline:</strong> 0712-2821100 / 9011010038</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Phone size={14} style={{ color: 'var(--forest)' }} />
                <span><strong>Admissions Cell:</strong> 7774041329</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Mail size={14} style={{ color: 'var(--forest)' }} />
                <span><strong>Email:</strong> <a href="mailto:documents@jdcoem.ac.in" style={{ color: 'var(--forest)', fontWeight: 600 }}>documents@jdcoem.ac.in</a></span>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: 20, background: '#f8faf9' }}>
            <h4 style={{ margin: '0 0 10px', fontSize: 13, color: 'var(--navy)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
              <Clock size={14} style={{ color: 'var(--saffron)' }} /> Counter Working Hours
            </h4>
            <div style={{ fontSize: 12, color: 'var(--muted)', lineHeight: 1.6 }}>
              <div><strong>Monday – Saturday:</strong> 9:00 AM – 5:30 PM</div>
              <div><strong>Lunch Break:</strong> 1:00 PM – 1:45 PM</div>
              <div style={{ marginTop: 8, color: '#dc2626', display: 'flex', alignItems: 'center', gap: 6 }}>
                <AlertTriangle size={12} />
                <span>Closed on 2nd & 4th Saturdays and Public Holidays</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
export default HelpPage;

