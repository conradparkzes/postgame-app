import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as Notifications from 'expo-notifications';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { supabase } from '@/src/lib/supabase';

export default function PermissionsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleAllow() {
    setLoading(true);
    try {
      // Request notification permission
      await Notifications.requestPermissionsAsync();
    } catch {
      // Silently continue — permission is optional
    } finally {
      await finishOnboarding();
    }
  }

  async function handleSkip() {
    await finishOnboarding();
  }

  async function finishOnboarding() {
    setLoading(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (user) {
        await supabase
          .from('profiles')
          .update({ onboarding_completed: true })
          .eq('id', user.id);
      }
      // auth guard detects onboarding_completed = true → redirects to (tabs)/feed
      // Force a session refresh so useAuth picks up the updated profile
      await supabase.auth.refreshSession();
    } catch {
      // Even on error, redirect — worst case they see onboarding again on next open
      router.replace('/(tabs)/feed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <View style={styles.iconCircle}>
          <Text style={styles.iconEmoji}>🔔</Text>
        </View>

        <Text style={styles.title}>Stay in the loop</Text>
        <Text style={styles.body}>
          {"Get notified when friends check in to a game, when it's been a year since you attended a match, or when your milestones are reached."}
        </Text>

        <View style={styles.permissionItem}>
          <Text style={styles.permissionIcon}>📲</Text>
          <View style={styles.permissionText}>
            <Text style={styles.permissionLabel}>Push Notifications</Text>
            <Text style={styles.permissionDesc}>Friend activity, memories, milestones</Text>
          </View>
        </View>
      </View>

      <View style={styles.footer}>
        <Button
          label="Allow Notifications"
          loading={loading}
          onPress={handleAllow}
          style={styles.cta}
        />
        <Button
          label="Not now"
          variant="text"
          onPress={handleSkip}
          disabled={loading}
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
  permissionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: 12,
    padding: 16,
    gap: 14,
    width: '100%',
    marginTop: 8,
  },
  permissionIcon: {
    fontSize: 28,
  },
  permissionText: {
    flex: 1,
  },
  permissionLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  permissionDesc: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  footer: {
    gap: 8,
    alignItems: 'center',
  },
  cta: {
    width: '100%',
  },
});
