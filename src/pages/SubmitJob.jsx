import React, { useState, useEffect } from 'react';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { useAuth } from '../components/auth/AuthContext';
import { isPlatformAdmin, opportunitySubmitStatus } from '@/lib/supabase/auth';
import { CheckCircle2, Loader2, ChevronDown, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SEOHead from '../components/shared/SEOHead';
import CountrySelect from '../components/forms/CountrySelect';
import CountryMultiSelect from '../components/forms/CountryMultiSelect';
import { DEFAULT_COUNTRY } from '../components/forms/formOptions';
import { applyEmployerContactFields, loadEmployerContactDefaults } from '@/lib/employerContact';

const sectorOptions = [
  { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
  { value: 'poverty', label: 'Poverty Alleviation' }, { value: 'gender_equality', label: 'Gender Equality' },
  { value: 'disaster_relief', label: 'Disaster Relief' }, { value: 'governance', label: 'Governance' },
  { value: 'livelihood', label: 'Livelihood' }, { value: 'child_welfare', label: 'Child Welfare' },
  { value: 'water_sanitation', label: 'Water & Sanitation' }, { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
];

const oppTypes = [
  { v: 'job', l: 'Job' }, { v: 'internship', l: 'Internship' }, { v: 'fellowship', l: 'Fellowship' },
  { v: 'scholarship', l: 'Scholarship' }, { v: 'grant', l: 'Grant' }, { v: 'event', l: 'Event' },
];

const jobTypeOptions = [
  { value: 'full_time', label: 'Full Time' }, { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' }, { value: 'volunteer', label: 'Volunteer' }, { value: 'consultant', label: 'Consultant' },
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

function FormField({ label, required, children }) {
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
    </div>
  );
}

const ENTITY_BY_TYPE = {
  job: 'Job',
  internship: 'Internship',
  fellowship: 'Fellowship',
  scholarship: 'Scholarship',
  grant: 'Grant',
  event: 'Event',
};

export default function SubmitJob() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', location: '', state: '', country: DEFAULT_COUNTRY,
    opportunity_type: 'job', job_type: '', sector: '', salary: '', deadline: '',
    location_type: '', funding_type: '', duration: '', stipend_amount: '', grant_amount: '',
    eligible_countries: '', scholarship_level: '', field_of_study: '', education_requirement: '',
    experience_required: '', application_process: '',
    event_date: '', event_time: '', event_category: '',
    organization: '',
    tags: '', submitted_by_name: '', submitted_by_email: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [showOptional, setShowOptional] = useState(true);

  // Auto-fill submitter + org from employer profile
  useEffect(() => {
    if (!user) return;
    loadEmployerContactDefaults(user).then((contact) => {
      setForm((f) => applyEmployerContactFields(f, user, contact));
    });
  }, [user?.id]);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const type = form.opportunity_type;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      const entityName = ENTITY_BY_TYPE[form.opportunity_type] || 'Job';
      const entity = api.entities[entityName];
      if (!entity?.create) throw new Error('Invalid opportunity type.');

      await entity.create({
        ...form,
        status: opportunitySubmitStatus(user),
        submitted_by_email: user?.email,
        created_by: user?.email,
      });
      setSubmitted(true);
    } catch (err) {
      setError(err.message || 'Submission failed. Please check required fields and try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div>
        <div className="max-w-xl mx-auto px-4 py-24 text-center">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-3">{adminPost ? 'Published!' : 'Submitted Successfully!'}</h1>
          <p className="text-gray-500 leading-relaxed">
            {adminPost
              ? 'Your listing is live on DevelopmentWala.org.'
              : 'Your listing has been submitted for review. Our team will publish it within 24-48 hours. Thank you!'}
          </p>
        </div>

      </div>
    );
  }

  return (
    <div>
      <SEOHead
        title="Submit an Opportunity — DevelopmentWala.org"
        description="Post jobs, internships, fellowships, scholarships, grants or events on DevelopmentWala.org. Reach thousands of social sector professionals."
        canonical="https://developmentwala.org/submit-job"
      />



      <main>
        <section className="bg-gray-50 border-b border-gray-200 py-10 px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">Post an Opportunity</h1>
            <p className="text-gray-500">Free to post. Reviewed within 24-48 hours. Reach thousands of NGO professionals.</p>
          </div>
        </section>

        <section className="py-12 px-4">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white border border-gray-200 rounded-2xl p-7 md:p-10">
              <form onSubmit={handleSubmit} className="space-y-6">

                {/* Opportunity Type */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Opportunity Type</label>
                  <div className="flex flex-wrap gap-2">
                    {oppTypes.map(t => (
                      <button key={t.v} type="button" onClick={() => update('opportunity_type', t.v)}
                        className={`px-4 py-2 rounded-xl text-sm font-semibold border transition-colors ${form.opportunity_type === t.v ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-600 border-gray-200 hover:border-blue-300'}`}>
                        {t.l}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Required Fields */}
                <div>
                  <div className="flex items-center gap-2 mb-5">
                    <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-0.5 rounded-full">Required</span>
                    <span className="text-sm text-gray-400">These fields are mandatory</span>
                  </div>
                  <div className="space-y-5">
                    <FormField label="Title" required>
                      <Input value={form.title} onChange={(e) => update('title', e.target.value)}
                        placeholder={type === 'event' ? 'e.g. Climate Justice Summit 2025' : type === 'grant' ? 'e.g. CSR Grant for Rural Education' : 'e.g. Program Manager'}
                        required className="h-11 rounded-xl border-gray-200" />
                    </FormField>

                    <FormField label="Description" required>
                      <Textarea value={form.description} onChange={(e) => update('description', e.target.value)}
                        placeholder="Full description. Markdown formatting supported (**bold**, *italic*, - bullets)"
                        required className="min-h-[180px] rounded-xl border-gray-200 leading-relaxed" />
                      <p className="text-xs text-gray-400 mt-1">Markdown supported</p>
                    </FormField>

                    <FormField label="Organization Name" required={adminPost} hint={adminPost ? 'Name of the hiring organization this opportunity is for.' : 'Auto-filled from your organization profile.'}>
                      <Input value={form.organization} onChange={(e) => update('organization', e.target.value)}
                        placeholder="e.g. Mary Foundation"
                        required={adminPost}
                        className="h-11 rounded-xl border-gray-200" />
                    </FormField>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      {type === 'job' && (
                        <FormField label="Salary / Compensation" required>
                          <Input value={form.salary} onChange={(e) => update('salary', e.target.value)}
                            placeholder="e.g. ₹5-8 LPA" required className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                      )}
                      {(type === 'fellowship' || type === 'internship') && (
                        <FormField label="Stipend Amount" required>
                          <Input value={form.stipend_amount} onChange={(e) => update('stipend_amount', e.target.value)}
                            placeholder="e.g. ₹15,000/month" required className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                      )}
                      {type === 'grant' && (
                        <FormField label="Grant Amount" required>
                          <Input value={form.grant_amount} onChange={(e) => update('grant_amount', e.target.value)}
                            placeholder="e.g. ₹50 Lakhs or ₹10,000/month" required className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                      )}
                      <FormField label={type === 'event' ? 'Registration Deadline' : 'Application Deadline'} required>
                        <Input type="date" value={form.deadline} onChange={(e) => update('deadline', e.target.value)}
                          required className="h-11 rounded-xl border-gray-200" />
                      </FormField>
                      {type === 'job' && (
                        <>
                          <FormField label="Experience Required" required>
                            <Input value={form.experience_required} onChange={(e) => update('experience_required', e.target.value)}
                              placeholder="e.g. 2+ years or Fresher" required className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                          <FormField label="State" required>
                            <Input value={form.state} onChange={(e) => update('state', e.target.value)}
                              placeholder="e.g. Maharashtra" required className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                        </>
                      )}
                    </div>
                  </div>
                </div>


                <hr className="border-gray-100" />

                {/* Optional Fields */}
                <div>
                  <button type="button" onClick={() => setShowOptional(!showOptional)}
                    className="flex items-center gap-2 mb-5 w-full">
                    <span className="bg-gray-100 text-gray-600 text-xs font-bold px-2.5 py-0.5 rounded-full">Optional</span>
                    <span className="text-sm text-gray-400">Add details to attract better applicants</span>
                    <ChevronDown className={`w-4 h-4 text-gray-400 ml-auto transition-transform ${showOptional ? 'rotate-180' : ''}`} />
                  </button>

                  {showOptional && (
                    <div className="space-y-5">
                      {/* Sector */}
                      <FormField label="Sector">
                        <Select value={form.sector} onValueChange={v => update('sector', v)}>
                          <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Select sector" /></SelectTrigger>
                          <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                        </Select>
                      </FormField>

                      {/* Location */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Location / City">
                          <Input value={form.location} onChange={(e) => update('location', e.target.value)}
                            placeholder="City, State or Remote" className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                        <FormField label="Mode">
                          <Select value={form.location_type} onValueChange={v => update('location_type', v)}>
                            <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Online / Offline" /></SelectTrigger>
                            <SelectContent>{locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                          </Select>
                        </FormField>
                      </div>

                      {/* Country */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Country">
                          <CountrySelect value={form.country} onChange={(v) => update('country', v)} className="h-11 rounded-xl border-gray-200" />
                        </FormField>

                        {/* Type-specific field */}
                        {(type === 'job') && (
                          <FormField label="Job Type">
                            <Select value={form.job_type} onValueChange={v => update('job_type', v)}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{jobTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormField>
                        )}
                        {(type === 'fellowship' || type === 'scholarship' || type === 'internship' || type === 'grant') && (
                          <FormField label="Funding Type">
                            <Select value={form.funding_type} onValueChange={v => update('funding_type', v)}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{fundingTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormField>
                        )}
                        {type === 'event' && (
                          <FormField label="Event Category">
                            <Select value={form.event_category} onValueChange={v => update('event_category', v)}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{eventCategoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormField>
                        )}
                        {type === 'scholarship' && (
                          <FormField label="Level of Study">
                            <Select value={form.scholarship_level} onValueChange={v => update('scholarship_level', v)}>
                              <SelectTrigger className="h-11 rounded-xl border-gray-200"><SelectValue placeholder="Select" /></SelectTrigger>
                              <SelectContent>{scholarshipLevelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                            </Select>
                          </FormField>
                        )}
                      </div>

                      {/* Duration (fellowship/internship only - salary/deadline are in Required section) */}
                      {(type === 'fellowship' || type === 'internship') && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Duration">
                          <Input value={form.duration} onChange={(e) => update('duration', e.target.value)}
                            placeholder="e.g. 6 months" className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                      </div>
                      )}

                      {/* Event-specific */}
                      {type === 'event' && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField label="Event Date">
                            <Input type="date" value={form.event_date} onChange={(e) => update('event_date', e.target.value)}
                              className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                          <FormField label="Event Time">
                            <Input value={form.event_time} onChange={(e) => update('event_time', e.target.value)}
                              placeholder="e.g. 10:00 AM IST" className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                        </div>
                      )}

                      {/* Scholarship / Fellowship fields */}
                      {(type === 'scholarship' || type === 'fellowship') && (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                          <FormField label="Field of Study">
                            <Input value={form.field_of_study} onChange={(e) => update('field_of_study', e.target.value)}
                              placeholder="e.g. Social Work, Public Health" className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                          <FormField label="Eligible Countries">
                            <CountryMultiSelect value={form.eligible_countries} onChange={(v) => update('eligible_countries', v)} className="h-11 rounded-xl border-gray-200" />
                          </FormField>
                        </div>
                      )}

                      {/* Tags */}
                      <FormField label="Tags (comma-separated)">
                        <Input value={form.tags} onChange={(e) => update('tags', e.target.value)}
                          placeholder="e.g. women, rural, fellowship, india" className="h-11 rounded-xl border-gray-200" />
                      </FormField>


                      <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
                        Applicants will apply directly through DevelopmentWala.org using the platform's built-in application workflow. Manage applicants from your Employer Dashboard.
                      </div>


                      <hr className="border-gray-100" />
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Contact Info</p>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <FormField label="Your Name">
                          <Input value={form.submitted_by_name} onChange={(e) => update('submitted_by_name', e.target.value)}
                            placeholder="Contact person" className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                        <FormField label="Your Email">
                          <Input type="email" value={form.submitted_by_email} onChange={(e) => update('submitted_by_email', e.target.value)}
                            placeholder="you@org.com" className="h-11 rounded-xl border-gray-200" />
                        </FormField>
                      </div>
                    </div>
                  )}
                </div>

                {!adminPost && (
                  <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                    ⏳ Your listing will be reviewed before going live. Usually within 24-48 hours.
                  </div>
                )}

                {error && (
                  <div className="flex items-start gap-2.5 bg-red-50 text-red-700 text-sm px-4 py-3 rounded-xl border border-red-100">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" /> {error}
                  </div>
                )}

                <button type="submit"
                  disabled={submitting || !form.title.trim() || !form.description.trim() || !form.deadline || (type === 'job' && (!form.salary.trim() || !form.experience_required.trim() || !form.state.trim())) || ((type === 'fellowship' || type === 'internship') && !form.stipend_amount.trim()) || (type === 'grant' && !form.grant_amount.trim())}
                  className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-base transition-colors flex items-center justify-center gap-2">
                  {submitting ? <><Loader2 className="w-5 h-5 animate-spin" /> Submitting...</> : adminPost ? 'Publish Now' : 'Submit for Review'}
                </button>
              </form>
            </div>
          </div>
        </section>
      </main>


    </div>
  );
}