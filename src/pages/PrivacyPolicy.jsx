import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function PrivacyPolicy() {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-10">Effective Date: May 28, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 leading-relaxed">
            At DevelopmentWala.org, we value your privacy. This Privacy Policy explains how we collect, use, and protect your information when you visit and use our website.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Information We Collect</h2>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li><strong>Personal Information:</strong> Name, email address, and other details you provide when registering, applying for jobs, or contacting us.</li>
              <li><strong>Usage Data:</strong> IP address, browser type, pages visited, and time spent on the site.</li>
              <li><strong>Cookies:</strong> We use cookies to improve user experience, analyze traffic, and provide personalized content.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">How We Use Your Information</h2>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li>To provide and improve our services including the Job Board</li>
              <li>To communicate with you (newsletters, job alerts, updates, support)</li>
              <li>To analyze website usage and trends</li>
              <li>To prevent fraud and ensure security</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Sharing of Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed mb-2">We do not sell your personal information. We may share data with:</p>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li>Service providers who assist in website and job board operations</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Data Security</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We implement reasonable security measures to protect your information. However, no system is completely secure.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Your Rights</h2>
            <p className="text-gray-600 text-sm mb-2">You may:</p>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li>Access, update, or delete your personal information</li>
              <li>Opt out of marketing or job alert communications</li>
              <li>Disable cookies through your browser settings</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              For any privacy-related questions, please contact us at:{' '}
              <a href="mailto:jobboardsupport@developmentwala.org" className="text-blue-600 hover:underline">
                jobboardsupport@developmentwala.org
              </a>
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}