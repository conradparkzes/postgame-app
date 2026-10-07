import { supabase } from '@/src/lib/supabase';
import type { GameLog, GameMedia } from '@/src/types';

export async function fetchUserGameLogs(userId: string): Promise<GameLog[]> {
  const { data, error } = await supabase
    .from('game_logs')
    .select('*')
    .eq('user_id', userId)
    .order('game_date', { ascending: false });

  if (error) throw error;
  return (data ?? []) as GameLog[];
}

export async function fetchGameDetail(
  gameId: string,
): Promise<{ log: GameLog; media: GameMedia[] }> {
  const [logResult, mediaResult] = await Promise.all([
    supabase.from('game_logs').select('*').eq('id', gameId).single(),
    supabase
      .from('game_media')
      .select('*')
      .eq('game_log_id', gameId)
      .order('display_order', { ascending: true }),
  ]);

  if (logResult.error || !logResult.data) throw logResult.error ?? new Error('Game not found');
  return {
    log: logResult.data as GameLog,
    media: (mediaResult.data ?? []) as GameMedia[],
  };
}

export async function updateGameLog(
  gameId: string,
  updates: Partial<Omit<GameLog, 'id' | 'user_id' | 'created_at' | 'updated_at'>>,
): Promise<void> {
  const { error } = await supabase.from('game_logs').update(updates).eq('id', gameId);
  if (error) throw error;
}

export async function deleteGameLog(gameId: string, userId: string): Promise<void> {
  // 1. Fetch media rows to know what to delete from Storage
  const { data: mediaRows } = await supabase
    .from('game_media')
    .select('storage_path')
    .eq('game_log_id', gameId);

  // 2. Delete Storage files
  if (mediaRows && mediaRows.length > 0) {
    const paths = mediaRows.map((r) => r.storage_path);
    await supabase.storage.from('game-media').remove(paths);
  }

  // 3. Delete media rows
  await supabase.from('game_media').delete().eq('game_log_id', gameId);

  // 4. Delete game log
  const { error } = await supabase.from('game_logs').delete().eq('id', gameId);
  if (error) throw error;
}

// Signed URLs are cached per storage path for their lifetime. A fresh URL
// on every visit would defeat the image cache (different token = different
// URL = full re-download), which is why photos appeared grey while loading.
const SIGNED_URL_TTL_S = 3600;
const signedUrlCache = new Map<string, { url: string; expiresAt: number }>();

export async function fetchMediaSignedUrls(
  media: GameMedia[],
): Promise<{ id: string; url: string }[]> {
  if (media.length === 0) return [];

  const now = Date.now();
  const results = await Promise.all(
    media.map(async (m) => {
      const cached = signedUrlCache.get(m.storage_path);
      // Reuse while at least 5 minutes of validity remain
      if (cached && cached.expiresAt - now > 5 * 60 * 1000) {
        return { id: m.id, url: cached.url };
      }
      const { data } = await supabase.storage
        .from('game-media')
        .createSignedUrl(m.storage_path, SIGNED_URL_TTL_S);
      const url = data?.signedUrl ?? '';
      if (url) {
        signedUrlCache.set(m.storage_path, { url, expiresAt: now + SIGNED_URL_TTL_S * 1000 });
      }
      return { id: m.id, url };
    }),
  );

  return results.filter((r) => r.url !== '');
}
