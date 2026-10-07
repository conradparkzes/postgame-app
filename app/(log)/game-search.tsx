import { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useLogDraft } from '@/src/context/LogContext';
import { searchTeams, getTeamGames, FOOTBALL_MIN_QUERY } from '@/src/lib/sports-api';
import type { GameSearchResult, TeamSearchResult, Sport } from '@/src/types';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

// API-Sports free plan: seasons 2022–2024 only. Paid plan unlocks all seasons.
const API_MAX_SEASON = 2024;
const API_MIN_SEASON = 2022;
const DEFAULT_SEASON = API_MAX_SEASON;
const YEARS = Array.from(
  { length: API_MAX_SEASON - API_MIN_SEASON + 1 },
  (_, i) => API_MAX_SEASON - i,
);

/** Display a season label: "2025/26" for football, "2025-26" for NBA/NHL, "2025" for NFL/MLB */
function seasonLabel(sport: Sport | undefined, year: number): string {
  if (!sport) return year.toString();
  if (sport === 'football') return `${year}/${String(year + 1).slice(2)}`;
  if (sport === 'basketball' || sport === 'ice_hockey') return `${year}-${String(year + 1).slice(2)}`;
  return year.toString();
}

export default function GameSearchScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useLogDraft();

  const [year, setYear] = useState(API_MAX_SEASON);
  const [showYearPicker, setShowYearPicker] = useState(false);
  const [query, setQuery] = useState('');
  const [teams, setTeams] = useState<TeamSearchResult[]>([]);
  const [games, setGames] = useState<GameSearchResult[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamSearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Football's API search needs 3+ chars; US leagues filter a cached roster
  // locally, so results appear from the very first character.
  const needMoreChars =
    draft.sport === 'football' &&
    query.trim().length > 0 &&
    query.trim().length < FOOTBALL_MIN_QUERY;

  useEffect(() => {
    if (!query.trim() || needMoreChars) {
      setTeams([]);
      setSelectedTeam(null);
      setGames([]);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 350);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, year]);

  // When year changes and a team is already selected, reload games
  useEffect(() => {
    if (selectedTeam) {
      loadGames(selectedTeam, year);
    }
  }, [year]);

  async function doSearch(q: string) {
    if (!draft.sport) return;
    setError(null);
    setLoading(true);
    try {
      const results = await searchTeams(draft.sport, q, year);
      setTeams(results);
      setSelectedTeam(null);
      setGames([]);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Search failed: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  async function loadGames(team: TeamSearchResult, selectedYear: number) {
    if (!draft.sport) return;
    setError(null);
    setLoading(true);
    setSelectedTeam(team);
    setTeams([]);
    try {
      const results = await getTeamGames(draft.sport, team.id, selectedYear);
      setGames(results);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Unknown error';
      setError(`Failed to load games: ${msg}`);
    } finally {
      setLoading(false);
    }
  }

  function handleSelectGame(game: GameSearchResult) {
    updateDraft({
      api_game_id: game.api_game_id,
      sport: game.sport,
      league: game.league,
      home_team: game.home_team,
      away_team: game.away_team,
      home_score: game.home_score,
      away_score: game.away_score,
      game_date: game.game_date,
      venue_name: game.venue_name ?? undefined,
      venue_city: game.venue_city ?? undefined,
      venue_country: game.venue_country ?? undefined,
      api_venue_id: game.api_venue_id ?? undefined,
    });
    router.push('/(log)/venue-confirm');
  }

  function formatDate(d: string) {
    const [y, m, day] = d.split('-');
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
  }

  function formatScore(home: number | null, away: number | null) {
    if (home == null || away == null) return '';
    return `${home} – ${away}`;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={1} />
        <View style={styles.backButton} />
      </View>

      <Text style={styles.title}>Find a game</Text>

      {/* Search bar + year selector row */}
      <View style={styles.searchRow}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search team name…"
          placeholderTextColor={Colors.textTertiary}
          value={query}
          onChangeText={setQuery}
          autoCapitalize="words"
          returnKeyType="search"
        />
        <Pressable
          style={styles.yearButton}
          onPress={() => setShowYearPicker(true)}
        >
          <Text style={styles.yearButtonText}>{seasonLabel(draft.sport, year)}</Text>
          <Text style={styles.yearCaret}>▼</Text>
        </Pressable>
      </View>

      {/* Year picker modal */}
      <Modal
        visible={showYearPicker}
        transparent
        animationType="fade"
        onRequestClose={() => setShowYearPicker(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setShowYearPicker(false)}>
          <View style={styles.yearPickerSheet}>
            <Text style={styles.yearPickerTitle}>Select season</Text>
            <ScrollView style={styles.yearPickerScroll} showsVerticalScrollIndicator={false}>
              {YEARS.map((y) => (
                <Pressable
                  key={y}
                  style={[styles.yearPickerRow, y === year && styles.yearPickerRowActive]}
                  onPress={() => {
                    setYear(y);
                    setShowYearPicker(false);
                  }}
                >
                  <Text style={[styles.yearPickerText, y === year && styles.yearPickerTextActive]}>
                    {seasonLabel(draft.sport, y)}
                  </Text>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>

      {/* Error */}
      {error ? (
        <View style={styles.errorBanner}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {/* Soccer needs more characters before the API search can run */}
      {needMoreChars && (
        <Text style={styles.hintText}>
          Keep typing — team search needs at least {FOOTBALL_MIN_QUERY} letters.
        </Text>
      )}

      {/* Loading */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator color={Colors.accent} />
        </View>
      ) : null}

      {/* Team results */}
      {!loading && teams.length > 0 && (
        <FlatList
          data={teams}
          keyExtractor={(t) => t.id.toString()}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.teamRow, pressed && styles.rowPressed]}
              onPress={() => loadGames(item, year)}
            >
              <Text style={styles.teamName}>{item.name}</Text>
              {item.league ? <Text style={styles.teamLeague}>{item.league}</Text> : null}
            </Pressable>
          )}
        />
      )}

      {/* Back to team search */}
      {!loading && selectedTeam && (
        <Pressable
          style={styles.changeTeamBtn}
          onPress={() => {
            setSelectedTeam(null);
            setGames([]);
            setTeams([]);
          }}
        >
          <Text style={styles.changeTeamText}>‹ {selectedTeam.name}</Text>
        </Pressable>
      )}

      {/* Game results */}
      {!loading && games.length > 0 && (
        <FlatList
          data={games}
          keyExtractor={(g) => g.api_game_id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <Pressable
              style={({ pressed }) => [styles.gameRow, pressed && styles.rowPressed]}
              onPress={() => handleSelectGame(item)}
            >
              <Text style={styles.gameTeams}>
                {item.home_team} vs {item.away_team}
              </Text>
              <View style={styles.gameMeta}>
                <Text style={styles.gameDate}>{formatDate(item.game_date)}</Text>
                {item.venue_name ? (
                  <Text style={styles.gameVenue}>{item.venue_name}</Text>
                ) : null}
                {item.home_score != null ? (
                  <Text style={styles.gameScore}>{formatScore(item.home_score, item.away_score)}</Text>
                ) : null}
              </View>
            </Pressable>
          )}
        />
      )}

      {/* Empty state after team selected */}
      {!loading && selectedTeam && games.length === 0 && !error && (
        <View style={styles.center}>
          <Text style={styles.emptyText}>No completed games found for the {seasonLabel(draft.sport, year)} season.</Text>
        </View>
      )}

      {/* Can't find it */}
      <Pressable style={styles.manualLink} onPress={() => router.push('/(log)/manual-entry')}>
        <Text style={styles.manualLinkText}>Can&apos;t find it? Enter manually</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 28,
    lineHeight: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  searchRow: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    marginBottom: 12,
    gap: 10,
  },
  searchInput: {
    flex: 1,
    height: 48,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  yearButton: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    paddingHorizontal: 14,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 6,
  },
  yearButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  yearCaret: {
    fontSize: 9,
    color: Colors.textTertiary,
  },
  // Year picker modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  yearPickerSheet: {
    width: '70%',
    maxHeight: '60%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  yearPickerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  yearPickerScroll: {
    paddingVertical: 4,
  },
  yearPickerRow: {
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  yearPickerRowActive: {
    backgroundColor: Colors.accentSubtle,
  },
  yearPickerText: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  yearPickerTextActive: {
    color: Colors.accent,
    fontWeight: '700',
  },
  errorBanner: {
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 12,
    backgroundColor: '#331207',
    borderRadius: 8,
  },
  hintText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    paddingHorizontal: 24,
    marginTop: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: {
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  teamRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  rowPressed: {
    opacity: 0.6,
  },
  teamName: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  teamLeague: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  changeTeamBtn: {
    paddingHorizontal: 24,
    paddingVertical: 8,
    marginBottom: 4,
  },
  changeTeamText: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600',
  },
  gameRow: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  gameTeams: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  gameMeta: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 4,
    flexWrap: 'wrap',
  },
  gameDate: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  gameVenue: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  gameScore: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  emptyText: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: 'center',
    paddingHorizontal: 32,
  },
  manualLink: {
    alignItems: 'center',
    padding: 16,
  },
  manualLinkText: {
    fontSize: 14,
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
