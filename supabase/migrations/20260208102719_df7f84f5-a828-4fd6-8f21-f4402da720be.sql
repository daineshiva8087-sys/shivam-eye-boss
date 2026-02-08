-- Add new columns to offers table for promo code and scheduling
ALTER TABLE public.offers 
ADD COLUMN IF NOT EXISTS promo_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS discount_type TEXT CHECK (discount_type IN ('flat', 'percentage')),
ADD COLUMN IF NOT EXISTS discount_value NUMERIC DEFAULT 0,
ADD COLUMN IF NOT EXISTS start_date DATE,
ADD COLUMN IF NOT EXISTS end_date DATE,
ADD COLUMN IF NOT EXISTS start_time TIME,
ADD COLUMN IF NOT EXISTS end_time TIME,
ADD COLUMN IF NOT EXISTS show_popup BOOLEAN DEFAULT false;

-- Create function to check if offer is currently active based on schedule
CREATE OR REPLACE FUNCTION public.is_offer_active(offer_row offers)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  current_time TIME := CURRENT_TIME;
BEGIN
  -- If offer is manually disabled, return false
  IF NOT offer_row.is_active THEN
    RETURN false;
  END IF;
  
  -- Check date range if specified
  IF offer_row.start_date IS NOT NULL AND current_date < offer_row.start_date THEN
    RETURN false;
  END IF;
  
  IF offer_row.end_date IS NOT NULL AND current_date > offer_row.end_date THEN
    RETURN false;
  END IF;
  
  -- Check time range if specified (only on valid dates)
  IF offer_row.start_time IS NOT NULL AND offer_row.end_time IS NOT NULL THEN
    IF current_time < offer_row.start_time OR current_time > offer_row.end_time THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create function to validate promo code
CREATE OR REPLACE FUNCTION public.validate_promo_code(code TEXT)
RETURNS TABLE (
  offer_id UUID,
  offer_title TEXT,
  discount_type TEXT,
  discount_value NUMERIC,
  is_valid BOOLEAN
)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    o.id,
    o.title,
    o.discount_type,
    o.discount_value,
    public.is_offer_active(o) as is_valid
  FROM public.offers o
  WHERE o.promo_code = code
  LIMIT 1;
END;
$$;