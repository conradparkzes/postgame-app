import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';

export default function FirstGameScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Icon / illustration placeholder */}
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🏟️</Text>
        </View>

        <Text style={styles.title}>Log your first game</Text>
        <Text style={styles.body}>
          {"Every game you've attended lives here — scores, your seat, ratings, photos, and notes.\n\nStart with your most recent, or go back to the first match you ever saw."}
        </Text>
      </View>

      <View style={styles.footer}>
        <Button
          label="Log a Game"
          onPress={() => router.push('/(auth)/onboarding/permissions')}
          style={styles.cta}
        />
        <Button
          label="I'll do this later"
          variant="text"
          onPress={() => router.push('/(auth)/onboarding/permissions')}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 20,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.accentSubtle,
    borderWidth: 1.5,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  iconEmoji: {
    fontSize: 44,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  body: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: 320,
  },
  footer: {
    gap: 8,
    alignItems: 'center',
  },
  cta: {
    width: '100%',
  },
});
