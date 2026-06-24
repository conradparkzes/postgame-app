import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import {
  fetchGameDetail,
  fetchMediaSignedUrls,
  updateGameLog,
} from '@/src/lib/game-queries';
import type { GameLog, GameMedia } from '@/src/types';

function StarInput({ label, value, onChange }: { label: string; value: number | null; onChange: (v: number) => void }) {
  return (
    <View style={styles.starInputRow}>
      <Text style={styles.starLabel}>{label}</Text>
      <View style={styles.starsRow}>
        {[1, 2, 3, 4, 5].map((n) => (
          <Pressable key={n} onPress={() => onChange(n)} hitSlop={4}>
            <Text style={[styles.star, n <= (value ?? 0) ? styles.starFilled : styles.starEmpty]}>
              {n <= (value ?? 0) ? '★' : '☆'}
            </Text>
          </Pressable>
        ))}
      </View>
    </View>
  );
}

interface EditState {
  home_team: string;
  away_team: string;
  league: string;
  game_date: string;
  venue_name: string;
  venue_city: string;
  venue_country: string;
  seat_section: string;
  seat_row: string;
  seat_number: string;
  atmosphere_rating: number | null;
  seating_rating: number | null;
  food_rating: number | null;
  accessibility_rating: number | null;
  notes: string;
  companions: string[];
}

