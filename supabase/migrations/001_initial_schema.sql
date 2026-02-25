-- =============================================================================
-- PostGame — Initial Schema Migration
-- Run this in the Supabase SQL Editor (Dashboard → SQL Editor → New Query)
-- =============================================================================

-- ---------------------------------------------------------------------------
-- Profiles
-- One row per authenticated user; created automatically via trigger on signup.
-- ---------------------------------------------------------------------------
CREATE TABLE public.profiles (
  id             UUID        PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username       TEXT        UNIQUE NOT NULL,
  display_name   TEXT,
  avatar_url     TEXT,
  bio            TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Game Logs
-- Core table: one row per game a user attended.
-- ---------------------------------------------------------------------------
CREATE TABLE public.game_logs (
  id                    UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id               UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- External API reference (null when user enters the game manually)
  api_game_id           TEXT,

  -- Game identity
  sport                 TEXT        NOT NULL,  -- 'football', 'basketball', 'american_football', etc.
  league                TEXT        NOT NULL,  -- Human-readable: 'Premier League', 'NFL', …
  home_team             TEXT        NOT NULL,
  away_team             TEXT        NOT NULL,
  home_score            SMALLINT,
  away_score            SMALLINT,
  game_date             DATE        NOT NULL,

  -- Venue
  venue_name            TEXT,
  venue_city            TEXT,
  venue_country         TEXT,
  api_venue_id          TEXT,

  -- Seating (optional, user-entered)
  seat_section          TEXT,
  seat_row              TEXT,
  seat_number           TEXT,

  -- Beli-style venue ratings (1–5 per category)
  atmosphere_rating     SMALLINT    CHECK (atmosphere_rating    BETWEEN 1 AND 5),
  seating_rating        SMALLINT    CHECK (seating_rating       BETWEEN 1 AND 5),
  food_rating           SMALLINT    CHECK (food_rating          BETWEEN 1 AND 5),
  accessibility_rating  SMALLINT    CHECK (accessibility_rating BETWEEN 1 AND 5),

  -- User content
  notes                 TEXT,
  user_ranking          INTEGER,    -- User's personal ranking of this game (set in v0.4)

  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Game Media
-- Photos and videos attached to a game log entry.
-- Files are stored in Supabase Storage; this table holds the paths + metadata.
-- ---------------------------------------------------------------------------
CREATE TABLE public.game_media (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  game_log_id    UUID        NOT NULL REFERENCES public.game_logs(id) ON DELETE CASCADE,
  user_id        UUID        NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  storage_path   TEXT        NOT NULL,           -- e.g. 'game-media/<user_id>/<game_log_id>/<filename>'
  media_type     TEXT        NOT NULL CHECK (media_type IN ('photo', 'video')),
  display_order  SMALLINT    NOT NULL DEFAULT 0, -- for ordering attachments within a log
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ---------------------------------------------------------------------------
-- Indexes
-- ---------------------------------------------------------------------------
CREATE INDEX game_logs_user_id_idx      ON public.game_logs(user_id);
CREATE INDEX game_logs_game_date_idx    ON public.game_logs(game_date DESC);
CREATE INDEX game_logs_sport_idx        ON public.game_logs(sport);
CREATE INDEX game_logs_api_game_id_idx  ON public.game_logs(api_game_id) WHERE api_game_id IS NOT NULL;
CREATE INDEX game_media_game_log_id_idx ON public.game_media(game_log_id);

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER game_logs_updated_at
  BEFORE UPDATE ON public.game_logs
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ---------------------------------------------------------------------------
-- Auto-create profile on user signup
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, username, display_name)
  VALUES (
    NEW.id,
    -- Username defaults to 'user_<first 8 chars of UUID>' until the user sets one in onboarding.
    COALESCE(
      NEW.raw_user_meta_data->>'username',
      'user_' || substr(NEW.id::text, 1, 8)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1)
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE public.profiles  ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.game_media ENABLE ROW LEVEL SECURITY;

-- profiles
CREATE POLICY "Profiles are publicly readable"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- game_logs
-- Public read for now; privacy controls (friend-only logs) can be added in v1.1.
CREATE POLICY "Game logs are publicly readable"
  ON public.game_logs FOR SELECT USING (true);

CREATE POLICY "Users can insert their own game logs"
  ON public.game_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own game logs"
  ON public.game_logs FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game logs"
  ON public.game_logs FOR DELETE USING (auth.uid() = user_id);

-- game_media
CREATE POLICY "Game media is publicly readable"
  ON public.game_media FOR SELECT USING (true);

CREATE POLICY "Users can insert their own game media"
  ON public.game_media FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own game media"
  ON public.game_media FOR DELETE USING (auth.uid() = user_id);

-- ---------------------------------------------------------------------------
-- Supabase Storage bucket (run separately in Dashboard → Storage, or via API)
-- ---------------------------------------------------------------------------
-- Create a bucket named 'game-media' with public: false (access controlled via
-- signed URLs or RLS on the storage.objects table).
--
-- Storage RLS policy to add after creating the bucket:
--
--   CREATE POLICY "Users can upload their own game media"
--     ON storage.objects FOR INSERT
--     WITH CHECK (bucket_id = 'game-media' AND auth.uid()::text = (storage.foldername(name))[1]);
--
--   CREATE POLICY "Users can read game media"
--     ON storage.objects FOR SELECT
--     USING (bucket_id = 'game-media');
--
--   CREATE POLICY "Users can delete their own game media"
--     ON storage.objects FOR DELETE
--     USING (bucket_id = 'game-media' AND auth.uid()::text = (storage.foldername(name))[1]);
