import { useState } from 'react';
import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';
import { SPORT_LABELS } from '@/src/data/popular-teams';

function toDateString(d: Date): string {
  return d.toISOString().substring(0, 10);
}

export default function ManualEntryScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useLogDraft();

  const [homeTeam, setHomeTeam] = useState('');
  const [awayTeam, setAwayTeam] = useState('');
  const [league, setLeague] = useState('');
  const [homeScore, setHomeScore] = useState('');
  const [awayScore, setAwayScore] = useState('');
  const [venueName, setVenueName] = useState('');
  const [venueCity, setVenueCity] = useState('');
  const [gameDate, setGameDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sportLabel = draft.sport ? SPORT_LABELS[draft.sport] : '';

  function handleContinue() {
    setError(null);
    if (!homeTeam.trim() || !awayTeam.trim() || !league.trim()) {
      setError('Home team, away team, and league are required.');
      return;
    }

    updateDraft({
      home_team: homeTeam.trim(),
      away_team: awayTeam.trim(),
      league: league.trim(),
      home_score: homeScore ? parseInt(homeScore, 10) : null,
      away_score: awayScore ? parseInt(awayScore, 10) : null,
      game_date: toDateString(gameDate),
      venue_name: venueName.trim() || undefined,
      venue_city: venueCity.trim() || undefined,
    });
    router.push('/(log)/venue-confirm');
  }

  function formatDisplayDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={2} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Enter game details</Text>
        {sportLabel ? <Text style={styles.subtitle}>{sportLabel}</Text> : null}

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <Input
          label="Home Team *"
          placeholder="e.g. Chicago Bulls"
          value={homeTeam}
          onChangeText={setHomeTeam}
          containerStyle={styles.field}
        />
        <Input
          label="Away Team *"
          placeholder="e.g. Los Angeles Lakers"
          value={awayTeam}
          onChangeText={setAwayTeam}
          containerStyle={styles.field}
        />
        <Input
          label="League *"
          placeholder="e.g. NBA"
          value={league}
          onChangeText={setLeague}
          containerStyle={styles.field}
        />

        {/* Date picker */}
        <Text style={styles.fieldLabel}>Game Date *</Text>
        <Pressable
          style={styles.dateButton}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={styles.dateButtonText}>{formatDisplayDate(gameDate)}</Text>
        </Pressable>
        {showDatePicker && (
          <DateTimePicker
            value={gameDate}
            mode="date"
            maximumDate={new Date()}
            onChange={(_, selected) => {
              setShowDatePicker(Platform.OS === 'ios');
              if (selected) setGameDate(selected);
            }}
          />
        )}

        <Text style={styles.sectionLabel}>Final Score (optional)</Text>
        <View style={styles.scoreRow}>
          <Input
            label="Home"
            placeholder="0"
            value={homeScore}
            onChangeText={setHomeScore}
            keyboardType="numeric"
            containerStyle={styles.scoreField}
          />
          <Text style={styles.scoreDash}>–</Text>
          <Input
            label="Away"
            placeholder="0"
            value={awayScore}
            onChangeText={setAwayScore}
            keyboardType="numeric"
            containerStyle={styles.scoreField}
          />
        </View>

        <Input
          label="Venue Name"
          placeholder="e.g. United Center"
          value={venueName}
          onChangeText={setVenueName}
          containerStyle={styles.field}
        />
        <Input
          label="City"
          placeholder="e.g. Chicago"
          value={venueCity}
          onChangeText={setVenueCity}
          containerStyle={styles.field}
        />

        <Button label="Continue" onPress={handleContinue} style={styles.cta} />
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
  errorBanner: {
    padding: 12,
    backgroundColor: '#331207',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  field: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  dateButton: {
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    justifyContent: 'center',
    marginBottom: 16,
  },
  dateButtonText: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  sectionLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textTertiary,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    marginBottom: 12,
    marginTop: 4,
  },
  scoreRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 12,
    marginBottom: 16,
  },
  scoreField: {
    flex: 1,
  },
  scoreDash: {
    fontSize: 20,
    color: Colors.textTertiary,
    paddingBottom: 14,
  },
  cta: {
    marginTop: 8,
  },
});
