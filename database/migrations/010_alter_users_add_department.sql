-- ============================================================
-- Migration 010: Add department column to users table
-- Enables clerk & HOD to be scoped to a specific branch.
-- Principal has department = NULL → sees all branches.
-- ============================================================

ALTER TABLE users
    ADD COLUMN IF NOT EXISTS department VARCHAR(100) DEFAULT NULL;

-- Set departments for existing admin users
-- Update these emails to match your actual admin accounts
UPDATE users SET department = 'Computer Science and Engineering'
    WHERE email = 'saar@jdcoem.ac.in'  AND role = 'clerk';

UPDATE users SET department = 'Computer Science and Engineering'
    WHERE email = 'skhod@jdcoem.ac.in' AND role = 'hod';

-- Principal: department stays NULL (sees all branches)
-- UPDATE users SET department = NULL WHERE role = 'principal';

-- ── How to add a new clerk/HOD for another branch ───────────
-- INSERT INTO users (name, email, password, role, department)
-- VALUES ('MECH Clerk', 'mech-clerk@jdcoem.ac.in', '$2y$...', 'clerk', 'Mechanical Engineering');
--
-- INSERT INTO users (name, email, password, role, department)
-- VALUES ('MECH HOD', 'mech-hod@jdcoem.ac.in',   '$2y$...', 'hod',   'Mechanical Engineering');
-- ─────────────────────────────────────────────────────────────

-- Verify
SELECT id, name, email, role, department FROM users WHERE role IN ('clerk','hod','principal');