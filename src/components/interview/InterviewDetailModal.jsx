import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { X, Video, Calendar, Clock, User, AlertCircle, CheckCircle2, RotateCcw, ExternalLink } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  cancelled: 'bg-red-100 text-red-700',
  rescheduled: 'bg-blue-100 text-blue-700',
  completed: 'bg-gray-100 text-gray-600',
};

const typeLabels = {
  hr_round: 'HR Round', technical_round: 'Technical Round', final_round: 'Final Round',
  group_discussion: 'Group Discussion', other: 'Other',
};

const platformLabels = {
  google_meet: 'Google Meet', microsoft_teams: 'Microsoft Teams', zoom: 'Zoom', custom: 'Meeting Link',
};

export default function InterviewDetailModal({ interview, onClose, onUpdated, viewerRole = 'employer' }) {
  const [action, setAction] = useState(null); // 'cancel' | 'reschedule' | 'complete'
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);
  const [candidate, setCandidate] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCandidate() {
      if (!interview?.candidate_email) return;
      const { data } = await supabase
        .from('users')
        .select('first_name,last_name,email,profile_image_url,phone')
        .eq('email', interview.candidate_email)
        .maybeSingle();
      if (!cancelled && data) setCandidate(data);
    }
    loadCandidate();
    return () => { cancelled = true; };
  }, [interview?.candidate_email]);

  const candidateName = (
    [candidate?.first_name, candidate?.last_name].filter(Boolean).join(' ').trim()
    || interview.candidate_name
    || (interview.candidate_email ? interview.candidate_email.split('@')[0] : 'Candidate')
  );

  const handleAction = async () => {
    setSaving(true);
    const auditEntry = { action, by: viewerRole, at: new Date().toISOString(), note };
    const updates = {
      status: action === 'cancel' ? 'cancelled' : action === 'complete' ? 'completed' : 'rescheduled',
      audit_trail: [...(interview.audit_trail || []), auditEntry],
    };
    if (action === 'cancel') updates.cancelled_by = viewerRole;
    if (action === 'reschedule') updates.reschedule_reason = note;
    await base44.entities.Interview.update(interview.id, updates);

    // Notify candidate if employer is acting
    if (viewerRole === 'employer' && (action === 'cancel' || action === 'reschedule')) {
      await base44.entities.Notification.create({
        user_email: interview.candidate_email,
        title: action === 'cancel' ? 'Interview Cancelled' : 'Interview Rescheduled',
        message: action === 'cancel'
          ? `Your interview for "${interview.job_title}" on ${interview.date} has been cancelled. Reason: ${note || 'No reason provided.'}`
          : `Your interview for "${interview.job_title}" has been rescheduled. ${note}`,
        type: action === 'cancel' ? 'interview_cancelled' : 'interview_rescheduled',
        read: false,
      }).catch(() => {});
    }

    setSaving(false);
    onUpdated();
    onClose();
  };

  const canJoin = interview.meeting_link && interview.status !== 'cancelled';

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900">Interview Details</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block capitalize ${statusColors[interview.status] || statusColors.confirmed}`}>
              {interview.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Candidate */}
          <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl">
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
              <User className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <div className="font-semibold text-gray-900">{interview.candidate_name || 'Candidate'}</div>
              <div className="text-sm text-gray-500">{interview.candidate_email}</div>
            </div>
          </div>

          {/* Job */}
          {interview.job_title && (
            <div className="text-sm text-gray-700"><span className="font-semibold">Role:</span> {interview.job_title}</div>
          )}

          {/* Type */}
          <div className="text-sm text-gray-700">
            <span className="font-semibold">Type:</span>{' '}
            <span className="bg-purple-50 text-purple-700 text-xs font-semibold px-2.5 py-1 rounded-full">
              {typeLabels[interview.interview_type] || 'Interview'}
            </span>
          </div>

          {/* Date/Time */}
          <div className="flex items-center gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" />{interview.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />{interview.start_time} · {interview.duration} min</span>
          </div>

          {/* Meeting */}
          {interview.meeting_link && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <Video className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-green-700 mb-0.5">{platformLabels[interview.meeting_platform] || 'Meeting'}</div>
                <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-800 truncate hover:underline flex items-center gap-1">
                  {interview.meeting_link} <ExternalLink className="w-3 h-3 shrink-0" />
                </a>
              </div>
              {canJoin && (
                <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="bg-green-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-green-700 shrink-0">
                  Join
                </a>
              )}
            </div>
          )}

          {/* Notes */}
          {interview.notes && (
            <div className="text-sm text-gray-600 bg-yellow-50 rounded-xl p-3 border border-yellow-100">
              <span className="font-semibold">Notes:</span> {interview.notes}
            </div>
          )}

          {/* Action panel */}
          {interview.status !== 'cancelled' && interview.status !== 'completed' && (
            <div className="border-t border-gray-100 pt-4">
              {!action ? (
                <div className="flex gap-2 flex-wrap">
                  {viewerRole === 'employer' && (
                    <button onClick={() => setAction('complete')}
                      className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 border border-green-200 px-3 py-2 rounded-lg hover:bg-green-100 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Complete
                    </button>
                  )}
                  <button onClick={() => setAction('reschedule')}
                    className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 border border-blue-200 px-3 py-2 rounded-lg hover:bg-blue-100 font-medium">
                    <RotateCcw className="w-3.5 h-3.5" /> Reschedule
                  </button>
                  <button onClick={() => setAction('cancel')}
                    className="flex items-center gap-1.5 text-xs text-red-700 bg-red-50 border border-red-200 px-3 py-2 rounded-lg hover:bg-red-100 font-medium">
                    <AlertCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-gray-700 capitalize">{action} Interview</p>
                  <Textarea value={note} onChange={e => setNote(e.target.value)}
                    placeholder={action === 'reschedule' ? 'Reason / new time details...' : 'Reason for cancellation...'}
                    className="min-h-[70px] rounded-xl text-sm" />
                  <div className="flex gap-2">
                    <button onClick={handleAction} disabled={saving}
                      className="bg-gray-900 hover:bg-gray-800 disabled:opacity-50 text-white text-xs font-bold px-5 py-2 rounded-lg">
                      {saving ? 'Saving...' : 'Confirm'}
                    </button>
                    <button onClick={() => { setAction(null); setNote(''); }} className="text-xs text-gray-500 hover:text-gray-700 px-4 py-2">Back</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Audit trail */}
          {interview.audit_trail?.length > 0 && (
            <div className="border-t border-gray-100 pt-4">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">History</p>
              <div className="space-y-2">
                {interview.audit_trail.map((entry, i) => (
                  <div key={i} className="text-xs text-gray-500 flex items-start gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-300 rounded-full mt-1.5 shrink-0" />
                    <span className="capitalize font-medium text-gray-700">{entry.action}</span>
                    {entry.note && <span>— {entry.note}</span>}
                    <span className="ml-auto shrink-0">{entry.at ? new Date(entry.at).toLocaleDateString('en-IN') : ''}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}