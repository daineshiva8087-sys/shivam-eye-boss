
-- Add Hindi and English text columns
ALTER TABLE public.announcement_settings
  ADD COLUMN text_hi text NOT NULL DEFAULT 'शिवम CCTV में आपका स्वागत है | 2016 से जालना की सेवा में',
  ADD COLUMN text_en text NOT NULL DEFAULT 'Welcome to Shivam CCTV | Serving Jalna since 2016';

-- Rename existing text column to text_mr for clarity
ALTER TABLE public.announcement_settings RENAME COLUMN text TO text_mr;
