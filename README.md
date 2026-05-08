# 🏛️ Digital Document Service Portal
### *JDCOEM Nagpur — Secure Document Issuance & Verification System*

![Version](https://img.shields.io/badge/version-1.1.0-blue)
![PHP](https://img.shields.io/badge/PHP-8.1+-777bb4)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-13+-336791)
![License](https://img.shields.io/badge/License-Proprietary-red)

## 🌟 Overview
The **Digital Document Service Portal** is a high-security administrative platform designed for JD College of Engineering & Management. It streamlines the application, approval, and issuance of official student documents (Bonafide Certificates, NOCs, Character Certificates, etc.) using a decentralized cryptographic verification model.

## 🚀 Key Features
- **Multi-Level Approval Workflow**: Documents pass through three verification stages:
    1.  **Clerk**: Verification of basic data and physical documents.
    2.  **HOD**: Academic department review.
    3.  **Principal**: Final executive authorization.
- **Cryptographic Document Signing**: Every issued document is hashed using **SHA-256**. This creates a unique "mathematical fingerprint" stored in the secure registry.
- **Instant Public Verification**: A dedicated public portal allows employers and third parties to verify document authenticity by simply uploading the PDF or entering the Certificate Number.
- **Secure File Proxy**: Student-sensitive uploads are stored outside the web root and served via an authenticated PHP tunnel (`storage_proxy.php`).
- **Automated Email Notifications**: Real-time updates to students at every stage of the approval process.

## 🛠️ Technology Stack
- **Backend**: PHP 8.1+ (Native MVC architecture)
- **Database**: PostgreSQL (Structured relational data)
- **Security**: SHA-256 Hashing, CSRF Protection, Session Hardening
- **Frontend**: Vanilla JS (Dynamic Dashboards), HTML5, CSS3 (Modern Glassmorphism Design)

## 📁 Project Structure
```text
college-portal/
├── app/                # Core Logic (Controllers, Models, Repositories)
├── config/             # Database & App Configuration
├── public/             # Web Root (Entry point)
│   ├── admin-portal/   # Dashboards (Clerk, HOD, Principal)
│   ├── verify/         # Public Verification Tool
│   ├── js/             # Security & Utility Scripts
│   └── index.php       # API Router
├── setup/              # Deployment Scripts & SQL Schema
├── storage/            # Private Storage (Uploads & Logs)
└── .env                # Environment Variables (Private)
```

## ⚙️ Setup & Installation
1.  **Clone the Repository**:
    ```bash
    git clone https://github.com/sagarkharbikar25/digital-document-service-portal.git
    ```
2.  **Database Configuration**:
    - Import `/setup/database_schema.sql` into your PostgreSQL instance.
3.  **Environment Setup**:
    - Rename `env.example` to `.env`.
    - Fill in your database credentials and SMTP (Gmail) settings.
4.  **Web Server Config**:
    - Point your Apache/Nginx Document Root to the `public/` directory.
    - Ensure `mod_rewrite` is enabled (for `.htaccess`).
5.  **Permissions**:
    - Run `/setup/permissions_fix.php` to ensure the server can write to the `storage/` directory.

## 🔒 Security Policy
This project implements strict CSRF protection. All state-changing requests (POST/PUT/DELETE) must include an `X-CSRF-TOKEN` header, handled automatically by our `secureFetch` wrapper.

---
Developed with ❤️ by **Sagar Kharbikar** (JDCOEM).
