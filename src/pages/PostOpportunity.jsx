import React, { useState } from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { Briefcase, GraduationCap, Star, BookOpen, IndianRupee, Calendar, ArrowRight } from 'lucide-react';
// Navbar/Footer provided by DashboardShell wrapper route

import SEOHead from '../components/shared/SEOHead';
import AuthGateModal from '../components/auth/AuthGateModal';
import { useAuth } from '../components/auth/AuthContext';
import { SITE_NAME } from '@/lib/brand';

const types = [
  {
    icon: Briefcase, color: 'bg-blue-50 text-blue-600 border-blue-200', btnColor: 'bg-blue-600 hover:bg-blue-700',
    label: 'Job', desc: 'Full-time, part-time, contract and volunteer positions at NGOs and social enterprises.',
    page: 'SubmitJob',
  },
  {
    icon: GraduationCap, color: 'bg-purple-50 text-purple-600 border-purple-200', btnColor: 'bg-purple-600 hover:bg-purple-700',
    label: 'Internship', desc: 'Short-term learning opportunities for students and early-career professionals.',
    page: 'SubmitInternship',
  },
  {
    icon: Star, color: 'bg-indigo-50 text-indigo-600 border-indigo-200', btnColor: 'bg-indigo-600 hover:bg-indigo-700',
    label: 'Fellowship', desc: 'Structured programmes for emerging leaders and social change practitioners.',
    page: 'SubmitFellowship',
  },
  {
    icon: BookOpen, color: 'bg-yellow-50 text-yellow-600 border-yellow-200', btnColor: 'bg-yellow-500 hover:bg-yellow-600',
    label: 'Scholarship', desc: 'Education funding opportunities for students pursuing social sector careers.',
    page: 'SubmitScholarship',
  },
  {
    icon: IndianRupee, color: 'bg-green-50 text-green-600 border-green-200', btnColor: 'bg-green-600 hover:bg-green-700',
    label: 'Grant', desc: 'Funding opportunities for NGOs, nonprofits, and social enterprises.',
    page: 'SubmitGrant',
  },
  {
    icon: Calendar, color: 'bg-pink-50 text-pink-600 border-pink-200', btnColor: 'bg-pink-600 hover:bg-pink-700',
    label: 'Event', desc: 'Conferences, webinars, workshops, and networking events for the social sector.',
    page: 'SubmitEvent',
  },
];

export default function PostOpportunity() {
  const { user, loading } = useAuth();
  const [gateDismissed, setGateDismissed] = useState(false);
  const showGate = !loading && !user && !gateDismissed;
  const next = createPageUrl('PostOpportunity');

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className={showGate ? 'overflow-hidden h-screen' : ''}>
      {showGate && (
        <AuthGateModal
          open
          onClose={() => setGateDismissed(true)}
          title="Sign in to post an opportunity"
          description="Employers and NGOs need an account to publish listings on DevelopmentWala."
          next={next}
          defaultRole="employer"
        />
      )}
      <div className={showGate ? 'pointer-events-none select-none blur-sm' : ''}>
        <SEOHead
          title={`Post an Opportunity — ${SITE_NAME}`}
          description="Post jobs, internships, fellowships, scholarships, grants or events on DevelopmentWala. Reach thousands of social sector professionals for free."
          canonical="https://developmentwala.org/post"
        />
        
        <main>
          <section className="bg-gradient-to-br from-indigo-600 to-indigo-800 py-16 px-4 text-white text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-3">Post an Opportunity</h1>
            <p className="text-indigo-100 text-lg max-w-xl mx-auto">
              Free to post. Reviewed within 24–48 hours. Choose the type of opportunity you want to share.
            </p>
          </section>

          <section className="py-14 px-4">
            <div className="max-w-5xl mx-auto">
              {user?.role === 'employer' && !user?.employer_verified && (
                <div className="mb-6 bg-amber-50 border border-amber-200 rounded-2xl p-4 text-sm text-amber-900">
                  Your employer account is pending verification. You can submit listings, but they may require admin approval before publishing.
                </div>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {types.map(({ icon: Icon, color, btnColor, label, desc, page }) => (
                  <div key={label} className={`bg-white rounded-2xl border-2 p-7 flex flex-col ${color.split(' ')[2]} hover:shadow-lg transition-shadow`}>
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-4 ${color.split(' ').slice(0, 2).join(' ')}`}>
                      <Icon className="w-7 h-7" />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">{label}</h2>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1 mb-5">{desc}</p>
                    <Link to={createPageUrl(page)} className={`flex items-center justify-center gap-2 w-full ${btnColor} text-white font-bold py-3 rounded-xl transition-colors text-sm`}>
                      Post {label} <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </div>
  );
}
