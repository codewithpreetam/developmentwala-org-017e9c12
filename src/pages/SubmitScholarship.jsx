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
import { sectorOptions, DEFAULT_COUNTRY } from '../components/forms/formOptions';

const providerTypeOptions = [
  { value: 'government', label: 'Government' }, { value: 'un_agency', label: 'UN Agency' },
  { value: 'foundation', label: 'Foundation' }, { value: 'university', label: 'University' },
  { value: 'ngo', label: 'NGO' }, { value: 'corporate', label: 'Corporate / CSR' }, { value: 'other', label: 'Other' },
];

const levelOptions = [
  { value: 'undergraduate', label: 'Undergraduate' }, { value: 'postgraduate', label: 'Postgraduate' },
  { value: 'phd', label: 'PhD' }, { value: 'diploma', label: 'Diploma' },
  { value: 'certificate', label: 'Certificate' }, { value: 'all', label: 'All Levels' },
];

const scholarshipTypeOptions = [
  { value: 'merit', label: 'Merit-based' }, { value: 'need_based', label: 'Need-based' },
  { value: 'minority', label: 'Minority' }, { value: 'women', label: 'Women' },
  { value: 'research', label: 'Research' }, { value: 'sports', label: 'Sports' }, { value: 'other', label: 'Other' },
];

const fundingTypeOptions = [
  { value: 'fully_funded', label: 'Fully Funded' }, { value: 'partially_funded', label: 'Partially Funded' },
  { value: 'tuition_only', label: 'Tuition Only' }, { value: 'living_allowance', label: 'Living Allowance' },
];

export default function SubmitScholarship() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', provider_type: '', university_name: '',
    country: DEFAULT_COUNTRY, level_of_study: '', scholarship_type: '', funding_type: '', eligible_countries: '',
    field_of_study: '', scholarship_amount: '', application_deadline: '', tags: '',
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
    await base44.entities.Scholarship.create({
      ...form,
      status: opportunitySubmitStatus(user),
      submitted_by_email: user?.email,
      created_by: user?.email,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SubmitSuccess type="Scholarship" published={adminPost} />;

  return (
    <SubmitFormShell
      title="Post a Scholarship"
      subtitle="Help students access education funding in the social sector."
      seoTitle="Post Scholarship — DevelopmentWala.org"
      seoDesc="Submit scholarships for social sector students in India."
      onSubmit={handleSubmit}
      submitting={submitting}
      canSubmit={form.title.trim() && form.description.trim()}
      onUserLoaded={handleUserLoaded}
    >
      <div className="space-y-5">
        <FormField label="Scholarship Title" required>
          <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Tata Social Excellence Scholarship 2025" required className="h-11 rounded-xl" />
        </FormField>
        <FormField label="Description" required hint="Markdown supported">
          <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="About the scholarship, benefits, selection process..." required className="min-h-[160px] rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Provider / Donor Name">
            <Input value={form.provider_name} onChange={e => u('provider_name', e.target.value)} placeholder="e.g. Tata Trusts, Ford Foundation" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Provider Type">
            <Select value={form.provider_type} onValueChange={v => u('provider_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{providerTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="University / Institution (if applicable)">
            <Input value={form.university_name} onChange={e => u('university_name', e.target.value)} placeholder="e.g. TISS, JNU" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Country">
            <CountrySelect value={form.country} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Level of Study">
            <Select value={form.level_of_study} onValueChange={v => u('level_of_study', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select level" /></SelectTrigger>
              <SelectContent>{levelOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Scholarship Type">
            <Select value={form.scholarship_type} onValueChange={v => u('scholarship_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{scholarshipTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Funding Type">
            <Select value={form.funding_type} onValueChange={v => u('funding_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select funding" /></SelectTrigger>
              <SelectContent>{fundingTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Scholarship Amount">
            <Input value={form.scholarship_amount} onChange={e => u('scholarship_amount', e.target.value)} placeholder="e.g. ₹1,00,000/year or Full Tuition" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Eligible Countries">
            <CountryMultiSelect value={form.eligible_countries} onChange={(v) => u('eligible_countries', v)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Field of Study">
            <Input value={form.field_of_study} onChange={e => u('field_of_study', e.target.value)} placeholder="e.g. Social Work, Development Studies" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Deadline">
            <Input type="date" value={form.application_deadline} onChange={e => u('application_deadline', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Tags">
            <Input value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="e.g. women, sc/st, postgraduate" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Link">
            <Input type="url" value={form.application_link} onChange={e => u('application_link', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Application Email">
            <Input type="email" value={form.application_email} onChange={e => u('application_email', e.target.value)} placeholder="scholarships@org.com" className="h-11 rounded-xl" />
          </FormField>
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