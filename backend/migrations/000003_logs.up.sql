CREATE TABLE logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    level VARCHAR(20),
    message TEXT,
    created_at TIMESTAMP DEFAULT now()
);
