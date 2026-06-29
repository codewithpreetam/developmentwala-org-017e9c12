import React, { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Calendar, List, Plus, Video, Clock, User, ChevronRight } from 'lucide-react';
import InterviewCalendar from './InterviewCalendar';
import CreateInterviewModal from './CreateInterviewModal';
import InterviewDetailModal from './InterviewDetailModal';

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

export default function EmployerInterviewPanel({ employerEmail, orgName, allApplicants = [], prefillApp = null, onPrefillConsumed }) {
  const queryClient = useQueryClient();
  const shortlistedApplicants = allApplicants.filter(a => ['shortlisted', 'interview'].includes(a.status));
  const [view, setView] = useState('calendar');
  const [showCreate, setShowCreate] = useState(false);
  const [pendingPrefill, setPendingPrefill] = useState(null);
  const [selectedInterview, setSelectedInterview] = useState(null);
  const [filter, setFilter] = useState('upcoming');

  // Auto-open the schedule modal when an applicant prefill is passed in
  useEffect(() => {
    if (prefillApp) {
      setPendingPrefill(prefillApp);
      setShowCreate(true);
      if (onPrefillConsumed) onPrefillConsumed();
    }
  }, [prefillApp]);


  const { data: interviews = [], isLoading: loading } = useQuery({
    queryKey: ['interviews', employerEmail],
    queryFn: () => base44.entities.Interview.filter({ employer_email: employerEmail }, '-date', 200),
    enabled: !!employerEmail,
    staleTime: 30000,
  });

  const loadInterviews = () => queryClient.invalidateQueries({ queryKey: ['interviews', employerEmail] });

  const today = new Date().toISOString().split('T')[0];
  const filtered = interviews.filter(i => {
    if (filter === 'upcoming') return i.date >= today && i.status !== 'cancelled' && i.status !== 'completed';
    if (filter === 'cancelled') return i.status === 'cancelled';
    return true;
  });

  const upcoming = interviews.filter(i => i.date >= today && i.status === 'confirmed').slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center py-16">
      <div className="w-7 h-7 border-2 border-green-600 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Interview Management</h2>
          <p className="text-sm text-gray-500 mt-0.5">{interviews.filter(i => i.date >= today && i.status === 'confirmed').length} upcoming · {interviews.length} total</p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button onClick={() => setView('calendar')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'calendar' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <Calendar className="w-3.5 h-3.5" /> Calendar
            </button>
            <button onClick={() => setView('list')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${view === 'list' ? 'bg-white shadow-sm text-gray-900' : 'text-gray-500'}`}>
              <List className="w-3.5 h-3.5" /> List
            </button>
          </div>
          <button onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-4 py-2 rounded-xl transition-colors">
            <Plus className="w-4 h-4" /> Schedule Interview
          </button>
        </div>
      </div>

      {/* Upcoming quick-strip */}
      {upcoming.length > 0 && (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-4">
          <p className="text-xs font-bold text-indigo-700 uppercase tracking-wider mb-3">Next Up</p>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {upcoming.map(iv => (
              <button key={iv.id} onClick={() => setSelectedInterview(iv)}
                className="shrink-0 bg-white rounded-xl border border-indigo-200 p-3 text-left hover:shadow-md transition-all min-w-[180px]">
                <div className="text-xs font-bold text-gray-700 truncate">{iv.candidate_name || iv.candidate_email}</div>
                <div className="text-xs text-gray-500 mt-1">{iv.date} · {iv.start_time}</div>
                <div className="text-xs text-indigo-600 font-medium mt-1">{typeLabels[iv.interview_type] || 'Interview'}</div>
                {iv.meeting_link && (
                  <a href={iv.meeting_link} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()}
                    className="mt-2 flex items-center gap-1 text-xs bg-indigo-600 text-white px-2.5 py-1 rounded-lg font-medium w-fit hover:bg-indigo-700">
                    <Video className="w-3 h-3" /> Join
                  </a>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Calendar / List view */}
      {view === 'calendar' ? (
        <InterviewCalendar interviews={interviews} onInterviewClick={setSelectedInterview} />
      ) : (
        <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
          {/* Filter tabs */}
          <div className="flex border-b border-gray-100">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'all', label: 'All' },
              { id: 'cancelled', label: 'Cancelled' },
            ].map(f => (
              <button key={f.id} onClick={() => setFilter(f.id)}
                className={`px-5 py-3 text-sm font-medium border-b-2 transition-colors ${filter === f.id ? 'border-indigo-600 text-indigo-700' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>
                {f.label}
              </button>
            ))}
          </div>
          <div className="divide-y divide-gray-100">
            {filtered.length === 0 ? (
              <div className="py-14 text-center text-gray-400">
                <Calendar className="w-10 h-10 mx-auto mb-3 opacity-30" />
                <p className="text-sm">No interviews found</p>
              </div>
            ) : (
              filtered.map(iv => (
                <button key={iv.id} onClick={() => setSelectedInterview(iv)}
                  className="w-full flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors text-left">
                  <div className="w-12 h-12 bg-gray-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                    <span className="text-xs font-bold text-gray-700">{iv.date ? new Date(iv.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }).split(' ').reverse().join('\n') : '—'}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-900 text-sm">{iv.candidate_name || iv.candidate_email}</div>
                    <div className="text-xs text-gray-500 mt-0.5">{iv.job_title} · {typeLabels[iv.interview_type] || 'Interview'}</div>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="flex items-center gap-1 text-xs text-gray-400"><Clock className="w-3 h-3" />{iv.start_time} · {iv.duration} min</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${statusColors[iv.status] || statusColors.confirmed}`}>
                      {iv.status}
                    </span>
                    <ChevronRight className="w-4 h-4 text-gray-300" />
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}

      {showCreate && (
        <CreateInterviewModal
          onClose={() => setShowCreate(false)}
          onCreated={() => loadInterviews()}
          employerEmail={employerEmail}
          orgName={orgName}
          shortlistedApplicants={shortlistedApplicants}
        />
      )}

      {selectedInterview && (
        <InterviewDetailModal
          interview={selectedInterview}
          onClose={() => setSelectedInterview(null)}
          onUpdated={() => loadInterviews()}
          viewerRole="employer"
        />
      )}
    </div>
  );
}