import { useCallback, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { PhotoThumb } from '@/src/components/ui/PhotoThumb';
import { Skeleton } from '@/src/components/ui/Skeleton';
import { StateView } from '@/src/components/ui/StateView';
import { computePostGameScore, formatDate, formatScore, sportEmoji } from '@/src/lib/format';
import {
  deleteGameLog,
  fetchGameDetail,
  fetchMediaSignedUrls,
} from '@/src/lib/game-queries';
import type { GameLog } from '@/src/types';

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function StarRow({ label, rating }: { label: string; rating: number | null }) {
  if (rating == null) return null;
  return (
    <View style={styles.starRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <Text style={styles.stars}>{'★'.repeat(rating)}{'☆'.repeat(5 - rating)}</Text>
    </View>
  );
}

export default function GameDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const [log, setLog] = useState<GameLog | null>(null);
  const [photoUrls, setPhotoUrls] = useState<{ id: string; url: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [fullScreenPhoto, setFullScreenPhoto] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      const detail = await fetchGameDetail(id);
      setLog(detail.log);
      if (detail.media.length > 0) {
        const urls = await fetchMediaSignedUrls(detail.media);
        setPhotoUrls(urls);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [id]);

  // Reload data whenever the screen gains focus (e.g. returning from edit)
  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [loadData]),
  );

  function handleEdit() {
    router.push(`/(game)/edit?id=${id}`);
  }

  function handleDelete() {
    if (!log) return;
    Alert.alert('Delete Game', 'Are you sure? This cannot be undone.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGameLog(log.id, log.user_id);
            if (router.canGoBack()) {
              router.back();
            } else {
              router.replace('/(tabs)/profile');
            }
          } catch {
            Alert.alert('Error', 'Failed to delete game. Please try again.');
          }
        },
      },
    ]);
  }

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
            <Text style={styles.backArrow}>‹</Text>
          </Pressable>
        </View>
        <View style={styles.scroll}>
          <Skeleton style={{ height: 180, borderRadius: 16, marginBottom: 16 }} />
          <Skeleton style={{ height: 60, borderRadius: 12, marginBottom: 16 }} />
          <Skeleton style={{ height: 96, borderRadius: 12, marginBottom: 12 }} />
          <Skeleton style={{ height: 96, borderRadius: 12, marginBottom: 12 }} />
        </View>
      </View>
    );
  }

  if (error || !log) {
    return (
      <View style={styles.center}>
        <StateView
          icon="🏟️"
          title="Couldn't load this game"
          message={error ?? 'The game may have been deleted.'}
          actionLabel="Try Again"
          onAction={loadData}
        />
        <Pressable onPress={() => router.back()} style={styles.backLinkWrap}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  const postGameScore = computePostGameScore([
    log.atmosphere_rating,
    log.seating_rating,
    log.food_rating,
    log.accessibility_rating,
  ]);

  return (
    <View style={styles.container}>
      {/* Header bar */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <View style={styles.headerActions}>
          <Pressable onPress={handleEdit} hitSlop={8}>
            <Text style={styles.editText}>Edit</Text>
          </Pressable>
          <Pressable onPress={handleDelete} hitSlop={8} style={{ marginLeft: 20 }}>
            <Text style={styles.deleteText}>🗑</Text>
          </Pressable>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {/* Game card */}
        <View style={styles.gameCard}>
          <Text style={styles.emoji}>{sportEmoji(log.sport)}</Text>
          <Text style={styles.teams}>{log.home_team} vs {log.away_team}</Text>
          {(log.home_score != null || log.away_score != null) && (
            <Text style={styles.score}>{formatScore(log.home_score, log.away_score)}</Text>
          )}
          {log.league ? <Text style={styles.league}>{log.league}</Text> : null}
          <Text style={styles.date}>{formatDate(log.game_date)}</Text>
        </View>

        {/* PostGame Score */}
        {postGameScore !== '—' && (
          <View style={styles.scoreCard}>
            <Text style={styles.scoreCardLabel}>PostGame Score</Text>
            <Text style={styles.scoreCardValue}>{postGameScore}</Text>
          </View>
        )}

        {/* Venue */}
        {log.venue_name && (
          <Section label="Venue">
            <Text style={styles.value}>{log.venue_name}</Text>
            {log.venue_city && (
              <Text style={styles.secondary}>
                {log.venue_city}{log.venue_country ? `, ${log.venue_country}` : ''}
              </Text>
            )}
          </Section>
        )}

        {/* Seat */}
        {(log.seat_section || log.seat_row || log.seat_number) && (
          <Section label="Seat">
            <Text style={styles.value}>
              {[
                log.seat_section && `Sec ${log.seat_section}`,
                log.seat_row && `Row ${log.seat_row}`,
                log.seat_number && `Seat ${log.seat_number}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          </Section>
        )}

        {/* Ratings */}
        {(log.atmosphere_rating != null ||
          log.seating_rating != null ||
          log.food_rating != null ||
          log.accessibility_rating != null) && (
          <Section label="Ratings">
            <StarRow label="Atmosphere" rating={log.atmosphere_rating} />
            <StarRow label="Seating" rating={log.seating_rating} />
            <StarRow label="Food" rating={log.food_rating} />
            <StarRow label="Accessibility" rating={log.accessibility_rating} />
          </Section>
        )}

        {/* Photos */}
        {photoUrls.length > 0 && (
          <Section label="Photos">
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.photoScroll}
              contentContainerStyle={styles.photoRow}
            >
              {photoUrls.map((p) => (
                <PhotoThumb key={p.id} uri={p.url} onPress={() => setFullScreenPhoto(p.url)} />
              ))}
            </ScrollView>
          </Section>
        )}

        {/* Companions */}
        {log.companions && log.companions.length > 0 && (
          <Section label="Companions">
            <View style={styles.chipRow}>
              {log.companions.map((c, i) => (
                <View key={i} style={styles.chip}>
                  <Text style={styles.chipText}>{c}</Text>
                </View>
              ))}
            </View>
          </Section>
        )}

        {/* Notes */}
        {log.notes && (
          <Section label="Notes">
            <Text style={styles.notesText}>{log.notes}</Text>
          </Section>
        )}
      </ScrollView>

      {/* Full-screen photo modal */}
      <Modal visible={!!fullScreenPhoto} transparent animationType="fade">
        <Pressable style={styles.modalBg} onPress={() => setFullScreenPhoto(null)}>
          {fullScreenPhoto && (
            <Image
              source={{ uri: fullScreenPhoto }}
              style={styles.fullPhoto}
              contentFit="contain"
              transition={150}
            />
          )}
        </Pressable>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: Colors.textSecondary,
    fontSize: 28,
    lineHeight: 32,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editText: {
    color: Colors.accent,
    fontSize: 15,
    fontWeight: '600',
  },
  deleteText: {
    fontSize: 18,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  gameCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
  },
  emoji: {
    fontSize: 36,
    marginBottom: 12,
  },
  teams: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  score: {
    fontSize: 24,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginTop: 4,
  },
  league: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 4,
  },
  date: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.accentSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 16,
  },
  scoreCardLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scoreCardValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 8,
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondary: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  starRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  starLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  stars: {
    fontSize: 16,
    color: Colors.accent,
    letterSpacing: 2,
  },
  photoScroll: {
    marginTop: 4,
  },
  photoRow: {
    gap: 10,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  notesText: {
    fontSize: 14,
    color: Colors.textPrimary,
    lineHeight: 20,
  },
  backLinkWrap: {
    marginTop: 16,
  },
  backLink: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600',
  },
  modalBg: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullPhoto: {
    width: '90%',
    height: '80%',
  },
});
