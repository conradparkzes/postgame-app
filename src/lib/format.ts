import type { Sport } from '@/src/types';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

export function formatDate(dateString?: string | null): string {
  if (!dateString) return '—';
  const [y, m, day] = dateString.split('-');
  return `${MONTHS[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

export function formatScore(home: number | null | undefined, away: number | null | undefined): string {
  if (home == null && away == null) return '';
  return `${home ?? '–'} – ${away ?? '–'}`;
}

export function computePostGameScore(ratings: (number | null | undefined)[]): string {
  const filled = ratings.filter((v): v is number => v != null);
  if (filled.length === 0) return '—';
  const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
  return avg.toFixed(1);
}

const SPORT_EMOJI: Record<Sport, string> = {
  football: '⚽',
  basketball: '🏀',
  american_football: '🏈',
  baseball: '⚾',
  ice_hockey: '🏒',
  formula_1: '🏎️',
  rugby_union: '🏉',
  rugby_league: '🏉',
  cricket: '🏏',
  tennis: '🎾',
  golf: '⛳',
};

export function sportEmoji(sport: Sport): string {
  return SPORT_EMOJI[sport] ?? '🏟️';
}
