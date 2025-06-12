
-- Create co_applicants table for storing co-applicant information (standalone table)
CREATE TABLE IF NOT EXISTS public.co_applicants (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text REFERENCES leads(id) ON DELETE CASCADE,
  name text NOT NULL,
  age integer,
  relationship text,
  phone_number text,
  email text,
  occupation text,
  monthly_income text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vehicle_details table for auto/vehicle loans
CREATE TABLE IF NOT EXISTS public.vehicle_details (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text REFERENCES leads(id) ON DELETE CASCADE,
  vehicle_brand_id text,
  vehicle_brand_name text,
  vehicle_model_id text,
  vehicle_model_name text,
  vehicle_type text,
  vehicle_year integer,
  vehicle_price text,
  down_payment text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create phone_numbers table for multiple phone numbers per lead
CREATE TABLE IF NOT EXISTS public.phone_numbers (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text REFERENCES leads(id) ON DELETE CASCADE,
  number text NOT NULL,
  type text NOT NULL DEFAULT 'mobile',
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Add text columns to leads table for additional references (not foreign keys due to type mismatch)
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS co_applicant_name text,
ADD COLUMN IF NOT EXISTS has_co_applicant boolean DEFAULT false;

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_co_applicants_lead_id ON co_applicants(lead_id);
CREATE INDEX IF NOT EXISTS idx_vehicle_details_lead_id ON vehicle_details(lead_id);
CREATE INDEX IF NOT EXISTS idx_phone_numbers_lead_id ON phone_numbers(lead_id);
CREATE INDEX IF NOT EXISTS idx_lead_addresses_lead_id ON lead_addresses(lead_id);

-- Ensure users table can be properly queried for authentication
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);
