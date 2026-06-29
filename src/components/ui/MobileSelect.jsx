import React, { useState } from 'react';
import { Check, ChevronDown } from 'lucide-react';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const ALL_VALUE = '__all__';

const toSelectValue = (value) => (value === '' || value == null ? ALL_VALUE : String(value));
const fromSelectValue = (value) => (value === ALL_VALUE ? '' : value);

/**
 * Drop-in mobile-aware select.
 * On mobile (< 768px): renders a bottom-sheet Drawer.
 * On desktop: renders the standard Radix Select.
 *
 * Props:
 *   value, onValueChange, placeholder — same as Select
 *   options — [{ value: string, label: string }]
 *   className — forwarded to trigger
 *   title — optional drawer header title (defaults to placeholder)
 */
export default function MobileSelect({ value, onValueChange, placeholder, options = [], className, title }) {
  const [open, setOpen] = useState(false);
  const [isMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  const selectedLabel = options.find(o => String(o.value) === String(value))?.label;
  const normalizedDesktopValue = value === '' || value == null ? '' : String(value);

  if (!isMobile) {
    return (
      <Select value={normalizedDesktopValue} onValueChange={(v) => onValueChange(fromSelectValue(v))}>
        <SelectTrigger className={className}>
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {options.map(o => (
            <SelectItem key={toSelectValue(o.value)} value={toSelectValue(o.value)}>{o.label}</SelectItem>
          ))}
        </SelectContent>
      </Select>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={`flex items-center justify-between w-full px-3 rounded-xl border border-gray-200 bg-white text-sm h-9 ${className || ''}`}
      >
        <span className={selectedLabel ? 'text-gray-900' : 'text-gray-400 truncate'}>
          {selectedLabel || placeholder || 'Select...'}
        </span>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle>{title || placeholder || 'Select an option'}</DrawerTitle>
          </DrawerHeader>
          <div className="pb-safe overflow-y-auto max-h-[60vh] px-2 pb-4">
            {options.map(o => (
              <button
                key={String(o.value)}
                type="button"
                onClick={() => { onValueChange(o.value); setOpen(false); }}
                className={`w-full flex items-center justify-between px-4 py-3.5 rounded-xl text-sm font-medium transition-colors mb-0.5 ${
                  String(value) === String(o.value)
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-700 hover:bg-gray-50 active:bg-gray-100'
                }`}
              >
                <span>{o.label}</span>
                {String(value) === String(o.value) && <Check className="w-4 h-4 text-indigo-600 shrink-0" />}
              </button>
            ))}
          </div>
        </DrawerContent>
      </Drawer>
    </>
  );
}