const PUBLISHED_STATUSES = new Set(['published', 'active', 'Active', 'approved']);

function isPublished(row, type = 'job') {
  if (type === 'job') return row.is_active === true;
  if (type === 'event') return !row.status || PUBLISHED_STATUSES.has(row.status) || row.is_active === true;
  return PUBLISHED_STATUSES.has(row.status) || row.is_active === true;
}

function locationFromRow(row) {
  return [row.city, row.state, row.country].filter(Boolean).join(', ') || row.location || '';
}

function baseOpportunity(row, type, extra = {}) {
  const org = row.organization || row.org_name || row.organizer || row.funding_agency || '';
  return {
    id: String(row.id),
    title: row.title,
    slug: row.slug,
    description: row.description,
    status: isPublished(row, type) ? 'published' : 'pending',
    featured: !!row.featured,
    created_date: row.created_at || row.date_posted,
    updated_date: row.updated_at || row.created_at,
    opportunity_type: type,
    organization: org,
    funding_agency: org,
    organization_employer_id: row.organization_employer_id ?? null,
    sector: row.role_category || row.field || row.sector || row.tags || 'other',
    location: locationFromRow(row),
    city: row.city,
    state: row.state,
    country: row.country,
    deadline: row.deadline || row.valid_through,
    application_deadline: row.deadline || row.valid_through,
    event_date: row.start_date,
    logo_url: row.organization_logo || row.logo || (type === 'event' ? null : row.poster_url),
    submitted_by_email: extra.submitted_by_email || null,
    submitted_by_name: extra.submitted_by_name || row.contact_name || null,
    posted_by_designation: extra.posted_by_designation || null,
    created_by: extra.submitted_by_email || null,
    ...extra,
  };
}

function formatSalary(row) {
  if (!row.salary_value) return null;
  const val = Number(row.salary_value);
  if (Number.isNaN(val)) return null;
  const currency = row.salary_currency || 'INR';
  if (val >= 100000) return `${currency} ${(val / 100000).toFixed(1)}L`;
  if (val >= 1000) return `${currency} ${Math.round(val / 1000)}K`;
  return `${currency} ${val}`;
}

function normalizeEmploymentType(value) {
  if (!value) return 'full_time';
  return String(value).toLowerCase().replace(/\s+/g, '_');
}

export function mapJob(row, extra = {}) {
  const employerEmail = extra.submitted_by_email || extra.created_by || null;
  return baseOpportunity(row, 'job', {
    qualifications: row.qualifications,
    employment_type: row.employment_type,
    job_type: normalizeEmploymentType(row.employment_type),
    experience_min: row.experience_min,
    salary_currency: row.salary_currency,
    salary_value: row.salary_value,
    salary: formatSalary(row),
    salary_unit_text: row.salary_unit_text,
    how_to_apply: row.how_to_apply,
    applylink: row.applylink,
    organization_type: row.organization_type,
    education_required: row.education_required,
    employer_id: row.employer_id,
    location_type: 'offline',
    submitted_by_email: employerEmail,
    created_by: employerEmail,
    ...extra,
  });
}

export function mapInternship(row, extra = {}) {
  return baseOpportunity(row, 'internship', {
    eligibility: row.eligibility,
    duration: row.duration,
    internship_type: row.internship_type,
    stipend: row.stipend,
    apply_link: row.apply_link,
    employer_id: row.employer_id,
    ...extra,
  });
}

export function mapFellowship(row, extra = {}) {
  return baseOpportunity(row, 'fellowship', {
    eligibility: row.eligibility,
    duration: row.duration,
    fellowship_type: row.fellowship_type,
    stipend: row.stipend,
    employer_id: row.employer_id,
    ...extra,
  });
}

export function mapScholarship(row, extra = {}) {
  return baseOpportunity(row, 'scholarship', {
    eligibility: row.eligibility,
    benefits: row.benefits,
    scholarship_type: row.scholarship_type,
    level: row.level,
    amount: row.amount,
    employer_id: row.employer_id,
    ...extra,
  });
}

export function mapGrant(row, extra = {}) {
  return baseOpportunity(row, 'grant', {
    organization: row.organization,
    type: row.type,
    sector: row.sector,
    eligible: row.eligible,
    amount: row.amount,
    link: row.link,
    employer_id: row.employer_id,
    ...extra,
  });
}

export function mapEvent(row, extra = {}) {
  return baseOpportunity(row, 'event', {
    organizer: row.organizer,
    type: row.type,
    mode: row.mode,
    start_date: row.start_date,
    end_date: row.end_date,
    link: row.link,
    poster_url: row.poster_url,
    banner_image: row.poster_url || null,
    owner_id: row.owner_id,
    ...extra,
  });
}

