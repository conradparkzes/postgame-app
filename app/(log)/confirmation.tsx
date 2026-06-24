import { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';

function formatDate(d?: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { draft } = useLogDraft();

  // Animated checkmark
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 80,
        friction: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  function handleDone() {
    router.dismissAll();
  }

  function handleViewGame() {
    if (draft.savedGameLogId) {
      router.dismissAll();
      // Small delay to let the modal dismiss before pushing the new route
      setTimeout(() => {
        router.push(`/(game)/${draft.savedGameLogId}`);
      }, 100);
    }
  }

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.checkWrap, { transform: [{ scale }], opacity }]}>
        <Text style={styles.check}>✓</Text>
      </Animated.View>

      <Text style={styles.heading}>Game logged!</Text>
      <Text style={styles.sub}>Your experience has been saved.</Text>

      {/* Game summary */}
      <View style={styles.card}>
        <Text style={styles.teams}>
          {draft.home_team} vs {draft.away_team}
        </Text>
        {draft.game_date ? (
          <Text style={styles.meta}>{formatDate(draft.game_date)}</Text>
        ) : null}
        {draft.venue_name ? (
          <Text style={styles.meta}>{draft.venue_name}</Text>
        ) : null}
      </View>

      <View style={styles.actions}>
        {draft.savedGameLogId && (
          <Button label="View Game" onPress={handleViewGame} style={styles.doneBtn} />
        )}
        <Button label="Done" onPress={handleDone} variant="secondary" style={styles.doneBtn} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  checkWrap: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: Colors.accentSubtle,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  check: {
    fontSize: 44,
    color: Colors.accent,
    fontWeight: '700',
  },
  heading: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    marginBottom: 8,
  },
  sub: {
    fontSize: 15,
    color: Colors.textSecondary,
    marginBottom: 32,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 20,
    alignItems: 'center',
    gap: 6,
    marginBottom: 40,
  },
  teams: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
    textAlign: 'center',
  },
  meta: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 12,
  },
  doneBtn: {},
});
