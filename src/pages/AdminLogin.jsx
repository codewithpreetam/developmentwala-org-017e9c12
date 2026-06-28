import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { useAdminAuth } from '../components/admin/AdminAuth';
import { Shield, Eye, EyeOff, AlertCircle, LogIn, Loader2, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { SITE_NAME } from '@/lib/brand';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { isAdmin, login, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && isAdmin) navigate(createPageUrl('AdminDashboard'));
  }, [isAdmin, loading, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    const ok = await login(email.trim(), password);
    setSubmitting(false);
    if (ok) navigate(createPageUrl('AdminDashboard'));
    else setError('Invalid admin credentials. Please try again.');
  };

  if (loading) return null;

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead title={`Admin Sign In — ${SITE_NAME}`} description="Administrator access for DevelopmentWala platform management." />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-200/50 p-8">
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <Shield className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-bold text-gray-900">Administrator access</h1>
              <p className="text-gray-500 text-sm mt-1">Sign in with your platform admin account</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="admin-email" className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                <Input id="admin-email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="admin@your-organisation.org" type="email" required autoComplete="username" className="h-11 rounded-xl" />
              </div>
              <div>
                <label htmlFor="admin-password" className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <div className="relative">
                  <Input id="admin-password" type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter password" required autoComplete="current-password" className="h-11 rounded-xl pr-11" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </div>
              )}
              <button type="submit" disabled={submitting} className="w-full h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogIn className="w-4 h-4" />}
                {submitting ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          </div>

          <Link to={createPageUrl('SignIn')} className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500 hover:text-indigo-600">
            <ArrowLeft className="w-4 h-4" /> Back to main site
          </Link>

          {import.meta.env.DEV && (
            <p className="text-center text-xs text-gray-400 mt-4">Dev: use seeded admin credentials from db:seed-demo</p>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