export default function EditGameScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { session } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<EditState | null>(null);
  const [existingMedia, setExistingMedia] = useState<GameMedia[]>([]);
  const [existingUrls, setExistingUrls] = useState<{ id: string; url: string }[]>([]);
  const [removedMediaIds, setRemovedMediaIds] = useState<string[]>([]);
  const [newPhotoUris, setNewPhotoUris] = useState<string[]>([]);
  const [companionInput, setCompanionInput] = useState('');

  const loadData = useCallback(async () => {
    if (!id) return;
    try {
      const { log, media } = await fetchGameDetail(id);
      setForm({
        home_team: log.home_team,
        away_team: log.away_team,
        league: log.league,
        game_date: log.game_date,
        venue_name: log.venue_name ?? '',
        venue_city: log.venue_city ?? '',
        venue_country: log.venue_country ?? '',
        seat_section: log.seat_section ?? '',
        seat_row: log.seat_row ?? '',
        seat_number: log.seat_number ?? '',
        atmosphere_rating: log.atmosphere_rating,
        seating_rating: log.seating_rating,
        food_rating: log.food_rating,
        accessibility_rating: log.accessibility_rating,
        notes: log.notes ?? '',
        companions: log.companions ?? [],
      });
      setExistingMedia(media);
      if (media.length > 0) {
        const urls = await fetchMediaSignedUrls(media);
        setExistingUrls(urls);
      }
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Failed to load game');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  function patch(updates: Partial<EditState>) {
    setForm((prev) => (prev ? { ...prev, ...updates } : prev));
  }

  function removeExistingPhoto(mediaId: string) {
    setRemovedMediaIds((prev) => [...prev, mediaId]);
    setExistingUrls((prev) => prev.filter((u) => u.id !== mediaId));
  }

  async function addPhotos() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsMultipleSelection: true,
      quality: 0.8,
    });
    if (!result.canceled) {
      setNewPhotoUris((prev) => [...prev, ...result.assets.map((a) => a.uri)]);
    }
  }

  function addCompanion() {
    const name = companionInput.trim();
    if (!name || !form) return;
    if (!form.companions.includes(name)) {
      patch({ companions: [...form.companions, name] });
    }
    setCompanionInput('');
  }

  function removeCompanion(name: string) {
    if (!form) return;
    patch({ companions: form.companions.filter((c) => c !== name) });
  }

  async function handleSave() {
    if (!form || !id || !session?.user) return;
    setError(null);
    setSaving(true);
    try {
      // 1. Update game_logs row
      await updateGameLog(id, {
        home_team: form.home_team,
        away_team: form.away_team,
        league: form.league,
        game_date: form.game_date,
        venue_name: form.venue_name || null,
        venue_city: form.venue_city || null,
        venue_country: form.venue_country || null,
        seat_section: form.seat_section || null,
        seat_row: form.seat_row || null,
        seat_number: form.seat_number || null,
        atmosphere_rating: form.atmosphere_rating,
        seating_rating: form.seating_rating,
        food_rating: form.food_rating,
        accessibility_rating: form.accessibility_rating,
        notes: form.notes || null,
        companions: form.companions,
      });

      // 2. Delete removed photos
      if (removedMediaIds.length > 0) {
        const toDelete = existingMedia.filter((m) => removedMediaIds.includes(m.id));
        if (toDelete.length > 0) {
          await supabase.storage
            .from('game-media')
            .remove(toDelete.map((m) => m.storage_path));
          await supabase
            .from('game_media')
            .delete()
            .in('id', removedMediaIds);
        }
      }

      // 3. Upload new photos
      if (newPhotoUris.length > 0) {
        const maxOrder = existingMedia.length;
        for (let i = 0; i < newPhotoUris.length; i++) {
          const uri = newPhotoUris[i];
          const filename = `${Date.now()}_${i}.jpg`;
          const storagePath = `game-media/${session.user.id}/${id}/${filename}`;

          const response = await fetch(uri);
          const blob = await response.blob();

          const { error: uploadError } = await supabase.storage
            .from('game-media')
            .upload(storagePath, blob, { contentType: 'image/jpeg' });

          if (uploadError) {
            console.warn('Photo upload failed:', uploadError.message);
            continue;
          }

          await supabase.from('game_media').insert({
            game_log_id: id,
            user_id: session.user.id,
            storage_path: storagePath,
            media_type: 'photo',
            display_order: maxOrder + i,
          });
        }
      }

      router.back();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color={Colors.accent} size="large" />
      </View>
    );
  }

  if (!form) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error ?? 'Game not found'}</Text>
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backLink}>Go back</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} hitSlop={12} style={styles.headerBtn}>
          <Text style={styles.backArrow}>‹</Text>
        </Pressable>
        <Text style={styles.headerTitle}>Edit Game</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        {error && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{error}</Text>
          </View>
        )}

        {/* Game Info */}
        <Text style={styles.sectionTitle}>Game Info</Text>
        <TextInput
          style={styles.input}
          value={form.home_team}
          onChangeText={(v) => patch({ home_team: v })}
          placeholder="Home team"
          placeholderTextColor={Colors.textTertiary}
        />
        <TextInput
          style={styles.input}
          value={form.away_team}
          onChangeText={(v) => patch({ away_team: v })}
          placeholder="Away team"
          placeholderTextColor={Colors.textTertiary}
        />
        <TextInput
          style={styles.input}
          value={form.league}
          onChangeText={(v) => patch({ league: v })}
          placeholder="League"
          placeholderTextColor={Colors.textTertiary}
        />
        <TextInput
          style={styles.input}
          value={form.game_date}
          onChangeText={(v) => patch({ game_date: v })}
          placeholder="Date (YYYY-MM-DD)"
          placeholderTextColor={Colors.textTertiary}
        />

        {/* Venue */}
        <Text style={styles.sectionTitle}>Venue</Text>
        <TextInput
          style={styles.input}
          value={form.venue_name}
          onChangeText={(v) => patch({ venue_name: v })}
          placeholder="Venue name"
          placeholderTextColor={Colors.textTertiary}
        />
        <TextInput
          style={styles.input}
          value={form.venue_city}
          onChangeText={(v) => patch({ venue_city: v })}
          placeholder="City"
          placeholderTextColor={Colors.textTertiary}
        />
        <TextInput
          style={styles.input}
          value={form.venue_country}
          onChangeText={(v) => patch({ venue_country: v })}
          placeholder="Country"
          placeholderTextColor={Colors.textTertiary}
        />

        {/* Seat */}
        <Text style={styles.sectionTitle}>Seat</Text>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={form.seat_section}
            onChangeText={(v) => patch({ seat_section: v })}
            placeholder="Section"
            placeholderTextColor={Colors.textTertiary}
          />
          <TextInput
            style={[styles.input, styles.flex1, { marginHorizontal: 8 }]}
            value={form.seat_row}
            onChangeText={(v) => patch({ seat_row: v })}
            placeholder="Row"
            placeholderTextColor={Colors.textTertiary}
          />
          <TextInput
            style={[styles.input, styles.flex1]}
            value={form.seat_number}
            onChangeText={(v) => patch({ seat_number: v })}
            placeholder="Seat"
            placeholderTextColor={Colors.textTertiary}
          />
        </View>

        {/* Ratings */}
        <Text style={styles.sectionTitle}>Ratings</Text>
        <StarInput label="Atmosphere" value={form.atmosphere_rating} onChange={(v) => patch({ atmosphere_rating: v })} />
        <StarInput label="Seating" value={form.seating_rating} onChange={(v) => patch({ seating_rating: v })} />
        <StarInput label="Food" value={form.food_rating} onChange={(v) => patch({ food_rating: v })} />
        <StarInput label="Accessibility" value={form.accessibility_rating} onChange={(v) => patch({ accessibility_rating: v })} />

        {/* Notes */}
        <Text style={styles.sectionTitle}>Notes</Text>
        <TextInput
          style={[styles.input, styles.notesInput]}
          value={form.notes}
          onChangeText={(v) => patch({ notes: v })}
          placeholder="Add notes..."
          placeholderTextColor={Colors.textTertiary}
          multiline
          textAlignVertical="top"
        />

        {/* Companions */}
        <Text style={styles.sectionTitle}>Companions</Text>
        <View style={styles.chipRow}>
          {form.companions.map((c, i) => (
            <Pressable key={i} onPress={() => removeCompanion(c)} style={styles.chip}>
              <Text style={styles.chipText}>{c} ✕</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.row}>
          <TextInput
            style={[styles.input, styles.flex1]}
            value={companionInput}
            onChangeText={setCompanionInput}
            placeholder="Add companion..."
            placeholderTextColor={Colors.textTertiary}
            onSubmitEditing={addCompanion}
            returnKeyType="done"
          />
          <Pressable onPress={addCompanion} style={styles.addBtn}>
            <Text style={styles.addBtnText}>Add</Text>
          </Pressable>
        </View>

        {/* Photos */}
        <Text style={styles.sectionTitle}>Photos</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.photoScroll}>
          {existingUrls.map((p) => (
            <View key={p.id} style={styles.photoWrap}>
              <Image source={{ uri: p.url }} style={styles.thumbnail} />
              <Pressable onPress={() => removeExistingPhoto(p.id)} style={styles.removePhoto}>
                <Text style={styles.removePhotoText}>✕</Text>
              </Pressable>
            </View>
          ))}
          {newPhotoUris.map((uri, i) => (
            <View key={`new-${i}`} style={styles.photoWrap}>
              <Image source={{ uri }} style={styles.thumbnail} />
              <Pressable
                onPress={() => setNewPhotoUris((prev) => prev.filter((_, idx) => idx !== i))}
                style={styles.removePhoto}
              >
                <Text style={styles.removePhotoText}>✕</Text>
              </Pressable>
            </View>
          ))}
          <Pressable onPress={addPhotos} style={styles.addPhotoBtn}>
            <Text style={styles.addPhotoBtnText}>+</Text>
          </Pressable>
        </ScrollView>

        <Button label="Save Changes" onPress={handleSave} loading={saving} style={styles.cta} />
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
  center: {
    flex: 1,
    backgroundColor: Colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 24,
    marginBottom: 16,
  },
  headerBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backArrow: {
    color: Colors.textSecondary,
    fontSize: 28,
    lineHeight: 32,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  scroll: {
    paddingHorizontal: 24,
    paddingBottom: 48,
  },
  errorBanner: {
    padding: 12,
    backgroundColor: '#331207',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorBannerText: {
    color: Colors.error,
    fontSize: 13,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    marginTop: 20,
    marginBottom: 10,
  },
  input: {
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.textPrimary,
    marginBottom: 10,
  },
  notesInput: {
    height: 100,
    paddingTop: 12,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  flex1: {
    flex: 1,
  },
  starInputRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    marginBottom: 10,
  },
  starLabel: {
    fontSize: 14,
    color: Colors.textSecondary,
  },
  starsRow: {
    flexDirection: 'row',
    gap: 4,
  },
  star: {
    fontSize: 22,
  },
  starFilled: {
    color: Colors.accent,
  },
  starEmpty: {
    color: Colors.textTertiary,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  chip: {
    backgroundColor: Colors.surfaceRaised,
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: {
    fontSize: 13,
    color: Colors.textPrimary,
  },
  addBtn: {
    marginLeft: 8,
    backgroundColor: Colors.accent,
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 10,
  },
  addBtnText: {
    color: Colors.textPrimary,
    fontWeight: '600',
    fontSize: 14,
  },
  photoScroll: {
    marginBottom: 10,
  },
  photoWrap: {
    position: 'relative',
    marginRight: 10,
  },
  thumbnail: {
    width: 90,
    height: 90,
    borderRadius: 8,
    backgroundColor: Colors.surfaceRaised,
  },
  removePhoto: {
    position: 'absolute',
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '700',
  },
  addPhotoBtn: {
    width: 90,
    height: 90,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.surface,
  },
  addPhotoBtnText: {
    fontSize: 28,
    color: Colors.textTertiary,
  },
  cta: {
    marginTop: 20,
  },
  errorText: {
    fontSize: 15,
    color: Colors.error,
    marginBottom: 16,
  },
  backLink: {
    fontSize: 15,
    color: Colors.accent,
    fontWeight: '600',
  },
});
