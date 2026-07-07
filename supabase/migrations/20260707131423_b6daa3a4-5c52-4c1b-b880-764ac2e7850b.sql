
CREATE TABLE public.chefe_queue (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text,
  qtd int,
  referencia text,
  perfil text,
  added_at timestamptz NOT NULL DEFAULT now(),
  position int NOT NULL DEFAULT 0
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_queue TO anon, authenticated;
GRANT ALL ON public.chefe_queue TO service_role;
ALTER TABLE public.chefe_queue ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read queue" ON public.chefe_queue FOR SELECT USING (true);
CREATE POLICY "public write queue" ON public.chefe_queue FOR INSERT WITH CHECK (true);
CREATE POLICY "public update queue" ON public.chefe_queue FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete queue" ON public.chefe_queue FOR DELETE USING (true);

CREATE TABLE public.chefe_pendentes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  phone text NOT NULL,
  referencia text NOT NULL,
  perfil text NOT NULL,
  qtd int NOT NULL DEFAULT 1,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_pendentes TO anon, authenticated;
GRANT ALL ON public.chefe_pendentes TO service_role;
ALTER TABLE public.chefe_pendentes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read pendentes" ON public.chefe_pendentes FOR SELECT USING (true);
CREATE POLICY "public write pendentes" ON public.chefe_pendentes FOR INSERT WITH CHECK (true);
CREATE POLICY "public update pendentes" ON public.chefe_pendentes FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "public delete pendentes" ON public.chefe_pendentes FOR DELETE USING (true);

CREATE TABLE public.chefe_state (
  id int PRIMARY KEY DEFAULT 1 CHECK (id = 1),
  status text NOT NULL DEFAULT 'available',
  presencial_count int NOT NULL DEFAULT 0,
  extra_minutes int NOT NULL DEFAULT 0,
  stage int NOT NULL DEFAULT 1,
  current_client_id uuid,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_state TO anon, authenticated;
GRANT ALL ON public.chefe_state TO service_role;
ALTER TABLE public.chefe_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "public read state" ON public.chefe_state FOR SELECT USING (true);
CREATE POLICY "public write state" ON public.chefe_state FOR INSERT WITH CHECK (true);
CREATE POLICY "public update state" ON public.chefe_state FOR UPDATE USING (true) WITH CHECK (true);

INSERT INTO public.chefe_state (id) VALUES (1) ON CONFLICT DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_pendentes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_state;
ALTER TABLE public.chefe_queue REPLICA IDENTITY FULL;
ALTER TABLE public.chefe_pendentes REPLICA IDENTITY FULL;
ALTER TABLE public.chefe_state REPLICA IDENTITY FULL;
