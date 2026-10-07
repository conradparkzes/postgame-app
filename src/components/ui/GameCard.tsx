import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Colors } from '@/src/constants/colors';
import type { GameLog } from '@/src/types';
import { computePostGameScore, formatDate, formatScore, sportEmoji } from '@/src/lib/format';

interface GameCardProps {
  game: GameLog;
  onPress?: () => void;
}

export function GameCard({ game, onPress }: GameCardProps) {
  const score = computePostGameScore([
    game.atmosphere_rating,
    game.seating_rating,
    game.food_rating,
    game.accessibility_rating,
  ]);

  return (
    <Pressable
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}
      onPress={onPress}
    >
      <View style={styles.row}>
        <Text style={styles.emoji}>{sportEmoji(game.sport)}</Text>
        <View style={styles.info}>
          <Text style={styles.teams} numberOfLines={1}>
            {game.home_team} vs {game.away_team}
          </Text>
          <View style={styles.metaRow}>
            <Text style={styles.meta}>{formatDate(game.game_date)}</Text>
            {game.venue_name ? (
              <Text style={[styles.meta, styles.metaVenue]} numberOfLines={1}>
                {' · '}{game.venue_name}
              </Text>
            ) : null}
          </View>
          {(game.home_score != null || game.away_score != null) && (
            <Text style={styles.scoreLine}>{formatScore(game.home_score, game.away_score)}</Text>
          )}
        </View>
        {score !== '—' && (
          <View style={styles.badge}>
            <Text style={styles.badgeValue}>{score}</Text>
          </View>
        )}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 10,
  },
  pressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  emoji: {
    fontSize: 28,
    marginRight: 14,
  },
  info: {
    flex: 1,
  },
  teams: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  metaRow: {
    flexDirection: 'row',
    marginTop: 3,
  },
  meta: {
    fontSize: 13,
    color: Colors.textSecondary,
  },
  metaVenue: {
    // Ellipsize inside the row instead of overflowing into the score badge
    flexShrink: 1,
  },
  scoreLine: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  badge: {
    backgroundColor: Colors.accentSubtle,
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: Colors.accent,
    marginLeft: 10,
  },
  badgeValue: {
    fontSize: 16,
    fontWeight: '800',
    color: Colors.accent,
  },
});
