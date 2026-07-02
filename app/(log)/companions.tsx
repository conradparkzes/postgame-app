import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

export default function CompanionsScreen() {
  const router = useRouter();
  const { updateDraft } = useLogDraft();

  const [input, setInput] = useState('');
  const [companions, setCompanions] = useState<string[]>([]);

  function addCompanion() {
    const name = input.trim();
    if (!name || companions.includes(name)) return;
    setCompanions((prev) => [...prev, name]);
    setInput('');
  }

  function removeCompanion(name: string) {
    setCompanions((prev) => prev.filter((c) => c !== name));
  }

  function handleContinue() {
    if (companions.length > 0) updateDraft({ companions });
    router.push('/(log)/notes');
  }

  function handleSkip() {
    router.push('/(log)/notes');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={7} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <Text style={styles.title}>Who were you with?</Text>
        <Text style={styles.subtitle}>Add names of people you attended with.</Text>

        <View style={styles.inputRow}>
          <TextInput
            style={styles.input}
            placeholder="Name"
            placeholderTextColor={Colors.textTertiary}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={addCompanion}
            returnKeyType="done"
            autoCapitalize="words"
          />
          <Pressable
            style={({ pressed }) => [styles.addBtn, pressed && styles.addBtnPressed]}
            onPress={addCompanion}
          >
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {companions.length > 0 && (
          <View style={styles.chips}>
            {companions.map((name) => (
              <Pressable
                key={name}
                style={styles.chip}
                onPress={() => removeCompanion(name)}
              >
                <Text style={styles.chipText}>{name}</Text>
                <Text style={styles.chipRemove}>  ✕</Text>
              </Pressable>
            ))}
          </View>
        )}

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
  inputRow: {
    flexDirection: 'row',
    gap: 10,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    height: 52,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  addBtn: {
    height: 52,
    paddingHorizontal: 20,
    borderRadius: 12,
    backgroundColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnPressed: {
    backgroundColor: Colors.accentDim,
  },
  addBtnText: {
    color: Colors.textInverse,
    fontWeight: '700',
    fontSize: 15,
  },
  chips: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accentSubtle,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    color: Colors.accent,
  },
  chipRemove: {
    fontSize: 11,
    color: Colors.accent,
  },
  cta: {},
  skip: {
    marginTop: 4,
  },
});
