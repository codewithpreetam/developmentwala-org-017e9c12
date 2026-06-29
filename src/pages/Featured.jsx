import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@/lib/router-adapter';
import { base44 } from '@/api/base44Client';
import {
  Star, Briefcase, GraduationCap, BookOpen, IndianRupee, Calendar,
  Building2, Clock, ArrowRight, ArrowLeft,
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import { opportunityDetailUrl } from '@/utils/opportunityUrl';

const TYPE_META = {
  job:         { title: 'Jobs',         icon: Briefcase,    tint: 'bg-blue-50 text-blue-600 ring-blue-100',         badge: 'bg-blue-50 text-blue-600' },
  fellowship:  { title: 'Fellowships',  icon: Star,         tint: 'bg-indigo-50 text-indigo-600 ring-indigo-100',   badge: 'bg-indigo-50 text-indigo-600' },
  internship:  { title: 'Internships',  icon: GraduationCap, tint: 'bg-violet-50 text-violet-600 ring-violet-100',  badge: 'bg-violet-50 text-violet-600' },
  scholarship: { title: 'Scholarships', icon: BookOpen,     tint: 'bg-amber-50 text-amber-600 ring-amber-100',      badge: 'bg-amber-50 text-amber-600' },
  grant:       { title: 'Grants',       icon: IndianRupee,   tint: 'bg-emerald-50 text-emerald-600 ring-emerald-100', badge: 'bg-emerald-50 text-emerald-600' },
  event:       { title: 'Events',       icon: Calendar,     tint: 'bg-pink-50 text-pink-600 ring-pink-100',         badge: 'bg-pink-50 text-pink-600' },
};

const TYPE_ORDER = ['job', 'fellowship', 'internship', 'scholarship', 'grant', 'event'];

function orgNameFromItem(item) {
  return item.organization || item.funding_agency || item.organization_name
    || item.organizer_name || item.organizer || item.provider_name || null;
}

async function fetchAllFeatured() {
  const [jobs, internships, fellowships, scholarships, grants, events] = await Promise.all([
    base44.entities.Job.filter({ status: 'published', featured: true }, '-created_date', 500),
    base44.entities.Internship.filter({ status: 'published', featured: true }, '-created_date', 500),
    base44.entities.Fellowship.filter({ status: 'published', featured: true }, '-created_date', 500),
    base44.entities.Scholarship.filter({ status: 'published', featured: true }, '-created_date', 500),
    base44.entities.Grant.filter({ status: 'published', featured: true }, '-created_date', 500),
    base44.entities.Event.filter({ status: 'published', featured: true }, '-created_date', 500),
  ]);
  return {
    job: jobs, internship: internships, fellowship: fellowships,
    scholarship: scholarships, grant: grants, event: events,
  };
}

function FeaturedCard({ item, type }) {
  const orgName = orgNameFromItem(item);
  const deadline = item.deadline || item.application_deadline || item.registration_deadline;
  const meta = TYPE_META[type];
  return (
    <Link
      to={opportunityDetailUrl(item, type)}
      className="group relative bg-white border border-gray-100 hover:border-transparent rounded-2xl overflow-hidden hover:shadow-[0_20px_50px_-20px_rgba(0,0,0,0.18)] hover:-translate-y-1 transition-all duration-300 flex flex-col"
    >
      <div className="p-5 sm:p-6 flex-1 flex flex-col">
        <div className="flex items-center gap-2 mb-3">
          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full capitalize ${meta.badge}`}>{type}</span>
          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-amber-700 bg-amber-50 px-2 py-1 rounded-full">
            <Star className="w-3 h-3 fill-amber-500 text-amber-500" /> Featured
          </span>
        </div>
        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 mb-3">{item.title}</h3>
        <div className="mt-auto space-y-1.5 text-xs text-gray-500">
          {orgName && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span className="truncate">{orgName}</span>
            </div>
          )}
          {deadline && (
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 shrink-0 text-gray-400" />
              <span>Due {new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
          )}
        </div>
        <div className="mt-4 pt-3 border-t border-gray-50">
          <span className="text-xs font-semibold text-blue-600 inline-flex items-center gap-1 group-hover:gap-2 transition-all">
            View details <ArrowRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function Featured() {
  const { data, isLoading } = useQuery({
    queryKey: ['all-featured-opportunities'],
    queryFn: fetchAllFeatured,
    staleTime: 5 * 60_000,
  });

  const grouped = data || {};
  const totalCount = TYPE_ORDER.reduce((sum, t) => sum + (grouped[t]?.length || 0), 0);

  return (
    <div className="bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
      <SEOHead
        title="Featured Opportunities — DevelopmentWala.org"
        description="Editor-picked featured jobs, fellowships, internships, scholarships, grants and events in the social impact sector."
        canonical="https://developmentwala.org/featured"
      />
      <Navbar />
      <main>
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4f46e5 100%)' }}>
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-16 sm:py-20 text-center">
            <Link to="/" className="inline-flex items-center gap-1.5 text-white/60 hover:text-white text-xs font-medium mb-6">
              <ArrowLeft className="w-3.5 h-3.5" /> Back to home
            </Link>
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-medium px-4 py-2 rounded-full mb-6 border border-white/10">
              <Star className="w-3.5 h-3.5 fill-amber-300 text-amber-300" /> Handpicked by our editors
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-white tracking-tight mb-4">Featured Opportunities</h1>
            <p className="text-white/60 text-base md:text-lg max-w-xl mx-auto">
              {isLoading ? 'Loading…' : `${totalCount} editor-selected listings across jobs, fellowships, internships, scholarships, grants & events.`}
            </p>
          </div>
        </section>

        {isLoading ? (
          <section className="py-16 px-4 sm:px-6">
            <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[1,2,3,4,5,6,7,8].map(i => <div key={i} className="h-52 bg-gray-100 rounded-2xl animate-pulse" />)}
            </div>
          </section>
        ) : totalCount === 0 ? (
          <section className="py-24 px-4 text-center">
            <Star className="w-12 h-12 text-gray-200 mx-auto mb-4" />
            <p className="text-gray-400 text-lg font-medium">No featured opportunities yet</p>
            <p className="text-gray-300 text-sm mt-1">Check back soon for handpicked listings.</p>
          </section>
        ) : (
          TYPE_ORDER.map((type) => {
            const items = grouped[type] || [];
            if (items.length === 0) return null;
            const meta = TYPE_META[type];
            const Icon = meta.icon;
            return (
              <section key={type} className="py-14 sm:py-20 px-4 sm:px-6 bg-white border-t border-gray-100">
                <div className="max-w-6xl mx-auto">
                  <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 mb-8 sm:mb-10">
                    <div className="min-w-0">
                      <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full ring-1 ${meta.tint} mb-3`}>
                        <Icon className="w-3.5 h-3.5" />
                        <span className="text-[11px] font-bold uppercase tracking-wider">Featured</span>
                      </div>
                      <h2 className="text-3xl md:text-4xl font-bold text-gray-900 tracking-tight">{meta.title}</h2>
                      <p className="text-sm text-gray-500 mt-2">{items.length} featured listing{items.length !== 1 ? 's' : ''}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
                    {items.map(item => <FeaturedCard key={`${type}-${item.id}`} item={item} type={type} />)}
                  </div>
                </div>
              </section>
            );
          })
        )}
      </main>
      <Footer />
    </div>
  );
}
