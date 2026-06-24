import { useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { signInWithApple, signInWithGoogle } from '@/src/lib/auth';

export default function WelcomeScreen() {
  const router = useRouter();
  const [appleAvailable, setAppleAvailable] = useState(false);
  const [socialLoading, setSocialLoading] = useState<'apple' | 'google' | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (Platform.OS === 'ios') {
      AppleAuthentication.isAvailableAsync().then(setAppleAvailable);
    }
  }, []);

  async function handleApple() {
    setError(null);
    setSocialLoading('apple');
    try {
      await signInWithApple();
      // auth guard in _layout.tsx handles redirect
    } catch (e: unknown) {
      if ((e as { code?: string }).code !== 'ERR_REQUEST_CANCELED') {
        setError('Apple sign in failed. Please try again.');
      }
    } finally {
      setSocialLoading(null);
    }
  }

  async function handleGoogle() {
    setError(null);
    setSocialLoading('google');
    try {
      await signInWithGoogle();
    } catch {
      setError('Google sign in failed. Please try again.');
    } finally {
      setSocialLoading(null);
    }
  }

  return (
    <View style={styles.container}>
      {/* Logo area */}
      <View style={styles.hero}>
        <Image
          source={require('@/assets/icon.png')}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={styles.wordmark}>PostGame</Text>
        <Text style={styles.tagline}>Log every game. Relive every moment.</Text>
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        <Button
          label="Get Started"
          onPress={() => router.push('/(auth)/register')}
          style={styles.cta}
        />

        <Button
          label="Sign In"
          variant="secondary"
          onPress={() => router.push('/(auth)/login')}
          style={styles.secondaryCta}
        />

        {/* Divider */}
        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerLabel}>or continue with</Text>
          <View style={styles.dividerLine} />
        </View>

        {/* Social sign-in */}
        <View style={styles.social}>
          <Button
            label="Continue with Google"
            variant="secondary"
            loading={socialLoading === 'google'}
            onPress={handleGoogle}
            style={styles.socialBtn}
          />
          {appleAvailable && (
            <Button
              label="Continue with Apple"
              variant="secondary"
              loading={socialLoading === 'apple'}
              onPress={handleApple}
              style={styles.socialBtn}
            />
          )}
        </View>
      </View>

      <Text style={styles.legal}>
        By continuing you agree to our{' '}
        <Text style={styles.legalLink}>Terms of Service</Text> and{' '}
        <Text style={styles.legalLink}>Privacy Policy</Text>.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: 24,
    paddingBottom: 40,
    justifyContent: 'space-between',
  },
  hero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  logo: {
    width: 80,
    height: 80,
    borderRadius: 18,
    marginBottom: 4,
  },
  wordmark: {
    fontSize: 36,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  actions: {
    gap: 12,
  },
  cta: {
    width: '100%',
  },
  secondaryCta: {
    width: '100%',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
    gap: 10,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.border,
  },
  dividerLabel: {
    fontSize: 13,
    color: Colors.textTertiary,
  },
  social: {
    gap: 10,
  },
  socialBtn: {
    width: '100%',
  },
  errorText: {
    fontSize: 13,
    color: Colors.error,
    textAlign: 'center',
    marginBottom: 4,
  },
  legal: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 20,
    lineHeight: 18,
  },
  legalLink: {
    color: Colors.textSecondary,
    textDecorationLine: 'underline',
  },
});
