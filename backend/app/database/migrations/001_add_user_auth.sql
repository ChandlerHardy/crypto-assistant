-- Migration 001: Add user authentication
-- This migration adds user authentication system with users table and foreign key to portfolios

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    hashed_password VARCHAR(255) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP NULL
);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Add user_id column to portfolios table (with foreign key constraint for PostgreSQL)
-- Note: For PostgreSQL in production, this should be run as a proper migration
ALTER TABLE portfolios ADD COLUMN user_id VARCHAR(36);

-- For PostgreSQL, add foreign key constraint
-- ALTER TABLE portfolios ADD CONSTRAINT fk_portfolios_user_id FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE;

-- Update portfolios.updated_at trigger for PostgreSQL (if needed)
-- CREATE OR REPLACE FUNCTION update_updated_at_column()
-- RETURNS TRIGGER AS $$
-- BEGIN
--     NEW.updated_at = CURRENT_TIMESTAMP;
--     RETURN NEW;
-- END;
-- $$ language 'plpgsql';
--
-- CREATE TRIGGER update_portfolios_updated_at BEFORE UPDATE ON portfolios FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();
-- CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();