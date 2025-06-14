
-- Insert Axis Bank
INSERT INTO public.banks (id, name, total_applications) 
VALUES ('axis-bank', 'Axis Bank', 0)
ON CONFLICT (id) DO NOTHING;

-- Insert Axis Bank branches
INSERT INTO public.bank_branches (name, location, bank_id) VALUES
('AGRA RAC', 'Agra', 'axis-bank'),
('ALLAHABAD RAC', 'Allahabad', 'axis-bank'),
('BAREILLY ASC', 'Bareilly', 'axis-bank'),
('BHOPAL RAC', 'Bhopal', 'axis-bank'),
('CHANDIGARH RAC', 'Chandigarh', 'axis-bank'),
('DEHRADUN RAC', 'Dehradun', 'axis-bank'),
('DELHI RAC', 'Delhi', 'axis-bank'),
('DELHI WEST ASC', 'Delhi West', 'axis-bank'),
('GHAZIABAD RAC', 'Ghaziabad', 'axis-bank'),
('GORAKHPUR ASC', 'Gorakhpur', 'axis-bank'),
('GURGAON RAC', 'Gurgaon', 'axis-bank'),
('JHANSI ASC', 'Jhansi', 'axis-bank'),
('KANPUR ASC', 'Kanpur', 'axis-bank'),
('KARNAL ASC', 'Karnal', 'axis-bank'),
('LUCKNOW RAC', 'Lucknow', 'axis-bank'),
('MATHURA', 'Mathura', 'axis-bank'),
('MEERUT ASC', 'Meerut', 'axis-bank'),
('MORADABAD ASC', 'Moradabad', 'axis-bank'),
('NOIDA RAC', 'Noida', 'axis-bank'),
('RUDRAPUR ASC', 'Rudrapur', 'axis-bank'),
('VARANASI ASC', 'Varanasi', 'axis-bank');

-- Insert Axis Bank products
INSERT INTO public.bank_products (name, description, bank_id) VALUES
('HOUSE LOAN', 'House Loan Product', 'axis-bank'),
('LOAN AGAINST PROPERTY', 'Loan Against Property Product', 'axis-bank'),
('EDUCATION LOAN', 'Education Loan Product', 'axis-bank'),
('PERSONAL LOAN', 'Personal Loan Product', 'axis-bank'),
('AUTO LOAN', 'Auto Loan Product', 'axis-bank'),
('TWO WHEELER', 'Two Wheeler Loan Product', 'axis-bank'),
('CVCE', 'CVCE Product', 'axis-bank'),
('BUSINESS LOAN', 'Business Loan Product', 'axis-bank'),
('WORKING CAPITAL', 'Working Capital Product', 'axis-bank'),
('SELLER', 'Seller Product', 'axis-bank'),
('UCL', 'UCL Product', 'axis-bank');
