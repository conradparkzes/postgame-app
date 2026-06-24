ALTER TABLE public.game_logs
  ADD COLUMN IF NOT EXISTS companions TEXT[] NOT NULL DEFAULT '{}';
