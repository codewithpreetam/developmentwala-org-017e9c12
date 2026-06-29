import { createClient } from '@/lib/supabase/client';

const BUCKET = 'uploads';

function safeName(file) {
  const ext = file.name?.split('.').pop() || 'bin';
  const base = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  return `${base}.${ext}`;
}

export async function uploadFile(file, folder = 'files') {
  if (!file) throw new Error('No file selected');
  if (file.size > 5 * 1024 * 1024) throw new Error('File must be 5 MB or smaller');

  const supabase = createClient();
  // Storage RLS requires the FIRST folder of the object path to equal auth.uid()
  // (or admin). Prefix every upload with the signed-in user's id so the policy
  // passes — otherwise uploads fail with "new row violates row-level security".
  const { data: { user: authUser }, error: authErr } = await supabase.auth.getUser();
  if (authErr || !authUser) {
    throw new Error('You must be signed in to upload files.');
  }
  const path = `${authUser.id}/${folder}/${safeName(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error('File storage is not configured. Create an "uploads" bucket in Supabase Storage.');
    }
    if (/row-level security|violates.*policy/i.test(error.message || '')) {
      throw new Error('You do not have permission to upload here. Please sign out and back in, then retry.');
    }
    throw error;
  }
  const { data: signed } = await supabase.storage.from(BUCKET).createSignedUrl(path, 60 * 60 * 24 * 365);
  return { file_url: signed?.signedUrl || '', path };
}

export async function getSignedUrl(path, expiresInSeconds = 60 * 60 * 24 * 365) {
  if (!path) return '';
  const supabase = createClient();
  const { data } = await supabase.storage.from(BUCKET).createSignedUrl(path, expiresInSeconds);
  return data?.signedUrl || '';
}
