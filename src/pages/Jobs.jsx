import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useLocation, Link } from '@/lib/router-adapter';
import dwHireAd from '@/assets/dw-hire-ad.png.asset.json';

import { redirectToSignIn } from '@/lib/auth/redirect';
import { Search, X, Briefcase, SlidersHorizontal, MapPin, Building2, ChevronDown, ChevronUp } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import OpportunityCard from '../components/opportunities/OpportunityCard';
import SEOHead from '../components/shared/SEOHead';
import PullToRefresh from '../components/PullToRefresh';
import CountrySelect from '../components/forms/CountrySelect';
import { searchOpportunities } from '@/lib/supabase/extra-entities';
import { mapJob } from '@/lib/supabase/mappers';

const PAGE_SIZE = 20;

const sectorOptions = [
  { value: 'education', label: 'Education' },
  { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' },
  { value: 'human_rights', label: 'Human Rights' },
  { value: 'poverty', label: 'Poverty Alleviation' },
  { value: 'gender_equality', label: 'Gender Equality' },
  { value: 'disaster_relief', label: 'Disaster Relief' },
  { value: 'governance', label: 'Governance' },
  { value: 'livelihood', label: 'Livelihood' },
  { value: 'child_welfare', label: 'Child Welfare' },
  { value: 'water_sanitation', label: 'Water & Sanitation' },
  { value: 'other', label: 'Other' },
];

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'internship', label: 'Internship' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'consultant', label: 'Consultant' },
];

const locationTypeOptions = [
  { value: 'online', label: 'Online / Remote' },
  { value: 'offline', label: 'On-site' },
  { value: 'hybrid', label: 'Hybrid' },
];

const deadlineOptions = [
  { value: '7', label: 'Next 7 days' },
  { value: '14', label: 'Next 14 days' },
  { value: '30', label: 'Next 30 days' },
  { value: '60', label: 'Next 60 days' },
];

const MAX_SALARY = 5000000; // 50 lakh for slider (in hundreds), we'll use log scale actually just linear
const SALARY_MIN_VAL = 5000;
const SALARY_MAX_VAL = 5000000; // 50 Lakh, showing "50 Cr" label at top is misleading; let's do 50L max
const EXP_MAX = 30; // 30 = "Any"

function formatSalary(val) {
  if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
  return `₹${val}`;
}

const sliderThumbStyle = `
  appearance: none; width: 18px; height: 18px; border-radius: 50%;
  background: #fff; border: 2px solid #3b82f6; box-shadow: 0 1px 4px rgba(0,0,0,0.15); cursor: grab;
`;

// Range slider component (two thumbs)
function RangeSlider({ min, max, value, onChange, formatLabel }) {
  const pctLow = ((value[0] - min) / (max - min)) * 100;
  const pctHigh = ((value[1] - min) / (max - min)) * 100;
  return (
    <div className="px-1 pt-2 pb-1">
      <style>{`
        .range-slider::-webkit-slider-thumb { ${sliderThumbStyle} }
        .range-slider::-moz-range-thumb { ${sliderThumbStyle} }
        .range-slider { -webkit-appearance: none; appearance: none; background: transparent; }
      `}</style>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full">
          <div className="absolute h-1.5 bg-blue-500 rounded-full" style={{ left: `${pctLow}%`, right: `${100 - pctHigh}%` }} />
        </div>
        <input
          type="range" min={min} max={max} value={value[0]}
          onChange={e => { const v = Number(e.target.value); if (v <= value[1]) onChange([v, value[1]]); }}
          className="range-slider absolute w-full h-1.5"
          style={{ zIndex: value[0] > max - (max - min) * 0.1 ? 5 : 3 }}
        />
        <input
          type="range" min={min} max={max} value={value[1]}
          onChange={e => { const v = Number(e.target.value); if (v >= value[0]) onChange([value[0], v]); }}
          className="range-slider absolute w-full h-1.5"
          style={{ zIndex: 4 }}
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>{formatLabel(min)}</span>
        <span>{formatLabel(max)}+</span>
      </div>
    </div>
  );
}

