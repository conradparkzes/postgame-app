import { useEffect, useState } from 'react';
import {
  Alert,
  Image,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { useAuth } from '@/src/hooks/useAuth';
import { Input } from '@/src/components/ui/Input';
import { Button } from '@/src/components/ui/Button';
import { updateProfile, isUsernameAvailable } from '@/src/lib/profile';
import { uploadAvatar } from '@/src/lib/storage';

const USERNAME_RE = /^[a-z0-9_.]{3,30}$/;

function getInitials(displayName: string | null, username: string): string {
  const name = displayName || username;
  const parts = name.split(/\s+/);
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function EditProfileScreen() {
  const router = useRouter();
  const { session, profile, refreshProfile } = useAuth();

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [avatarChanged, setAvatarChanged] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [usernameError, setUsernameError] = useState('');

  // Populate fields once profile loads
  useEffect(() => {
    if (profile) {
      setDisplayName(profile.display_name ?? '');
      setUsername(profile.username ?? '');
      setBio(profile.bio ?? '');
      setAvatarUri(profile.avatar_url);
    }
  }, [profile]);

  function chooseAvatar() {
    Alert.alert('Profile Photo', undefined, [
      { text: 'Take Photo', onPress: takeAvatarPhoto },
      { text: 'Choose from Library', onPress: pickAvatarFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  async function pickAvatarFromLibrary() {
    // No permission request needed — the system photo picker (iOS PHPicker /
    // Android Photo Picker) grants access per selection. Skipping the
    // permission roundtrip also opens the picker noticeably faster.
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      selectionLimit: 1,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  }

  async function takeAvatarPhoto() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take a profile photo.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
    });

    if (!result.canceled) {
      setAvatarUri(result.assets[0].uri);
      setAvatarChanged(true);
    }
  }

  async function handleSave() {
    setError('');
    setUsernameError('');

    const trimmedUsername = username.trim().toLowerCase();
    if (!USERNAME_RE.test(trimmedUsername)) {
      setUsernameError('3–30 characters: lowercase letters, numbers, underscores, and periods');
      return;
    }

    setSaving(true);
    try {
      // Check uniqueness if username changed
      if (trimmedUsername !== profile?.username) {
        const available = await isUsernameAvailable(trimmedUsername, session!.user.id);
        if (!available) {
          setUsernameError('Username is already taken');
          setSaving(false);
          return;
        }
      }

      // Upload avatar if changed
      let newAvatarUrl: string | undefined;
      if (avatarChanged && avatarUri) {
        newAvatarUrl = await uploadAvatar(session!.user.id, avatarUri);
      }

      await updateProfile(session!.user.id, {
        display_name: displayName.trim() || null as any,
        username: trimmedUsername,
        bio: bio.trim() || null as any,
        ...(newAvatarUrl != null ? { avatar_url: newAvatarUrl } : {}),
      });

      await refreshProfile();
      router.back();
    } catch (e: any) {
      setError(e.message ?? 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <View style={{ width: 28 }} />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.content}>
          {error ? (
            <View style={styles.errorBanner}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Avatar picker */}
          <Pressable onPress={chooseAvatar} style={styles.avatarWrap}>
            {avatarUri ? (
              <Image source={{ uri: avatarUri }} style={styles.avatar} />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.initials}>
                  {profile ? getInitials(profile.display_name, profile.username) : '??'}
                </Text>
              </View>
            )}
            <View style={styles.avatarBadge}>
              <Text style={styles.avatarBadgeText}>Edit</Text>
            </View>
          </Pressable>

          <Input
            label="Display Name"
            value={displayName}
            onChangeText={setDisplayName}
            placeholder="Your name"
            autoCapitalize="words"
            containerStyle={styles.field}
          />

          <Input
            label="Username"
            value={username}
            onChangeText={(t) => setUsername(t.toLowerCase().replace(/[^a-z0-9_.]/g, ''))}
            placeholder="username"
            autoCapitalize="none"
            autoCorrect={false}
            error={usernameError}
            containerStyle={styles.field}
          />

          <View style={styles.field}>
            <Text style={styles.label}>Bio</Text>
            <TextInput
              style={styles.bioInput}
              value={bio}
              onChangeText={setBio}
              placeholder="Tell us about yourself..."
              placeholderTextColor={Colors.textTertiary}
              multiline
              maxLength={160}
              textAlignVertical="top"
            />
            <Text style={styles.charCount}>{bio.length}/160</Text>
          </View>

          <Button
            label="Save"
            onPress={handleSave}
            loading={saving}
            disabled={!username.trim()}
            style={styles.saveBtn}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    paddingTop: 16,
    paddingBottom: 48,
  },
  errorBanner: {
    backgroundColor: '#331207',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 14,
  },
  avatarWrap: {
    alignSelf: 'center',
    marginBottom: 24,
    position: 'relative',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: Colors.accent,
  },
  avatarPlaceholder: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.surfaceRaised,
    borderWidth: 2,
    borderColor: Colors.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  initials: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.accent,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  avatarBadgeText: {
    color: Colors.textInverse,
    fontSize: 11,
    fontWeight: '700',
  },
  field: {
    marginBottom: 20,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  bioInput: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    fontSize: 16,
    color: Colors.textPrimary,
    minHeight: 100,
  },
  charCount: {
    fontSize: 12,
    color: Colors.textTertiary,
    textAlign: 'right',
    marginTop: 4,
  },
  saveBtn: {
    marginTop: 12,
  },
});
