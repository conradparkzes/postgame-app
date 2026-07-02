import { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { successHaptic } from '@/src/lib/haptics';

function formatDate(d?: string) {
  if (!d) return '';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

export default function ConfirmationScreen() {
  const router = useRouter();
  const { draft } = useLogDraft();

  // Staggered reveal: check ring pops in, then heading → card → buttons rise up
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const contentAnim = useRef(new Animated.Value(0)).current;
  const cardAnim = useRef(new Animated.Value(0)).current;
  const actionsAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    successHaptic(); // fires as the check ring pops in
    Animated.parallel([
      Animated.spring(scale, {
        toValue: 1,
        useNativeDriver: true,
        tension: 90,
        friction: 6,
      }),
      Animated.timing(opacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.sequence([
        Animated.delay(220),
        Animated.stagger(110, [
          Animated.timing(contentAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(cardAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
          Animated.timing(actionsAnim, { toValue: 1, duration: 350, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, [scale, opacity, contentAnim, cardAnim, actionsAnim]);

  // Fade in while rising 14px into place
  const rise = (v: Animated.Value) => ({
    opacity: v,
    transform: [
      { translateY: v.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
    ],
  });

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

      <Animated.View style={[{ alignItems: 'center' }, rise(contentAnim)]}>
        <Text style={styles.heading}>Game logged!</Text>
        <Text style={styles.sub}>Your experience has been saved.</Text>
      </Animated.View>

      {/* Game summary */}
      <Animated.View style={[styles.card, rise(cardAnim)]}>
        <Text style={styles.teams}>
          {draft.home_team} vs {draft.away_team}
        </Text>
        {draft.game_date ? (
          <Text style={styles.meta}>{formatDate(draft.game_date)}</Text>
        ) : null}
        {draft.venue_name ? (
          <Text style={styles.meta}>{draft.venue_name}</Text>
        ) : null}
      </Animated.View>

      <Animated.View style={[styles.actions, rise(actionsAnim)]}>
        {draft.savedGameLogId && (
          <Button label="View Game" onPress={handleViewGame} style={styles.doneBtn} />
        )}
        <Button label="Done" onPress={handleDone} variant="secondary" style={styles.doneBtn} />
      </Animated.View>
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
