ALTER TABLE public.chefe_profile
  ADD COLUMN IF NOT EXISTS service_open_hour integer NOT NULL DEFAULT 9,
  ADD COLUMN IF NOT EXISTS service_close_hour integer NOT NULL DEFAULT 20,
  ADD COLUMN IF NOT EXISTS service_days integer[] NOT NULL DEFAULT '{0,2,3,4,5,6}'::integer[],
  ADD COLUMN IF NOT EXISTS service_buffer_min integer NOT NULL DEFAULT 0;