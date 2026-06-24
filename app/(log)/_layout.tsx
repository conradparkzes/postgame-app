import { Stack } from 'expo-router';
import { LogProvider } from '@/src/context/LogContext';

export default function LogLayout() {
  return (
    <LogProvider>
      <Stack screenOptions={{ headerShown: false }} />
    </LogProvider>
  );
}
