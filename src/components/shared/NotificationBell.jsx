import React, { useState, useEffect, useRef } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Bell, X, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { format } from 'date-fns';

const JOB_SEEKER_TYPES = ['status_applied', 'status_reviewing', 'status_shortlisted', 'status_interview', 'status_selected', 'status_rejected', 'application'];
const EMPLOYER_TYPES = ['approval', 'rejection', 'opportunity_live', 'opportunity_paused', 'opportunity_expired'];

function isRelevant(notification, userRole) {
  if (!userRole) return true;
  if (userRole === 'job_seeker') return !notification.type || notification.type.startsWith('status_') || JOB_SEEKER_TYPES.includes(notification.type);
  if (userRole === 'employer') return !notification.type || EMPLOYER_TYPES.includes(notification.type);
  return true;
}

export default function NotificationBell({ userEmail, userRole }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading: loading } = useQuery({
    queryKey: ['notifications', userEmail],
    queryFn: async () => {
      const data = await base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 50);
      return data.filter(n => isRelevant(n, userRole));
    },
    enabled: !!userEmail,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    const handleClick = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const markAllRead = async () => {
    const unread = notifications.filter(n => !n.read);
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    queryClient.setQueryData(['notifications', userEmail], prev => (prev || []).map(n => ({ ...n, read: true })));
  };

  const markRead = async (id) => {
    await base44.entities.Notification.update(id, { read: true });
    queryClient.setQueryData(['notifications', userEmail], prev => (prev || []).map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="relative p-2 rounded-xl hover:bg-gray-100 text-gray-600 transition-colors"
        title="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white border border-gray-200 rounded-2xl shadow-2xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-gray-600" />
              <span className="font-bold text-gray-900 text-sm">Notifications</span>
              {unreadCount > 0 && <span className="text-xs bg-red-100 text-red-700 px-1.5 py-0.5 rounded-full font-semibold">{unreadCount} new</span>}
            </div>
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <button onClick={markAllRead} className="text-xs text-blue-600 hover:underline font-medium">Mark all read</button>
              )}
              <button onClick={() => setOpen(false)} className="p-1 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4 text-gray-400" /></button>
            </div>
          </div>

          <div className="max-h-80 overflow-y-auto divide-y divide-gray-50">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="text-center py-10 text-gray-400">
                <Bell className="w-8 h-8 mx-auto mb-2 opacity-30" />
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => (
                <div key={n.id} onClick={() => markRead(n.id)}
                  className={`flex gap-3 px-4 py-3 cursor-pointer hover:bg-gray-50 transition-colors ${!n.read ? 'bg-blue-50/50' : ''}`}>
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-blue-500' : 'bg-transparent'}`} />
                  <div className="flex-1 min-w-0">
                    {n.title && <p className="text-sm font-semibold text-gray-900 leading-tight">{n.title}</p>}
                    <p className="text-xs text-gray-600 mt-0.5 leading-relaxed">{n.message}</p>
                    <p className="text-xs text-gray-400 mt-1">{n.created_date ? format(new Date(n.created_date), 'dd MMM yyyy · HH:mm') : ''}</p>
                  </div>
                  {n.link && (
                    <Link to={n.link} className="shrink-0 mt-1 p-1 text-blue-400 hover:text-blue-600" title="Go to">
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  )}
                </div>
              ))
            )}
          </div>

          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-gray-100 text-center">
              <Link to={createPageUrl(userRole === 'employer' ? 'EmployerDashboard' : 'CandidateDashboard')}
                onClick={() => setOpen(false)} className="text-xs text-blue-600 hover:underline font-medium">
                View all notifications
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}