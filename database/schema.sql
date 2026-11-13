-- ========================================
-- USERS TABLE
-- ========================================

CREATE TABLE users (
    id SERIAL PRIMARY KEY,

    name VARCHAR(100) NOT NULL,

    email VARCHAR(150) UNIQUE NOT NULL,

    password TEXT NOT NULL,

    role VARCHAR(20) NOT NULL,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- STUDENTS TABLE
-- ========================================

CREATE TABLE students (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE CASCADE,

    roll_no VARCHAR(50) UNIQUE NOT NULL,

    branch VARCHAR(100),

    year VARCHAR(20),

    phone VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- STAFF TABLE
-- ========================================

CREATE TABLE staff (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE CASCADE,

    role VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- DOCUMENTS TABLE
-- ========================================

CREATE TABLE documents (
    id SERIAL PRIMARY KEY,

    student_id INT REFERENCES students(id) ON DELETE CASCADE,

    file_name TEXT,

    file_path TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- APPLICATIONS TABLE
-- ========================================

CREATE TABLE applications (
    id SERIAL PRIMARY KEY,

    student_id INT REFERENCES students(id) ON DELETE CASCADE,

    document_id INT REFERENCES documents(id) ON DELETE SET NULL,

    purpose TEXT,

    status VARCHAR(50) DEFAULT 'pending_clerk',

    certificate_file TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- NOTIFICATIONS TABLE
-- ========================================

CREATE TABLE notifications (
    id SERIAL PRIMARY KEY,

    user_id INT REFERENCES users(id) ON DELETE CASCADE,

    message TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- SIGNATURES TABLE
-- ========================================

CREATE TABLE signatures (
    id SERIAL PRIMARY KEY,

    staff_id INT REFERENCES staff(id) ON DELETE CASCADE,

    file_path TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);


-- ========================================
-- APPROVALS TABLE
-- ========================================

CREATE TABLE approvals (
    id SERIAL PRIMARY KEY,

    application_id INT REFERENCES applications(id) ON DELETE CASCADE,

    staff_id INT REFERENCES staff(id) ON DELETE CASCADE,

    role VARCHAR(20),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);