
-- 1) Portfolio: add media_type
ALTER TABLE public.chefe_portfolio
  ADD COLUMN IF NOT EXISTS media_type text NOT NULL DEFAULT 'image'
  CHECK (media_type IN ('image', 'video'));

-- 2) Profile: add config fields
ALTER TABLE public.chefe_profile
  ADD COLUMN IF NOT EXISTS phone_official text,
  ADD COLUMN IF NOT EXISTS latitude double precision,
  ADD COLUMN IF NOT EXISTS longitude double precision,
  ADD COLUMN IF NOT EXISTS service_price text NOT NULL DEFAULT 'R$ 25,00',
  ADD COLUMN IF NOT EXISTS service_duration_min integer NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS ai_greeting text NOT NULL DEFAULT 'Salve! Sou a Assistente Virtual do CHEFE. 💈 Vamos agendar seu corte rápido.';

-- 3) Push subscriptions
CREATE TABLE IF NOT EXISTS public.chefe_push_subscriptions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  endpoint text NOT NULL UNIQUE,
  p256dh text NOT NULL,
  auth text NOT NULL,
  client_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.chefe_push_subscriptions TO anon, authenticated;
GRANT ALL ON public.chefe_push_subscriptions TO service_role;

ALTER TABLE public.chefe_push_subscriptions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public insert push" ON public.chefe_push_subscriptions FOR INSERT TO public WITH CHECK (true);
CREATE POLICY "public read push" ON public.chefe_push_subscriptions FOR SELECT TO public USING (true);
CREATE POLICY "public delete push" ON public.chefe_push_subscriptions FOR DELETE TO public USING (true);
