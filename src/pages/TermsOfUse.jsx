import React from 'react';
import { Link } from '../lib/router-adapter';
import { ScrollText, ShieldAlert, Home, ChevronRight } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const SECTIONS = [
  { id: 'about', label: 'About DevelopmentWala.org' },
  { id: 'acceptance', label: '1. Acceptance of Terms' },
  { id: 'eligibility', label: '2. Eligibility' },
  { id: 'accounts', label: '3. User Accounts' },
  { id: 'job-seekers', label: '4. Job Seekers' },
  { id: 'employers', label: '5. Employers and Recruiters' },
  { id: 'conduct', label: '6. User Conduct' },
  { id: 'ip', label: '7. Intellectual Property' },
  { id: 'payments', label: '8. Payments and Premium Services' },
  { id: 'third-party', label: '9. Third-Party Links' },
  { id: 'disclaimer', label: '10. Disclaimer' },
  { id: 'recruitment-disclaimer', label: '11. Recruitment Disclaimer' },
  { id: 'liability', label: '12. Limitation of Liability' },
  { id: 'termination', label: '13. Account Suspension or Termination' },
  { id: 'indemnification', label: '14. Indemnification' },
  { id: 'changes', label: '15. Changes to These Terms' },
  { id: 'law', label: '16. Governing Law' },
  { id: 'contact', label: '17. Contact Us' },
];

const LAST_UPDATED = new Date().toLocaleDateString('en-GB', {
  day: 'numeric', month: 'long', year: 'numeric',
});

function Section({ id, title, children }) {
  return (
    <section id={id} className="scroll-mt-24">
      <h2 className="text-2xl font-bold text-gray-900 mb-4">{title}</h2>
      <div className="space-y-3 text-gray-700 text-[15px] leading-relaxed">{children}</div>
    </section>
  );
}

function List({ items }) {
  return (
    <ul className="list-disc pl-5 space-y-1.5">
      {items.map((it, i) => <li key={i}>{it}</li>)}
    </ul>
  );
}

