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
import ImageUploadField from '../components/shared/ImageUploadField';
import CountrySelect from '../components/forms/CountrySelect';
import { sectorOptions, locationTypeOptions, orgTypeOptions, DEFAULT_COUNTRY } from '../components/forms/formOptions';

const eventCategoryOptions = [
  { value: 'conference', label: 'Conference' }, { value: 'webinar', label: 'Webinar' },
  { value: 'workshop', label: 'Workshop' }, { value: 'meetup', label: 'Meetup' },
  { value: 'training', label: 'Training' }, { value: 'summit', label: 'Summit' },
  { value: 'hackathon', label: 'Hackathon' }, { value: 'other', label: 'Other' },
];

export default function SubmitEvent() {
  const { user } = useAuth();
  const adminPost = isPlatformAdmin(user);
  const [form, setForm] = useState({
    title: '', description: '', organizer_type: '', event_category: '',
    sector: '', event_date: '', event_end_date: '', event_time: '', location: '',
    location_type: '', country: DEFAULT_COUNTRY, registration_deadline: '',
    is_free: true, registration_fee: '', banner_image: '', tags: '', submitted_by_name: '', submitted_by_email: '',
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
    await base44.entities.Event.create({
      ...form,
      status: opportunitySubmitStatus(user),
      submitted_by_email: user?.email,
      created_by: user?.email,
    });
    if (!adminPost) {
      // Notify admin of new submission
      await base44.entities.Notification.create({
        user_email: 'admin',
        title: '📋 New Event Submitted',
        message: `"${form.title}" was submitted by ${form.submitted_by_name || form.submitted_by_email || 'an anonymous user'} and is pending review.`,
        type: 'new_submission',
        read: false,
      }).catch(() => {});
    }
    setSubmitting(false);
    setSubmitted(true);
  };

  if (submitted) return <SubmitSuccess type="Event" published={adminPost} />;

  return (
    <SubmitFormShell
      title="Post an Event"
      subtitle="Promote your workshop, webinar, conference, or meetup to the social sector."
      seoTitle="Post Event — DevelopmentWala.org"
      seoDesc="Submit NGO events, conferences, and workshops to DevelopmentWala.org."
      onSubmit={handleSubmit}
      submitting={submitting}
      canSubmit={form.title.trim() && form.description.trim()}
      onUserLoaded={handleUserLoaded}
    >
      <div className="space-y-5">
        <FormField label="Event Title" required>
          <Input value={form.title} onChange={e => u('title', e.target.value)} placeholder="e.g. Climate Justice Summit 2025" required className="h-11 rounded-xl" />
        </FormField>
        <FormField label="Event Description" required hint="Markdown supported">
          <Textarea value={form.description} onChange={e => u('description', e.target.value)} placeholder="What is this event about? Who should attend? Key speakers..." required className="min-h-[160px] rounded-xl" />
        </FormField>

        <div>
          <FormField label="Organizer Type">
            <Select value={form.organizer_type} onValueChange={v => u('organizer_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
              <SelectContent>{orgTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Event Category">
            <Select value={form.event_category} onValueChange={v => u('event_category', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>{eventCategoryOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
          <FormField label="Sector">
            <Select value={form.sector} onValueChange={v => u('sector', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
              <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Event Date" required>
            <Input type="date" value={form.event_date} onChange={e => u('event_date', e.target.value)} required className="h-11 rounded-xl" />
          </FormField>
          <FormField label="End Date (if multi-day)">
            <Input type="date" value={form.event_end_date} onChange={e => u('event_end_date', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Event Time">
            <Input value={form.event_time} onChange={e => u('event_time', e.target.value)} placeholder="e.g. 10:00 AM – 5:00 PM IST" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Mode">
            <Select value={form.location_type} onValueChange={v => u('location_type', v)}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Online / Offline" /></SelectTrigger>
              <SelectContent>{locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
            </Select>
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Location / City">
            <Input value={form.location} onChange={e => u('location', e.target.value)} placeholder="e.g. New Delhi / Online" className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Country">
            <CountrySelect value={form.country} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
          </FormField>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Is this event free?">
            <Select value={String(form.is_free)} onValueChange={v => u('is_free', v === 'true')}>
              <SelectTrigger className="h-11 rounded-xl"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Free</SelectItem>
                <SelectItem value="false">Paid</SelectItem>
              </SelectContent>
            </Select>
          </FormField>
          {!form.is_free && (
            <FormField label="Registration Fee">
              <Input value={form.registration_fee} onChange={e => u('registration_fee', e.target.value)} placeholder="e.g. ₹500" className="h-11 rounded-xl" />
            </FormField>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <FormField label="Registration Deadline">
            <Input type="date" value={form.registration_deadline} onChange={e => u('registration_deadline', e.target.value)} className="h-11 rounded-xl" />
          </FormField>
          <FormField label="Tags">
            <Input value={form.tags} onChange={e => u('tags', e.target.value)} placeholder="e.g. climate, youth, webinar" className="h-11 rounded-xl" />
          </FormField>
        </div>
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 text-xs text-blue-700">
          Registrations are managed through DevelopmentWala.org. Track registrants from your Employer Dashboard.
        </div>


        <ImageUploadField
          label="Event Header Image (optional)"
          hint="JPG, PNG or WebP · Max 2MB · Recommended 16:9 ratio"
          value={form.banner_image}
          onChange={v => u('banner_image', v)}
        />

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