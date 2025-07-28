-- Remove public_id UUID columns from major entities
ALTER TABLE users DROP COLUMN IF EXISTS public_id;
ALTER TABLE posts DROP COLUMN IF EXISTS public_id;
ALTER TABLE media DROP COLUMN IF EXISTS public_id;
ALTER TABLE model_profiles DROP COLUMN IF EXISTS public_id; 