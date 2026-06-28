import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { CheckCircle2, XCircle, Loader2, ArrowRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { SITE_NAME } from '@/lib/brand';

export default function VerifyEmail() {
  const [status, setStatus] = useState('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const token = new URLSearchParams(window.location.search).get('token');
    if (!token) {
      setStatus('error');
      setMessage('This verification link is invalid. Please register again or contact support.');
      return;
    }
    base44.auth.verifyEmail(token).then((res) => {
      if (res?.success) {
        setStatus('success');
        setMessage('Your email is verified. You can now sign in to your account.');
      } else {
        setStatus('error');
        setMessage(res?.error || 'Verification failed. The link may have expired.');
      }
    }).catch(() => {
      setStatus('error');
      setMessage('Verification failed. The link may have expired or already been used.');
    });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead title={`Email Verification — ${SITE_NAME}`} description="Verify your DevelopmentWala account email address." />
      <Navbar />
      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 p-8 text-center shadow-xl shadow-gray-200/50">
          {status === 'loading' && (
            <>
              <Loader2 className="w-10 h-10 text-indigo-600 animate-spin mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verifying your email</h1>
              <p className="text-gray-500 text-sm">Please wait a moment...</p>
            </>
          )}
          {status === 'success' && (
            <>
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Email verified</h1>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <Link to={createPageUrl('SignIn')} className="inline-flex h-11 items-center gap-2 px-6 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
                Sign in <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
          {status === 'error' && (
            <>
              <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
              <h1 className="text-xl font-bold text-gray-900 mb-2">Verification failed</h1>
              <p className="text-gray-500 text-sm mb-6">{message}</p>
              <div className="flex flex-col gap-2">
                <Link to={createPageUrl('SignUp')} className="inline-flex h-11 items-center justify-center bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-semibold text-sm">
                  Create a new account
                </Link>
                <Link to={createPageUrl('SignIn')} className="text-sm text-gray-500 hover:text-indigo-600">
                  Back to sign in
                </Link>
                <Link to={createPageUrl('Contact')} className="text-xs text-gray-400 hover:text-gray-600">
                  Need help? Contact support
                </Link>
              </div>
            </>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
