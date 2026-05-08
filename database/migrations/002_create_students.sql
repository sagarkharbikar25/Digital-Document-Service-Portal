CREATE TABLE students (

    id SERIAL PRIMARY KEY,

    user_id INT UNIQUE NOT NULL,

    roll_number VARCHAR(50),

    department VARCHAR(100),

    year VARCHAR(20),

    phone VARCHAR(20),

    dob DATE,

    address TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);