
-- Create property_types table
CREATE TABLE IF NOT EXISTS public.property_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vehicle_brands table
CREATE TABLE IF NOT EXISTS public.vehicle_brands (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vehicle_types table
CREATE TABLE IF NOT EXISTS public.vehicle_types (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create vehicle_models table
CREATE TABLE IF NOT EXISTS public.vehicle_models (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create lead_documents table for document uploads
CREATE TABLE IF NOT EXISTS public.lead_documents (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text NOT NULL,
  document_type text NOT NULL,
  document_name text NOT NULL,
  document_url text NOT NULL,
  uploaded_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create lead_addresses table for multiple addresses
CREATE TABLE IF NOT EXISTS public.lead_addresses (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lead_id text,
  address_type text NOT NULL DEFAULT 'residence',
  street text,
  city text,
  district text,
  state text,
  pincode text,
  requires_verification boolean DEFAULT false,
  assigned_agent_id text,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create storage bucket for documents
INSERT INTO storage.buckets (id, name, public) 
VALUES ('lead-documents', 'lead-documents', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for lead documents
CREATE POLICY "Allow public access to lead documents"
ON storage.objects FOR SELECT
USING (bucket_id = 'lead-documents');

CREATE POLICY "Allow authenticated users to upload lead documents"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'lead-documents');

CREATE POLICY "Allow authenticated users to delete lead documents"
ON storage.objects FOR DELETE
USING (bucket_id = 'lead-documents');

-- Insert default property types
INSERT INTO public.property_types (name) 
VALUES 
  ('Apartment'),
  ('Flat'),
  ('Tenament'),
  ('Bungalow'),
  ('Villa')
ON CONFLICT (name) DO NOTHING;

-- Insert default vehicle brands
INSERT INTO public.vehicle_brands (name) 
VALUES 
  ('TATA'),
  ('KIA'),
  ('HERO HONDA'),
  ('MARUTI SUZUKI')
ON CONFLICT (name) DO NOTHING;

-- Insert default vehicle types
INSERT INTO public.vehicle_types (name) 
VALUES 
  ('SUV'),
  ('XUV'),
  ('SEDAN'),
  ('COMMERCIAL'),
  ('BIKE')
ON CONFLICT (name) DO NOTHING;

-- Insert default vehicle models
INSERT INTO public.vehicle_models (name) 
VALUES 
  ('SX'),
  ('TX'),
  ('VX'),
  ('MX')
ON CONFLICT (name) DO NOTHING;
