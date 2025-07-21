-- Drop tables in reverse order to avoid foreign key constraint issues
DROP TABLE IF EXISTS logs;
DROP TABLE IF EXISTS referrals;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS follows;
DROP TABLE IF EXISTS saved_posts;
DROP TABLE IF EXISTS purchases;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS likes;
DROP TABLE IF EXISTS comments;
DROP TABLE IF EXISTS media;
DROP TABLE IF EXISTS posts;
DROP TABLE IF EXISTS model_profiles;
DROP TABLE IF EXISTS users;

DROP EXTENSION IF EXISTS "uuid-ossp";
