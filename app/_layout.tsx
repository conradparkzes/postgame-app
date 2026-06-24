import { useEffect, useRef } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useAuth } from '@/src/hooks/useAuth';

// Keep the native splash visible until we've resolved auth state.
SplashScreen.preventAutoHideAsync();

function AuthGate() {
  const { session, profile, loading } = useAuth();
  const router = useRouter();
  const segments = useSegments() as string[];
  const splashHidden = useRef(false);

  useEffect(() => {
    if (loading) return;

    if (!splashHidden.current) {
      splashHidden.current = true;
      SplashScreen.hideAsync().catch(() => {});
    }

    const inAuthGroup = segments[0] === '(auth)';
    const inTabsGroup = segments[0] === '(tabs)';
    const inLogGroup = segments[0] === '(log)';
    const inGameGroup = segments[0] === '(game)';

    if (!session) {
      // Not signed in — always send to auth
      if (!inAuthGroup) router.replace('/(auth)/welcome');
      return;
    }

    if (!profile?.onboarding_completed) {
      // Signed in but hasn't finished onboarding
      if (segments[0] !== '(auth)' || segments[1] !== 'onboarding') {
        router.replace('/(auth)/onboarding/team-selection');
      }
      return;
    }

    // Fully authenticated and onboarded — send to main app
    if (!inTabsGroup && !inLogGroup && !inGameGroup) router.replace('/(tabs)/feed');
  }, [loading, session, profile, segments, router]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" />
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
      <Stack.Screen
        name="(log)"
        options={{
          presentation: 'fullScreenModal',
          animation: 'slide_from_bottom',
          headerShown: false,
        }}
      />
      <Stack.Screen name="(game)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  return <AuthGate />;
}
