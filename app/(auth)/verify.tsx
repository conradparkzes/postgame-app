import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { OtpInput } from '@/src/components/ui/OtpInput';
import { verifyOtp, resendOtp } from '@/src/lib/auth';

export default function VerifyScreen() {
  const { email } = useLocalSearchParams<{ email: string }>();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resent, setResent] = useState(false);

  async function handleVerify(code: string) {
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    try {
      const { error: otpError } = await verifyOtp(email, code);
      if (otpError) {
        setError('Invalid or expired code. Please try again.');
        return;
      }
      // auth guard handles redirect to onboarding
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    setResending(true);
    setError(null);
    try {
      await resendOtp(email);
      setResent(true);
      setTimeout(() => setResent(false), 5000);
    } catch {
      setError('Could not resend code. Please try again.');
    } finally {
      setResending(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Button label="← Back" variant="text" onPress={() => router.back()} style={styles.backBtn} />
        <Text style={styles.title}>Check your email</Text>
        <Text style={styles.subtitle}>
          We sent a 6-digit code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
      </View>

      <View style={styles.otpArea}>
        <OtpInput onComplete={handleVerify} error={error ?? undefined} />
        {loading && <Text style={styles.verifyingText}>Verifying…</Text>}
      </View>

      <View style={styles.resend}>
        {resent ? (
          <Text style={styles.resentText}>Code resent!</Text>
        ) : (
          <>
            <Text style={styles.resendLabel}>{"Didn't receive it?"}</Text>
            <Button
              label="Resend code"
              variant="text"
              loading={resending}
              onPress={handleResend}
            />
          </>
        )}
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
    gap: 40,
  },
  header: {
    gap: 8,
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
    lineHeight: 22,
  },
  emailHighlight: {
    color: Colors.textPrimary,
    fontWeight: '600',
  },
  otpArea: {
    alignItems: 'center',
    gap: 16,
  },
  verifyingText: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resend: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  resendLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  resentText: {
    fontSize: 14,
    color: Colors.success,
  },
});
