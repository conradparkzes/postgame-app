import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useLogDraft } from '@/src/context/LogContext';
import type { Sport } from '@/src/types';

const SPORTS: { sport: Sport; label: string; emoji: string }[] = [
  { sport: 'american_football', label: 'NFL',     emoji: '🏈' },
  { sport: 'basketball',        label: 'NBA',     emoji: '🏀' },
  { sport: 'baseball',          label: 'MLB',     emoji: '⚾' },
  { sport: 'ice_hockey',        label: 'NHL',     emoji: '🏒' },
  { sport: 'football',          label: 'Soccer',  emoji: '⚽' },
];

export default function SportSelectionScreen() {
  const router = useRouter();
  const { updateDraft, resetDraft } = useLogDraft();

  function handleSelect(sport: Sport) {
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
        <View style={styles.closeButton} />
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {SPORTS.map(({ sport, label, emoji }) => (
          <Pressable
            key={sport}
            style={({ pressed }) => [styles.tile, pressed && styles.tilePressed]}
            onPress={() => handleSelect(sport)}
          >
            <Text style={styles.emoji}>{emoji}</Text>
            <Text style={styles.tileLabel}>{label}</Text>
          </Pressable>
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
    width: '44%',
    aspectRatio: 1.4,
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  tilePressed: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.accent,
  },
  emoji: {
    fontSize: 36,
  },
  tileLabel: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    letterSpacing: 0.3,
  },
});
