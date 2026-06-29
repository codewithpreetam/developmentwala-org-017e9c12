// Re-export the singleton Supabase client from the managed integration so all
// callers share the same auth session (localStorage-backed). Creating multiple
// browser clients caused login to succeed on one instance while subsequent
// queries from another instance ran without the user's JWT and hit RLS.
import { supabase } from '@/integrations/supabase/client';

export function createClient() {
  return supabase;
}

export { supabase };
