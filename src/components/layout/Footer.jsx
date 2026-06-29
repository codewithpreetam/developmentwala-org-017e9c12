import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { Mail, MessageCircle, Linkedin, Instagram, Youtube, Facebook, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { getLogoUrl, SITE_NAME } from '@/lib/brand';

export default function Footer() {
  const siteSettings = useSiteSettings();
  const logoUrl = getLogoUrl(siteSettings);
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState('');
  const [isError, setIsError] = useState(false);

  const handleSubscribe = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    setLoading(true);
    setStatusMsg('');
    setIsError(false);
    try {
      const res = await base44.functions.invoke('subscribeToMailchimp', { email: email.trim() });
      const data = res.data;
      if (data?.success) {
        setSubscribed(true);
        setEmail('');
        if (data?.already_subscribed) {
          setStatusMsg('You are already subscribed. Thanks for being with us!');
        } else if (data?.pending) {
          setStatusMsg('Almost there! Check your inbox to confirm your subscription.');
        } else {
          setStatusMsg('Successfully subscribed to our weekly opportunity alerts.');
        }
      } else {
        setIsError(true);
        setStatusMsg(data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setIsError(true);
      setStatusMsg('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <footer className="bg-white border-t border-gray-100">
      {/* Newsletter Banner */}
      <div className="max-w-6xl mx-auto px-6 pt-16">
        <div className="relative bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl overflow-hidden px-10 py-10 mb-16 flex flex-col md:flex-row items-center gap-8">
          <div className="absolute -top-12 -left-12 w-48 h-48 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute -bottom-10 -right-10 w-56 h-56 bg-white/5 rounded-full pointer-events-none" />
          <div className="absolute top-4 right-40 w-6 h-6 border-2 border-white/20 rounded-full pointer-events-none" />
          <div className="absolute bottom-6 left-1/3 w-3 h-3 bg-white/20 rounded-full pointer-events-none" />

          <div className="flex-1 relative z-10">
            <h3 className="text-xl md:text-2xl font-bold text-white leading-snug mb-1.5">
              Stay updated with the latest<br className="hidden md:block" /> social impact opportunities
            </h3>
            <p className="text-blue-100 text-sm">
              Get weekly alerts for jobs, fellowships, grants &amp; more — straight to your inbox.
            </p>
          </div>

          <div className="relative z-10 w-full md:w-auto md:min-w-[340px]">
            {subscribed ?
            <div className="bg-white/20 border border-white/30 text-white text-sm font-medium px-5 py-3.5 rounded-xl text-center">
                ✓ {statusMsg || 'Thanks for joining!'}
              </div> :

            <>
                <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-2">
                  <div className="flex-1 bg-white/15 border border-white/20 rounded-xl flex items-center gap-2.5 px-4">
                    <Mail className="w-4 h-4 text-white/60 shrink-0" />
                    <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="flex-1 bg-transparent text-white placeholder:text-white/50 outline-none text-sm py-3.5"
                    required />
                  
                  </div>
                  <button type="submit" disabled={loading}
                className="bg-white text-blue-600 font-semibold text-sm px-5 py-3.5 rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto sm:shrink-0 flex items-center justify-center gap-1.5 disabled:opacity-70">
                    {loading ? 'Subscribing...' : <><span>Subscribe</span><ArrowRight className="w-3.5 h-3.5" /></>}
                  </button>
                </form>
                {statusMsg ?
              <p className={`text-xs mt-2 pl-1 font-medium ${isError ? 'text-red-200' : 'text-blue-200'}`}>
                    {statusMsg}
                  </p> :

              <p className="text-blue-200/60 text-xs mt-2 pl-1">No spam. Unsubscribe at any time.</p>
              }
              </>
            }
          </div>
        </div>
      </div>

      {/* Main footer grid */}
      <div className="max-w-6xl mx-auto px-6 pb-10">
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 pb-10 border-b border-gray-100">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-2 md:col-span-3 lg:col-span-2">
            <Link to="/" className="inline-block mb-4">
              <img src={logoUrl} alt={SITE_NAME} className="h-10 object-contain" />
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed max-w-xs mb-5">Discover NGO jobs, CSR roles, internships, grants, fellowships, and social sector events across India. {SITE_NAME} connects development professionals with meaningful careers and opportunities.

            </p>
            <div className="flex items-center gap-3">
              {[
              { Icon: Facebook, href: 'https://www.facebook.com/thedevelopmentwala' },
              { Icon: Linkedin, href: 'https://www.linkedin.com/company/developmentwalajobboard' },
              { Icon: Instagram, href: 'https://www.instagram.com/developmentwala_official/' },
              { Icon: Youtube, href: 'https://www.youtube.com/@DevelopmentWalaofficial' }].
              map(({ Icon, href }, i) =>
              <a key={i} href={href} target="_blank" rel="noopener noreferrer"
              className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-gray-400 hover:text-gray-700 hover:border-gray-300 hover:bg-gray-50 transition-all">
                  <Icon className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>

          {/* Platform */}
          <div className="col-span-1">
            <h3 className="font-semibold text-sm text-gray-900 mb-4">Platform</h3>
            <ul className="space-y-3">
              {[
              { label: 'Jobs', to: '/jobs' },
              { label: 'Internships', to: '/internships' },
              { label: 'Fellowships', to: '/fellowships' },
              { label: 'Scholarships', to: '/scholarships' },
              { label: 'Grants', to: '/grants' },
              { label: 'Events', to: '/events' }].
              map((l) =>
              <li key={l.label}>
                  <Link to={l.to} className="text-gray-400 hover:text-gray-900 text-sm transition-colors">{l.label}</Link>
                </li>
              )}
            </ul>
          </div>

          {/* For Organizations */}
          <div className="col-span-1">
            <h3 className="font-semibold text-sm text-gray-900 mb-4">For Organizations</h3>
            <ul className="space-y-3">
              {[
              { label: 'Post a Job', to: '/submit-job' },
              { label: 'Post Internship', to: '/submit-internship' },
              { label: 'Post Fellowship', to: '/submit-fellowship' },
              { label: 'Post Event', to: '/submit-event' },
              { label: 'Employer Dashboard', to: '/employer-dashboard' },
              { label: 'Organizations', to: '/employers' }].
              map((l) =>
              <li key={l.label}>
                  <Link to={l.to} className="text-gray-400 hover:text-gray-900 text-sm transition-colors">{l.label}</Link>
                </li>
              )}
            </ul>
          </div>

          {/* Resources */}
          <div className="col-span-2 sm:col-span-2 md:col-span-1 lg:col-span-1">
            <h3 className="font-semibold text-sm text-gray-900 mb-4">Pages</h3>
            <ul className="space-y-3">
              <li><Link to="/blog" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Blog</Link></li>
              <li><Link to="/post-opportunity" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Post Opportunity</Link></li>
              <li><Link to="/contact" className="text-gray-400 hover:text-gray-900 text-sm transition-colors">Contact Us</Link></li>
              <li>
                <a href="https://wa.me/+917320886323" target="_blank" rel="noopener noreferrer"
                className="text-gray-400 hover:text-gray-900 text-sm transition-colors flex items-center gap-1.5">
                  <MessageCircle className="w-3.5 h-3.5 text-green-500" /> WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="pt-7 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-gray-400 text-xs">© {new Date().getFullYear()} DevelopmentWala.org. All rights reserved.</p>
          <div className="flex items-center gap-5">
            {[
            { label: 'Privacy Policy', to: '/privacy-policy' },
            { label: 'Terms of Use', to: '/terms-of-use' },
            { label: 'Legal', to: '/legal' },
            { label: 'Site Map', to: '/sitemap' }].
            map((item) =>
            <Link key={item.label} to={item.to} className="text-gray-400 hover:text-gray-700 text-xs transition-colors">{item.label}</Link>
            )}
          </div>
        </div>
      </div>
    </footer>);

}