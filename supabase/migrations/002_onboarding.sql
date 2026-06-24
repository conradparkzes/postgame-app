-- =============================================================================
-- PostGame — Migration 002: Onboarding fields and favorite teams
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Add onboarding + phone fields to profiles
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS phone                TEXT,
  ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE;

-- ---------------------------------------------------------------------------
-- User Favorite Teams
-- Set during onboarding; used for personalised home feed and game suggestions.
-- ---------------------------------------------------------------------------
CREATE TABLE public.user_favorite_teams (
  id             UUID   PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id        UUID   NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  sport          TEXT   NOT NULL,
  league         TEXT   NOT NULL,
  team_name      TEXT   NOT NULL,
  team_id        TEXT,            -- API-Sports team ID (null for manually added)
  team_logo_url  TEXT,            -- cached logo URL from API-Sports / TheSportsDB
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- A user can only favourite the same team once
  UNIQUE (user_id, sport, team_name)
);

CREATE INDEX user_favorite_teams_user_id_idx ON public.user_favorite_teams(user_id);

-- ---------------------------------------------------------------------------
-- RLS
-- ---------------------------------------------------------------------------
ALTER TABLE public.user_favorite_teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own favourite teams"
  ON public.user_favorite_teams FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own favourite teams"
  ON public.user_favorite_teams FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own favourite teams"
  ON public.user_favorite_teams FOR DELETE
  USING (auth.uid() = user_id);
