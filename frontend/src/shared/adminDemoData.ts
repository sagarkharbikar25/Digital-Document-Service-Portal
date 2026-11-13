export interface UploadedDocFile {
  id: string;
  name: string;
  fileName: string;
  fileType: 'pdf' | 'image';
  fileSize: string;
  uploadedAt: string;
  previewUrl?: string;
  verified?: boolean;
  docLabel: string;
}

export interface AdminApplication {
  id: string;
  docCode: string;
  docTitle: string;
  studentName: string;
  studentEmail: string;
  rollNo: string;
  dept: string;
  year: string;
  dateApplied: string;
  status: 'pending' | 'clerk_approved' | 'hod_approved' | 'approved' | 'rejected' | 'issued';
  purpose: string;
  remarks?: string;
  clerkRemarks?: string;
  hodRemarks?: string;
  principalRemarks?: string;
  files: UploadedDocFile[];
}

export const ADMIN_QUEUE: AdminApplication[] = [
  {
    id: 'APP-2026-0101',
    docCode: 'bonafide',
    docTitle: 'Bonafide Certificate',
    studentName: 'Ravi Sharma',
    studentEmail: 'ravi.sharma@jdcoem.ac.in',
    rollNo: 'BT22CSE012',
    dept: 'Computer Science & Engineering',
    year: '3rd Year (Sem VI)',
    dateApplied: '2026-11-10 10:30 AM',
    status: 'pending',
    purpose: 'Required for opening SBI student education account and national scholarship verification.',
    clerkRemarks: '',
    files: [
      {
        id: 'f1',
        name: 'College ID Card Front & Back',
        fileName: 'BT22CSE012_ID_Card.jpg',
        fileType: 'image',
        fileSize: '412 KB',
        uploadedAt: '10 Nov 2026, 10:28 AM',
        docLabel: 'Student Identity Card',
      },
      {
        id: 'f2',
        name: 'Current Session College Fee Receipt',
        fileName: 'Fee_Receipt_SemVI_2026.pdf',
        fileType: 'pdf',
        fileSize: '1.2 MB',
        uploadedAt: '10 Nov 2026, 10:29 AM',
        docLabel: 'Fee Clearance Receipt',
      },
      {
        id: 'f3',
        name: 'Recent Passport Photograph',
        fileName: 'ravi_sharma_photo.png',
        fileType: 'image',
        fileSize: '280 KB',
        uploadedAt: '10 Nov 2026, 10:25 AM',
        docLabel: 'Passport Photo',
      },
    ],
  },
  {
    id: 'APP-2026-0102',
    docCode: 'noc',
    docTitle: 'No Objection Certificate (NOC)',
    studentName: 'Priya Nair',
    studentEmail: 'priya.nair@jdcoem.ac.in',
    rollNo: 'BT21ECE034',
    dept: 'Electronics & Communication',
    year: '4th Year (Sem VIII)',
    dateApplied: '2026-11-09 02:15 PM',
    status: 'pending',
    purpose: 'Mandatory 6-month industrial internship at Wipro Technologies, Pune campus.',
    clerkRemarks: '',
    files: [
      {
        id: 'f4',
        name: 'Corporate Internship Offer Letter',
        fileName: 'Wipro_Offer_Letter_2026.pdf',
        fileType: 'pdf',
        fileSize: '2.4 MB',
        uploadedAt: '09 Nov 2026, 02:10 PM',
        docLabel: 'Offer Letter',
      },
      {
        id: 'f5',
        name: 'Parent Consent & Undertaking Form',
        fileName: 'Parent_NOC_Undertaking.pdf',
        fileType: 'pdf',
        fileSize: '890 KB',
        uploadedAt: '09 Nov 2026, 02:12 PM',
        docLabel: 'Parent Undertaking',
      },
      {
        id: 'f6',
        name: 'Student ID Card Copy',
        fileName: 'Priya_IDCard.jpg',
        fileType: 'image',
        fileSize: '345 KB',
        uploadedAt: '09 Nov 2026, 02:08 PM',
        docLabel: 'Student Identity Card',
      },
    ],
  },
  {
    id: 'APP-2026-0103',
    docCode: 'transcript',
    docTitle: 'Official Academic Transcript',
    studentName: 'Amit Patel',
    studentEmail: 'amit.patel@jdcoem.ac.in',
    rollNo: 'BT22ME019',
    dept: 'Mechanical Engineering',
    year: '4th Year (Sem VII)',
    dateApplied: '2026-11-08 11:45 AM',
    status: 'pending',
    purpose: 'Higher education MS in Aerospace application at Georgia Institute of Technology, USA.',
    clerkRemarks: '',
    files: [
      {
        id: 'f7',
        name: 'Consolidated Grade Marksheet Sem I - VI',
        fileName: 'Consolidated_GradeCard_Sem1_6.pdf',
        fileType: 'pdf',
        fileSize: '3.8 MB',
        uploadedAt: '08 Nov 2026, 11:40 AM',
        docLabel: 'Grade Card / Marksheet',
      },
      {
        id: 'f8',
        name: 'Library & Department No Dues Clearance',
        fileName: 'No_Dues_Certificate.pdf',
        fileType: 'pdf',
        fileSize: '650 KB',
        uploadedAt: '08 Nov 2026, 11:42 AM',
        docLabel: 'No Dues Slip',
      },
    ],
  },
  {
    id: 'APP-2026-0104',
    docCode: 'character',
    docTitle: 'Character / Conduct Certificate',
    studentName: 'Sneha Joshi',
    studentEmail: 'sneha.joshi@jdcoem.ac.in',
    rollNo: 'BT21CSE007',
    dept: 'Computer Science & Engineering',
    year: '4th Year (Sem VIII)',
    dateApplied: '2026-11-05 09:30 AM',
    status: 'clerk_approved',
    purpose: 'Campus recruitment onboarding at Tata Consultancy Services (TCS Digital).',
    clerkRemarks: 'Verified student records. Clean conduct history and no disciplinary warnings.',
    files: [
      {
        id: 'f9',
        name: 'Student ID Proof',
        fileName: 'Sneha_ID_Card.jpg',
        fileType: 'image',
        fileSize: '310 KB',
        uploadedAt: '05 Nov 2026, 09:25 AM',
        docLabel: 'Student Identity Card',
      },
      {
        id: 'f10',
        name: 'TCS Offer / Intent Document',
        fileName: 'TCS_Letter_Of_Intent.pdf',
        fileType: 'pdf',
        fileSize: '1.5 MB',
        uploadedAt: '05 Nov 2026, 09:27 AM',
        docLabel: 'Company Letter',
      },
    ],
  },
  {
    id: 'APP-2026-0105',
    docCode: 'admission',
    docTitle: 'Admission Letter Confirmation',
    studentName: 'Rahul Singh',
    studentEmail: 'rahul.singh@jdcoem.ac.in',
    rollNo: 'BT24CSE052',
    dept: 'Computer Science & Engineering',
    year: '1st Year (Sem I)',
    dateApplied: '2026-11-04 04:20 PM',
    status: 'clerk_approved',
    purpose: 'Campus hostel allocation and university registration allotment record.',
    clerkRemarks: 'CAP round allotment letter and fee receipt verified successfully.',
    files: [
      {
        id: 'f11',
        name: 'MHT-CET CAP Allotment Letter',
        fileName: 'CAP_Round1_Allotment.pdf',
        fileType: 'pdf',
        fileSize: '1.8 MB',
        uploadedAt: '04 Nov 2026, 04:15 PM',
        docLabel: 'CAP Allotment Letter',
      },
      {
        id: 'f12',
        name: 'Admission Admission Fee Challan',
        fileName: 'Admission_Fee_Challan.pdf',
        fileType: 'pdf',
        fileSize: '920 KB',
        uploadedAt: '04 Nov 2026, 04:18 PM',
        docLabel: 'Admission Fee Challan',
      },
    ],
  },
  {
    id: 'APP-2026-0106',
    docCode: 'idcard',
    docTitle: 'Identity Card (Duplicate ID)',
    studentName: 'Meera Kumar',
    studentEmail: 'meera.kumar@jdcoem.ac.in',
    rollNo: 'BT23IT011',
    dept: 'Information Technology',
    year: '2nd Year (Sem IV)',
    dateApplied: '2026-11-03 01:10 PM',
    status: 'hod_approved',
    purpose: 'Replacement for misplaced original college ID card during college fest.',
    clerkRemarks: 'FIR police report and fine receipt of Rs 200 attached and verified.',
    hodRemarks: 'Recommended for duplicate card issuance after verification.',
    files: [
      {
        id: 'f13',
        name: 'Police Lost Article Report / NCR',
        fileName: 'Police_NCR_Report.pdf',
        fileType: 'pdf',
        fileSize: '780 KB',
        uploadedAt: '03 Nov 2026, 01:05 PM',
        docLabel: 'Police Complaint Receipt',
      },
      {
        id: 'f14',
        name: 'Duplicate Card Processing Fine Receipt',
        fileName: 'Fine_Receipt_200.pdf',
        fileType: 'pdf',
        fileSize: '540 KB',
        uploadedAt: '03 Nov 2026, 01:08 PM',
        docLabel: 'Penalty Payment Slip',
      },
    ],
  },
  {
    id: 'APP-2026-0107',
    docCode: 'marksheet',
    docTitle: 'Duplicate Mark Sheet',
    studentName: 'Deepak Verma',
    studentEmail: 'deepak.verma@jdcoem.ac.in',
    rollNo: 'BT22CSE031',
    dept: 'Computer Science & Engineering',
    year: '3rd Year (Sem V)',
    dateApplied: '2026-11-02 03:00 PM',
    status: 'approved',
    purpose: 'National Merit Scholarship disbursement portal submission.',
    clerkRemarks: 'Sem IV marksheet copy verified with COE database records.',
    hodRemarks: 'Academic records authentic. Forwarded for certificate issuance.',
    principalRemarks: 'Digitally signed and released to student portal.',
    files: [
      {
        id: 'f15',
        name: 'Exam Controller Result Gazette Copy',
        fileName: 'Gazette_Result_SemIV.pdf',
        fileType: 'pdf',
        fileSize: '2.1 MB',
        uploadedAt: '02 Nov 2026, 02:55 PM',
        docLabel: 'Exam Result Copy',
      },
    ],
  },
  {
    id: 'APP-2026-0108',
    docCode: 'degree',
    docTitle: 'Degree Certificate Verification',
    studentName: 'Anjali Desai',
    studentEmail: 'anjali.desai@jdcoem.ac.in',
    rollNo: 'BT20CSE088',
    dept: 'Computer Science & Engineering',
    year: 'Alumni (2024 Batch)',
    dateApplied: '2026-10-28 11:20 AM',
    status: 'rejected',
    purpose: 'Higher education admission abroad – WES Canada verification.',
    clerkRemarks: 'Insufficient marksheets – 5th semester original grade card is illegible. Please re-upload.',
    files: [
      {
        id: 'f16',
        name: 'Degree Certificate Scan',
        fileName: 'Anjali_Degree_Scan.pdf',
        fileType: 'pdf',
        fileSize: '3.1 MB',
        uploadedAt: '28 Oct 2026, 11:15 AM',
        docLabel: 'Degree Certificate',
      },
      {
        id: 'f17',
        name: 'Unclear 5th Semester Marksheet',
        fileName: 'Sem5_Marksheet_Blown.jpg',
        fileType: 'image',
        fileSize: '120 KB',
        uploadedAt: '28 Oct 2026, 11:18 AM',
        docLabel: 'Blurred Document',
      },
    ],
  },
];
