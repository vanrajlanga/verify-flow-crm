
-- Add missing fields to additional_details table
ALTER TABLE additional_details 
ADD COLUMN father_name text,
ADD COLUMN mother_name text,
ADD COLUMN gender text;

-- Add bank_product field to additional_details table if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'additional_details' 
        AND column_name = 'bank_product'
    ) THEN
        ALTER TABLE additional_details ADD COLUMN bank_product text;
    END IF;
END $$;
