import React, { useRef } from 'react';
import { Bold, Italic, Underline, List } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

/**
 * Cover letter textarea with a tiny formatting toolbar (Bold, Italic, Underline, Bullet list).
 * Stores the value as Markdown / HTML-ish text:
 *  - **bold**
 *  - *italic*
 *  - <u>underline</u>
 *  - "- " bullet lines
 */
export default function CoverLetterField({
  value,
  onChange,
  maxLength = 2000,
  placeholder = "Briefly introduce yourself and why you're a strong fit...",
  className = '',
  invalid = false,
}) {
  const ref = useRef(null);

  const wrap = (before, after = before) => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const selected = value.slice(start, end) || 'text';
    const next = value.slice(0, start) + before + selected + after + value.slice(end);
    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => {
      ta.focus();
      const pos = start + before.length + selected.length + after.length;
      ta.setSelectionRange(pos, pos);
    });
  };

  const bullet = () => {
    const ta = ref.current;
    if (!ta) return;
    const start = ta.selectionStart ?? value.length;
    const end = ta.selectionEnd ?? value.length;
    const before = value.slice(0, start);
    const selected = value.slice(start, end);
    const after = value.slice(end);
    const lines = (selected || 'List item').split('\n').map((l) => (l.startsWith('- ') ? l : `- ${l}`)).join('\n');
    const prefix = before.length === 0 || before.endsWith('\n') ? '' : '\n';
    const next = before + prefix + lines + after;
    onChange(next.slice(0, maxLength));
    requestAnimationFrame(() => ta.focus());
  };

  const Btn = ({ onClick, label, children }) => (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="w-8 h-8 inline-flex items-center justify-center rounded-md text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors"
    >
      {children}
    </button>
  );

  return (
    <div className={className}>
      <div className="flex items-center gap-1 border border-b-0 border-gray-200 rounded-t-xl px-2 py-1 bg-gray-50">
        <Btn label="Bold" onClick={() => wrap('**')}><Bold className="w-4 h-4" /></Btn>
        <Btn label="Italic" onClick={() => wrap('*')}><Italic className="w-4 h-4" /></Btn>
        <Btn label="Underline" onClick={() => wrap('<u>', '</u>')}><Underline className="w-4 h-4" /></Btn>
        <Btn label="Bullet list" onClick={bullet}><List className="w-4 h-4" /></Btn>
        <span className="ml-auto text-[11px] text-gray-400 pr-1">Markdown supported</span>
      </div>
      <Textarea
        ref={ref}
        value={value}
        onChange={(e) => onChange(e.target.value.slice(0, maxLength))}
        placeholder={placeholder}
        maxLength={maxLength}
        aria-invalid={invalid}
        className={`min-h-[180px] rounded-t-none rounded-b-xl border-t-0 ${invalid ? 'border-red-400 focus-visible:ring-red-400' : 'border-gray-200'}`}
      />
    </div>
  );
}
