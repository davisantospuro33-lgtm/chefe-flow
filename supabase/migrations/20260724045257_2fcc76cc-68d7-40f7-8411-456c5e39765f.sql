
CREATE TABLE public.chefe_stories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  media_url TEXT NOT NULL,
  media_type TEXT NOT NULL DEFAULT 'image' CHECK (media_type IN ('image','video')),
  storage_path TEXT,
  caption TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + interval '24 hours')
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_stories TO anon, authenticated;
GRANT ALL ON public.chefe_stories TO service_role;
ALTER TABLE public.chefe_stories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read stories" ON public.chefe_stories FOR SELECT USING (true);
CREATE POLICY "public write stories" ON public.chefe_stories FOR INSERT WITH CHECK (true);
CREATE POLICY "public update stories" ON public.chefe_stories FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete stories" ON public.chefe_stories FOR DELETE USING (true);

CREATE TABLE public.chefe_highlights (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  cover_image TEXT,
  story_ids UUID[] NOT NULL DEFAULT '{}',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_highlights TO anon, authenticated;
GRANT ALL ON public.chefe_highlights TO service_role;
ALTER TABLE public.chefe_highlights ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read highlights" ON public.chefe_highlights FOR SELECT USING (true);
CREATE POLICY "public write highlights" ON public.chefe_highlights FOR INSERT WITH CHECK (true);
CREATE POLICY "public update highlights" ON public.chefe_highlights FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete highlights" ON public.chefe_highlights FOR DELETE USING (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_stories;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_highlights;
