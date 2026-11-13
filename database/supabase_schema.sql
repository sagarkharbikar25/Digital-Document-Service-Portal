-- ============================================================================
-- JDCOEM DIGITAL DOCUMENT SERVICES PORTAL - SUPABASE PRODUCTION SCHEMA
-- Fully structured with Department-Wise Clerk & HOD Isolation, Institutional Principal,
-- Organized Student Batches (BT-ID Encoding: BT + YY + Roll + Branch), and JSONB Metadata
-- ============================================================================

-- 1. DEPARTMENTS REFERENCE TABLE
CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    code VARCHAR(20) UNIQUE NOT NULL,
    name VARCHAR(100) UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Seed Standard Institutional Departments
INSERT INTO departments (code, name) VALUES
    ('CS', 'Computer Science and Engineering'),
    ('IT', 'Information Technology'),
    ('AI', 'Artificial Intelligence'),
    ('DS', 'Data Science'),
    ('CYS', 'Cyber Security'),
    ('ETC', 'Electronics & Telecommunication'),
    ('EE', 'Electrical Engineering'),
    ('ME', 'Mechanical Engineering'),
    ('CE', 'Civil Engineering'),
    ('CH', 'Chemical Engineering'),
    ('BSHD', 'Basic Science and Humanities (BSHD)'),
    ('MBA', 'Master of Business Administration'),
    ('MCA', 'Master of Computer Applications')
ON CONFLICT (code) DO NOTHING;

-- 2. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student', -- 'student', 'clerk', 'hod', 'principal', 'admin'
    department VARCHAR(100),                      -- Department name for Clerk/HOD (NULL for Principal)
    branch VARCHAR(100),                          -- Specific branch
    year VARCHAR(50),                             -- Academic year
    bt_id VARCHAR(50),                            -- Student unique BT ID (e.g. BT240076CS)
    phone VARCHAR(20),
    mobile VARCHAR(20),
    address TEXT,
    dob DATE,
    gender VARCHAR(20),
    programme VARCHAR(100) DEFAULT 'B.Tech',
    semester VARCHAR(20),
    admission_year INTEGER,                       -- Parsed from BT ID (e.g. 24 -> 2024)
    section VARCHAR(20),
    btid VARCHAR(50),
    prn VARCHAR(50),
    photo_url TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. STUDENTS TABLE (Organized by Year, Batch & Branch)
