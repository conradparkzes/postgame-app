import { useState } from 'react';
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { signInWithEmail } from '@/src/lib/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleLogin() {
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setError(null);
    setLoading(true);
    try {
      const { error: authError } = await signInWithEmail(email.trim().toLowerCase(), password);
      if (authError) {
        setError(authError.message);
      }
      // auth guard in _layout.tsx handles the redirect on success
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.container}>
        <View style={styles.header}>
          <Button label="← Back" variant="text" onPress={() => router.back()} style={styles.backBtn} />
          <Text style={styles.title}>Welcome back</Text>
          <Text style={styles.subtitle}>Sign in to your PostGame account.</Text>
        </View>

        <View style={styles.form}>
          {error ? <Text style={styles.errorBanner}>{error}</Text> : null}

          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
          />
          <Input
            label="Password"
            placeholder="Your password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
          />
        </View>

        <Button
          label="Sign In"
          loading={loading}
          onPress={handleLogin}
          style={styles.submit}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Don't have an account? "}</Text>
          <Button label="Sign up" variant="text" onPress={() => router.replace('/(auth)/register')} />
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
    gap: 24,
  },
  header: {
    gap: 6,
  },
  backBtn: {
    alignSelf: 'flex-start',
    paddingLeft: 0,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
    marginTop: 8,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  form: {
    gap: 14,
  },
  errorBanner: {
    fontSize: 13,
    color: Colors.error,
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 8,
    padding: 12,
  },
  submit: {
    width: '100%',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
});
