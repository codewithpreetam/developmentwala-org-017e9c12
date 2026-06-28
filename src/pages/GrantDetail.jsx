import React from 'react';
import { base44 } from '@/api/base44Client';
import EntityDetailPage from '../components/opportunities/EntityDetailPage';

export default function GrantDetail() {
  return (
    <EntityDetailPage
      entity={base44.entities.Grant}
      listingPage="Grants"
      typeLabel="Grant"
      accentColor="green"
      primaryAction="Apply for this Grant"
    />
  );
}