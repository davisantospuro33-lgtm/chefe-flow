-- Adiciona endereço fixo do estabelecimento ao perfil (usado pelo painel de mapa/GPS do ConfigAI)
ALTER TABLE public.chefe_profile ADD COLUMN IF NOT EXISTS endereco TEXT NOT NULL DEFAULT '';
