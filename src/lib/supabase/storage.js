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
  const path = `${folder}/${safeName(file)}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: '3600',
    upsert: true,
    contentType: file.type || undefined,
  });
  if (error) {
    if (error.message?.includes('Bucket not found') || error.message?.includes('not found')) {
      throw new Error('File storage is not configured. Create a public "uploads" bucket in Supabase Storage.');
    }
    throw error;
  }
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  return { file_url: data.publicUrl, path };
}
