
-- Add manager functionality to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS managed_bank_id text;

-- Add a foreign key reference to banks table for managers
-- (Note: We're not creating actual FK constraint to avoid issues with existing data)

-- Update existing users table to support manager role
-- The managed_bank_id will be null for non-manager users
