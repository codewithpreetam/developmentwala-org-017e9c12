import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import { isPlatformAdmin, opportunitySubmitStatus } from '@/lib/supabase/auth';
import { applyEmployerContactFields } from '@/lib/employerContact';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import FormField from '../components/forms/FormField';
import SubmitFormShell from '../components/forms/SubmitFormShell';
import SubmitSuccess from '../components/forms/SubmitSuccess';
import CountrySelect from '../components/forms/CountrySelect';
import CountryMultiSelect from '../components/forms/CountryMultiSelect';
import { sectorOptions, locationTypeOptions, orgTypeOptions, DEFAULT_COUNTRY } from '../components/forms/formOptions';

const fundingTypeOptions = [
  { value: 'fully_funded', label: 'Fully Funded' }, { value: 'partially_funded', label: 'Partially Funded' },
  { value: 'stipend', label: 'Stipend Only' }, { value: 'unpaid', label: 'Unpaid' },
];

const fellowshipCategoryOptions = [
  { value: 'leadership', label: 'Leadership' }, { value: 'research', label: 'Research' },
  { value: 'field', label: 'Field' }, { value: 'policy', label: 'Policy' },
  { value: 'technology', label: 'Technology' }, { value: 'social_innovation', label: 'Social Innovation' }, { value: 'other', label: 'Other' },
];

export default function SubmitFellowship() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', organization_type: '', sector: '',
    fellowship_category: '', location_type: '', location: '', country: DEFAULT_COUNTRY, duration: '',
    funding_type: '', stipend_amount: '', eligible_countries: '', education_requirement: '',
    experience_required: '', field_of_study: '', application_deadline: '', application_process: '',
    video_link: '', tags: '',
    submitted_by_name: '', submitted_by_email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleUserLoaded = (user, contact) => {
    setForm(f => applyEmployerContactFields(f, user, contact));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    await base44.entities.Fellowship.create({
      ...form,
      status: opportunitySubmitStatus(user),
      submitted_by_email: user?.email,
      created_by: user?.email,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SubmitSuccess type="Fellowship" published={adminPost} />;

  return (
    <SubmitFormShell
      title="Post a Fellowship"
      subtitle="Attract emerging leaders and professionals to your fellowship programme."
      seoTitle="Post Fellowship — DevelopmentWala.org"
      seoDesc="Submit fellowship opportunities for the social sector in India."
      onSubmit={handleSubmit}
      submitting={submitting}
      canSubmit={form.title.trim() && form.description.trim()}
      onUserLoaded={handleUserLoaded}
    >
      <div className="space-y-5">
        <FormField label="Fellowship Title" required>
          <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Young Leaders Fellowship 2025" required className="h-11 rounded-xl" />
        </FormField>
        <FormField label="Description" required hint="Markdown supported">
          <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="About the fellowship, what fellows will do, benefits..." required className="min-h-[160px] rounded-xl" />
        </FormField>

        <div>
          <FormField label="Organization Type">
            <Select value={form.organization_type} onValueChange={v => u('organization_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{orgTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Sector">
            <Select value={form.sector} onValueChange={v => u('sector', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Fellowship Category">
            <Select value={form.fellowship_category} onValueChange={v => u('fellowship_category', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{fellowshipCategoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Mode">
            <Select value={form.location_type} onValueChange={v => u('location_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Online / Offline" /></SelectTrigger>
              <SelectContent>{locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Location">
            <Input value={form.location} onChange={e => u('location', e.target.value)} placeholder="City or Remote" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Country">
            <CountrySelect value={form.country} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Duration">
            <Input value={form.duration} onChange={e => u('duration', e.target.value)} placeholder="e.g. 12 months" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Funding Type">
            <Select value={form.funding_type} onValueChange={v => u('funding_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select funding" /></SelectTrigger>
              <SelectContent>{fundingTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Stipend Amount">
            <Input value={form.stipend_amount} onChange={e => u('stipend_amount', e.target.value)} placeholder="e.g. ₹25,000/month" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <FormField label="Eligible Countries">
          <CountryMultiSelect value={form.eligible_countries} onChange={(v) => u('eligible_countries', v)} className="h-11 rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Field of Study">
            <Input value={form.field_of_study} onChange={e => u('field_of_study', e.target.value)} placeholder="e.g. Social Work, Public Policy" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Education Requirement">
            <Input value={form.education_requirement} onChange={e => u('education_requirement', e.target.value)} placeholder="e.g. Bachelor's degree" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <FormField label="Experience Required">
          <Input value={form.experience_required} onChange={e => u('experience_required', e.target.value)} placeholder="e.g. 2+ years in development sector" className="h-11 rounded-xl" />
        </FormField>

        <FormField label="Application Process">
          <Textarea value={form.application_process} onChange={e => u('application_process', e.target.value)} placeholder="How to apply, selection stages..." className="min-h-[80px] rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Deadline">
            <Input type="date" value={form.application_deadline} onChange={e => u('application_deadline', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Tags">
            <Input value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="e.g. leadership, women, india" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <FormField label="Video Link (optional)">
          <Input type="url" value={form.video_link} onChange={e => u('video_link', e.target.value)} placeholder="YouTube / Vimeo" className="h-11 rounded-xl" />
        </FormField>

        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          Applications are received through DevelopmentWala.org. Review applicants from your Employer Dashboard.
        </div>

        <hr className="border-gray-100" />
        <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Contact Info (optional)</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Your Name">
            <Input value={form.submitted_by_name} onChange={e => u('submitted_by_name', e.target.value)} placeholder="Contact person" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Your Email">
            <Input type="email" value={form.submitted_by_email} onChange={e => u('submitted_by_email', e.target.value)} placeholder="you@org.com" className="h-11 rounded-xl" />
          </FormField>
        </div>
      </div>
    </SubmitFormShell>
  );
}