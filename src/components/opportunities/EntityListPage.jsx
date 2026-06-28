import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Search, SlidersHorizontal, X, Star, MapPin, Calendar, Globe, DollarSign, Clock, Building2, ArrowRight, Bookmark, BookmarkCheck } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { redirectToSignIn } from '@/lib/auth/redirect';
import BookmarkButton from './BookmarkButton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { format, isPast, formatDistanceToNow } from 'date-fns';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import SEOHead from '../shared/SEOHead';
import { sectorOptions, locationTypeOptions } from '../forms/formOptions';
import PullToRefresh from '../PullToRefresh';
import MobileSelect from '../ui/MobileSelect';

const accentClasses = {
  blue: 'bg-blue-600', purple: 'bg-purple-600', indigo: 'bg-indigo-600',
  yellow: 'bg-yellow-500', green: 'bg-green-600', pink: 'bg-pink-600',
};

const sectorLabels = Object.fromEntries(sectorOptions.map(s => [s.value, s.label]));
const locationLabels = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

function OpCard({ item, detailPageParam, accentColor, isSaved, onToggleSave }) {
  const deadline = item.application_deadline || item.event_date || item.registration_deadline;
  const orgName = item.organization_name || item.organizer_name || item.funding_agency || item.provider_name;
  const location = item.location;
  const country = item.country || item.eligible_countries;
  const timeAgo = item.created_date ? formatDistanceToNow(new Date(item.created_date), { addSuffix: true }) : '';
  const isDeadlineSoon = deadline && !isPast(new Date(deadline)) && (new Date(deadline) - new Date()) < 7 * 24 * 60 * 60 * 1000;

  return (
    <Link to={createPageUrl(`${detailPageParam}?id=${item.id}`)}>
      <article className={`bg-white rounded-xl border hover:shadow-md transition-all duration-200 group h-full flex flex-col overflow-hidden ${item.featured ? 'border-yellow-300 shadow-sm' : 'border-gray-200 hover:border-blue-300'}`}>
        {/* Banner image (events) or placeholder */}
        {item.banner_image ? (
          <div className="w-full aspect-video overflow-hidden shrink-0">
            <img src={item.banner_image} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
          </div>
        ) : item.event_date ? (
          <div className="w-full aspect-video bg-gradient-to-br from-pink-100 to-pink-200 flex items-center justify-center shrink-0">
            <Calendar className="w-10 h-10 text-pink-400" />
          </div>
        ) : null}

        <div className="p-5 flex flex-col flex-1">
        {item.featured && (
          <div className="flex items-center gap-1 mb-2">
            <Star className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
            <span className="text-xs font-semibold text-yellow-600">Featured</span>
          </div>
        )}

        {item.logo_url && !item.banner_image && (
          <div className="w-10 h-10 rounded-lg border border-gray-100 overflow-hidden mb-3 flex items-center justify-center bg-gray-50 shrink-0">
            <img src={item.logo_url} alt={orgName} className="w-full h-full object-contain" />
          </div>
        )}

        <div className="flex items-start justify-between gap-3 mb-2 flex-1">
          <div className="min-w-0">
            <h3 className="font-semibold text-gray-900 text-base leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">{item.title}</h3>
            {orgName && (
              <div className="flex items-center gap-1.5 mt-1 text-gray-500 text-sm">
                <Building2 className="w-3.5 h-3.5 shrink-0" />
                <span className="truncate">{orgName}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            {onToggleSave && <BookmarkButton isSaved={isSaved} onToggle={onToggleSave} />}
            <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
          </div>
        </div>

        {item.description && (
          <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {item.description.replace(/[#*_[\]]/g, '').substring(0, 120)}...
          </p>
        )}

        <div className="flex flex-wrap gap-1.5 mb-3">
          {item.sector && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">{sectorLabels[item.sector] || item.sector}</span>}
          {item.location_type && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-700">{locationLabels[item.location_type]}</span>}
          {item.funding_type && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{item.funding_type.replace(/_/g, ' ')}</span>}
          {item.stipend_type && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700">{item.stipend_type === 'paid' ? 'Paid' : 'Unpaid'}</span>}
          {item.level_of_study && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-700">{item.level_of_study}</span>}
          {item.event_category && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-pink-50 text-pink-700">{item.event_category}</span>}
          {item.is_free === true && <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-green-50 text-green-700">Free</span>}
        </div>

        <div className="flex items-center justify-between text-xs text-gray-400 pt-2.5 border-t border-gray-100 mt-auto">
          <div className="flex items-center gap-3 flex-wrap">
            {location && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{location}</span>}
            {!location && country && <span className="flex items-center gap-1"><Globe className="w-3 h-3" />{country}</span>}
            {item.duration && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.duration}</span>}
            {item.grant_amount && <span className="flex items-center gap-1 text-green-600 font-medium"><DollarSign className="w-3 h-3" />{item.grant_amount}</span>}
            {item.scholarship_amount && <span className="flex items-center gap-1 text-green-600 font-medium"><DollarSign className="w-3 h-3" />{item.scholarship_amount}</span>}
            {item.event_date && <span className="flex items-center gap-1 text-pink-500 font-medium"><Calendar className="w-3 h-3" />{format(new Date(item.event_date), 'dd MMM yyyy')}</span>}
          </div>
          {deadline && !isPast(new Date(deadline)) ? (
            <span className={`flex items-center gap-1 font-medium ${isDeadlineSoon ? 'text-red-500' : 'text-gray-400'}`}>
              <Clock className="w-3 h-3" />{isDeadlineSoon ? 'Closes soon' : `Due ${format(new Date(deadline), 'dd MMM')}`}
            </span>
          ) : (
            <span>{timeAgo}</span>
          )}
        </div>
      </div>
      </article>
    </Link>
  );
}

export default function EntityListPage({
  entity, detailPageParam, type, title, description,
  metaTitle, metaDesc, canonical, accentColor = 'blue',
  extraFilters = [],
}) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({});
  const [currentUser, setCurrentUser] = useState(null);
  const [savedMap, setSavedMap] = useState({});

  const accent = accentClasses[accentColor] || accentClasses.blue;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('q')) setSearch(params.get('q'));
    loadItems().then(() => {
      // Load auth + saved only after items are fetched, to avoid rate limiting
      setTimeout(() => {
        base44.auth.me().then(u => {
          if (!u) return;
          setCurrentUser(u);
          base44.entities.SavedOpportunity.filter({ user_email: u.email }).then(saved => {
            const map = {};
            saved.forEach(s => { map[s.opportunity_id] = s.id; });
            setSavedMap(map);
          }).catch(() => {});
        }).catch(() => {});
      }, 800);
    });
  }, []);

  const handleToggleSave = async (item) => {
    if (!currentUser) {
      redirectToSignIn(window.location.href);
      return;
    }
    const orgName = item.organization_name || item.organizer_name || item.funding_agency || item.provider_name || '';
    if (savedMap[item.id]) {
      await base44.entities.SavedOpportunity.delete(savedMap[item.id]);
      setSavedMap(prev => { const m = { ...prev }; delete m[item.id]; return m; });
    } else {
      const created = await base44.entities.SavedOpportunity.create({
        user_email: currentUser.email,
        opportunity_id: item.id,
        opportunity_title: item.title,
        organization: orgName,
        deadline: item.application_deadline || item.event_date || item.registration_deadline || '',
        banner_image: item.banner_image || '',
        detail_page: detailPageParam,
      });
      setSavedMap(prev => ({ ...prev, [item.id]: created.id }));
    }
  };

  const loadItems = async () => {
    const data = await entity.filter({ status: 'published' }, '-created_date', 100);
    setItems(data);
    setLoading(false);
  };

  const setFilter = (k, v) => setFilters(f => ({ ...f, [k]: v }));
  const clearAll = () => { setSearch(''); setFilters({}); };
  const hasFilters = search || Object.values(filters).some(Boolean);

  const filtered = items.filter(item => {
    const q = search.toLowerCase();
    const matchQ = !search || [item.title, item.organization_name, item.organizer_name, item.funding_agency, item.provider_name, item.location, item.country, item.description, item.tags]
      .filter(Boolean).some(f => f.toLowerCase().includes(q));
    return matchQ && extraFilters.every(f => !filters[f.key] || (item[f.key] || '') === filters[f.key]);
  });

  return (
    <div>
      <SEOHead title={metaTitle} description={metaDesc} canonical={canonical} />
      <Navbar />
      <PullToRefresh onRefresh={loadItems}>
      <main>
        <section className={`${accent} py-12 px-4 text-white`}>
          <div className="max-w-5xl mx-auto">
            <h1 className="text-2xl md:text-3xl font-bold mb-1">{title}</h1>
            <p className="text-white/80 text-sm md:text-base mb-6">{description}</p>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input value={search} onChange={e => setSearch(e.target.value)}
                  placeholder={`Search ${title.toLowerCase()}...`}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-gray-900 placeholder:text-gray-400 outline-none text-sm" />
              </div>
              {extraFilters.length > 0 && (
                <button onClick={() => setShowFilters(!showFilters)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium flex items-center gap-2 transition-colors ${showFilters ? 'bg-white text-gray-800' : 'bg-white/20 text-white hover:bg-white/30'}`}>
                  <SlidersHorizontal className="w-4 h-4" /> Filters
                  {hasFilters && <span className="w-2 h-2 bg-yellow-400 rounded-full" />}
                </button>
              )}
            </div>

            {showFilters && extraFilters.length > 0 && (
              <div className="mt-4 bg-white/10 backdrop-blur rounded-2xl p-4">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {extraFilters.map(f => (
                    <div key={f.key}>
                      <label className="text-white/70 text-xs font-medium mb-1 block">{f.label}</label>
                      {f.type === 'text' ? (
                        <input value={filters[f.key] || ''} onChange={e => setFilter(f.key, e.target.value)}
                          placeholder={f.placeholder}
                          className="w-full h-9 px-3 rounded-xl bg-white text-gray-800 border-0 text-sm outline-none" />
                      ) : (
                        <MobileSelect
                          value={filters[f.key] || ''}
                          onValueChange={v => setFilter(f.key, v)}
                          placeholder={`All ${f.label}`}
                          className="h-9 bg-white text-gray-800 border-0"
                          options={[{ value: '', label: `All ${f.label}` }, ...f.options]}
                        />
                      )}
                    </div>
                  ))}
                </div>
                {hasFilters && (
                  <button onClick={clearAll} className="mt-3 flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
                    <X className="w-3.5 h-3.5" /> Clear all filters
                  </button>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="py-10 px-4">
          <div className="max-w-5xl mx-auto">
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-semibold text-gray-900">{filtered.length}</span> {title.toLowerCase()} found
              {hasFilters && <button onClick={clearAll} className="ml-3 text-blue-600 hover:underline text-xs">Clear filters</button>}
            </p>

            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {[1,2,3,4,5,6].map(i => <div key={i} className="h-52 bg-gray-100 rounded-xl animate-pulse" />)}
              </div>
            ) : filtered.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filtered.map(item => (
                  <OpCard
                    key={item.id}
                    item={item}
                    detailPageParam={detailPageParam}
                    accentColor={accentColor}
                    isSaved={!!savedMap[item.id]}
                    onToggleSave={() => handleToggleSave(item)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-20">
                <p className="text-gray-400 text-lg font-medium">No {title.toLowerCase()} found</p>
                <p className="text-gray-300 text-sm mt-1">{hasFilters ? 'Try adjusting your filters.' : 'Check back soon!'}</p>
                {hasFilters && <button onClick={clearAll} className="mt-4 text-blue-600 text-sm font-medium hover:underline">Clear filters</button>}
              </div>
            )}
          </div>
        </section>
      </main>
      </PullToRefresh>
      <Footer />
    </div>
  );
}