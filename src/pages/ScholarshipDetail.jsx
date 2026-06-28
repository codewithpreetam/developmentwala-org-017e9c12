import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function ScholarshipDetail() {
  const getStructuredData = (item) => ({
    '@context': 'https://schema.org',
    '@type': 'EducationalOccupationalProgram',
    name: item.title,
    description: item.description?.replace(/[#*_]/g, '').substring(0, 300),
    provider: { '@type': 'Organization', name: item.provider_name || item.university_name || 'DevelopmentWala.org' },
    applicationDeadline: item.application_deadline,
    url: item.application_link,
  });

  return (
    <EntityDetailPage
      entity={base44.entities.Scholarship}
      listingPage="Scholarships"
      typeLabel="Scholarship"
      accentColor="yellow"
      getStructuredData={getStructuredData}
    />
  );
}