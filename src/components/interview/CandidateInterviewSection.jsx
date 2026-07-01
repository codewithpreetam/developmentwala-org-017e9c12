import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Calendar, Video, Clock, Building2, ExternalLink } from 'lucide-react';
import InterviewDetailModal from './InterviewDetailModal';

const statusColors = {
  confirmed: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  rescheduled: 'bg-blue-100 text-blue-700 border-blue-200',
  completed: 'bg-gray-100 text-gray-600 border-gray-200',
};

const typeLabels = {
  hr_round: 'HR Round', technical_round: 'Technical Round', final_round: 'Final Round',
  group_discussion: 'Group Discussion', other: 'Interview',
};

const platformLabels = {
  google_meet: 'Google Meet', microsoft_teams: 'Microsoft Teams', zoom: 'Zoom', custom: 'Meeting Link',
};

export default function CandidateInterviewSection({ userEmail }) {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [tab, setTab] = useState('upcoming');

  useEffect(() => { loadInterviews(); }, [userEmail]);

  const loadInterviews = async () => {
    setLoading(true);
    const data = await api.entities.Interview.filter({ candidate_email: userEmail }, '-date', 100);
    setInterviews(data);
    setLoading(false);
  };

  const today = new Date().toISOString().split('T')[0];
  const upcoming = interviews.filter(i => i.date >= today && i.status !== 'cancelled' && i.status !== 'completed');
  const past = interviews.filter(i => i.date < today || i.status === 'completed' || i.status === 'cancelled');
  const displayed = tab === 'upcoming' ? upcoming : past;

  const isJoinable = (iv) => {
    if (!iv.meeting_link || iv.status === 'cancelled') return false;
    const interviewDateTime = new Date(`${iv.date}T${iv.start_time}`);
    const now = new Date();
    const diffMin = (interviewDateTime - now) / 60000;
    return diffMin <= 30 && diffMin > -(iv.duration || 60);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div>
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 mb-5">
        <div className="bg-green-50 border border-green-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-green-700">{upcoming.length}</div>
          <div className="text-xs text-green-600 font-medium mt-0.5">Upcoming</div>
        </div>
        <div className="bg-gray-50 border border-gray-100 rounded-2xl p-4 text-center">
          <div className="text-2xl font-bold text-gray-700">{interviews.length}</div>
          <div className="text-xs text-gray-500 font-medium mt-0.5">Total</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab('upcoming')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'upcoming' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Upcoming ({upcoming.length})
        </button>
        <button onClick={() => setTab('past')}
          className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${tab === 'past' ? 'bg-blue-600 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'}`}>
          Past ({past.length})
        </button>
      </div>

      {/* Interview cards */}
      {displayed.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 text-center">
          <Calendar className="w-10 h-10 text-gray-200 mx-auto mb-3" />
          <p className="text-gray-500 text-sm">{tab === 'upcoming' ? 'No upcoming interviews scheduled.' : 'No past interviews yet.'}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {displayed.map(iv => {
            const joinable = isJoinable(iv);
            return (
              <div key={iv.id} className={`bg-white rounded-2xl border-2 p-5 transition-all hover:shadow-md ${statusColors[iv.status] || 'border-gray-200'}`}>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    {/* Header */}
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`text-xs font-bold px-2.5 py-1 rounded-full border capitalize ${statusColors[iv.status] || 'bg-gray-100 text-gray-600 border-gray-200'}`}>
                        {iv.status}
                      </span>
                      <span className="text-xs bg-purple-50 text-purple-700 border border-purple-200 font-semibold px-2.5 py-1 rounded-full">
                        {typeLabels[iv.interview_type] || 'Interview'}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900">{iv.job_title || 'Position'}</h3>
                    {iv.employer_org && (
                      <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-0.5">
                        <Building2 className="w-3.5 h-3.5" /> {iv.employer_org}
                      </div>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5 text-gray-400" />{iv.date}</span>
                      <span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-gray-400" />{iv.start_time} · {iv.duration} min</span>
                    </div>

                    {/* Meeting link */}
                    {iv.meeting_link && iv.status !== 'cancelled' && (
                      <div className={`mt-3 flex items-center gap-2 p-2.5 rounded-xl ${joinable ? 'bg-green-50 border border-green-200' : 'bg-gray-50 border border-gray-200'}`}>
                        <Video className={`w-4 h-4 shrink-0 ${joinable ? 'text-green-600' : 'text-gray-400'}`} />
                        <span className="text-xs text-gray-600">{platformLabels[iv.meeting_platform] || 'Meeting'}</span>
                        <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer"
                          className={`ml-auto flex items-center gap-1 text-xs font-bold px-3 py-1.5 rounded-lg shrink-0 ${joinable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-200 text-gray-600 hover:bg-gray-300'}`}>
                          <ExternalLink className="w-3 h-3" /> {joinable ? 'Join Now' : 'Meeting Link'}
                        </a>
                      </div>
                    )}

                    {iv.notes && (
                      <p className="text-xs text-gray-500 mt-2 italic">{iv.notes}</p>
                    )}
                  </div>

                  <button onClick={() => setSelectedInterview(iv)}
                    className="text-xs text-gray-400 hover:text-gray-600 font-medium shrink-0">
                    Details
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {selectedInterview && (
        <InterviewDetailModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdated={() => loadInterviews()}
          viewerRole="candidate"
        />
      )}
    </div>
  );
}