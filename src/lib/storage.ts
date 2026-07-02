import { Platform } from 'react-native';
import { decode } from 'base64-arraybuffer';
import { supabase } from './supabase';

/**
 * Read a local file URI as base64 using XMLHttpRequest + FileReader.
 * XHR with responseType='blob' is the most reliable way to read
 * local files in React Native.
 */
function uriToBase64(uri: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.onload = () => {
      const blob = xhr.response as Blob;
      if (!blob || blob.size === 0) {
        reject(new Error(`File is empty (size: ${blob?.size})`));
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const base64 = dataUrl.split(',')[1];
        if (!base64) {
          reject(new Error('base64 conversion produced empty result'));
          return;
        }
        resolve(base64);
      };
      reader.onerror = () => reject(new Error('FileReader failed'));
      reader.readAsDataURL(blob);
    };
    xhr.onerror = () => reject(new Error(`XHR failed to read: ${uri}`));
    xhr.responseType = 'blob';
    xhr.open('GET', uri, true);
    xhr.send(null);
  });
}

/**
 * Upload a local image URI to Supabase Storage.
 * Tries base64/ArrayBuffer first (Supabase-recommended for RN),
 * falls back to FormData if that fails.
 */
export async function uploadImage(
  bucket: string,
  storagePath: string,
  localUri: string,
  contentType = 'image/jpeg',
): Promise<void> {
  // Approach 1: base64 → ArrayBuffer (Supabase docs recommend this for RN)
  try {
    const base64 = await uriToBase64(localUri);
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from(bucket)
      .upload(storagePath, arrayBuffer, { contentType });

    if (error) throw error;
    return; // success
  } catch (e) {
    console.warn('[storage] base64 approach failed, trying FormData:', e);
  }

  // Approach 2: FormData (React Native handles file URIs natively)
  const fileName = storagePath.split('/').pop() || 'photo.jpg';
  const formData = new FormData();
  formData.append('file', {
    uri: localUri,
    type: contentType,
    name: fileName,
  } as any);

  const { error } = await supabase.storage
    .from(bucket)
    .upload(storagePath, formData);

  if (error) throw error;
}

/**
 * Upload a profile avatar. Overwrites any existing avatar for the user.
 * Returns the public URL with a cache-buster.
 */
export async function uploadAvatar(
  userId: string,
  localUri: string,
): Promise<string> {
  const storagePath = `${userId}/avatar.jpg`;

  try {
    const base64 = await uriToBase64(localUri);
    const arrayBuffer = decode(base64);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(storagePath, arrayBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;
  } catch (e) {
    console.warn('[storage] avatar base64 failed, trying FormData:', e);

    const formData = new FormData();
    formData.append('file', {
      uri: localUri,
      type: 'image/jpeg',
      name: 'avatar.jpg',
    } as any);

    const { error } = await supabase.storage
      .from('avatars')
      .upload(storagePath, formData, { upsert: true });

    if (error) throw error;
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(storagePath);
  return `${data.publicUrl}?t=${Date.now()}`;
}
