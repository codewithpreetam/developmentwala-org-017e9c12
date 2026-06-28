import React from 'react';
import { Link } from '@/lib/router-adapter';
import { Building2, User } from 'lucide-react';
import { orgProfileUrl } from '@/utils/orgProfileUrl';

export default function EmployerCard({
  orgData,
  fallbackOrgName,
  posterName,
  posterDesignation,
}) {
  const orgName = orgData?.org_name || fallbackOrgName;
  const postedBy = posterName?.trim();

  if (!orgName && !postedBy) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-2xl p-6">
      {orgName && (
        <div className="mb-4">
          <h3 className="font-bold text-gray-900 mb-2 flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-600" />
            Organization
          </h3>
          {orgProfileUrl(orgData, orgName) ? (
            <Link
              to={orgProfileUrl(orgData, orgName)}
              className="text-base font-semibold text-blue-600 hover:underline"
            >
              {orgName}
            </Link>
          ) : (
            <p className="text-base font-semibold text-gray-900">{orgName}</p>
          )}
        </div>
      )}

      {postedBy && (
        <div className={orgName ? 'pt-4 border-t border-gray-100' : ''}>
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 mb-1.5 flex items-center gap-1.5">
            <User className="w-3.5 h-3.5" />
            Posted by
          </p>
          <p className="text-sm font-medium text-gray-900">{postedBy}</p>
          {posterDesignation && (
            <p className="text-sm text-gray-500 mt-0.5">{posterDesignation}</p>
          )}
        </div>
      )}
    </div>
  );
}
