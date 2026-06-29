/// <reference types="vite/types/importMeta.d.ts" />
import { createBrowserClient } from '@supabase/ssr'

function readEnv(viteKey, procKey) {
  try {
    if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[viteKey]) {
      return import.meta.env[viteKey];
    }
  } catch {}
  if (typeof process !== 'undefined' && process.env) {
    return process.env[viteKey] || process.env[procKey];
  }
  return undefined;
}

export function createClient() {
  const url = readEnv('VITE_SUPABASE_URL', 'SUPABASE_URL');
  const key = readEnv('VITE_SUPABASE_PUBLISHABLE_KEY', 'SUPABASE_PUBLISHABLE_KEY');
  return createBrowserClient(url, key);
}
