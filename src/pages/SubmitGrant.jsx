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

const agencyTypeOptions = [
  { value: 'government', label: 'Government' }, { value: 'un_agency', label: 'UN Agency' },
  { value: 'foundation', label: 'Foundation' }, { value: 'bilateral', label: 'Bilateral Donor' },
  { value: 'multilateral', label: 'Multilateral' }, { value: 'corporate_csr', label: 'Corporate / CSR' }, { value: 'other', label: 'Other' },
];

export default function SubmitGrant() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', funding_agency: '', agency_type: '', sector: '',
    country: DEFAULT_COUNTRY, eligible_countries: '', grant_amount: '',
    application_deadline: '', application_link: '',
    application_email: '', tags: '', submitted_by_name: '', submitted_by_email: '',
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
    await base44.entities.Grant.create({
      ...form,
      status: opportunitySubmitStatus(user),
      submitted_by_email: user?.email,
      created_by: user?.email,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SubmitSuccess type="Grant" published={adminPost} />;

  return (
    <SubmitFormShell
      title="Post a Grant"
      subtitle="Connect NGOs and social enterprises with your funding opportunity."
      seoTitle="Post Grant — DevelopmentWala.org"
      seoDesc="Submit grants and funding opportunities for NGOs in India."
      onSubmit={handleSubmit}
      submitting={submitting}
      canSubmit={form.title.trim() && form.description.trim()}
      onUserLoaded={handleUserLoaded}
    >
      <div className="space-y-5">
        <FormField label="Grant Title" required>
          <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. CSR Grant for Rural Education Initiatives" required className="h-11 rounded-xl" />
        </FormField>
        <FormField label="Grant Details" required hint="Markdown supported">
          <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="Grant objectives, what will be funded, selection criteria..." required className="min-h-[160px] rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Funding Agency">
            <Input value={form.funding_agency} onChange={e => u('funding_agency', e.target.value)} placeholder="e.g. Ford Foundation, USAID" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Agency Type">
            <Select value={form.agency_type} onValueChange={v => u('agency_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{agencyTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
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
          <FormField label="Grant Amount">
            <Input value={form.grant_amount} onChange={e => u('grant_amount', e.target.value)} placeholder="e.g. Up to ₹50 Lakhs" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Country">
            <CountrySelect value={form.country} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Eligible Countries">
            <CountryMultiSelect value={form.eligible_countries} onChange={(v) => u('eligible_countries', v)} className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Deadline">
            <Input type="date" value={form.application_deadline} onChange={e => u('application_deadline', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Tags">
            <Input value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="e.g. csr, rural, women, environment" className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Link">
            <Input type="url" value={form.application_link} onChange={e => u('application_link', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Application Email">
            <Input type="email" value={form.application_email} onChange={e => u('application_email', e.target.value)} placeholder="grants@org.com" className="h-11 rounded-xl" />
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