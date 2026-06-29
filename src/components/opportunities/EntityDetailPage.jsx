import React, { useState, useEffect } from 'react';
import { Link, useParams, useSearchParams } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import { z } from 'zod';
import { toast } from 'sonner';
import {
  ArrowLeft, MapPin, Calendar, CalendarPlus, Building2, ExternalLink, Mail,
  Clock, Share2, CheckCircle2, Globe, DollarSign, GraduationCap,
  FileText, Video, Users, Tag, Send, X, Loader2, Link2, Linkedin, AlertCircle, Bookmark, BookmarkCheck
} from 'lucide-react';
import EmployerCard from './EmployerCard';
import OrgProfileLink from './OrgProfileLink';
import Navbar from '../layout/Navbar';
import Footer from '../layout/Footer';
import SEOHead from '../shared/SEOHead';
import ReactMarkdown from 'react-markdown';
import { base44 } from '@/api/base44Client';
import { redirectToSignIn, setLoginRoleHint } from '@/lib/auth/redirect';
import MobileHeader from '../MobileHeader';
import { Textarea } from '@/components/ui/textarea';

const applySchema = z.object({
  coverLetter: z
    .string()
    .trim()
    .min(30, 'Please write at least 30 characters about why you are a fit.')
    .max(2000, 'Cover letter must be 2000 characters or fewer.'),
  cvUrl: z
    .string()
    .trim()
    .url('Please attach a CV before submitting.')
    .max(2048, 'CV link is too long.'),
});


const locationLabels = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };

