CREATE TABLE notifications (

    id SERIAL PRIMARY KEY,

    user_id INT NOT NULL,

    title VARCHAR(255),

    message TEXT,

    type VARCHAR(50),

    is_read BOOLEAN DEFAULT FALSE,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_user_notification
        FOREIGN KEY(user_id)
        REFERENCES users(id)
        ON DELETE CASCADE
);