function FilterSection({ label, expanded, onToggle, children }) {
  return (
    <div className="border-b border-gray-100 pb-4 mb-4">
      <button type="button" onClick={onToggle} className="flex items-center justify-between w-full text-sm font-semibold text-gray-800 mb-3">
        {label}
        {expanded ? <ChevronUp className="w-4 h-4 text-gray-400" /> : <ChevronDown className="w-4 h-4 text-gray-400" />}
      </button>
      {expanded && children}
    </div>
  );
}

function CheckboxGroup({ options, selected, onToggle }) {
  return (
    <div className="space-y-2">
      {options.map(opt => (
        <label key={opt.value} className="flex items-center gap-2 cursor-pointer group">
          <input
            type="checkbox"
            checked={selected.includes(opt.value)}
            onChange={() => onToggle(opt.value)}
            className="w-4 h-4 accent-blue-600 rounded"
          />
          <span className={`text-sm ${selected.includes(opt.value) ? 'text-blue-700 font-medium' : 'text-gray-600 group-hover:text-gray-900'}`}>
            {opt.label}
          </span>
        </label>
      ))}
    </div>
  );
}

function JobsSidebarFilters({
  hasFilters,
  onClear,
  organization,
  onOrganizationChange,
  locationText,
  onLocationTextChange,
  country,
  onCountryChange,
  experience,
  onExperienceChange,
  sectors,
  onSectorToggle,
  jobTypes,
  onJobTypeToggle,
  locationTypes,
  onLocationTypeToggle,
  deadlines,
  onDeadlineToggle,
  salaryActive,
  onSalaryActiveChange,
  salaryRange,
  onSalaryRangeChange,
  expandedSections,
  onToggleSection,
}) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5 overflow-y-auto max-h-[calc(100vh-5rem)]">
      <div className="flex items-center justify-between mb-5">
        <h2 className="font-bold text-gray-900 text-base">All Filters</h2>
        {hasFilters && (
          <button type="button" onClick={onClear} className="flex items-center gap-1 text-blue-600 text-xs font-semibold hover:underline">
            <X className="w-3 h-3" /> Clear All
          </button>
        )}
      </div>

      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Organization</p>
        <div className="relative">
          <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={organization}
            onChange={e => onOrganizationChange(e.target.value)}
            placeholder="e.g. UNICEF..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 bg-gray-50"
          />
        </div>
      </div>

      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Location</p>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400" />
          <input
            value={locationText}
            onChange={e => onLocationTextChange(e.target.value)}
            placeholder="City or region..."
            className="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 bg-gray-50"
          />
        </div>
      </div>

      <div className="border-b border-gray-100 pb-4 mb-4">
        <p className="text-sm font-semibold text-gray-800 mb-2">Country</p>
        <CountrySelect
          value={country}
          onChange={onCountryChange}
          placeholder="All Countries"
          className="h-10 rounded-lg border border-gray-200 bg-gray-50 text-sm"
          allowEmpty
          emptyLabel="All Countries"
        />
      </div>

      <FilterSection
        label="Experience"
        expanded={expandedSections.experience}
        onToggle={() => onToggleSection('experience')}
      >
        <AnySlider
          min={0}
          max={EXP_MAX}
          value={experience}
          onChange={onExperienceChange}
          formatLabel={(v) => `${v} Yrs`}
          anyLabel="Any"
        />
      </FilterSection>

      <FilterSection
        label="Sector"
        expanded={expandedSections.sector}
        onToggle={() => onToggleSection('sector')}
      >
        <CheckboxGroup options={sectorOptions} selected={sectors} onToggle={onSectorToggle} />
      </FilterSection>

      <FilterSection
        label="Job Type"
        expanded={expandedSections.jobType}
        onToggle={() => onToggleSection('jobType')}
      >
        <CheckboxGroup options={jobTypeOptions} selected={jobTypes} onToggle={onJobTypeToggle} />
      </FilterSection>

      <FilterSection
        label="Work Mode"
        expanded={expandedSections.workMode}
        onToggle={() => onToggleSection('workMode')}
      >
        <CheckboxGroup options={locationTypeOptions} selected={locationTypes} onToggle={onLocationTypeToggle} />
      </FilterSection>

      <FilterSection
        label="Deadline"
        expanded={expandedSections.deadline}
        onToggle={() => onToggleSection('deadline')}
      >
        <CheckboxGroup options={deadlineOptions} selected={deadlines} onToggle={onDeadlineToggle} />
      </FilterSection>

      <FilterSection
        label="Salary Range"
        expanded={expandedSections.salary}
        onToggle={() => onToggleSection('salary')}
      >
        <div className="mb-3">
          <label className="flex items-center gap-2 cursor-pointer mb-3">
            <input
              type="checkbox"
              checked={salaryActive}
              onChange={e => onSalaryActiveChange(e.target.checked)}
              className="w-4 h-4 accent-blue-600"
            />
            <span className="text-sm text-gray-600">Filter by salary</span>
          </label>
          {salaryActive && (
            <>
              <div className="flex justify-between text-xs font-medium text-blue-700 mb-1">
                <span>{formatSalary(salaryRange[0])}</span>
                <span>{salaryRange[1] === SALARY_MAX_VAL ? '50L+' : formatSalary(salaryRange[1])}</span>
              </div>
              <RangeSlider
                min={SALARY_MIN_VAL}
                max={SALARY_MAX_VAL}
                value={salaryRange}
                onChange={onSalaryRangeChange}
                formatLabel={formatSalary}
              />
            </>
          )}
        </div>
      </FilterSection>
    </div>
  );
}

