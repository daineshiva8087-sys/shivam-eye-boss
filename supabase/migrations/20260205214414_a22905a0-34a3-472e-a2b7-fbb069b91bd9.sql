-- First, alter the category column from enum to text to allow custom categories
ALTER TABLE public.products 
ALTER COLUMN category TYPE text;

-- Drop the enum type since we're switching to text
DROP TYPE IF EXISTS public.product_category;