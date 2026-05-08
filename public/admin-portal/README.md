# JDCOEM Admin Portal — Multi-Level Document Approval System

## 📁 File Structure
```
admin-portal/
├── index.html        ← Admin Login Page
├── clerk.html        ← Clerk Dashboard
├── hod.html          ← HOD Dashboard
├── principal.html    ← Principal Dashboard
├── track.html        ← Student Application Tracker
├── style.css         ← Shared Stylesheet (all pages)
├── db.js             ← Mock Database + Auth + Utilities
├── login.js          ← Login page logic
├── clerk.js          ← Clerk dashboard logic
├── hod.js            ← HOD dashboard logic
└── principal.js      ← Principal dashboard logic
```

## 🔐 Login Credentials

| Role      | Email                        | Password       | Redirects To       |
|-----------|------------------------------|----------------|--------------------|
| Clerk     | clerk@jdcoem.ac.in           | Clerk@123      | clerk.html         |
| HOD       | hod@jdcoem.ac.in             | Hod@123        | principal.html     |
| Principal | principal@jdcoem.ac.in       | Principal@123  | hod.html           |

## 🚀 How to Run
1. Open `index.html` in any modern browser
2. Use the demo credentials (or click any credential row to auto-fill)
3. Navigate through the approval workflow

## 🔀 Application Workflow
```
Student Submits → Pending at Clerk
    ↓
Clerk Reviews (Approve/Reject + Remarks)
    ↓ Approved
Pending at HOD
    ↓
HOD Reviews + Digital Signature (Approve/Reject + Remarks)
    ↓ Approved
Pending at Principal
    ↓
Principal Final Approval + Digital Signature
    ↓ Approved
Document Issued → Student Downloads
```

## 📊 Status States
- Pending at Clerk
- Rejected by Clerk
- Pending at HOD
- Rejected by HOD
- Pending at Principal
- Rejected by Principal
- Document Issued

## 🧪 Demo Applications (Pre-seeded)
| ID            | Student        | Document           | Status              |
|---------------|----------------|--------------------|---------------------|
| APP-2025-101  | Ananya D.      | Bonafide Cert      | Pending at Clerk    |
| APP-2025-102  | Rohit K.       | Transcript         | Pending at Clerk    |
| APP-2025-103  | Sneha J.       | Character Cert     | Pending at HOD      |
| APP-2025-104  | Karan P.       | NOC                | Pending at Principal|
| APP-2025-105  | Meera N.       | Transfer Cert      | Document Issued     |
| APP-2025-106  | Arjun W.       | Bonafide Cert      | Rejected by Clerk   |
| APP-2025-107  | Pallavi R.     | Provisional Cert   | Pending at Principal|

## 🔍 Student Tracker
Open `track.html` and search by:
- Application ID (e.g. APP-2025-101)
- Student Email (e.g. sneha.j@student.jdcoem.ac.in)
- BT ID (e.g. BT22CS045)

## ⚙️ Technical Notes
- All data is stored in `localStorage` (clears on browser data reset)
- No backend required — pure HTML/CSS/JS
- Role-based access control enforced via session checks
- Digital signatures are simulated (text-based with hash)
