import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { fetchUserGameLogs } from '@/src/lib/game-queries';
import { GameCard } from '@/src/components/ui/GameCard';
import type { GameLog } from '@/src/types';

function formatJoinDate(iso: string): string {
  const d = new Date(iso);
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

function getInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function ProfileScreen() {
  const router = useRouter();
  const { session, profile } = useAuth();
  const [games, setGames] = useState<GameLog[]>([]);
  const [loading, setLoading] = useState(true);

  const loadGames = useCallback(async () => {
    if (!session?.user) return;
    try {
      const data = await fetchUserGameLogs(session.user.id);
      setGames(data);
    } catch {
      // Silently fail — user will see empty state
    } finally {
      setLoading(false);
    }
  }, [session?.user?.id]);

  // Reload when tab is focused (e.g. after logging a new game)
  useFocusEffect(
    useCallback(() => {
      loadGames();
    }, [loadGames]),
  );

  const uniqueSports = new Set(games.map((g) => g.sport)).size;

  return (
    <View style={styles.container}>
      <FlatList
        data={games}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          <>
            {/* Avatar */}
            <View style={styles.avatarWrap}>
              <View style={styles.avatar}>
                <Text style={styles.initials}>
                  {profile ? getInitials(profile.display_name, profile.username) : '??'}
                </Text>
              </View>
            </View>

            {/* Name & Username */}
            <Text style={styles.displayName}>
              {profile?.display_name || profile?.username || '—'}
            </Text>
            {profile?.display_name && (
              <Text style={styles.username}>@{profile.username}</Text>
            )}
            {profile?.bio ? <Text style={styles.bio}>{profile.bio}</Text> : null}

            {/* Stats row */}
            <View style={styles.statsRow}>
              <View style={styles.stat}>
                <Text style={styles.statValue}>{games.length}</Text>
                <Text style={styles.statLabel}>Games</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>{uniqueSports}</Text>
                <Text style={styles.statLabel}>Sports</Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.stat}>
                <Text style={styles.statValue}>
                  {profile ? formatJoinDate(profile.created_at) : '—'}
                </Text>
                <Text style={styles.statLabel}>Since</Text>
              </View>
            </View>

            {/* Section header */}
            <Text style={styles.sectionHeader}>Game Log</Text>
          </>
        }
        renderItem={({ item }) => (
          <GameCard
            game={item}
            onPress={() => router.push(`/(game)/${item.id}`)}
          />
        )}
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator color={Colors.accent} style={{ marginTop: 32 }} />
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyIcon}>🏟️</Text>
              <Text style={styles.emptyTitle}>No games logged yet</Text>
              <Text style={styles.emptySub}>
                Tap the Log tab to record your first game experience.
              </Text>
            </View>
          )
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  listContent: {
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 32,
  },
  avatarWrap: {
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 28,
    fontWeight: '700',
    color: Colors.accent,
  },
  displayName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  username: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 2,
  },
  bio: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 20,
  },
  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 16,
    marginTop: 20,
    marginBottom: 24,
  },
  stat: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  statLabel: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginBottom: 12,
  },
  emptyState: {
    alignItems: 'center',
    marginTop: 40,
    paddingHorizontal: 32,
  },
  emptyIcon: {
    fontSize: 48,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: Colors.textPrimary,
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
  },
});
