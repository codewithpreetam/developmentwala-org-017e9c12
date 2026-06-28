import React from 'react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

export default function Legal() {
  return (
    <div>
      <Navbar />
      <main className="max-w-3xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Legal</h1>
        <p className="text-sm text-gray-400 mb-10">Legal Information</p>

        <div className="prose prose-gray max-w-none space-y-8">
          <p className="text-gray-600 leading-relaxed">
            DevelopmentWala.org is an educational and job portal platform focused on social sector careers, NGO opportunities, internships, fellowships, scholarships, and grants in India.
          </p>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Company Information</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              DevelopmentWala.org<br />
              (Operated by DevelopmentWala)
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Jurisdiction</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              These terms are governed by the laws of India.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Disclaimers</h2>
            <ul className="space-y-2 text-gray-600 text-sm leading-relaxed list-disc pl-5">
              <li>All content is for educational and informational purposes only.</li>
              <li>Job listings are provided by third parties. We are not responsible for the accuracy of job postings or any employment-related issues.</li>
              <li>We are not responsible for any loss or damage caused by following our content or applying to jobs listed on our platform.</li>
              <li>External links are provided for convenience; we do not endorse third-party websites.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Copyright Policy</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              We respect intellectual property rights. If you believe any content on our site infringes your copyright, please contact us with detailed information.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Trademark</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              "DevelopmentWala" and its logo are trademarks of DevelopmentWala.org.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-gray-900 mb-3">Contact</h2>
            <p className="text-gray-600 text-sm leading-relaxed">
              For any legal inquiries or support, please email:{' '}
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