const SESSION_KEY = 'ngo_user';

export function getSessionUser() {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function setSessionUser(user) {
  if (user) localStorage.setItem(SESSION_KEY, JSON.stringify(user));
  else localStorage.removeItem(SESSION_KEY);
}

export function toAppUser(dbUser) {
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
    email_verified: dbUser.email_verified !== false,
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
