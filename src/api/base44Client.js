import { createClient } from '@/lib/supabase/client';
import { getSessionUser, setSessionUser, toAppUser } from '@/lib/supabase/auth';
import { entities } from '@/lib/supabase/entities';
import { uploadFile } from '@/lib/supabase/storage';
import { signInUrl } from '@/lib/auth/redirect';

const supabase = createClient();

const auth = {
  async isAuthenticated() {
    return !!getSessionUser();
  },

  async me() {
    const user = getSessionUser();
    if (!user) {
      const err = new Error('Not authenticated');
      err.status = 401;
      throw err;
    }
    return toAppUser(user);
  },

  async login(email, password) {
    const { data, error } = await supabase.rpc('login_user', {
      p_email: email,
      p_password: password,
    });
    if (error) throw error;
    if (!data) {
      const err = new Error('Invalid email or password');
      err.status = 401;
      throw err;
    }
    if (data.error === 'email_not_verified') {
      const err = new Error('Please verify your email before signing in. Check your inbox or sign up again.');
      err.code = 'email_not_verified';
      err.email = data.email;
      throw err;
    }
    setSessionUser(data);
    return toAppUser(data);
  },

  async register({ email, password, firstName, lastName, role = 'candidate' }) {
    const { data, error } = await supabase.rpc('register_user', {
      p_email: email,
      p_password: password,
      p_first_name: firstName,
      p_last_name: lastName,
      p_role: role,
    });
    if (error) throw error;
    return data;
  },

  async verifyEmail(token) {
    const { data, error } = await supabase.rpc('verify_email_token', { p_token: token });
    if (error) throw error;
    return data;
  },

  async requestPasswordReset(email) {
    const { data, error } = await supabase.rpc('request_password_reset', { p_email: email });
    if (error) throw error;
    return data;
  },

  async resetPassword(token, password) {
    const { data, error } = await supabase.rpc('reset_password_with_token', {
      p_token: token,
      p_password: password,
    });
    if (error) throw error;
    return data;
  },

  async resendVerification(email) {
    const { data, error } = await supabase.rpc('resend_verification_email', { p_email: email });
    if (error) throw error;
    return data;
  },

  logout(redirectTo) {
    setSessionUser(null);
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
    const result = await entities.EmailSubscription.create({
      email: payload.email,
      full_name: payload.full_name,
      source: 'footer',
    });
    return {
      data: {
        success: result.success || result.active,
        already_subscribed: result.already_subscribed,
      },
    };
  }
  if (name === 'sendContactEmail') {
    await entities.ContactMessage.create({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
    });
    const { queueNotificationEmail } = await import('@/lib/supabase/extra-entities');
    await queueNotificationEmail(
      'admin@developmentwala.org',
      `Contact: ${payload.subject || 'New message'}`,
      `<p>From ${payload.name} (${payload.email})</p><p>${payload.message}</p>`
    ).catch(() => {});
    return { data: { success: true } };
  }
  if (name === 'sendWeeklyAlerts') {
    return { data: { message: 'Run npm run alerts:weekly on the server to send weekly digests.' } };
  }
  throw new Error(`Unknown function: ${name}`);
}

export const base44 = {
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
