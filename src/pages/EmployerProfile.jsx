import React, { useState, useEffect } from 'react';
import { Link } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Building2, MapPin, Briefcase, Loader2 } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import OpportunityCard from '../components/opportunities/OpportunityCard';

const typeDetailMap = {
  job: 'JobDetail', internship: 'InternshipDetail', fellowship: 'FellowshipDetail',
  scholarship: 'ScholarshipDetail', grant: 'GrantDetail', event: 'EventDetail',
};

const ngoTypeLabels = {
  ngo: 'NGO', trust: 'Trust', society: 'Society', section8: 'Section 8 Company',
  social_enterprise: 'Social Enterprise', foundation: 'Foundation', un_agency: 'UN Agency',
  ingo: 'INGO', government: 'Government', other: 'Other',
};

const OPPORTUNITY_ENTITIES = [
  { type: 'job', entity: 'Job' },
  { type: 'internship', entity: 'Internship' },
  { type: 'fellowship', entity: 'Fellowship' },
  { type: 'scholarship', entity: 'Scholarship' },
  { type: 'grant', entity: 'Grant' },
  { type: 'event', entity: 'Event' },
];

function orgNameFromItem(item) {
  return (item.organization || item.funding_agency || item.organization_name || item.organizer_name || '').toLowerCase().trim();
}

function matchesOrgName(itemOrg, targetOrg) {
  if (!itemOrg || !targetOrg) return false;
  return itemOrg === targetOrg || itemOrg.includes(targetOrg) || targetOrg.includes(itemOrg);
}

export default function EmployerProfile() {
  const [org, setOrg] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeType, setActiveType] = useState('all');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orgId = params.get('id');
    const orgName = params.get('org');
    if (orgId) loadByOrgId(orgId);
    else if (orgName) loadByOrgName(orgName);
    else setLoading(false);
  }, []);

  const loadByOrgId = async (orgId) => {
    const orgs = await base44.entities.Organization.filter({ id: orgId });
    if (orgs.length > 0) {
      setOrg(orgs[0]);
      setActiveType('all');
      await loadOpportunities(orgs[0]);
    }
    setLoading(false);
  };

  const loadByOrgName = async (orgName) => {
    const orgs = await base44.entities.Organization.filter({ org_name: orgName });
    if (orgs.length > 0) {
      setOrg(orgs[0]);
      setActiveType('all');
      await loadOpportunities(orgs[0]);
    }
    setLoading(false);
  };

  const loadOpportunities = async (orgRecord) => {
    const orgName = (orgRecord.org_name || orgRecord.name || '').toLowerCase().trim();
    if (!orgName) {
      setOpportunities([]);
      return;
    }

    const relatedOrgs = await base44.entities.Organization.filter({ org_name: orgRecord.org_name });
    const emails = [...new Set(
      relatedOrgs.map((o) => o.user_email || o.email).filter(Boolean)
    )];

    const results = await Promise.all(
      OPPORTUNITY_ENTITIES.map(({ type, entity }) =>
        base44.entities[entity].filter({ status: 'published' }, '-created_date', 500)
          .then((items) => items.map((item) => ({ ...item, _type: type })))
      )
    );

    const allPosts = [];
    const seenIds = new Set();

    results.flat().forEach((item) => {
      const itemOrg = orgNameFromItem(item);
      const matchesName = matchesOrgName(itemOrg, orgName);
      const matchesEmail = emails.some(
        (email) => item.submitted_by_email === email || item.created_by === email
      );
      if (!matchesName && !matchesEmail) return;

      const key = `${item._type}-${item.id}`;
      if (seenIds.has(key)) return;
      seenIds.add(key);
      allPosts.push({
        ...item,
        opportunity_type: item._type,
        _detailParam: typeDetailMap[item._type],
      });
    });

    allPosts.sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setOpportunities(allPosts);
  };

  const types = ['all', ...new Set(opportunities.map(o => o._type))];
  const filtered = activeType === 'all' ? opportunities : opportunities.filter(o => o._type === activeType);

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!org) return (
    <div>
      <Navbar />
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Building2 className="w-12 h-12 text-gray-200 mx-auto mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Organization not found</h1>
        <p className="text-gray-500">This organization profile does not exist or has been removed.</p>
        <Link to={createPageUrl('Employers')} className="mt-5 inline-flex bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold">Browse Organizations</Link>
      </div>
      <Footer />
    </div>
  );

  return (
    <div>
      <SEOHead
        title={`${org.org_name} — DevelopmentWala.org`}
        description={`View opportunities posted by ${org.org_name} on DevelopmentWala.org.`}
      />
      <Navbar />

      <main>
        <section className="bg-white border-b border-gray-200">
          <div className="max-w-5xl mx-auto px-4 py-10">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <div className="w-20 h-20 rounded-2xl border border-gray-200 bg-gray-50 overflow-hidden flex items-center justify-center shrink-0">
                {org.logo_url ? (
                  <img src={org.logo_url} alt={org.org_name} className="w-full h-full object-contain" />
                ) : (
                  <Building2 className="w-10 h-10 text-gray-300" />
                )}
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h1 className="text-2xl font-bold text-gray-900">{org.org_name}</h1>
                  {org.ngo_type && (
                    <span className="text-xs bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full font-medium">
                      {ngoTypeLabels[org.ngo_type] || org.ngo_type}
                    </span>
                  )}
                </div>
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 mt-2">
                  {org.location && (
                    <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4" />{org.location}</span>
                  )}
                </div>
              </div>
              <div className="text-center bg-blue-50 rounded-2xl px-6 py-4 shrink-0">
                <div className="text-3xl font-bold text-blue-700">{filtered.length}</div>
                <div className="text-xs text-blue-500 font-medium mt-0.5">Opportunities</div>
              </div>
            </div>
          </div>
        </section>

        <section className="py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
              <h2 className="text-xl font-bold text-gray-900">Posted Opportunities</h2>
              <div className="flex gap-2 flex-wrap">
                {types.map(t => (
                  <button key={t} onClick={() => setActiveType(t)}
                    className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors capitalize ${
                      activeType === t ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'
                    }`}>
                    {t === 'all'
                      ? `All (${opportunities.length})`
                      : `${t}s (${opportunities.filter(o => o._type === t).length})`}
                  </button>
                ))}
              </div>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p>No published opportunities yet.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(o => (
                  <OpportunityCard key={`${o._type}-${o.id}`} opportunity={o} />
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
