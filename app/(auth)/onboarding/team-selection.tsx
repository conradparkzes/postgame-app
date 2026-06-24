import { useMemo, useState } from 'react';
import {
  FlatList,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Colors } from '@/src/constants/colors';
import { Button } from '@/src/components/ui/Button';
import { POPULAR_TEAMS, SPORT_LABELS, type PopularTeam } from '@/src/data/popular-teams';
import { supabase } from '@/src/lib/supabase';

const SPORTS = [...new Set(POPULAR_TEAMS.map((t) => t.sport))];

export default function TeamSelectionScreen() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);

  const filtered = useMemo(() => {
    return POPULAR_TEAMS.filter((t) => {
      const matchesSport = !selectedSport || t.sport === selectedSport;
      const matchesQuery =
        !query.trim() || t.team_name.toLowerCase().includes(query.trim().toLowerCase());
      return matchesSport && matchesQuery;
    });
  }, [query, selectedSport]);

  function toggleTeam(team: PopularTeam) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(team.team_id)) next.delete(team.team_id);
      else next.add(team.team_id);
      return next;
    });
  }

  async function handleContinue() {
    setSaving(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const picks = POPULAR_TEAMS.filter((t) => selected.has(t.team_id));
      if (picks.length > 0) {
        await supabase.from('user_favorite_teams').upsert(
          picks.map((t) => ({
            user_id: user.id,
            sport: t.sport,
            league: t.league,
            team_name: t.team_name,
            team_id: t.team_id,
          })),
          { onConflict: 'user_id,sport,team_name' },
        );
      }

      router.push('/(auth)/onboarding/first-game');
    } finally {
      setSaving(false);
    }
  }

  function renderTeam({ item }: { item: PopularTeam }) {
    const isSelected = selected.has(item.team_id);
    return (
      <Pressable
        style={[styles.teamRow, isSelected && styles.teamRowSelected]}
        onPress={() => toggleTeam(item)}
      >
        <View style={styles.teamInfo}>
          <Text style={styles.teamName}>{item.team_name}</Text>
          <Text style={styles.teamLeague}>{item.league}</Text>
        </View>
        <View style={[styles.check, isSelected && styles.checkSelected]}>
          {isSelected && <Text style={styles.checkMark}>✓</Text>}
        </View>
      </Pressable>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Pick your teams</Text>
        <Text style={styles.subtitle}>
          {"We'll personalise your experience around the clubs and franchises you care about."}
        </Text>
      </View>

      {/* Search */}
      <TextInput
        style={styles.search}
        placeholder="Search teams…"
        placeholderTextColor={Colors.textTertiary}
        value={query}
        onChangeText={setQuery}
        returnKeyType="search"
      />

      {/* Sport filter chips */}
      <FlatList
        horizontal
        showsHorizontalScrollIndicator={false}
        data={[null, ...SPORTS]}
        keyExtractor={(item) => item ?? 'all'}
        contentContainerStyle={styles.chips}
        renderItem={({ item }) => {
          const active = selectedSport === item;
          return (
            <Pressable
              style={[styles.chip, active && styles.chipActive]}
              onPress={() => setSelectedSport(item)}
            >
              <Text style={[styles.chipLabel, active && styles.chipLabelActive]}>
                {item ? SPORT_LABELS[item] : 'All'}
              </Text>
            </Pressable>
          );
        }}
      />

      {/* Team list */}
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.team_id}
        renderItem={renderTeam}
        style={styles.list}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        ListEmptyComponent={
          <Text style={styles.empty}>No teams match your search.</Text>
        }
      />

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.selectedCount}>
          {selected.size > 0 ? `${selected.size} team${selected.size === 1 ? '' : 's'} selected` : ''}
        </Text>
        <Button
          label={selected.size === 0 ? 'Skip for now' : 'Continue'}
          loading={saving}
          onPress={handleContinue}
          style={styles.continueBtn}
        />
      </View>
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
    paddingHorizontal: 24,
    gap: 6,
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: Colors.textPrimary,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    lineHeight: 21,
  },
  search: {
    marginHorizontal: 24,
    marginBottom: 12,
    height: 44,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 14,
    fontSize: 15,
    color: Colors.textPrimary,
  },
  chips: {
    paddingHorizontal: 24,
    paddingBottom: 12,
    gap: 8,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.border,
    backgroundColor: Colors.surface,
  },
  chipActive: {
    backgroundColor: Colors.accentSubtle,
    borderColor: Colors.accent,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '500',
    color: Colors.textSecondary,
  },
  chipLabelActive: {
    color: Colors.accent,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: 24,
    gap: 2,
  },
  teamRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    marginBottom: 6,
  },
  teamRowSelected: {
    backgroundColor: Colors.accentSubtle,
    borderWidth: 1,
    borderColor: Colors.accent,
  },
  teamInfo: {
    flex: 1,
  },
  teamName: {
    fontSize: 15,
    fontWeight: '600',
    color: Colors.textPrimary,
  },
  teamLeague: {
    fontSize: 12,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  check: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkSelected: {
    backgroundColor: Colors.accent,
    borderColor: Colors.accent,
  },
  checkMark: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '700',
  },
  empty: {
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: 32,
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 24,
    paddingVertical: 16,
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: Colors.surfaceBorder,
  },
  selectedCount: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: 'center',
    minHeight: 18,
  },
  continueBtn: {
    width: '100%',
  },
});
