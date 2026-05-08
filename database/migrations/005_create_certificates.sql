CREATE TABLE certificates (

    id SERIAL PRIMARY KEY,

    application_id INT NOT NULL,

    certificate_number VARCHAR(50) UNIQUE,

    file_path TEXT NOT NULL,

    generated_by INT,

    generated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_application
        FOREIGN KEY(application_id)
        REFERENCES applications(id)
        ON DELETE CASCADE,

    CONSTRAINT fk_generated_by
        FOREIGN KEY(generated_by)
        REFERENCES staff(id)
        ON DELETE SET NULL
);