import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { useLogDraft } from '@/src/context/LogContext';
import { useAuth } from '@/src/hooks/useAuth';
import { supabase } from '@/src/lib/supabase';
import { ProgressDots } from '@/src/components/ui/ProgressDots';

function formatDate(d?: string) {
  if (!d) return '—';
  const [y, m, day] = d.split('-');
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  return `${months[parseInt(m, 10) - 1]} ${parseInt(day, 10)}, ${y}`;
}

function computePostGameScore(vals: (number | undefined | null)[]): string {
  const filled = vals.filter((v): v is number => v != null);
  if (filled.length === 0) return '—';
  const avg = filled.reduce((a, b) => a + b, 0) / filled.length;
  return avg.toFixed(1);
}

function Section({
  label,
  onEdit,
  children,
}: {
  label: string;
  onEdit?: () => void;
  children: React.ReactNode;
}) {
  return (
    <View style={styles.section}>
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionLabel}>{label}</Text>
        {onEdit && (
          <Pressable onPress={onEdit}>
            <Text style={styles.editLink}>Edit</Text>
          </Pressable>
        )}
      </View>
      {children}
    </View>
  );
}

export default function ReviewScreen() {
  const router = useRouter();
  const { draft, updateDraft, resetDraft } = useLogDraft();
  const { session } = useAuth();

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const postGameScore = computePostGameScore([
    draft.atmosphere_rating,
    draft.seating_rating,
    draft.food_rating,
    draft.accessibility_rating,
  ]);

  async function handleSave() {
    if (!session?.user) return;
    setError(null);
    setSaving(true);
    try {
      // 1. Insert game log row
      const { data: logRow, error: logError } = await supabase
        .from('game_logs')
        .insert({
          user_id: session.user.id,
          api_game_id: draft.api_game_id ?? null,
          sport: draft.sport!,
          league: draft.league ?? '',
          home_team: draft.home_team ?? '',
          away_team: draft.away_team ?? '',
          home_score: draft.home_score ?? null,
          away_score: draft.away_score ?? null,
          game_date: draft.game_date!,
          venue_name: draft.venue_name ?? null,
          venue_city: draft.venue_city ?? null,
          venue_country: draft.venue_country ?? null,
          api_venue_id: draft.api_venue_id ?? null,
          seat_section: draft.seat_section ?? null,
          seat_row: draft.seat_row ?? null,
          seat_number: draft.seat_number ?? null,
          atmosphere_rating: draft.atmosphere_rating ?? null,
          seating_rating: draft.seating_rating ?? null,
          food_rating: draft.food_rating ?? null,
          accessibility_rating: draft.accessibility_rating ?? null,
          notes: draft.notes ?? null,
          companions: draft.companions ?? [],
        })
        .select('id')
        .single();

      if (logError || !logRow) throw logError ?? new Error('Failed to save game log');

      const gameLogId = logRow.id as string;

      // 2. Upload photos
      if (draft.mediaUris && draft.mediaUris.length > 0) {
        for (let i = 0; i < draft.mediaUris.length; i++) {
          const uri = draft.mediaUris[i];
          const filename = `${Date.now()}_${i}.jpg`;
          const storagePath = `game-media/${session.user.id}/${gameLogId}/${filename}`;

          // Fetch the image as a blob
          const response = await fetch(uri);
          const blob = await response.blob();

          const { error: uploadError } = await supabase.storage
            .from('game-media')
            .upload(storagePath, blob, { contentType: 'image/jpeg' });

          if (uploadError) {
            console.warn('Photo upload failed:', uploadError.message);
            continue; // Don't block save if photo upload fails
          }

          await supabase.from('game_media').insert({
            game_log_id: gameLogId,
            user_id: session.user.id,
            storage_path: storagePath,
            media_type: 'photo',
            display_order: i,
          });
        }
      }

      updateDraft({ savedGameLogId: gameLogId });
      router.replace('/(log)/confirmation');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Save failed. Please try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backButton} hitSlop={12}>
          <Text style={styles.backText}>‹</Text>
        </Pressable>
        <ProgressDots total={10} current={9} />
        <View style={styles.backButton} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <Text style={styles.title}>Review & save</Text>

        {error ? (
          <View style={styles.errorBanner}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* PostGame Score */}
        <View style={styles.scoreCard}>
          <Text style={styles.scoreLabel}>PostGame Score</Text>
          <Text style={styles.scoreValue}>{postGameScore}</Text>
        </View>

        <Section label="Game" onEdit={() => router.push('/(log)/game-search')}>
          <Text style={styles.value}>{draft.home_team} vs {draft.away_team}</Text>
          {draft.league ? <Text style={styles.secondary}>{draft.league}</Text> : null}
          <Text style={styles.secondary}>{formatDate(draft.game_date)}</Text>
        </Section>

        <Section label="Venue" onEdit={() => router.push('/(log)/venue-confirm')}>
          <Text style={styles.value}>{draft.venue_name ?? '—'}</Text>
          {draft.venue_city ? (
            <Text style={styles.secondary}>
              {draft.venue_city}{draft.venue_country ? `, ${draft.venue_country}` : ''}
            </Text>
          ) : null}
        </Section>

        <Section label="Seat" onEdit={() => router.push('/(log)/seat-entry')}>
          {draft.seat_section || draft.seat_row || draft.seat_number ? (
            <Text style={styles.value}>
              {[
                draft.seat_section && `Sec ${draft.seat_section}`,
                draft.seat_row && `Row ${draft.seat_row}`,
                draft.seat_number && `Seat ${draft.seat_number}`,
              ]
                .filter(Boolean)
                .join(' · ')}
            </Text>
          ) : (
            <Text style={styles.secondary}>Not entered</Text>
          )}
        </Section>

        <Section label="Ratings" onEdit={() => router.push('/(log)/ratings')}>
          {draft.atmosphere_rating != null && (
            <Text style={styles.secondary}>Atmosphere: {'★'.repeat(draft.atmosphere_rating)}</Text>
          )}
          {draft.seating_rating != null && (
            <Text style={styles.secondary}>Seating: {'★'.repeat(draft.seating_rating)}</Text>
          )}
          {draft.food_rating != null && (
            <Text style={styles.secondary}>Food: {'★'.repeat(draft.food_rating)}</Text>
          )}
          {draft.accessibility_rating != null && (
            <Text style={styles.secondary}>Accessibility: {'★'.repeat(draft.accessibility_rating)}</Text>
          )}
          {!draft.atmosphere_rating && !draft.seating_rating && !draft.food_rating && !draft.accessibility_rating && (
            <Text style={styles.secondary}>None</Text>
          )}
        </Section>

        <Section label="Photos" onEdit={() => router.push('/(log)/photos')}>
          <Text style={styles.value}>
            {draft.mediaUris?.length ? `${draft.mediaUris.length} photo${draft.mediaUris.length > 1 ? 's' : ''}` : 'None'}
          </Text>
        </Section>

        <Section label="Companions" onEdit={() => router.push('/(log)/companions')}>
          {draft.companions && draft.companions.length > 0 ? (
            <Text style={styles.value}>{draft.companions.join(', ')}</Text>
          ) : (
            <Text style={styles.secondary}>None</Text>
          )}
        </Section>

        <Section label="Notes" onEdit={() => router.push('/(log)/notes')}>
          {draft.notes ? (
            <Text style={styles.value} numberOfLines={3}>{draft.notes}</Text>
          ) : (
            <Text style={styles.secondary}>None</Text>
          )}
        </Section>

        <Button
          label="Save Game Log"
          onPress={handleSave}
          loading={saving}
          style={styles.cta}
        />
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
    marginBottom: 20,
  },
  errorBanner: {
    padding: 12,
    backgroundColor: '#331207',
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: Colors.error,
    fontSize: 13,
  },
  scoreCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: Colors.accentSubtle,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.accent,
    paddingHorizontal: 20,
    paddingVertical: 16,
    marginBottom: 20,
  },
  scoreLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  scoreValue: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.accent,
  },
  section: {
    backgroundColor: Colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    padding: 16,
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: Colors.textTertiary,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  editLink: {
    fontSize: 13,
    color: Colors.accent,
    fontWeight: '600',
  },
  value: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  secondary: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  cta: {
    marginTop: 8,
  },
});
