ALTER TABLE public.chefe_profile
  ADD COLUMN IF NOT EXISTS posts_count text NOT NULL DEFAULT '128',
  ADD COLUMN IF NOT EXISTS headline text NOT NULL DEFAULT 'CHEFE | Barbearia & Estilo';