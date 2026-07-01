import React from 'react';
import { api } from '@/api/apiClient';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function GrantDetail() {
  return (
    <EntityDetailPage
      entity={api.entities.Grant}
      listingPage="Grants"
      typeLabel="Grant"
      accentColor="green"
      primaryAction="Apply for this Grant"
    />
  );
}