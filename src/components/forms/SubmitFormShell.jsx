import React, { useEffect, useRef } from 'react';
import { Loader2 } from 'lucide-react';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import SEOHead from '../shared/SEOHead';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../auth/AuthContext';
import { isPlatformAdmin } from '@/lib/supabase/auth';
import { loadEmployerContactDefaults } from '@/lib/employerContact';

export default function SubmitFormShell({ title, subtitle, seoTitle, seoDesc, onSubmit, submitting, canSubmit, children, onUserLoaded }) {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const onUserLoadedRef = useRef(onUserLoaded);
  onUserLoadedRef.current = onUserLoaded;

  useEffect(() => {
    let cancelled = false;
    (async () => {
      let me = user;
      if (!me) {
        try {
          me = await base44.auth.me();
        } catch {
          return;
        }
      }
      if (!me || cancelled) return;
      const contact = await loadEmployerContactDefaults(me);
      if (!cancelled) onUserLoadedRef.current?.(me, contact);
    })();
    return () => { cancelled = true; };
  }, [user]);
  return (
    <div>
      <SEOHead title={seoTitle} description={seoDesc} canonical="https://developmentwala.org/submit" />
      <Navbar />
      <main>
        <section className="bg-gray-50 border-b border-gray-200 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{title}</h1>
            <p className="text-gray-500">{subtitle || (adminPost ? 'Publish directly to the live site.' : 'Free to post. Reviewed within 24–48 hours.')}</p>
          </div>
        </section>
        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-10">
              <form onSubmit={onSubmit} className="space-y-6">
                {children}
                {!adminPost && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                    ⏳ Your listing will be reviewed before going live. Usually within 24–48 hours.
                  </div>
                )}
                <button type="submit" disabled={submitting || !canSubmit}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : adminPost ? 'Publish Now' : 'Submit for Review'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}