import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import dwLogo from '@/assets/dw-logo.png.asset.json';
import {
  Mail, MessageCircle, Linkedin, Instagram, Youtube, Facebook,
  Send, CheckCircle2, Target, Sparkles, Mic, Briefcase, ExternalLink,
  ChevronDown, Globe, Users, BookOpen, Heart, ArrowRight, Building2,
} from 'lucide-react';

const SOCIALS = [
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/developmentwalajobboard', bg: 'bg-[#0A66C2]' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/developmentwala_official/', bg: 'bg-gradient-to-tr from-yellow-400 via-pink-500 to-purple-600' },
  { Icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/thedevelopmentwala', bg: 'bg-[#1877F2]' },
  { Icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@DevelopmentWalaofficial', bg: 'bg-[#FF0000]' },
];

const DW_SOCIALS = [
  { Icon: Globe, label: 'Website', href: 'https://developmentwala.com', bg: 'bg-slate-800' },
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/developmentwala', bg: 'bg-[#0A66C2]' },
  { Icon: Users, label: 'Topmate', href: 'https://topmate.io/developmentwala', bg: 'bg-amber-600' },
];

const FAQS = [
  { q: 'How can I post an opportunity?', a: 'Sign up as an Employer or NGO, head to your dashboard, and use "Post Opportunity" to publish jobs, internships, fellowships, grants, scholarships, or events. Admin-curated listings are also welcome via the contact form.' },
  { q: 'How do I advertise on DevelopmentWala.org?', a: 'We offer banner placements, featured listings, sponsored newsletters, and homepage spotlights. Write to us at mail@developmentwala.org with your goals and we will share a media kit.' },
  { q: 'How can my organization partner with DevelopmentWala.org?', a: 'We collaborate with NGOs, CSR teams, foundations, universities, and social enterprises on recruitment, capacity building, and outreach campaigns. Reach out using the form below or email partnerships directly.' },
  { q: 'How do I report an incorrect or fraudulent opportunity?', a: 'Use the contact form with the opportunity link and a short description. Our team reviews every report within 24–48 hours and removes anything that violates our quality standards.' },
  { q: 'How do I subscribe to updates?', a: 'Join our LinkedIn Newsletter and WhatsApp Channel using the buttons in the "Stay Connected" section, or subscribe to our weekly email digest from the homepage footer.' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', organization: '', subject: '', message: '', website: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const handleChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.website) return; // honeypot
    if (!form.name.trim() || !form.email.trim() || !form.message.trim()) {
      setError('Please fill in your name, email, and message.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const subject = form.subject || 'New enquiry from Contact page';
      const message = `${form.organization ? `Organization: ${form.organization}\n\n` : ''}${form.message}`;
      const res = await base44.functions.invoke('sendContactEmail', { ...form, subject, message });
      if (res.data?.success) setSubmitted(true);
      else setError(res.data?.error || 'Something went wrong. Please try again.');
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'ContactPage',
        name: 'Contact DevelopmentWala.org',
        url: 'https://developmentwala.org/contact',
        description: 'Get in touch with the DevelopmentWala.org team — India\'s social sector opportunities platform.',
      },
      {
        '@type': 'Organization',
        name: 'DevelopmentWala.org',
        url: 'https://developmentwala.org',
        logo: 'https://developmentwala.org' + dwLogo.url,
        sameAs: SOCIALS.map((s) => s.href),
        contactPoint: [{
          '@type': 'ContactPoint',
          contactType: 'customer support',
          email: 'mail@developmentwala.org',
          telephone: '+91-7320886323',
          areaServed: 'IN',
          availableLanguage: ['English', 'Hindi'],
        }],
      },
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://developmentwala.org' },
          { '@type': 'ListItem', position: 2, name: 'Contact', item: 'https://developmentwala.org/contact' },
        ],
      },
    ],
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fbfaf7]">
      <SEOHead
        title="Contact Us — DevelopmentWala.org | India's Social Sector Platform"
        description="Connect with DevelopmentWala.org for NGO jobs, internships, fellowships, partnerships, advertising, and social sector collaborations across India."
        canonical="https://developmentwala.org/contact"
        structuredData={structuredData}
      />
      <Navbar />

      {/* HERO */}
      <section className="relative overflow-hidden bg-gradient-to-br from-[#3b1f1a] via-[#5a2a20] to-[#8b3a2a] text-white">
        <div className="absolute inset-0 opacity-20 pointer-events-none"
             style={{ backgroundImage: 'radial-gradient(circle at 20% 20%, #fff 1px, transparent 1px), radial-gradient(circle at 80% 60%, #fff 1px, transparent 1px)', backgroundSize: '60px 60px' }} />
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-24 grid lg:grid-cols-[1.3fr_1fr] gap-10 items-center">
          <div>
            <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur text-xs font-semibold tracking-wider uppercase">
              <Sparkles className="w-3.5 h-3.5" /> Let's Connect
            </span>
            <h1 className="mt-5 text-4xl sm:text-5xl lg:text-6xl font-bold leading-[1.05] tracking-tight">
              Contact <span className="text-amber-300">Us</span>
            </h1>
            <p className="mt-5 text-lg text-white/85 max-w-2xl leading-relaxed">
              We&apos;re here to help you connect with meaningful opportunities and make a greater impact. Whether you&apos;re a job seeker, employer, NGO, social enterprise, or partner — we&apos;d love to hear from you.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <a href="#contact-form" className="inline-flex items-center gap-2 bg-white text-[#5a2a20] px-5 py-3 rounded-xl font-semibold hover:bg-amber-50 transition">
                <Send className="w-4 h-4" /> Send a Message
              </a>
              <a href="https://wa.me/917320886323" target="_blank" rel="noopener noreferrer"
                 className="inline-flex items-center gap-2 bg-emerald-500 text-white px-5 py-3 rounded-xl font-semibold hover:bg-emerald-600 transition">
                <MessageCircle className="w-4 h-4" /> WhatsApp Us
              </a>
            </div>
          </div>
          <div className="hidden lg:flex justify-center">
            <div className="relative w-72 h-72">
              <div className="absolute inset-0 rounded-full bg-amber-300/20 blur-3xl" />
              <div className="relative bg-white/10 backdrop-blur-md border border-white/20 rounded-3xl p-10 grid grid-cols-2 gap-6 place-items-center">
                {[Mail, MessageCircle, Users, Heart].map((Ic, i) => (
                  <div key={i} className="w-20 h-20 rounded-2xl bg-white/15 grid place-items-center">
                    <Ic className="w-9 h-9" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 -mt-12 relative z-10 w-full">
        <article className="bg-white rounded-3xl shadow-xl border border-amber-100 p-8 sm:p-12">
          <div className="flex items-start gap-5">
            <div className="shrink-0 w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-500 text-white grid place-items-center shadow-md">
              <Target className="w-7 h-7" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold uppercase tracking-widest text-amber-700">Our Mission</p>
              <h2 className="mt-1 text-2xl sm:text-3xl font-bold text-slate-900">Connecting passion with purpose</h2>
              <p className="mt-4 text-slate-600 leading-relaxed text-[15px]">
                At <strong>DevelopmentWala.org</strong>, we believe in connecting passion with purpose. Our mission is to empower individuals and organizations by making it easy to discover, access, and act on impactful opportunities in the development sector. We aim to build a transparent, inclusive, and growth-oriented ecosystem for NGO professionals, students, volunteers, researchers, and social entrepreneurs.
              </p>
            </div>
          </div>
        </article>
      </section>

      {/* GET IN TOUCH */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <div className="text-center mb-10">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Get in Touch</h2>
          <p className="mt-3 text-slate-600">Reach out through any of the channels below — we usually reply within 24 hours.</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-5 max-w-3xl mx-auto">
          <a href="mailto:mail@developmentwala.org"
             className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-amber-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 grid place-items-center group-hover:scale-110 transition-transform">
              <Mail className="w-6 h-6" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider font-bold text-slate-400">Email</p>
            <p className="mt-1 font-semibold text-slate-900 break-all">mail@developmentwala.org</p>
            <p className="mt-1 text-sm text-slate-500">Open in your mail app →</p>
          </a>
          <a href="https://wa.me/917320886323" target="_blank" rel="noopener noreferrer"
             className="group bg-white rounded-2xl p-6 border border-slate-200 hover:border-emerald-300 hover:shadow-lg transition-all">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 grid place-items-center group-hover:scale-110 transition-transform">
              <MessageCircle className="w-6 h-6" />
            </div>
            <p className="mt-4 text-xs uppercase tracking-wider font-bold text-slate-400">WhatsApp</p>
            <p className="mt-1 font-semibold text-slate-900">+91 7320 886323</p>
            <p className="mt-1 text-sm text-slate-500">Chat with us instantly →</p>
          </a>
        </div>

        {/* Socials */}
        <div className="mt-14 text-center">
          <h3 className="text-xl font-bold text-slate-900">Follow DevelopmentWala.org</h3>
          <p className="mt-2 text-sm text-slate-500">Stay updated with the latest opportunities and stories from the sector.</p>
          <div className="mt-6 flex flex-wrap justify-center gap-4">
            {SOCIALS.map(({ Icon, label, href, bg }) => (
              <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={`Follow on ${label}`}
                 className={`${bg} w-12 h-12 rounded-xl grid place-items-center text-white shadow-md hover:scale-110 hover:-translate-y-1 transition-all`}>
                <Icon className="w-5 h-5" />
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* STAY CONNECTED CTA */}
      <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-[#3b1f1a] text-white py-16 sm:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold">Stay Connected</h2>
          <p className="mt-3 text-white/70 max-w-2xl mx-auto">
            Never miss the latest NGO jobs, internships, fellowships, scholarships, grants, events, volunteering opportunities, and social sector updates.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
            <a href="https://www.linkedin.com/build-relation/newsletter-follow?entityUrn=7321557510367162368"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center justify-center gap-2 bg-[#0A66C2] hover:bg-[#0959aa] px-6 py-4 rounded-xl font-semibold transition shadow-lg">
              <Linkedin className="w-5 h-5" /> Subscribe on LinkedIn
            </a>
            <a href="https://whatsapp.com/channel/0029VaCxEqA0G0XoVCQyUx38"
               target="_blank" rel="noopener noreferrer"
               className="inline-flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 px-6 py-4 rounded-xl font-semibold transition shadow-lg">
              <MessageCircle className="w-5 h-5" /> Join WhatsApp Channel
            </a>
          </div>
        </div>
      </section>

      {/* MANAGED BY */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 w-full">
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="grid lg:grid-cols-[1.4fr_1fr]">
            <div className="p-8 sm:p-12">
              <p className="text-xs uppercase font-bold tracking-widest text-amber-700">Managed By</p>
              <h2 className="mt-2 text-3xl sm:text-4xl font-bold text-slate-900">Development Wala</h2>
              <p className="mt-4 text-slate-600 leading-relaxed">
                Development Wala is India&apos;s social sector ecosystem enabler providing end-to-end solutions in:
              </p>
              <div className="mt-5 grid sm:grid-cols-3 gap-3">
                {[
                  { Icon: Briefcase, label: 'Recruitment' },
                  { Icon: BookOpen, label: 'Documentation' },
                  { Icon: Users, label: 'Capacity Building' },
                ].map(({ Icon, label }) => (
                  <div key={label} className="flex items-center gap-2 p-3 rounded-xl bg-amber-50/60 border border-amber-100">
                    <Icon className="w-4 h-4 text-amber-700" />
                    <span className="text-sm font-semibold text-slate-800">{label}</span>
                  </div>
                ))}
              </div>
              <p className="mt-5 text-sm text-slate-500">
                for non-profits, foundations, CSR initiatives, educational institutions, and social enterprises.
              </p>

              <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-100 to-rose-100 border border-amber-200">
                <Sparkles className="w-4 h-4 text-rose-600" />
                <span className="text-sm font-bold text-slate-900">Let us do your <span className="text-rose-600">#HIRING</span></span>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <a href="https://developmentwala.com" target="_blank" rel="noopener noreferrer"
                   className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white px-5 py-3 rounded-xl font-semibold transition">
                  Visit Development Wala <ExternalLink className="w-4 h-4" />
                </a>
              </div>

              <div className="mt-6">
                <p className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">Follow Development Wala</p>
                <div className="flex gap-3">
                  {DW_SOCIALS.map(({ Icon, label, href, bg }) => (
                    <a key={label} href={href} target="_blank" rel="noopener noreferrer" aria-label={label}
                       className={`${bg} w-11 h-11 rounded-xl grid place-items-center text-white shadow hover:scale-110 transition`}>
                      <Icon className="w-5 h-5" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#5a2a20] to-[#3b1f1a] p-8 sm:p-12 flex flex-col items-center justify-center text-white text-center">
              <img src={dwLogo.url} alt="DevelopmentWala logo" className="h-14 w-auto bg-white rounded-xl px-3 py-2" loading="lazy" />
              <Building2 className="w-10 h-10 mt-6 text-amber-300" />
              <p className="mt-3 text-sm text-white/80 max-w-xs">
                Powering social sector hiring, learning, and storytelling across India.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* PODCAST */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 w-full">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-indigo-900 via-purple-900 to-fuchsia-800 text-white p-8 sm:p-14">
          <div className="absolute -right-12 -top-12 w-72 h-72 bg-fuchsia-500/20 rounded-full blur-3xl" />
          <div className="absolute -left-16 -bottom-16 w-80 h-80 bg-indigo-500/20 rounded-full blur-3xl" />
          <div className="relative grid lg:grid-cols-[1.4fr_1fr] gap-10 items-center">
            <div>
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider">
                <Mic className="w-3.5 h-3.5" /> Podcast Series
              </span>
              <h2 className="mt-4 text-3xl sm:text-4xl font-bold leading-tight">
                Decoding India&apos;s Social Sector
              </h2>
              <p className="mt-2 text-fuchsia-200 font-medium">A Podcast Series by Development Wala</p>
              <p className="mt-5 text-white/85 leading-relaxed">
                Real conversations with practitioners, leaders, policymakers, and changemakers shaping development across India.
              </p>
              <p className="mt-2 text-white/70 italic">
                Voices from the ground — unfiltered, honest, and deeply human.
              </p>
              <a href="https://developmentwala.com/podcast/" target="_blank" rel="noopener noreferrer"
                 className="mt-7 inline-flex items-center gap-2 bg-white text-purple-900 px-6 py-3.5 rounded-xl font-bold hover:bg-fuchsia-50 transition shadow-xl">
                <Mic className="w-4 h-4" /> Explore the Podcast <ArrowRight className="w-4 h-4" />
              </a>
            </div>
            <div className="hidden lg:flex justify-center">
              <div className="relative">
                <div className="w-56 h-56 rounded-full bg-gradient-to-br from-fuchsia-400 to-indigo-500 grid place-items-center shadow-2xl">
                  <Mic className="w-24 h-24 text-white" />
                </div>
                <div className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CONTACT FORM */}
      <section id="contact-form" className="max-w-3xl mx-auto px-4 sm:px-6 pb-16 sm:pb-20 w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Send us a Message</h2>
          <p className="mt-3 text-slate-600">We&apos;d love to hear about your idea, query, or partnership opportunity.</p>
        </div>
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-10">
          {submitted ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 mx-auto bg-emerald-100 rounded-full grid place-items-center">
                <CheckCircle2 className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="mt-4 text-2xl font-bold text-slate-900">Message Sent!</h3>
              <p className="mt-2 text-slate-500">Thanks for reaching out. We&apos;ll reply within 24–48 hours.</p>
              <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', organization: '', subject: '', message: '', website: '' }); }}
                      className="mt-6 text-amber-700 font-semibold hover:underline">
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Honeypot */}
              <input type="text" name="website" value={form.website} onChange={handleChange}
                     className="hidden" tabIndex={-1} autoComplete="off" aria-hidden="true" />

              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="name" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Full Name *</label>
                  <input id="name" name="name" required value={form.name} onChange={handleChange}
                         className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                </div>
                <div>
                  <label htmlFor="email" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Email Address *</label>
                  <input id="email" type="email" name="email" required value={form.email} onChange={handleChange}
                         className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-5">
                <div>
                  <label htmlFor="organization" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Organization</label>
                  <input id="organization" name="organization" value={form.organization} onChange={handleChange}
                         className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                </div>
                <div>
                  <label htmlFor="subject" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Subject</label>
                  <input id="subject" name="subject" value={form.subject} onChange={handleChange}
                         className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition" />
                </div>
              </div>
              <div>
                <label htmlFor="message" className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">Message *</label>
                <textarea id="message" name="message" required rows={6} value={form.message} onChange={handleChange}
                          className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-amber-400 focus:ring-2 focus:ring-amber-100 transition resize-none" />
              </div>

              {error && <p className="text-sm text-rose-600 bg-rose-50 border border-rose-200 px-4 py-2.5 rounded-xl">{error}</p>}

              <p className="text-xs text-slate-400">
                Protected by anti-spam verification. By submitting you agree to be contacted by DevelopmentWala.org.
              </p>

              <button type="submit" disabled={loading}
                      className="w-full bg-gradient-to-r from-amber-600 to-rose-600 hover:from-amber-700 hover:to-rose-700 disabled:opacity-70 text-white font-bold py-4 rounded-xl transition flex items-center justify-center gap-2 shadow-lg">
                {loading ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending…</>
                ) : (
                  <><Send className="w-4 h-4" /> Send Message</>
                )}
              </button>
            </form>
          )}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 pb-20 w-full">
        <div className="text-center mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900">Frequently Asked</h2>
          <p className="mt-3 text-slate-600">Quick answers to common questions.</p>
        </div>
        <div className="space-y-3">
          {FAQS.map((item, i) => {
            const open = openFaq === i;
            return (
              <div key={i} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                <button onClick={() => setOpenFaq(open ? -1 : i)}
                        aria-expanded={open}
                        className="w-full flex items-center justify-between gap-4 text-left px-5 sm:px-6 py-4 hover:bg-slate-50">
                  <span className="font-semibold text-slate-900">{item.q}</span>
                  <ChevronDown className={`w-5 h-5 shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
                </button>
                {open && (
                  <div className="px-5 sm:px-6 pb-5 text-slate-600 text-[15px] leading-relaxed">{item.a}</div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <Footer />
    </div>
  );
}
