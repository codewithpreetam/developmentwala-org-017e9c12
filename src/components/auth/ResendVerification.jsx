import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Loader2, Mail } from 'lucide-react';

export default function ResendVerification({ email, className = '' }) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleResend = async () => {
    if (!email?.trim()) return;
    setSending(true);
    setError('');
    try {
      await base44.auth.resendVerification(email.trim());
      setSent(true);
    } catch (err) {
      setError(err.message || 'Could not resend email. Try again or contact support.');
    } finally {
      setSending(false);
    }
  };

  if (sent) {
    return (
      <p className={`text-sm text-green-700 bg-green-50 border border-green-100 rounded-xl px-4 py-3 ${className}`}>
        Verification email sent. Check your inbox and spam folder.
      </p>
    );
  }

  return (
    <div className={className}>
      <button
        type="button"
        onClick={handleResend}
        disabled={sending || !email?.trim()}
        className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
      >
        {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Mail className="w-4 h-4" />}
        Resend verification email
      </button>
      {error && <p className="text-xs text-red-600 mt-2">{error}</p>}
    </div>
  );
}
