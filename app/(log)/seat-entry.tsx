import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

export default function SeatEntryScreen() {
  const router = useRouter();
  const { updateDraft } = useLogDraft();

  const [section, setSection] = useState('');
  const [row, setRow] = useState('');
  const [seatNumber, setSeatNumber] = useState('');

  function handleContinue() {
    updateDraft({
      seat_section: section.trim() || undefined,
      seat_row: row.trim() || undefined,
      seat_number: seatNumber.trim() || undefined,
    });
    router.push('/(log)/ratings');
  }

  function handleSkip() {
    router.push('/(log)/ratings');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={4} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Where were you sitting?</Text>
        <Text style={styles.subtitle}>All fields are optional.</Text>

        <Input
          label="Section"
          placeholder="e.g. 114, GA, Box A"
          value={section}
          onChangeText={setSection}
          containerStyle={styles.field}
          autoCapitalize="characters"
        />
        <Input
          label="Row"
          placeholder="e.g. 12, A, Front"
          value={row}
          onChangeText={setRow}
          containerStyle={styles.field}
          autoCapitalize="characters"
        />
        <Input
          label="Seat Number"
          placeholder="e.g. 7"
          value={seatNumber}
          onChangeText={setSeatNumber}
          containerStyle={styles.field}
          keyboardType="default"
        />

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
  field: {
    marginBottom: 16,
  },
  cta: {
    marginTop: 8,
  },
  skip: {
    marginTop: 4,
  },
});
