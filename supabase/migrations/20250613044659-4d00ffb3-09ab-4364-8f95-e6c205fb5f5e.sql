
-- Create banks table (enhanced from existing)
CREATE TABLE IF NOT EXISTS public.bank_products (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  description text,
  bank_id text NOT NULL REFERENCES public.banks(id),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create bank_branches table
CREATE TABLE IF NOT EXISTS public.bank_branches (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  location text NOT NULL,
  bank_id text NOT NULL REFERENCES public.banks(id),
  address text,
  phone text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Insert default banks (if they don't exist)
INSERT INTO public.banks (id, name, total_applications) 
VALUES 
  ('hdfc', 'HDFC', 0),
  ('icici', 'ICICI', 0),
  ('axis', 'AXIS', 0),
  ('sbi', 'SBI', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert default branches for each bank
INSERT INTO public.bank_branches (name, location, bank_id) 
VALUES 
  ('HDFC Rajkot', 'Rajkot', 'hdfc'),
  ('HDFC Ahmedabad', 'Ahmedabad', 'hdfc'),
  ('HDFC Delhi', 'Delhi', 'hdfc'),
  ('ICICI Rajkot', 'Rajkot', 'icici'),
  ('ICICI Ahmedabad', 'Ahmedabad', 'icici'),
  ('ICICI Delhi', 'Delhi', 'icici'),
  ('AXIS Rajkot', 'Rajkot', 'axis'),
  ('AXIS Ahmedabad', 'Ahmedabad', 'axis'),
  ('AXIS Delhi', 'Delhi', 'axis'),
  ('SBI Rajkot', 'Rajkot', 'sbi'),
  ('SBI Ahmedabad', 'Ahmedabad', 'sbi'),
  ('SBI Delhi', 'Delhi', 'sbi');

-- Insert default bank products for each bank
INSERT INTO public.bank_products (name, bank_id) 
VALUES 
  ('PERSONAL LOAN', 'hdfc'),
  ('AUTO LOAN', 'hdfc'),
  ('PROPERTY LOAN', 'hdfc'),
  ('CREDIT CARD', 'hdfc'),
  ('PERSONAL LOAN', 'icici'),
  ('AUTO LOAN', 'icici'),
  ('PROPERTY LOAN', 'icici'),
  ('CREDIT CARD', 'icici'),
  ('PERSONAL LOAN', 'axis'),
  ('AUTO LOAN', 'axis'),
  ('PROPERTY LOAN', 'axis'),
  ('CREDIT CARD', 'axis'),
  ('PERSONAL LOAN', 'sbi'),
  ('AUTO LOAN', 'sbi'),
  ('PROPERTY LOAN', 'sbi'),
  ('CREDIT CARD', 'sbi');
