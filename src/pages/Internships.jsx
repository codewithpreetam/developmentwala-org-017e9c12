import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityListPage from '../components/opportunities/EntityListPage';
import { countryOptions } from '../components/forms/formOptions';

const filters = [
  { key: 'sector', label: 'Sector', type: 'select', options: [
    { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
    { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
    { value: 'gender_equality', label: 'Gender Equality' }, { value: 'governance', label: 'Governance' },
    { value: 'livelihood', label: 'Livelihood' }, { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
  ]},
  { key: 'location_type', label: 'Mode', type: 'select', options: [
    { value: 'online', label: 'Online' }, { value: 'offline', label: 'In-person' }, { value: 'hybrid', label: 'Hybrid' },
  ]},
  { key: 'stipend_type', label: 'Stipend', type: 'select', options: [
    { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' },
  ]},
  { key: 'country', label: 'Country', type: 'select', options: countryOptions },
];

export default function Internships() {
  return (
    <EntityListPage
      entity={base44.entities.Internship}
      detailPageParam="InternshipDetail"
      type="internship"
      title="NGO Internships in India"
      description="Gain hands-on experience with leading NGOs and social enterprises across India."
      metaTitle="NGO Internships India — DevelopmentWala.org"
      metaDesc="Find NGO internship opportunities in India. Paid and unpaid internships in education, health, environment, and social development."
      canonical="https://developmentwala.org/internships"
      accentColor="purple"
      extraFilters={filters}
    />
  );
}