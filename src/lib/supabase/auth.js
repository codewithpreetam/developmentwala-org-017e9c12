import { createClient } from '@/lib/supabase/client';

const supabase = createClient();

let currentSessionUser = null;

export function getSessionUser() {
  return currentSessionUser;
}

export function setSessionUser(user) {
  currentSessionUser = user || null;
}

export function clearSessionUser() {
  currentSessionUser = null;
}

export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  return data.user;
}

export async function getCurrentProfile() {
  const authUser = await getCurrentUser();
  if (!authUser) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();
  if (error) throw error;
  return toAppUser(data, authUser);
}

export function toAppUser(dbUser, authUser) {
  if (!dbUser) return null;
  const fullName = [dbUser.first_name, dbUser.last_name].filter(Boolean).join(' ').trim();
  return {
    id: dbUser.id,
    user_id: dbUser.user_id,
    email: dbUser.email,
    first_name: dbUser.first_name,
    last_name: dbUser.last_name,
    full_name: fullName || dbUser.email?.split('@')[0] || '',
    role: dbUser.role,
    profile_image: dbUser.profile_image,
    email_verified: authUser?.email_confirmed_at != null,
    employer_verified: !!dbUser.employer_verified,
    employer_verification_status: dbUser.employer_verification_status,
    created_at: dbUser.created_at,
    updated_at: dbUser.updated_at,
  };
}

export function roleToUserType(role) {
  if (role === 'employer') return 'employer';
  if (role === 'candidate') return 'job_seeker';
  if (role === 'super_admin') return 'admin';
  return null;
}

export function userTypeToRole(userType) {
  if (userType === 'employer') return 'employer';
  if (userType === 'job_seeker') return 'candidate';
  return 'candidate';
}

export function isPlatformAdmin(user) {
  return user?.role === 'super_admin';
}

/** Employers submit for review; platform admins publish immediately. */
export function opportunitySubmitStatus(user) {
  return isPlatformAdmin(user) ? 'published' : 'pending';
}
