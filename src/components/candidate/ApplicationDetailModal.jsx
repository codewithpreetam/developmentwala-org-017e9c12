import React from 'react';
import { X, Clock, Star, MessageCircle, CheckCircle2, XCircle, FileText, Building2, Calendar, ChevronRight } from 'lucide-react';

const statusInfo = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: Clock },
  reviewing: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  shortlisted: { label: 'Shortlisted', color: 'bg-indigo-100 text-indigo-700', icon: Star },
  interview: { label: 'Interview Scheduled', color: 'bg-purple-100 text-purple-700', icon: MessageCircle },
  selected: { label: 'Selected / Hired', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const statusColors = {
  applied: 'border-blue-300 bg-blue-50',
  reviewing: 'border-yellow-300 bg-yellow-50',
  shortlisted: 'border-indigo-300 bg-indigo-50',
  interview: 'border-purple-300 bg-purple-50',
  selected: 'border-green-300 bg-green-50',
  rejected: 'border-red-300 bg-red-50',
};

export default function ApplicationDetailModal({ app, onClose }) {
  const status = statusInfo[app.status] || statusInfo.applied;
  const StatusIcon = status.icon;
  const history = Array.isArray(app.status_history) ? app.status_history : [];

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
      <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100">
          <div>
            <h3 className="font-bold text-gray-900 text-lg">Application Details</h3>
            <p className="text-sm text-gray-500 mt-0.5">{app.opportunity_title}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div className={`flex items-center gap-3 p-4 rounded-xl border-2 ${statusColors[app.status] || 'border-gray-200 bg-gray-50'}`}>
            <StatusIcon className="w-6 h-6 shrink-0" />
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Current Status</p>
              <p className="font-bold text-gray-900 text-base">{status.label}</p>
            </div>
          </div>

          {/* Opportunity Info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-2">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Opportunity Details</p>
            <div className="flex items-center gap-2 text-sm text-gray-700">
              <FileText className="w-4 h-4 text-gray-400 shrink-0" />
              <span className="font-semibold">{app.opportunity_title}</span>
            </div>
            {app.organization && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Building2 className="w-4 h-4 text-gray-400 shrink-0" />
                <span>{app.organization}</span>
              </div>
            )}
            {app.opportunity_type && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <ChevronRight className="w-4 h-4 text-gray-400 shrink-0" />
                <span className="capitalize">{app.opportunity_type}</span>
              </div>
            )}
            {app.created_date && (
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
                <span>Applied on {new Date(app.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
              </div>
            )}
          </div>

          {/* Cover Letter */}
          {app.cover_letter && (
            <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
              <p className="text-xs font-bold text-yellow-700 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5" /> Your Cover Letter
              </p>
              <p className="text-sm text-yellow-900 leading-relaxed whitespace-pre-line">{app.cover_letter}</p>
            </div>
          )}

          {/* Status History / Update Log */}
          <div>
            <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Status History & Employer Messages</p>
            {history.length === 0 ? (
              <div className="text-center py-6 bg-gray-50 rounded-xl border border-gray-100">
                <Clock className="w-8 h-8 text-gray-200 mx-auto mb-2" />
                <p className="text-sm text-gray-400">No status updates from employer yet.</p>
              </div>
            ) : (
              <div className="relative">
                {/* Timeline */}
                <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gray-200" />
                <div className="space-y-4 pl-10">
                  {[...history].reverse().map((entry, idx) => {
                    const entryStatus = statusInfo[entry.status] || statusInfo.applied;
                    const EntryIcon = entryStatus.icon;
                    return (
                      <div key={idx} className="relative">
                        {/* Timeline dot */}
                        <div className={`absolute -left-10 top-3 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${entryStatus.color.split(' ')[0]}`}>
                          <EntryIcon className="w-2.5 h-2.5" style={{ color: 'currentColor' }} />
                        </div>
                        <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
                          <div className="flex items-center justify-between mb-2">
                            <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${entryStatus.color}`}>{entryStatus.label}</span>
                            <span className="text-xs text-gray-400">
                              {entry.updated_at ? new Date(entry.updated_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : ''}
                            </span>
                          </div>
                          {entry.message && (
                            <p className="text-sm text-gray-700 leading-relaxed">{entry.message}</p>
                          )}
                          {entry.next_steps && (
                            <div className="mt-3 bg-blue-50 rounded-lg p-3 border border-blue-100">
                              <p className="text-xs font-bold text-blue-600 mb-1">Next Steps</p>
                              <p className="text-sm text-blue-900">{entry.next_steps}</p>
                            </div>
                          )}
                          {entry.updated_by && (
                            <p className="text-xs text-gray-400 mt-2">— {entry.updated_by}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button onClick={onClose} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold py-3 rounded-xl transition-colors">
            Close
          </button>
        </div>
      </div>
    </div>
  );
}