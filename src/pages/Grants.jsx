import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityListPage from '../components/opportunities/EntityListPage';
import { countryOptions } from '../components/forms/formOptions';

const filters = [
  { key: 'sector', label: 'Sector', type: 'select', options: [
    { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
    { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
    { value: 'governance', label: 'Governance' }, { value: 'livelihood', label: 'Livelihood' },
    { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
  ]},
  { key: 'agency_type', label: 'Agency Type', type: 'select', options: [
    { value: 'government', label: 'Government' }, { value: 'un_agency', label: 'UN Agency' },
    { value: 'foundation', label: 'Foundation' }, { value: 'bilateral', label: 'Bilateral' },
    { value: 'corporate_csr', label: 'Corporate CSR' },
  ]},
  { key: 'country', label: 'Country', type: 'select', options: countryOptions },
];

export default function Grants() {
  return (
    <EntityListPage
      entity={base44.entities.Grant}
      detailPageParam="GrantDetail"
      type="grant"
      title="Grants for NGOs & Social Enterprises"
      description="Funding opportunities for NGOs, nonprofits, and social enterprises in India."
      metaTitle="NGO Grants India — DevelopmentWala.org"
      metaDesc="Find grants and funding opportunities for NGOs in India. Government grants, CSR funding, foundation grants and more."
      canonical="https://developmentwala.org/grants"
      accentColor="green"
      extraFilters={filters}
    />
  );
}