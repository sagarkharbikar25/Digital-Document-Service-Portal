import React from 'react';
import {
  FileText,
  Award,
  FileBadge,
  Receipt,
  Ticket,
  BarChart3,
  GraduationCap,
  LogOut,
  CheckCircle2,
  FileSpreadsheet,
  FileCheck,
} from 'lucide-react';

export type DocCategory = 'academic' | 'conduct';

export interface DocType {
  code: string;
  title: string;
  category: DocCategory;
  icon: string;
  iconBg: string;
  description: string;
  processingDays: string;
  fee: 'free' | 'paid';
  requiredDocs: string[];
  keywords: string;
}

export const DOC_TYPES: DocType[] = [
  {
    code: 'admission',
    title: 'Admission Letter',
    category: 'academic',
    icon: 'admission',
    iconBg: '#fef3c7',
    description: 'Official letter confirming your admission to the college for a specific programme.',
    processingDays: '3–5 Days',
    fee: 'paid',
    requiredDocs: ['Admission Application Form', 'Fee Receipt'],
    keywords: 'admission letter joining programme offer confirmation',
  },
  {
    code: 'idcard',
    title: 'Identity Card (College ID)',
    category: 'academic',
    icon: 'idcard',
    iconBg: '#dbeafe',
    description: 'Official college identity card with photo, roll number and validity.',
    processingDays: '2–3 Days',
    fee: 'paid',
    requiredDocs: ['Passport Size Photo', 'Admission Proof'],
    keywords: 'id card identity college photo roll number',
  },
  {
    code: 'bonafide',
    title: 'Bonafide Certificate',
    category: 'academic',
    icon: 'bonafide',
    iconBg: '#d1fae5',
    description: 'Certifies that you are a bonafide student of this institution.',
    processingDays: '2 Days',
    fee: 'paid',
    requiredDocs: ['Passport Size Photo', 'Fee Receipt'],
    keywords: 'bonafide student certificate studying enrolled',
  },
  {
    code: 'fees_receipt',
    title: 'Fee Receipt / Fee Structure',
    category: 'academic',
    icon: 'fees_receipt',
    iconBg: '#fae8ff',
    description: 'Official fee payment receipt or detailed fee structure for your programme.',
    processingDays: '1–2 Days',
    fee: 'free',
    requiredDocs: ['College ID Card'],
    keywords: 'fee receipt payment structure tuition charges',
  },
  {
    code: 'hall_ticket',
    title: 'Hall Ticket / Admit Card',
    category: 'academic',
    icon: 'hall_ticket',
    iconBg: '#fef9c3',
    description: 'Admit card required to appear in university examinations.',
    processingDays: '1 Day',
    fee: 'free',
    requiredDocs: ['Fee Clearance Certificate'],
    keywords: 'hall ticket admit card exam examination entry',
  },
  {
    code: 'marksheet',
    title: 'Mark Sheet',
    category: 'academic',
    icon: 'marksheet',
    iconBg: '#e0f2fe',
    description: 'Semester-wise mark sheet issued by the university.',
    processingDays: '7–10 Days',
    fee: 'paid',
    requiredDocs: ['College ID Card', 'Examination Form'],
    keywords: 'marksheet marks grades result semester score',
  },
  {
    code: 'provisional',
    title: 'Provisional Certificate',
    category: 'academic',
    icon: 'provisional',
    iconBg: '#f0fdf4',
    description: 'Provisional certificate issued pending the official degree certificate.',
    processingDays: '5–7 Days',
    fee: 'paid',
    requiredDocs: ['All Semester Marksheets', 'Fee Clearance Certificate'],
    keywords: 'provisional certificate degree pending completion graduate',
  },
  {
    code: 'degree',
    title: 'Degree Certificate',
    category: 'academic',
    icon: 'degree',
    iconBg: '#fef3c7',
    description: 'Official degree certificate awarded upon successful completion of the programme.',
    processingDays: '15–30 Days',
    fee: 'paid',
    requiredDocs: ['All Semester Marksheets', 'Fee Clearance + TC'],
    keywords: 'degree certificate graduation convocation official awarded',
  },
  {
    code: 'leaving',
    title: 'Transfer Certificate (TC)',
    category: 'conduct',
    icon: 'leaving',
    iconBg: '#fee2e2',
    description: 'Transfer Certificate issued upon leaving the institution.',
    processingDays: '7–10 Days',
    fee: 'paid',
    requiredDocs: ['Fee Clearance Certificate', 'Library No-Dues', 'All Semester Marksheets'],
    keywords: 'transfer certificate TC leaving college exit withdrawal',
  },
  {
    code: 'migration',
    title: 'Migration Certificate',
    category: 'conduct',
    icon: 'migration',
    iconBg: '#ede9fe',
    description: 'Certificate required to migrate to another university or institution.',
    processingDays: '10–15 Days',
    fee: 'paid',
    requiredDocs: ['Transfer Certificate (TC)', 'Degree / Provisional Certificate'],
    keywords: 'migration certificate university transfer move institution',
  },
  {
    code: 'character',
    title: 'Character / Conduct Certificate',
    category: 'conduct',
    icon: 'character',
    iconBg: '#ecfdf5',
    description: 'Certifies the good character and conduct of the student during the course of study.',
    processingDays: '5–7 Days',
    fee: 'paid',
    requiredDocs: ['College ID Card', 'Attendance Record'],
    keywords: 'character conduct behaviour certificate moral good standing',
  },
  {
    code: 'noc',
    title: 'No Objection Certificate (NOC)',
    category: 'conduct',
    icon: 'noc',
    iconBg: '#fff7ed',
    description: 'NOC issued for internship, scholarship, job, passport or any other purpose.',
    processingDays: '3–5 Days',
    fee: 'paid',
    requiredDocs: ['College ID Card', 'Purpose / Request Letter'],
    keywords: 'NOC no objection certificate internship job passport scholarship',
  },
  {
    code: 'transcript',
    title: 'Official Transcript',
    category: 'conduct',
    icon: 'transcript',
    iconBg: '#e0f2fe',
    description: 'Official academic transcript with all semester results for higher studies or abroad applications.',
    processingDays: '10–15 Days',
    fee: 'paid',
    requiredDocs: ['College ID Card', 'All Semester Marksheets'],
    keywords: 'transcript academic record higher studies abroad GRE GMAT',
  },
  {
    code: 'tc',
    title: 'Transfer Certificate (TC)',
    category: 'conduct',
    icon: 'tc',
    iconBg: '#fee2e2',
    description: 'Transfer Certificate issued upon leaving the institution.',
    processingDays: '7–10 Days',
    fee: 'paid',
    requiredDocs: ['Fee Clearance Certificate', 'Library No-Dues', 'All Semester Marksheets'],
    keywords: 'transfer certificate TC leaving college exit withdrawal',
  },
];

export function getDocType(code: string): DocType | undefined {
  return DOC_TYPES.find((d) => d.code === code);
}

export function getDocIcon(code: string, size = 18): React.ReactElement {
  switch (code) {
    case 'admission': return React.createElement(FileText, { size });
    case 'idcard': return React.createElement(Award, { size });
    case 'bonafide': return React.createElement(FileBadge, { size });
    case 'fees_receipt': return React.createElement(Receipt, { size });
    case 'hall_ticket': return React.createElement(Ticket, { size });
    case 'marksheet': return React.createElement(BarChart3, { size });
    case 'provisional': return React.createElement(GraduationCap, { size });
    case 'degree': return React.createElement(GraduationCap, { size });
    case 'leaving': return React.createElement(LogOut, { size });
    case 'character': return React.createElement(Award, { size });
    case 'noc': return React.createElement(CheckCircle2, { size });
    case 'transcript': return React.createElement(FileSpreadsheet, { size });
    case 'migration': return React.createElement(FileCheck, { size });
    case 'tc': return React.createElement(LogOut, { size });
    default: return React.createElement(FileText, { size });
  }
}
