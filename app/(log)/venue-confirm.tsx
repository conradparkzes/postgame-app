import { useState } from 'react';
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

function toDateString(d: Date): string {
  return d.toISOString().substring(0, 10);
}

function parseDateString(s?: string): Date {
  if (!s) return new Date();
  const [y, m, d] = s.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function VenueConfirmScreen() {
  const router = useRouter();
  const { draft, updateDraft } = useLogDraft();

  const [venueName, setVenueName] = useState(draft.venue_name ?? '');
  const [venueCity, setVenueCity] = useState(draft.venue_city ?? '');
  const [venueCountry, setVenueCountry] = useState(draft.venue_country ?? '');
  const [gameDate, setGameDate] = useState(parseDateString(draft.game_date));
  const [showDatePicker, setShowDatePicker] = useState(false);

  function formatDisplayDate(d: Date) {
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function handleContinue() {
    updateDraft({
      venue_name: venueName.trim() || undefined,
      venue_city: venueCity.trim() || undefined,
      venue_country: venueCountry.trim() || undefined,
      game_date: toDateString(gameDate),
    });
    router.push('/(log)/seat-entry');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={3} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Confirm venue & date</Text>
        <Text style={styles.subtitle}>Edit anything that looks off.</Text>

        {/* Game summary */}
        <View style={styles.gameCard}>
          <Text style={styles.gameTeams}>
            {draft.home_team} vs {draft.away_team}
          </Text>
          {draft.league ? <Text style={styles.gameLeague}>{draft.league}</Text> : null}
        </View>

        {/* Date picker */}
        <Text style={styles.fieldLabel}>Game Date</Text>
        <Pressable style={styles.dateButton} onPress={() => setShowDatePicker(true)}>
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

        <Input
          label="Venue Name"
          placeholder="e.g. Arrowhead Stadium"
          value={venueName}
          onChangeText={setVenueName}
          containerStyle={styles.field}
        />
        <Input
          label="City"
          placeholder="e.g. Kansas City"
          value={venueCity}
          onChangeText={setVenueCity}
          containerStyle={styles.field}
        />
        <Input
          label="Country"
          placeholder="e.g. United States"
          value={venueCountry}
          onChangeText={setVenueCountry}
          containerStyle={styles.field}
        />

        <Button label="Looks good" onPress={handleContinue} style={styles.cta} />
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
    marginBottom: 20,
  },
  gameCard: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  gameTeams: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  gameLeague: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
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
  field: {
    marginBottom: 16,
  },
  cta: {
    marginTop: 8,
  },
});
