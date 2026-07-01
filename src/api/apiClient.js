import { createClient } from '@/lib/supabase/client';
import { getSessionUser, setSessionUser, clearSessionUser, toAppUser } from '@/lib/supabase/auth';
import { entities } from '@/lib/supabase/entities';
import { uploadFile } from '@/lib/supabase/storage';
import { signInUrl } from '@/lib/auth/redirect';

const supabase = createClient();

async function getUserByEmail(email) {
  if (!email) return null;
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .ilike('email', email.trim())
    .maybeSingle();
  if (error) throw error;
  return data;
}

async function getUserById(id) {
  if (!id) return null;
  const { data, error } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data;
}

async function ensureUserProfile(authUser, { firstName, lastName, role } = {}) {
  if (!authUser) return null;
  const existing = await getUserById(authUser.id);
  if (existing) return existing;

  const profile = {
    id: authUser.id,
    email: authUser.email,
    user_id: authUser.email,
    first_name: firstName || authUser.user_metadata?.first_name || '',
    last_name: lastName || authUser.user_metadata?.last_name || '',
    role: role || authUser.user_metadata?.role || 'candidate',
    is_active: true,
  };
  const { error } = await supabase.from('users').insert(profile);
  if (error && error.code !== '23505' && !/row-level security/i.test(error.message || '')) {
    throw error;
  }
  return profile;

}

const auth = {
  async isAuthenticated() {
    return !!getSessionUser();
  },

  async me() {
    const sessionUser = getSessionUser();
    if (sessionUser) return sessionUser;
    const { data: { user: authUser }, error } = await supabase.auth.getUser();
    if (error || !authUser) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    const profile = await getUserById(authUser.id);
    return toAppUser(profile, authUser);
  },

  async login(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      const err = new Error(error.message || 'Invalid email or password');
      err.status = 401;
      throw err;
    }
    const profile = await ensureUserProfile(data.user);
    const appUser = toAppUser(profile, data.user);
    setSessionUser(appUser);
    return appUser;
  },

  async register({ email, password, firstName, lastName, role = 'candidate' }) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
          last_name: lastName,
          role,
          user_id: email,
        },
      },
    });
    if (error) throw error;
    const authUser = data.user;
    if (!authUser) {
      throw new Error('Sign up failed. Please check your email to confirm your account.');
    }
    const profile = await ensureUserProfile(authUser, { firstName, lastName, role });
    const appUser = toAppUser(profile, authUser);
    setSessionUser(appUser);
    return appUser;
  },

  async verifyEmail(token) {
    if (!token) return { success: true };
    try {
      const { error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email',
      });
      if (error) throw error;
      return { success: true };
    } catch (err) {
      return { success: true };
    }
  },

  async requestPasswordReset(email) {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) throw error;
    return { success: true };
  },

  async resetPassword(token, password) {
    if (password) {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
    }
    return { success: true };
  },

  async resendVerification(email) {
    const { error } = await supabase.auth.resend({ type: 'signup', email });
    if (error) throw error;
    return { success: true };
  },

  async logout(redirectTo) {
    await supabase.auth.signOut();
    clearSessionUser();
    if (redirectTo) {
      const path = redirectTo.startsWith('http')
        ? new URL(redirectTo).pathname + new URL(redirectTo).search
        : redirectTo;
      window.location.href = path.startsWith('/') ? path : `/${path}`;
    }
  },

  redirectToLogin(returnUrl) {
    window.location.href = signInUrl(returnUrl || window.location.pathname + window.location.search);
  },
};

async function invokeFunction(name, payload) {
  if (name === 'subscribeToMailchimp') {
    try {
      const { subscribeNewsletter } = await import('@/lib/mailchimp.functions');
      const result = await subscribeNewsletter({
        data: {
          email: payload.email,
          firstName: payload.first_name || payload.full_name?.split(' ')[0],
          lastName: payload.last_name,
          source: payload.source || 'DevelopmentWala.org footer',
        },
      });
      // Mirror to local table for analytics / backup (best-effort)
      entities.EmailSubscription.create({
        email: payload.email,
        full_name: payload.full_name,
        source: payload.source || 'footer',
      }).catch(() => {});
      return { data: result };
    } catch (e) {
      return { data: { success: false, error: e?.message || 'Subscription failed' } };
    }
  }
  if (name === 'sendContactEmail') {
    await entities.ContactMessage.create({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    });
    const escHtml = (s) => String(s ?? '').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
    const { queueNotificationEmail } = await import('@/lib/supabase/extra-entities');
    await queueNotificationEmail(
      'admin@developmentwala.org',
      `Contact: ${escHtml(payload.subject || 'New message')}`,
      `<p>From ${escHtml(payload.name)} (${escHtml(payload.email)})</p><p>${escHtml(payload.message).replace(/\n/g,'<br>')}</p>`
    ).catch(() => {});
    return { data: { success: true } };
  }
  if (name === 'sendWeeklyAlerts') {
    return { data: { message: 'Run npm run alerts:weekly on the server to send weekly digests.' } };
  }
  throw new Error(`Unknown function: ${name}`);
}

export const api = {
  auth,
  entities,
  integrations: {
    Core: {
      async UploadFile({ file, folder }) {
        return uploadFile(file, folder || 'files');
      },
    },
  },
  functions: {
    async invoke(name, payload = {}) {
      return invokeFunction(name, payload);
    },
  },
};
