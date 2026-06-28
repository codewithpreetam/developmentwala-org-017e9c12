const DETAIL_ROUTES = {
  job: 'jobs',
  internship: 'internships',
  fellowship: 'fellowships',
  scholarship: 'scholarships',
  grant: 'grants',
  event: 'events',
};

const LEGACY_DETAIL = {
  job: 'JobDetail',
  internship: 'InternshipDetail',
  fellowship: 'FellowshipDetail',
  scholarship: 'ScholarshipDetail',
  grant: 'GrantDetail',
  event: 'EventDetail',
};

/** SEO-friendly detail URL: /jobs/my-slug or /jobs?id=uuid fallback */
export function opportunityDetailUrl(opportunity, type = opportunity?.opportunity_type || 'job') {
  const segment = DETAIL_ROUTES[type] || 'jobs';
  const slug = opportunity?.slug;
  const id = opportunity?.id;
  if (slug) return `/${segment}/${slug}`;
  if (id) return `/${segment}?id=${id}`;
  return `/${segment}`;
}

/** Legacy PascalCase URL for backward compatibility */
export function legacyDetailUrl(opportunity, type = opportunity?.opportunity_type || 'job') {
  const page = LEGACY_DETAIL[type] || 'JobDetail';
  const slug = opportunity?.slug;
  const id = opportunity?.id;
  if (slug) return `/${page}?slug=${encodeURIComponent(slug)}`;
  if (id) return `/${page}?id=${id}`;
  return `/${page}`;
}

export function listingUrl(type = 'job') {
  const map = {
    job: 'jobs',
    internship: 'internships',
    fellowship: 'fellowships',
    scholarship: 'scholarships',
    grant: 'grants',
    event: 'events',
  };
  return `/${map[type] || 'jobs'}`;
}
