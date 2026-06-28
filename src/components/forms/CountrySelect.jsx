import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { countryOptions } from './countries';

const EMPTY_VALUE = '__all__';

export default function CountrySelect({
  value,
  onChange,
  placeholder = 'Select country',
  className = 'h-11 rounded-xl',
  allowEmpty = false,
  emptyLabel = 'All Countries',
}) {
  const selectValue = allowEmpty ? (value || EMPTY_VALUE) : (value || undefined);

  const handleChange = (next) => {
    if (allowEmpty && next === EMPTY_VALUE) onChange('');
    else onChange(next);
  };

  return (
    <Select value={selectValue} onValueChange={handleChange}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {allowEmpty && <SelectItem value={EMPTY_VALUE}>{emptyLabel}</SelectItem>}
        {countryOptions.map((c) => (
          <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