export function mapEmployer(row) {
  return {
    id: String(row.id),
    org_name: row.name,
    name: row.name,
    logo_url: row.logo,
    logo: row.logo,
    location: row.location,
    city: row.location,
    sector: row.sector || row.tags,
    tags: row.tags,
    tagline: row.tagline || null,
    ngo_type: row.ngo_type || null,
    owner_user_id: row.owner_user_id || null,
    open_positions: row.open_positions,
    about: row.about,
    founded: row.founded,
    company_size: row.company_size,
    phone: row.phone,
    email: row.email,
    website: row.website,
    social_facebook: row.social_facebook,
    social_twitter: row.social_twitter,
    social_linkedin: row.social_linkedin,
    social_instagram: row.social_instagram,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

export function mapUserProfile(user, profileRow, employerProfileRow, candidateSetupRow) {
  const userType = user.role === 'employer' ? 'employer' : 'job_seeker';
  const fullName = [user.first_name, user.last_name].filter(Boolean).join(' ').trim();
  const employerData = employerProfileRow?.data || {};
  const setupData = candidateSetupRow?.data || {};
  const profilePicture = profileRow?.profile_picture_url
    || employerData.profilePicture
    || user.profile_image
    || null;
  return {
    id: user.id,
    user_email: user.email,
    user_type: userType,
    full_name: fullName || employerData.fullName || user.email?.split('@')[0] || '',
    cv_url: profileRow?.cv_url || null,
    profile_picture: profilePicture,
    profile_picture_url: profilePicture,
    professional_title: profileRow?.professional_title || employerData.roleDesignation || null,
    designation: employerData.roleDesignation || null,
    age: employerData.age ?? null,
    gender: employerData.gender || profileRow?.gender || null,
    office_location: employerData.officeLocation || null,
    email_id: employerData.workEmail || user.email,
    employer_linkedin_url: employerData.linkedinUrl || null,
    biography: profileRow?.biography || null,
    summary: profileRow?.biography || null,
    skills: profileRow?.skills || null,
    education: profileRow?.education_level || null,
    experience: profileRow?.experience_level || null,
    phone: setupData.phone || null,
    location: setupData.location || null,
    sector_interests: setupData.sectorInterests || setupData.sector_interests || [],
    org_name: employerData.organizationName || null,
    organization_name: employerData.organizationName || null,
    ngo_type: employerData.organizationType || null,
    updated_date: profileRow?.updated_at || employerProfileRow?.updated_at || user.updated_at,
    employer_profile: employerProfileRow || null,
    candidate_profile: profileRow || null,
  };
}

const APP_STATUS_MAP = {
  submitted: 'applied',
  Applied: 'applied',
  applied: 'applied',
  reviewing: 'reviewing',
  shortlisted: 'shortlisted',
  interview: 'interview',
  selected: 'selected',
  rejected: 'rejected',
};

export function mapApplication(row, candidateEmail, jobTitle, candidateUser, extra = {}) {
  const rawStatus = row.status || 'applied';
  const status = APP_STATUS_MAP[rawStatus] || String(rawStatus).toLowerCase().replace(/\s+/g, '_');
  const oppId = row.opportunity_id || row.job_id;
  const fullName = candidateUser
    ? [candidateUser.first_name, candidateUser.last_name].filter(Boolean).join(' ').trim()
    : '';
  return {
    id: row.id,
    opportunity_id: oppId,
    opportunity_type: row.opportunity_type || 'job',
    job_id: row.job_id,
    applicant_email: candidateEmail,
    applicant_name: extra.applicant_name || fullName || null,
    candidate_id: row.candidate_id,
    status,
    cover_letter: row.cover_letter,
    cv_url: row.cv_url,
    created_date: row.applied_at,
    applied_at: row.applied_at,
    opportunity_title: jobTitle || extra.opportunity_title || null,
    title: jobTitle || extra.opportunity_title || null,
    employer_email: extra.employer_email || null,
  };
}

const TYPE_SEGMENT = {
  job: 'jobs', internship: 'internships', fellowship: 'fellowships',
  scholarship: 'scholarships', grant: 'grants', event: 'events',
};

function buildDetailUrl(type, opp, fallbackId) {
  const seg = TYPE_SEGMENT[type] || 'jobs';
  if (opp?.slug) return `/${seg}/${opp.slug}`;
  if (fallbackId) return `/${seg}?id=${fallbackId}`;
  return `/${seg}`;
}

export function mapSavedJob(row, job) {
  return {
    id: String(row.id),
    user_email: row.user_email,
    opportunity_id: row.job_id,
    opportunity_type: 'job',
    title: job?.title,
    opportunity_title: job?.title,
    slug: job?.slug,
    organization: job?.organization || null,
    deadline: job?.deadline || null,
    banner_image: job?.banner_image || null,
    detail_page: 'jobs',
    detail_url: buildDetailUrl('job', job, row.job_id),
    created_date: row.saved_date || row.created_at,
  };
}

export function mapSavedOpportunity(row, opp, type) {
  return {
    id: String(row.id),
    user_email: row.user_email,
    opportunity_id: row.opportunity_id,
    opportunity_type: type,
    title: opp?.title,
    opportunity_title: opp?.title,
    slug: opp?.slug,
    organization: opp?.organization || opp?.organization_name || opp?.funding_agency || opp?.organizer_name || opp?.provider_name || null,
    deadline: opp?.deadline || opp?.application_deadline || opp?.event_date || null,
    banner_image: opp?.banner_image || null,
    detail_page: TYPE_SEGMENT[type] || 'jobs',
    detail_url: buildDetailUrl(type, opp, row.opportunity_id),
    created_date: row.created_at,
  };
}

export function mapNotification(row, userEmail) {
  return {
    id: row.id,
    user_email: userEmail,
    user_id: row.user_id,
    title: row.entity_title,
    entity_title: row.entity_title,
    message: row.details,
    details: row.details,
    type: row.type,
    entity_id: row.entity_id,
    read: !!row.read,
    created_date: row.created_at,
  };
}

export function applyPublishedFilter(rows, type) {
  return rows.filter((row) => isPublished(row, type));
}

export function sortRows(rows, sortKey) {
  if (!sortKey) return rows;
  const desc = sortKey.startsWith('-');
  const field = desc ? sortKey.slice(1) : sortKey;
  const dbField = field === 'created_date' ? 'created_at' : field;
  return [...rows].sort((a, b) => {
    const av = a[dbField] ?? a[field];
    const bv = b[dbField] ?? b[field];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    return desc
      ? new Date(bv) - new Date(av) || String(bv).localeCompare(String(av))
      : new Date(av) - new Date(bv) || String(av).localeCompare(String(bv));
  });
}
