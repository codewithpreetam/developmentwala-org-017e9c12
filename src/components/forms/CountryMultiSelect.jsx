import React, { useState } from 'react';
import { X } from 'lucide-react';
import CountrySelect from './CountrySelect';
import { countryOptions, formatCountryList, parseCountryList } from './countries';

export default function CountryMultiSelect({ value, onChange, className = 'h-11 rounded-xl' }) {
  const [pickerKey, setPickerKey] = useState(0);
  const selected = parseCountryList(value);
  const available = countryOptions.filter((c) => !selected.includes(c.value));

  const addCountry = (country) => {
    if (!country || selected.includes(country)) return;
    onChange(formatCountryList([...selected, country]));
    setPickerKey((k) => k + 1);
  };

  const removeCountry = (country) => {
    onChange(formatCountryList(selected.filter((c) => c !== country)));
  };

  return (
    <div className="space-y-2">
      <CountrySelect
        key={pickerKey}
        value={undefined}
        onChange={addCountry}
        placeholder={selected.length ? 'Add another country' : 'Select countries'}
        className={className}
      />
      {available.length === 0 && selected.length > 0 && (
        <p className="text-xs text-gray-400">All countries from the list are selected.</p>
      )}
      {selected.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selected.map((country) => (
            <span key={country} className="inline-flex items-center gap-1 text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100 px-2.5 py-1 rounded-full">
              {country}
              <button type="button" onClick={() => removeCountry(country)} className="hover:text-indigo-900" aria-label={`Remove ${country}`}>
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
