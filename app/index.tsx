import { Redirect } from 'expo-router';

// Entry point — redirects to auth welcome until v0.2 implements the real auth guard.
export default function Index() {
  return <Redirect href="/(auth)/welcome" />;
}