function DetailRow({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default function EntityDetailPage({
  entity, listingPage, typeLabel, opportunityType, accentColor = 'blue',
  getStructuredData, renderExtraDetails, primaryAction,
}) {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const resolvedType = opportunityType || typeLabel?.toLowerCase() || 'job';
  const [item, setItem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [user, setUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [cvChoice, setCvChoice] = useState('profile'); // 'profile' | 'new'
  const [newCvFile, setNewCvFile] = useState(null);
  const [newCvUrl, setNewCvUrl] = useState('');
  const [uploadingCv, setUploadingCv] = useState(false);
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const [shareMsg, setShareMsg] = useState('');
  const [formErrors, setFormErrors] = useState({});
  const [savedId, setSavedId] = useState(null);
  const [savingToggle, setSavingToggle] = useState(false);


  useEffect(() => {
    base44.auth.me().then(u => {
      setUser(u);
      if (u) {
        base44.entities.UserProfile.filter({ user_email: u.email }).then(profiles => {
          setUserProfile(profiles[0] || null);
        }).catch(() => {});
      }
    }).catch(() => {});
  }, []);

  useEffect(() => {
    const id = searchParams.get('id');
    const slug = routeSlug || searchParams.get('slug');
    if (slug) loadBySlug(slug);
    else if (id) loadItem(id);
    else setLoading(false);
  }, [routeSlug, searchParams]);

  const loadBySlug = async (slug) => {
    const results = await entity.filter({ slug, status: 'published' });
    if (results.length > 0) await hydrateItem(results[0]);
    else setLoading(false);
  };

  const loadItem = async (id) => {
    const results = await entity.filter({ id });
    if (results.length > 0 && results[0].status === 'published') {
      await hydrateItem(results[0]);
    } else setLoading(false);
  };

  const hydrateItem = async (it) => {
    setItem(it);
    base44.auth.me().then(u => {
      if (u) {
        base44.entities.Application.filter({ opportunity_id: it.id, applicant_email: u.email })
          .then(existing => { if (existing.length > 0) setApplied(true); })
          .catch(() => {});
        base44.entities.SavedOpportunity.filter({ user_email: u.email })
          .then(saved => {
            const match = saved.find(s => String(s.opportunity_id) === String(it.id) && (s.opportunity_type || 'job') === resolvedType);
            if (match) setSavedId(match.id);
          })
          .catch(() => {});
      }
    }).catch(() => {});
    if (it.organization_employer_id) {
      base44.entities.Organization.filter({ id: it.organization_employer_id })
        .then(orgs => { if (orgs.length > 0) setOrgData(orgs[0]); })
        .catch(() => {});
    } else if (it.submitted_by_email) {
      base44.entities.Organization.filter({ user_email: it.submitted_by_email })
        .then(orgs => { if (orgs.length > 0) setOrgData(orgs[0]); })
        .catch(() => {});
    } else {
      const name = it.organization_name || it.organizer_name || it.funding_agency || it.provider_name || it.organization;
      if (name) {
        base44.entities.Organization.filter({ org_name: name })
          .then(orgs => { if (orgs.length > 0) setOrgData(orgs[0]); })
          .catch(() => {});
      }
    }
    setLoading(false);
  };

  const handleCvUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      toast.error('CV must be 5 MB or smaller.');
      return;
    }
    const allowed = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (file.type && !allowed.includes(file.type)) {
      toast.error('Please upload a PDF or Word document.');
      return;
    }
    setUploadingCv(true);
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file });
      setNewCvUrl(file_url);
      setFormErrors((prev) => ({ ...prev, cvUrl: undefined }));
      toast.success('CV uploaded.');
    } catch (err) {
      toast.error(err?.message || 'Could not upload your CV.');
    } finally {
      setUploadingCv(false);
    }
  };

  const handleToggleSave = async () => {
    if (!user) {
      setLoginRoleHint('job_seeker');
      redirectToSignIn(typeof window !== 'undefined' ? window.location.href : '');
      return;
    }
    if (!item) return;
    setSavingToggle(true);
    try {
      if (savedId) {
        await base44.entities.SavedOpportunity.delete(savedId);
        setSavedId(null);
        toast.success('Removed from saved.');
      } else {
        const created = await base44.entities.SavedOpportunity.create({
          user_email: user.email,
          opportunity_type: resolvedType,
          opportunity_id: item.id,
        });
        setSavedId(created.id);
        toast.success('Saved to your dashboard.');
      }
    } catch (e) {
      toast.error(e?.message || 'Could not update saved opportunities.');
    } finally {
      setSavingToggle(false);
    }
  };


  const handleApply = async () => {
    if (!user) {
      setLoginRoleHint('job_seeker');
      redirectToSignIn(typeof window !== 'undefined' ? window.location.href : '');
      return;
    }

    const cvUrl = cvChoice === 'profile' ? (userProfile?.cv_url || '') : newCvUrl;
    const parsed = applySchema.safeParse({ coverLetter, cvUrl });
    if (!parsed.success) {
      const errors = {};
      for (const issue of parsed.error.issues) {
        errors[issue.path[0]] = issue.message;
      }
      setFormErrors(errors);
      toast.error('Please fix the highlighted fields.');
      return;
    }
    setFormErrors({});
    setApplying(true);
    try {
      if (cvChoice === 'new' && newCvUrl && userProfile?.id) {
        await base44.entities.UserProfile.update(userProfile.id, { cv_url: newCvUrl }).catch(() => {});
      }
      const orgName = item.organization_name || item.organizer_name || item.funding_agency || item.provider_name || '';
      await base44.entities.Application.create({
        opportunity_id: item.id,
        opportunity_title: item.title,
        opportunity_type: resolvedType,
        organization: orgName,
        applicant_email: user.email,
        applicant_name: user.full_name || '',
        cover_letter: parsed.data.coverLetter,
        cv_url: parsed.data.cvUrl,
        employer_email: item.submitted_by_email || '',
        status: 'applied',
      });
      setApplied(true);
      setShowApplyModal(false);
      setCoverLetter('');
      toast.success('Application submitted! The employer has been notified.');
    } catch (err) {
      if (err?.code === 'ALREADY_APPLIED') {
        setApplied(true);
        setShowApplyModal(false);
        toast.info('You have already applied to this opportunity.');
      } else {
        toast.error(err?.message || 'Could not submit your application. Please try again.');
      }
    } finally {
      setApplying(false);
    }
  };


  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ title: item?.title, url: window.location.href });
      } catch (e) { /* user cancelled */ }
    } else {
      handleShare();
    }
  };

  const handleLinkedinShare = () => {
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}`;
    window.open(url, '_blank', 'width=600,height=600');
  };

  const buildGoogleCalendarUrl = () => {
    if (!item?.event_date) return null;
    const fmt = (d) => {
      const pad = (n) => String(n).padStart(2, '0');
      return (
        d.getUTCFullYear().toString() +
        pad(d.getUTCMonth() + 1) +
        pad(d.getUTCDate()) + 'T' +
        pad(d.getUTCHours()) +
        pad(d.getUTCMinutes()) +
        pad(d.getUTCSeconds()) + 'Z'
      );
    };
    // Parse start: combine event_date + event_time when present.
    let start;
    if (item.event_time && /^\d{1,2}:\d{2}/.test(item.event_time)) {
      start = new Date(`${item.event_date}T${item.event_time.length === 5 ? item.event_time + ':00' : item.event_time}`);
    } else {
      start = new Date(item.event_date);
    }
    if (Number.isNaN(start.getTime())) return null;
    let end;
    if (item.event_end_date) {
      end = new Date(item.event_end_date);
      if (Number.isNaN(end.getTime())) end = new Date(start.getTime() + 60 * 60 * 1000);
    } else {
      end = new Date(start.getTime() + 60 * 60 * 1000);
    }
    const details = [
      item.description ? item.description.replace(/[#*_>`]/g, '').slice(0, 800) : '',
      '',
      `More info: ${typeof window !== 'undefined' ? window.location.href : ''}`,
    ].filter(Boolean).join('\n');
    const location = item.location_type === 'online'
      ? (item.registration_link || 'Online')
      : (item.location || item.country || '');
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: item.title || 'Event',
      dates: `${fmt(start)}/${fmt(end)}`,
      details,
      location,
    });
    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  const handleAddToGoogleCalendar = () => {
    if (!user) {
      setLoginRoleHint('job_seeker');
      redirectToSignIn(typeof window !== 'undefined' ? window.location.href : '');
      return;
    }
    const url = buildGoogleCalendarUrl();
    if (!url) {
      toast.error('Event date is missing — cannot add to calendar.');
      return;
    }
    window.open(url, '_blank', 'noopener,noreferrer');
  };


  const accentBg = { blue: 'bg-blue-600', purple: 'bg-purple-600', indigo: 'bg-indigo-600', yellow: 'bg-yellow-500', green: 'bg-green-600', pink: 'bg-pink-600' };

  if (loading) return (
    <div><Navbar /><MobileHeader title="Loading..." />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!item) return (
    <div><Navbar /><MobileHeader title="Not Found" />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Not Found</h1>
        <Link to={createPageUrl(listingPage)} className="text-blue-600 hover:underline flex items-center gap-2 justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to {typeLabel}s
        </Link>
      </div>
    </div>
  );

  const orgName = item.organization_name || item.organizer_name || item.funding_agency || item.provider_name;
  const deadline = item.application_deadline || item.registration_deadline;
  const applyUrl = item.application_link || item.registration_link;
  const applyEmail = item.application_email;
  const structuredData = getStructuredData ? getStructuredData(item) : null;

  return (
    <div>
      <SEOHead
        title={`${item.title}${orgName ? ` — ${orgName}` : ''} | DevelopmentWala.org`}
        description={item.description?.replace(/[#*_[\]]/g, '').substring(0, 160)}
        canonical={`https://developmentwala.org/${listingPage.toLowerCase()}/${item.id}`}
        structuredData={structuredData}
      />
      <Navbar />
      <MobileHeader title={item?.title} />
      <main>
        {/* Full-width header banner */}
        {item.banner_image ? (
          <div className="relative w-full bg-gray-900" style={{ aspectRatio: '16/5' }}>
            <img
              src={item.banner_image}
              alt={item.title}
              className="w-full h-full object-cover opacity-80"
              style={{ maxHeight: '420px', minHeight: '180px', objectFit: 'cover', width: '100%' }}
            />
            {/* Gradient overlay with title */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end">
              <div className="max-w-5xl mx-auto w-full px-4 pb-6">
                <div className="flex flex-wrap gap-2 mb-2">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${accentBg[accentColor] || accentBg.blue}`}>{typeLabel}</span>
                  {item.event_category && <span className="text-xs font-medium bg-white/20 text-white px-2.5 py-1 rounded-full">{item.event_category}</span>}
                  {item.featured && <span className="text-xs font-semibold bg-yellow-400/90 text-yellow-900 px-2.5 py-1 rounded-full">⭐ Featured</span>}
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-white leading-tight drop-shadow">{item.title}</h1>
                {(item.organization_name || item.organizer_name || item.funding_agency || item.provider_name) && (
                  <p className="text-white/80 mt-1 text-sm">
                    <OrgProfileLink
                      orgData={orgData}
                      orgName={item.organization_name || item.organizer_name || item.funding_agency || item.provider_name}
                      className="text-white/90 hover:text-white hover:underline font-medium"
                    />
                  </p>
                )}
              </div>
            </div>
          </div>
        ) : null}

        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200 py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to={createPageUrl('Home')} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to={createPageUrl(listingPage)} className="hover:text-blue-600">{typeLabel}s</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{item.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full text-white ${accentBg[accentColor] || accentBg.blue}`}>{typeLabel}</span>
                        {item.sector && <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{item.sector.replace(/_/g, ' ')}</span>}
                        {item.event_category && <span className="text-xs font-medium bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full">{item.event_category}</span>}
                        {item.funding_type && <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">{item.funding_type.replace(/_/g, ' ')}</span>}
                        {item.featured && <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">⭐ Featured</span>}
                      </div>
                      {/* Hide title if already shown in banner overlay */}
                      {!item.banner_image && <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{item.title}</h1>}
                      {item.banner_image && <h1 className="text-xl md:text-2xl font-bold text-gray-900 leading-tight">{item.title}</h1>}
                      {orgName && (
                        <div className="flex items-center gap-2 mt-3 text-gray-600">
                          {item.logo_url ? <img src={item.logo_url} alt={orgName} className="w-6 h-6 rounded object-contain" /> : <Building2 className="w-4 h-4" />}
                          <OrgProfileLink orgData={orgData} orgName={orgName} className="font-medium text-blue-600 hover:underline" />
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={handleToggleSave}
                        disabled={savingToggle}
                        className={`p-2.5 border rounded-xl transition-colors ${savedId ? 'border-indigo-200 bg-indigo-50 text-indigo-600 hover:bg-indigo-100' : 'border-gray-200 text-gray-500 hover:bg-gray-50'}`}
                        title={savedId ? 'Remove from saved' : 'Save for later'}
                        aria-label={savedId ? 'Remove from saved' : 'Save for later'}
                      >
                        {savedId ? <BookmarkCheck className="w-5 h-5" /> : <Bookmark className="w-5 h-5" />}
                      </button>
                      <button onClick={handleShare} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500" title="Copy link">
                        {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    {item.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{item.location}</span>}
                    {item.location_type && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" />{locationLabels[item.location_type]}</span>}
                    {item.country && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" />{item.country}</span>}
                    {item.event_date && <span className="flex items-center gap-1.5 text-pink-600 font-medium"><Calendar className="w-4 h-4" />{format(new Date(item.event_date), 'dd MMM yyyy')}{item.event_time ? ` · ${item.event_time}` : ''}</span>}
                    {deadline && <span className="flex items-center gap-1.5 text-red-500 font-medium"><Clock className="w-4 h-4" />Deadline {format(new Date(deadline), 'dd MMM yyyy')}</span>}
                  </div>
                </div>
              </div>

              <div className="bg-white border border-gray-200 rounded-2xl p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-5">Description</h2>
                <article className="prose prose-gray max-w-none prose-p:text-gray-600 prose-li:text-gray-600 prose-headings:text-gray-800">
                  <ReactMarkdown>{item.description}</ReactMarkdown>
                </article>
              </div>

              {item.eligibility && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Eligibility Criteria</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">{item.eligibility}</p>
                </div>
              )}

              {item.application_process && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> How to Apply</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.application_process}</p>
                </div>
              )}

              {item.responsibilities && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3">Responsibilities</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.responsibilities}</p>
                </div>
              )}

              {item.required_documents && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Required Documents</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{item.required_documents}</p>
                </div>
              )}

              {item.video_link && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Video className="w-5 h-5 text-blue-600" /> Video</h3>
                  <a href={item.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{item.video_link}</a>
                </div>
              )}

              {item.tags && (
                <div className="flex flex-wrap gap-2">
                  {item.tags.split(',').map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}

              {/* Share Section */}
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-5">
                <h3 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2"><Share2 className="w-4 h-4 text-gray-500" /> Share this Opportunity</h3>
                <div className="flex flex-wrap gap-2">
                  <button onClick={handleShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    {copied ? <CheckCircle2 className="w-4 h-4 text-green-600" /> : <Link2 className="w-4 h-4 text-gray-500" />}
                    {copied ? 'Copied!' : 'Copy Link'}
                  </button>
                  <button onClick={handleNativeShare}
                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors shadow-sm">
                    <Share2 className="w-4 h-4 text-gray-500" /> Share
                  </button>
                  <button onClick={handleLinkedinShare}
                    className="flex items-center gap-2 px-4 py-2 bg-[#0077B5] text-white rounded-xl text-sm font-medium hover:bg-[#006097] transition-colors shadow-sm">
                    <Linkedin className="w-4 h-4" /> Share on LinkedIn
                  </button>
                </div>
              </div>

              {/* Employer Card */}
              <EmployerCard
                orgData={orgData}
                fallbackOrgName={orgName}
                posterName={item.submitted_by_name}
                posterDesignation={item.posted_by_designation}
              />
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              <div className={`${accentBg[accentColor] || accentBg.blue} rounded-2xl p-6 text-white`}>
                <h3 className="font-bold text-lg mb-4">{primaryAction || `Apply for this ${typeLabel}`}</h3>
                <div className="space-y-2.5">
                  {applied ? (
                    <div className="flex items-center gap-2 bg-white/20 rounded-xl p-4">
                      <CheckCircle2 className="w-5 h-5 text-green-300" />
                      <span className="font-semibold text-sm">Application Submitted!</span>
                    </div>
                  ) : typeLabel !== 'Event' ? (
                    <button onClick={() => setShowApplyModal(true)}
                      className="flex items-center justify-center gap-2 w-full bg-white text-gray-800 font-bold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors">
                      <Send className="w-4 h-4" /> Apply via DevelopmentWala.org
                    </button>
                  ) : null}
                  {applyUrl && (
                    <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                      <ExternalLink className="w-4 h-4" />
                      {typeLabel === 'Event' ? 'Register Now' : 'Apply on Website'}
                    </a>
                  )}
                  {applyEmail && (
                    <a href={`mailto:${applyEmail}`}
                      className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                      <Mail className="w-4 h-4" /> Apply via Email
                    </a>
                  )}
                  {!applyUrl && !applyEmail && typeLabel === 'Event' && (
                    <p className="text-white/70 text-sm text-center">Check description for registration details.</p>
                  )}
                  {typeLabel === 'Event' && item.event_date && (
                    <button
                      onClick={handleAddToGoogleCalendar}
                      className="flex items-center justify-center gap-2 w-full bg-white text-gray-800 font-semibold px-5 py-3 rounded-xl hover:bg-gray-50 transition-colors"
                      title={user ? 'Add this event to your Google Calendar' : 'Sign in to add this event to your Google Calendar'}
                    >
                      <CalendarPlus className="w-4 h-4" />
                      {user ? 'Add to Google Calendar' : 'Sign in to add to Google Calendar'}
                    </button>
                  )}
                </div>
              </div>


              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Details</h3>
                <DetailRow icon={Building2} label="Organization" value={orgName} />
                <DetailRow icon={MapPin} label="Location" value={item.location} />
                <DetailRow icon={Globe} label="Country" value={item.country || item.eligible_countries} />
                <DetailRow icon={Clock} label="Duration" value={item.duration} />
                <DetailRow icon={DollarSign} label="Amount" value={item.grant_amount || item.scholarship_amount || item.stipend_amount} />
                <DetailRow icon={Calendar} label="Deadline" value={deadline ? format(new Date(deadline), 'dd MMM yyyy') : null} />
                <DetailRow icon={Calendar} label="Event Date" value={item.event_date ? format(new Date(item.event_date), 'dd MMM yyyy') : null} />
                <DetailRow icon={GraduationCap} label="Level of Study" value={item.level_of_study} />
                <DetailRow icon={GraduationCap} label="Field of Study" value={item.field_of_study} />
                <DetailRow icon={GraduationCap} label="Education Required" value={item.education_requirement} />
                <DetailRow icon={Users} label="Experience Required" value={item.experience_required} />
                <DetailRow icon={Users} label="Required Skills" value={item.required_skills} />
              </div>

              <Link to={createPageUrl(listingPage)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to all {typeLabel}s
              </Link>
            </aside>
          </div>
        </div>
      </main>
      <Footer />

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Apply for {item.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-5">Please sign in to apply for this opportunity.</p>
                <button onClick={() => {
                  setLoginRoleHint('job_seeker');
                  redirectToSignIn(typeof window !== 'undefined' ? window.location.href : '');
                }}

                  className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700">Sign In to Apply</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Applying as <strong>{user.email}</strong></p>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                    Cover Letter <span className="text-red-500">*</span>
                  </label>
                  <Textarea
                    value={coverLetter}
                    onChange={(e) => {
                      const next = e.target.value.slice(0, 2000);
                      setCoverLetter(next);
                      if (formErrors.coverLetter) setFormErrors((p) => ({ ...p, coverLetter: undefined }));
                    }}
                    placeholder="Briefly introduce yourself and why you're a strong fit (minimum 30 characters)..."
                    className={`min-h-[120px] rounded-xl ${formErrors.coverLetter ? 'border-red-400 focus-visible:ring-red-400' : ''}`}
                    aria-invalid={!!formErrors.coverLetter}
                    maxLength={2000}
                  />
                  <div className="flex items-center justify-between mt-1.5">
                    {formErrors.coverLetter ? (
                      <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.coverLetter}</p>
                    ) : <span />}
                    <span className={`text-xs ${coverLetter.length > 1900 ? 'text-amber-600' : 'text-gray-400'}`}>{coverLetter.length}/2000</span>
                  </div>
                </div>
                {/* CV Selection */}
                <div className="mb-5">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Resume / CV <span className="text-red-500">*</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    {userProfile?.cv_url && (
                      <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${cvChoice === 'profile' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                        <input type="radio" name="cv" value="profile" checked={cvChoice === 'profile'} onChange={() => { setCvChoice('profile'); setFormErrors((p) => ({ ...p, cvUrl: undefined })); }} className="text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-800">Use profile CV</p>
                          <a href={userProfile.cv_url} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline truncate block">View uploaded CV →</a>
                        </div>
                      </label>
                    )}
                    <label className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-colors ${cvChoice === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:bg-gray-50'}`}>
                      <input type="radio" name="cv" value="new" checked={cvChoice === 'new'} onChange={() => setCvChoice('new')} className="text-blue-600" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-800">{userProfile?.cv_url ? 'Upload a different CV' : 'Upload CV'}</p>
                        {cvChoice === 'new' && (
                          <div className="mt-2">
                            {newCvUrl ? (
                              <div className="flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                                <a href={newCvUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">CV uploaded ✓</a>
                              </div>
                            ) : (
                              <label className="cursor-pointer flex items-center gap-2 text-xs text-blue-600 hover:text-blue-700">
                                {uploadingCv ? <Loader2 className="w-4 h-4 animate-spin" /> : <FileText className="w-4 h-4" />}
                                {uploadingCv ? 'Uploading...' : 'Click to upload PDF or Word (max 5 MB)'}
                                <input type="file" accept=".pdf,.doc,.docx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document" onChange={handleCvUpload} className="hidden" disabled={uploadingCv} />
                              </label>
                            )}
                          </div>
                        )}
                      </div>
                    </label>
                    {formErrors.cvUrl && (
                      <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle className="w-3 h-3" />{formErrors.cvUrl}</p>
                    )}
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={handleApply} disabled={applying || uploadingCv}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Application</>}
                  </button>
                  <button onClick={() => setShowApplyModal(false)} disabled={applying} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 disabled:opacity-50 font-medium">Cancel</button>
                </div>
              </>
            )}

          </div>
        </div>
      )}
    </div>
  );
}