import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityListPage from '../components/opportunities/EntityListPage';
import { sectorOptions } from '../components/forms/formOptions';

const filters = [
  { key: 'event_category', label: 'Category', type: 'select', options: [
    { value: 'conference', label: 'Conference' }, { value: 'webinar', label: 'Webinar' },
    { value: 'workshop', label: 'Workshop' }, { value: 'meetup', label: 'Meetup' },
    { value: 'training', label: 'Training' }, { value: 'summit', label: 'Summit' },
    { value: 'hackathon', label: 'Hackathon' },
  ]},
  { key: 'location_type', label: 'Mode', type: 'select', options: [
    { value: 'online', label: 'Online' }, { value: 'offline', label: 'In-person' }, { value: 'hybrid', label: 'Hybrid' },
  ]},
  { key: 'sector', label: 'Sector', type: 'select', options: sectorOptions },
];

export default function Events() {
  return (
    <EntityListPage
      entity={base44.entities.Event}
      detailPageParam="EventDetail"
      type="event"
      title="NGO Events & Conferences"
      description="Workshops, webinars, conferences, and networking events in the social sector."
      metaTitle="NGO Events India — DevelopmentWala.org"
      metaDesc="Find NGO workshops, conferences, webinars, and meetups across India. Network with social change makers."
      canonical="https://developmentwala.org/events"
      accentColor="pink"
      extraFilters={filters}
    />
  );
}
