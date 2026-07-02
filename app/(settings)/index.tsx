import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { signOut } from '@/src/lib/auth';
import { deleteAccount } from '@/src/lib/profile';

const APP_VERSION = Constants.expoConfig?.version ?? '1.0.0';

export default function SettingsScreen() {
  const router = useRouter();
  const { session } = useAuth();

  // ---------------------------------------------------------------------------
  // Actions
  // ---------------------------------------------------------------------------

  function handleSignOut() {
    signOut();
  }

  function handleDeleteAccount() {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? All your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'This cannot be undone',
              'Your account, game logs, photos, and all associated data will be permanently deleted.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Forever',
                  style: 'destructive',
                  onPress: () => {
                    if (session?.user?.id) deleteAccount(session.user.id);
                  },
                },
              ],
            );
          },
        },
      ],
    );
  }

  // ---------------------------------------------------------------------------
  // Render helpers
  // ---------------------------------------------------------------------------

  function Row({
    label,
    onPress,
    destructive,
  }: {
    label: string;
    onPress: () => void;
    destructive?: boolean;
  }) {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
      >
        <Text style={[styles.rowLabel, destructive && styles.destructiveLabel]}>
          {label}
        </Text>
        {!destructive && <Text style={styles.chevron}>›</Text>}
      </Pressable>
    );
  }

  function SectionHeader({ title }: { title: string }) {
    return <Text style={styles.sectionHeader}>{title}</Text>;
  }

  // ---------------------------------------------------------------------------
  // Layout
  // ---------------------------------------------------------------------------

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Settings</Text>
        <View style={{ width: 28 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Account */}
        <SectionHeader title="Account" />
        <View style={styles.section}>
          <Row
            label="Edit Profile"
            onPress={() => router.push('/(settings)/edit-profile')}
          />
        </View>

        {/* Support */}
        <SectionHeader title="Support" />
        <View style={styles.section}>
          <Row
            label="Help & Support"
            onPress={() => Linking.openURL('mailto:support@postgame.app')}
          />
          <View style={styles.divider} />
          <Row
            label="Terms of Service"
            onPress={() => Linking.openURL('https://postgame.app/terms')}
          />
          <View style={styles.divider} />
          <Row
            label="Privacy Policy"
            onPress={() => Linking.openURL('https://postgame.app/privacy')}
          />
        </View>

        {/* Sign Out */}
        <View style={styles.signOutWrap}>
          <Pressable
            onPress={handleSignOut}
            style={({ pressed }) => [
              styles.signOutBtn,
              pressed && styles.signOutPressed,
            ]}
          >
            <Text style={styles.signOutLabel}>Sign Out</Text>
          </Pressable>
        </View>

        {/* Danger Zone */}
        <SectionHeader title="Danger Zone" />
        <View style={styles.section}>
          <Row
            label="Delete Account"
            onPress={handleDeleteAccount}
            destructive
          />
        </View>

        {/* Footer */}
        <Text style={styles.version}>PostGame v{APP_VERSION}</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 12,
  },
  backArrow: {
    fontSize: 32,
    color: Colors.textPrimary,
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  content: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 28,
    marginBottom: 8,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  rowPressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  rowLabel: {
    fontSize: 16,
    color: Colors.textPrimary,
  },
  destructiveLabel: {
    color: Colors.error,
  },
  chevron: {
    fontSize: 20,
    color: Colors.textTertiary,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginLeft: 16,
  },
  signOutWrap: {
    marginTop: 28,
  },
  signOutBtn: {
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  signOutPressed: {
    backgroundColor: Colors.surfaceRaised,
  },
  signOutLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  version: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginTop: 32,
  },
});
