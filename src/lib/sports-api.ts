/**
 * API-Sports client (api-sports.io)
 *
 * One key (`EXPO_PUBLIC_SPORTS_API_KEY`) works across all sport endpoints.
 * Each sport lives on its own subdomain:
 *   Soccer/Football  → v3.football.api-sports.io
 *   Basketball       → v1.basketball.api-sports.io
 *   American Football→ v1.american-football.api-sports.io
 *   Baseball         → v1.baseball.api-sports.io
 *   Hockey           → v1.hockey.api-sports.io
 *   Formula 1        → v1.formula-1.api-sports.io
 *
 * NOTE: In production, API calls should be proxied through a Supabase Edge
 * Function so the key is never bundled into the client binary.
 */

import type { ApiFixture, ApiSportsResponse, Sport, TeamSearchResult, GameSearchResult } from '@/src/types';
import { fuzzyFilter } from '@/src/lib/fuzzy';
import { POPULAR_TEAMS } from '@/src/data/popular-teams';

const API_KEY = process.env.EXPO_PUBLIC_SPORTS_API_KEY ?? '';

const SPORT_BASE_URLS: Record<string, string> = {
  football: 'https://v3.football.api-sports.io',
  basketball: 'https://v1.basketball.api-sports.io',
  american_football: 'https://v1.american-football.api-sports.io',
  baseball: 'https://v1.baseball.api-sports.io',
  ice_hockey: 'https://v1.hockey.api-sports.io',
  formula_1: 'https://v1.formula-1.api-sports.io',
};

async function apiGet<T>(sport: string, path: string, params: Record<string, string>): Promise<T[]> {
  const base = SPORT_BASE_URLS[sport];
  if (!base) throw new Error(`Unsupported sport for API-Sports: ${sport}`);

  const query = new URLSearchParams(params).toString();
  const url = `${base}${path}?${query}`;

  const response = await fetch(url, {
    headers: { 'x-apisports-key': API_KEY },
  });

  if (!response.ok) {
    throw new Error(`API-Sports request failed: ${response.status} ${response.statusText}`);
  }

  const data: ApiSportsResponse<T> = await response.json();

  // API-Sports returns errors as either an array or an object like { "token": "Error..." }
  if (data.errors) {
    const messages = Array.isArray(data.errors)
      ? data.errors.map(String)
      : Object.values(data.errors as Record<string, unknown>).map(String);
    if (messages.length > 0) {
      // Surface the human-readable message, not raw JSON
      throw new Error(messages[0]);
    }
  }

  return data.response ?? [];
}

// ---------------------------------------------------------------------------
// Football (soccer) — primary sport for prototype validation
// ---------------------------------------------------------------------------

export interface FootballFixtureParams {
  /** API-Sports league ID (e.g. 39 = Premier League) */
  league?: number;
  /** API-Sports team ID */
  team?: number;
  /** Season year (e.g. 2024 for the 2024/25 season) */
  season: number;
  /** Specific date filter (YYYY-MM-DD) */
  date?: string;
}

export async function fetchFootballFixtures(params: FootballFixtureParams): Promise<ApiFixture[]> {
  const query: Record<string, string> = {
    season: params.season.toString(),
  };
  if (params.league !== undefined) query.league = params.league.toString();
  if (params.team !== undefined) query.team = params.team.toString();
  if (params.date) query.date = params.date;

  return apiGet<ApiFixture>('football', '/fixtures', query);
}

export async function fetchFixtureById(fixtureId: number): Promise<ApiFixture | null> {
  const results = await apiGet<ApiFixture>('football', '/fixtures', {
    id: fixtureId.toString(),
  });
  return results[0] ?? null;
}

// ---------------------------------------------------------------------------
// Common league IDs for reference (Premier League first, per product priority)
// ---------------------------------------------------------------------------
export const LEAGUE_IDS = {
  // Soccer
  PREMIER_LEAGUE: 39,
  LA_LIGA: 140,
  BUNDESLIGA: 78,
  SERIE_A: 135,
  LIGUE_1: 61,
  CHAMPIONS_LEAGUE: 2,
  MLS: 253,
  // American Football
  NFL: 1,
  // Basketball
  NBA: 12,
  // Baseball
  MLB: 1,
  // Hockey
  NHL: 57,
} as const;

