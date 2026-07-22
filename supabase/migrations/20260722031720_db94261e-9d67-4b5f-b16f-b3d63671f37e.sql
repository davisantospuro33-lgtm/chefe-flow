-- Tabela dedicada para 'pessoas no salão' (informativo de movimento presencial)
CREATE TABLE IF NOT EXISTS public.chefe_status_salao (
  id INT PRIMARY KEY DEFAULT 1,
  pessoas_no_salao INT NOT NULL DEFAULT 0,
  atualizado_em TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chefe_status_salao_singleton CHECK (id = 1)
);

GRANT SELECT ON public.chefe_status_salao TO anon;
GRANT SELECT, INSERT, UPDATE ON public.chefe_status_salao TO authenticated;
GRANT ALL ON public.chefe_status_salao TO service_role;

ALTER TABLE public.chefe_status_salao ENABLE ROW LEVEL SECURITY;

CREATE POLICY "salao_read_all" ON public.chefe_status_salao FOR SELECT USING (true);
CREATE POLICY "salao_update_all" ON public.chefe_status_salao FOR UPDATE USING (true) WITH CHECK (true);
CREATE POLICY "salao_insert_all" ON public.chefe_status_salao FOR INSERT WITH CHECK (true);

INSERT INTO public.chefe_status_salao (id, pessoas_no_salao) VALUES (1, 0)
ON CONFLICT (id) DO NOTHING;

ALTER PUBLICATION supabase_realtime ADD TABLE public.chefe_status_salao;
