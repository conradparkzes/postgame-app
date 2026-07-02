import { Tabs, useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { FeedIcon, LogIcon, PodiumIcon, ProfileTabIcon } from '@/src/components/ui/TabIcons';

export default function TabLayout() {
  const router = useRouter();
  const { profile } = useAuth();

  const initial = (profile?.display_name || profile?.username || '?')
    .trim()
    .charAt(0)
    .toUpperCase();

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
      <Tabs.Screen
        name="feed"
        options={{
          title: 'Feed',
          tabBarIcon: ({ color }) => <FeedIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="log"
        listeners={() => ({
          tabPress: (e) => {
            e.preventDefault();
            router.push('/(log)/sport-selection');
          },
        })}
        options={{
          title: 'Log',
          tabBarIcon: ({ color }) => <LogIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="rankings"
        options={{
          title: 'Rankings',
          tabBarIcon: ({ color }) => <PodiumIcon color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <ProfileTabIcon
              color={color}
              focused={focused}
              avatarUrl={profile?.avatar_url ?? null}
              initial={initial}
            />
          ),
        }}
      />
    </Tabs>
  );
}
