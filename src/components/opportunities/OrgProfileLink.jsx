import React from 'react';
import { Link } from 'react-router-dom';
import { orgProfileUrl } from '@/utils/orgProfileUrl';

export default function OrgProfileLink({ orgData, orgName, className = 'text-blue-600 hover:underline font-medium' }) {
  const name = (orgName || orgData?.org_name || orgData?.name || '').trim();
  if (!name) return null;

  const href = orgProfileUrl(orgData, name);
  if (!href) {
    return <span className={className.replace(/hover:underline|text-blue-600/g, '').trim() || undefined}>{name}</span>;
  }

  return (
    <Link to={href} className={className}>
      {name}
    </Link>
  );
}
