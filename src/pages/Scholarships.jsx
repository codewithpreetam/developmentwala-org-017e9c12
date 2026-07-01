import React from 'react';
import { api } from '@/api/apiClient';
import EntityListPage from '../components/opportunities/EntityListPage';
import { countryOptions, sectorOptions } from '../components/forms/formOptions';

const filters = [
  { key: 'level_of_study', label: 'Level', type: 'select', options: [
    { value: 'undergraduate', label: 'Undergraduate' }, { value: 'postgraduate', label: 'Postgraduate' },
    { value: 'phd', label: 'PhD' }, { value: 'diploma', label: 'Diploma' }, { value: 'all', label: 'All Levels' },
  ]},
  { key: 'scholarship_type', label: 'Type', type: 'select', options: [
    { value: 'merit', label: 'Merit-based' }, { value: 'need_based', label: 'Need-based' },
    { value: 'minority', label: 'Minority' }, { value: 'women', label: 'Women' }, { value: 'research', label: 'Research' },
  ]},
  { key: 'sector', label: 'Field / Sector', type: 'select', options: sectorOptions },
  { key: 'country', label: 'Country', type: 'select', options: countryOptions },
];

export default function Scholarships() {
  return (
    <EntityListPage
      entity={api.entities.Scholarship}
      detailPageParam="ScholarshipDetail"
      type="scholarship"
      title="Scholarships for Social Sector"
      description="Education scholarships and financial support for students pursuing social development careers."
      metaTitle="Social Sector Scholarships — DevelopmentWala.org"
      metaDesc="Find scholarships for NGO professionals and students in India. Fully funded and partial scholarships available."
      canonical="https://developmentwala.org/scholarships"
      accentColor="yellow"
      extraFilters={filters}
    />
  );
}
