/**
 * Auth helpers for PostGame.
 *
 * Social auth prerequisites (configure once in Supabase Dashboard):
 *   Apple  → Auth > Providers > Apple (requires Apple Developer account + Service ID)
 *   Google → Auth > Providers > Google (requires Google Cloud Console OAuth client)
 *
 * The redirect URI to register in both provider consoles:
 *   <your-supabase-project>.supabase.co/auth/v1/callback
 */

import * as AppleAuthentication from 'expo-apple-authentication';
import * as WebBrowser from 'expo-web-browser';
import { makeRedirectUri } from 'expo-auth-session';
import { Platform } from 'react-native';
import { supabase } from './supabase';

WebBrowser.maybeCompleteAuthSession();

// ---------------------------------------------------------------------------
// Email / password
// ---------------------------------------------------------------------------

export async function signUpWithEmail(
  email: string,
  password: string,
  username: string,
  displayName: string,
) {
  return supabase.auth.signUp({
    email,
    password,
    options: {
      data: { username, display_name: displayName },
    },
  });
}

export async function signInWithEmail(email: string, password: string) {
  return supabase.auth.signInWithPassword({ email, password });
}

export async function verifyOtp(email: string, token: string) {
  return supabase.auth.verifyOtp({ email, token, type: 'email' });
}

export async function resendOtp(email: string) {
  return supabase.auth.resend({ email, type: 'signup' });
}

export async function signOut() {
  return supabase.auth.signOut();
}

// ---------------------------------------------------------------------------
// Sign in with Apple (iOS only — button hidden on Android/web)
// ---------------------------------------------------------------------------

export async function signInWithApple() {
  const credential = await AppleAuthentication.signInAsync({
    requestedScopes: [
      AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
      AppleAuthentication.AppleAuthenticationScope.EMAIL,
    ],
  });

  if (!credential.identityToken) {
    throw new Error('Apple Sign In did not return an identity token.');
  }

  return supabase.auth.signInWithIdToken({
    provider: 'apple',
    token: credential.identityToken,
  });
}

export const isAppleAuthAvailable = Platform.OS === 'ios';

// ---------------------------------------------------------------------------
// Sign in with Google (OAuth via system browser)
// ---------------------------------------------------------------------------

export async function signInWithGoogle() {
  const redirectTo = makeRedirectUri({ scheme: 'postgame', path: 'auth/callback' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo, skipBrowserRedirect: true },
  });

  if (error) throw error;
  if (!data.url) throw new Error('Google Sign In did not return an OAuth URL.');

  const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);

  if (result.type === 'success') {
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(result.url);
    if (sessionError) throw sessionError;
  }

  return result;
}
