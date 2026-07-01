import React from 'react';
import { api } from '@/api/apiClient';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function EventDetail() {
  const getStructuredData = (item) => ({
    '@context': 'https://schema.org',
    '@type': 'Event',
    name: item.title,
    description: item.description?.replace(/[#*_]/g, '').substring(0, 300),
    startDate: item.event_date,
    endDate: item.event_end_date || item.event_date,
    location: item.location_type === 'online'
      ? { '@type': 'VirtualLocation', url: item.registration_link }
      : { '@type': 'Place', name: item.location, address: { '@type': 'PostalAddress', addressLocality: item.location, addressCountry: item.country || 'IN' } },
    organizer: { '@type': 'Organization', name: item.organizer_name || 'DevelopmentWala.org' },
    url: item.registration_link,
    isAccessibleForFree: item.is_free,
  });

  return (
    <EntityDetailPage
      entity={api.entities.Event}
      listingPage="Events"
      typeLabel="Event"
      accentColor="pink"
      primaryAction="Register for this Event"
      getStructuredData={getStructuredData}
    />
  );
}