// ---------------------------------------------------------------------------
// Season parameter helper
// ---------------------------------------------------------------------------

/**
 * Returns "2024-2025" for NBA (the basketball API wants the hyphenated
 * form) and plain "2024" for everything else — including NHL: the hockey
 * API rejects hyphenated seasons with "The Season field must contain an
 * integer".
 */
export function seasonParam(sport: Sport, year: number): string {
  if (sport === 'basketball') {
    return `${year}-${year + 1}`;
  }
  return year.toString();
}

// ---------------------------------------------------------------------------
// Primary league ID per sport (used when searching without a specific league)
// ---------------------------------------------------------------------------
const PRIMARY_LEAGUE: Partial<Record<Sport, number>> = {
  football: 39,           // Premier League
  american_football: 1,  // NFL
  basketball: 12,         // NBA
  baseball: 1,            // MLB
  ice_hockey: 57,         // NHL
};

// ---------------------------------------------------------------------------
// Team search
// ---------------------------------------------------------------------------

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeTeam(sport: Sport, raw: any): TeamSearchResult | null {
  try {
    if (sport === 'football') {
      return {
        id: raw.team.id,
        name: raw.team.name,
        logo: raw.team.logo ?? null,
        league: raw.league?.name ?? '',
        leagueId: raw.league?.id ?? 0,
      };
    }
    // basketball / american_football / baseball / ice_hockey — shape differs
    const team = raw.id !== undefined ? raw : raw.team;
    return {
      id: team.id,
      name: team.name,
      logo: team.logo ?? null,
      league: '',
      leagueId: PRIMARY_LEAGUE[sport] ?? 0,
    };
  } catch {
    return null;
  }
}

// League rosters are small and fixed (~30 teams), so we fetch the whole
// league once per sport+season and filter locally. This makes 1-character
// search work (the API's /teams?search= requires ≥3 chars), feels instant,
// and saves API quota (free plan: 100 requests/day).
const leagueTeamsCache = new Map<string, TeamSearchResult[]>();

// The NFL endpoint includes AFC/NFC conference pseudo-teams — not real teams.
const PSEUDO_TEAMS = new Set(['afc', 'nfc']);

export async function fetchLeagueTeams(sport: Sport, year: number): Promise<TeamSearchResult[]> {
  const leagueId = PRIMARY_LEAGUE[sport];
  if (leagueId === undefined) return [];

  const cacheKey = `${sport}_${year}`;
  const cached = leagueTeamsCache.get(cacheKey);
  if (cached) return cached;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await apiGet<any>(sport, '/teams', {
    league: leagueId.toString(),
    season: seasonParam(sport, year),
  });
  const teams = raw
    .map((r) => normalizeTeam(sport, r))
    .filter((t): t is TeamSearchResult => t !== null && !PSEUDO_TEAMS.has(t.name.toLowerCase()));

  leagueTeamsCache.set(cacheKey, teams);
  return teams;
}

/** Minimum query length for football (soccer) — the API search requires it. */
export const FOOTBALL_MIN_QUERY = 3;

/** Curated football clubs used as a typo-tolerant fallback (the API search is exact-match). */
const FOOTBALL_FALLBACK: TeamSearchResult[] = POPULAR_TEAMS
  .filter((t) => t.sport === 'football')
  .map((t) => ({
    id: parseInt(t.team_id, 10),
    name: t.team_name,
    logo: null,
    league: t.league,
    leagueId: 0,
  }));

/**
 * Search for teams matching `query` for the given sport and year.
 *
 * US leagues: fuzzy-filters the cached league roster locally (works from
 * 1 char, tolerates typos). Football (soccer): API-wide search (≥3 chars,
 * exact-match) with a fuzzy fallback against popular clubs so typos like
 * "Arsenol" still find Arsenal.
 */
