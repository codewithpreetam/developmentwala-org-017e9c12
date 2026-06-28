import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function TermsOfUse() {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Terms of Use</h1>
        <p className="text-sm text-gray-400 mb-10">Effective Date: May 28, 2026</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 leading-relaxed">
            Welcome to DevelopmentWala.org. By accessing or using our website, you agree to be bound by these Terms of Use.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Use of the Website</h2>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li>You must be at least 18 years old to use the Job Board section.</li>
              <li>You agree to use the website only for lawful purposes.</li>
              <li>You must not misuse, disrupt, or attempt to gain unauthorized access to any part of the website.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Intellectual Property</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              All content on DevelopmentWala.org, including tutorials, articles, code samples, job listings, logos, and design, is the property of DevelopmentWala.org and is protected by copyright laws. You may not reproduce, distribute, or modify content without prior written permission.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">User-Generated Content</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              If you submit content (comments, resumes, job applications, etc.), you grant us a non-exclusive, royalty-free license to use, display, and distribute that content.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Disclaimer</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              The website and its content (including job listings) are provided "as is". We do not guarantee the accuracy, completeness, or reliability of any information, tutorials, or job postings. Use them at your own risk.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Limitation of Liability</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              DevelopmentWala.org shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the website or Job Board.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Termination</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We reserve the right to suspend or terminate your access at any time without notice for violation of these terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to Terms</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We may update these Terms of Use from time to time. Continued use of the website after changes constitutes your acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              For any questions regarding these Terms, contact:{' '}
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