ALTER TABLE public.chefe_highlights ALTER COLUMN title DROP NOT NULL;
ALTER TABLE public.chefe_highlights ALTER COLUMN title SET DEFAULT '';

CREATE TABLE public.chefe_highlight_media (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  highlight_id uuid NOT NULL REFERENCES public.chefe_highlights(id) ON DELETE CASCADE,
  url text NOT NULL,
  media_type text NOT NULL DEFAULT 'image',
  storage_path text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_highlight_media TO anon, authenticated;
GRANT ALL ON public.chefe_highlight_media TO service_role;

ALTER TABLE public.chefe_highlight_media ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read highlight media" ON public.chefe_highlight_media FOR SELECT USING (true);
CREATE POLICY "Public insert highlight media" ON public.chefe_highlight_media FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update highlight media" ON public.chefe_highlight_media FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "Public delete highlight media" ON public.chefe_highlight_media FOR DELETE USING (true);

CREATE INDEX chefe_highlight_media_highlight_idx ON public.chefe_highlight_media (highlight_id, position);

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_chefe_highlight_media_updated_at
BEFORE UPDATE ON public.chefe_highlight_media
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_highlight_media;