export default function TermsOfUse() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />

      {/* Hero */}
      <div className="bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        <div className="max-w-6xl mx-auto px-6 py-16">
          <nav className="flex items-center gap-2 text-sm text-blue-100 mb-6">
            <Link to="/" className="flex items-center gap-1 hover:text-white">
              <Home className="w-3.5 h-3.5" /> Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white">Terms & Conditions</span>
          </nav>
          <div className="flex items-start gap-5">
            <div className="hidden sm:flex w-14 h-14 rounded-2xl bg-white/15 backdrop-blur items-center justify-center shrink-0">
              <ScrollText className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Terms & Conditions and Disclaimer</h1>
              <p className="mt-3 text-blue-100 max-w-2xl">
                Please read these terms carefully before using DevelopmentWala.org. They govern your access to and use of our platform, job board, and related services.
              </p>
              <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <span className="px-3 py-1 rounded-full bg-white/15">Effective Date: 29 June 2026</span>
                <span className="px-3 py-1 rounded-full bg-white/15">Last Updated: {LAST_UPDATED}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-12 grid lg:grid-cols-[260px,1fr] gap-10">
        {/* TOC */}
        <aside className="hidden lg:block">
          <div className="sticky top-24 bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">On this page</h3>
            <ul className="space-y-1.5 text-sm">
              {SECTIONS.map(s => (
                <li key={s.id}>
                  <a href={`#${s.id}`} className="text-gray-600 hover:text-blue-700 block py-0.5">{s.label}</a>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        {/* Content */}
        <main className="bg-white rounded-2xl border border-gray-200 p-6 md:p-10 space-y-10">
          <p className="text-gray-700 leading-relaxed">
            Welcome to <strong>DevelopmentWala.org</strong> ("Development Wala", "we", "our", or "us"). By accessing or using our website, mobile applications, recruitment platform, job board, and related services (collectively, the "Platform"), you agree to comply with these Terms & Conditions. If you do not agree with these terms, please do not use our Platform.
          </p>

          <Section id="about" title="About DevelopmentWala.org">
            <p>DevelopmentWala.org is India's leading career and recruitment platform for the nonprofit, development, CSR, education, public policy, sustainability, humanitarian, research, and social impact sectors. We connect employers with talented professionals while providing career resources and recruitment solutions.</p>
          </Section>

          <Section id="acceptance" title="1. Acceptance of Terms">
            <p>By registering an account, posting jobs, applying for opportunities, or using any feature of the Platform, you acknowledge that you have read, understood, and agreed to these Terms & Conditions, our Privacy Policy, and any additional policies published on the Platform.</p>
          </Section>

          <Section id="eligibility" title="2. Eligibility">
            <p>You must be at least 18 years of age or legally eligible to enter into binding agreements under the laws of your jurisdiction.</p>
            <p>By using the Platform, you confirm that:</p>
            <List items={[
              'The information you provide is accurate and truthful.',
              'You will keep your account information updated.',
              'You are legally authorised to use our services.',
            ]} />
          </Section>

          <Section id="accounts" title="3. User Accounts">
            <p>Users are responsible for maintaining the confidentiality of their account credentials.</p>
            <p>You agree to:</p>
            <List items={[
              'Keep your login information secure.',
              'Notify us immediately of any unauthorised use of your account.',
              'Accept responsibility for all activities conducted through your account.',
            ]} />
            <p>DevelopmentWala.org reserves the right to suspend or terminate accounts found to be in violation of these Terms.</p>
          </Section>

          <Section id="job-seekers" title="4. Job Seekers">
            <p>Job seekers may:</p>
            <List items={[
              'Create a professional profile.',
              'Upload one or more resumes/CVs.',
              'Apply for jobs, internships, fellowships, volunteering opportunities, and consultancy assignments.',
              'Save jobs and manage applications.',
            ]} />
            <p>Job seekers agree that:</p>
            <List items={[
              'All information submitted is truthful.',
              'Uploaded documents belong to them or they have permission to use them.',
              'They will not impersonate another individual.',
              'They will not upload false qualifications, forged certificates, or misleading information.',
            ]} />
          </Section>

          <Section id="employers" title="5. Employers and Recruiters">
            <p>Employers may:</p>
            <List items={[
              'Register organisational accounts.',
              'Post employment opportunities.',
              'Search candidate profiles (where permitted).',
              'Contact candidates regarding recruitment.',
            ]} />
            <p>Employers agree that:</p>
            <List items={[
              'Job postings are genuine and lawful.',
              'They possess authority to recruit on behalf of the organisation.',
              'All recruitment activities comply with applicable employment laws.',
              'They will not discriminate unlawfully.',
              'They will not misuse candidate information.',
            ]} />
            <p>DevelopmentWala.org reserves the right to remove any job posting without prior notice.</p>
          </Section>

          <Section id="conduct" title="6. User Conduct">
            <p>Users must not:</p>
            <List items={[
              'Submit false or misleading information.',
              'Copy or scrape Platform content without permission.',
              'Upload malicious software or harmful code.',
              'Attempt to gain unauthorised access to the Platform.',
              'Harass, abuse, threaten, or discriminate against other users.',
              'Post fraudulent, misleading, illegal, or deceptive job advertisements.',
              'Use automated bots to access Platform data without written permission.',
            ]} />
            <p>Violation of these rules may result in immediate suspension or permanent removal from the Platform.</p>
          </Section>

          <Section id="ip" title="7. Intellectual Property">
            <p>Unless otherwise stated, all content on DevelopmentWala.org—including text, branding, logos, graphics, website design, software, databases, and original content—is the intellectual property of DevelopmentWala.org and is protected by applicable copyright, trademark, and intellectual property laws.</p>
            <p>You may not reproduce, distribute, modify, or commercially exploit any content without prior written permission.</p>
          </Section>

          <Section id="payments" title="8. Payments and Premium Services">
            <p>Certain services may require payment, including but not limited to:</p>
            <List items={[
              'Premium job postings',
              'Recruitment services',
              'Featured listings',
              'Advertising',
              'Career services',
              'Subscription plans',
            ]} />
            <p>Applicable fees will be displayed before purchase. Unless otherwise stated, payments are non-refundable once services have commenced.</p>
          </Section>

          <Section id="third-party" title="9. Third-Party Links">
            <p>Our Platform may include links to third-party websites, employer career portals, or external resources.</p>
            <p>DevelopmentWala.org does not control or endorse these websites and accepts no responsibility for their content, privacy practices, products, or services.</p>
            <p>Users access third-party websites at their own risk.</p>
          </Section>

          <Section id="disclaimer" title="10. Disclaimer">
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 flex gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-amber-900 text-sm">DevelopmentWala.org acts solely as a technology platform connecting employers and job seekers.</p>
            </div>
            <p>We do not guarantee:</p>
            <List items={[
              'Employment or internship offers.',
              'Interviews or selection.',
              'The accuracy or completeness of every job listing.',
              'The legitimacy of every organisation using the Platform.',
              'Salary information published by employers.',
              'The availability of any advertised opportunity.',
            ]} />
            <p>Although we make reasonable efforts to review postings and maintain platform quality, users are responsible for conducting their own due diligence before applying for jobs, sharing personal information, accepting employment, making payments, or entering into agreements with employers.</p>
          </Section>

          <Section id="recruitment-disclaimer" title="11. Recruitment Disclaimer">
            <p>DevelopmentWala.org is not the employer for vacancies posted by third-party organisations unless explicitly stated.</p>
            <p>Employment contracts are entered into directly between employers and candidates.</p>
            <p>DevelopmentWala.org is not responsible for:</p>
            <List items={[
              'Recruitment decisions',
              'Interview outcomes',
              'Employment contracts',
              'Salary negotiations',
              'Workplace disputes',
              'Employer policies',
              'Termination of employment',
            ]} />
          </Section>

          <Section id="liability" title="12. Limitation of Liability">
            <p>To the fullest extent permitted by law, DevelopmentWala.org shall not be liable for any direct, indirect, incidental, consequential, special, or punitive damages arising from:</p>
            <List items={[
              'Use or inability to use the Platform',
              'Loss of employment opportunities',
              'Data loss',
              'Technical interruptions',
              'Website downtime',
              'Errors in job listings',
              'Actions of employers or job seekers',
              'Third-party services linked through the Platform',
            ]} />
            <p>Use of the Platform is entirely at your own risk.</p>
          </Section>

          <Section id="termination" title="13. Account Suspension or Termination">
            <p>We reserve the right to suspend, restrict, or permanently terminate any account that:</p>
            <List items={[
              'Violates these Terms.',
              'Engages in fraudulent activity.',
              'Misuses Platform resources.',
              'Harasses other users.',
              'Posts misleading or unlawful content.',
            ]} />
            <p>Such action may be taken without prior notice where necessary to protect users or the integrity of the Platform.</p>
          </Section>

          <Section id="indemnification" title="14. Indemnification">
            <p>You agree to indemnify and hold harmless DevelopmentWala.org, its directors, employees, affiliates, partners, and representatives from any claims, liabilities, damages, losses, or expenses arising from your use of the Platform or your breach of these Terms.</p>
          </Section>

          <Section id="changes" title="15. Changes to These Terms">
            <p>DevelopmentWala.org may revise these Terms & Conditions at any time.</p>
            <p>Updated versions will be published on this page with a revised "Last Updated" date. Continued use of the Platform constitutes acceptance of the updated Terms.</p>
          </Section>

          <Section id="law" title="16. Governing Law">
            <p>These Terms & Conditions shall be governed by and interpreted in accordance with the applicable laws of the jurisdiction in which DevelopmentWala.org operates, without prejudice to any mandatory consumer protection rights available under applicable law.</p>
          </Section>

          <Section id="contact" title="17. Contact Us">
            <p>For questions regarding these Terms & Conditions or this Disclaimer, please contact:</p>
            <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
              <p className="font-semibold text-gray-900">DevelopmentWala.org</p>
              <p className="text-sm text-gray-600 italic mb-2">Your Partner in Nonprofit Excellence</p>
              <p className="text-sm">Email: <a href="mailto:mail@developmentwala.org" className="text-blue-700 hover:underline">mail@developmentwala.org</a></p>
              <p className="text-sm">Website: <a href="https://developmentwala.org" className="text-blue-700 hover:underline">https://developmentwala.org</a></p>
            </div>
          </Section>

          <div className="border-t border-gray-200 pt-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Acknowledgement</h3>
            <p className="text-gray-700 text-[15px] leading-relaxed">
              By creating an account, posting a job, applying for an opportunity, or otherwise using DevelopmentWala.org, you acknowledge that you have read, understood, and agreed to these Terms & Conditions, the Disclaimer, and our{' '}
              <Link to="/privacy-policy" className="text-blue-700 hover:underline">Privacy Policy</Link>.
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
}
