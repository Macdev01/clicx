-- Add public_id UUID columns to major entities for external API use
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

ALTER TABLE users
    ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE;

ALTER TABLE posts
    ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE;

ALTER TABLE media
    ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE;

ALTER TABLE model_profiles
    ADD COLUMN public_id UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE; 