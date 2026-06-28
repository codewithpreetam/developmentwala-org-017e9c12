import { createPageUrl } from '@/utils';

/** Build EmployerProfile URL from org record id or display name. */
export function orgProfileUrl(orgData, orgName) {
  if (orgData?.id) {
    return createPageUrl(`EmployerProfile?id=${orgData.id}`);
  }
  const name = (orgName || orgData?.org_name || orgData?.name || '').trim();
  if (name) {
    return createPageUrl(`EmployerProfile?org=${encodeURIComponent(name)}`);
  }
  return null;
}
