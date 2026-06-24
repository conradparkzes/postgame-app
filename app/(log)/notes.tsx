import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

const MAX_CHARS = 1000;

export default function NotesScreen() {
  const router = useRouter();
  const { updateDraft } = useLogDraft();

  const [notes, setNotes] = useState('');

  function handleContinue() {
    if (notes.trim()) updateDraft({ notes: notes.trim() });
    router.push('/(log)/review');
  }

  function handleSkip() {
    router.push('/(log)/review');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={8} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Any notes?</Text>
        <Text style={styles.subtitle}>Memorable moments, highlights, anything you want to remember.</Text>

        <TextInput
          style={styles.textArea}
          placeholder="Write something…"
          placeholderTextColor={Colors.textTertiary}
          value={notes}
          onChangeText={(t) => setNotes(t.slice(0, MAX_CHARS))}
          multiline
          numberOfLines={6}
          textAlignVertical="top"
        />
        <Text style={styles.charCount}>{notes.length} / {MAX_CHARS}</Text>

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
    marginBottom: 20,
  },
  textArea: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 140,
    marginBottom: 6,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginBottom: 20,
  },
  cta: {},
  skip: {
    marginTop: 4,
  },
});
