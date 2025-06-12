
-- First, drop the existing check constraint on the role column
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add a new check constraint that includes 'tvt'
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('admin', 'agent', 'tvt'));

-- Now insert the TVT users
INSERT INTO users (id, name, email, password, role, status, created_at) VALUES
('tvt-user-1', 'Atul TVT', 'atul@demo.com', '123456', 'tvt', 'Active', now()),
('tvt-user-2', 'Ajay TVT', 'ajay@demo.com', '123456', 'tvt', 'Active', now()),
('tvt-user-3', 'Shivam TVT', 'shivam@demo.com', '123456', 'tvt', 'Active', now()),
('tvt-user-4', 'Raj TVT', 'raj@demo.com', '123456', 'tvt', 'Active', now());

-- Create a table to store field-level verifications
CREATE TABLE field_verifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  lead_id text NOT NULL,
  field_name text NOT NULL,
  is_verified boolean DEFAULT false,
  verified_by text,
  verified_at timestamp with time zone,
  verification_notes text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  UNIQUE(lead_id, field_name)
);

-- Enable RLS on field_verifications
ALTER TABLE field_verifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for field_verifications
CREATE POLICY "TVT and admin can view field verifications" ON field_verifications
  FOR SELECT USING (true);

CREATE POLICY "TVT and admin can insert field verifications" ON field_verifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "TVT and admin can update field verifications" ON field_verifications
  FOR UPDATE USING (true);
