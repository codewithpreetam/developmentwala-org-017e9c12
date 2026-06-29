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
import { sectorOptions, locationTypeOptions, orgTypeOptions, DEFAULT_COUNTRY } from '../components/forms/formOptions';

export default function SubmitInternship() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', organization: '', organization_type: '', sector: '',
    location: '', location_type: '', country: DEFAULT_COUNTRY, duration: '', stipend_type: '',
    stipend_amount: '', responsibilities: '', required_skills: '',
    application_deadline: '', tags: '',
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
    await base44.entities.Internship.create({
      ...form,
      status: opportunitySubmitStatus(user),
      submitted_by_email: user?.email,
      created_by: user?.email,
    });
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SubmitSuccess type="Internship" published={adminPost} />;

  return (
    <SubmitFormShell
      title="Post an Internship"
      subtitle="Reach passionate students and young professionals in the social sector."
      seoTitle="Post Internship — DevelopmentWala.org"
      seoDesc="Submit internship opportunities for NGOs and social enterprises in India."
      onSubmit={handleSubmit}
      submitting={submitting}
      canSubmit={form.title.trim() && form.description.trim()}
      onUserLoaded={handleUserLoaded}
    >
      <div className="space-y-5">
        <FormField label="Internship Title" required>
          <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Research Intern – Education Programme" required className="h-11 rounded-xl" />
        </FormField>
        <FormField label="Description" required hint="Markdown supported: **bold**, - bullets">
          <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="Roles, responsibilities, what the intern will learn..." required className="min-h-[160px] rounded-xl" />
        </FormField>

        <FormField label="Organization Name" required={adminPost} hint={adminPost ? 'Name of the host organization for this internship.' : 'Auto-filled from your organization profile.'}>
          <Input value={form.organization} onChange={e => u('organization', e.target.value)} placeholder="e.g. Mary Foundation" required={adminPost} className="h-11 rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Organization Type">
            <Select value={form.organization_type} onValueChange={v => u('organization_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{orgTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Sector">
            <Select value={form.sector} onValueChange={v => u('sector', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div>
          <FormField label="Mode">
            <Select value={form.location_type} onValueChange={v => u('location_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Online / Offline" /></SelectTrigger>
              <SelectContent>{locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Location / City">
            <Input value={form.location} onChange={e => u('location', e.target.value)} placeholder="e.g. New Delhi" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Country">
            <CountrySelect value={form.country} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Duration">
            <Input value={form.duration} onChange={e => u('duration', e.target.value)} placeholder="e.g. 3 months" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Stipend">
            <Select value={form.stipend_type} onValueChange={v => u('stipend_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Paid / Unpaid" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="paid">Paid</SelectItem>
                <SelectItem value="unpaid">Unpaid</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
        </div>

        {form.stipend_type === 'paid' && (
          <FormField label="Stipend Amount">
            <Input value={form.stipend_amount} onChange={e => u('stipend_amount', e.target.value)} placeholder="e.g. ₹10,000/month" className="h-11 rounded-xl" />
          </FormField>
        )}

        <FormField label="Required Skills">
          <Input value={form.required_skills} onChange={e => u('required_skills', e.target.value)} placeholder="e.g. MS Excel, Communication, Field Research" className="h-11 rounded-xl" />
        </FormField>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Application Deadline">
            <Input type="date" value={form.application_deadline} onChange={e => u('application_deadline', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Tags (comma-separated)">
            <Input value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="e.g. women, rural, research" className="h-11 rounded-xl" />
          </FormField>
        </div>


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