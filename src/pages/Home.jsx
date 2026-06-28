import React, { useState, useRef, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import {
  Search, ArrowRight, Briefcase, Users, Heart,
  BookOpen, TreePine, Shield, Zap, ChevronRight, TrendingUp,
  GraduationCap, DollarSign, Calendar, Star, Building2, MapPin, Clock, ArrowUpRight
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OpportunityCard from '../components/opportunities/OpportunityCard';
import SEOHead from '../components/shared/SEOHead';
import { opportunityDetailUrl } from '@/utils/opportunityUrl';

const sectors = [
  { icon: BookOpen, label: 'Education', value: 'education' },
  { icon: Heart, label: 'Health', value: 'health' },
  { icon: TreePine, label: 'Environment', value: 'environment' },
  { icon: Shield, label: 'Human Rights', value: 'human_rights' },
  { icon: Users, label: 'Livelihood', value: 'livelihood' },
  { icon: Zap, label: 'Disaster Relief', value: 'disaster_relief' },
];

const opportunitySections = [
  { type: 'job', title: 'Latest Jobs', icon: Briefcase, page: 'Jobs', detailParam: 'JobDetail' },
  { type: 'internship', title: 'Internships', icon: GraduationCap, page: 'Internships', detailParam: 'InternshipDetail' },
  { type: 'scholarship', title: 'Scholarships', icon: GraduationCap, page: 'Scholarships', detailParam: 'ScholarshipDetail' },
  { type: 'fellowship', title: 'Fellowships', icon: Star, page: 'Fellowships', detailParam: 'FellowshipDetail' },
  { type: 'event', title: 'Events', icon: Calendar, page: 'Events', detailParam: 'EventDetail' },
  { type: 'grant', title: 'Grants', icon: DollarSign, page: 'Grants', detailParam: 'GrantDetail' },
];

const typeLinks = [
  { label: 'Jobs', page: 'Jobs', icon: Briefcase },
  { label: 'Internships', page: 'Internships', icon: GraduationCap },
  { label: 'Fellowships', page: 'Fellowships', icon: Star },
  { label: 'Scholarships', page: 'Scholarships', icon: BookOpen },
  { label: 'Grants', page: 'Grants', icon: DollarSign },
  { label: 'Events', page: 'Events', icon: Calendar },
];

function formatStatCount(n) {
  if (!n) return '0';
  return n >= 10 ? `${n}+` : String(n);
}

const HOME_SECTION_LIMIT = 6;

function mapSectionItems(items, type) {
  return items.slice(0, HOME_SECTION_LIMIT).map((item) => ({
    ...item,
    opportunity_type: type,
    _type: type,
  }));
}

function orgNameFromItem(item) {
  return item.organization || item.funding_agency || item.organization_name
    || item.organizer_name || item.organizer || item.provider_name || null;
}

async function fetchHomeData() {
  const [
    jobs, internships, fellowships, scholarships, grants, events,
    testimonials, blogPosts, orgs,
  ] = await Promise.all([
    base44.entities.Job.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Internship.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Fellowship.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Scholarship.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Grant.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Event.filter({ status: 'published' }, '-created_date', 500),
    base44.entities.Testimonial.filter({ featured: true }).catch(() => []),
    base44.entities.BlogPost.filter({ status: 'published' }, '-created_date', 3).catch(() => []),
    base44.entities.Organization.list('-created_date', 200),
  ]);

  const publishedByType = {
    job: jobs,
    internship: internships,
    fellowship: fellowships,
    scholarship: scholarships,
    grant: grants,
    event: events,
  };

  const typeCounts = {
    job: jobs.length,
    internship: internships.length,
    fellowship: fellowships.length,
    scholarship: scholarships.length,
    grant: grants.length,
    event: events.length,
  };

  const sections = {
    job: mapSectionItems(jobs, 'job'),
    internship: mapSectionItems(internships, 'internship'),
    fellowship: mapSectionItems(fellowships, 'fellowship'),
    scholarship: mapSectionItems(scholarships, 'scholarship'),
    grant: mapSectionItems(grants, 'grant'),
    event: mapSectionItems(events, 'event'),
  };

  const allForStats = [
    ...jobs.map((i) => ({ ...i, _type: 'job' })),
    ...internships.map((i) => ({ ...i, _type: 'internship' })),
    ...fellowships.map((i) => ({ ...i, _type: 'fellowship' })),
    ...scholarships.map((i) => ({ ...i, _type: 'scholarship' })),
    ...grants.map((i) => ({ ...i, _type: 'grant' })),
    ...events.map((i) => ({ ...i, _type: 'event' })),
  ];

  const sectorSet = new Set();
  allForStats.forEach((item) => {
    const sector = item.sector || item.role_category || item.field || item.tags;
    if (sector) sectorSet.add(String(sector).toLowerCase());
  });

  const stats = {
    liveOpportunities: allForStats.length,
    opportunityTypes: Object.values(publishedByType).filter((arr) => arr.length > 0).length,
    sectorsCovered: sectorSet.size,
    organizations: orgs.length,
  };

  const featuredItems = allForStats
    .filter((i) => i.featured)
    .sort((a, b) => new Date(b.created_date) - new Date(a.created_date))
    .slice(0, 8);

  const orgCount = {};
  allForStats.forEach((item) => {
    const name = orgNameFromItem(item);
    if (name) orgCount[name] = (orgCount[name] || 0) + 1;
  });
  const sortedOrgs = Object.entries(orgCount).sort((a, b) => b[1] - a[1]).slice(0, 9);
  const orgMap = {};
  orgs.forEach((o) => { if (o.org_name) orgMap[o.org_name.toLowerCase()] = o; });
  const topOrgs = sortedOrgs.map(([name, count]) => ({
    name,
    count,
    org: orgMap[name.toLowerCase()] || null,
  }));

  return {
    sections,
    typeCounts,
    publishedByType,
    featuredItems,
    topOrgs,
    testimonials: testimonials || [],
    blogPosts: blogPosts || [],
    stats,
  };
}

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [glowPos, setGlowPos] = useState({ x: 50, y: 50 });
  const heroRef = useRef(null);
  const navigate = useNavigate();

  const handleHeroMouseMove = useCallback((e) => {
    const rect = heroRef.current?.getBoundingClientRect();
    if (!rect) return;
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setGlowPos({ x, y });
  }, []);

  const { data: homeData, isLoading: loading } = useQuery({
    queryKey: ['home-opportunities'],
    queryFn: fetchHomeData,
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });

  const sections = homeData?.sections || {};
  const typeCounts = homeData?.typeCounts || {};
  const featuredItems = homeData?.featuredItems || [];
  const topOrgs = homeData?.topOrgs || [];
  const testimonials = homeData?.testimonials || [];
  const blogPosts = homeData?.blogPosts || [];
  const stats = homeData?.stats || {
    liveOpportunities: 0,
    opportunityTypes: 0,
    sectorsCovered: 0,
    organizations: 0,
  };

  const heroStats = [
    { value: formatStatCount(stats.liveOpportunities), label: 'Live Opportunities' },
    { value: String(stats.opportunityTypes || 0), label: 'Opportunity Types' },
    { value: formatStatCount(stats.sectorsCovered), label: 'Sectors Covered' },
    { value: '100%', label: 'Free to Browse' },
  ];

  const detailPageMap = {
    job: 'JobDetail', internship: 'InternshipDetail', fellowship: 'FellowshipDetail',
    scholarship: 'ScholarshipDetail', grant: 'GrantDetail', event: 'EventDetail',
  };
  const typeBadgeColor = {
    job: 'bg-blue-50 text-blue-600', internship: 'bg-violet-50 text-violet-600',
    fellowship: 'bg-indigo-50 text-indigo-600', scholarship: 'bg-amber-50 text-amber-600',
    grant: 'bg-emerald-50 text-emerald-600', event: 'bg-pink-50 text-pink-600',
  };

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(createPageUrl(`Jobs${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ''}`));
  };

  return (
    <div className="bg-white" style={{ fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif" }}>
      <SEOHead
        title="DevelopmentWala.org — NGO & Social Impact Careers in India"
        description="India's leading platform for NGO careers. Find jobs, internships, fellowships, scholarships, grants and events in the social sector."
        canonical="https://developmentwala.org"
      />
      <Navbar />

      <main>
        {/* HERO */}
        <section ref={heroRef} onMouseMove={handleHeroMouseMove} className="relative overflow-hidden cursor-default" style={{background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #4f46e5 70%, #6366f1 100%)'}}>
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] rounded-full blur-3xl" style={{background: 'rgba(255,255,255,0.04)'}} />
          </div>
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: `radial-gradient(600px circle at ${glowPos.x}% ${glowPos.y}%, rgba(255,255,255,0.14) 0%, rgba(255,255,255,0.05) 35%, transparent 70%)`,
              transition: 'background 0.1s ease',
            }}
          />
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-20 sm:py-28 md:py-36 text-center relative z-10">
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/70 text-xs font-medium px-4 py-2 rounded-full mb-8 border border-white/10">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              India's #1 Social Sector Job Platform
            </div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-[1.05] tracking-tight mb-6">
              Find your<br />
              <span className="bg-gradient-to-r from-blue-400 to-blue-300 bg-clip-text text-transparent">social impact</span><br />
              career.
            </h1>
            <p className="text-white/50 text-base md:text-xl max-w-xl mx-auto mb-8 leading-relaxed font-light">
              Jobs, internships, fellowships, scholarships, grants &amp; events — all in one place.
            </p>
            <form onSubmit={handleSearch} className="max-w-2xl mx-auto mb-8 px-1">
              <div className="flex flex-col sm:flex-row gap-2 bg-white/10 border border-white/10 rounded-2xl p-2 backdrop-blur-sm">
                <div className="flex-1 flex items-center gap-3 px-4">
                  <Search className="w-4 h-4 text-white/40 shrink-0" />
                  <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search opportunities, organizations..."
                    className="flex-1 text-white placeholder:text-white/30 bg-transparent outline-none text-sm" />
                </div>
                <button type="submit" className="bg-white text-gray-900 px-6 py-3 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors w-full sm:w-auto sm:shrink-0">
                  Search
                </button>
              </div>
            </form>
            <div className="flex flex-wrap justify-center gap-2">
              {typeLinks.map(t => (
                <Link key={t.label} to={createPageUrl(t.page)}
                  className="flex items-center gap-1.5 text-white/50 hover:text-white text-xs font-medium bg-white/5 hover:bg-white/10 border border-white/10 px-3.5 py-2 rounded-full transition-all">
                  <t.icon className="w-3.5 h-3.5" /> {t.label}
                </Link>
              ))}
            </div>
          </div>

          <div className="border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 text-center">
              {heroStats.map((s, i) => (
                <div key={i}>
                  <div className="text-2xl font-bold text-white">
                    {loading ? (
                      <span className="inline-block w-12 h-7 bg-white/10 rounded animate-pulse" />
                    ) : s.value}
                  </div>
                  <div className="text-white/40 text-xs mt-0.5">{s.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Type */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Browse by Type</h2>
              <p className="text-gray-400 text-sm mt-2">Explore every kind of social impact opportunity</p>
            </div>
            <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-6 gap-2 sm:gap-3">
              {opportunitySections.map(({ type, title, icon: Icon, page }) => (
                <Link key={type} to={createPageUrl(page)}
                  className="group flex flex-col items-center gap-3 p-5 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all bg-white cursor-pointer">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-gray-100 flex items-center justify-center transition-colors">
                    <Icon className="w-5 h-5 text-gray-700" />
                  </div>
                  <span className="text-xs font-semibold text-gray-600 group-hover:text-gray-900 text-center leading-tight">{title}</span>
                  {!loading && typeCounts[type] > 0 && (
                    <span className="text-xs text-gray-400">{typeCounts[type]} live</span>
                  )}
                  {loading && (
                    <span className="text-xs text-gray-200 w-10 h-3 bg-gray-100 rounded animate-pulse" />
                  )}
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* Browse by Sector */}
        <section className="py-10 sm:py-14 px-4 sm:px-6 bg-[#f5f5f7]">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Browse by Sector</h2>
              <p className="text-gray-400 text-sm mt-2">Find opportunities aligned with your mission</p>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {sectors.map(({ icon: Icon, label, value }) => (
                <button key={value} onClick={() => navigate(createPageUrl(`Jobs?sector=${value}`))}
                  className="group flex flex-col items-center gap-3 p-5 bg-white rounded-2xl border border-transparent hover:border-gray-200 hover:shadow-lg hover:shadow-gray-100 transition-all cursor-pointer">
                  <Icon className="w-6 h-6 text-gray-400 group-hover:text-gray-700 transition-colors" />
                  <span className="text-xs font-semibold text-gray-500 group-hover:text-gray-900 text-center transition-colors">{label}</span>
                </button>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Opportunities */}
        {!loading && featuredItems.length > 0 && (
          <section className="py-10 sm:py-16 px-4 sm:px-6 bg-white">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Handpicked</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Featured Opportunities</h2>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {featuredItems.map(item => {
                  const orgName = orgNameFromItem(item);
                  const deadline = item.deadline || item.application_deadline || item.registration_deadline;
                  const detailPage = detailPageMap[item._type] || 'JobDetail';
                  return (
                    <Link key={`${item._type}-${item.id}`} to={opportunityDetailUrl(item, item._type)}
                      className="group bg-white border border-gray-100 hover:border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:shadow-gray-100 transition-all flex flex-col">
                      {item.banner_image && (
                        <div className="h-36 overflow-hidden bg-gray-50">
                          <img src={item.banner_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                        </div>
                      )}
                      <div className="p-4 flex-1 flex flex-col">
                        <div className="flex items-center gap-1.5 mb-2">
                          <span className={`text-xs font-semibold px-2 py-0.5 rounded-full capitalize ${typeBadgeColor[item._type] || 'bg-gray-50 text-gray-600'}`}>{item._type}</span>
                        </div>
                        <h3 className="font-semibold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors line-clamp-2 flex-1">{item.title}</h3>
                        {orgName && (
                          <div className="flex items-center gap-1 mt-3 text-xs text-gray-400">
                            <Building2 className="w-3 h-3 shrink-0" />
                            <span className="truncate">{orgName}</span>
                          </div>
                        )}
                        {deadline && (
                          <div className="flex items-center gap-1 mt-1 text-xs text-gray-400">
                            <Clock className="w-3 h-3 shrink-0" />
                            <span>Due {new Date(deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                          </div>
                        )}
                        <div className="mt-3 flex items-center gap-1 text-xs font-semibold text-blue-600 group-hover:gap-2 transition-all">
                          View <ArrowRight className="w-3 h-3" />
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* Dynamic sections */}
        {opportunitySections.map(({ type, title, page, icon: Icon, detailParam }) => {
          const items = sections[type] || [];
          const total = typeCounts[type] || 0;
          if (!loading && items.length === 0) return null;
          return (
            <section key={type} className="py-10 sm:py-16 px-4 sm:px-6 border-t border-gray-100">
              <div className="max-w-5xl mx-auto">
                <div className="flex items-end justify-between mb-10">
                  <div>
                    <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Explore</p>
                    <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">{title}</h2>
                    {!loading && total > 0 && (
                      <p className="text-sm text-gray-400 mt-1">{total} live listing{total !== 1 ? 's' : ''}</p>
                    )}
                  </div>
                  <Link to={createPageUrl(page)} className="hidden md:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors">
                    View All <ArrowUpRight className="w-4 h-4" />
                  </Link>
                </div>
                {loading ? (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {[1, 2, 3].map((i) => (
                      <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {items.map((o) => (
                      <OpportunityCard
                        key={`${type}-${o.id}`}
                        opportunity={{ ...o, opportunity_type: type, _detailParam: detailParam }}
                      />
                    ))}
                  </div>
                )}
                <div className="md:hidden text-center mt-6">
                  <Link to={createPageUrl(page)} className="text-blue-600 text-sm font-medium">View all {title} →</Link>
                </div>
              </div>
            </section>
          );
        })}

        {/* Top Organisations Hiring Now */}
        {!loading && topOrgs.length > 0 && (
          <section className="py-10 sm:py-16 px-4 sm:px-6 bg-[#f5f5f7] border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Now Hiring</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">Top Organisations Hiring Now</h2>
                <p className="text-gray-400 text-sm mt-2">Leading NGOs and social impact organisations with the most open positions</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {topOrgs.map(({ name, count, org }, i) => (
                  <Link key={i} to={org?.id ? createPageUrl(`EmployerProfile?id=${org.id}`) : createPageUrl(`EmployerProfile?org=${encodeURIComponent(name)}`)}
                    className="group bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-xl hover:shadow-gray-100 transition-all p-6 flex items-center gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                      {org?.logo_url ? (
                        <img src={org.logo_url} alt={name} className="w-full h-full object-contain p-1" />
                      ) : (
                        <Building2 className="w-6 h-6 text-blue-400" />
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-blue-600 transition-colors truncate">{name}</h3>
                      {org?.sector && (
                        <p className="text-xs text-gray-400 mt-0.5 capitalize">{org.sector.replace(/_/g, ' ')}</p>
                      )}
                      <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-semibold px-2.5 py-1 rounded-full">
                        <Briefcase className="w-3 h-3" /> {count} open position{count !== 1 ? 's' : ''}
                      </div>
                    </div>
                    <ArrowUpRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors shrink-0" />
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Testimonials */}
        {!loading && testimonials.length > 0 && (
          <section className="py-10 sm:py-16 px-4 sm:px-6 bg-white border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
              <div className="text-center mb-10">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Community</p>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">What people say</h2>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {testimonials.map((t) => (
                  <div key={t.id} className="bg-[#f5f5f7] rounded-2xl p-6 border border-gray-100">
                    <div className="flex gap-1 mb-3">
                      {Array.from({ length: t.rating || 5 }).map((_, i) => (
                        <Star key={i} className="w-4 h-4 text-amber-400 fill-amber-400" />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed mb-4">&ldquo;{t.quote}&rdquo;</p>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm">{t.name}</p>
                      <p className="text-xs text-gray-400">{t.role}{t.organization ? ` · ${t.organization}` : ''}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* Blog preview */}
        {!loading && blogPosts.length > 0 && (
          <section className="py-10 sm:py-16 px-4 sm:px-6 bg-[#f5f5f7] border-t border-gray-100">
            <div className="max-w-5xl mx-auto">
              <div className="flex items-end justify-between mb-10">
                <div>
                  <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-2">Insights</p>
                  <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-tight">From the blog</h2>
                </div>
                <Link to="/blog" className="hidden md:flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700">
                  View all <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {blogPosts.map((post) => (
                  <Link key={post.id} to={`/blog/${post.slug}`}
                    className="group bg-white rounded-2xl border border-gray-100 hover:shadow-lg transition-all overflow-hidden">
                    {post.featured_image && (
                      <img src={post.featured_image} alt="" className="w-full h-36 object-cover" />
                    )}
                    <div className="p-5">
                      <h3 className="font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">{post.title}</h3>
                      {post.excerpt && <p className="text-sm text-gray-500 mt-2 line-clamp-2">{post.excerpt}</p>}
                      <p className="text-xs text-gray-400 mt-3">{post.read_time ? `${post.read_time} min read` : ''}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA */}
        <section className="py-16 sm:py-24 px-4 sm:px-6" style={{background: 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #4f46e5 70%, #6366f1 100%)'}}>
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-5xl font-bold text-white tracking-tight mb-4">
              Ready to make a difference?
            </h2>
            <p className="text-white/40 text-lg mb-12 max-w-xl mx-auto font-light">
              Join thousands of professionals building careers in India's social sector.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <a href={createPageUrl('SignUp')}
                className="group bg-white text-gray-900 font-semibold px-8 py-4 rounded-2xl text-sm hover:bg-gray-100 transition-colors flex items-center justify-center gap-2">
                <Users className="w-4 h-4" />
                Find Opportunities
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
              <a href={createPageUrl('PostOpportunity')}
                className="group bg-white/10 border border-white/10 text-white font-semibold px-8 py-4 rounded-2xl text-sm hover:bg-white/20 transition-colors flex items-center justify-center gap-2">
                <Building2 className="w-4 h-4" />
                Post an Opportunity
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </a>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}