
-- Create enquiries table for centralized lead tracking
CREATE TABLE public.enquiries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  customer_name TEXT NOT NULL,
  customer_phone TEXT NOT NULL,
  customer_email TEXT,
  message TEXT,
  page_name TEXT NOT NULL DEFAULT 'unknown',
  source_type TEXT NOT NULL DEFAULT 'general',
  is_read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.enquiries ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage enquiries"
ON public.enquiries
FOR ALL
USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Anyone can insert (for form submissions)
CREATE POLICY "Anyone can create enquiries"
ON public.enquiries
FOR INSERT
WITH CHECK (true);

-- Enable realtime for instant admin notifications
ALTER PUBLICATION supabase_realtime ADD TABLE public.enquiries;
