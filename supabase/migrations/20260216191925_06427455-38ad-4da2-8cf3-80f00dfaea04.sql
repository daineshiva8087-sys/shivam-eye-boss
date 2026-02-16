
CREATE TABLE public.announcement_settings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  is_enabled BOOLEAN NOT NULL DEFAULT true,
  text TEXT NOT NULL DEFAULT 'शिवम CCTV मध्ये आपले स्वागत आहे | 2016 पासून जळनेकरांच्या सेवेत',
  bg_color TEXT NOT NULL DEFAULT '#FFD400',
  text_color TEXT NOT NULL DEFAULT '#D90000',
  scroll_speed TEXT NOT NULL DEFAULT 'normal',
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.announcement_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view announcement settings"
ON public.announcement_settings FOR SELECT
USING (true);

CREATE POLICY "Admins can manage announcement settings"
ON public.announcement_settings FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Insert default row
INSERT INTO public.announcement_settings (is_enabled, text, bg_color, text_color, scroll_speed)
VALUES (true, 'शिवम CCTV मध्ये आपले स्वागत आहे | 2016 पासून जळनेकरांच्या सेवेत', '#FFD400', '#D90000', 'normal');
