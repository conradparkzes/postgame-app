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

import type { ApiFixture, ApiSportsResponse } from '@/src/types';

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

  if (data.errors && Array.isArray(data.errors) && data.errors.length > 0) {
    throw new Error(`API-Sports error: ${JSON.stringify(data.errors)}`);
  }

  return data.response;
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
