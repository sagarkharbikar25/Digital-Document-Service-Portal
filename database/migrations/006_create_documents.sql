CREATE TABLE documents (

    id SERIAL PRIMARY KEY,

    student_id INT NOT NULL,

    document_type VARCHAR(100),

    file_name VARCHAR(255),

    file_path TEXT NOT NULL,

    status VARCHAR(50) DEFAULT 'uploaded',

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_student_doc
        FOREIGN KEY(student_id)
        REFERENCES students(id)
        ON DELETE CASCADE
);