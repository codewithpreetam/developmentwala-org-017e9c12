import React, { useState } from 'react';
import { X, Send, CheckCircle2, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { base44 } from '@/api/base44Client';

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'interview', label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-700' },
  { value: 'selected', label: 'Selected / Hired', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const defaultMessages = {
  reviewing: 'We have received your application and are currently reviewing it. We will get back to you soon.',
  shortlisted: 'Congratulations! Your application has been shortlisted. We were impressed with your profile.',
  interview: 'We are pleased to invite you for an interview. Please check your email for scheduling details.',
  selected: 'Congratulations! We are delighted to inform you that you have been selected for this opportunity.',
  rejected: 'Thank you for your interest. After careful review, we have decided to move forward with other candidates.',
};

export default function StatusUpdateModal({ app, orgName, onClose, onUpdated }) {
  const [newStatus, setNewStatus] = useState(app.status);
  const [message, setMessage] = useState(defaultMessages[app.status] || '');
  const [nextSteps, setNextSteps] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const handleStatusChange = (v) => {
    setNewStatus(v);
    setMessage(defaultMessages[v] || '');
    setNextSteps('');
  };

  const handleSave = async () => {
    setSaving(true);
    const now = new Date().toISOString();
    const historyEntry = {
      status: newStatus,
      message,
      next_steps: nextSteps,
      updated_by: orgName || 'Employer',
      updated_at: now,
    };

    const prevHistory = Array.isArray(app.status_history) ? app.status_history : [];

    await base44.entities.Application.update(app.id, {
      status: newStatus,
      status_history: [...prevHistory, historyEntry],
    });

    // Build rich notification
    const statusLabel = statusOptions.find(s => s.value === newStatus)?.label || newStatus;
    const notifTitle = `Application Update: ${statusLabel}`;
    let notifMessage = `Your application for "${app.opportunity_title}" at ${orgName || 'the organization'} has been updated.\n\nStatus: ${statusLabel}`;
    if (message) notifMessage += `\n\nMessage from employer: ${message}`;
    if (nextSteps) notifMessage += `\n\nNext Steps: ${nextSteps}`;

    await base44.entities.Notification.create({
      user_email: app.applicant_email,
      title: notifTitle,
      message: notifMessage,
      type: `status_${newStatus}`,
      read: false,
      link: '',
    });

    setSaving(false);
    setConfirmed(true);
    setTimeout(() => {
      setConfirmed(false);
      onUpdated(newStatus);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Update Application Status</h3>
            <p className="text-sm text-gray-500 mt-0.5">{app.applicant_name || app.applicant_email}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {confirmed ? (
            <div className="flex flex-col items-center justify-center py-8 gap-3">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
              <p className="font-bold text-gray-900">Status updated &amp; candidate notified!</p>
              <p className="text-sm text-gray-500 text-center">A notification has been sent to {app.applicant_email}</p>
            </div>
          ) : (
            <>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">New Status</label>
                <Select value={newStatus} onValueChange={handleStatusChange}>
                  <SelectTrigger className="h-11 rounded-xl">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map(s => (
                      <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Message to Candidate <span className="text-gray-400 font-normal">(sent as notification)</span>
                </label>
                <Textarea
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Write a message or feedback for the candidate..."
                  className="min-h-[100px] rounded-xl"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Next Steps <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <Textarea
                  value={nextSteps}
                  onChange={e => setNextSteps(e.target.value)}
                  placeholder="e.g. We will contact you via email within 3 days to schedule an interview..."
                  className="min-h-[70px] rounded-xl"
                />
              </div>

              <div className="flex gap-3 pt-1">
                <button
                  onClick={handleSave}
                  disabled={saving || newStatus === app.status}
                  className="flex-1 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 rounded-xl flex items-center justify-center gap-2"
                >
                  {saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : <><Send className="w-4 h-4" /> Update &amp; Notify Candidate</>}
                </button>
                <button onClick={onClose} className="px-5 py-3 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 font-medium">
                  Cancel
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}