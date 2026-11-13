CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    user_id INT,
    action VARCHAR(255),
    entity_type VARCHAR(50),
    entity_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);