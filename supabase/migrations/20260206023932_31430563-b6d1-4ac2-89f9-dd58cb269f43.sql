-- Add discount fields to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS discount_percentage numeric DEFAULT 0,
ADD COLUMN IF NOT EXISTS discounted_price numeric GENERATED ALWAYS AS (
  CASE WHEN discount_percentage > 0 THEN price * (1 - discount_percentage / 100) ELSE price END
) STORED;

-- Create offers table for banners
CREATE TABLE public.offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT,
  banner_image_url TEXT,
  highlight_text TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on offers
ALTER TABLE public.offers ENABLE ROW LEVEL SECURITY;

-- Offers policies
CREATE POLICY "Anyone can view active offers" ON public.offers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage offers" ON public.offers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create combo_offers table
CREATE TABLE public.combo_offers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  original_price numeric NOT NULL DEFAULT 0,
  combo_price numeric NOT NULL DEFAULT 0,
  discount_percentage numeric GENERATED ALWAYS AS (
    CASE WHEN original_price > 0 THEN ((original_price - combo_price) / original_price * 100) ELSE 0 END
  ) STORED,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on combo_offers
ALTER TABLE public.combo_offers ENABLE ROW LEVEL SECURITY;

-- Combo offers policies
CREATE POLICY "Anyone can view active combos" ON public.combo_offers
FOR SELECT USING (is_active = true);

CREATE POLICY "Admins can manage combos" ON public.combo_offers
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create combo_products junction table
CREATE TABLE public.combo_products (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  combo_id UUID NOT NULL REFERENCES public.combo_offers(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity INTEGER NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on combo_products
ALTER TABLE public.combo_products ENABLE ROW LEVEL SECURITY;

-- Combo products policies
CREATE POLICY "Anyone can view combo products" ON public.combo_products
FOR SELECT USING (true);

CREATE POLICY "Admins can manage combo products" ON public.combo_products
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create quotations table
CREATE TABLE public.quotations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_number TEXT NOT NULL UNIQUE,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  customer_address TEXT,
  subtotal numeric NOT NULL DEFAULT 0,
  discount_amount numeric NOT NULL DEFAULT 0,
  discount_percentage numeric NOT NULL DEFAULT 0,
  total_amount numeric NOT NULL DEFAULT 0,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'draft',
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotations
ALTER TABLE public.quotations ENABLE ROW LEVEL SECURITY;

-- Quotations policies
CREATE POLICY "Admins can manage quotations" ON public.quotations
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create quotation_items table
CREATE TABLE public.quotation_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  quotation_id UUID NOT NULL REFERENCES public.quotations(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  combo_id UUID REFERENCES public.combo_offers(id),
  item_name TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit_price numeric NOT NULL DEFAULT 0,
  discount_percentage numeric NOT NULL DEFAULT 0,
  total_price numeric NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on quotation_items
ALTER TABLE public.quotation_items ENABLE ROW LEVEL SECURITY;

-- Quotation items policies
CREATE POLICY "Admins can manage quotation items" ON public.quotation_items
FOR ALL USING (has_role(auth.uid(), 'admin'::app_role));

-- Create function to generate quotation number
CREATE OR REPLACE FUNCTION public.generate_quotation_number()
RETURNS TEXT
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  new_number TEXT;
  year_prefix TEXT;
  sequence_num INTEGER;
BEGIN
  year_prefix := TO_CHAR(NOW(), 'YYYY');
  
  SELECT COALESCE(MAX(CAST(SUBSTRING(quotation_number FROM 6) AS INTEGER)), 0) + 1
  INTO sequence_num
  FROM public.quotations
  WHERE quotation_number LIKE 'SC' || year_prefix || '%';
  
  new_number := 'SC' || year_prefix || LPAD(sequence_num::TEXT, 4, '0');
  
  RETURN new_number;
END;
$$;

-- Create trigger for updated_at on new tables
CREATE TRIGGER update_offers_updated_at
BEFORE UPDATE ON public.offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_combo_offers_updated_at
BEFORE UPDATE ON public.combo_offers
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_quotations_updated_at
BEFORE UPDATE ON public.quotations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();