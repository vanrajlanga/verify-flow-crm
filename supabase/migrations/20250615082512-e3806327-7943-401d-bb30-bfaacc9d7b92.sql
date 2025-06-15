
-- Drop the current constraint for visit_type
ALTER TABLE public.leads DROP CONSTRAINT IF EXISTS leads_visit_type_check;

-- Add a new constraint to allow the values Physical and Virtual (and any others you might need)
ALTER TABLE public.leads ADD CONSTRAINT leads_visit_type_check 
  CHECK (visit_type IN ('Physical', 'Virtual', 'Residence', 'Office', 'Both'));
