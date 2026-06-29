import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityListPage from '../components/opportunities/EntityListPage';
import { countryOptions } from '../components/forms/formOptions';

const filters = [
  { key: 'sector', label: 'Sector', type: 'select', options: [
    { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
    { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
    { value: 'governance', label: 'Governance' }, { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
  ]},
  { key: 'stipend_type', label: 'Stipend', type: 'select', options: [
    { value: 'paid', label: 'Paid' }, { value: 'unpaid', label: 'Unpaid' },
  ]},
  { key: 'location_type', label: 'Mode', type: 'select', options: [
    { value: 'online', label: 'Online' }, { value: 'offline', label: 'In-person' }, { value: 'hybrid', label: 'Hybrid' },
  ]},
  { key: 'country', label: 'Country', type: 'select', options: countryOptions },
];

export default function Fellowships() {
  return (
    <EntityListPage
      entity={base44.entities.Fellowship}
      detailPageParam="FellowshipDetail"
      type="fellowship"
      title="Social Sector Fellowships"
      description="Prestigious fellowship programs for social change leaders and development professionals."
      metaTitle="NGO Fellowships India — DevelopmentWala.org"
      metaDesc="Find fellowship opportunities in the social sector. Leadership, research, and field fellowships across India."
      canonical="https://developmentwala.org/fellowships"
      accentColor="indigo"
      extraFilters={filters}
    />
  );
}
