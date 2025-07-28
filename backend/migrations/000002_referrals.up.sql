CREATE TABLE referrals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    referral_code VARCHAR(50),
    invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT now()
);
CREATE INDEX idx_referrals_user_id ON referrals(user_id);
