import React, { useEffect, useState, useCallback } from 'react';
import { Plus, MessageSquare, Loader2, Inbox } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ContactMessage } from '@/lib/supabase/extra-entities';
import ContactThread from './ContactThread';

const ACCENT = '#4F46E5';

export default function EmployerMessagingPanel({ user, orgName }) {
  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedId, setSelectedId] = useState(null);
  const [composing, setComposing] = useState(false);
  const [form, setForm] = useState({ subject: '', message: '' });
  const [sending, setSending] = useState(false);

  const load = useCallback(async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const list = await ContactMessage.listForUser(user.id);
      setThreads(list);
      if (list.length && !selectedId) setSelectedId(list[0].id);
      if (list.length === 0) setComposing(true);
    } finally {
      setLoading(false);
    }
  }, [user?.id, selectedId]);

  useEffect(() => { load(); }, [load]);

  const selected = threads.find((t) => t.id === selectedId);

  const submitNew = async () => {
    if (!form.subject.trim() || !form.message.trim() || sending) return;
    setSending(true);
    try {
      const created = await ContactMessage.create({
        name: orgName || user.full_name || user.email,
        email: user.email,
        subject: form.subject.trim(),
        message: form.message.trim(),
      });
      setForm({ subject: '', message: '' });
      setComposing(false);
      await load();
      setSelectedId(created.id);
    } catch (err) {
      alert(err.message || 'Failed to send message');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-5">
      {/* Threads list */}
      <aside className="bg-white rounded-2xl border border-gray-200 overflow-hidden">
        <div className="px-4 py-3 border-b flex items-center justify-between">
          <h3 className="font-bold text-gray-900 text-sm">My Conversations</h3>
          <button
            onClick={() => { setComposing(true); setSelectedId(null); }}
            className="inline-flex items-center gap-1 text-white text-xs font-semibold px-2.5 py-1.5 rounded-lg"
            style={{ background: ACCENT }}
          >
            <Plus className="w-3.5 h-3.5" /> New
          </button>
        </div>
        <div className="max-h-[600px] overflow-y-auto">
          {loading ? (
            <div className="flex justify-center py-10"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
          ) : threads.length === 0 ? (
            <div className="text-center py-10 px-4 text-gray-500 text-sm">
              <Inbox className="w-8 h-8 mx-auto mb-2 opacity-40" />
              No messages yet.
            </div>
          ) : (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => { setSelectedId(t.id); setComposing(false); }}
                className={`w-full text-left px-4 py-3 border-b hover:bg-gray-50 transition ${selectedId === t.id ? 'bg-indigo-50/60' : ''}`}
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-sm text-gray-900 truncate">{t.subject || '(no subject)'}</p>
                  {t.unread_for_user && <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0" />}
                </div>
                <p className="text-xs text-gray-500 truncate mt-0.5">{t.message}</p>
                <p className="text-[10px] text-gray-400 mt-1">
                  {new Date(t.last_reply_at || t.created_at).toLocaleDateString()} · {t.status?.replace('_', ' ') || 'new'}
                </p>
              </button>
            ))
          )}
        </div>
      </aside>

      {/* Detail / compose */}
      <section>
        {composing ? (
          <div className="bg-white rounded-2xl border border-gray-200 p-6">
            <h3 className="font-bold text-gray-900 mb-1">New message to Admin</h3>
            <p className="text-sm text-gray-500 mb-5">Need help with your organization or postings? Start a conversation.</p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                <Input value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))}
                  placeholder="What can we help you with?" className="h-11 rounded-xl" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                <Textarea value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                  placeholder="Describe your issue or question…" className="min-h-[140px] rounded-xl" />
              </div>
              <div className="flex items-center gap-2">
                <button onClick={submitNew} disabled={sending || !form.subject.trim() || !form.message.trim()}
                  className="text-white font-bold px-6 py-2.5 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                  style={{ background: ACCENT }}>
                  <MessageSquare className="w-4 h-4" /> {sending ? 'Sending…' : 'Send Message'}
                </button>
                {threads.length > 0 && (
                  <button onClick={() => { setComposing(false); setSelectedId(threads[0].id); }}
                    className="px-4 py-2.5 rounded-xl text-sm font-semibold text-gray-600 hover:bg-gray-100">
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </div>
        ) : selected ? (
          <ContactThread
            message={selected}
            role="user"
            senderName={orgName || user.full_name || user.email}
            onUpdated={load}
          />
        ) : (
          <div className="bg-white rounded-2xl border border-dashed p-10 text-center text-gray-500">
            Select a conversation or start a new one.
          </div>
        )}
      </section>
    </div>
  );
}