CREATE TABLE IF NOT EXISTS students (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    roll_number VARCHAR(50) NOT NULL,             -- Same as BT ID
    bt_id VARCHAR(50) NOT NULL,                   -- Standard JDCOEM BT ID
    department VARCHAR(100) NOT NULL,             -- Student Department
    branch VARCHAR(100) NOT NULL,                 -- Student Branch
    current_year VARCHAR(50) NOT NULL,            -- 'First Year (FE)', 'Second Year (SE)', 'Third Year (TE)', 'Final Year (BE)'
    year VARCHAR(50) NOT NULL,
    admission_year VARCHAR(20),                   -- e.g. '2024'
    semester VARCHAR(20),
    section VARCHAR(20),
    category VARCHAR(50) DEFAULT 'General / Open',
    parent_name VARCHAR(100),
    parent_mobile VARCHAR(20),
    phone VARCHAR(20),
    dob DATE,
    address TEXT,
    prn VARCHAR(50),
    current_programme VARCHAR(100) DEFAULT 'Bachelor of Technology (B.Tech)',
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. STAFF TABLE (Department-wise Clerk and HOD, Institutional Principal)
CREATE TABLE IF NOT EXISTS staff (
    id SERIAL PRIMARY KEY,
    user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    designation VARCHAR(100) NOT NULL,            -- 'Academic Clerk', 'Head of Department', 'Principal'
    department VARCHAR(100),                      -- Department name for Clerk/HOD (NULL for Principal)
    signature_path TEXT,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. APPLICATIONS TABLE (Department-tagged, Multi-Tier State, Dynamic JSONB)
CREATE TABLE IF NOT EXISTS applications (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    application_number VARCHAR(50) UNIQUE NOT NULL,
    certificate_type VARCHAR(100) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending_clerk',   -- 'pending_clerk', 'pending_hod', 'pending_principal', 'issued', 'rejected'
    purpose VARCHAR(255),
    full_name VARCHAR(100),
    dob DATE,
    gender VARCHAR(20),
    mobile VARCHAR(20),
    email VARCHAR(100),
    btid VARCHAR(50),                             -- BT ID (e.g. BT240076CS)
    branch VARCHAR(100),                          -- Used for Department-Wise Clerk & HOD Filtering
    year VARCHAR(50),
    ac_year VARCHAR(50),
    adm_type VARCHAR(50),
    remarks TEXT,
    
    -- Clerk Review Stage (Department-Isolated)
    clerk_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    clerk_status VARCHAR(50) DEFAULT 'pending',   -- 'pending', 'approved', 'rejected'
    clerk_remarks TEXT,
    clerk_approved_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- HOD Recommendation Stage (Department-Isolated)
    hod_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    hod_status VARCHAR(50) DEFAULT 'pending',     -- 'pending', 'approved', 'rejected'
    hod_remarks TEXT,
    hod_approved_at TIMESTAMP WITHOUT TIME ZONE,
    
    -- Principal Sanction Stage (Institutional / All Departments)
    principal_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    principal_status VARCHAR(50) DEFAULT 'pending',-- 'pending', 'approved', 'rejected'
    principal_remarks TEXT,
    principal_approved_at TIMESTAMP WITHOUT TIME ZONE,
    
    approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    approved_at TIMESTAMP WITHOUT TIME ZONE,
    certificate_number VARCHAR(100),
    certificate_file VARCHAR(255),
    certificate_hash VARCHAR(255),
    issued_at TIMESTAMP WITHOUT TIME ZONE,
    rejection_reason TEXT,
    document_id INTEGER,
    fee_type VARCHAR(100),
    transaction_id VARCHAR(100),
    amount NUMERIC(10,2),
    
    -- Dynamic JSONB Metadata for all 13 Document Forms
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. CERTIFICATES TABLE (Cryptographic Seal & Verification)
CREATE TABLE IF NOT EXISTS certificates (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    certificate_number VARCHAR(100) UNIQUE NOT NULL,
    file_path TEXT NOT NULL,
    file_hash VARCHAR(255),
    document_hash VARCHAR(255),
    generated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
    generated_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. APPLICATION DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS application_documents (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    document_type VARCHAR(100),
    file_name VARCHAR(255) NOT NULL,
    file_path VARCHAR(255),
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 8. APPLICATION REMARKS TABLE (Audit Trail for Clerk, HOD & Principal)
CREATE TABLE IF NOT EXISTS application_remarks (
    id SERIAL PRIMARY KEY,
    application_id INTEGER NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) DEFAULT 'remark',
    remark TEXT NOT NULL,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 9. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'status',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITHOUT TIME ZONE,
    created_at TIMESTAMP WITHOUT TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- PERFORMANCE & DEPARTMENT FILTERING INDEXES
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_applications_metadata ON applications USING GIN (metadata);
CREATE INDEX IF NOT EXISTS idx_applications_branch ON applications (branch);
CREATE INDEX IF NOT EXISTS idx_applications_btid ON applications (btid);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);
CREATE INDEX IF NOT EXISTS idx_applications_app_number ON applications (application_number);
CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications (student_id);
CREATE INDEX IF NOT EXISTS idx_students_dept_year ON students (department, current_year);
CREATE INDEX IF NOT EXISTS idx_students_bt_id ON students (bt_id);
CREATE INDEX IF NOT EXISTS idx_users_role_dept ON users (role, department);

-- ============================================================================
-- SEED INSTITUTIONAL USERS & ROLES
-- Default Password for all seed accounts: password123
-- ============================================================================

-- 1. INSTITUTIONAL PRINCIPAL (Common across all departments)
INSERT INTO users (name, email, password, role, department, branch, year)
VALUES
    ('Principal JDCOEM', 'sagar@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'principal', NULL, 'Institution', 'Executive')
ON CONFLICT (email) DO UPDATE SET department = NULL;

-- 2. DEPARTMENT-WISE CLERKS
INSERT INTO users (name, email, password, role, department, branch, year) VALUES
    ('Academic Clerk (CSE)', 'saar@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Computer Science and Engineering', 'CSE', 'Staff'),
    ('Academic Clerk (IT)', 'clerk.it@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Information Technology', 'IT', 'Staff'),
    ('Academic Clerk (AI)', 'clerk.ai@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Artificial Intelligence', 'AI', 'Staff'),
    ('Academic Clerk (DS)', 'clerk.ds@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Data Science', 'DS', 'Staff'),
    ('Academic Clerk (CYS)', 'clerk.cys@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Cyber Security', 'CYS', 'Staff'),
    ('Academic Clerk (ETC)', 'clerk.etc@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Electronics & Telecommunication', 'ETC', 'Staff'),
    ('Academic Clerk (EE)', 'clerk.ee@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Electrical Engineering', 'EE', 'Staff'),
    ('Academic Clerk (ME)', 'clerk.me@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Mechanical Engineering', 'ME', 'Staff'),
    ('Academic Clerk (CE)', 'clerk.ce@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Civil Engineering', 'CE', 'Staff'),
    ('Academic Clerk (BSHD)', 'clerk.bshd@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'clerk', 'Basic Science and Humanities (BSHD)', 'BSHD', 'Staff')
ON CONFLICT (email) DO UPDATE SET department = EXCLUDED.department, role = 'clerk';

-- 3. DEPARTMENT-WISE HODs
INSERT INTO users (name, email, password, role, department, branch, year) VALUES
    ('Head of Department (CSE)', 'skhod@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Computer Science and Engineering', 'CSE', 'Staff'),
    ('Head of Department (IT)', 'hod.it@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Information Technology', 'IT', 'Staff'),
    ('Head of Department (AI)', 'hod.ai@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Artificial Intelligence', 'AI', 'Staff'),
    ('Head of Department (DS)', 'hod.ds@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Data Science', 'DS', 'Staff'),
    ('Head of Department (CYS)', 'hod.cys@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Cyber Security', 'CYS', 'Staff'),
    ('Head of Department (ETC)', 'hod.etc@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Electronics & Telecommunication', 'ETC', 'Staff'),
    ('Head of Department (EE)', 'hod.ee@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Electrical Engineering', 'EE', 'Staff'),
    ('Head of Department (ME)', 'hod.me@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Mechanical Engineering', 'ME', 'Staff'),
    ('Head of Department (CE)', 'hod.ce@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Civil Engineering', 'CE', 'Staff'),
    ('Head of Department (BSHD)', 'hod.bshd@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'hod', 'Basic Science and Humanities (BSHD)', 'BSHD', 'Staff')
ON CONFLICT (email) DO UPDATE SET department = EXCLUDED.department, role = 'hod';

-- 4. LINK STAFF PROFILES
INSERT INTO staff (user_id, designation, department)
SELECT id, 
       CASE WHEN role = 'principal' THEN 'Principal'
            WHEN role = 'hod' THEN 'Head of Department'
            ELSE 'Academic Clerk' END,
       department
FROM users 
WHERE role IN ('clerk', 'hod', 'principal')
ON CONFLICT (user_id) DO UPDATE SET department = EXCLUDED.department, designation = EXCLUDED.designation;

-- 5. SEED STUDENTS (ORGANIZED BY BT-ID FORMAT: BT + YY + ROLL + BRANCH)
-- BT240076CS: Batch 2024, Third Year, Computer Science
-- BT260076IT: Batch 2026, First Year, Information Technology
-- BT250076ME: Batch 2025, Second Year, Mechanical Engineering
-- BT240056CS: Batch 2024, First Year FE, Basic Science and Humanities (BSHD)
INSERT INTO users (name, email, password, role, department, branch, year, bt_id, btid, admission_year) VALUES
    ('Akash Kumar', 'saarkharbikar@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'student', 'Computer Science and Engineering', 'Computer Science and Engineering', 'Third Year', 'BT240076CS', 'BT240076CS', 2024),
    ('Priya Sharma', 'priya.it@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'student', 'Information Technology', 'Information Technology', 'First Year (FE)', 'BT260076IT', 'BT260076IT', 2026),
    ('Rohan Verma', 'rohan.me@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'student', 'Mechanical Engineering', 'Mechanical Engineering', 'Second Year (SE)', 'BT250076ME', 'BT250076ME', 2025),
    ('Ananya Joshi', 'ananya.fe@jdcoem.ac.in', '$2y$10$e8w6W2kGkS89Y9uPzU8W3e7vT3L6jF2M5H1j8D4B0K1a9X7Y8Z6qW', 'student', 'Basic Science and Humanities (BSHD)', 'Computer Science and Engineering', 'First Year (FE)', 'BT240056CS', 'BT240056CS', 2024)
ON CONFLICT (email) DO NOTHING;

-- Populate students table records
INSERT INTO students (user_id, roll_number, bt_id, department, branch, current_year, year, admission_year, phone)
SELECT u.id, u.bt_id, u.bt_id, u.department, u.branch, u.year, u.year, CAST(u.admission_year AS VARCHAR), '9876543210'
FROM users u
WHERE u.role = 'student' AND u.bt_id IS NOT NULL
ON CONFLICT (user_id) DO UPDATE SET 
    roll_number = EXCLUDED.roll_number,
    bt_id = EXCLUDED.bt_id,
    department = EXCLUDED.department,
    branch = EXCLUDED.branch,
    current_year = EXCLUDED.current_year,
    year = EXCLUDED.year;

