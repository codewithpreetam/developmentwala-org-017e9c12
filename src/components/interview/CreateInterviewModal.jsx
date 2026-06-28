import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { X, Calendar, Clock, Video, User, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const interviewTypes = [
  { value: 'hr_round', label: 'HR Round' },
  { value: 'technical_round', label: 'Technical Round' },
  { value: 'final_round', label: 'Final Round' },
  { value: 'group_discussion', label: 'Group Discussion' },
  { value: 'other', label: 'Other' },
];

const platforms = [
  { value: 'google_meet', label: 'Google Meet' },
  { value: 'microsoft_teams', label: 'Microsoft Teams' },
  { value: 'zoom', label: 'Zoom' },
  { value: 'custom', label: 'Custom Link' },
];

const durations = [
  { value: 30, label: '30 minutes' },
  { value: 45, label: '45 minutes' },
  { value: 60, label: '1 hour' },
  { value: 90, label: '1.5 hours' },
  { value: 120, label: '2 hours' },
];

export default function CreateInterviewModal({ onClose, onCreated, employerEmail, orgName, prefillApp, shortlistedApplicants = [] }) {
  const [selectedAppId, setSelectedAppId] = useState(prefillApp?.id || '');
  const [form, setForm] = useState({
    candidate_email: prefillApp?.applicant_email || '',
    candidate_name: prefillApp?.applicant_name || '',
    application_id: prefillApp?.id || '',
    job_title: prefillApp?.opportunity_title || '',
    job_id: prefillApp?.opportunity_id || '',
    date: '',
    start_time: '10:00',
    duration: 60,
    interview_type: 'hr_round',
    meeting_link: '',
    meeting_platform: 'google_meet',
    notes: '',
    status: 'confirmed',
  });
  const [saving, setSaving] = useState(false);

  const handleSelectApplicant = (appId) => {
    setSelectedAppId(appId);
    const app = shortlistedApplicants.find(a => a.id === appId);
    if (app) {
      setForm(f => ({
        ...f,
        candidate_email: app.applicant_email || '',
        candidate_name: app.applicant_name || '',
        application_id: app.id,
        job_title: app.opportunity_title || '',
        job_id: app.opportunity_id || '',
      }));
    }
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    const interview = await base44.entities.Interview.create({
      ...form,
      employer_email: employerEmail,
      employer_org: orgName,
      audit_trail: [{ action: 'scheduled', by: employerEmail, at: new Date().toISOString(), note: 'Interview scheduled by employer' }],
    });

    // Notify candidate
    await base44.entities.Notification.create({
      user_email: form.candidate_email,
      title: 'Interview Scheduled',
      message: `Your interview for "${form.job_title}" has been scheduled on ${form.date} at ${form.start_time}.\n\nType: ${form.interview_type.replace(/_/g, ' ')}\n\nMeeting Link: ${form.meeting_link || 'To be shared'}`,
      type: 'interview_scheduled',
      read: false,
    }).catch(() => {});

    setSaving(false);
    onCreated(interview);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-xl shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Schedule Interview</h3>
            <p className="text-sm text-gray-500 mt-0.5">Create an interview slot for a candidate</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Candidate — restricted to shortlisted applicants */}
          <div className="bg-blue-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Select Shortlisted Candidate</p>
            {shortlistedApplicants.length === 0 ? (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                No shortlisted candidates yet. Mark candidates as <strong>Shortlisted</strong> from the Applicants tab first.
              </div>
            ) : (
              <>
                <div>
                  <label className="block text-xs font-semibold text-gray-600 mb-1">Shortlisted Candidate *</label>
                  <Select value={selectedAppId} onValueChange={handleSelectApplicant}>
                    <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue placeholder="Select a shortlisted candidate" /></SelectTrigger>
                    <SelectContent>
                      {shortlistedApplicants.map(app => (
                        <SelectItem key={app.id} value={app.id}>
                          {app.applicant_name || app.applicant_email} — {app.opportunity_title || 'Position'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedAppId && (
                  <div className="bg-white rounded-lg px-3 py-2 border border-blue-200 text-xs text-gray-600 space-y-0.5">
                    <div><span className="font-semibold">Email:</span> {form.candidate_email}</div>
                    <div><span className="font-semibold">Role:</span> {form.job_title || '—'}</div>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Date & Time */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-gray-600 uppercase tracking-wider flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> Schedule</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-1">
                <label className="block text-xs font-semibold text-gray-600 mb-1">Date *</label>
                <Input required type="date" value={form.date} onChange={e => u('date', e.target.value)} min={new Date().toISOString().split('T')[0]} className="h-9 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Start Time *</label>
                <Input required type="time" value={form.start_time} onChange={e => u('start_time', e.target.value)} className="h-9 rounded-lg text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Duration</label>
                <Select value={String(form.duration)} onValueChange={v => u('duration', Number(v))}>
                  <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{durations.map(d => <SelectItem key={d.value} value={String(d.value)}>{d.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-600 mb-1">Interview Type</label>
              <Select value={form.interview_type} onValueChange={v => u('interview_type', v)}>
                <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                <SelectContent>{interviewTypes.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>

          {/* Meeting */}
          <div className="bg-green-50 rounded-xl p-4 space-y-3">
            <p className="text-xs font-bold text-green-700 uppercase tracking-wider flex items-center gap-1.5"><Video className="w-3.5 h-3.5" /> Meeting Details</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Platform</label>
                <Select value={form.meeting_platform} onValueChange={v => u('meeting_platform', v)}>
                  <SelectTrigger className="h-9 rounded-lg text-sm"><SelectValue /></SelectTrigger>
                  <SelectContent>{platforms.map(p => <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-600 mb-1">Meeting Link</label>
                <Input type="url" value={form.meeting_link} onChange={e => u('meeting_link', e.target.value)} placeholder="https://meet.google.com/..." className="h-9 rounded-lg text-sm" />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Notes (optional)</label>
            <Textarea value={form.notes} onChange={e => u('notes', e.target.value)} placeholder="Any instructions or notes for the candidate..." className="min-h-[70px] rounded-xl text-sm" />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-medium text-gray-600 hover:bg-gray-50">Cancel</button>
            <button type="submit" disabled={saving || !form.date || !form.start_time || !form.candidate_email || (shortlistedApplicants.length > 0 && !selectedAppId)}
              className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2">
              {saving ? 'Scheduling...' : 'Schedule Interview'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}