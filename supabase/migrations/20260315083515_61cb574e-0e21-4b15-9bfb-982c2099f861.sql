
CREATE TABLE public.site_visits (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  visitor_id text NOT NULL,
  visited_at timestamp with time zone NOT NULL DEFAULT now(),
  page_path text DEFAULT '/'
);

ALTER TABLE public.site_visits ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can insert visits" ON public.site_visits
  FOR INSERT TO public WITH CHECK (true);

CREATE POLICY "Admins can read visits" ON public.site_visits
  FOR SELECT TO public USING (has_role(auth.uid(), 'admin'::app_role));

CREATE INDEX idx_site_visits_visited_at ON public.site_visits (visited_at);
CREATE INDEX idx_site_visits_visitor_id ON public.site_visits (visitor_id);
