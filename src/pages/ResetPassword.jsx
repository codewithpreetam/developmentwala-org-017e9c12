import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { KeyRound, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Input } from '@/components/ui/input';
import { SITE_NAME } from '@/lib/brand';

export default function ResetPassword() {
  const navigate = useNavigate();
  const token = new URLSearchParams(window.location.search).get('token') || '';
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await base44.auth.resetPassword(token, password);
      if (res?.success) {
        setDone(true);
        setTimeout(() => navigate(createPageUrl('SignIn')), 2500);
      } else {
        setError(res?.error || 'Reset failed. The link may have expired.');
      }
    } catch (err) {
      setError(err.message || 'Reset failed. Please request a new link.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
        <SEOHead title={`Reset Password — ${SITE_NAME}`} />
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border p-8 text-center">
            <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-3" />
            <p className="text-gray-600 text-sm mb-4">This reset link is invalid.</p>
            <Link to={createPageUrl('ForgotPassword')} className="text-indigo-600 font-medium hover:underline text-sm">
              Request a new reset link
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead title={`Reset Password — ${SITE_NAME}`} description="Choose a new password for your DevelopmentWala account." />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
          {done ? (
            <div className="text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Password updated</h1>
              <p className="text-gray-500 text-sm">Redirecting you to sign in...</p>
            </div>
          ) : (
            <>
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center mb-4">
                <KeyRound className="w-6 h-6 text-indigo-600" />
              </div>
              <h1 className="text-xl font-bold text-gray-900 mb-1">Set a new password</h1>
              <p className="text-gray-500 text-sm mb-6">Choose a strong password with at least 8 characters.</p>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="reset-password" className="block text-sm font-medium text-gray-700 mb-1.5">New password</label>
                  <div className="relative">
                    <Input id="reset-password" type={showPassword ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} required minLength={8} autoComplete="new-password" className="h-11 rounded-xl pr-11" />
                    <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label htmlFor="reset-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
                  <Input id="reset-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} required autoComplete="new-password" className="h-11 rounded-xl" />
                </div>
                {error && (
                  <div className="flex items-start gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </div>
                )}
                <button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {submitting ? 'Updating...' : 'Update password'}
                </button>
              </form>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
