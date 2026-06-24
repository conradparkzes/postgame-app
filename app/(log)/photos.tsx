import { useState } from 'react';
import {
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

const MAX_PHOTOS = 10;

export default function PhotosScreen() {
  const router = useRouter();
  const { updateDraft } = useLogDraft();

  const [uris, setUris] = useState<string[]>([]);

  async function requestAndPickFromLibrary() {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow photo library access to add photos.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.85,
      selectionLimit: MAX_PHOTOS - uris.length,
    });
    if (!result.canceled) {
      const newUris = result.assets.map((a) => a.uri);
      setUris((prev) => [...prev, ...newUris].slice(0, MAX_PHOTOS));
    }
  }

  async function requestAndLaunchCamera() {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow camera access to take photos.');
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.85,
    });
    if (!result.canceled) {
      setUris((prev) => [...prev, result.assets[0].uri].slice(0, MAX_PHOTOS));
    }
  }

  function removePhoto(uri: string) {
    setUris((prev) => prev.filter((u) => u !== uri));
  }

  function handleContinue() {
    if (uris.length > 0) updateDraft({ mediaUris: uris });
    router.push('/(log)/companions');
  }

  function handleSkip() {
    router.push('/(log)/companions');
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={6} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Add photos</Text>
        <Text style={styles.subtitle}>Up to {MAX_PHOTOS} photos.</Text>

        {/* Thumbnails */}
        {uris.length > 0 && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.thumbnailRow}
            style={styles.thumbnailScroll}
          >
            {uris.map((uri) => (
              <Pressable key={uri} onPress={() => removePhoto(uri)} style={styles.thumbWrap}>
                <Image source={{ uri }} style={styles.thumb} />
                <View style={styles.removeOverlay}>
                  <Text style={styles.removeText}>✕</Text>
                </View>
              </Pressable>
            ))}
          </ScrollView>
        )}

        <View style={styles.buttonRow}>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, pressed && styles.mediaButtonPressed]}
            onPress={requestAndLaunchCamera}
            disabled={uris.length >= MAX_PHOTOS}
          >
            <Text style={styles.mediaButtonEmoji}>📷</Text>
            <Text style={styles.mediaButtonLabel}>Take Photo</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [styles.mediaButton, pressed && styles.mediaButtonPressed]}
            onPress={requestAndPickFromLibrary}
            disabled={uris.length >= MAX_PHOTOS}
          >
            <Text style={styles.mediaButtonEmoji}>🖼️</Text>
            <Text style={styles.mediaButtonLabel}>Choose from Library</Text>
          </Pressable>
        </View>

        {uris.length > 0 && (
          <Text style={styles.countText}>{uris.length} / {MAX_PHOTOS} selected</Text>
        )}

        <Button
          label="Continue"
          onPress={handleContinue}
          style={styles.cta}
        />
        <Button label="Skip" variant="text" onPress={handleSkip} style={styles.skip} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingTop: 60,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  backButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backText: {
    color: Colors.textSecondary,
    fontSize: 28,
    lineHeight: 32,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.textPrimary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    marginBottom: 20,
  },
  thumbnailScroll: {
    marginBottom: 20,
  },
  thumbnailRow: {
    gap: 10,
  },
  thumbWrap: {
    position: 'relative',
  },
  thumb: {
    width: 100,
    height: 100,
    borderRadius: 10,
    backgroundColor: Colors.surface,
  },
  removeOverlay: {
    position: 'absolute',
    top: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.6)',
    borderRadius: 10,
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  mediaButton: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingVertical: 20,
    alignItems: 'center',
    gap: 8,
  },
  mediaButtonPressed: {
    backgroundColor: Colors.surfaceRaised,
    borderColor: Colors.accent,
  },
  mediaButtonEmoji: {
    fontSize: 28,
  },
  mediaButtonLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  countText: {
    fontSize: 13,
    color: Colors.textTertiary,
    textAlign: 'center',
    marginBottom: 16,
  },
  cta: {},
  skip: {
    marginTop: 4,
  },
});
