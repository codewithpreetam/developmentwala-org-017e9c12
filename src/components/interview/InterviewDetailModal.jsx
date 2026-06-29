import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { supabase } from '@/integrations/supabase/client';
import { X, Video, Calendar, Clock, User, AlertCircle, CheckCircle2, RotateCcw, ExternalLink, Mail, Phone, MapPin, Briefcase, GraduationCap, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
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
  const [reschedDate, setReschedDate] = useState(interview.date || '');
  const [reschedTime, setReschedTime] = useState(interview.start_time || '10:00');
  const [reschedDuration, setReschedDuration] = useState(interview.duration || 60);
  const [reschedLink, setReschedLink] = useState(interview.meeting_link || '');
  const [saving, setSaving] = useState(false);
  const [userRow, setUserRow] = useState(null);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCandidate() {
      // Resolve users row by candidate_id first, then by email fallback
      let u = null;
      if (interview?.candidate_id) {
        const { data } = await supabase
          .from('users').select('id,user_id,email,first_name,last_name,phone,profile_image_url,location')
          .eq('id', interview.candidate_id).maybeSingle();
        u = data;
      }
      if (!u && interview?.candidate_email) {
        const { data } = await supabase
          .from('users').select('id,user_id,email,first_name,last_name,phone,profile_image_url,location')
          .eq('email', interview.candidate_email).maybeSingle();
        u = data;
      }
      if (cancelled) return;
      setUserRow(u);
      if (u?.user_id) {
        const { data: cp } = await supabase
          .from('candidate_profiles')
          .select('profile_picture_url,professional_title,experience_level,education_level,profession,skills,cv_url,cv_filename,biography')
          .eq('user_id', u.user_id).maybeSingle();
        if (!cancelled) setProfile(cp);
      }
    }
    loadCandidate();
    return () => { cancelled = true; };
  }, [interview?.candidate_id, interview?.candidate_email]);

  const candidateName = (
    [userRow?.first_name, userRow?.last_name].filter(Boolean).join(' ').trim()
    || interview.candidate_name
    || (userRow?.email || interview.candidate_email || '').split('@')[0]
    || 'Candidate'
  );
  const avatar = profile?.profile_picture_url || userRow?.profile_image_url;

  const handleAction = async () => {
    setSaving(true);
    try {
      const updates = {};
      if (action === 'cancel') {
        updates.status = 'cancelled';
        if (note) updates.notes = `${interview.notes ? interview.notes + '\n\n' : ''}[Cancelled] ${note}`;
      } else if (action === 'complete') {
        updates.status = 'completed';
      } else if (action === 'reschedule') {
        if (!reschedDate || !reschedTime) {
          alert('Pick a new date and time.');
          setSaving(false);
          return;
        }
        updates.status = 'rescheduled';
        updates.date = reschedDate;
        updates.start_time = reschedTime;
        updates.duration = Number(reschedDuration) || 60;
        if (reschedLink) updates.meeting_link = reschedLink;
        if (note) updates.notes = `${interview.notes ? interview.notes + '\n\n' : ''}[Rescheduled] ${note}`;
      }
      await base44.entities.Interview.update(interview.id, updates);

      // Notify candidate (trigger also fires, but include extra context)
      if (viewerRole === 'employer' && (action === 'cancel' || action === 'reschedule')) {
        await base44.entities.Notification.create({
          user_email: interview.candidate_email,
          title: action === 'cancel' ? 'Interview Cancelled' : 'Interview Rescheduled',
          message: action === 'cancel'
            ? `Your interview for "${interview.job_title || 'your application'}" has been cancelled.${note ? ' Reason: ' + note : ''}`
            : `Your interview for "${interview.job_title || 'your application'}" was rescheduled to ${reschedDate} ${reschedTime}.${note ? ' Note: ' + note : ''}`,
          type: action === 'cancel' ? 'interview_cancelled' : 'interview_rescheduled',
        }).catch(() => {});
      }

      onUpdated?.();
      onClose();
    } catch (err) {
      console.error('Interview update failed:', err);
      alert(`Failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setSaving(false);
    }
  };

  const canJoin = interview.meeting_link && interview.status !== 'cancelled';
  const skills = Array.isArray(profile?.skills) ? profile.skills : (typeof profile?.skills === 'string' ? profile.skills.split(',').map(s => s.trim()).filter(Boolean) : []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl my-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900">Interview Details</h3>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full mt-1 inline-block capitalize ${statusColors[interview.status] || statusColors.confirmed}`}>
              {interview.status}
            </span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg shrink-0">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Candidate */}
          <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
            {avatar ? (
              <img src={avatar} alt={candidateName} className="w-12 h-12 rounded-xl object-cover shrink-0" />
            ) : (
              <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                <User className="w-6 h-6 text-blue-600" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-gray-900 truncate">{candidateName}</div>
              {profile?.professional_title && (
                <div className="text-xs text-gray-600 truncate">{profile.professional_title}</div>
              )}
              <div className="mt-1 space-y-0.5 text-xs text-gray-500">
                {(userRow?.email || interview.candidate_email) && (
                  <div className="flex items-center gap-1.5 min-w-0"><Mail className="w-3 h-3 shrink-0" /><span className="truncate">{userRow?.email || interview.candidate_email}</span></div>
                )}
                {userRow?.phone && <div className="flex items-center gap-1.5"><Phone className="w-3 h-3 shrink-0" />{userRow.phone}</div>}
                {userRow?.location && <div className="flex items-center gap-1.5"><MapPin className="w-3 h-3 shrink-0" />{userRow.location}</div>}
              </div>
            </div>
          </div>

          {/* Profile snippets */}
          {(profile?.experience_level || profile?.education_level || skills.length > 0 || profile?.cv_url) && (
            <div className="grid grid-cols-1 gap-2 text-xs text-gray-700">
              {profile?.experience_level && (
                <div className="flex items-center gap-2"><Briefcase className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="capitalize">{profile.experience_level.replace(/_/g, ' ')}</span></div>
              )}
              {profile?.education_level && (
                <div className="flex items-center gap-2"><GraduationCap className="w-3.5 h-3.5 text-gray-400 shrink-0" /><span className="capitalize">{profile.education_level.replace(/_/g, ' ')}</span></div>
              )}
              {skills.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {skills.slice(0, 8).map((s, i) => (
                    <span key={i} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full text-[11px]">{s}</span>
                  ))}
                </div>
              )}
              {profile?.cv_url && (
                <a href={profile.cv_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline">
                  <FileText className="w-3.5 h-3.5" /> View CV{profile.cv_filename ? ` (${profile.cv_filename})` : ''}
                </a>
              )}
            </div>
          )}

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
          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-700">
            <span className="flex items-center gap-1.5"><Calendar className="w-4 h-4 text-gray-400" />{interview.date}</span>
            <span className="flex items-center gap-1.5"><Clock className="w-4 h-4 text-gray-400" />{interview.start_time} · {interview.duration} min</span>
          </div>

          {/* Meeting */}
          {interview.meeting_link && (
            <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-200">
              <Video className="w-5 h-5 text-green-600 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="text-xs font-semibold text-green-700 mb-0.5">Meeting</div>
                <a href={interview.meeting_link} target="_blank" rel="noopener noreferrer"
                  className="text-xs text-green-800 hover:underline inline-flex items-center gap-1 max-w-full">
                  <span className="truncate">{interview.meeting_link}</span> <ExternalLink className="w-3 h-3 shrink-0" />
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
            <div className="text-sm text-gray-600 bg-yellow-50 rounded-xl p-3 border border-yellow-100 break-words whitespace-pre-wrap">
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

                  {action === 'reschedule' && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">New Date *</label>
                        <Input type="date" value={reschedDate} onChange={e => setReschedDate(e.target.value)} min={new Date().toISOString().split('T')[0]} className="h-9 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Start Time *</label>
                        <Input type="time" value={reschedTime} onChange={e => setReschedTime(e.target.value)} className="h-9 rounded-lg text-sm" />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Duration (min)</label>
                        <Input type="number" min="15" step="15" value={reschedDuration} onChange={e => setReschedDuration(e.target.value)} className="h-9 rounded-lg text-sm" />
                      </div>
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-semibold text-gray-500 mb-1">Meeting Link</label>
                        <Input type="url" value={reschedLink} onChange={e => setReschedLink(e.target.value)} placeholder="https://meet.google.com/..." className="h-9 rounded-lg text-sm" />
                      </div>
                    </div>
                  )}

                  {action !== 'complete' && (
                    <Textarea value={note} onChange={e => setNote(e.target.value)}
                      placeholder={action === 'reschedule' ? 'Optional note to the candidate...' : 'Reason for cancellation (optional)...'}
                      className="min-h-[70px] rounded-xl text-sm" />
                  )}

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
        </div>
      </div>
    </div>
  );
}
