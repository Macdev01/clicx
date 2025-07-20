CREATE TABLE logs (
    id SERIAL PRIMARY KEY,
    level VARCHAR(20),
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);
