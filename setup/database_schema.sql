-- JDCOEM Student Portal Database Schema
-- Version: 1.1

-- 1. Users Table
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) DEFAULT 'student', -- student, clerk, hod, principal
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Students Table
CREATE TABLE IF NOT EXISTS students (
    user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
    bt_id VARCHAR(50) UNIQUE NOT NULL,
    department VARCHAR(100),
    admission_year INTEGER,
    phone VARCHAR(20)
);

-- 3. Applications Table
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    student_id INTEGER REFERENCES users(id),
    document_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    clerk_remarks TEXT,
    hod_remarks TEXT,
    principal_remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Application Documents
CREATE TABLE IF NOT EXISTS application_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    file_name TEXT NOT NULL,
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 5. Certificates (Verified Documents)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    application_id INTEGER REFERENCES applications(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    document_hash VARCHAR(64) NOT NULL, -- SHA-256
    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 6. Rate Limiting
CREATE TABLE IF NOT EXISTS rate_limit (
    id SERIAL PRIMARY KEY,
    ip_address VARCHAR(45) NOT NULL,
    attempts INTEGER DEFAULT 1,
    last_attempt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_cert_hash ON certificates(document_hash);
CREATE INDEX IF NOT EXISTS idx_app_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_app_number ON applications(application_number);
