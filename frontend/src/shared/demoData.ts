export interface Application {
  id: string;
  docCode: string;
  docTitle: string;
  dateApplied: string;
  status: 'pending' | 'clerk_approved' | 'hod_approved' | 'approved' | 'rejected' | 'issued';
  statusLabel: string;
  processingDays: string;
  purpose: string;
  files: string[];
}

export const DEMO_APPLICATIONS: Application[] = [
  {
    id: 'APP-2026-0041',
    docCode: 'bonafide',
    docTitle: 'Bonafide Certificate',
    dateApplied: '2026-11-01',
    status: 'issued',
    statusLabel: 'Issued',
    processingDays: '2 Days',
    purpose: 'Required for bank account opening',
    files: ['passport_photo.jpg', 'fee_receipt.pdf'],
  },
  {
    id: 'APP-2026-0055',
    docCode: 'noc',
    docTitle: 'No Objection Certificate (NOC)',
    dateApplied: '2026-11-05',
    status: 'approved',
    statusLabel: 'Approved',
    processingDays: '3–5 Days',
    purpose: 'Required for internship at TechCorp Pvt. Ltd.',
    files: ['college_id.jpg', 'internship_offer_letter.pdf'],
  },
  {
    id: 'APP-2026-0063',
    docCode: 'transcript',
    docTitle: 'Official Transcript',
    dateApplied: '2026-11-08',
    status: 'clerk_approved',
    statusLabel: 'Clerk Approved – Awaiting HOD',
    processingDays: '10–15 Days',
    purpose: 'GRE application – University of Texas',
    files: ['college_id.jpg', 'all_marksheets.pdf'],
  },
  {
    id: 'APP-2026-0071',
    docCode: 'marksheet',
    docTitle: 'Mark Sheet',
    dateApplied: '2026-11-10',
    status: 'rejected',
    statusLabel: 'Rejected',
    processingDays: '7–10 Days',
    purpose: 'Scholarship application',
    files: ['college_id.jpg', 'exam_form.pdf'],
  },
  {
    id: 'APP-2026-0082',
    docCode: 'character',
    docTitle: 'Character / Conduct Certificate',
    dateApplied: '2026-11-11',
    status: 'pending',
    statusLabel: 'Pending Review',
    processingDays: '5–7 Days',
    purpose: 'Job application at Infosys',
    files: ['college_id.jpg', 'attendance_record.pdf'],
  },
];

export const DEMO_STUDENT = {
  name: 'Akash Kumar',
  id: 'BT22CSE041',
  branch: 'B.Tech – CSE',
  year: '3rd Year',
};
