import React, { useEffect, useState } from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { ArrowRight, AlertCircle, Mail, Eye, EyeOff, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Input } from '@/components/ui/input';
import AuthShell, { RoleToggle } from '../components/auth/AuthShell';
import { roleConfig } from '@/lib/auth/roles';
import { consumeLoginRoleHint } from '@/lib/auth/redirect';
import { getLogoUrl, SITE_NAME } from '@/lib/brand';
import ResendVerification from '../components/auth/ResendVerification';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function SignUp() {
  const siteSettings = useSiteSettings();
  const logoUrl = getLogoUrl(siteSettings);

  const [role, setRole] = useState('job_seeker');
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', confirm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [verifyToken, setVerifyToken] = useState('');

  const urlParams = new URLSearchParams(window.location.search);
  const next = urlParams.get('next') || '';
  const roleParam = urlParams.get('role');
  const active = role === 'employer' ? roleConfig.employer : roleConfig.job_seeker;

  useEffect(() => {
    const hint = consumeLoginRoleHint();
    if (hint) setRole(hint);
    else if (roleParam === 'employer') setRole('employer');
  }, [roleParam]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.confirm) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const result = await base44.auth.register({
        email: form.email.trim(),
        password: form.password,
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        role: role === 'employer' ? 'employer' : 'candidate',
      });
      setVerifyToken(result.verification_token || '');
      setDone(true);
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const signInHref = `${createPageUrl('SignIn')}${next ? `?next=${encodeURIComponent(next)}` : ''}`;

  if (done) {
    return (
      <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
        <SEOHead title={`Verify Email — ${SITE_NAME}`} description="Verify your DevelopmentWala account to get started." />
        <Navbar />
        <main className="flex-1 flex items-center justify-center px-4 py-16">
          <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-xl shadow-gray-200/50">
            <div className="w-14 h-14 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-7 h-7 text-green-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Check your email</h1>
            <p className="text-gray-500 text-sm mb-4">
              We sent a verification link to <strong>{form.email}</strong>. Click the link to activate your account before signing in.
            </p>
            <div className="mb-6 space-y-3">
              <ResendVerification email={form.email} />
              <p className="text-xs text-gray-400">
                Still nothing? Check spam or{' '}
                <Link to={createPageUrl('Contact')} className="text-indigo-600 hover:underline">contact support</Link>.
              </p>
            </div>
            {import.meta.env.DEV && verifyToken && (
              <p className="text-xs text-gray-400 mb-4 break-all">
                Dev: <Link to={`/VerifyEmail?token=${verifyToken}`} className="text-indigo-600 underline">Open verification link</Link>
              </p>
            )}
            <Link to={signInHref} className="inline-flex h-11 items-center px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm">
              Back to sign in
            </Link>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead
        title={`Create Account — ${SITE_NAME}`}
        description="Create your free DevelopmentWala account as a job seeker or employer in the social impact sector."
        canonical="https://developmentwala.org/SignUp"
      />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <AuthShell
          logoUrl={logoUrl}
          active={active}
          legalNote={(
            <>
              By creating an account you agree to our{' '}
              <Link to={createPageUrl('TermsOfUse')} className="hover:text-gray-600 underline">Terms of Use</Link>
              {' '}and{' '}
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-gray-600 underline">Privacy Policy</Link>.
            </>
          )}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Create your account</h1>
            <p className="text-gray-500 text-sm mt-1">Join {SITE_NAME} — free for job seekers and employers</p>
          </div>

          <RoleToggle role={role} onChange={(id) => { setRole(id); setError(''); }} roles={[roleConfig.job_seeker, roleConfig.employer]} />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="signup-first" className="block text-sm font-medium text-gray-700 mb-1.5">First name</label>
                <Input id="signup-first" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} required autoComplete="given-name" className="h-11 rounded-xl" />
              </div>
              <div>
                <label htmlFor="signup-last" className="block text-sm font-medium text-gray-700 mb-1.5">Last name</label>
                <Input id="signup-last" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} autoComplete="family-name" className="h-11 rounded-xl" />
              </div>
            </div>
            <div>
              <label htmlFor="signup-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <Input id="signup-email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required autoComplete="email" className="h-11 rounded-xl" />
            </div>
            <div>
              <label htmlFor="signup-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
              <div className="relative">
                <Input id="signup-password" type={showPassword ? 'text' : 'password'} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required minLength={8} autoComplete="new-password" className="h-11 rounded-xl pr-11" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div>
              <label htmlFor="signup-confirm" className="block text-sm font-medium text-gray-700 mb-1.5">Confirm password</label>
              <Input id="signup-confirm" type="password" value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} required autoComplete="new-password" className="h-11 rounded-xl" />
            </div>
            {error && (
              <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
              </div>
            )}
            <button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating account...</> : <>Create account <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <p className="text-center text-sm text-gray-500 mt-6">
            Already have an account?{' '}
            <Link to={signInHref} className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
        </AuthShell>
      </main>
      <Footer />
    </div>
  );
}
