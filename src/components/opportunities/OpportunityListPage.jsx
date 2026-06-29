import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { redirectToSignIn } from '@/lib/auth/redirect';
import { Search, SlidersHorizontal, X, Briefcase, ChevronDown } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import SEOHead from '../shared/SEOHead';
import OpportunityCard from './OpportunityCard';
import MobileSelect from '../ui/MobileSelect';
import { countryFilterOptions } from '../forms/formOptions';

const sectorOptions = [
  { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
  { value: 'poverty', label: 'Poverty Alleviation' }, { value: 'gender_equality', label: 'Gender Equality' },
  { value: 'disaster_relief', label: 'Disaster Relief' }, { value: 'governance', label: 'Governance' },
  { value: 'livelihood', label: 'Livelihood' }, { value: 'child_welfare', label: 'Child Welfare' },
  { value: 'water_sanitation', label: 'Water & Sanitation' }, { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
];

const locationTypeOptions = [
  { value: 'online', label: 'Online' }, { value: 'offline', label: 'In-person' }, { value: 'hybrid', label: 'Hybrid' },
];

const fundingTypeOptions = [
  { value: 'fully_funded', label: 'Fully Funded' }, { value: 'partially_funded', label: 'Partially Funded' },
  { value: 'stipend', label: 'Stipend' }, { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' },
];

const scholarshipLevelOptions = [
  { value: 'undergraduate', label: 'Undergraduate' }, { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'phd', label: 'PhD' }, { value: 'diploma', label: 'Diploma' }, { value: 'all', label: 'All Levels' },
];

const eventCategoryOptions = [
  { value: 'conference', label: 'Conference' }, { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' }, { value: 'meetup', label: 'Meetup' },
  { value: 'training', label: 'Training' }, { value: 'summit', label: 'Summit' },
];

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' }, { value: 'volunteer', label: 'Volunteer' }, { value: 'consultant', label: 'Consultant' },
];

const accentClasses = {
  blue: { bg: 'bg-blue-600', hover: 'hover:bg-blue-700' },
  purple: { bg: 'bg-purple-600', hover: 'hover:bg-purple-700' },
  indigo: { bg: 'bg-indigo-600', hover: 'hover:bg-indigo-700' },
  yellow: { bg: 'bg-yellow-500', hover: 'hover:bg-yellow-600' },
  green: { bg: 'bg-green-600', hover: 'hover:bg-green-700' },
  pink: { bg: 'bg-pink-600', hover: 'hover:bg-pink-700' },
};

const ALL_SELECT_VALUE = '__all__';
const toSelectValue = (value) => (value === '' || value == null ? ALL_SELECT_VALUE : value);
const fromSelectValue = (value) => (value === ALL_SELECT_VALUE ? '' : value);

export default function OpportunityListPage({ type, title, description, metaTitle, metaDesc, canonical, accentColor = 'blue' }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [savedMap, setSavedMap] = useState({});
  const [filters, setFilters] = useState({
    sector: '', location_type: '', funding_type: '', scholarship_level: '',
    country: '', event_category: '', job_type: '',
  });

  const accent = accentClasses[accentColor] || accentClasses.blue;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearch(params.get('q'));
    if (params.get('sector')) setFilters(f => ({ ...f, sector: params.get('sector') }));
    loadItems();
    base44.auth.me().then(u => {
      if (!u) return;
      setCurrentUser(u);
      base44.entities.SavedOpportunity.filter({ user_email: u.email }).then(saved => {
        const map = {};
        saved.forEach(s => { map[s.opportunity_id] = s.id; });
        setSavedMap(map);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const handleToggleSave = async (item) => {
    if (!currentUser) {
      redirectToSignIn(window.location.href);
      return;
    }
    const orgName = item.organization || item.funding_agency || '';
    if (savedMap[item.id]) {
      await base44.entities.SavedOpportunity.delete(savedMap[item.id]);
      setSavedMap(prev => { const m = { ...prev }; delete m[item.id]; return m; });
    } else {
      const created = await base44.entities.SavedOpportunity.create({
        user_email: currentUser.email,
        opportunity_type: type,
        opportunity_id: item.id,
      });
      setSavedMap(prev => ({ ...prev, [item.id]: created.id }));
    }
  };

  const loadItems = async () => {
    const data = await base44.entities.Job.filter({ status: 'published', opportunity_type: type }, '-created_date', 300);
    setItems(data);
    setLoading(false);
  };

  const setFilter = (key, val) => setFilters(f => ({ ...f, [key]: val }));
  const clearFilters = () => { setSearch(''); setFilters({ sector: '', location_type: '', funding_type: '', scholarship_level: '', country: '', event_category: '', job_type: '' }); };
  const hasFilters = search || Object.values(filters).some(v => v);

  const filtered = items.filter(i => {
    const q = search.toLowerCase();
    const matchQ = !search || [i.title, i.organization, i.location, i.description, i.funding_agency, i.country, i.tags]
      .filter(Boolean).some(f => f.toLowerCase().includes(q));
    const matchSector = !filters.sector || i.sector === filters.sector;
    const matchLocType = !filters.location_type || i.location_type === filters.location_type;
    const matchFunding = !filters.funding_type || i.funding_type === filters.funding_type;
    const matchLevel = !filters.scholarship_level || i.scholarship_level === filters.scholarship_level;
    const matchCountry = !filters.country || (i.country || '').toLowerCase().includes(filters.country.toLowerCase()) || (i.eligible_countries || '').toLowerCase().includes(filters.country.toLowerCase());
    const matchEvCat = !filters.event_category || i.event_category === filters.event_category;
    const matchJobType = !filters.job_type || i.job_type === filters.job_type;
    return matchQ && matchSector && matchLocType && matchFunding && matchLevel && matchCountry && matchEvCat && matchJobType;
  });

  const featured = filtered.filter(i => i.featured);
  const regular = filtered.filter(i => !i.featured);

  return (
    <div>
      <SEOHead title={metaTitle} description={metaDesc} canonical={canonical} />
      <Navbar />
      <main>
        {/* Hero */}
        <section className={`${accent.bg} py-12 px-4 text-white`}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
            <p className="text-white/80 text-sm md:text-base mb-6">{description}</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none text-sm"
                />
              </div>
              <button onClick={() => setShowFilters(!showFilters)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${showFilters ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                <SlidersHorizontal className="w-4 h-4" /> Filters
                {hasFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
              </button>
            </div>

            {/* Filters panel */}
            {showFilters && (
              <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {/* Sector — all types */}
                  <div>
                    <label className="text-white/70 text-xs font-medium mb-1 block">Sector</label>
                    <Select value={toSelectValue(filters.sector)} onValueChange={v => setFilter('sector', fromSelectValue(v))}>
                      <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                        <SelectValue placeholder="All Sectors" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={ALL_SELECT_VALUE}>All Sectors</SelectItem>
                        {sectorOptions.map(s => <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Location Type — most types */}
                  {['internship', 'fellowship', 'event', 'job'].includes(type) && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Mode</label>
                      <Select value={toSelectValue(filters.location_type)} onValueChange={v => setFilter('location_type', fromSelectValue(v))}>
                        <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                          <SelectValue placeholder="All Modes" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SELECT_VALUE}>All Modes</SelectItem>
                          {locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Funding Type — fellowship, scholarship, internship, grant */}
                  {['fellowship', 'scholarship', 'internship', 'grant'].includes(type) && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Funding</label>
                      <Select value={toSelectValue(filters.funding_type)} onValueChange={v => setFilter('funding_type', fromSelectValue(v))}>
                        <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                          <SelectValue placeholder="All Funding" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SELECT_VALUE}>All Funding</SelectItem>
                          {fundingTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Level — scholarship */}
                  {type === 'scholarship' && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Level</label>
                      <Select value={toSelectValue(filters.scholarship_level)} onValueChange={v => setFilter('scholarship_level', fromSelectValue(v))}>
                        <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SELECT_VALUE}>All Levels</SelectItem>
                          {scholarshipLevelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Event category */}
                  {type === 'event' && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Category</label>
                      <Select value={toSelectValue(filters.event_category)} onValueChange={v => setFilter('event_category', fromSelectValue(v))}>
                        <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                          <SelectValue placeholder="All Categories" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SELECT_VALUE}>All Categories</SelectItem>
                          {eventCategoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Job type */}
                  {type === 'job' && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Job Type</label>
                      <Select value={toSelectValue(filters.job_type)} onValueChange={v => setFilter('job_type', fromSelectValue(v))}>
                        <SelectTrigger className="h-9 rounded-xl bg-white text-gray-800 border-0 text-sm">
                          <SelectValue placeholder="All Types" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value={ALL_SELECT_VALUE}>All Types</SelectItem>
                          {jobTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Country — grants, scholarships, fellowships */}
                  {['grant', 'scholarship', 'fellowship'].includes(type) && (
                    <div>
                      <label className="text-white/70 text-xs font-medium mb-1 block">Country</label>
                      <MobileSelect
                        value={filters.country}
                        onValueChange={(v) => setFilter('country', v)}
                        placeholder="All Countries"
                        className="h-9 bg-white text-gray-800 border-0"
                        options={countryFilterOptions}
                      />
                    </div>
                  )}
                </div>

                {hasFilters && (
                  <button onClick={clearFilters} className="mt-3 flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        {/* Results */}
        <section className="py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <p className="text-sm text-gray-500">
                <span className="font-semibold text-gray-900">{filtered.length}</span> {title.toLowerCase()} found
                {hasFilters && <button onClick={clearFilters} className="ml-3 text-blue-600 hover:underline text-xs">Clear filters</button>}
              </p>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length > 0 ? (
              <>
                {/* Featured */}
                {featured.length > 0 && (
                  <div className="mb-8">
                    <h2 className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-4 flex items-center gap-2">
                      ⭐ Featured
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {featured.map(item => <OpportunityCard key={item.id} opportunity={item} isSaved={!!savedMap[item.id]} onToggleSave={() => handleToggleSave(item)} />)}
                    </div>
                  </div>
                )}
                {/* Regular */}
                {regular.length > 0 && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {regular.map(item => <OpportunityCard key={item.id} opportunity={item} isSaved={!!savedMap[item.id]} onToggleSave={() => handleToggleSave(item)} />)}
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-20">
                <Briefcase className="w-12 h-12 text-gray-200 mx-auto mb-4" />
                <p className="text-gray-400 text-lg font-medium">No {title.toLowerCase()} found</p>
                <p className="text-gray-300 text-sm mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Check back soon for new listings.'}</p>
                {hasFilters && <button onClick={clearFilters} className="mt-4 text-blue-600 text-sm font-medium hover:underline">Clear filters</button>}
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}