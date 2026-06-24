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
    const hasErrors = Array.isArray(data.errors)
      ? data.errors.length > 0
      : typeof data.errors === 'object' && Object.keys(data.errors).length > 0;
    if (hasErrors) {
      throw new Error(`API-Sports error: ${JSON.stringify(data.errors)}`);
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

/** Returns "2024-2025" for NBA/NHL, "2024" for all other sports. */
export function seasonParam(sport: Sport, year: number): string {
  if (sport === 'basketball' || sport === 'ice_hockey') {
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

/**
 * Search for teams matching `query` for the given sport and year.
 * Results are scoped to the primary league for that sport when possible.
 */
export async function searchTeams(
  sport: Sport,
  query: string,
  year: number,
): Promise<TeamSearchResult[]> {
  const params: Record<string, string> = { search: query };

  if (sport === 'football') {
    // Football /teams?search= works without league/season and returns across all leagues
  } else {
    // Non-football sports need league + season to scope results
    const leagueId = PRIMARY_LEAGUE[sport];
    if (leagueId !== undefined) {
      params.league = leagueId.toString();
      params.season = seasonParam(sport, year);
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const raw = await apiGet<any>(sport, '/teams', params);
  return raw.map((r) => normalizeTeam(sport, r)).filter((t): t is TeamSearchResult => t !== null);
}

// ---------------------------------------------------------------------------
// Game search by team
// ---------------------------------------------------------------------------

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
    const statusShort = raw.status?.short ?? raw.status?.long ?? '';
    const isFinished =
      ['FT', 'AOT', 'AP', 'F', 'Final', 'Finished'].some((s) =>
        statusShort.toLowerCase().includes(s.toLowerCase()),
      ) || raw.status?.long?.toLowerCase() === 'game finished';
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
      home_score: raw.scores?.home?.total ?? raw.scores?.home?.points ?? null,
      away_score: raw.scores?.away?.total ?? raw.scores?.away?.points ?? null,
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
