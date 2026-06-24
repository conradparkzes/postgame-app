import { useState } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { Input } from '@/src/components/ui/Input';
import { signUpWithEmail } from '@/src/lib/auth';

interface FormErrors {
  name?: string;
  username?: string;
  email?: string;
  password?: string;
  general?: string;
}

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): boolean {
    const next: FormErrors = {};
    if (!name.trim()) next.name = 'Full name is required.';
    if (!username.trim()) {
      next.username = 'Username is required.';
    } else if (!/^[a-z0-9_]{3,20}$/.test(username.toLowerCase())) {
      next.username = '3–20 characters, letters, numbers, and underscores only.';
    }
    if (!email.trim()) next.email = 'Email is required.';
    if (password.length < 8) next.password = 'Password must be at least 8 characters.';
    setErrors(next);
    return Object.keys(next).length === 0;
  }

  async function handleRegister() {
    if (!validate()) return;
    setLoading(true);
    try {
      const { error } = await signUpWithEmail(email.trim().toLowerCase(), password, username.toLowerCase(), name.trim());
      if (error) {
        setErrors({ general: error.message });
        return;
      }
      // Supabase sends an OTP email after signUp — navigate to verify
      router.push({ pathname: '/(auth)/verify', params: { email: email.trim().toLowerCase() } });
    } catch {
      setErrors({ general: 'Something went wrong. Please try again.' });
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <Button label="← Back" variant="text" onPress={() => router.back()} style={styles.backBtn} />
          <Text style={styles.title}>Create account</Text>
          <Text style={styles.subtitle}>{"You're one step away from your game log."}</Text>
        </View>

        <View style={styles.form}>
          {errors.general ? <Text style={styles.errorBanner}>{errors.general}</Text> : null}

          <Input
            label="Full name"
            placeholder="Your name"
            value={name}
            onChangeText={setName}
            autoCapitalize="words"
            autoComplete="name"
            textContentType="name"
            error={errors.name}
          />
          <Input
            label="Username"
            placeholder="yourhandle"
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase())}
            autoCapitalize="none"
            autoComplete="username-new"
            textContentType="username"
            error={errors.username}
          />
          <Input
            label="Email"
            placeholder="you@example.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            autoComplete="email"
            textContentType="emailAddress"
            error={errors.email}
          />
          <Input
            label="Password"
            placeholder="8+ characters"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="new-password"
            textContentType="newPassword"
            error={errors.password}
          />
          <Input
            label="Phone (optional)"
            placeholder="+1 555 000 0000"
            value={phone}
            onChangeText={setPhone}
            keyboardType="phone-pad"
            autoComplete="tel"
            textContentType="telephoneNumber"
          />
        </View>

        <Button
          label="Create Account"
          loading={loading}
          onPress={handleRegister}
          style={styles.submit}
        />

        <View style={styles.footer}>
          <Text style={styles.footerText}>{"Already have an account? "}</Text>
          <Button label="Sign in" variant="text" onPress={() => router.replace('/(auth)/login')} />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  container: {
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
