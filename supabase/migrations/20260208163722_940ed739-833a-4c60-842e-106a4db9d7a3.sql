-- Create banners table for home banner slider
CREATE TABLE public.banners (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT,
  image_url TEXT NOT NULL,
  display_order INTEGER NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  start_date DATE,
  end_date DATE,
  start_time TIME,
  end_time TIME,
  click_action_type TEXT NOT NULL DEFAULT 'none',
  click_action_value TEXT,
  image_fit_mode TEXT NOT NULL DEFAULT 'auto',
  auto_slide_interval INTEGER NOT NULL DEFAULT 5,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add constraint for valid click action types
ALTER TABLE public.banners ADD CONSTRAINT banners_click_action_type_check 
  CHECK (click_action_type IN ('none', 'product', 'category', 'offers', 'services', 'whatsapp', 'external'));

-- Add constraint for valid image fit modes
ALTER TABLE public.banners ADD CONSTRAINT banners_image_fit_mode_check 
  CHECK (image_fit_mode IN ('auto', 'cover', 'contain'));

-- Enable RLS
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- Admin can manage banners
CREATE POLICY "Admins can manage banners"
  ON public.banners
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Anyone can view active banners
CREATE POLICY "Anyone can view active banners"
  ON public.banners
  FOR SELECT
  USING (is_active = true);

-- Create function to check if banner is currently active
CREATE OR REPLACE FUNCTION public.is_banner_active(banner_row banners)
RETURNS boolean
LANGUAGE plpgsql
STABLE
SET search_path = public
AS $$
DECLARE
  current_date DATE := CURRENT_DATE;
  current_time TIME := CURRENT_TIME;
BEGIN
  IF NOT banner_row.is_active THEN
    RETURN false;
  END IF;
  
  IF banner_row.start_date IS NOT NULL AND current_date < banner_row.start_date THEN
    RETURN false;
  END IF;
  
  IF banner_row.end_date IS NOT NULL AND current_date > banner_row.end_date THEN
    RETURN false;
  END IF;
  
  IF banner_row.start_time IS NOT NULL AND banner_row.end_time IS NOT NULL THEN
    IF current_time < banner_row.start_time OR current_time > banner_row.end_time THEN
      RETURN false;
    END IF;
  END IF;
  
  RETURN true;
END;
$$;

-- Create trigger for updated_at
CREATE TRIGGER update_banners_updated_at
  BEFORE UPDATE ON public.banners
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();