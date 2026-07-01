import React from 'react';
import { api } from '@/api/apiClient';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function FellowshipDetail() {
  const getStructuredData = (item) => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: item.title,
    description: item.description?.replace(/[#*_]/g, '').substring(0, 300),
    provider: { '@type': 'Organization', name: item.organization_name || 'DevelopmentWala.org' },
    applicationDeadline: item.application_deadline,
    timeToComplete: item.duration,
    url: item.application_link,
  });

  return (
    <EntityDetailPage
      entity={api.entities.Fellowship}
      listingPage="Fellowships"
      typeLabel="Fellowship"
      accentColor="indigo"
      getStructuredData={getStructuredData}
    />
  );
}