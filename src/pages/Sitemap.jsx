import React from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { Briefcase, GraduationCap, Star, BookOpen, DollarSign, Calendar, FileText, ExternalLink } from 'lucide-react';

const staticLinks = [
  { section: 'Main Pages', links: [
    { label: 'Home', to: '/' },
    { label: 'Organizations / Employers', to: '/employers' },
    { label: 'Blog', to: '/blog' },
    { label: 'Contact Us', to: '/contact' },
    { label: 'Post an Opportunity', to: '/post-opportunity' },
  ]},
  { section: 'Opportunities', links: [
    { label: 'Jobs', to: '/jobs' },
    { label: 'Internships', to: '/internships' },
    { label: 'Fellowships', to: '/fellowships' },
    { label: 'Scholarships', to: '/scholarships' },
    { label: 'Grants', to: '/grants' },
    { label: 'Events', to: '/events' },
  ]},
  { section: 'Legal', links: [
    { label: 'Privacy Policy', to: '/privacy-policy' },
    { label: 'Terms of Use', to: '/terms-of-use' },
    { label: 'Legal', to: '/legal' },
    { label: 'Sitemap', to: '/sitemap' },
  ]},
];

const typeIcon = { job: Briefcase, internship: GraduationCap, fellowship: Star, scholarship: BookOpen, grant: DollarSign, event: Calendar };
const typeLabel = { job: 'Jobs', internship: 'Internships', fellowship: 'Fellowships', scholarship: 'Scholarships', grant: 'Grants', event: 'Events' };

export default function Sitemap() {
  const { data: jobs = [] } = useQuery({ queryKey: ['sitemap-jobs'], queryFn: () => base44.entities.Job.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: internships = [] } = useQuery({ queryKey: ['sitemap-internships'], queryFn: () => base44.entities.Internship.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: fellowships = [] } = useQuery({ queryKey: ['sitemap-fellowships'], queryFn: () => base44.entities.Fellowship.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: scholarships = [] } = useQuery({ queryKey: ['sitemap-scholarships'], queryFn: () => base44.entities.Scholarship.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: grants = [] } = useQuery({ queryKey: ['sitemap-grants'], queryFn: () => base44.entities.Grant.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: events = [] } = useQuery({ queryKey: ['sitemap-events'], queryFn: () => base44.entities.Event.filter({ status: 'published' }), staleTime: 5 * 60_000 });
  const { data: posts = [] } = useQuery({ queryKey: ['sitemap-blog'], queryFn: () => base44.entities.BlogPost.filter({ status: 'published' }), staleTime: 5 * 60_000 });

  const dynamicSections = [
    { key: 'job', items: jobs, page: 'JobDetail', icon: Briefcase },
    { key: 'internship', items: internships, page: 'InternshipDetail', icon: GraduationCap },
    { key: 'fellowship', items: fellowships, page: 'FellowshipDetail', icon: Star },
    { key: 'scholarship', items: scholarships, page: 'ScholarshipDetail', icon: BookOpen },
    { key: 'grant', items: grants, page: 'GrantDetail', icon: DollarSign },
    { key: 'event', items: events, page: 'EventDetail', icon: Calendar },
  ].filter(s => s.items.length > 0);

  return (
    <div>
      <Navbar />
      <main className="max-w-5xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Site Map</h1>
        <p className="text-gray-500 text-sm mb-12">A complete index of all pages and published opportunities on DevelopmentWala.org</p>

        {/* Static sections */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-14">
          {staticLinks.map(section => (
            <div key={section.section}>
              <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">{section.section}</h2>
              <ul className="space-y-2">
                {section.links.map(l => (
                  <li key={l.to}>
                    <Link to={l.to} className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Blog posts */}
        {posts.length > 0 && (
          <section className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <FileText className="w-3.5 h-3.5" /> Blog Posts ({posts.length})
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {posts.map(p => (
                <li key={p.id}>
                  <Link to={`/blog/${p.slug || p.id}`} className="text-sm text-gray-700 hover:text-blue-600 transition-colors">
                    {p.title}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        )}

        {/* Dynamic opportunity sections */}
        {dynamicSections.map(({ key, items, page, icon: Icon }) => (
          <section key={key} className="mb-12">
            <h2 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
              <Icon className="w-3.5 h-3.5" /> {typeLabel[key]} ({items.length})
            </h2>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2">
              {items.map(item => (
                <li key={item.id}>
                  <Link
                    to={`${createPageUrl(page)}?id=${item.id}`}
                    className="text-sm text-gray-700 hover:text-blue-600 transition-colors"
                  >
                    {item.title}
                    {item.organization || item.organization_name || item.provider_name || item.funding_agency ? (
                      <span className="text-gray-400"> — {item.organization || item.organization_name || item.provider_name || item.funding_agency}</span>
                    ) : null}
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {dynamicSections.length === 0 && posts.length === 0 && (
          <p className="text-gray-400 text-sm">No published opportunities yet.</p>
        )}
      </main>
      <Footer />
    </div>
  );
}