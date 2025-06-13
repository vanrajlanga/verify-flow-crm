
-- First, let's see what roles currently exist in the users table
-- and update the constraint to include all possible roles
ALTER TABLE public.users DROP CONSTRAINT IF EXISTS users_role_check;

-- Add a more permissive constraint that includes all possible roles
ALTER TABLE public.users ADD CONSTRAINT users_role_check 
  CHECK (role IN ('admin', 'agent', 'tvtteam', 'user', 'tvt', 'manager', 'supervisor'));

-- Insert banks with only the existing columns (id, name, total_applications)
INSERT INTO public.banks (id, name, total_applications) 
VALUES 
  ('hdfc', 'HDFC', 0),
  ('icici', 'ICICI', 0),
  ('axis', 'AXIS', 0),
  ('sbi', 'SBI', 0),
  ('kotak', 'Kotak Mahindra Bank', 0),
  ('pnb', 'Punjab National Bank', 0),
  ('bob', 'Bank of Baroda', 0),
  ('canara', 'Canara Bank', 0),
  ('union', 'Union Bank of India', 0),
  ('indian', 'Indian Bank', 0)
ON CONFLICT (id) DO NOTHING;

-- Update the leads table status constraint to match what the form sends
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_status_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_status_check 
  CHECK (status IN ('Pending', 'In Progress', 'Completed', 'Rejected'));

-- Update the leads table visit_type constraint to match what the form sends  
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_visit_type_check;
ALTER TABLE public.leads ADD CONSTRAINT leads_visit_type_check 
  CHECK (visit_type IN ('Residence', 'Office', 'Both'));

-- Make sure the bank_id column in leads table can accept string values that match bank names
ALTER TABLE public.leads ALTER COLUMN bank_id TYPE TEXT;

-- Remove the foreign key constraint to be more flexible with bank names
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_bank_id_fkey;

-- Add some sample users to ensure assigned_to references work
INSERT INTO public.users (id, name, email, password, role, phone, district, state, city, status)
VALUES 
  ('agent-1', 'John Agent', 'john.agent@example.com', 'password123', 'agent', '9876543210', 'Mumbai', 'Maharashtra', 'Mumbai', 'active'),
  ('agent-2', 'Sarah Agent', 'sarah.agent@example.com', 'password123', 'agent', '9876543211', 'Bangalore Urban', 'Karnataka', 'Bangalore', 'active'),
  ('tvt-1', 'Mike TVT', 'mike.tvt@example.com', 'password123', 'tvtteam', '9876543212', 'Mumbai', 'Maharashtra', 'Mumbai', 'active')
ON CONFLICT (id) DO NOTHING;
