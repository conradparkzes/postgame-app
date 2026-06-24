import { Tabs, useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';

export default function TabLayout() {
  const router = useRouter();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: Colors.tabBar,
          borderTopColor: Colors.tabBarBorder,
          borderTopWidth: 1,
        },
        tabBarActiveTintColor: Colors.accent,
        tabBarInactiveTintColor: Colors.textTertiary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tabs.Screen name="feed" options={{ title: 'Feed' }} />
      <Tabs.Screen
        name="log"
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(log)/sport-selection');
          },
        })}
        options={{ title: 'Log' }}
      />
      <Tabs.Screen name="rankings" options={{ title: 'Rankings' }} />
      <Tabs.Screen name="profile" options={{ title: 'Profile' }} />
    </Tabs>
  );
}
