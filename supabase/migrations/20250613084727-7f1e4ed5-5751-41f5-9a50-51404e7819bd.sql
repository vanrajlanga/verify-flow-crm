
-- Insert 5 dummy leads with all required details using proper data types
-- First, insert addresses for the leads with proper UUID format
INSERT INTO public.addresses (id, type, street, city, district, state, pincode)
VALUES 
  (gen_random_uuid(), 'Residence', '123 MG Road', 'Mumbai', 'Mumbai', 'Maharashtra', '400001'),
  (gen_random_uuid(), 'Residence', '456 Brigade Road', 'Bangalore', 'Bangalore Urban', 'Karnataka', '560001'),
  (gen_random_uuid(), 'Residence', '789 Park Street', 'Kolkata', 'Kolkata', 'West Bengal', '700016'),
  (gen_random_uuid(), 'Residence', '321 Civil Lines', 'Delhi', 'New Delhi', 'Delhi', '110001'),
  (gen_random_uuid(), 'Residence', '654 Anna Salai', 'Chennai', 'Chennai', 'Tamil Nadu', '600002');

-- Get the address IDs for reference and insert leads with proper timestamp casting
WITH address_refs AS (
  SELECT id, street FROM addresses 
  WHERE street IN ('123 MG Road', '456 Brigade Road', '789 Park Street', '321 Civil Lines', '654 Anna Salai')
)
INSERT INTO public.leads (id, name, age, job, address_id, status, bank_id, visit_type, assigned_to, verification_date, instructions, has_co_applicant, co_applicant_name)
SELECT 
  'LEAD-001', 'Rajesh Kumar', 35, 'Software Engineer', ar.id, 'Pending', 'hdfc', 'Residence', 'agent-1', TIMESTAMP '2025-06-15 10:00:00+00', 'Home loan verification required', true, 'Priya Kumar'
FROM address_refs ar WHERE ar.street = '123 MG Road'
UNION ALL
SELECT 
  'LEAD-002', 'Anjali Sharma', 28, 'Marketing Manager', ar.id, 'In Progress', 'icici', 'Office', 'agent-2', TIMESTAMP '2025-06-16 14:00:00+00', 'Vehicle loan verification', false, null
FROM address_refs ar WHERE ar.street = '456 Brigade Road'
UNION ALL
SELECT 
  'LEAD-003', 'Vikash Singh', 42, 'Business Owner', ar.id, 'Completed', 'axis', 'Both', 'tvt-1', TIMESTAMP '2025-06-14 09:00:00+00', 'Business loan completed verification', true, 'Sunita Singh'
FROM address_refs ar WHERE ar.street = '789 Park Street'
UNION ALL
SELECT 
  'LEAD-004', 'Meera Patel', 31, 'Doctor', ar.id, 'Rejected', 'sbi', 'Residence', 'agent-1', TIMESTAMP '2025-06-17 11:00:00+00', 'Personal loan - documents incomplete', false, null
FROM address_refs ar WHERE ar.street = '321 Civil Lines'
UNION ALL
SELECT 
  'LEAD-005', 'Arjun Reddy', 29, 'Teacher', ar.id, 'Pending', 'kotak', 'Residence', 'agent-2', TIMESTAMP '2025-06-18 15:00:00+00', 'Education loan verification needed', false, null
FROM address_refs ar WHERE ar.street = '654 Anna Salai';

-- Insert additional details for each lead
INSERT INTO public.additional_details (lead_id, company, designation, work_experience, property_type, ownership_status, property_age, monthly_income, annual_income, other_income, phone_number, email, date_of_birth, agency_file_no, application_barcode, case_id, scheme_desc, bank_branch, additional_comments, lead_type, lead_type_id, loan_amount, loan_type, vehicle_brand_name, vehicle_brand_id, vehicle_model_name, vehicle_model_id)
VALUES 
  ('LEAD-001', 'TechCorp India', 'Senior Software Engineer', '8 years', 'Apartment', 'Owned', '5 years', '85000', '1020000', '50000', '9876543210', 'rajesh.kumar@email.com', '1989-03-15', 'AGF001', 'BC12345', 'CASE001', 'Home Loan Scheme', 'HDFC Bandra', 'Excellent credit history', 'Home Loan', 'HL001', '5000000', 'Home Loan', null, null, null, null),
  ('LEAD-002', 'AdCorp Solutions', 'Marketing Manager', '5 years', 'Independent House', 'Rented', 'New', '65000', '780000', '20000', '9876543211', 'anjali.sharma@email.com', '1996-07-22', 'AGF002', 'BC12346', 'CASE002', 'Vehicle Loan Scheme', 'ICICI Koramangala', 'First time vehicle buyer', 'Vehicle Loan', 'VL001', '800000', 'Vehicle Loan', 'Honda', 'VB001', 'City', 'VM001'),
  ('LEAD-003', 'Singh Enterprises', 'Managing Director', '15 years', 'Commercial', 'Owned', '10 years', '150000', '1800000', '200000', '9876543212', 'vikash.singh@email.com', '1982-11-08', 'AGF003', 'BC12347', 'CASE003', 'Business Loan Scheme', 'AXIS Salt Lake', 'Established business with good turnover', 'Business Loan', 'BL001', '2000000', 'Business Loan', null, null, null, null),
  ('LEAD-004', 'City Hospital', 'Consultant Doctor', '7 years', 'Apartment', 'Owned', '3 years', '120000', '1440000', '80000', '9876543213', 'meera.patel@email.com', '1993-05-12', 'AGF004', 'BC12348', 'CASE004', 'Personal Loan Scheme', 'SBI Connaught Place', 'Documents need verification', 'Personal Loan', 'PL001', '500000', 'Personal Loan', null, null, null, null),
  ('LEAD-005', 'St. Johns School', 'Mathematics Teacher', '6 years', 'Independent House', 'Family Owned', '15 years', '45000', '540000', '15000', '9876543214', 'arjun.reddy@email.com', '1995-09-18', 'AGF005', 'BC12349', 'CASE005', 'Education Loan Scheme', 'Kotak T Nagar', 'Higher education loan for masters', 'Education Loan', 'EL001', '300000', 'Education Loan', null, null, null, null);

-- Insert verifications for some leads
INSERT INTO public.verifications (lead_id, status, agent_id, notes)
VALUES 
  ('LEAD-001', 'Not Started', 'agent-1', 'Scheduled for tomorrow'),
  ('LEAD-002', 'In Progress', 'agent-2', 'Currently at office location'),
  ('LEAD-003', 'Completed', 'tvt-1', 'All documents verified successfully'),
  ('LEAD-004', 'Rejected', 'agent-1', 'Incomplete documentation provided'),
  ('LEAD-005', 'Not Started', 'agent-2', 'Waiting for customer confirmation');

-- Insert co-applicant for leads that have them
INSERT INTO public.co_applicants (lead_id, name, age, phone_number, email, relationship, occupation, monthly_income)
VALUES 
  ('LEAD-001', 'Priya Kumar', 32, '9876543220', 'priya.kumar@email.com', 'Spouse', 'HR Manager', '60000'),
  ('LEAD-003', 'Sunita Singh', 38, '9876543222', 'sunita.singh@email.com', 'Spouse', 'Accountant', '45000');
