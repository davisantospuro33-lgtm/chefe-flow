CREATE TABLE public.chefe_agenda (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  phone TEXT,
  qtd INTEGER DEFAULT 1,
  referencia TEXT,
  perfil TEXT,
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmado',
  position INTEGER NOT NULL DEFAULT 0,
  notified_leave BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_agenda TO anon, authenticated;
GRANT ALL ON public.chefe_agenda TO service_role;

ALTER TABLE public.chefe_agenda ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public read agenda" ON public.chefe_agenda FOR SELECT USING (true);
CREATE POLICY "public write agenda" ON public.chefe_agenda FOR INSERT WITH CHECK (true);
CREATE POLICY "public update agenda" ON public.chefe_agenda FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete agenda" ON public.chefe_agenda FOR DELETE USING (true);

CREATE INDEX chefe_agenda_scheduled_at_idx ON public.chefe_agenda (scheduled_at);

ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_agenda;