function AnySlider({ min, max, value, onChange, formatLabel, anyLabel }) {
  const pct = ((value - min) / (max - min)) * 100;
  const isAny = value === max;
  return (
    <div className="px-1 pt-8 pb-1">
      <style>{`
        .any-slider::-webkit-slider-thumb { appearance: none; width: 18px; height: 18px; border-radius: 50%; background: #111827; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: grab; }
        .any-slider::-moz-range-thumb { width: 18px; height: 18px; border-radius: 50%; background: #111827; box-shadow: 0 1px 4px rgba(0,0,0,0.2); cursor: grab; border: none; }
        .any-slider { -webkit-appearance: none; appearance: none; background: transparent; }
      `}</style>
      {/* Tooltip above thumb */}
      <div className="relative h-0 mb-4">
        <div className="absolute -translate-x-1/2 -top-7" style={{ left: `${pct}%` }}>
          <div className="bg-gray-900 text-white text-xs font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap shadow">
            {isAny ? anyLabel : formatLabel(value)}
          </div>
          <div className="w-2 h-2 bg-gray-900 rotate-45 mx-auto -mt-1" />
        </div>
      </div>
      <div className="relative h-6 flex items-center">
        <div className="absolute w-full h-1.5 bg-gray-200 rounded-full">
          <div className="absolute h-1.5 bg-blue-500 rounded-full left-0" style={{ right: `${100 - pct}%` }} />
        </div>
        <input
          type="range" min={min} max={max} value={value}
          onChange={e => onChange(Number(e.target.value))}
          className="any-slider absolute w-full h-1.5"
        />
      </div>
      <div className="flex justify-between text-xs text-gray-400 mt-1">
        <span>0 Yrs</span>
        <span>{anyLabel}</span>
      </div>
    </div>
  );
}

