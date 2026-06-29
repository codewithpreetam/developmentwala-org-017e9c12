import React, { useMemo, useState, useEffect } from 'react';
import { MessageSquare, Inbox, Search, Trash2, CheckCheck } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ContactMessage } from '@/lib/supabase/extra-entities';
import { useAuth } from '@/components/auth/AuthContext';
import ContactThread from './ContactThread';

const STATUSES = [
  { value: 'all', label: 'All' },
  { value: 'new', label: 'New' },
  { value: 'awaiting_admin', label: 'Awaiting reply' },
  { value: 'awaiting_user', label: 'Sent' },
  { value: 'closed', label: 'Closed' },
];

export default function AdminMessagesPanel({ contacts, onChanged }) {
  const { user } = useAuth();
  const [selectedId, setSelectedId] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const sorted = useMemo(() => {
    return [...(contacts || [])].sort((a, b) => {
      const ta = new Date(a.last_reply_at || a.created_at || a.created_date || 0).getTime();
      const tb = new Date(b.last_reply_at || b.created_at || b.created_date || 0).getTime();
      return tb - ta;
    });
  }, [contacts]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return sorted.filter((m) => {
      if (statusFilter !== 'all' && (m.status || 'new') !== statusFilter) return false;
      if (!q) return true;
      return [m.name, m.email, m.subject, m.message]
        .filter(Boolean).some((v) => String(v).toLowerCase().includes(q));
    });
  }, [sorted, search, statusFilter]);

  useEffect(() => {
    if (!selectedId && filtered.length) setSelectedId(filtered[0].id);
  }, [filtered, selectedId]);

  const selected = filtered.find((m) => m.id === selectedId) || sorted.find((m) => m.id === selectedId);
  const unreadCount = sorted.filter((m) => m.unread_for_admin).length;

  const handleDelete = async (id) => {
    if (!confirm('Delete this conversation?')) return;
    await ContactMessage.delete(id);
    if (selectedId === id) setSelectedId(null);
    onChanged && onChanged();
  };

  const handleClose = async (id) => {
    await ContactMessage.update(id, { status: 'closed' });
    onChanged && onChanged();
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-5 flex-wrap gap-2">
        <h2 className="font-bold text-xl text-gray-900">
          Messages <span className="text-gray-400 font-normal">({sorted.length})</span>
          {unreadCount > 0 && (
            <span className="ml-2 text-xs bg-indigo-600 text-white px-2 py-0.5 rounded-full align-middle">
              {unreadCount} new
            </span>
          )}
        </h2>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[340px_1fr] gap-4">
        <aside className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-3 border-b space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by name, email, subject…"
                className="pl-9 h-10 rounded-xl"
              />
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {STATUSES.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setStatusFilter(s.value)}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-full whitespace-nowrap transition ${
                    statusFilter === s.value
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>
          <div className="max-h-[640px] overflow-y-auto">
            {filtered.length === 0 ? (
              <div className="text-center py-12 px-4 text-gray-400">
                <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-sm">No conversations.</p>
              </div>
            ) : (
              filtered.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedId(m.id)}
                  className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${
                    selectedId === m.id ? 'bg-indigo-50/60' : ''
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-semibold text-sm text-gray-900 truncate">{m.name}</p>
                    {m.unread_for_admin && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                  </div>
                  <p className="text-xs text-gray-500 truncate">{m.email}</p>
                  <p className="text-xs text-gray-700 truncate mt-1 font-medium">{m.subject || '(no subject)'}</p>
                  <p className="text-[10px] text-gray-400 mt-1">
                    {new Date(m.last_reply_at || m.created_at || m.created_date).toLocaleString(undefined, { dateStyle: 'short', timeStyle: 'short' })}
                    {' · '}{(m.status || 'new').replace('_', ' ')}
                  </p>
                </button>
              ))
            )}
          </div>
        </aside>

        <section>
          {selected ? (
            <div className="space-y-3">
              <div className="flex items-center justify-end gap-2">
                <button
                  onClick={() => handleClose(selected.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  <CheckCheck className="w-3.5 h-3.5" /> Mark closed
                </button>
                <button
                  onClick={() => handleDelete(selected.id)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
              <ContactThread
                message={selected}
                role="admin"
                senderName={user?.full_name || 'Admin'}
                onUpdated={onChanged}
              />
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-gray-500">
              <MessageSquare className="w-8 h-8 mx-auto mb-2 opacity-40" />
              Select a conversation to view and reply.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
