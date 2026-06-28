import React from 'react';
import { Link } from 'react-router-dom';
import { X, Lock } from 'lucide-react';
import { createPageUrl } from '@/utils';
import { signInUrl, signUpUrl, setLoginRoleHint } from '@/lib/auth/redirect';
import { roleConfig } from '@/lib/auth/roles';

export default function AuthGateModal({
  open = true,
  onClose,
  title = 'Sign in to continue',
  description = 'Choose how you want to access DevelopmentWala.',
  next,
  defaultRole = 'employer',
}) {
  if (!open) return null;

  const returnPath = next || window.location.pathname + window.location.search;

  const goSignIn = (role) => {
    setLoginRoleHint(role);
    window.location.href = signInUrl(returnPath);
  };

  const goSignUp = (role) => {
    setLoginRoleHint(role);
    window.location.href = signUpUrl(returnPath, role === 'employer' ? 'employer' : 'candidate');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 py-8 bg-black/60 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden relative">
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 z-10"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        <div className="px-8 pt-8 pb-4 text-center border-b border-gray-100">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="w-6 h-6 text-indigo-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <p className="text-gray-500 text-sm mt-1">{description}</p>
        </div>

        <div className="p-6 space-y-4">
          {[roleConfig.employer, roleConfig.job_seeker].map((r) => (
            <div key={r.id} className="rounded-xl border border-gray-200 p-4">
              <p className="font-semibold text-gray-900 text-sm">{r.label}</p>
              <p className="text-xs text-gray-500 mt-1 mb-3">
                {r.id === 'employer'
                  ? 'Post and manage opportunities for your organisation.'
                  : 'Apply to opportunities and manage your profile.'}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => goSignIn(r.id)}
                  className="flex-1 h-10 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg"
                >
                  Sign in
                </button>
                <button
                  type="button"
                  onClick={() => goSignUp(r.id)}
                  className="flex-1 h-10 border border-gray-200 hover:bg-gray-50 text-gray-700 text-sm font-semibold rounded-lg"
                >
                  Create account
                </button>
              </div>
            </div>
          ))}

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full text-center text-sm text-gray-400 hover:text-gray-600 py-2"
            >
              Continue browsing
            </button>
          )}
        </div>

        <p className="text-center text-xs text-gray-400 px-6 pb-6">
          By continuing you agree to our{' '}
          <Link to={createPageUrl('TermsOfUse')} className="underline hover:text-gray-600">Terms of Use</Link>
          {' '}and{' '}
          <Link to={createPageUrl('PrivacyPolicy')} className="underline hover:text-gray-600">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
}
