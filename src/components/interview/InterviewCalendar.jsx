import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Video, Clock } from 'lucide-react';

const statusColors = {
  confirmed: 'bg-green-100 border-green-300 text-green-800',
  pending: 'bg-yellow-100 border-yellow-300 text-yellow-800',
  cancelled: 'bg-red-100 border-red-300 text-red-800',
  rescheduled: 'bg-blue-100 border-blue-300 text-blue-800',
  completed: 'bg-gray-100 border-gray-300 text-gray-600',
};

const statusDot = {
  confirmed: 'bg-green-500',
  pending: 'bg-yellow-500',
  cancelled: 'bg-red-500',
  rescheduled: 'bg-blue-500',
  completed: 'bg-gray-400',
};

const typeLabels = {
  hr_round: 'HR Round', technical_round: 'Technical', final_round: 'Final Round',
  group_discussion: 'GD', other: 'Interview',
};

function getWeekStart(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  d.setDate(diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export default function InterviewCalendar({ interviews, onInterviewClick }) {
  const [weekStart, setWeekStart] = useState(getWeekStart(new Date()));

  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(weekStart.getDate() + i);
    return d;
  });

  const prevWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() - 7); setWeekStart(d); };
  const nextWeek = () => { const d = new Date(weekStart); d.setDate(d.getDate() + 7); setWeekStart(d); };
  const goToday = () => setWeekStart(getWeekStart(new Date()));

  const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const getInterviewsForDay = (day) => {
    const dateStr = day.toISOString().split('T')[0];
    return interviews
      .filter(i => i.date === dateStr)
      .sort((a, b) => (a.start_time || '').localeCompare(b.start_time || ''));
  };

  const weekLabel = `${days[0].toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })} – ${days[6].toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}`;

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      {/* Calendar Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-3">
          <button onClick={prevWeek} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronLeft className="w-4 h-4 text-gray-500" />
          </button>
          <span className="font-semibold text-gray-900 text-sm">{weekLabel}</span>
          <button onClick={nextWeek} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
            <ChevronRight className="w-4 h-4 text-gray-500" />
          </button>
        </div>
        <button onClick={goToday} className="text-xs font-medium text-blue-600 hover:text-blue-700 px-3 py-1.5 rounded-lg hover:bg-blue-50 transition-colors">Today</button>
      </div>

      {/* Day columns */}
      <div className="grid grid-cols-7 divide-x divide-gray-100">
        {days.map((day, i) => {
          const isToday = day.getTime() === today.getTime();
          const dayInterviews = getInterviewsForDay(day);
          return (
            <div key={i} className={`min-h-[160px] ${isToday ? 'bg-blue-50/40' : ''}`}>
              {/* Day header */}
              <div className={`py-2.5 px-2 text-center border-b border-gray-100 ${isToday ? 'bg-blue-50' : ''}`}>
                <div className="text-xs text-gray-400 font-medium">{dayLabels[i]}</div>
                <div className={`text-base font-bold mt-0.5 w-8 h-8 flex items-center justify-center mx-auto rounded-full ${isToday ? 'bg-blue-600 text-white' : 'text-gray-800'}`}>
                  {day.getDate()}
                </div>
              </div>
              {/* Interviews */}
              <div className="p-1.5 space-y-1.5">
                {dayInterviews.map(interview => (
                  <button key={interview.id} onClick={() => onInterviewClick(interview)}
                    className={`w-full text-left rounded-lg border px-2 py-1.5 text-xs hover:shadow-md transition-all ${statusColors[interview.status] || statusColors.confirmed}`}>
                    <div className="flex items-center gap-1 mb-0.5">
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${statusDot[interview.status] || 'bg-green-500'}`} />
                      <span className="font-semibold truncate">{interview.start_time}</span>
                    </div>
                    <div className="truncate font-medium">{interview.candidate_name || interview.candidate_email}</div>
                    <div className="truncate text-gray-500">{typeLabels[interview.interview_type] || 'Interview'}</div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="px-5 py-3 border-t border-gray-100 flex items-center gap-4 flex-wrap">
        {Object.entries(statusDot).map(([status, cls]) => (
          <span key={status} className="flex items-center gap-1.5 text-xs text-gray-500 capitalize">
            <span className={`w-2 h-2 rounded-full ${cls}`} />
            {status}
          </span>
        ))}
      </div>
    </div>
  );
}