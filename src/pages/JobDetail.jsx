import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';
import {
  ArrowLeft, MapPin, Calendar, Building2, Briefcase,
  Mail, ExternalLink, Clock, Share2, CheckCircle2, Send, X, Loader2,
  Globe, DollarSign, GraduationCap, Tag, Users, FileText, Video
} from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import SEOHead from '../components/shared/SEOHead';
import MobileHeader from '../components/MobileHeader';
import ReactMarkdown from 'react-markdown';
import { useAuth } from '../components/auth/AuthContext';
import { Textarea } from '@/components/ui/textarea';
import { typeLabels, typeColors, sectorLabels } from '../components/opportunities/OpportunityCard';
import OrgProfileLink from '../components/opportunities/OrgProfileLink';

async function loadOrgForOpportunity(record) {
  if (record.submitted_by_email) {
    const orgs = await base44.entities.Organization.filter({ user_email: record.submitted_by_email });
    if (orgs.length > 0) return orgs[0];
  }
  const name = record.organization || record.funding_agency;
  if (name) {
    const orgs = await base44.entities.Organization.filter({ org_name: name });
    if (orgs.length > 0) return orgs[0];
  }
  return null;
}

const jobTypeLabels = { full_time: 'Full Time', part_time: 'Part Time', contract: 'Contract', internship: 'Internship', volunteer: 'Volunteer', consultant: 'Consultant' };
const locationTypeLabels = { online: 'Online', offline: 'In-person', hybrid: 'Hybrid' };
const fundingTypeLabels = { fully_funded: 'Fully Funded', partially_funded: 'Partially Funded', stipend: 'Stipend', paid: 'Paid', unpaid: 'Unpaid' };
const eventCategoryLabels = { conference: 'Conference', webinar: 'Webinar', workshop: 'Workshop', meetup: 'Meetup', training: 'Training', summit: 'Summit', other: 'Other' };
const scholarshipLevelLabels = { undergraduate: 'Undergraduate', postgraduate: 'Postgraduate', phd: 'PhD', diploma: 'Diploma', certificate: 'Certificate', all: 'All Levels' };
const fellowshipCategoryLabels = { leadership: 'Leadership', research: 'Research', field: 'Field', policy: 'Policy', technology: 'Technology', other: 'Other' };

function DetailRow({ icon: Icon, label, value, valueNode }) {
  if (!value && !valueNode) return null;
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
        <Icon className="w-4 h-4 text-blue-600" />
      </div>
      <div>
        <p className="text-xs text-gray-400 font-medium">{label}</p>
        {valueNode || <p className="text-sm font-medium text-gray-800 mt-0.5">{value}</p>}
      </div>
    </div>
  );
}

