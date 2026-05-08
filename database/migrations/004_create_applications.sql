CREATE TABLE applications (

    id SERIAL PRIMARY KEY,

    application_number VARCHAR(50) UNIQUE NOT NULL,

    student_id INT NOT NULL,

    certificate_type VARCHAR(100) NOT NULL,

    status VARCHAR(50) DEFAULT 'pending',

    remarks TEXT,

    approved_by INT,

    approved_at TIMESTAMP,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student
        FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_staff
        FOREIGN KEY(approved_by)
        REFERENCES staff(id)
        ON DELETE SET NULL
);