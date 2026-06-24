// ---------------------------------------------------------------------------
// Domain types
// ---------------------------------------------------------------------------

export type Sport =
  | 'football'           // Soccer / Association football
  | 'basketball'
  | 'american_football'
  | 'baseball'
  | 'ice_hockey'
  | 'formula_1'
  | 'rugby_union'
  | 'rugby_league'
  | 'cricket'
  | 'tennis'
  | 'golf';

export type MediaType = 'photo' | 'video';

// ---------------------------------------------------------------------------
// Database row shapes (mirrors Supabase schema)
// ---------------------------------------------------------------------------

export interface Profile {
  id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  phone: string | null;
  onboarding_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface UserFavoriteTeam {
  id: string;
  user_id: string;
  sport: Sport;
  league: string;
  team_name: string;
  team_id: string | null;       // API-Sports team ID
  team_logo_url: string | null; // from TheSportsDB or API-Sports
  created_at: string;
}

export interface GameLog {
  id: string;
  user_id: string;
  api_game_id: string | null;
  sport: Sport;
  league: string;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  game_date: string; // ISO date string (YYYY-MM-DD)
  venue_name: string | null;
  venue_city: string | null;
  venue_country: string | null;
  api_venue_id: string | null;
  seat_section: string | null;
  seat_row: string | null;
  seat_number: string | null;
  atmosphere_rating: number | null; // 1–5
  seating_rating: number | null;    // 1–5
  food_rating: number | null;       // 1–5
  accessibility_rating: number | null; // 1–5
  notes: string | null;
  companions: string[];
  user_ranking: number | null;
  created_at: string;
  updated_at: string;
}

// ---------------------------------------------------------------------------
// Sports API search result types
// ---------------------------------------------------------------------------

export interface TeamSearchResult {
  id: number;
  name: string;
  logo: string | null;
  league: string;
  leagueId: number;
}

export interface GameSearchResult {
  api_game_id: string;
  sport: Sport;
  league: string;
  leagueId: number;
  home_team: string;
  away_team: string;
  home_score: number | null;
  away_score: number | null;
  game_date: string;           // YYYY-MM-DD
  venue_name: string | null;
  venue_city: string | null;
  venue_country: string | null;
  api_venue_id: string | null;
  status: string;
}

export interface GameMedia {
  id: string;
  game_log_id: string;
  user_id: string;
  storage_path: string; // Supabase Storage path
  media_type: MediaType;
  display_order: number;
  created_at: string;
}

// ---------------------------------------------------------------------------
// API-Sports response shapes (subset used by PostGame)
// ---------------------------------------------------------------------------

export interface ApiSportsResponse<T> {
  get: string;
  parameters: Record<string, string>;
  errors: unknown[];
  results: number;
  paging: { current: number; total: number };
  response: T[];
}

export interface ApiFixture {
  fixture: {
    id: number;
    date: string;
    venue: { id: number | null; name: string | null; city: string | null };
    status: { long: string; short: string; elapsed: number | null };
  };
  league: {
    id: number;
    name: string;
    country: string;
    logo: string;
    round: string;
  };
  teams: {
    home: { id: number; name: string; logo: string; winner: boolean | null };
    away: { id: number; name: string; logo: string; winner: boolean | null };
  };
  goals: { home: number | null; away: number | null };
}
