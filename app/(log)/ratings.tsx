import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

const RATINGS = [
  { key: 'atmosphere_rating' as const, label: 'Atmosphere' },
  { key: 'seating_rating' as const,    label: 'Seating' },
  { key: 'food_rating' as const,       label: 'Food & Drink' },
  { key: 'accessibility_rating' as const, label: 'Accessibility' },
];

type RatingKey = 'atmosphere_rating' | 'seating_rating' | 'food_rating' | 'accessibility_rating';

function StarRow({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number | undefined;
  onChange: (v: number) => void;
}) {
  return (
    <View style={styles.ratingRow}>
      <Text style={styles.ratingLabel}>{label}</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={6}>
            <Text style={[styles.star, value != null && n <= value && styles.starFilled]}>
              ★
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

function computePostGameScore(vals: (number | undefined)[]): string {
  const filled = vals.filter((v): v is number => v != null);
  if (filled.length === 0) return '—';
  const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
  return avg.toFixed(1);
}

export default function RatingsScreen() {
  const router = useRouter();
  const { updateDraft } = useLogDraft();

  const [ratings, setRatings] = useState<Partial<Record<RatingKey, number>>>({});

  function setRating(key: RatingKey, value: number) {
    setRatings((prev) => ({ ...prev, [key]: value }));
  }

  function handleContinue() {
    updateDraft(ratings);
    router.push('/(log)/photos');
  }

  function handleSkip() {
    router.push('/(log)/photos');
  }

  const postGameScore = computePostGameScore(RATINGS.map((r) => ratings[r.key]));

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={5} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Rate your experience</Text>
        <Text style={styles.subtitle}>All optional — rate what you remember.</Text>

        <View style={styles.card}>
          {RATINGS.map((r) => (
            <StarRow
              key={r.key}
              label={r.label}
              value={ratings[r.key]}
              onChange={(v) => setRating(r.key, v)}
            />
          ))}
        </View>

        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>PostGame Score</Text>
          <Text style={styles.scoreValue}>{postGameScore}</Text>
        </View>

        <Button label="Continue" onPress={handleContinue} style={styles.cta} />
        <Button label="Skip" variant="text" onPress={handleSkip} style={styles.skip} />
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
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 24,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 20,
  },
  ratingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  ratingLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: Colors.textPrimary,
  },
  stars: {
    flexDirection: 'row',
    gap: 6,
  },
  star: {
    fontSize: 26,
    color: Colors.surfaceBorder,
  },
  starFilled: {
    color: Colors.accent,
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
    marginBottom: 24,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  cta: {
    marginTop: 0,
  },
  skip: {
    marginTop: 4,
  },
});
