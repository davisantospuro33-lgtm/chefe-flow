
-- Profile (single row id=1)
CREATE TABLE public.chefe_profile (
  id INTEGER PRIMARY KEY DEFAULT 1,
  username TEXT NOT NULL DEFAULT '@chefe.oficial',
  bio TEXT NOT NULL DEFAULT 'Barbeiro · Cortes autorais',
  avatar_url TEXT,
  cuts_count TEXT NOT NULL DEFAULT '1.2k',
  rating TEXT NOT NULL DEFAULT '4.9',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chefe_profile_singleton CHECK (id = 1)
);
GRANT SELECT, INSERT, UPDATE ON public.chefe_profile TO anon, authenticated;
GRANT ALL ON public.chefe_profile TO service_role;
ALTER TABLE public.chefe_profile ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read profile" ON public.chefe_profile FOR SELECT USING (true);
CREATE POLICY "public write profile" ON public.chefe_profile FOR INSERT WITH CHECK (true);
CREATE POLICY "public update profile" ON public.chefe_profile FOR UPDATE USING (true) WITH CHECK (true);
INSERT INTO public.chefe_profile (id) VALUES (1) ON CONFLICT DO NOTHING;

-- Reviews (max 3 enforced at app layer)
CREATE TABLE public.chefe_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  rating NUMERIC(2,1) NOT NULL DEFAULT 5,
  comment TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_reviews TO anon, authenticated;
GRANT ALL ON public.chefe_reviews TO service_role;
ALTER TABLE public.chefe_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read reviews" ON public.chefe_reviews FOR SELECT USING (true);
CREATE POLICY "public write reviews" ON public.chefe_reviews FOR INSERT WITH CHECK (true);
CREATE POLICY "public update reviews" ON public.chefe_reviews FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete reviews" ON public.chefe_reviews FOR DELETE USING (true);

-- Portfolio
CREATE TABLE public.chefe_portfolio (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  storage_path TEXT NOT NULL,
  url TEXT NOT NULL,
  position INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_portfolio TO anon, authenticated;
GRANT ALL ON public.chefe_portfolio TO service_role;
ALTER TABLE public.chefe_portfolio ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read portfolio" ON public.chefe_portfolio FOR SELECT USING (true);
CREATE POLICY "public write portfolio" ON public.chefe_portfolio FOR INSERT WITH CHECK (true);
CREATE POLICY "public update portfolio" ON public.chefe_portfolio FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete portfolio" ON public.chefe_portfolio FOR DELETE USING (true);

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_profile;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_reviews;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_portfolio;
