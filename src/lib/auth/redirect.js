import { createPageUrl } from '@/utils';

export function signInUrl(next) {
  const base = createPageUrl('SignIn');
  return next ? `${base}?next=${encodeURIComponent(next)}` : base;
}

export function signUpUrl(next, role) {
  const params = new URLSearchParams();
  if (next) params.set('next', next);
  if (role) params.set('role', role);
  const qs = params.toString();
  return `${createPageUrl('SignUp')}${qs ? `?${qs}` : ''}`;
}

export function redirectToSignIn(next) {
  window.location.href = signInUrl(next || window.location.pathname + window.location.search);
}

export function setLoginRoleHint(role) {
  sessionStorage.setItem('login_role_hint', role);
}

export function consumeLoginRoleHint() {
  const hint = sessionStorage.getItem('login_role_hint');
  if (hint === 'employer' || hint === 'job_seeker') {
    sessionStorage.removeItem('login_role_hint');
    return hint;
  }
  return null;
}
