import { api } from '@/api/apiClient';

export async function loadEmployerContactDefaults(user) {
  if (!user?.email) {
    return { submitted_by_name: '', submitted_by_email: '', contact_email: '', organization: '' };
  }

  const [profiles, orgs] = await Promise.all([
    api.entities.UserProfile.filter({ user_email: user.email, user_type: 'employer' }).catch(() => []),
    user.role === 'employer' || user.role === 'super_admin'
      ? api.entities.Organization.filter({ user_email: user.email }).catch(() => [])
      : Promise.resolve([]),
  ]);

  const profile = profiles[0];
  const org = orgs[0];
  const contactEmail = profile?.email_id || org?.contact_email || user.email;
  const contactName = profile?.full_name || user.full_name || '';

  return {
    submitted_by_name: contactName,
    submitted_by_email: contactEmail,
    contact_email: contactEmail,
    organization: org?.org_name || profile?.org_name || '',
  };
}

/** Merge employer profile + org into form contact fields without overwriting user edits. */
export function applyEmployerContactFields(prev, user, contact = {}) {
  const name = contact.submitted_by_name || user?.full_name || '';
  const email = contact.submitted_by_email || contact.contact_email || user?.email || '';
  const org = contact.organization || '';

  return {
    ...prev,
    submitted_by_name: prev.submitted_by_name || name,
    submitted_by_email: prev.submitted_by_email || email,
    apply_email: prev.apply_email || email,
    application_email: prev.application_email || email,
    organization: prev.organization || org,
    organization_name: prev.organization_name || org,
    funding_agency: prev.funding_agency || org,
    organizer_name: prev.organizer_name || org,
    provider_name: prev.provider_name || org,
  };
}