export default function Jobs() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sectors, setSectors] = useState([]);
  const [jobTypes, setJobTypes] = useState([]);
  const [organization, setOrganization] = useState('');
  const [locationText, setLocationText] = useState('');
  const [country, setCountry] = useState('');
  const [locationTypes, setLocationTypes] = useState([]);
  const [deadlines, setDeadlines] = useState([]);
  const [salaryRange, setSalaryRange] = useState([SALARY_MIN_VAL, SALARY_MAX_VAL]);
  const [salaryActive, setSalaryActive] = useState(false);
  const [experience, setExperience] = useState(EXP_MAX); // EXP_MAX = "Any"
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState({ sector: true, jobType: true, workMode: true, deadline: true, salary: false, experience: true });
  const [sortBy, setSortBy] = useState('newest');
  const location = useLocation();
  const [page, setPage] = useState(1);
  const [useServerSearch, setUseServerSearch] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [savedMap, setSavedMap] = useState({});

  const toggleSection = (key) => setExpandedSections(prev => ({ ...prev, [key]: !prev[key] }));

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get('q')) setSearch(params.get('q'));
    if (params.get('sector')) setSectors([params.get('sector')]);
    loadJobs();
    base44.auth.me().then(u => {
      if (!u) return;
      setCurrentUser(u);
      base44.entities.SavedOpportunity.filter({ user_email: u.email }).then(saved => {
        const map = {};
        saved.forEach(s => { if (s.opportunity_type === 'job') map[s.opportunity_id] = s.id; });
        setSavedMap(map);
      }).catch(() => {});
    }).catch(() => {});
  }, []);

  const handleToggleSave = async (item) => {
    if (!currentUser) {
      redirectToSignIn(typeof window !== 'undefined' ? window.location.href : '/jobs');
      return;
    }
    try {
      if (savedMap[item.id]) {
        await base44.entities.SavedOpportunity.delete(savedMap[item.id]);
        setSavedMap(prev => { const m = { ...prev }; delete m[item.id]; return m; });
      } else {
        const created = await base44.entities.SavedOpportunity.create({
          user_email: currentUser.email,
          opportunity_type: 'job',
          opportunity_id: item.id,
        });
        setSavedMap(prev => ({ ...prev, [item.id]: created.id }));
      }
    } catch (e) {
      console.error('toggle save failed', e);
    }
  };


  const loadJobs = async () => {
    const params = new URLSearchParams(location.search);
    const q = params.get('q') || search;
    const sector = params.get('sector') || (sectors[0] || null);
    try {
      const serverRows = await searchOpportunities('job', {
        query: q || null,
        location: locationText || null,
        sector: sector || null,
        experienceMin: experience < EXP_MAX ? experience : null,
        sort: sortBy,
        limit: 500,
        offset: 0,
      });
      if (Array.isArray(serverRows) && serverRows.length > 0) {
        setJobs(serverRows.map((r) => mapJob(r)));
        setUseServerSearch(true);
        setLoading(false);
        return;
      }
    } catch {
      /* fall back to client filter */
    }
    const data = await base44.entities.Job.filter({ status: 'published', opportunity_type: 'job' }, '-created_date', 500);
    setJobs(data);
    setUseServerSearch(false);
    setLoading(false);
  };

  const toggleMulti = (arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter(v => v !== val) : [...arr, val]);
  };

  const filtered = jobs.filter(j => {
    const q = search.toLowerCase();
    const matchQ = !search || j.title?.toLowerCase().includes(q) || j.organization?.toLowerCase().includes(q) || j.location?.toLowerCase().includes(q) || j.description?.toLowerCase().includes(q);
    const matchS = sectors.length === 0 || sectors.includes(j.sector);
    const matchT = jobTypes.length === 0 || jobTypes.includes(j.job_type);
    const matchOrg = !organization || j.organization?.toLowerCase().includes(organization.toLowerCase());
    const matchLoc = !locationText || j.location?.toLowerCase().includes(locationText.toLowerCase());
    const matchCountry = !country || j.country?.toLowerCase().includes(country.toLowerCase());
    const matchLocType = locationTypes.length === 0 || locationTypes.includes(j.location_type);
    const matchDeadline = deadlines.length === 0 || deadlines.some(d => {
      if (!j.deadline) return false;
      const dl = new Date(j.deadline);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() + parseInt(d));
      return dl >= new Date() && dl <= cutoff;
    });
    const matchSalary = !salaryActive || (() => {
      if (!j.salary) return false;
      const num = parseInt(j.salary.replace(/[^0-9]/g, ''));
      return !isNaN(num) && num >= salaryRange[0] && num <= salaryRange[1];
    })();
    return matchQ && matchS && matchT && matchOrg && matchLoc && matchCountry && matchLocType && matchDeadline && matchSalary;
  }).sort((a, b) => {
    if (sortBy === 'oldest') return new Date(a.created_date) - new Date(b.created_date);
    if (sortBy === 'deadline') {
      if (!a.deadline) return 1; if (!b.deadline) return -1;
      return new Date(a.deadline) - new Date(b.deadline);
    }
    return new Date(b.created_date) - new Date(a.created_date);
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [search, sectors, jobTypes, organization, locationText, country, locationTypes, deadlines, salaryActive, experience, sortBy]);

  const clear = () => {
    setSearch(''); setSectors([]); setJobTypes([]); setOrganization('');
    setLocationText(''); setCountry(''); setLocationTypes([]); setDeadlines([]);
    setSalaryRange([SALARY_MIN_VAL, SALARY_MAX_VAL]); setSalaryActive(false);
    setExperience(EXP_MAX); setSortBy('newest');
  };

  const hasFilters = search || sectors.length || jobTypes.length || organization || locationText || country || locationTypes.length || deadlines.length || salaryActive || experience < EXP_MAX;
  const activeFilterCount = [
    ...sectors, ...jobTypes, ...locationTypes, ...deadlines,
    organization, locationText, country,
    salaryActive ? 'salary' : '',
    experience < EXP_MAX ? 'exp' : '',
  ].filter(Boolean).length;

  return (
    <div>
      <SEOHead
        title="Browse NGO Jobs in India — DevelopmentWala.org"
        description="Browse hundreds of NGO and social sector job listings across India. Filter by sector, job type, and location. Find your next meaningful career today."
        canonical="https://developmentwala.org/jobs"
      />
      <Navbar />

      <PullToRefresh onRefresh={loadJobs}>
      <main className="bg-gray-50 min-h-screen">
        {/* Search bar */}
        <section className="bg-white border-b border-gray-200 py-5 px-4">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by title, organization, or location..."
                className="w-full pl-11 pr-4 py-3 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 placeholder:text-gray-400 outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 text-sm"
              />
            </div>
            <button
              onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
              className="lg:hidden flex items-center gap-2 px-5 py-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-600"
            >
              <SlidersHorizontal className="w-4 h-4" />
              Filters {activeFilterCount > 0 && <span className="bg-blue-600 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">{activeFilterCount}</span>}
            </button>
          </div>
        </section>

        {/* Sidebar + results */}
        <section className="py-6 px-4">
          <div className="max-w-7xl mx-auto flex gap-6 items-start">

            {/* Sidebar — desktop sticky, mobile overlay */}
            <aside
              className={`${mobileFiltersOpen ? 'fixed inset-0 z-50 bg-black/40' : 'hidden'} lg:block lg:static lg:bg-transparent lg:z-auto`}
              onClick={(e) => { if (e.target === e.currentTarget) setMobileFiltersOpen(false); }}
            >
              <div className={`${mobileFiltersOpen ? 'absolute left-0 top-0 h-full w-72 overflow-y-auto shadow-2xl' : ''} lg:w-64 lg:sticky lg:top-4 flex-shrink-0`}>
                <JobsSidebarFilters
                  hasFilters={hasFilters}
                  onClear={clear}
                  organization={organization}
                  onOrganizationChange={setOrganization}
                  locationText={locationText}
                  onLocationTextChange={setLocationText}
                  country={country}
                  onCountryChange={setCountry}
                  experience={experience}
                  onExperienceChange={setExperience}
                  sectors={sectors}
                  onSectorToggle={(v) => toggleMulti(sectors, setSectors, v)}
                  jobTypes={jobTypes}
                  onJobTypeToggle={(v) => toggleMulti(jobTypes, setJobTypes, v)}
                  locationTypes={locationTypes}
                  onLocationTypeToggle={(v) => toggleMulti(locationTypes, setLocationTypes, v)}
                  deadlines={deadlines}
                  onDeadlineToggle={(v) => toggleMulti(deadlines, setDeadlines, v)}
                  salaryActive={salaryActive}
                  onSalaryActiveChange={setSalaryActive}
                  salaryRange={salaryRange}
                  onSalaryRangeChange={setSalaryRange}
                  expandedSections={expandedSections}
                  onToggleSection={toggleSection}
                />
              </div>
            </aside>

            {/* Results */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-4">
                <p className="text-sm text-gray-600">
                  <span className="font-bold text-gray-900">{filtered.length}</span> {filtered.length === 1 ? 'job' : 'jobs'} found
                  {hasFilters && (
                    <button onClick={clear} className="ml-3 text-blue-600 hover:underline text-xs font-medium">
                      Clear filters
                    </button>
                  )}
                </p>
                <select
                  value={sortBy}
                  onChange={e => setSortBy(e.target.value)}
                  className="text-sm border border-gray-200 rounded-lg px-3 py-1.5 bg-white text-gray-900 outline-none focus:border-blue-400"
                >
                  <option value="newest">Newest First</option>
                  <option value="oldest">Oldest First</option>
                  <option value="deadline">Deadline (Soonest)</option>
                </select>
              </div>

              {/* Active filter chips */}
              {activeFilterCount > 0 && (
                <div className="flex flex-wrap gap-2 mb-4">
                  {sectors.map(v => <span key={v} onClick={() => toggleMulti(sectors, setSectors, v)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{sectorOptions.find(o => o.value === v)?.label} <X className="w-3 h-3" /></span>)}
                  {jobTypes.map(v => <span key={v} onClick={() => toggleMulti(jobTypes, setJobTypes, v)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{jobTypeOptions.find(o => o.value === v)?.label} <X className="w-3 h-3" /></span>)}
                  {locationTypes.map(v => <span key={v} onClick={() => toggleMulti(locationTypes, setLocationTypes, v)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{locationTypeOptions.find(o => o.value === v)?.label} <X className="w-3 h-3" /></span>)}
                  {deadlines.map(v => <span key={v} onClick={() => toggleMulti(deadlines, setDeadlines, v)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{deadlineOptions.find(o => o.value === v)?.label} <X className="w-3 h-3" /></span>)}
                  {experience < EXP_MAX && <span onClick={() => setExperience(EXP_MAX)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{experience}+ Yrs exp <X className="w-3 h-3" /></span>}
                  {salaryActive && <span onClick={() => setSalaryActive(false)} className="flex items-center gap-1 bg-blue-50 text-blue-700 text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:bg-blue-100">{formatSalary(salaryRange[0])}–{formatSalary(salaryRange[1])} <X className="w-3 h-3" /></span>}
                </div>
              )}

              {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {[1, 2, 3, 4, 5, 6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
                </div>
              ) : filtered.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {paginated.map((job, idx) => (
                    <React.Fragment key={job.id}>
                      <OpportunityCard opportunity={job} isSaved={!!savedMap[job.id]} onToggleSave={() => handleToggleSave(job)} />
                      {idx === Math.min(3, paginated.length - 1) && (
                        <Link
                          to="/post-opportunity"
                          className="col-span-full block rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                          aria-label="Looking to hire development professionals? Partner with Development Wala"
                        >
                          <img
                            src={dwHireAd.url}
                            alt="Looking to hire development professionals? Partner with Development Wala and connect with talent that genuinely cares about your mission."
                            className="w-full h-auto block"
                            loading="lazy"
                          />
                        </Link>
                      )}
                    </React.Fragment>
                  ))}
                  {totalPages > 1 && (
                    <div className="flex items-center justify-center gap-3 pt-6 col-span-full">
                      <button type="button" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}
                        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40">Previous</button>
                      <span className="text-sm text-gray-500">Page {page} of {totalPages}</span>
                      <button type="button" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}
                        className="px-4 py-2 rounded-lg border text-sm disabled:opacity-40">Next</button>
                    </div>
                  )}
                </div>

              ) : (
                <div className="text-center py-20">
                  <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">No jobs found</h3>
                  <p className="text-gray-400 text-sm mb-6">Try adjusting your search or filters</p>
                  <button onClick={clear} className="text-blue-600 font-medium hover:underline text-sm">Clear all filters</button>
                </div>
              )}
            </div>
          </div>
        </section>
      </main>
      </PullToRefresh>

      <Footer />
    </div>
  );
}