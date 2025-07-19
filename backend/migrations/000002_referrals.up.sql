CREATE TABLE referrals (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50),
    invited_user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_referrals_user_id ON referrals(user_id);
