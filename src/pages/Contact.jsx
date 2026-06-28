import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { SITE_NAME } from '@/lib/brand';
import { Mail, Phone, MessageCircle, MapPin, Linkedin, Instagram, Youtube, Facebook, Send, CheckCircle2 } from 'lucide-react';

const SOCIALS = [
  { Icon: Linkedin, label: 'LinkedIn', href: 'https://www.linkedin.com/company/developmentwalajobboard', color: 'hover:text-blue-600' },
  { Icon: Instagram, label: 'Instagram', href: 'https://www.instagram.com/developmentwala_official/', color: 'hover:text-pink-500' },
  { Icon: Youtube, label: 'YouTube', href: 'https://www.youtube.com/@DevelopmentWalaofficial', color: 'hover:text-red-500' },
  { Icon: Facebook, label: 'Facebook', href: 'https://www.facebook.com/thedevelopmentwala', color: 'hover:text-blue-700' },
];

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await base44.functions.invoke('sendContactEmail', form);
      if (res.data?.success) {
        setSubmitted(true);
      } else {
        setError(res.data?.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f5f5f7]">
      <SEOHead
        title={`Contact Us — ${SITE_NAME}`}
        description="Get in touch with the DevelopmentWala team for support, partnerships, or employer enquiries."
        canonical="https://developmentwala.org/Contact"
      />
      <Navbar />

      <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-12 sm:py-16 px-4 sm:px-6 text-center">
        <h1 className="text-3xl md:text-4xl font-bold text-white mb-3">Get in Touch</h1>
        <p className="text-indigo-100 text-lg max-w-xl mx-auto">
          Have a question, partnership idea, or need support? We&apos;d love to hear from you.
        </p>
      </section>

      <section className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-16 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">

          {/* Left: contact info */}
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-6">Contact Information</h2>
              <div className="space-y-5">
                <a href="mailto:jobboardsupport@developmentwala.org"
                  className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Mail className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Email</p>
                    <p className="text-gray-800 font-medium text-sm group-hover:text-blue-600 transition-colors">jobboardsupport@developmentwala.org</p>
                  </div>
                </a>

                <a href="tel:+917320886323" className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-blue-50 flex items-center justify-center shrink-0 group-hover:bg-blue-100 transition-colors">
                    <Phone className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">Phone</p>
                    <p className="text-gray-800 font-medium text-sm group-hover:text-blue-600 transition-colors">+91 73208 86323</p>
                  </div>
                </a>

                <a href="https://wa.me/+917320886323" target="_blank" rel="noopener noreferrer"
                  className="flex items-start gap-4 group">
                  <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0 group-hover:bg-green-100 transition-colors">
                    <MessageCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-0.5">WhatsApp</p>
                    <p className="text-gray-800 font-medium text-sm group-hover:text-green-600 transition-colors">Chat with us on WhatsApp</p>
                  </div>
                </a>
              </div>
            </div>

            {/* Social links */}
            <div>
              <h3 className="text-sm font-semibold text-gray-700 mb-4">Follow Us</h3>
              <div className="flex flex-col gap-3">
                {SOCIALS.map(({ Icon, label, href, color }) => (
                  <a key={label} href={href} target="_blank" rel="noopener noreferrer"
                    className={`flex items-center gap-3 text-gray-500 ${color} transition-colors group`}>
                    <div className="w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center group-hover:border-gray-300 group-hover:bg-gray-50 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">{label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right: form */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 sm:p-8">
              {submitted ? (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <CheckCircle2 className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message Sent!</h3>
                  <p className="text-gray-500 text-sm">Thanks for reaching out. We'll get back to you within 24-48 hours.</p>
                  <button onClick={() => { setSubmitted(false); setForm({ name: '', email: '', phone: '', subject: '', message: '' }); }}
                    className="mt-6 text-blue-600 text-sm font-medium hover:underline">
                    Send another message
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-5">
                  <h2 className="text-xl font-bold text-gray-900 mb-6">Send us a Message</h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Your Name *</label>
                      <input name="name" value={form.name} onChange={handleChange} required
                        placeholder="Full name"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Email *</label>
                      <input name="email" type="email" value={form.email} onChange={handleChange} required
                        placeholder="your@email.com"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Phone</label>
                      <input name="phone" value={form.phone} onChange={handleChange}
                        placeholder="+91 XXXXX XXXXX"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Subject</label>
                      <input name="subject" value={form.subject} onChange={handleChange}
                        placeholder="How can we help?"
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1.5 uppercase tracking-wide">Message *</label>
                    <textarea name="message" value={form.message} onChange={handleChange} required rows={5}
                      placeholder="Tell us more about your query..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-100 transition-all resize-none" />
                  </div>

                  {error && <p className="text-red-500 text-sm">{error}</p>}

                  <button type="submit" disabled={loading}
                    className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-70 text-white font-semibold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Sending...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Send Message</>
                    )}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}