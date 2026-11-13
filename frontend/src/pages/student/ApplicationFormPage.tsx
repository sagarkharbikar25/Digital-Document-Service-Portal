import React, { useState, useMemo } from 'react';
import { useNavigate, useSearchParams, useParams, Link } from 'react-router-dom';
import { getDocType, getDocIcon } from '../../shared/documentTypes';
import { DEMO_STUDENT, DEMO_APPLICATIONS } from '../../shared/demoData';
import { ADMIN_QUEUE } from '../../shared/adminDemoData';
import { applicationApi } from '../../services/api';
import { Breadcrumb } from '../../components/layout/Breadcrumb';
import '../../styles/application-form.css';
import {
  FileText,
  AlertTriangle,
  CheckCircle2,
  Upload,
  ArrowRight,
  ArrowLeft,
  Send,
  X,
  Clock,
  ShieldCheck,
  UserCheck,
  Building2,
  Calendar,
  Phone,
  Landmark,
  Briefcase,
  GraduationCap,
  BookOpen,
  Plane,
  FileCheck,
  Lock,
  Copy,
  Check,
  Image as ImageIcon,
  FileBadge,
  CreditCard,
  RefreshCw,
  SlidersHorizontal,
  AlertOctagon,
  FileMinus,
  Receipt,
  Ticket,
  FileSpreadsheet,
  Award,
  ScrollText,
  MapPin,
  Mail,
  User,
} from 'lucide-react';

const DEPARTMENTS = [
  'Computer Science and Engineering',
  'Data Science',
  'Artificial Intelligence',
  'Cyber Security',
  'Information Technology',
  'Electronics & Telecommunication',
  'Electrical Engineering',
  'Civil Engineering',
  'Mechanical Engineering',
  'Chemical Engineering',
  'Basic Science and Humanities (BSHD)',
  'MBA',
  'MCA',
];

const YEARS = ['First Year', 'Second Year', 'Third Year', 'Fourth Year'];

const SEMESTERS = [
  'Semester I',
  'Semester II',
  'Semester III',
  'Semester IV',
  'Semester V',
  'Semester VI',
  'Semester VII',
  'Semester VIII',
];

const ADMISSION_YEARS = ['2021', '2022', '2023', '2024', '2025', '2026', '2027', '2028', '2029', '2030'];

const CATEGORIES = [
  'General / Open',
  'OBC',
  'SC',
  'ST',
  'NT-A',
  'NT-B',
  'NT-C',
  'NT-D',
  'SBC',
  'VJ/DT',
  'EWS',
];

const PURPOSE_TEMPLATES = [
  { label: 'Bank Loan', text: 'Required for Bank Loan Application', icon: Landmark },
  { label: 'Internship', text: 'Required for Internship Application', icon: Briefcase },
  { label: 'Passport', text: 'Required for Passport Application', icon: FileCheck },
  { label: 'Scholarship', text: 'Required for Scholarship Application', icon: GraduationCap },
  { label: 'Higher Education', text: 'Required for Higher Education / College Admission', icon: BookOpen },
  { label: 'Visa', text: 'Required for Visa Application', icon: Plane },
  { label: 'Govt. Job', text: 'Required for Government Job Application', icon: Building2 },
];

interface UploadedFileRecord {
  fileName: string;
  fileSize: string;
  previewUrl?: string;
}

