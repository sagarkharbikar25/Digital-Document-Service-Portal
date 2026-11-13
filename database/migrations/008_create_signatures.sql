CREATE TABLE signatures (

    id SERIAL PRIMARY KEY,

    staff_id INT NOT NULL,

    file_path TEXT NOT NULL,

    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_staff_signature
        FOREIGN KEY(staff_id)
        REFERENCES staff(id)
        ON DELETE CASCADE
);