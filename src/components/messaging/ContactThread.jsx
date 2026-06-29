import React, { useEffect, useRef, useState } from 'react';
import { Send, Loader2, ShieldCheck, User as UserIcon } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { ContactReply, ContactMessage } from '@/lib/supabase/extra-entities';

const ACCENT = '#4F46E5';

function formatTime(ts) {
  if (!ts) return '';
  try {
    return new Date(ts).toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' });
  } catch {
    return ts;
  }
}

/**
 * Threaded message view with reply input.
 * role: 'admin' | 'user'
 */
export default function ContactThread({ message, role, senderName, onUpdated }) {
  const [replies, setReplies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const endRef = useRef(null);

  const load = async () => {
    if (!message?.id) return;
    setLoading(true);
    try {
      const list = await ContactReply.listForMessage(message.id);
      setReplies(list);
      // mark as read for current role
      if (role === 'admin' && message.unread_for_admin) {
        await ContactMessage.update(message.id, { unread_for_admin: false }).catch(() => {});
      } else if (role === 'user' && message.unread_for_user) {
        await ContactMessage.update(message.id, { unread_for_user: false }).catch(() => {});
      }
    } finally {
      setLoading(false);
      setTimeout(() => endRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    }
  };

  useEffect(() => { load(); /* eslint-disable-next-line */ }, [message?.id]);

  const handleSend = async () => {
    const text = body.trim();
    if (!text || sending) return;
    setSending(true);
    try {
      await ContactReply.send({ messageId: message.id, body: text, role, senderName });
      setBody('');
      await load();
      onUpdated && onUpdated();
    } catch (err) {
      alert(err.message || 'Failed to send reply');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-gray-200 overflow-hidden">
      <div className="px-5 py-4 border-b bg-gray-50">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-bold text-gray-900 truncate">{message.subject || '(no subject)'}</h3>
            <p className="text-xs text-gray-500 mt-0.5 truncate">
              {message.name} &middot; {message.email} &middot; {formatTime(message.created_at || message.created_date)}
            </p>
          </div>
          {message.status && (
            <span className="text-[10px] uppercase tracking-wide font-semibold px-2 py-1 rounded-full bg-indigo-50 text-indigo-700 shrink-0">
              {message.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 px-5 py-4 space-y-3 max-h-[480px] overflow-y-auto bg-white">
        {/* original message */}
        <Bubble
          side="left"
          fromRole="user"
          name={message.name || message.email}
          time={message.created_at || message.created_date}
          body={message.message}
          viewerRole={role}
        />
        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-gray-400" /></div>
        ) : (
          replies.map((r) => (
            <Bubble
              key={r.id}
              side={r.sender_role === role ? 'right' : 'left'}
              fromRole={r.sender_role}
              name={r.sender_name || (r.sender_role === 'admin' ? 'Admin' : 'User')}
              time={r.created_at}
              body={r.body}
              viewerRole={role}
            />
          ))
        )}
        <div ref={endRef} />
      </div>

      <div className="border-t bg-gray-50 px-4 py-3">
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={role === 'admin' ? 'Reply to this employer…' : 'Reply to admin…'}
          className="min-h-[80px] rounded-xl bg-white"
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') handleSend();
          }}
        />
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11px] text-gray-400">Cmd/Ctrl + Enter to send</span>
          <button
            onClick={handleSend}
            disabled={sending || !body.trim()}
            className="inline-flex items-center gap-2 text-white text-sm font-semibold px-4 py-2 rounded-xl disabled:opacity-50"
            style={{ background: ACCENT }}
          >
            {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            {sending ? 'Sending…' : 'Send reply'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Bubble({ side, fromRole, name, time, body }) {
  const isAdmin = fromRole === 'admin';
  const Icon = isAdmin ? ShieldCheck : UserIcon;
  return (
    <div className={`flex ${side === 'right' ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] ${side === 'right' ? 'items-end' : 'items-start'} flex flex-col`}>
        <div className="flex items-center gap-1.5 text-[11px] text-gray-500 mb-1 px-1">
          <Icon className="w-3 h-3" />
          <span className="font-medium">{name}</span>
          <span>· {formatTime(time)}</span>
        </div>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm whitespace-pre-wrap break-words ${
            isAdmin
              ? 'bg-indigo-600 text-white rounded-bl-sm'
              : 'bg-gray-100 text-gray-900 rounded-br-sm'
          } ${side === 'right' ? '!rounded-br-sm !rounded-bl-2xl' : '!rounded-bl-sm !rounded-br-2xl'}`}
        >
          {body}
        </div>
      </div>
    </div>
  );
}
