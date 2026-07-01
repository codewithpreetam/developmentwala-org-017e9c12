import React from 'react';
import { api } from '@/api/apiClient';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function InternshipDetail() {
  const getStructuredData = (item) => ({
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: item.title,
    description: item.description?.replace(/[#*_]/g, '').substring(0, 300),
    datePosted: item.created_date ? new Date(item.created_date).toISOString().split('T')[0] : undefined,
    validThrough: item.application_deadline,
    employmentType: 'INTERN',
    hiringOrganization: { '@type': 'Organization', name: item.organization_name || 'DevelopmentWala.org' },
    jobLocation: item.location ? { '@type': 'Place', address: { '@type': 'PostalAddress', addressLocality: item.location, addressCountry: item.country || 'IN' } } : undefined,
  });

  return (
    <EntityDetailPage
      entity={api.entities.Internship}
      listingPage="Internships"
      typeLabel="Internship"
      accentColor="purple"
      getStructuredData={getStructuredData}
    />
  );
}