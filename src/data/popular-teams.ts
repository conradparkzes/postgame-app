/**
 * Curated list of globally popular teams for onboarding team selection.
 * Ordered by global recognition within each sport.
 * API-Sports team IDs included where stable.
 */

import type { Sport } from '@/src/types';

export interface PopularTeam {
  team_id: string;    // API-Sports team ID as string
  team_name: string;
  sport: Sport;
  league: string;
}

export const POPULAR_TEAMS: PopularTeam[] = [
  // ─── Premier League ────────────────────────────────────────────────────
  { team_id: '40',  team_name: 'Liverpool',              sport: 'football', league: 'Premier League' },
  { team_id: '33',  team_name: 'Manchester United',      sport: 'football', league: 'Premier League' },
  { team_id: '50',  team_name: 'Manchester City',        sport: 'football', league: 'Premier League' },
  { team_id: '42',  team_name: 'Arsenal',                sport: 'football', league: 'Premier League' },
  { team_id: '49',  team_name: 'Chelsea',                sport: 'football', league: 'Premier League' },
  { team_id: '47',  team_name: 'Tottenham Hotspur',      sport: 'football', league: 'Premier League' },
  { team_id: '66',  team_name: 'Aston Villa',            sport: 'football', league: 'Premier League' },
  { team_id: '34',  team_name: 'Newcastle United',       sport: 'football', league: 'Premier League' },
  { team_id: '51',  team_name: 'Brighton',               sport: 'football', league: 'Premier League' },
  { team_id: '39',  team_name: 'Wolverhampton',          sport: 'football', league: 'Premier League' },
  { team_id: '48',  team_name: 'West Ham United',        sport: 'football', league: 'Premier League' },
  { team_id: '45',  team_name: 'Everton',                sport: 'football', league: 'Premier League' },

  // ─── La Liga ───────────────────────────────────────────────────────────
  { team_id: '541', team_name: 'Real Madrid',            sport: 'football', league: 'La Liga' },
  { team_id: '529', team_name: 'FC Barcelona',           sport: 'football', league: 'La Liga' },
  { team_id: '530', team_name: 'Atlético Madrid',        sport: 'football', league: 'La Liga' },
  { team_id: '532', team_name: 'Valencia',               sport: 'football', league: 'La Liga' },
  { team_id: '536', team_name: 'Sevilla',                sport: 'football', league: 'La Liga' },

  // ─── Bundesliga ────────────────────────────────────────────────────────
  { team_id: '157', team_name: 'Bayern München',         sport: 'football', league: 'Bundesliga' },
  { team_id: '165', team_name: 'Borussia Dortmund',      sport: 'football', league: 'Bundesliga' },
  { team_id: '173', team_name: 'RB Leipzig',             sport: 'football', league: 'Bundesliga' },
  { team_id: '168', team_name: 'Bayer Leverkusen',       sport: 'football', league: 'Bundesliga' },

  // ─── Serie A ───────────────────────────────────────────────────────────
  { team_id: '505', team_name: 'Inter Milan',            sport: 'football', league: 'Serie A' },
  { team_id: '496', team_name: 'Juventus',               sport: 'football', league: 'Serie A' },
  { team_id: '489', team_name: 'AC Milan',               sport: 'football', league: 'Serie A' },
  { team_id: '497', team_name: 'AS Roma',                sport: 'football', league: 'Serie A' },
  { team_id: '492', team_name: 'Napoli',                 sport: 'football', league: 'Serie A' },

  // ─── Ligue 1 ───────────────────────────────────────────────────────────
  { team_id: '85',  team_name: 'Paris Saint-Germain',    sport: 'football', league: 'Ligue 1' },

  // ─── MLS ───────────────────────────────────────────────────────────────
  { team_id: '1581', team_name: 'LA Galaxy',             sport: 'football', league: 'MLS' },
  { team_id: '1597', team_name: 'Inter Miami',           sport: 'football', league: 'MLS' },
  { team_id: '1601', team_name: 'LAFC',                  sport: 'football', league: 'MLS' },
  { team_id: '1546', team_name: 'Atlanta United',        sport: 'football', league: 'MLS' },

  // ─── NFL ───────────────────────────────────────────────────────────────
  { team_id: '1',  team_name: 'Dallas Cowboys',          sport: 'american_football', league: 'NFL' },
  { team_id: '2',  team_name: 'New England Patriots',    sport: 'american_football', league: 'NFL' },
  { team_id: '3',  team_name: 'Green Bay Packers',       sport: 'american_football', league: 'NFL' },
  { team_id: '4',  team_name: 'Kansas City Chiefs',      sport: 'american_football', league: 'NFL' },
  { team_id: '5',  team_name: 'San Francisco 49ers',     sport: 'american_football', league: 'NFL' },
  { team_id: '6',  team_name: 'Philadelphia Eagles',     sport: 'american_football', league: 'NFL' },
  { team_id: '7',  team_name: 'Buffalo Bills',           sport: 'american_football', league: 'NFL' },
  { team_id: '8',  team_name: 'Baltimore Ravens',        sport: 'american_football', league: 'NFL' },
  { team_id: '9',  team_name: 'Chicago Bears',           sport: 'american_football', league: 'NFL' },
  { team_id: '10', team_name: 'New York Giants',         sport: 'american_football', league: 'NFL' },
  { team_id: '11', team_name: 'Pittsburgh Steelers',     sport: 'american_football', league: 'NFL' },
  { team_id: '12', team_name: 'Las Vegas Raiders',       sport: 'american_football', league: 'NFL' },

  // ─── NBA ───────────────────────────────────────────────────────────────
  { team_id: '132', team_name: 'Los Angeles Lakers',     sport: 'basketball', league: 'NBA' },
  { team_id: '133', team_name: 'Golden State Warriors',  sport: 'basketball', league: 'NBA' },
  { team_id: '134', team_name: 'Chicago Bulls',          sport: 'basketball', league: 'NBA' },
  { team_id: '135', team_name: 'Boston Celtics',         sport: 'basketball', league: 'NBA' },
  { team_id: '136', team_name: 'Miami Heat',             sport: 'basketball', league: 'NBA' },
  { team_id: '137', team_name: 'Brooklyn Nets',          sport: 'basketball', league: 'NBA' },
  { team_id: '138', team_name: 'New York Knicks',        sport: 'basketball', league: 'NBA' },
  { team_id: '139', team_name: 'Philadelphia 76ers',     sport: 'basketball', league: 'NBA' },
  { team_id: '140', team_name: 'Dallas Mavericks',       sport: 'basketball', league: 'NBA' },
  { team_id: '141', team_name: 'Denver Nuggets',         sport: 'basketball', league: 'NBA' },
  { team_id: '142', team_name: 'Milwaukee Bucks',        sport: 'basketball', league: 'NBA' },
  { team_id: '143', team_name: 'Phoenix Suns',           sport: 'basketball', league: 'NBA' },

  // ─── MLB ───────────────────────────────────────────────────────────────
  { team_id: '201', team_name: 'New York Yankees',       sport: 'baseball', league: 'MLB' },
  { team_id: '202', team_name: 'Los Angeles Dodgers',    sport: 'baseball', league: 'MLB' },
  { team_id: '203', team_name: 'Boston Red Sox',         sport: 'baseball', league: 'MLB' },
  { team_id: '204', team_name: 'Chicago Cubs',           sport: 'baseball', league: 'MLB' },
  { team_id: '205', team_name: 'San Francisco Giants',   sport: 'baseball', league: 'MLB' },
  { team_id: '206', team_name: 'Houston Astros',         sport: 'baseball', league: 'MLB' },
  { team_id: '207', team_name: 'Atlanta Braves',         sport: 'baseball', league: 'MLB' },
  { team_id: '208', team_name: 'New York Mets',          sport: 'baseball', league: 'MLB' },

  // ─── NHL ───────────────────────────────────────────────────────────────
  { team_id: '301', team_name: 'Toronto Maple Leafs',   sport: 'ice_hockey', league: 'NHL' },
  { team_id: '302', team_name: 'Montreal Canadiens',     sport: 'ice_hockey', league: 'NHL' },
  { team_id: '303', team_name: 'New York Rangers',       sport: 'ice_hockey', league: 'NHL' },
  { team_id: '304', team_name: 'Chicago Blackhawks',     sport: 'ice_hockey', league: 'NHL' },
  { team_id: '305', team_name: 'Boston Bruins',          sport: 'ice_hockey', league: 'NHL' },
  { team_id: '306', team_name: 'Pittsburgh Penguins',    sport: 'ice_hockey', league: 'NHL' },
  { team_id: '307', team_name: 'Vegas Golden Knights',   sport: 'ice_hockey', league: 'NHL' },
  { team_id: '308', team_name: 'Colorado Avalanche',     sport: 'ice_hockey', league: 'NHL' },

  // ─── Formula 1 ─────────────────────────────────────────────────────────
  { team_id: 'f1_redbull',   team_name: 'Red Bull Racing',      sport: 'formula_1', league: 'Formula 1' },
  { team_id: 'f1_ferrari',   team_name: 'Scuderia Ferrari',     sport: 'formula_1', league: 'Formula 1' },
  { team_id: 'f1_mercedes',  team_name: 'Mercedes-AMG',         sport: 'formula_1', league: 'Formula 1' },
  { team_id: 'f1_mclaren',   team_name: 'McLaren',              sport: 'formula_1', league: 'Formula 1' },
  { team_id: 'f1_alpine',    team_name: 'Alpine',               sport: 'formula_1', league: 'Formula 1' },
  { team_id: 'f1_aston',     team_name: 'Aston Martin',         sport: 'formula_1', league: 'Formula 1' },
];

export const SPORT_LABELS: Record<Sport, string> = {
  football: 'Soccer',
  american_football: 'NFL',
  basketball: 'NBA',
  baseball: 'MLB',
  ice_hockey: 'NHL',
  formula_1: 'Formula 1',
  rugby_union: 'Rugby Union',
  rugby_league: 'Rugby League',
  cricket: 'Cricket',
  tennis: 'Tennis',
  golf: 'Golf',
};