export default function JobDetail() {
  const { slug: routeSlug } = useParams();
  const [searchParams] = useSearchParams();
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [showApplyModal, setShowApplyModal] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applied, setApplied] = useState(false);
  const [orgData, setOrgData] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const id = searchParams.get('id');
    const slug = routeSlug || searchParams.get('slug');
    if (slug) loadBySlug(slug);
    else if (id) loadJob(id);
    else setLoading(false);
  }, [routeSlug, searchParams]);

  useEffect(() => {
    if (user && job) checkIfApplied();
  }, [user, job]);

  const loadBySlug = async (slug) => {
    const results = await base44.entities.Job.filter({ slug, status: 'published' });
    if (results.length > 0) {
      setJob(results[0]);
      loadOrgForOpportunity(results[0]).then(setOrgData).catch(() => {});
    }
    setLoading(false);
  };

  const loadJob = async (id) => {
    const results = await base44.entities.Job.filter({ id });
    if (results.length > 0 && results[0].status === 'published') {
      setJob(results[0]);
      loadOrgForOpportunity(results[0]).then(setOrgData).catch(() => {});
    }
    setLoading(false);
  };

  const checkIfApplied = async () => {
    const existing = await base44.entities.Application.filter({ opportunity_id: job.id, applicant_email: user.email });
    if (existing.length > 0) setApplied(true);
  };

  const handleApply = async () => {
    if (!user) { base44.auth.redirectToLogin(window.location.href); return; }
    setApplying(true);
    await base44.entities.Application.create({
      opportunity_id: job.id,
      opportunity_title: job.title,
      opportunity_type: job.opportunity_type || 'job',
      organization: job.organization || job.funding_agency || '',
      applicant_email: user.email,
      applicant_name: user.full_name || '',
      cover_letter: coverLetter,
      employer_email: job.submitted_by_email || '',
      status: 'applied',
    });
    setApplied(true);
    setApplying(false);
    setShowApplyModal(false);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) return (
    <div><Navbar /><MobileHeader title="Loading..." />
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    </div>
  );

  if (!job) return (
    <div><Navbar /><MobileHeader title="Not Found" />
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-3">Opportunity Not Found</h1>
        <Link to={createPageUrl('Jobs')} className="text-blue-600 hover:underline flex items-center gap-2 justify-center">
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities
        </Link>
      </div>
    </div>
  );

  const opType = job.opportunity_type || 'job';
  const orgName = job.organization || job.funding_agency;
  const applyUrl = job.apply_url || job.event_link || job.application_link || job.registration_link;
  const deadline = job.deadline || job.application_deadline;
  const listingPage = opType === 'job' ? 'Jobs' : opType.charAt(0).toUpperCase() + opType.slice(1) + 's';

  // Build structured data for SEO / Google Jobs
  const cleanDesc = (text) => text ? text.replace(/[#*_[\]`>]/g, '').replace(/\n{3,}/g, '\n\n').trim() : '';

  const getStructuredData = () => {
    const pageUrl = `https://developmentwala.org/JobDetail?id=${job.id}`;

    if (opType === 'event') {
      return {
        '@context': 'https://schema.org',
        '@type': 'Event',
        name: job.title,
        description: cleanDesc(job.description).substring(0, 5000),
        startDate: job.event_date,
        endDate: job.event_date,
        eventStatus: 'https://schema.org/EventScheduled',
        eventAttendanceMode: job.location_type === 'online'
          ? 'https://schema.org/OnlineEventAttendanceMode'
          : job.location_type === 'hybrid'
          ? 'https://schema.org/MixedEventAttendanceMode'
          : 'https://schema.org/OfflineEventAttendanceMode',
        location: job.location_type === 'online'
          ? { '@type': 'VirtualLocation', url: applyUrl || pageUrl }
          : { '@type': 'Place', name: job.location || 'India', address: { '@type': 'PostalAddress', addressLocality: job.location, addressCountry: 'IN' } },
        organizer: { '@type': 'Organization', name: orgName || 'DevelopmentWala.org', url: 'https://developmentwala.org' },
        url: pageUrl,
        offers: applyUrl ? { '@type': 'Offer', url: applyUrl, price: '0', priceCurrency: 'INR', availability: 'https://schema.org/InStock' } : undefined,
      };
    }

    if (opType === 'scholarship' || opType === 'fellowship') {
      return {
        '@context': 'https://schema.org',
        '@type': 'EducationalOccupationalProgram',
        name: job.title,
        description: cleanDesc(job.description).substring(0, 5000),
        provider: { '@type': 'Organization', name: orgName || 'DevelopmentWala.org', url: 'https://developmentwala.org' },
        applicationDeadline: deadline,
        url: pageUrl,
        educationalProgramMode: job.location_type || 'offline',
        offers: { '@type': 'Offer', category: 'Scholarship', price: '0', priceCurrency: 'INR' },
      };
    }

    // Full Google Jobs compliant JobPosting schema
    const employmentTypeMap = {
      full_time: 'FULL_TIME', part_time: 'PART_TIME', contract: 'CONTRACTOR',
      internship: 'INTERN', volunteer: 'VOLUNTEER', consultant: 'CONTRACTOR',
    };
    const salary = job.salary || job.stipend_amount || job.grant_amount;
    const schema = {
      '@context': 'https://schema.org',
      '@type': 'JobPosting',
      title: job.title,
      description: cleanDesc(job.description).substring(0, 5000),
      datePosted: job.created_date ? new Date(job.created_date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      validThrough: deadline ? new Date(deadline).toISOString() : undefined,
      employmentType: employmentTypeMap[job.job_type] || 'FULL_TIME',
      hiringOrganization: {
        '@type': 'Organization',
        name: orgName || 'DevelopmentWala.org',
        sameAs: 'https://developmentwala.org',
        logo: job.logo_url || 'https://developmentwala.org/logo.png',
      },
      jobLocation: job.location
        ? { '@type': 'Place', address: { '@type': 'PostalAddress', streetAddress: job.location, addressLocality: job.location, addressRegion: job.country || 'India', postalCode: '', addressCountry: 'IN' } }
        : undefined,
      applicantLocationRequirements: !job.location ? { '@type': 'Country', name: job.country || 'India' } : undefined,
      jobLocationType: job.location_type === 'online' ? 'TELECOMMUTE' : undefined,
      url: pageUrl,
      identifier: { '@type': 'PropertyValue', name: orgName || 'DevelopmentWala.org', value: job.id },
      directApply: !!applyUrl,
      industry: job.sector ? job.sector.replace(/_/g, ' ') : 'Non-Profit',
      occupationalCategory: 'Social Services',
    };

    // Add salary info if available (required by Google for rich results)
    if (salary) {
      schema.baseSalary = {
        '@type': 'MonetaryAmount',
        currency: 'INR',
        value: { '@type': 'QuantitativeValue', value: salary, unitText: 'YEAR' },
      };
    }

    if (job.eligibility) schema.qualifications = job.eligibility;
    if (job.experience_required) schema.experienceRequirements = job.experience_required;
    if (job.education_requirement) schema.educationRequirements = { '@type': 'EducationalOccupationalCredential', credentialCategory: job.education_requirement };

    return schema;
  };

  return (
    <div>
      <SEOHead
        title={`${job.title}${orgName ? ` — ${orgName}` : ''} | DevelopmentWala.org`}
        description={job.description?.replace(/[#*_[\]]/g, '').substring(0, 160)}
        canonical={`https://developmentwala.org/opportunity/${job.id}`}
        structuredData={getStructuredData()}
      />
      <Navbar />
      <MobileHeader title={job.title} />

      <main>
        {/* Breadcrumb */}
        <div className="bg-gray-50 border-b border-gray-200 py-3 px-4">
          <div className="max-w-5xl mx-auto flex items-center gap-2 text-sm text-gray-500 flex-wrap">
            <Link to={createPageUrl('Home')} className="hover:text-blue-600">Home</Link>
            <span>/</span>
            <Link to={createPageUrl(listingPage)} className="hover:text-blue-600 capitalize">{typeLabels[opType]}s</Link>
            <span>/</span>
            <span className="text-gray-900 font-medium truncate max-w-xs">{job.title}</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Header card */}
              <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
                {job.banner_image && (
                  <img src={job.banner_image} alt={job.title} className="w-full h-48 object-cover" />
                )}
                <div className="p-7">
                  <div className="flex items-start justify-between gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex flex-wrap gap-2 mb-3">
                        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${typeColors[opType] || typeColors.job}`}>
                          {typeLabels[opType]}
                        </span>
                        {job.sector && (
                          <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">
                            {sectorLabels[job.sector] || job.sector}
                          </span>
                        )}
                        {job.event_category && (
                          <span className="text-xs font-medium bg-pink-50 text-pink-700 px-2.5 py-1 rounded-full">
                            {eventCategoryLabels[job.event_category]}
                          </span>
                        )}
                        {job.funding_type && (
                          <span className="text-xs font-medium bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-full">
                            {fundingTypeLabels[job.funding_type]}
                          </span>
                        )}
                        {job.featured && (
                          <span className="text-xs font-semibold bg-yellow-50 text-yellow-700 px-2.5 py-1 rounded-full">⭐ Featured</span>
                        )}
                      </div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 leading-tight">{job.title}</h1>
                      {orgName && (
                        <div className="flex items-center gap-2 mt-3 text-gray-600">
                          {job.logo_url
                            ? <img src={job.logo_url} alt={orgName} className="w-6 h-6 rounded object-contain" />
                            : <Building2 className="w-4 h-4" />}
                          <OrgProfileLink orgData={orgData} orgName={orgName} className="font-medium text-blue-600 hover:underline" />
                        </div>
                      )}
                    </div>
                    <button onClick={handleShare} className="p-2.5 border border-gray-200 rounded-xl hover:bg-gray-50 text-gray-500 shrink-0" title="Copy link">
                      {copied ? <CheckCircle2 className="w-5 h-5 text-green-600" /> : <Share2 className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* Quick meta */}
                  <div className="flex flex-wrap gap-4 text-sm text-gray-500 border-t border-gray-100 pt-4">
                    {job.location && <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4 text-gray-400" />{job.location}</span>}
                    {job.country && !job.location && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" />{job.country}</span>}
                    {job.location_type && <span className="flex items-center gap-1.5"><Globe className="w-4 h-4 text-gray-400" />{locationTypeLabels[job.location_type]}</span>}
                    {job.created_date && <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />Posted {format(new Date(job.created_date), 'dd MMM yyyy')}</span>}
                    {deadline && <span className="flex items-center gap-1.5 text-red-500 font-medium"><Calendar className="w-4 h-4" />Deadline {format(new Date(deadline), 'dd MMM yyyy')}</span>}
                    {opType === 'event' && job.event_date && <span className="flex items-center gap-1.5 text-pink-600 font-medium"><Calendar className="w-4 h-4" />Event Date {format(new Date(job.event_date), 'dd MMM yyyy')}{job.event_time ? `, ${job.event_time}` : ''}</span>}
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="bg-white border border-gray-200 rounded-2xl p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-5">
                  {opType === 'event' ? 'About This Event' : opType === 'grant' ? 'Grant Details' : 'Description'}
                </h2>
                <article className="prose prose-gray max-w-none prose-p:text-gray-600 prose-li:text-gray-600 prose-headings:text-gray-800">
                  <ReactMarkdown>{job.description}</ReactMarkdown>
                </article>
              </div>

              {/* Extra sections */}
              {job.eligibility && (
                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                  <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><CheckCircle2 className="w-5 h-5" /> Eligibility Criteria</h3>
                  <p className="text-blue-800 text-sm leading-relaxed">{job.eligibility}</p>
                </div>
              )}

              {job.application_process && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> How to Apply</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{job.application_process}</p>
                </div>
              )}

              {job.required_documents && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><FileText className="w-5 h-5 text-blue-600" /> Required Documents</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">{job.required_documents}</p>
                </div>
              )}

              {job.video_link && (
                <div className="bg-white border border-gray-200 rounded-2xl p-6">
                  <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2"><Video className="w-5 h-5 text-blue-600" /> Video</h3>
                  <a href={job.video_link} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">{job.video_link}</a>
                </div>
              )}

              {/* Tags */}
              {job.tags && (
                <div className="flex flex-wrap gap-2">
                  {job.tags.split(',').map(tag => tag.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">#{tag}</span>
                  ))}
                </div>
              )}
            </div>

            {/* Sidebar */}
            <aside className="space-y-5">
              {/* Primary CTA */}
              <div className="bg-blue-600 rounded-2xl p-6 text-white">
                <h3 className="font-bold text-lg mb-4">
                  {opType === 'event' ? 'Register for this Event' : `Apply for this ${typeLabels[opType]}`}
                </h3>
                {applied ? (
                  <div className="flex items-center gap-2 bg-white/20 rounded-xl p-4">
                    <CheckCircle2 className="w-5 h-5 text-green-300" />
                    <span className="font-semibold text-sm">Application Submitted!</span>
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    <button onClick={() => setShowApplyModal(true)}
                      className="flex items-center justify-center gap-2 w-full bg-white text-blue-700 font-bold px-5 py-3 rounded-xl hover:bg-blue-50 transition-colors">
                      <Send className="w-4 h-4" /> Apply via DevelopmentWala.org
                    </button>
                    {applyUrl && (
                      <a href={applyUrl} target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        {opType === 'event' ? 'Register on Website' : 'Apply on Website'}
                      </a>
                    )}
                    {job.apply_email && (
                      <a href={`mailto:${job.apply_email}`}
                        className="flex items-center justify-center gap-2 w-full bg-white/20 hover:bg-white/30 text-white font-semibold px-5 py-3 rounded-xl transition-colors">
                        <Mail className="w-4 h-4" /> Email Application
                      </a>
                    )}
                  </div>
                )}
              </div>

              {/* Details */}
              <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold text-gray-900">Details</h3>
                <DetailRow
                  icon={Building2}
                  label="Organization"
                  valueNode={orgName ? (
                    <OrgProfileLink
                      orgData={orgData}
                      orgName={orgName}
                      className="text-sm font-medium text-blue-600 hover:underline mt-0.5 inline-block"
                    />
                  ) : null}
                />
                <DetailRow icon={MapPin} label="Location" value={job.location || (job.location_type === 'online' ? 'Online' : null)} />
                <DetailRow icon={Globe} label="Country" value={job.country || job.eligible_countries} />
                <DetailRow icon={Briefcase} label="Job Type" value={jobTypeLabels[job.job_type]} />
                <DetailRow icon={Clock} label="Duration" value={job.duration} />
                <DetailRow icon={DollarSign} label="Salary / Stipend" value={job.salary || job.stipend_amount} />
                <DetailRow icon={DollarSign} label="Grant Amount" value={job.grant_amount} />
                <DetailRow icon={Calendar} label="Deadline" value={deadline ? format(new Date(deadline), 'dd MMM yyyy') : null} />
                <DetailRow icon={Calendar} label="Event Date" value={opType === 'event' && job.event_date ? `${format(new Date(job.event_date), 'dd MMM yyyy')}${job.event_time ? ` at ${job.event_time}` : ''}` : null} />
                <DetailRow icon={GraduationCap} label="Education Requirement" value={job.education_requirement} />
                <DetailRow icon={GraduationCap} label="Level of Study" value={scholarshipLevelLabels[job.scholarship_level]} />
                <DetailRow icon={GraduationCap} label="Field of Study" value={job.field_of_study} />
                <DetailRow icon={Users} label="Experience Required" value={job.experience_required} />
              </div>

              <Link to={createPageUrl(listingPage)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 text-sm">
                <ArrowLeft className="w-4 h-4" /> Back to all {typeLabels[opType]}s
              </Link>
            </aside>
          </div>
        </div>
      </main>

      {/* Apply Modal */}
      {showApplyModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-2xl p-7 w-full max-w-lg shadow-2xl">
            <div className="flex items-center justify-between mb-5">
              <h3 className="font-bold text-gray-900 text-lg">Apply for {job.title}</h3>
              <button onClick={() => setShowApplyModal(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            {!user ? (
              <div className="text-center py-6">
                <p className="text-gray-600 mb-5">Please sign in to apply for this opportunity.</p>
                <button onClick={() => base44.auth.redirectToLogin(window.location.href)}
                  className="bg-blue-600 text-white font-bold px-8 py-3 rounded-xl hover:bg-blue-700">Sign In to Apply</button>
              </div>
            ) : (
              <>
                <p className="text-sm text-gray-500 mb-4">Applying as <strong>{user.email}</strong></p>
                <div className="mb-4">
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cover Letter / Message (Optional)</label>
                  <Textarea value={coverLetter} onChange={(e) => setCoverLetter(e.target.value)} placeholder="Briefly introduce yourself and why you're interested..." className="min-h-[120px] rounded-xl" />
                </div>
                <div className="flex gap-3">
                  <button onClick={handleApply} disabled={applying}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2">
                    {applying ? <><Loader2 className="w-4 h-4 animate-spin" /> Submitting...</> : <><Send className="w-4 h-4" /> Submit Application</>}
                  </button>
                  <button onClick={() => setShowApplyModal(false)} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">Cancel</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}