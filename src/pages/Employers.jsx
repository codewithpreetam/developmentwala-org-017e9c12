import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Building2, MapPin, Search, Globe, Briefcase, ArrowRight, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';

const ngoTypeLabels = {
  ngo: 'NGO', trust: 'Trust', society: 'Society', section8: 'Section 8 Company',
  social_enterprise: 'Social Enterprise', foundation: 'Foundation', un_agency: 'UN Agency',
  ingo: 'INGO', government: 'Government', other: 'Other',
};

export default function Employers() {
  const [orgs, setOrgs] = useState([]);
  const [oppCounts, setOppCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    loadOrgs();
  }, []);

  const loadOrgs = async () => {
    setLoading(true);
    try {
      const allOrgs = await base44.entities.Organization.list('-created_date', 300);

      const orgMap = {};
      allOrgs.forEach(o => {
        if (!o.org_name) return;
        const key = o.org_name.toLowerCase().trim();
        if (!orgMap[key]) orgMap[key] = o;
        else if (!orgMap[key].logo_url && o.logo_url) orgMap[key] = o;
      });
      const uniqueOrgs = Object.values(orgMap);

      setOrgs(uniqueOrgs);
      setLoading(false);

      const [jobs, internships, fellowships, scholarships, grants, events] = await Promise.all([
        base44.entities.Job.filter({ status: 'published' }, '-created_date', 500),
        base44.entities.Internship.filter({ status: 'published' }, '-created_date', 500),
        base44.entities.Fellowship.filter({ status: 'published' }, '-created_date', 500),
        base44.entities.Scholarship.filter({ status: 'published' }, '-created_date', 500),
        base44.entities.Grant.filter({ status: 'published' }, '-created_date', 500),
        base44.entities.Event.filter({ status: 'published' }, '-created_date', 500),
      ]);
      const allOpps = [...jobs, ...internships, ...fellowships, ...scholarships, ...grants, ...events];

      const countMap = {};
      uniqueOrgs.forEach((o) => {
        const key = o.org_name.toLowerCase().trim();
        const seenIds = new Set();
        let total = 0;
        allOpps.forEach((item) => {
          const itemOrg = (item.organization || item.funding_agency || item.organization_name || '').toLowerCase().trim();
          if (!itemOrg) return;
          if (itemOrg === key || itemOrg.includes(key) || key.includes(itemOrg)) {
            if (!seenIds.has(item.id)) {
              seenIds.add(item.id);
              total++;
            }
          }
        });
        countMap[o.id] = total;
      });
      setOppCounts(countMap);
    } catch {
      setLoading(false);
    }
  };

  const filtered = orgs.filter(o => {
    const q = search.toLowerCase();
    return !search || o.org_name?.toLowerCase().includes(q) || o.about?.toLowerCase().includes(q) || o.location?.toLowerCase().includes(q);
  });

  return (
    <div>
      <SEOHead
        title="NGO Organizations — DevelopmentWala.org"
        description="Browse NGOs and social sector organizations that have posted opportunities on DevelopmentWala.org."
        canonical="https://developmentwala.org/employers"
      />
      <Navbar />

      <main>
        {/* Hero */}
        <section className="bg-blue-600 py-12 px-4 text-white">
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">NGO Organizations & Employers</h1>
            <p className="text-blue-100 text-sm md:text-base mb-6">Discover social sector organizations and explore all their opportunities.</p>
            <div className="relative max-w-lg">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search organizations..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none text-sm"
              />
            </div>
          </div>
        </section>

        <section className="py-10 px-4" style={{ colorScheme: 'light' }}>
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-900">{filtered.length}</span> organizations found
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-40 bg-gray-100 rounded-2xl animate-pulse" />)}
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-20">
                <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                <p className="text-gray-400">No organizations found.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(org => (
                  <Link
                    key={org.id}
                    to={createPageUrl(`EmployerProfile?id=${org.id}`)}
                    className="group bg-white rounded-2xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all p-5 flex flex-col"
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-xl border border-gray-100 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                        {org.logo_url ? (
                          <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-contain" />
                        ) : (
                          <Building2 className="w-7 h-7 text-gray-300" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-bold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                          {org.org_name}
                        </h3>
                        {org.ngo_type && (
                          <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full font-medium mt-1 inline-block">
                            {ngoTypeLabels[org.ngo_type] || org.ngo_type}
                          </span>
                        )}
                      </div>
                    </div>

                    {org.about && (
                      <p className="text-sm text-gray-500 line-clamp-2 mb-4 flex-1">{org.about}</p>
                    )}

                    <div className="flex items-center justify-between mt-auto pt-3 border-t border-gray-100">
                      <div className="flex flex-wrap gap-3 text-xs text-gray-400">
                        {org.location && (
                          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{org.location}</span>
                        )}
                        {org.website && (
                          <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{org.website.replace(/^https?:\/\//, '').split('/')[0]}</span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 bg-blue-50 text-blue-700 text-xs font-bold px-3 py-1 rounded-full">
                        <Briefcase className="w-3 h-3" />
                        {oppCounts[org.id] ?? '...'} posts
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}