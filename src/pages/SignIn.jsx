import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { ArrowRight, AlertCircle, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../components/auth/AuthContext';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { Input } from '@/components/ui/input';
import AuthShell, { RoleToggle } from '../components/auth/AuthShell';
import { roleConfig, dashboardForRole } from '@/lib/auth/roles';
import { consumeLoginRoleHint, signUpUrl } from '@/lib/auth/redirect';
import ResendVerification from '../components/auth/ResendVerification';
import SocialAuthButtons from '../components/auth/SocialAuthButtons';
import { getLogoUrl, SITE_NAME } from '@/lib/brand';
import { useSiteSettings } from '../hooks/useSiteSettings';

export default function SignIn() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const siteSettings = useSiteSettings();
  const logoUrl = getLogoUrl(siteSettings);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('job_seeker');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : new URLSearchParams();
  const next = urlParams.get('next') || '';
  const active = role === 'employer' ? roleConfig.employer : roleConfig.job_seeker;

  useEffect(() => {
    const hint = consumeLoginRoleHint();
    if (hint) setRole(hint);
  }, []);

  useEffect(() => {
    if (user) {
      const dest = next || createPageUrl(dashboardForRole(user.role));
      navigate(dest);
    }
  }, [user, next, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }

    setSubmitting(true);
    try {
      const me = await login(email.trim(), password);
      if (me.role === 'super_admin') {
        sessionStorage.setItem('ngo_admin', 'yes');
        navigate(next || createPageUrl('AdminDashboard'));
        return;
      }
      const expectedRole = active.dbRole;
      if (me.role && me.role !== expectedRole) {
        const actual = me.role === 'employer' ? 'an employer account' : 'a job seeker account';
        setError(`This email is registered as ${actual}. Switch to the correct account type above.`);
        return;
      }
      navigate(next || createPageUrl(dashboardForRole(me.role || expectedRole)));
    } catch (err) {
      if (err.code === 'email_not_verified') {
        setError('Please verify your email before signing in. Check your inbox for the verification link.');
      } else {
        setError(err.message || 'Invalid email or password. Please try again.');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const fillDemo = () => {
    const creds = role === 'employer'
      ? { email: 'employer@developmentwala.org', password: 'DemoPass123' }
      : { email: 'demo@developmentwala.org', password: 'DemoPass123' };
    setEmail(creds.email);
    setPassword(creds.password);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead
        title={`Sign In — ${SITE_NAME}`}
        description="Sign in to DevelopmentWala to apply for NGO jobs, manage applications, or post opportunities for your organisation."
        canonical="https://developmentwala.org/SignIn"
      />
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-10 sm:py-16">
        <AuthShell
          logoUrl={logoUrl}
          active={active}
          legalNote={(
            <>
              By signing in you agree to our{' '}
              <Link to={createPageUrl('TermsOfUse')} className="hover:text-gray-600 underline">Terms of Use</Link>
              {' '}and{' '}
              <Link to={createPageUrl('PrivacyPolicy')} className="hover:text-gray-600 underline">Privacy Policy</Link>.
            </>
          )}
        >
          <div className="mb-8">
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Sign in</h1>
            <p className="text-gray-500 text-sm mt-1">Access your {SITE_NAME} account</p>
          </div>

          <RoleToggle role={role} onChange={(id) => { setRole(id); setError(''); }} roles={[roleConfig.job_seeker, roleConfig.employer]} />

          <SocialAuthButtons next={next} mode="signin" />

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="signin-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email address</label>
              <Input id="signin-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@organisation.org" type="email" autoComplete="email" required className="h-11 rounded-xl border-gray-200" />
            </div>
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="signin-password" className="block text-sm font-medium text-gray-700">Password</label>
                <Link to={createPageUrl('ForgotPassword')} className="text-xs text-indigo-600 hover:underline">Forgot password?</Link>
              </div>
              <div className="relative">
                <Input id="signin-password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password" type={showPassword ? 'text' : 'password'} autoComplete="current-password" required className="h-11 rounded-xl border-gray-200 pr-11" />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            {error && (
              <div className="bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100 space-y-2">
                <div className="flex items-start gap-2.5">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                </div>
                {error.includes('verify your email') && (
                  <ResendVerification email={email} className="pl-6" />
                )}
              </div>
            )}
            <button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
              {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Signing in...</> : <>Sign in as {active.label} <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100 space-y-3 text-center text-sm">
            <p className="text-gray-500">
              Don&apos;t have an account?{' '}
              <Link to={signUpUrl(next)} className="text-indigo-600 font-medium hover:underline">Create a free account</Link>
            </p>
            <p className="text-gray-400 text-xs">
              Need help signing in?{' '}
              <Link to={createPageUrl('Contact')} className="text-gray-500 hover:text-indigo-600 hover:underline">Contact support</Link>
            </p>
            <p className="text-gray-400 text-xs">
              Platform administrator?{' '}
              <Link to={createPageUrl('AdminLogin')} className="text-gray-500 hover:text-indigo-600 hover:underline">Admin sign in</Link>
            </p>
          </div>

          {import.meta.env.DEV && (
            <button type="button" onClick={fillDemo} className="mt-4 w-full text-xs text-gray-400 hover:text-gray-600 py-2">
              Dev: fill demo credentials
            </button>
          )}
        </AuthShell>
      </main>

      <Footer />
    </div>
  );
}