export function ApplicationFormPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const routeParams = useParams<{ type?: string }>();

  // Determine requested document type code
  const typeCode = searchParams.get('type') || routeParams.type || 'bonafide';
  const doc = getDocType(typeCode);

  // Common Academic state
  const [academicYear, setAcademicYear] = useState('2025 – 2026');
  const [department, setDepartment] = useState('Computer Science and Engineering');
  const [currentYear, setCurrentYear] = useState('Third Year');
  const [semester, setSemester] = useState('Semester VI');
  const [mobile, setMobile] = useState('9876543210');
  const [parentName, setParentName] = useState('Rajesh Kumar');
  const [admissionYear, setAdmissionYear] = useState('2022');
  const [category, setCategory] = useState('General / Open');

  // Purpose / Reason state
  const [purpose, setPurpose] = useState('');
  const [activeChip, setActiveChip] = useState<string | null>(null);

  // 1. ID Card Specific State
  const [idCardReqType, setIdCardReqType] = useState<'new' | 'duplicate' | 'replacement' | 'correction'>('new');
  const [idCardReason, setIdCardReason] = useState<'new_admission' | 'lost' | 'damaged' | 'correction'>('new_admission');
  const [idCardRemarks, setIdCardRemarks] = useState('');

  // 2. Admission Letter Specific State
  const [admFullName, setAdmFullName] = useState(DEMO_STUDENT.name);
  const [admDob, setAdmDob] = useState('2004-08-15');
  const [admGender, setAdmGender] = useState('Male');
  const [admAadhaar, setAdmAadhaar] = useState('7890 1234 5678');
  const [admType, setAdmType] = useState('Direct Admission (CAP)');
  const [admRollNo, setAdmRollNo] = useState('BT22CSE041');
  const [admParentMobile, setAdmParentMobile] = useState('9822001122');
  const [admAddress, setAdmAddress] = useState('Plot 42, Civil Lines, Nagpur, MH - 440001');

  // 3. Transfer Certificate (TC / Leaving) Specific State
  const [tcReason, setTcReason] = useState('');
  const [tcLastSem, setTcLastSem] = useState('Semester VI');
  const [tcLastDate, setTcLastDate] = useState('2026-05-15');

  // 4. NOC Specific State
  const [nocPurpose, setNocPurpose] = useState('internship');
  const [nocOrgName, setNocOrgName] = useState('Tata Consultancy Services (TCS)');
  const [nocValidityFrom, setNocValidityFrom] = useState('2026-06-01');
  const [nocValidityTo, setNocValidityTo] = useState('2026-12-31');
  const [nocRole, setNocRole] = useState('Software Engineering Intern');

  // 5. Official Transcript Specific State
  const [transcriptProg, setTranscriptProg] = useState('B.Tech (Bachelor of Technology)');
  const [transcriptSemFrom, setTranscriptSemFrom] = useState('Semester I');
  const [transcriptSemTo, setTranscriptSemTo] = useState('Semester VI');
  const [transcriptCopies, setTranscriptCopies] = useState(1);
  const [transcriptPurpose, setTranscriptPurpose] = useState('higher-studies');
  const [transcriptTarget, setTranscriptTarget] = useState('Technical University of Munich, Germany');

  // 6. Character Certificate Specific State
  const [charPeriodFrom, setCharPeriodFrom] = useState('2022-08');
  const [charPeriodTo, setCharPeriodTo] = useState('2026-05');
  const [charPurpose, setCharPurpose] = useState('higher-studies');
  const [charNotes, setCharNotes] = useState('Satisfactory conduct throughout course of study.');

  // 7. Fee Receipt Specific State
  const [feeType, setFeeType] = useState('Tuition Fee');
  const [feeTxnId, setFeeTxnId] = useState('TXN-2026-998241');
  const [feeAmount, setFeeAmount] = useState('85000');
  const [feePaymentMode, setFeePaymentMode] = useState('Online (UPI / NetBanking)');
  const [feePurpose, setFeePurpose] = useState('Income Tax Rebate & Education Loan Disbursement');

  // 8. Hall Ticket Specific State
  const [htSession, setHtSession] = useState('Winter 2026');
  const [htSemester, setHtSemester] = useState('Semester VI');
  const [htSeatNo, setHtSeatNo] = useState('W26-CSE-041');
  const [htReason, setHtReason] = useState('Regular Examination Entry');

  // 9. Mark Sheet Specific State
  const [msSemester, setMsSemester] = useState('Semester VI');
  const [msSession, setMsSession] = useState('Winter');
  const [msYear, setMsYear] = useState('2026');
  const [msResultType, setMsResultType] = useState('Regular');

  // 10. Degree Certificate Specific State
  const [degPrn, setDegPrn] = useState('2022016400891234');
  const [degPassingYear, setDegPassingYear] = useState('2026');
  const [degCgpa, setDegCgpa] = useState('8.72');
  const [degDelivery, setDegDelivery] = useState<'convocation' | 'courier'>('convocation');
  const [degAddress, setDegAddress] = useState('Plot 42, Civil Lines, Nagpur, MH - 440001');

  // 11. Provisional Certificate Specific State
  const [provMonth, setProvMonth] = useState('June');
  const [provYear, setProvYear] = useState('2026');
  const [provCgpa, setProvCgpa] = useState('8.72');
  const [provDivision, setProvDivision] = useState('First Division with Distinction');
  const [provUrgentReason, setProvUrgentReason] = useState('Joining tech firm / higher studies application');

  // 12. Migration Certificate Specific State
  const [migTargetUni, setMigTargetUni] = useState('Dr. Babasaheb Ambedkar Technological University (DBATU)');
  const [migReason, setMigReason] = useState('Transfer for post-graduate programme');

  // Dynamic Required Documents List
  const computedRequiredDocs = useMemo(() => {
    if (!doc) return [];
    const base = [...doc.requiredDocs];

    if (doc.code === 'idcard') {
      const list = ['Passport Size Photo', 'Admission Proof'];
      if (idCardReason === 'lost' || idCardReqType === 'duplicate') {
        list.push('Police Complaint / FIR Copy');
      }
      if (idCardReason === 'damaged' || idCardReqType === 'replacement') {
        list.push('Damaged ID Card Scan');
      }
      return list;
    }

    if (doc.code === 'fees_receipt') {
      return ['Payment Proof / Transaction Screenshot', 'College ID Card'];
    }

    if (doc.code === 'leaving' || doc.code === 'tc') {
      return ['Fee Clearance & Library No-Dues', 'All Semester Marksheets'];
    }

    if (doc.code === 'degree') {
      return ['All Semester Consolidated Marksheet (PDF)', 'Fee Clearance + TC'];
    }

    return base;
  }, [doc, idCardReason, idCardReqType]);

  // Uploaded files dictionary
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, UploadedFileRecord>>({});
  const [declaration, setDeclaration] = useState(false);

  // Submission & Validation state
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedAppId, setSubmittedAppId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState(false);
  const [dragOverKey, setDragOverKey] = useState<string | null>(null);

  if (!doc) {
    return (
      <div className="card" style={{ padding: 48, textAlign: 'center', maxWidth: 600, margin: '40px auto' }}>
        <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#fee2e2', display: 'grid', placeItems: 'center', margin: '0 auto 16px' }}>
          <AlertTriangle size={28} color="#dc2626" />
        </div>
        <h2 style={{ color: 'var(--navy)', fontFamily: 'var(--font-serif)', margin: '0 0 10px' }}>Unrecognized Document Type</h2>
        <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>
          The requested document code <strong>"{typeCode}"</strong> was not found in the institutional document catalogue.
        </p>
        <button
          onClick={() => navigate('/documents')}
          className="app-btn-primary"
          style={{ margin: '0 auto' }}
        >
          <ArrowLeft size={16} /> Return to Document Catalogue
        </button>
      </div>
    );
  }

  // Handle local file selection
  const handleFileChange = (docName: string, file: File | null) => {
    if (!file) return;

    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage(`File "${file.name}" exceeds the maximum allowed size of 10MB.`);
      return;
    }

    const fileSizeStr = file.size > 1024 * 1024
      ? `${(file.size / (1024 * 1024)).toFixed(1)} MB`
      : `${Math.round(file.size / 1024)} KB`;

    let previewUrl: string | undefined = undefined;
    if (file.type.startsWith('image/')) {
      previewUrl = URL.createObjectURL(file);
    }

    setUploadedFiles(prev => ({
      ...prev,
      [docName]: {
        fileName: file.name,
        fileSize: fileSizeStr,
        previewUrl,
      },
    }));
    setErrorMessage(null);
  };

  const handleRemoveFile = (docName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploadedFiles(prev => {
      const copy = { ...prev };
      if (copy[docName]?.previewUrl) {
        URL.revokeObjectURL(copy[docName].previewUrl!);
      }
      delete copy[docName];
      return copy;
    });
  };

  const handlePurposeSelect = (template: typeof PURPOSE_TEMPLATES[0]) => {
    setPurpose(template.text);
    setActiveChip(template.label);
    setErrorMessage(null);
  };

  // Readiness status checks
  const isInfoComplete = Boolean(
    department && currentYear && semester && mobile.length >= 10
  );
  const isUploadsComplete = computedRequiredDocs.every(req => !!uploadedFiles[req]);

  // Derived effective purpose string based on document type
  const effectivePurpose = useMemo(() => {
    switch (doc.code) {
      case 'idcard':
        return `ID Card [${idCardReqType.toUpperCase()}] · Reason: ${idCardReason}${idCardRemarks ? ` (${idCardRemarks})` : ''}`;
      case 'admission':
        return `Admission Confirmation Letter (${admType}) · Session ${admissionYear}`;
      case 'leaving':
      case 'tc':
        return tcReason.trim() || 'Transfer Certificate Application upon leaving institute';
      case 'noc':
        return `NOC for ${nocPurpose.toUpperCase()} at ${nocOrgName} (Valid: ${nocValidityFrom} to ${nocValidityTo})`;
      case 'transcript':
        return `Transcript for ${transcriptProg} (Sem ${transcriptSemFrom} to ${transcriptSemTo}) · ${transcriptCopies} Copies for ${transcriptPurpose}`;
      case 'character':
        return `Character Certificate (${charPeriodFrom} to ${charPeriodTo}) for ${charPurpose}`;
      case 'fees_receipt':
        return `Fee Receipt Request: ${feeType} (₹${feeAmount}) · Ref: ${feeTxnId}`;
      case 'hall_ticket':
        return `Hall Ticket for ${htSession} (${htSemester}) · Seat: ${htSeatNo}`;
      case 'marksheet':
        return `Mark Sheet for ${msSemester} (${msSession} ${msYear}, ${msResultType})`;
      case 'degree':
        return `Original Degree Certificate · PRN: ${degPrn} (CGPA: ${degCgpa}, Delivery: ${degDelivery})`;
      case 'provisional':
        return `Provisional Degree (${provMonth} ${provYear}) · CGPA: ${provCgpa} - ${provUrgentReason}`;
      case 'migration':
        return `Migration to ${migTargetUni} · Reason: ${migReason}`;
      case 'bonafide':
      default:
        return purpose.trim();
    }
  }, [
    doc.code,
    idCardReqType,
    idCardReason,
    idCardRemarks,
    admType,
    admissionYear,
    tcReason,
    nocPurpose,
    nocOrgName,
    nocValidityFrom,
    nocValidityTo,
    transcriptProg,
    transcriptSemFrom,
    transcriptSemTo,
    transcriptCopies,
    transcriptPurpose,
    charPeriodFrom,
    charPeriodTo,
    charPurpose,
    feeType,
    feeAmount,
    feeTxnId,
    htSession,
    htSemester,
    htSeatNo,
    msSemester,
    msSession,
    msYear,
    msResultType,
    degPrn,
    degCgpa,
    degDelivery,
    provMonth,
    provYear,
    provCgpa,
    provUrgentReason,
    migTargetUni,
    migReason,
    purpose,
  ]);

  const isPurposeComplete = effectivePurpose.length >= 8;
  const isDeclarationComplete = declaration;
  const isFormFullyReady = isInfoComplete && isUploadsComplete && isPurposeComplete && isDeclarationComplete;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isInfoComplete) {
      setErrorMessage('Please complete all academic verification fields including Branch, Year, and 10-digit mobile number.');
      window.scrollTo({ top: 180, behavior: 'smooth' });
      return;
    }

    if (doc.code === 'leaving' || doc.code === 'tc') {
      if (!tcReason.trim()) {
        setErrorMessage('Please state the reason for leaving the college in detail.');
        window.scrollTo({ top: 280, behavior: 'smooth' });
        return;
      }
    }

    if (!isUploadsComplete) {
      const missing = computedRequiredDocs.filter(req => !uploadedFiles[req]);
      setErrorMessage(`Please upload all mandatory attachments: ${missing.join(', ')}.`);
      window.scrollTo({ top: 480, behavior: 'smooth' });
      return;
    }

    if (!isPurposeComplete) {
      setErrorMessage('Please provide a specific purpose or complete the required details for your application.');
      return;
    }

    if (!isDeclarationComplete) {
      setErrorMessage('Please accept the student declaration by checking the confirmation box before submitting.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      // 1. Send to Backend API
      const res = await applicationApi.create({
        certificate_type: doc.code,
        admType: admType || doc.code,
        fullName: DEMO_STUDENT.name,
        btid: DEMO_STUDENT.id,
        branch: department,
        department: department,
        year: currentYear,
        acYear: academicYear,
        purpose: effectivePurpose,
        feeType: feePaymentMode || feeType,
        transactionId: feeTxnId,
        amount: Number(feeAmount) || doc.fee || 0,
        metadata: {
          semester,
          mobile,
          parentName: parentName || 'Rajesh Kumar',
          idCardReqType,
          idCardReason,
          idCardRemarks,
          nocPurpose,
          nocOrgName,
          nocValidityFrom,
          nocValidityTo,
          nocRole,
          transcriptProg,
          transcriptSemFrom,
          transcriptSemTo,
          transcriptCopies,
          transcriptPurpose,
          transcriptTarget,
          degPrn,
          degPassingYear,
          degCgpa,
          degDelivery,
          degAddress,
          tcReason,
          tcLastSem,
          tcLastDate,
          charPeriodFrom,
          charPeriodTo,
          charPurpose,
          charNotes,
          uploadedFiles: Object.keys(uploadedFiles),
        },
      });

      const newId = res.application_number || `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;

      // Add to Student Applications Registry
      DEMO_APPLICATIONS.unshift({
        id: newId,
        docCode: doc.code,
        docTitle: doc.title,
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'pending',
        statusLabel: 'Pending Clerk Review',
        processingDays: doc.processingDays,
        purpose: effectivePurpose,
        files: Object.values(uploadedFiles).map(f => f.fileName),
      });

      // Add to Administrative Verification Queue (Clerk Review Queue)
      ADMIN_QUEUE.unshift({
        id: newId,
        docCode: doc.code,
        docTitle: doc.title,
        studentName: DEMO_STUDENT.name,
        studentEmail: 'bt22cse041@jdcoem.ac.in',
        rollNo: DEMO_STUDENT.id,
        dept: department,
        year: `${currentYear} (${semester})`,
        dateApplied: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) + ' ' + new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
        status: 'pending',
        purpose: effectivePurpose,
        files: Object.entries(uploadedFiles).map(([docName, f], idx) => ({
          id: `f-${Date.now()}-${idx}`,
          name: docName,
          fileName: f.fileName,
          fileType: f.previewUrl ? 'image' : 'pdf',
          fileSize: f.fileSize,
          uploadedAt: 'Just now',
          previewUrl: f.previewUrl,
          docLabel: docName,
        })),
      });

      setSubmittedAppId(newId);
    } catch (err: any) {
      console.warn('Backend API note, falling back to local registry:', err.message);
      const newId = `APP-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      DEMO_APPLICATIONS.unshift({
        id: newId,
        docCode: doc.code,
        docTitle: doc.title,
        dateApplied: new Date().toISOString().split('T')[0],
        status: 'pending',
        statusLabel: 'Pending Clerk Review',
        processingDays: doc.processingDays,
        purpose: effectivePurpose,
        files: Object.values(uploadedFiles).map(f => f.fileName),
      });
      setSubmittedAppId(newId);
    } finally {
      setIsSubmitting(false);
    }
  };

  const copyAppId = () => {
    if (submittedAppId) {
      navigator.clipboard.writeText(submittedAppId);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    }
  };

  return (
    <div className="app-form-container">
      {/* ── BREADCRUMB ── */}
      <Breadcrumb
        items={[
          { label: 'Dashboard', to: '/dashboard' },
          { label: 'Available Documents', to: '/documents' },
          { label: `Apply: ${doc.title}` },
        ]}
      />

      {/* ── STEPS PROGRESS BAR ── */}
      <div className="app-steps-bar">
        <div className="app-step-node">
          <div className="app-step-circle done">✓</div>
          <span className="app-step-label done">1. Select Document</span>
        </div>
        <div className="app-step-line done" />
        <div className="app-step-node">
          <div className="app-step-circle active">2</div>
          <span className="app-step-label active">2. Fill Application</span>
        </div>
        <div className="app-step-line" />
        <div className="app-step-node">
          <div className="app-step-circle todo">3</div>
          <span className="app-step-label todo">3. Submit</span>
        </div>
        <div className="app-step-line" />
        <div className="app-step-node">
          <div className="app-step-circle todo">4</div>
          <span className="app-step-label todo">4. Track Status</span>
        </div>
      </div>

      {/* ── VALIDATION ERROR ALERT ── */}
      {errorMessage && (
        <div className="app-form-alert">
          <AlertTriangle size={18} color="#dc2626" style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Action Required: </strong>
            <span>{errorMessage}</span>
          </div>
        </div>
      )}

      {/* ── ① DOCUMENT INFO BANNER ── */}
      <div className="app-doc-banner">
        <div className="app-banner-icon">
          {getDocIcon(doc.code, 32)}
        </div>
        <div className="app-banner-text">
          <h2>Application for {doc.title}</h2>
          <p>{doc.description}</p>
          <div className="app-banner-pills">
            <div className="app-banner-pill">
              <Clock size={13} />
              Processing: <strong>{doc.processingDays}</strong>
            </div>
            <div className="app-banner-pill">
              <Building2 size={13} />
              Issuing Section: <strong>Academic Verification Cell</strong>
            </div>
            <div className="app-banner-pill">
              <FileCheck size={13} />
              Official Format: <strong>Digitally Sealed & QR Verified</strong>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
        {/* ── ② VERIFIED STUDENT CREDENTIALS (PERMANENT ERP RECORD) ── */}
        <div className="app-form-card">
          <div className="app-form-card-header">
            <UserCheck size={18} color="var(--saffron)" />
            <h3>Student Identity Verification</h3>
            <span className="app-form-card-badge">
              <Lock size={12} /> Auto-verified from Student ERP Ledger
            </span>
          </div>
          <div className="app-form-card-body">
            <div className="app-info-note">
              <ShieldCheck size={16} style={{ flexShrink: 0 }} />
              <span>
                Personal registration credentials are auto-filled and locked to maintain institutional integrity. Verify academic details below.
              </span>
            </div>

            {/* Read-only permanent credentials */}
            <div className="app-info-grid">
              <div className="app-info-field">
                <label>Full Student Name</label>
                <div className="app-info-value-box">
                  <User size={15} color="var(--gray-400)" />
                  <span>{DEMO_STUDENT.name}</span>
                </div>
              </div>
              <div className="app-info-field">
                <label>BT ID / University ID</label>
                <div className="app-info-value-box mono">
                  <GraduationCap size={15} color="var(--gray-400)" />
                  <span>{DEMO_STUDENT.id}</span>
                </div>
              </div>
              <div className="app-info-field">
                <label>College Email ID</label>
                <div className="app-info-value-box">
                  <Mail size={15} color="var(--gray-400)" />
                  <span>bt22cse041@jdcoem.ac.in</span>
                </div>
              </div>
              <div className="app-info-field">
                <label>Academic Session <span style={{ color: 'var(--error)' }}>*</span></label>
                <div className="app-info-value-box" style={{ background: '#fff' }}>
                  <Calendar size={15} color="var(--gray-400)" />
                  <input
                    type="text"
                    value={academicYear}
                    onChange={e => setAcademicYear(e.target.value)}
                    placeholder="e.g. 2025 – 2026"
                    className="app-form-input"
                    style={{ border: 'none', padding: 0, height: 'auto', fontWeight: 600 }}
                    required
                  />
                </div>
              </div>
            </div>

            {/* Common academic department & semester */}
            <div className="app-input-grid-2" style={{ marginTop: 14 }}>
              <div className="app-field-group">
                <label>
                  Department / Branch <span className="req">*</span>
                </label>
                <select
                  value={department}
                  onChange={e => setDepartment(e.target.value)}
                  className="app-form-select"
                  required
                >
                  <option value="">Select Branch</option>
                  {DEPARTMENTS.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
              <div className="app-field-group">
                <label>
                  Current Academic Year & Semester <span className="req">*</span>
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                  <select
                    value={currentYear}
                    onChange={e => setCurrentYear(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                  <select
                    value={semester}
                    onChange={e => setSemester(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="app-input-grid-2">
              <div className="app-field-group">
                <label>
                  Student Mobile Number <span className="req">*</span>
                  <span className="hint">For live SMS updates</span>
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="tel"
                    value={mobile}
                    onChange={e => setMobile(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="10-digit mobile number"
                    className="app-form-input"
                    maxLength={10}
                    required
                  />
                  <Phone size={14} color="var(--gray-400)" style={{ position: 'absolute', right: 12, top: 14 }} />
                </div>
              </div>
              <div className="app-field-group">
                <label>
                  Category & Social Group <span className="req">*</span>
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="app-form-select"
                  required
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* ── ③ DOCUMENT-SPECIFIC FORM PARTICULARS ── */}

        {/* --- CASE A: IDENTITY CARD (College ID) --- */}
        {doc.code === 'idcard' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <CreditCard size={18} color="var(--saffron)" />
              <h3>Identity Card Request Particulars</h3>
              <span className="app-form-card-badge">Institutional ID System</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-section-subhead">
                <CreditCard size={14} /> 1. Select Type of ID Request
              </div>
              <div className="app-option-grid">
                <div
                  className={`app-opt-card ${idCardReqType === 'new' ? 'selected' : ''}`}
                  onClick={() => setIdCardReqType('new')}
                >
                  <div className="app-opt-radio">
                    {idCardReqType === 'new' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <CreditCard size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>New Identity Card</h4>
                    <p>First-time card for newly enrolled students</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReqType === 'duplicate' ? 'selected' : ''}`}
                  onClick={() => {
                    setIdCardReqType('duplicate');
                    setIdCardReason('lost');
                  }}
                >
                  <div className="app-opt-radio">
                    {idCardReqType === 'duplicate' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <Copy size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Duplicate Identity Card</h4>
                    <p>Replacement copy for lost or misplaced card</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReqType === 'replacement' ? 'selected' : ''}`}
                  onClick={() => {
                    setIdCardReqType('replacement');
                    setIdCardReason('damaged');
                  }}
                >
                  <div className="app-opt-radio">
                    {idCardReqType === 'replacement' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <RefreshCw size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Replacement (Damaged)</h4>
                    <p>Renewed card for worn-out or damaged card</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReqType === 'correction' ? 'selected' : ''}`}
                  onClick={() => {
                    setIdCardReqType('correction');
                    setIdCardReason('correction');
                  }}
                >
                  <div className="app-opt-radio">
                    {idCardReqType === 'correction' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <SlidersHorizontal size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Correction in Details</h4>
                    <p>Name, photograph, or department update</p>
                  </div>
                </div>
              </div>

              <div className="app-section-subhead" style={{ marginTop: 22 }}>
                <AlertOctagon size={14} /> 2. Reason for Application
              </div>
              <div className="app-option-grid">
                <div
                  className={`app-opt-card ${idCardReason === 'new_admission' ? 'selected' : ''}`}
                  onClick={() => setIdCardReason('new_admission')}
                >
                  <div className="app-opt-radio">
                    {idCardReason === 'new_admission' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <GraduationCap size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>New Admission</h4>
                    <p>Enrolled in current academic year</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReason === 'lost' ? 'selected' : ''}`}
                  onClick={() => setIdCardReason('lost')}
                >
                  <div className="app-opt-radio">
                    {idCardReason === 'lost' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <AlertOctagon size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Lost ID Card</h4>
                    <p>Card is missing, lost or stolen</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReason === 'damaged' ? 'selected' : ''}`}
                  onClick={() => setIdCardReason('damaged')}
                >
                  <div className="app-opt-radio">
                    {idCardReason === 'damaged' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <FileMinus size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Damaged / Unreadable</h4>
                    <p>Card is broken, torn, faded or barcode unreadable</p>
                  </div>
                </div>

                <div
                  className={`app-opt-card ${idCardReason === 'correction' ? 'selected' : ''}`}
                  onClick={() => setIdCardReason('correction')}
                >
                  <div className="app-opt-radio">
                    {idCardReason === 'correction' && <div className="app-opt-radio-dot" />}
                  </div>
                  <div className="app-opt-icon">
                    <UserCheck size={18} />
                  </div>
                  <div className="app-opt-label">
                    <h4>Correction in Details</h4>
                    <p>Discrepancy in spelling, blood group, or address</p>
                  </div>
                </div>
              </div>

              {/* Conditional Police Complaint Warning */}
              {(idCardReason === 'lost' || idCardReqType === 'duplicate') && (
                <div className="app-conditional-notice danger">
                  <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Mandatory Police FIR / Lost Card Complaint:</strong> As per college administrative policy, an official police complaint or online lost certificate copy is mandatory for duplicate ID issuance. Please upload it in Section ④ below.
                  </div>
                </div>
              )}

              {(idCardReason === 'damaged' || idCardReqType === 'replacement') && (
                <div className="app-conditional-notice">
                  <RefreshCw size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                  <div>
                    <strong>Physical Card Surrender:</strong> You will need to surrender your damaged ID card at the Administrative Office (Block A) upon collecting your newly printed card.
                  </div>
                </div>
              )}

              <div className="app-field-group" style={{ marginTop: 18 }}>
                <label>
                  Additional Remarks / Instructions <span className="hint">(Optional, max 300 chars)</span>
                </label>
                <textarea
                  value={idCardRemarks}
                  onChange={e => setIdCardRemarks(e.target.value)}
                  placeholder="Specify any changes needed (e.g. correct blood group to B+, updated residential address)..."
                  className="app-form-textarea"
                  maxLength={300}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE B: ADMISSION LETTER --- */}
        {doc.code === 'admission' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <ScrollText size={18} color="var(--saffron)" />
              <h3>Admission Confirmation Details</h3>
              <span className="app-form-card-badge">Central Registry Record</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-section-subhead">
                <User size={14} /> Personal Details
              </div>
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Full Legal Name (as per SSC / Aadhaar) <span className="req">*</span></label>
                  <input
                    type="text"
                    value={admFullName}
                    onChange={e => setAdmFullName(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Date of Birth <span className="req">*</span></label>
                  <input
                    type="date"
                    value={admDob}
                    onChange={e => setAdmDob(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Gender <span className="req">*</span></label>
                  <select
                    value={admGender}
                    onChange={e => setAdmGender(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Aadhaar Card Number <span className="req">*</span></label>
                  <input
                    type="text"
                    value={admAadhaar}
                    onChange={e => setAdmAadhaar(e.target.value)}
                    placeholder="XXXX XXXX XXXX"
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-section-subhead">
                <GraduationCap size={14} /> Admission & Quota Type
              </div>
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Admission Quota / Channel <span className="req">*</span></label>
                  <select
                    value={admType}
                    onChange={e => setAdmType(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Direct Admission (CAP)">Direct Admission (CAP - Centralized Allotment)</option>
                    <option value="Management Quota">Management / Institutional Quota</option>
                    <option value="NRI Quota">NRI / PIO Quota</option>
                    <option value="Lateral Entry (2nd Year)">Lateral Entry Direct 2nd Year (DSE)</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Initial Admission Batch Year <span className="req">*</span></label>
                  <select
                    value={admissionYear}
                    onChange={e => setAdmissionYear(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {ADMISSION_YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-section-subhead">
                <MapPin size={14} /> Parent & Permanent Address
              </div>
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Parent / Guardian Name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Parent Mobile Number <span className="req">*</span></label>
                  <input
                    type="tel"
                    value={admParentMobile}
                    onChange={e => setAdmParentMobile(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>
              <div className="app-field-group">
                <label>Permanent Residential Address <span className="req">*</span></label>
                <textarea
                  value={admAddress}
                  onChange={e => setAdmAddress(e.target.value)}
                  className="app-form-textarea"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE C: TRANSFER CERTIFICATE (TC / LEAVING) --- */}
        {(doc.code === 'leaving' || doc.code === 'tc') && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <FileMinus size={18} color="var(--saffron)" />
              <h3>Transfer Certificate (TC) Particulars</h3>
              <span className="app-form-card-badge">Exit Clearance Protocol</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-field-group">
                <label>
                  Reason for Leaving the Institution <span className="req">*</span>
                  <span className="hint">Required for official record ledger</span>
                </label>
                <textarea
                  value={tcReason}
                  onChange={e => setTcReason(e.target.value)}
                  placeholder="e.g. Completed Bachelor of Technology graduation / Transferring to another institution / Relocation..."
                  className="app-form-textarea"
                  rows={3}
                  required
                />
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Last Attended Semester <span className="req">*</span></label>
                  <select
                    value={tcLastSem}
                    onChange={e => setTcLastSem(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Last Attendance / Exam Date <span className="req">*</span></label>
                  <input
                    type="date"
                    value={tcLastDate}
                    onChange={e => setTcLastDate(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-conditional-notice">
                <ShieldCheck size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>
                  <strong>No Dues Clearance:</strong> Library books, laboratory equipment, hostel fees, and accounts clearance certificates must be attached in Section ④ for the Transfer Certificate to be sanctioned.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE D: NO OBJECTION CERTIFICATE (NOC) --- */}
        {doc.code === 'noc' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <Award size={18} color="var(--saffron)" />
              <h3>No Objection Certificate (NOC) Details</h3>
              <span className="app-form-card-badge">External Authorization</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Purpose of NOC <span className="req">*</span></label>
                  <select
                    value={nocPurpose}
                    onChange={e => setNocPurpose(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="internship">Internship / Industrial Training</option>
                    <option value="project">Project Work / Off-Campus Research</option>
                    <option value="passport">Passport / Visa Application</option>
                    <option value="exam">External Competitive Exam / Certification</option>
                    <option value="competition">Hackathon / Technical Competition</option>
                    <option value="other">Other Official Purpose</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Organization / Company Name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={nocOrgName}
                    onChange={e => setNocOrgName(e.target.value)}
                    placeholder="e.g. Tata Consultancy Services, ISRO, Passport Office..."
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Validity Period (Start Date) <span className="req">*</span></label>
                  <input
                    type="date"
                    value={nocValidityFrom}
                    onChange={e => setNocValidityFrom(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Validity Period (End Date) <span className="req">*</span></label>
                  <input
                    type="date"
                    value={nocValidityTo}
                    onChange={e => setNocValidityTo(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-field-group">
                <label>Designation / Role / Context <span className="hint">(Optional)</span></label>
                <input
                  type="text"
                  value={nocRole}
                  onChange={e => setNocRole(e.target.value)}
                  placeholder="e.g. Full-Stack Developer Intern / Participant"
                  className="app-form-input"
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE E: OFFICIAL TRANSCRIPT --- */}
        {doc.code === 'transcript' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <FileSpreadsheet size={18} color="var(--saffron)" />
              <h3>Official Academic Transcript Details</h3>
              <span className="app-form-card-badge">Certified Academic Record</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Degree Programme <span className="req">*</span></label>
                  <input
                    type="text"
                    value={transcriptProg}
                    onChange={e => setTranscriptProg(e.target.value)}
                    className="app-form-input"
                    readOnly
                  />
                </div>
                <div className="app-field-group">
                  <label>Number of Certified Sealed Copies <span className="req">*</span></label>
                  <input
                    type="number"
                    min={1}
                    max={5}
                    value={transcriptCopies}
                    onChange={e => setTranscriptCopies(Math.max(1, Math.min(5, parseInt(e.target.value) || 1)))}
                    className="app-form-input"
                    required
                  />
                  <span className="hint">Maximum 5 official copies per request</span>
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Semester Range (From) <span className="req">*</span></label>
                  <select
                    value={transcriptSemFrom}
                    onChange={e => setTranscriptSemFrom(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Semester Range (To) <span className="req">*</span></label>
                  <select
                    value={transcriptSemTo}
                    onChange={e => setTranscriptSemTo(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Purpose of Transcript <span className="req">*</span></label>
                  <select
                    value={transcriptPurpose}
                    onChange={e => setTranscriptPurpose(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="higher-studies">Higher Studies / University Admission</option>
                    <option value="employment">Employment / Foreign Job Application</option>
                    <option value="visa">Visa / Immigration (WES / CES / IQAS)</option>
                    <option value="scholarship">Scholarship Application</option>
                    <option value="other">Other Evaluation</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Target University / Evaluating Body <span className="req">*</span></label>
                  <input
                    type="text"
                    value={transcriptTarget}
                    onChange={e => setTranscriptTarget(e.target.value)}
                    placeholder="e.g. Technical University of Munich / WES Canada"
                    className="app-form-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE F: CHARACTER & CONDUCT CERTIFICATE --- */}
        {doc.code === 'character' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <Award size={18} color="var(--saffron)" />
              <h3>Character & Conduct Certificate Details</h3>
              <span className="app-form-card-badge">Institutional Conduct Record</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Period of Study (From Month/Year) <span className="req">*</span></label>
                  <input
                    type="month"
                    value={charPeriodFrom}
                    onChange={e => setCharPeriodFrom(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Period of Study (To Month/Year) <span className="req">*</span></label>
                  <input
                    type="month"
                    value={charPeriodTo}
                    onChange={e => setCharPeriodTo(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-field-group">
                <label>Purpose of Certificate <span className="req">*</span></label>
                <select
                  value={charPurpose}
                  onChange={e => setCharPurpose(e.target.value)}
                  className="app-form-select"
                  required
                >
                  <option value="higher-studies">Higher Studies / University Admission</option>
                  <option value="employment">Employment / Corporate Verification</option>
                  <option value="visa">Visa / Embassy Application</option>
                  <option value="scholarship">Scholarship / Financial Grant</option>
                  <option value="government">Government Service / UPSC / PSC Verification</option>
                  <option value="other">Other Official Verification</option>
                </select>
              </div>

              <div className="app-field-group">
                <label>Extracurricular & Conduct Notes <span className="hint">(Optional)</span></label>
                <textarea
                  value={charNotes}
                  onChange={e => setCharNotes(e.target.value)}
                  className="app-form-textarea"
                  rows={2}
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE G: FEE RECEIPT / FEE STRUCTURE --- */}
        {doc.code === 'fees_receipt' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <Receipt size={18} color="var(--saffron)" />
              <h3>Fee Payment & Receipt Verification</h3>
              <span className="app-form-card-badge">Accounts Ledger</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Fee Category <span className="req">*</span></label>
                  <select
                    value={feeType}
                    onChange={e => setFeeType(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Tuition Fee">Tuition Fee</option>
                    <option value="Development Fee">Development Fee</option>
                    <option value="Exam Fee">University Examination Fee</option>
                    <option value="Hostel Fee">Hostel & Mess Fee</option>
                    <option value="Library Fee">Library / Laboratory Fee</option>
                    <option value="Other">Other Institutional Fee</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Amount Paid (₹) <span className="req">*</span></label>
                  <input
                    type="number"
                    value={feeAmount}
                    onChange={e => setFeeAmount(e.target.value)}
                    placeholder="e.g. 85000"
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Bank Transaction ID / UTR / Receipt Ref <span className="req">*</span></label>
                  <input
                    type="text"
                    value={feeTxnId}
                    onChange={e => setFeeTxnId(e.target.value)}
                    placeholder="e.g. TXN-2026-998241 or Bank Ref No."
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Payment Mode <span className="req">*</span></label>
                  <select
                    value={feePaymentMode}
                    onChange={e => setFeePaymentMode(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Online (UPI / NetBanking)">Online (UPI / NetBanking / Debit Card)</option>
                    <option value="Cash at Counter">Cash Deposit at Accounts Counter</option>
                    <option value="Demand Draft (DD)">Demand Draft (DD) / Cheque</option>
                    <option value="NEFT / RTGS Transfer">Direct NEFT / RTGS Transfer</option>
                  </select>
                </div>
              </div>

              <div className="app-field-group">
                <label>Purpose of Receipt Request <span className="req">*</span></label>
                <input
                  type="text"
                  value={feePurpose}
                  onChange={e => setFeePurpose(e.target.value)}
                  placeholder="e.g. Income tax rebate under 80C / Education loan disbursement"
                  className="app-form-input"
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE H: HALL TICKET / ADMIT CARD --- */}
        {doc.code === 'hall_ticket' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <Ticket size={18} color="var(--saffron)" />
              <h3>Examination Hall Ticket Details</h3>
              <span className="app-form-card-badge">Examination Cell</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Examination Session <span className="req">*</span></label>
                  <select
                    value={htSession}
                    onChange={e => setHtSession(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Winter 2026">Winter 2026 Examination (Odd Sem)</option>
                    <option value="Summer 2026">Summer 2026 Examination (Even Sem)</option>
                    <option value="Backlog / ATKT 2026">Backlog / ATKT Supplementary Exam</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Examination Semester <span className="req">*</span></label>
                  <select
                    value={htSemester}
                    onChange={e => setHtSemester(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Exam Roll Number / Seat Number <span className="hint">(if assigned)</span></label>
                  <input
                    type="text"
                    value={htSeatNo}
                    onChange={e => setHtSeatNo(e.target.value)}
                    placeholder="e.g. W26-CSE-041"
                    className="app-form-input"
                  />
                </div>
                <div className="app-field-group">
                  <label>Reason for Request <span className="req">*</span></label>
                  <select
                    value={htReason}
                    onChange={e => setHtReason(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Regular Examination Entry">Regular Examination Entry</option>
                    <option value="Duplicate for Lost Admit Card">Duplicate (Original Lost / Damaged)</option>
                    <option value="Admit Card Never Received">Never Received from Department</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE I: MARK SHEET --- */}
        {doc.code === 'marksheet' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <FileSpreadsheet size={18} color="var(--saffron)" />
              <h3>Mark Sheet Particulars</h3>
              <span className="app-form-card-badge">Autonomous Examination Cell</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Mark Sheet Semester <span className="req">*</span></label>
                  <select
                    value={msSemester}
                    onChange={e => setMsSemester(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {SEMESTERS.map(sem => (
                      <option key={sem} value={sem}>{sem}</option>
                    ))}
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Examination Year <span className="req">*</span></label>
                  <select
                    value={msYear}
                    onChange={e => setMsYear(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {ADMISSION_YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Examination Session <span className="req">*</span></label>
                  <select
                    value={msSession}
                    onChange={e => setMsSession(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Winter">Winter Session (Odd Sem)</option>
                    <option value="Summer">Summer Session (Even Sem)</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Result Type <span className="req">*</span></label>
                  <select
                    value={msResultType}
                    onChange={e => setMsResultType(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="Regular">Regular Examination</option>
                    <option value="ATKT / Backlog">ATKT / Backlog Re-assessment</option>
                    <option value="Revaluation / Challenge">Revaluation / Challenge Grade</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE J: DEGREE CERTIFICATE --- */}
        {doc.code === 'degree' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <Award size={18} color="var(--saffron)" />
              <h3>Degree Certificate & Convocation Particulars</h3>
              <span className="app-form-card-badge">University Registrar</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Permanent Registration Number (PRN) <span className="req">*</span></label>
                  <input
                    type="text"
                    value={degPrn}
                    onChange={e => setDegPrn(e.target.value)}
                    className="app-form-input mono"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Passing / Convocation Year <span className="req">*</span></label>
                  <select
                    value={degPassingYear}
                    onChange={e => setDegPassingYear(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="2026">2026 (Upcoming Convocation)</option>
                    <option value="2025">2025</option>
                    <option value="2024">2024</option>
                  </select>
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Final CGPA / Grade Pointer <span className="req">*</span></label>
                  <input
                    type="text"
                    value={degCgpa}
                    onChange={e => setDegCgpa(e.target.value)}
                    placeholder="e.g. 8.75"
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Certificate Delivery Mode <span className="req">*</span></label>
                  <select
                    value={degDelivery}
                    onChange={e => setDegDelivery(e.target.value as any)}
                    className="app-form-select"
                    required
                  >
                    <option value="convocation">In-Person at Annual Convocation Ceremony</option>
                    <option value="courier">Speed Post / Courier to Postal Address</option>
                  </select>
                </div>
              </div>

              {degDelivery === 'courier' && (
                <div className="app-field-group">
                  <label>Complete Postal Mailing Address <span className="req">*</span></label>
                  <textarea
                    value={degAddress}
                    onChange={e => setDegAddress(e.target.value)}
                    className="app-form-textarea"
                    rows={2}
                    required
                  />
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- CASE K: PROVISIONAL CERTIFICATE --- */}
        {doc.code === 'provisional' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <ScrollText size={18} color="var(--saffron)" />
              <h3>Provisional Certificate Particulars</h3>
              <span className="app-form-card-badge">Autonomous Examination Cell</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Passing Month & Year <span className="req">*</span></label>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                    <select
                      value={provMonth}
                      onChange={e => setProvMonth(e.target.value)}
                      className="app-form-select"
                      required
                    >
                      <option value="June">June</option>
                      <option value="December">December</option>
                    </select>
                    <input
                      type="number"
                      value={provYear}
                      onChange={e => setProvYear(e.target.value)}
                      className="app-form-input"
                      required
                    />
                  </div>
                </div>
                <div className="app-field-group">
                  <label>Final CGPA / Percentage <span className="req">*</span></label>
                  <input
                    type="text"
                    value={provCgpa}
                    onChange={e => setProvCgpa(e.target.value)}
                    className="app-form-input"
                    required
                  />
                </div>
              </div>

              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Division / Honors Grade <span className="req">*</span></label>
                  <select
                    value={provDivision}
                    onChange={e => setProvDivision(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    <option value="First Division with Distinction">First Division with Distinction</option>
                    <option value="First Division">First Division</option>
                    <option value="Second Division">Second Division</option>
                  </select>
                </div>
                <div className="app-field-group">
                  <label>Reason for Urgent Requirement <span className="req">*</span></label>
                  <input
                    type="text"
                    value={provUrgentReason}
                    onChange={e => setProvUrgentReason(e.target.value)}
                    placeholder="e.g. Job onboarding / Embassy visa processing"
                    className="app-form-input"
                    required
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- CASE L: MIGRATION CERTIFICATE --- */}
        {doc.code === 'migration' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <GraduationCap size={18} color="var(--saffron)" />
              <h3>Migration Certificate Particulars</h3>
              <span className="app-form-card-badge">University Registrar</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-field-group">
                <label>Target University / Institution Migrating To <span className="req">*</span></label>
                <input
                  type="text"
                  value={migTargetUni}
                  onChange={e => setMigTargetUni(e.target.value)}
                  placeholder="e.g. Dr. Babasaheb Ambedkar Technological University (DBATU) / IIT Bombay..."
                  className="app-form-input"
                  required
                />
              </div>
              <div className="app-field-group">
                <label>Reason for Migration <span className="req">*</span></label>
                <textarea
                  value={migReason}
                  onChange={e => setMigReason(e.target.value)}
                  placeholder="State the academic course or master's degree programme you are transitioning to..."
                  className="app-form-textarea"
                  rows={2}
                  required
                />
              </div>
            </div>
          </div>
        )}

        {/* --- CASE M: BONAFIDE CERTIFICATE (OR DEFAULT FALLBACK) --- */}
        {doc.code === 'bonafide' && (
          <div className="app-form-card">
            <div className="app-form-card-header">
              <FileText size={18} color="var(--saffron)" />
              <h3>Bonafide Certificate Details</h3>
              <span className="app-form-card-badge">Enrollment Certificate</span>
            </div>
            <div className="app-form-card-body">
              <div className="app-input-grid-2">
                <div className="app-field-group">
                  <label>Parent / Guardian Full Name <span className="req">*</span></label>
                  <input
                    type="text"
                    value={parentName}
                    onChange={e => setParentName(e.target.value)}
                    placeholder="Enter parent or guardian legal name"
                    className="app-form-input"
                    required
                  />
                </div>
                <div className="app-field-group">
                  <label>Admission Batch Year <span className="req">*</span></label>
                  <select
                    value={admissionYear}
                    onChange={e => setAdmissionYear(e.target.value)}
                    className="app-form-select"
                    required
                  >
                    {ADMISSION_YEARS.map(yr => (
                      <option key={yr} value={yr}>{yr}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="app-field-group" style={{ marginTop: 12 }}>
                <label>
                  State your reason for Bonafide Certificate <span className="req">*</span>
                  <span className="hint">Minimum 10 characters</span>
                </label>
                <textarea
                  value={purpose}
                  onChange={e => {
                    setPurpose(e.target.value);
                    setActiveChip(null);
                    setErrorMessage(null);
                  }}
                  maxLength={400}
                  placeholder="e.g. Required for bank educational loan application at SBI / internship at TCS / passport renewal..."
                  className="app-form-textarea"
                  required
                />
                <div className="app-char-count">
                  <span style={{ color: purpose.length < 10 ? 'var(--error)' : 'var(--navy)', fontWeight: 600 }}>
                    {purpose.length}
                  </span>{' '}
                  / 400 characters (min. 10)
                </div>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--gray-500)', marginBottom: 8, fontWeight: 600 }}>
                Quick select a common purpose:
              </div>
              <div className="app-chip-row">
                {PURPOSE_TEMPLATES.map(tpl => {
                  const IconComponent = tpl.icon;
                  const isActive = activeChip === tpl.label || purpose === tpl.text;
                  return (
                    <button
                      key={tpl.label}
                      type="button"
                      className={`app-chip ${isActive ? 'active' : ''}`}
                      onClick={() => handlePurposeSelect(tpl)}
                    >
                      <IconComponent size={13} />
                      <span>{tpl.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* ── ④ REQUIRED DOCUMENTS CHECKLIST ── */}
        <div className="app-form-card">
          <div className="app-form-card-header">
            <FileBadge size={18} color="var(--saffron)" />
            <h3>Mandatory Supporting Attachments Checklist</h3>
            <span className="app-form-card-badge">
              {computedRequiredDocs.filter(d => !!uploadedFiles[d]).length} / {computedRequiredDocs.length} Attached
            </span>
          </div>
          <div className="app-form-card-body">
            <div className="app-req-checklist">
              {computedRequiredDocs.map((req, i) => {
                const isAttached = !!uploadedFiles[req];
                const isPhoto = req.toLowerCase().includes('photo');
                return (
                  <div key={i} className={`app-req-item ${isAttached ? 'complete' : ''}`}>
                    <div className="app-req-check">
                      {isAttached ? <Check size={14} strokeWidth={3} /> : '○'}
                    </div>
                    <div className="app-req-item-text">
                      <h5>{req}</h5>
                      <p>
                        {isPhoto
                          ? 'Recent passport size photo with white/light background · Face clearly visible'
                          : `Legible official scan or institutional certificate for administrative verification`}
                      </p>
                    </div>
                    <span className="app-req-badge">
                      {isAttached ? 'Attached ✓' : isPhoto ? 'JPG, PNG · Max 2MB' : 'PDF, JPG, PNG · Max 5MB'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── ⑤ UPLOAD DOCUMENTS DROPZONES ── */}
        <div className="app-form-card">
          <div className="app-form-card-header">
            <Upload size={18} color="var(--saffron)" />
            <h3>Upload Supporting Credentials</h3>
          </div>
          <div className="app-form-card-body">
            <div className="app-info-note">
              <FileCheck size={16} style={{ flexShrink: 0 }} />
              <span>
                Upload clear scans or high-resolution photos. Supported formats: <strong>PDF, JPG, PNG</strong>. Max size: <strong>5MB per file</strong>.
              </span>
            </div>

            {computedRequiredDocs.map(req => {
              const fileRecord = uploadedFiles[req];
              const isPhoto = req.toLowerCase().includes('photo');
              const isDragging = dragOverKey === req;

              return (
                <div key={req} className="app-upload-group">
                  <div className="app-upload-label-row">
                    <span className="app-ul-name">
                      {req} <span className="req">*</span>
                    </span>
                    <span className="app-ul-type">
                      {isPhoto ? 'Passport Photo (JPG/PNG)' : 'Official Scanned Document (PDF/JPG)'}
                    </span>
                  </div>

                  <div
                    className={`app-drop-zone ${fileRecord ? 'has-file' : ''} ${isDragging ? 'dragover' : ''}`}
                    onDragOver={e => {
                      e.preventDefault();
                      setDragOverKey(req);
                    }}
                    onDragLeave={() => setDragOverKey(null)}
                    onDrop={e => {
                      e.preventDefault();
                      setDragOverKey(null);
                      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                        handleFileChange(req, e.dataTransfer.files[0]);
                      }
                    }}
                  >
                    {!fileRecord ? (
                      <>
                        <input
                          type="file"
                          accept={isPhoto ? '.jpg,.jpeg,.png' : '.pdf,.jpg,.jpeg,.png'}
                          onChange={e => {
                            if (e.target.files && e.target.files[0]) {
                              handleFileChange(req, e.target.files[0]);
                            }
                          }}
                        />
                        <div className="app-dz-default-content">
                          <div className="app-dz-icon">
                            <Upload size={20} />
                          </div>
                          <div className="app-dz-text">
                            <strong>Click to upload</strong> or drag and drop file here
                          </div>
                          <div className="app-dz-sub">
                            {isPhoto ? 'JPG or PNG format · Clear portrait photo' : 'PDF, JPG or PNG format · Scanned original'}
                          </div>
                        </div>
                      </>
                    ) : isPhoto && fileRecord.previewUrl ? (
                      <div className="app-photo-preview-wrap">
                        <img src={fileRecord.previewUrl} alt="Photo Preview" />
                        <div className="app-pp-name">{fileRecord.fileName}</div>
                        <div className="app-pp-size">{fileRecord.fileSize}</div>
                        <button
                          type="button"
                          className="app-fp-remove"
                          onClick={e => handleRemoveFile(req, e)}
                          title="Remove attached photo"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <div className="app-file-preview-row">
                        <div className="app-fp-icon">
                          <FileCheck size={22} />
                        </div>
                        <div className="app-fp-info">
                          <div className="app-fp-name">{fileRecord.fileName}</div>
                          <div className="app-fp-size">{fileRecord.fileSize} • Uploaded</div>
                        </div>
                        <button
                          type="button"
                          className="app-fp-remove"
                          onClick={e => handleRemoveFile(req, e)}
                          title="Remove attached document"
                        >
                          ✕
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── ⑥ INSTITUTIONAL DECLARATION ── */}
        <div className="app-form-card">
          <div className="app-form-card-header">
            <ShieldCheck size={18} color="var(--saffron)" />
            <h3>Institutional Declaration & Verification</h3>
          </div>
          <div className="app-form-card-body">
            <div
              className="app-declaration-box"
              onClick={() => {
                setDeclaration(!declaration);
                setErrorMessage(null);
              }}
            >
              <input
                type="checkbox"
                checked={declaration}
                onChange={e => {
                  setDeclaration(e.target.checked);
                  setErrorMessage(null);
                }}
                onClick={e => e.stopPropagation()}
              />
              <div className="app-dec-text">
                <h4>I confirm the accuracy of all provided information</h4>
                <p>
                  I, the undersigned student of JD College of Engineering and Management, Nagpur, hereby declare that all information provided in this application is true and correct to the best of my knowledge. I understand that any false information may lead to rejection of this application and/or disciplinary action as per college regulations.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* ── ⑦ SUBMIT CARD & READINESS STATUS ── */}
        <div className="app-submit-card">
          <div className="app-readiness-row">
            <div className={`app-r-pill ${isInfoComplete ? 'ok' : ''}`}>
              <span className={`app-r-dot ${isInfoComplete ? 'ok' : ''}`} />
              <span>Student Profile Verified</span>
            </div>
            <div className={`app-r-pill ${isUploadsComplete ? 'ok' : ''}`}>
              <span className={`app-r-dot ${isUploadsComplete ? 'ok' : ''}`} />
              <span>{Object.keys(uploadedFiles).length} / {computedRequiredDocs.length} Documents Attached</span>
            </div>
            <div className={`app-r-pill ${isPurposeComplete ? 'ok' : ''}`}>
              <span className={`app-r-dot ${isPurposeComplete ? 'ok' : ''}`} />
              <span>Particulars Complete</span>
            </div>
            <div className={`app-r-pill ${isDeclarationComplete ? 'ok' : ''}`}>
              <span className={`app-r-dot ${isDeclarationComplete ? 'ok' : ''}`} />
              <span>Declaration Accepted</span>
            </div>
          </div>

          <div className="app-submit-row">
            <button
              type="submit"
              className="app-btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>Processing...</>
              ) : (
                <>
                  <Send size={15} /> Submit Application
                </>
              )}
            </button>
            <button
              type="button"
              className="app-btn-secondary"
              onClick={() => navigate('/documents')}
            >
              <ArrowLeft size={14} /> Cancel
            </button>
            <div className="app-secure-note">
              <Lock size={13} color="var(--success)" /> Encrypted & institutionally logged submission
            </div>
          </div>
        </div>
      </form>

      {/* ── ⑧ SUBMITTED SUCCESS MODAL ── */}
      {submittedAppId && (
        <div className="app-modal-overlay">
          <div className="app-modal-box">
            <div className="app-modal-icon-wrap">
              <CheckCircle2 size={38} />
            </div>
            <h3>Application Submitted!</h3>
            <p>
              Your application for <strong>{doc.title}</strong> has been received by the Academic Section.
            </p>
            <div style={{ marginTop: 12 }}>
              <span style={{ fontSize: 12, color: 'var(--gray-500)', textTransform: 'uppercase', letterSpacing: '0.5px', fontWeight: 600 }}>
                Your Application Reference ID:
              </span>
              <br />
              <div
                className="app-modal-app-id"
                onClick={copyAppId}
                title="Click to copy Application ID"
                style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 10 }}
              >
                <span>{submittedAppId}</span>
                {copiedId ? <Check size={16} color="#86efac" /> : <Copy size={16} color="rgba(255,255,255,0.7)" />}
              </div>
            </div>
            <p className="app-modal-sub">
              {copiedId ? 'Copied to clipboard!' : 'Save this reference ID to track status in real-time.'}
            </p>
            <div style={{ fontSize: 13, color: 'var(--gray-500)', marginTop: 8 }}>
              Estimated processing: <strong style={{ color: 'var(--navy)' }}>{doc.processingDays}</strong>
            </div>

            <div className="app-modal-actions">
              <button
                type="button"
                className="app-btn-primary"
                onClick={() => navigate('/applications')}
              >
                📂 View in My Applications
              </button>
              <button
                type="button"
                className="app-btn-secondary"
                onClick={() => navigate('/dashboard')}
              >
                🏠 Return to Dashboard
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
