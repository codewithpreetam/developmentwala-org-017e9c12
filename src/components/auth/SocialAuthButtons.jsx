import React, { useState } from 'react';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { lovable } from '@/integrations/lovable';

function GoogleIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#EA4335" d="M12 10.2v3.9h5.5c-.24 1.42-1.7 4.16-5.5 4.16-3.31 0-6.01-2.74-6.01-6.12S8.69 6.02 12 6.02c1.88 0 3.14.8 3.86 1.49l2.63-2.54C16.84 3.49 14.65 2.5 12 2.5 6.76 2.5 2.5 6.76 2.5 12S6.76 21.5 12 21.5c6.93 0 9.5-4.86 9.5-7.4 0-.5-.05-.88-.12-1.26H12z"/>
    </svg>
  );
}

function LinkedInIcon(props) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" {...props}>
      <path fill="#0A66C2" d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.36V9h3.41v1.56h.05c.47-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.45v6.29zM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.72v20.56C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.72V1.72C24 .77 23.2 0 22.22 0z"/>
    </svg>
  );
}

export default function SocialAuthButtons({ next = '', mode = 'signin' }) {
  const [loading, setLoading] = useState(null);

  const handleGoogle = async () => {
    setLoading('google');
    try {
      if (next) {
        try { sessionStorage.setItem('post_auth_redirect', next); } catch {}
      }
      const result = await lovable.auth.signInWithOAuth('google', {
        redirect_uri: window.location.origin,
      });
      if (result?.error) {
        toast.error(result.error.message || 'Google sign-in failed.');
        setLoading(null);
        return;
      }
      if (result?.redirected) return;
      window.location.href = next || '/';
    } catch (err) {
      toast.error(err?.message || 'Google sign-in failed.');
      setLoading(null);
    }
  };

  const handleLinkedIn = () => {
    setLoading('linkedin');
    try {
      if (next) {
        try { sessionStorage.setItem('post_auth_redirect', next); } catch {}
      }
      const target = `/api/auth/linkedin/start?next=${encodeURIComponent(next || '/')}`;
      window.location.href = target;
    } catch (err) {
      toast.error(err?.message || 'LinkedIn sign-in failed.');
      setLoading(null);
    }
  };

  const verb = mode === 'signup' ? 'Sign up' : 'Continue';

  return (
    <div className="space-y-2.5">
      <button
        type="button"
        onClick={handleGoogle}
        disabled={loading === 'google'}
        className="w-full h-11 inline-flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition disabled:opacity-60"
      >
        {loading === 'google'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <GoogleIcon className="w-5 h-5" />}
        <span>{verb} with Google</span>
      </button>
      <button
        type="button"
        onClick={handleLinkedIn}
        disabled={loading === 'linkedin'}
        className="w-full h-11 inline-flex items-center justify-center gap-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition disabled:opacity-60"
      >
        {loading === 'linkedin'
          ? <Loader2 className="w-4 h-4 animate-spin" />
          : <LinkedInIcon className="w-5 h-5" />}
        <span>{verb} with LinkedIn</span>
      </button>
      <div className="relative py-2">
        <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-gray-200" /></div>
        <div className="relative flex justify-center"><span className="bg-white px-3 text-xs uppercase tracking-wider text-gray-400">or</span></div>
      </div>
    </div>
  );
}
