import React, { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import {
  ShieldCheck, Lock, User, Building2, Activity, Cookie, Database,
  Mail, Globe, MessageCircle, ChevronRight, FileText, Users, Bell,
  Server, Clock, Scale, Baby, RefreshCcw, ExternalLink, ArrowUp,
} from 'lucide-react';

const LAST_UPDATED = 'June 29, 2026';

const SECTIONS = [
  { id: 'introduction', label: 'Introduction' },
  { id: 'information-we-collect', label: 'Information We Collect' },
  { id: 'how-we-use', label: 'How We Use Your Information' },
  { id: 'newsletter', label: 'Newsletter & Emails' },
  { id: 'cookies', label: 'Cookies' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'external-opportunities', label: 'External Opportunities' },
  { id: 'data-security', label: 'Data Security' },
  { id: 'data-retention', label: 'Data Retention' },
  { id: 'your-rights', label: 'Your Rights' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to this Policy' },
  { id: 'contact', label: 'Contact Us' },
];

function SectionHeading({ id, icon: Icon, children }) {
  return (
    <h2
      id={id}
      className="scroll-mt-28 flex items-center gap-3 text-2xl md:text-3xl font-semibold tracking-tight text-slate-900"
    >
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
        <Icon className="h-5 w-5" />
      </span>
      {children}
    </h2>
  );
}

function InfoCard({ icon: Icon, title, items }) {
  return (
    <div className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:shadow-md hover:border-emerald-200">
      <div className="flex items-center gap-3">
        <span className="inline-flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white">
          <Icon className="h-5 w-5" />
        </span>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
      </div>
      <ul className="mt-4 space-y-2 text-sm text-slate-600">
        {items.map((it) => (
          <li key={it} className="flex items-start gap-2">
            <ChevronRight className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />
            <span>{it}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function PrivacyPolicy() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const [showTop, setShowTop] = useState(false);

  useEffect(() => {
    const onScroll = () => setShowTop(window.scrollY > 600);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) setActive(e.target.id);
        });
      },
      { rootMargin: '-40% 0px -55% 0px', threshold: 0 }
    );
    SECTIONS.forEach((s) => {
      const el = document.getElementById(s.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      {/* Hero */}
      <header className="relative overflow-hidden border-b border-slate-200 bg-gradient-to-br from-emerald-50 via-white to-teal-50">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:radial-gradient(circle_at_1px_1px,rgb(16_185_129_/_0.18)_1px,transparent_0)] [background-size:24px_24px]" />
        <div className="mx-auto max-w-6xl px-6 pt-16 pb-20">
          {/* Breadcrumb */}
          <nav aria-label="Breadcrumb" className="mb-6 text-sm text-slate-500">
            <ol className="flex flex-wrap items-center gap-1.5">
              <li><Link to="/" className="hover:text-emerald-700">Home</Link></li>
              <li aria-hidden="true">/</li>
              <li><Link to="/legal" className="hover:text-emerald-700">Legal</Link></li>
              <li aria-hidden="true">/</li>
              <li className="text-slate-900 font-medium" aria-current="page">Privacy Policy</li>
            </ol>
          </nav>

          <div className="flex items-start gap-5">
            <div className="hidden sm:flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-200">
              <ShieldCheck className="h-7 w-7" />
            </div>
            <div className="flex-1">
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800 ring-1 ring-emerald-200">
                <Lock className="h-3.5 w-3.5" /> Your privacy matters to us
              </span>
              <h1 className="mt-4 text-4xl md:text-5xl font-bold tracking-tight text-slate-900">
                Privacy Policy
              </h1>
              <p className="mt-4 max-w-2xl text-base md:text-lg text-slate-600 leading-relaxed">
                At <strong className="font-semibold text-slate-900">DevelopmentWala.org</strong>, we are committed to protecting your
                personal information and being transparent about how we collect, use, store, and protect your data.
              </p>
              <p className="mt-6 inline-flex items-center gap-2 text-sm text-slate-500">
                <Clock className="h-4 w-4" /> Last Updated: <span className="font-medium text-slate-700">{LAST_UPDATED}</span>
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="mx-auto max-w-6xl px-6 py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-[260px_minmax(0,1fr)]">
          {/* TOC */}
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <p className="px-3 text-xs font-semibold uppercase tracking-wider text-slate-500">On this page</p>
              <ul className="mt-3 space-y-1 text-sm">
                {SECTIONS.map((s) => (
                  <li key={s.id}>
                    <a
                      href={`#${s.id}`}
                      className={`block rounded-lg px-3 py-2 transition ${
                        active === s.id
                          ? 'bg-emerald-50 text-emerald-800 font-semibold ring-1 ring-emerald-100'
                          : 'text-slate-600 hover:text-emerald-700 hover:bg-slate-100'
                      }`}
                    >
                      {s.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Content */}
          <article className="min-w-0 space-y-14 scroll-smooth">
            <section id="introduction" className="scroll-mt-28">
              <SectionHeading id="introduction" icon={FileText}>Introduction</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 text-slate-700 leading-relaxed shadow-sm">
                <p>Welcome to <strong>DevelopmentWala.org</strong>.</p>
                <p className="mt-3">
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you visit
                  our website and use our services. By using DevelopmentWala.org, you agree to the practices described in this
                  Privacy Policy.
                </p>
              </div>
            </section>

            <section id="information-we-collect">
              <SectionHeading id="information-we-collect" icon={Database}>Information We Collect</SectionHeading>
              <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
                <InfoCard
                  icon={User}
                  title="Personal Information"
                  items={[
                    'Full Name', 'Email Address', 'Phone Number (if provided)',
                    'Organization Name', 'Job Title', 'Resume/CV (when applying)',
                    'Profile Information', 'Newsletter Subscription Details',
                    'Messages submitted through the Contact Form',
                  ]}
                />
                <InfoCard
                  icon={Building2}
                  title="Employer Information"
                  items={[
                    'Organization Name', 'Organization Logo', 'Website',
                    'Organization Description', 'Contact Information',
                    'Social Media Links', 'Billing information (if applicable)',
                  ]}
                />
                <InfoCard
                  icon={Activity}
                  title="Automatically Collected"
                  items={[
                    'IP Address', 'Browser Type', 'Device Information',
                    'Operating System', 'Pages Visited', 'Time Spent on Pages',
                    'Referral Sources', 'Cookies', 'Analytics Data',
                  ]}
                />
              </div>
            </section>

            <section id="how-we-use">
              <SectionHeading id="how-we-use" icon={Users}>How We Use Your Information</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <p className="text-slate-700">Your information may be used to:</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  {[
                    'Create and manage your account',
                    'Process job applications',
                    'Allow employers to review applications',
                    'Publish employer profiles and opportunities',
                    'Send newsletters and platform updates',
                    'Respond to enquiries',
                    'Improve website functionality',
                    'Monitor website performance',
                    'Prevent fraud and abuse',
                    'Comply with legal obligations',
                  ].map((it) => (
                    <li key={it} className="flex items-start gap-2">
                      <ChevronRight className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />{it}
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            <section id="newsletter">
              <SectionHeading id="newsletter" icon={Bell}>Newsletter &amp; Email Communications</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-slate-700 leading-relaxed">
                <p>If you subscribe to our newsletter:</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-500" />Your email address will be securely stored.</li>
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-500" />We may send weekly opportunity updates including jobs, fellowships, scholarships, grants, internships, events and career resources.</li>
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-emerald-500" />You may unsubscribe at any time via the unsubscribe link in every email.</li>
                </ul>
              </div>
            </section>

            <section id="cookies">
              <SectionHeading id="cookies" icon={Cookie}>Cookies</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-slate-700 leading-relaxed">
                <p>DevelopmentWala.org uses cookies to improve user experience, remember preferences, analyze website traffic, measure performance, and support security.</p>
                <p className="mt-3 text-sm text-slate-600">You may disable cookies through your browser settings; however, some features of the website may not function properly.</p>
              </div>
            </section>

            <section id="third-party">
              <SectionHeading id="third-party" icon={Server}>Third-Party Services</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <p className="text-slate-700">We may use trusted third-party services including:</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {['Google Analytics','Google Search Console','Mailchimp','Supabase','Cloudflare','LinkedIn','Facebook','Instagram','YouTube','Payment gateways (future)'].map((s) => (
                    <span key={s} className="rounded-full bg-slate-100 px-3 py-1 text-xs font-medium text-slate-700 ring-1 ring-slate-200">{s}</span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-600">Each third-party service has its own privacy practices.</p>
              </div>
            </section>

            <section id="external-opportunities">
              <SectionHeading id="external-opportunities" icon={ExternalLink}>External Opportunities</SectionHeading>
              <div className="mt-5 rounded-2xl border border-amber-200 bg-amber-50/60 p-6 md:p-8 text-slate-700 leading-relaxed">
                <p>DevelopmentWala.org curates opportunities from external organizations. Please note:</p>
                <ul className="mt-3 space-y-1.5 text-sm">
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-amber-600" />We do not own most externally sourced opportunities.</li>
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-amber-600" />Clicking <strong>Apply Externally</strong> redirects you to the official website of the respective organization.</li>
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-amber-600" />We are not responsible for the privacy policies or practices of third-party websites.</li>
                  <li className="flex gap-2"><ChevronRight className="mt-0.5 h-4 w-4 text-amber-600" />Review the privacy policy of any external website before sharing personal information.</li>
                </ul>
              </div>
            </section>

            <section id="data-security">
              <SectionHeading id="data-security" icon={ShieldCheck}>Data Security</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <p className="text-slate-700">We implement appropriate technical and organizational safeguards, including:</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  {['HTTPS encryption','Secure authentication','Database access controls','Role-based permissions','Secure API communication','Regular security monitoring'].map((it) => (
                    <span key={it} className="flex items-center gap-2 rounded-lg bg-slate-50 px-3 py-2 ring-1 ring-slate-200">
                      <Lock className="h-4 w-4 text-emerald-600" />{it}
                    </span>
                  ))}
                </div>
                <p className="mt-4 text-sm text-slate-600">While we strive to protect your data, no online service can guarantee absolute security.</p>
              </div>
            </section>

            <section id="data-retention">
              <SectionHeading id="data-retention" icon={Clock}>Data Retention</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-slate-700 leading-relaxed">
                <p>We retain personal information only for as long as necessary to provide our services, meet legal obligations, resolve disputes, and improve our platform.</p>
                <p className="mt-3 text-sm text-slate-600">Users may request deletion of their account and personal data, subject to applicable legal requirements.</p>
              </div>
            </section>

            <section id="your-rights">
              <SectionHeading id="your-rights" icon={Scale}>Your Rights</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm">
                <p className="text-slate-700">Depending on applicable laws, you may have the right to:</p>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2 text-sm text-slate-700">
                  {['Access your personal data','Update or correct your information','Delete your account','Withdraw consent','Unsubscribe from marketing emails','Request a copy of your personal data','Object to certain processing activities'].map((it) => (
                    <li key={it} className="flex items-start gap-2"><ChevronRight className="mt-0.5 h-4 w-4 flex-none text-emerald-500" />{it}</li>
                  ))}
                </ul>
                <p className="mt-4 text-sm text-slate-600">Requests can be submitted by contacting us.</p>
              </div>
            </section>

            <section id="children">
              <SectionHeading id="children" icon={Baby}>Children's Privacy</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-slate-700 leading-relaxed">
                <p>DevelopmentWala.org is not intended for children under the age of 18. We do not knowingly collect personal information from minors.</p>
              </div>
            </section>

            <section id="changes">
              <SectionHeading id="changes" icon={RefreshCcw}>Changes to this Privacy Policy</SectionHeading>
              <div className="mt-5 rounded-2xl border border-slate-200 bg-white p-6 md:p-8 shadow-sm text-slate-700 leading-relaxed">
                <p>We may update this Privacy Policy periodically. The "Last Updated" date will always reflect the latest revision. Continued use of the website constitutes acceptance of the updated Privacy Policy.</p>
              </div>
            </section>

            <section id="contact">
              <SectionHeading id="contact" icon={Mail}>Contact Us</SectionHeading>
              <div className="mt-5 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6 md:p-8 shadow-sm">
                <p className="text-slate-700">If you have any questions regarding this Privacy Policy, please contact us:</p>
                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <a href="mailto:mail@developmentwala.org" className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Mail className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-xs text-slate-500">Email</span>
                      <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">mail@developmentwala.org</span>
                    </span>
                  </a>
                  <a href="https://developmentwala.org" target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><Globe className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-xs text-slate-500">Website</span>
                      <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">developmentwala.org</span>
                    </span>
                  </a>
                  <a href="https://wa.me/917320886323" target="_blank" rel="noreferrer" className="group flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-emerald-300 hover:shadow-md">
                    <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700"><MessageCircle className="h-5 w-5" /></span>
                    <span className="min-w-0">
                      <span className="block text-xs text-slate-500">WhatsApp</span>
                      <span className="block truncate text-sm font-semibold text-slate-900 group-hover:text-emerald-700">+91 7320 886323</span>
                    </span>
                  </a>
                </div>
              </div>
            </section>

            {/* Related Pages */}
            <section aria-labelledby="related" className="pt-2">
              <h2 id="related" className="text-lg font-semibold text-slate-900">Related Pages</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {[
                  { to: '/legal', label: 'Terms & Conditions' },
                  { to: '/contact', label: 'Contact Us' },
                  { to: '/about', label: 'About Us' },
                  { to: '/legal', label: 'Disclaimer' },
                ].map((l) => (
                  <Link key={l.label} to={l.to} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-emerald-300 hover:text-emerald-700 hover:shadow-sm">
                    {l.label}
                  </Link>
                ))}
              </div>
            </section>
          </article>
        </div>
      </div>

      {showTop && (
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          aria-label="Back to top"
          className="fixed bottom-6 right-6 z-40 inline-flex h-11 w-11 items-center justify-center rounded-full bg-emerald-600 text-white shadow-lg shadow-emerald-200 transition hover:bg-emerald-700"
        >
          <ArrowUp className="h-5 w-5" />
        </button>
      )}

      <Footer />
    </div>
  );
}
