import { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';

// Module-level cache so settings are only fetched once per session
let cache = null;
let listeners = [];

function notify(settings) {
  listeners.forEach(fn => fn(settings));
}

export async function refreshSiteSettings() {
  const items = await api.entities.SiteSettings.list();
  cache = items[0] || null;
  notify(cache);
  return cache;
}

export function useSiteSettings() {
  const [settings, setSettings] = useState(cache);

  useEffect(() => {
    listeners.push(setSettings);
    if (!cache) {
      refreshSiteSettings().catch(() => {});
    }
    return () => {
      listeners = listeners.filter(fn => fn !== setSettings);
    };
  }, []);

  return settings;
}