/**
 * Dependency-free fuzzy text matching for team search.
 * Tolerates typos ("Arsenol" → Arsenal), missing diacritics
 * ("Bayern Munchen" → Bayern München), and partial words.
 */

/** Normalize for matching: lowercase, strip diacritics, collapse whitespace. */
export function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Damerau-Levenshtein (optimal string alignment) — counts adjacent swaps as one edit. */
function editDistance(a: string, b: string): number {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;

  const d: number[][] = Array.from({ length: m + 1 }, () => new Array<number>(n + 1).fill(0));
  for (let i = 0; i <= m; i++) d[i][0] = i;
  for (let j = 0; j <= n; j++) d[0][j] = j;

  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
    }
  }
  return d[m][n];
}

/** How many typos to tolerate for a query of this length. */
function maxTyposFor(len: number): number {
  if (len < 4) return 0;  // short queries: substring match only
  if (len < 6) return 1;
  return 2;
}

/**
 * Score a query against a name. 0 = no match; higher = better.
 *   100 = name starts with query
 *    90 = query appears inside name
 * 80/70/60 = fuzzy match with 0/1/2 edits against the full name,
 *            any word, or any word's prefix (for typo'd partial typing)
 */
export function fuzzyScore(query: string, name: string): number {
  const q = normalizeText(query);
  const n = normalizeText(name);
  if (!q || !n) return 0;

  if (n.startsWith(q)) return 100;
  if (n.includes(q)) return 90;

  const allowed = maxTyposFor(q.length);
  if (allowed === 0) return 0;

  const candidates = [n, ...n.split(' ')];
  let best = Infinity;
  for (const c of candidates) {
    best = Math.min(best, editDistance(q, c));
    // Compare against the word's prefix too — catches a typo'd partial
    // word ("Arsanal" while still typing toward "Arsenal FC")
    if (c.length > q.length) {
      best = Math.min(best, editDistance(q, c.slice(0, q.length)));
    }
    if (best === 0) break;
  }

  if (best > allowed) return 0;
  return 80 - best * 10;
}

/** Filter + rank items by fuzzy relevance to the query. */
export function fuzzyFilter<T>(
  query: string,
  items: T[],
  getName: (item: T) => string,
): T[] {
  const scored = items
    .map((item) => ({ item, score: fuzzyScore(query, getName(item)) }))
    .filter((s) => s.score > 0);

  scored.sort(
    (a, b) => b.score - a.score || getName(a.item).localeCompare(getName(b.item)),
  );
  return scored.map((s) => s.item);
}
