import { supabase } from './supabase';
import { signOut } from './auth';

// ---------------------------------------------------------------------------
// Update profile fields
// ---------------------------------------------------------------------------

export async function updateProfile(
  userId: string,
  fields: { display_name?: string; username?: string; bio?: string; avatar_url?: string | null },
) {
  const { error } = await supabase
    .from('profiles')
    .update({ ...fields, updated_at: new Date().toISOString() })
    .eq('id', userId);

  if (error) throw error;
}

// ---------------------------------------------------------------------------
// Username availability check
// ---------------------------------------------------------------------------

export async function isUsernameAvailable(
  username: string,
  currentUserId: string,
): Promise<boolean> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', username)
    .neq('id', currentUserId)
    .limit(1);

  if (error) throw error;
  return (data ?? []).length === 0;
}

// ---------------------------------------------------------------------------
// Delete account — storage cleanup → RPC cascade → sign out
// ---------------------------------------------------------------------------

export async function deleteAccount(userId: string) {
  // 1. Remove all storage files under {userId}/ in the game-media bucket.
  //    Files are stored as {userId}/{gameLogId}/{filename}, so we need to
  //    list subdirectories (game log IDs) first, then files in each.
  try {
    const { data: folders } = await supabase.storage
      .from('game-media')
      .list(userId, { limit: 1000 });

    if (folders && folders.length > 0) {
      for (const folder of folders) {
        const subPath = `${userId}/${folder.name}`;
        const { data: files } = await supabase.storage
          .from('game-media')
          .list(subPath, { limit: 1000 });

        if (files && files.length > 0) {
          const paths = files.map((f) => `${subPath}/${f.name}`);
          await supabase.storage.from('game-media').remove(paths);
        }
      }
    }
  } catch {
    // Storage cleanup is best-effort — proceed even if it fails
  }

  // 2. RPC cascades all DB rows (profiles, game_logs, game_media, user_favorite_teams)
  const { error } = await supabase.rpc('delete_user');
  if (error) throw error;

  // 3. Clear local session — AuthGate will redirect to welcome
  await signOut();
}