export async function searchTeams(
  sport: Sport,
  query: string,
  year: number,
): Promise<TeamSearchResult[]> {
  const q = query.trim();
  if (!q) return [];

  if (sport === 'football') {
    if (q.length < FOOTBALL_MIN_QUERY) return [];
    let results: TeamSearchResult[] = [];
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const raw = await apiGet<any>(sport, '/teams', { search: q.toLowerCase() });
      results = raw
        .map((r) => normalizeTeam(sport, r))
        .filter((t): t is TeamSearchResult => t !== null);
    } catch {
      // Fall through to the local fallback rather than surfacing an error
    }
    if (results.length > 0) return results;
    return fuzzyFilter(q, FOOTBALL_FALLBACK, (t) => t.name);
  }

  const all = await fetchLeagueTeams(sport, year);
  return fuzzyFilter(q, all, (t) => t.name);
}

// ---------------------------------------------------------------------------
// Game search by team
// ---------------------------------------------------------------------------

/**
 * Score shapes differ per API: hockey returns plain numbers
 * (`scores.home: 3`), basketball/baseball/NFL return objects
 * (`scores.home.total` / `.points`).
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function extractScore(side: any): number | null {
  if (side == null) return null;
  if (typeof side === 'number') return side;
  return side.total ?? side.points ?? null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function normalizeGame(sport: Sport, raw: any): GameSearchResult | null {
  try {
    if (sport === 'football') {
      const f = raw.fixture;
      const leagueId = raw.league?.id ?? 0;
      const leagueName = raw.league?.name ?? '';
      const status = f.status?.short ?? '';
      if (!['FT', 'AET', 'PEN'].includes(status)) return null;
      return {
        api_game_id: `football_${f.id}`,
        sport,
        league: leagueName,
        leagueId,
        home_team: raw.teams.home.name,
        away_team: raw.teams.away.name,
        home_score: raw.goals.home,
        away_score: raw.goals.away,
        game_date: f.date.substring(0, 10),
        venue_name: f.venue?.name ?? null,
        venue_city: f.venue?.city ?? null,
        venue_country: raw.league?.country ?? null,
        api_venue_id: f.venue?.id != null ? String(f.venue.id) : null,
        status,
      };
    }

    // Non-football sports share a similar /games response shape
    const gameId = raw.id;
    const statusShort = String(raw.status?.short ?? '').toUpperCase();
    const statusLong = String(raw.status?.long ?? '').toLowerCase();
    // Exact short-code match — substring matching wrongly treated any
    // status containing the letter "F" as a finished game.
    const FINISHED_CODES = new Set(['FT', 'AOT', 'AP', 'F', 'FIN']);
    const isFinished =
      FINISHED_CODES.has(statusShort) ||
      statusLong.includes('finished') ||
      statusLong.includes('final') ||
      statusLong.includes('after over time') ||
      statusLong.includes('after penalties');
    if (!isFinished) return null;

    const leagueId = raw.league?.id ?? PRIMARY_LEAGUE[sport] ?? 0;
    const leagueName = raw.league?.name ?? '';
    const gameDate = (raw.date ?? raw.game_date ?? '').substring(0, 10);
    const venueId = raw.venue?.id != null ? String(raw.venue.id) : null;

    return {
      api_game_id: `${sport}_${gameId}`,
      sport,
      league: leagueName,
      leagueId,
      home_team: raw.teams?.home?.name ?? '',
      away_team: raw.teams?.away?.name ?? '',
      home_score: extractScore(raw.scores?.home),
      away_score: extractScore(raw.scores?.away),
      game_date: gameDate,
      venue_name: raw.venue?.name ?? null,
      venue_city: raw.venue?.city ?? null,
      venue_country: raw.country?.name ?? null,
      api_venue_id: venueId,
      status: statusShort,
    };
  } catch {
    return null;
  }
}

/**
 * Fetch completed games for `teamId` in the given sport and year.
 * Returns results sorted by date descending.
 */
export async function getTeamGames(
  sport: Sport,
  teamId: number,
  year: number,
): Promise<GameSearchResult[]> {
  const season = seasonParam(sport, year);
  const params: Record<string, string> = {
    team: teamId.toString(),
    season,
  };

  const endpoint = sport === 'football' ? '/fixtures' : '/games';
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await apiGet<any>(sport, endpoint, params);
  const results = raw
    .map((r) => normalizeGame(sport, r))
    .filter((g): g is GameSearchResult => g !== null);

  // Sort by date descending
  results.sort((a, b) => b.game_date.localeCompare(a.game_date));
  return results;
}
