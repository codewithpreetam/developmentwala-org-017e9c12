import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { X, Users, Building2, ArrowRight } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { getLogoUrl, SITE_NAME, SITE_TAGLINE } from '@/lib/brand';
import { signInUrl, signUpUrl, setLoginRoleHint } from '@/lib/auth/redirect';

const SESSION_KEY = 'dw_signup_popup_shown';

export default function SignupPopup() {
  const { user, loading } = useAuth();
  const siteSettings = useSiteSettings();
  const logoUrl = getLogoUrl(siteSettings);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (loading || user || sessionStorage.getItem(SESSION_KEY)) return;
    const timer = setTimeout(() => {
      setVisible(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 20000);
    return () => clearTimeout(timer);
  }, [user, loading]);

  if (!visible) return null;

  const go = (role, mode) => {
    setLoginRoleHint(role);
    window.location.href = mode === 'signup' ? signUpUrl('', role === 'employer' ? 'employer' : 'candidate') : signInUrl('');
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-end sm:items-center justify-center px-4 py-6">
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="relative px-6 py-5 text-white" style={{ background: 'linear-gradient(135deg, #3730a3 0%, #4f46e5 70%, #6366f1 100%)' }}>
          <button onClick={() => setVisible(false)} className="absolute top-4 right-4 p-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white">
            <X className="w-4 h-4" />
          </button>
          <img src={logoUrl} alt={SITE_NAME} className="h-9 object-contain brightness-0 invert mb-3" />
          <h2 className="text-lg font-bold">Join {SITE_NAME}</h2>
          <p className="text-white/80 text-sm mt-1">{SITE_TAGLINE}</p>
        </div>

        <div className="p-5 space-y-3">
          {[
            { role: 'job_seeker', icon: Users, title: 'Job seeker', desc: 'Apply to NGO jobs, fellowships and more', mode: 'signup' },
            { role: 'employer', icon: Building2, title: 'Employer / NGO', desc: 'Post opportunities and manage applicants', mode: 'signup' },
          ].map(({ role, icon: Icon, title, desc }) => (
            <button key={role} onClick={() => go(role, 'signup')} className="w-full flex items-center gap-4 p-4 rounded-xl border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50/50 transition-all group text-left">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center shrink-0">
                <Icon className="w-5 h-5 text-indigo-600" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 text-sm">{title}</div>
                <div className="text-xs text-gray-500">{desc}</div>
              </div>
              <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-600" />
            </button>
          ))}

          <p className="text-center text-sm text-gray-500 pt-1">
            Already registered?{' '}
            <Link to={createPageUrl('SignIn')} className="text-indigo-600 font-medium hover:underline">Sign in</Link>
          </p>
          <button onClick={() => setVisible(false)} className="w-full text-center text-xs text-gray-400 hover:text-gray-600 py-2">
            Continue browsing
          </button>
        </div>
      </div>
    </div>
  );
}
