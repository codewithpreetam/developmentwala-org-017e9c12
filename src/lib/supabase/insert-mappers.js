export function slugify(text) {
  const base = String(text || 'listing')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
  return `${base || 'listing'}-${Date.now().toString(36)}`;
}

function parseLocation(location, state) {
  if (!location) return { city: null, state: state || null };
  const parts = location.split(',').map((s) => s.trim()).filter(Boolean);
  if (parts.length >= 2) return { city: parts[0], state: parts[1] };
  return { city: location, state: state || null };
}

const EMPLOYMENT_LABELS = {
  full_time: 'Full-time',
  part_time: 'Part-time',
  contract: 'Contract',
  volunteer: 'Volunteer',
  consultant: 'Consultant',
};

function applyContact(payload) {
  const parts = [
    payload.application_process,
    payload.apply_email ? `Email applications to ${payload.apply_email}` : null,
  ].filter(Boolean);
  return parts.join('\n') || 'See listing for application details.';
}

function isPending(payload) {
  return payload.status === 'pending' || payload.is_active === false;
}

function parseSalaryToValue(raw) {
  if (raw == null || raw === '') return null;
  if (typeof raw === 'number') return raw;
  const s = String(raw).toLowerCase().replace(/,/g, '').trim();
  const num = parseFloat(s.replace(/[^\d.]/g, ''));
  if (Number.isNaN(num)) return null;
  if (/lpa|lakh|l\b/.test(s)) return Math.round(num * 100000);
  if (/k\b|thousand/.test(s)) return Math.round(num * 1000);
  if (/cr|crore/.test(s)) return Math.round(num * 10000000);
  return Math.round(num);
}

function parseExperienceToMin(raw) {
  if (raw == null || raw === '') return 0;
  if (typeof raw === 'number') return raw;
  const m = String(raw).match(/\d+/);
  return m ? parseInt(m[0], 10) : 0;
}

function modeLabel(value) {
  if (value === 'online') return 'Remote';
  if (value === 'offline') return 'In-person';
  if (value === 'hybrid') return 'Hybrid';
  return null;
}

function eventModeLabel(value) {
  if (value === 'online') return 'Online';
  if (value === 'offline') return 'Offline';
  if (value === 'hybrid') return 'Hybrid';
  return null;
}

function numericAmount(raw) {
  if (raw == null || raw === '') return null;
  const value = parseFloat(String(raw).replace(/[^\d.]/g, ''));
  return Number.isNaN(value) ? null : value;
}

export function toJobInsert(payload, { employerId, organizationEmployerId } = {}) {
  const { city, state } = parseLocation(payload.location, payload.state);
  const today = new Date().toISOString().split('T')[0];
  const deadline = payload.deadline;
  const validThrough = deadline
    ? new Date(`${deadline}T23:59:59`).toISOString()
    : new Date(Date.now() + 30 * 86400000).toISOString();

  return {
    title: payload.title?.trim(),
    slug: payload.slug || slugify(payload.title),
    description: payload.description?.trim(),
    qualifications: payload.qualifications || payload.eligibility || payload.education_requirement || payload.experience_required || 'See job description for requirements.',
    role_category: payload.sector || payload.role_category || 'other',
    employment_type: EMPLOYMENT_LABELS[payload.job_type] || payload.employment_type || 'Full-time',
    experience_min: payload.experience_min ?? parseExperienceToMin(payload.experience_required),
    salary_currency: 'INR',
    salary_value: payload.salary_value ?? parseSalaryToValue(payload.salary),
    salary_unit_text: 'YEAR',
    date_posted: today,
    valid_through: validThrough,
    is_active: isPending(payload) ? false : payload.is_active !== false,
    how_to_apply: applyContact(payload),
    organization: payload.organization?.trim() || null,
    organization_type: payload.organization_type || null,
    country: payload.country || 'India',
    city: city || payload.city || null,
    state: payload.state || state || null,
    applylink: payload.apply_url || payload.applylink || null,
    employer_id: employerId || payload.employer_id || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
    education_required: payload.education_requirement || payload.education_required || null,
    featured: !!payload.featured,
  };
}


export function toInternshipInsert(payload, { employerId, organizationEmployerId } = {}) {
  const { city, state } = parseLocation(payload.location, payload.state);
  const pending = isPending(payload);
  const selectedMode = modeLabel(payload.location_type);
  return {
    title: payload.title?.trim(),
    slug: slugify(payload.title),
    description: payload.description?.trim(),
    eligibility: payload.eligibility || 'See description for eligibility criteria.',
    application_process: applyContact(payload),
    duration: payload.duration || 'Not specified',
    internship_type: selectedMode || payload.internship_type || 'In-person',
    field: payload.sector || payload.field || 'other',
    country: payload.country || 'India',
    state,
    city: city || payload.location || null,
    remote: payload.location_type === 'online',
    deadline: payload.application_deadline || payload.deadline || null,
    stipend: payload.stipend_type === 'unpaid' ? 0 : numericAmount(payload.stipend_amount),
    org_name: payload.organization_name || payload.organization || 'Organization',
    contact_email: payload.apply_email || payload.submitted_by_email || null,
    contact_name: payload.submitted_by_name || null,
    featured: false,
    status: pending ? 'Inactive' : 'Active',
    employer_id: employerId || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
  };
}

