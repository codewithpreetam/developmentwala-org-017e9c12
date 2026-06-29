import React, { useEffect, useState } from 'react';
import { Bell, Loader2, ExternalLink, CheckCheck } from 'lucide-react';
import { Link } from '@/lib/router-adapter';
import { base44 } from '@/api/base44Client';

const PAGE = 20;

export default function NotificationsPanel({ userEmail, role }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(PAGE);

  const load = async () => {
    setLoading(true);
    try {
      const data = await base44.entities.Notification.filter({ user_email: userEmail }, '-created_date', 200);
      setItems(data || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (userEmail) load(); /* eslint-disable-next-line */ }, [userEmail]);

  const markAll = async () => {
    const unread = items.filter(n => !n.read);
    if (unread.length === 0) return;
    await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true }).catch(() => null)));
    setItems(prev => prev.map(n => ({ ...n, read: true })));
  };

  const markOne = async (id) => {
    await base44.entities.Notification.update(id, { read: true }).catch(() => null);
    setItems(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const unread = items.filter(n => !n.read).length;
  const visible = items.slice(0, count);

  return (
    <div className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b">
        <div>
          <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
          <p className="text-xs text-gray-500 mt-0.5">{items.length} total · {unread} unread</p>
        </div>
        {unread > 0 && (
          <button onClick={markAll} className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 hover:text-indigo-700 px-3 py-1.5 rounded-lg hover:bg-indigo-50">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-gray-400" /></div>
      ) : items.length === 0 ? (
        <div className="text-center py-14 px-6 text-gray-400">
          <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
          <p className="text-sm">No notifications yet</p>
        </div>
      ) : (
        <>
          <div className="divide-y divide-gray-100">
            {visible.map(n => (
              <div key={n.id} onClick={() => !n.read && markOne(n.id)}
                className={`flex gap-3 px-5 py-4 cursor-pointer hover:bg-gray-50 transition ${!n.read ? 'bg-indigo-50/40' : ''}`}>
                <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${!n.read ? 'bg-indigo-500' : 'bg-transparent'}`} />
                <div className="flex-1 min-w-0">
                  {n.title && <p className="text-sm font-semibold text-gray-900">{n.title}</p>}
                  <p className="text-sm text-gray-600 mt-0.5 whitespace-pre-wrap break-words">{n.message}</p>
                  <p className="text-xs text-gray-400 mt-1.5">
                    {n.created_date ? new Date(n.created_date).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : ''}
                    {n.type ? ` · ${n.type.replace(/_/g, ' ')}` : ''}
                  </p>
                </div>
                {n.link && (
                  <Link to={n.link} className="shrink-0 mt-1 p-1 text-indigo-400 hover:text-indigo-600">
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            ))}
          </div>
          {count < items.length && (
            <div className="p-4 border-t">
              <button onClick={() => setCount(c => c + PAGE)} className="w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
                View More ({items.length - count} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
