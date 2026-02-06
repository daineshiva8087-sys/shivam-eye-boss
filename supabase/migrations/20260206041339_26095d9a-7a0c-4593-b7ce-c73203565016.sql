-- Create service_charges table
CREATE TABLE public.service_charges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create product_images table for multiple images per product
CREATE TABLE public.product_images (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.service_charges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;

-- Service charges policies
CREATE POLICY "Anyone can view active service charges"
  ON public.service_charges FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage service charges"
  ON public.service_charges FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Product images policies
CREATE POLICY "Anyone can view product images"
  ON public.product_images FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage product images"
  ON public.product_images FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- Add triggers for updated_at
CREATE TRIGGER update_service_charges_updated_at
  BEFORE UPDATE ON public.service_charges
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default service charges
INSERT INTO public.service_charges (name, description, price) VALUES
  ('Camera Installation', 'Professional installation of CCTV cameras including mounting and configuration', 500),
  ('Wiring Charges', 'Complete wiring setup for CCTV system including cable laying and concealing', 300),
  ('Repairing Charges', 'Repair and maintenance service for existing CCTV systems', 400);