export function toFellowshipInsert(payload, { employerId, organizationEmployerId } = {}) {
  const { city, state } = parseLocation(payload.location, payload.state);
  const pending = isPending(payload);
  const selectedMode = modeLabel(payload.location_type);
  return {
    title: payload.title?.trim(),
    slug: slugify(payload.title),
    description: payload.description?.trim(),
    eligibility: payload.eligibility || 'See description for eligibility criteria.',
    application_process: applyContact(payload),
    duration: payload.duration || 'Not specified',
    fellowship_type: selectedMode || payload.fellowship_category || payload.fellowship_type || 'In-person',
    field: payload.sector || payload.field_of_study || 'other',
    country: payload.country || 'India',
    state,
    city: city || payload.location || null,
    remote: payload.location_type === 'online',
    deadline: payload.application_deadline || payload.deadline || null,
    stipend: payload.funding_type === 'unpaid' ? 0 : numericAmount(payload.stipend_amount),
    org_name: payload.organization || 'Organization',
    contact_email: payload.apply_email || payload.submitted_by_email || null,
    contact_name: payload.submitted_by_name || null,
    featured: false,
    status: pending ? 'Inactive' : 'Active',
    employer_id: employerId || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
  };
}

export function toScholarshipInsert(payload, { employerId, organizationEmployerId } = {}) {
  const { city, state } = parseLocation(payload.location, payload.state);
  const pending = isPending(payload);
  return {
    title: payload.title?.trim(),
    slug: slugify(payload.title),
    description: payload.description?.trim(),
    eligibility: payload.eligibility || 'See description for eligibility criteria.',
    application_process: applyContact(payload),
    benefits: payload.benefits || payload.scholarship_amount || payload.scholarship_level || payload.level_of_study || 'See description for benefits.',
    scholarship_type: payload.scholarship_type || payload.funding_type || 'merit',
    field: payload.field_of_study || payload.sector || 'other',
    level: payload.level_of_study || payload.scholarship_level || 'all',
    country: payload.country || 'India',
    state,
    city: city || payload.location || null,
    remote: payload.location_type === 'online',
    deadline: payload.application_deadline || payload.deadline || null,
    amount: payload.scholarship_amount || payload.amount || null,
    org_name: payload.provider_name || payload.organization || 'Organization',
    contact_email: payload.apply_email || payload.submitted_by_email || null,
    contact_name: payload.submitted_by_name || null,
    featured: false,
    status: pending ? 'Inactive' : 'Active',
    employer_id: employerId || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
  };
}

export function toGrantInsert(payload, { employerId, organizationEmployerId } = {}) {
  const pending = isPending(payload);
  return {
    title: payload.title?.trim(),
    organization: payload.funding_agency || payload.organization || 'Funding Organization',
    type: payload.agency_type || payload.funding_type || payload.grant_type || 'Grant',
    sector: payload.sector || payload.tags || null,
    eligible: payload.eligibility || payload.eligible_countries || payload.country || 'See description for eligibility.',
    amount: payload.grant_amount || payload.amount || null,
    deadline: payload.application_deadline || payload.deadline || null,
    link: payload.apply_url || payload.link || null,
    description: payload.description?.trim(),
    tags: payload.tags || payload.sector || null,
    status: pending ? 'Inactive' : 'Active',
    featured: false,
    employer_id: employerId || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
  };
}

export function toEventInsert(payload, { employerId, organizationEmployerId } = {}) {
  return {
    title: payload.title?.trim(),
    organizer: payload.organizer_name || payload.organization || payload.submitted_by_name || 'Organizer',
    type: payload.event_category || 'Conference',
    mode: eventModeLabel(payload.location_type) || payload.mode || 'Offline',
    location: payload.location || payload.country || 'India',
    start_date: payload.event_date || payload.deadline || null,
    end_date: payload.event_end_date || payload.event_date || payload.deadline || null,
    link: payload.apply_url || payload.link || null,
    email: payload.apply_email || payload.submitted_by_email || null,
    description: payload.description?.trim(),
    tags: payload.tags || payload.sector || null,
    start_time: payload.event_time || null,
    owner_id: employerId || null,
    organization_employer_id: organizationEmployerId ?? payload.organization_employer_id ?? null,
    user_role: 'employer',
  };
}

const INSERT_MAPPERS = {
  job: toJobInsert,
  internship: toInternshipInsert,
  fellowship: toFellowshipInsert,
  scholarship: toScholarshipInsert,
  grant: toGrantInsert,
  event: toEventInsert,
};

export function toOpportunityInsert(type, payload, options = {}) {
  const mapper = INSERT_MAPPERS[type];
  if (!mapper) throw new Error(`Unknown opportunity type: ${type}`);
  return mapper(payload, options);
}
