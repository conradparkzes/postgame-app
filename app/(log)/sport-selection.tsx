import { useEffect, useRef } from 'react';
import { Animated, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useLogDraft } from '@/src/context/LogContext';
import { tapHaptic } from '@/src/lib/haptics';
import type { Sport } from '@/src/types';

const SPORTS: { sport: Sport; label: string; emoji: string }[] = [
  { sport: 'american_football', label: 'NFL',     emoji: '🏈' },
  { sport: 'basketball',        label: 'NBA',     emoji: '🏀' },
  { sport: 'baseball',          label: 'MLB',     emoji: '⚾' },
  { sport: 'ice_hockey',        label: 'NHL',     emoji: '🏒' },
  { sport: 'football',          label: 'Soccer',  emoji: '⚽' },
];

function SportTile({
  label,
  emoji,
  index,
  onSelect,
}: {
  label: string;
  emoji: string;
  index: number;
  onSelect: () => void;
}) {
  // Staggered entrance: each tile fades in while rising into place
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(anim, {
      toValue: 1,
      duration: 300,
      delay: index * 55,
      useNativeDriver: true,
    }).start();
  }, [anim, index]);

  return (
    <Animated.View
      style={{
        width: '44%',
        opacity: anim,
        transform: [
          { translateY: anim.interpolate({ inputRange: [0, 1], outputRange: [14, 0] }) },
        ],
      }}
    >
      <Pressable
        onPress={onSelect}
        style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
      >
        {({ pressed }) => (
          <>
            <View style={[styles.badge, pressed && styles.badgePressed]}>
              <Text style={styles.emoji}>{emoji}</Text>
            </View>
            <Text style={styles.tileLabel}>{label}</Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
}

export default function SportSelectionScreen() {
  const router = useRouter();
  const { updateDraft, resetDraft } = useLogDraft();

  function handleSelect(sport: Sport) {
    tapHaptic();
    resetDraft();
    updateDraft({ sport });
    router.push('/(log)/game-search');
  }

  function handleDismiss() {
    router.back();
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={handleDismiss} style={styles.closeButton} hitSlop={12}>
          <Text style={styles.closeText}>✕</Text>
        </Pressable>
        <Text style={styles.title}>What sport?</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {SPORTS.map(({ sport, label, emoji }, i) => (
          <SportTile
            key={sport}
            label={label}
            emoji={emoji}
            index={i}
            onSelect={() => handleSelect(sport)}
          />
        ))}
      </ScrollView>
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
    marginBottom: 32,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceRaised,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeText: {
    color: Colors.textSecondary,
    fontSize: 14,
    fontWeight: '600',
  },
  headerSpacer: {
    width: 36,
    height: 36,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: 20,
    gap: 12,
    justifyContent: 'center',
  },
  tile: {
    width: '100%',
    aspectRatio: 1.4,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  tilePressed: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.accent,
    transform: [{ scale: 0.97 }],
  },
  badge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgePressed: {
    backgroundColor: Colors.accentSubtle,
    borderColor: Colors.accent,
  },
  emoji: {
    fontSize: 26,
    lineHeight: 32,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
});
