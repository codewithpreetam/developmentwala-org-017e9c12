import { absoluteUrl, breadcrumbList, stripHtml } from "./ssr-fetch";

const ORG_LOGO =
  "https://media.api.com/images/public/69b1780f308798c9112e1851/a97f411e6_Development-Wala-Logo-150-x-150pngbv.webp";

type AnyRow = Record<string, unknown> & { id?: string | number; slug?: string };

function pick<T = string>(row: AnyRow | null | undefined, ...keys: string[]): T | undefined {
  if (!row) return undefined;
  for (const k of keys) {
    const v = row[k];
    if (v !== undefined && v !== null && v !== "") return v as T;
  }
  return undefined;
}

function isoDate(value: unknown): string | undefined {
  if (!value) return undefined;
  const d = new Date(String(value));
  return isNaN(d.getTime()) ? undefined : d.toISOString();
}

function plusDays(iso: string | undefined, days: number): string {
  const base = iso ? new Date(iso) : new Date();
  return new Date(base.getTime() + days * 86400000).toISOString();
}

const employmentTypeMap: Record<string, string> = {
  "full-time": "FULL_TIME",
  "full_time": "FULL_TIME",
  "part-time": "PART_TIME",
  "part_time": "PART_TIME",
  contract: "CONTRACTOR",
  contractor: "CONTRACTOR",
  internship: "INTERN",
  intern: "INTERN",
  volunteer: "VOLUNTEER",
  consultant: "CONTRACTOR",
};

export function jobPostingSchema(job: AnyRow, opts: { path: string; opType?: string }) {
  const datePosted = isoDate(pick(job, "date_posted", "created_at"));
  const validThrough = isoDate(pick(job, "valid_through", "deadline")) || plusDays(datePosted, 30);
  const empType = String(pick(job, "employment_type", "internship_type", "job_type") || "").toLowerCase();
  const isRemote =
    !!pick(job, "remote") ||
    /online|remote|work\s*from\s*home/i.test(String(pick(job, "location_type", "mode") || ""));
  const city = pick<string>(job, "city");
  const state = pick<string>(job, "state", "region");
  const country = pick<string>(job, "country") || "India";
  const orgName = pick<string>(job, "organization", "org_name", "organizer") || "DevelopmentWala.org";
  const salaryValue = pick<number | string>(job, "salary_value", "stipend", "stipend_amount", "salary", "amount");
  const salaryCurrency = pick<string>(job, "salary_currency", "currency") || "INR";
  const salaryUnit = pick<string>(job, "salary_unit_text", "stipend_unit");

  const schema: Record<string, unknown> = {
    "@context": "https://schema.org/",
    "@type": "JobPosting",
    title: pick(job, "title"),
    description: String(pick(job, "description") || ""),
    datePosted,
    validThrough,
    employmentType: employmentTypeMap[empType] || (opts.opType === "internship" ? "INTERN" : "FULL_TIME"),
    hiringOrganization: {
      "@type": "Organization",
      name: orgName,
      sameAs: pick(job, "org_website") || "https://developmentwala.org",
      logo: pick(job, "organization_logo") || ORG_LOGO,
    },
    url: absoluteUrl(opts.path),
    identifier: {
      "@type": "PropertyValue",
      name: orgName,
      value: String(pick(job, "id") || opts.path),
    },
    directApply: !!pick(job, "applylink", "apply_link", "link"),
    industry: pick(job, "sector", "field", "role_category") || "Non-Profit",
    occupationalCategory: "Social Services",
  };

  if (!isRemote && (city || state)) {
    schema.jobLocation = {
      "@type": "Place",
      address: {
        "@type": "PostalAddress",
        addressLocality: city,
        addressRegion: state,
        streetAddress: pick(job, "street_address"),
        postalCode: pick(job, "pin_code"),
        addressCountry: country === "India" ? "IN" : country,
      },
    };
  } else {
    schema.jobLocationType = "TELECOMMUTE";
    schema.applicantLocationRequirements = { "@type": "Country", name: country };
  }

  if (salaryValue) {
    const num = Number(String(salaryValue).replace(/[^\d.]/g, ""));
    if (num > 0) {
      const unit = /year|annual|annum/i.test(String(salaryUnit || "")) ? "YEAR"
        : /month/i.test(String(salaryUnit || "")) ? "MONTH"
        : /week/i.test(String(salaryUnit || "")) ? "WEEK"
        : /day/i.test(String(salaryUnit || "")) ? "DAY"
        : "MONTH";
      schema.baseSalary = {
        "@type": "MonetaryAmount",
        currency: salaryCurrency,
        value: { "@type": "QuantitativeValue", value: num, unitText: unit },
      };
    }
  }

  const quals = pick(job, "qualifications", "eligibility");
  if (quals) schema.qualifications = quals;
  const edu = pick(job, "education_required", "education_requirement");
  if (edu) schema.educationRequirements = { "@type": "EducationalOccupationalCredential", credentialCategory: edu };
  const exp = pick<number | string>(job, "experience_min", "experience_required");
  if (exp) {
    schema.experienceRequirements = {
      "@type": "OccupationalExperienceRequirements",
      monthsOfExperience: Number(exp) * 12 || undefined,
    };
  }

  return schema;
}

export function eventSchema(event: AnyRow, opts: { path: string }) {
  const start = isoDate(pick(event, "start_date", "event_date"));
  const end = isoDate(pick(event, "end_date")) || start;
  const mode = String(pick(event, "mode", "location_type") || "").toLowerCase();
  const attendanceMode =
    /online|virtual/.test(mode) ? "https://schema.org/OnlineEventAttendanceMode"
    : /hybrid|mixed/.test(mode) ? "https://schema.org/MixedEventAttendanceMode"
    : "https://schema.org/OfflineEventAttendanceMode";
  const link = pick<string>(event, "link", "registration_link", "event_link");
  const location = pick<string>(event, "location");
  return {
    "@context": "https://schema.org",
    "@type": "Event",
    name: pick(event, "title"),
    description: stripHtml(pick(event, "description"), 500),
    startDate: start,
    endDate: end,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: attendanceMode,
    location: /online|virtual/.test(mode)
      ? { "@type": "VirtualLocation", url: link || absoluteUrl(opts.path) }
      : { "@type": "Place", name: location || "India", address: { "@type": "PostalAddress", addressLocality: location, addressCountry: "IN" } },
    organizer: {
      "@type": "Organization",
      name: pick(event, "organizer", "organization") || "DevelopmentWala.org",
      url: "https://developmentwala.org",
    },
    image: pick(event, "poster_url"),
    url: absoluteUrl(opts.path),
    offers: link ? { "@type": "Offer", url: link, price: "0", priceCurrency: "INR", availability: "https://schema.org/InStock", validFrom: isoDate(pick(event, "created_at")) } : undefined,
  };
}

export function educationalProgramSchema(row: AnyRow, opts: { path: string; type: "fellowship" | "scholarship" }) {
  const deadline = isoDate(pick(row, "deadline"));
  return {
    "@context": "https://schema.org",
    "@type": opts.type === "scholarship" ? "EducationalOccupationalProgram" : "WorkBasedProgram",
    name: pick(row, "title"),
    description: stripHtml(pick(row, "description"), 500),
    provider: {
      "@type": "Organization",
      name: pick(row, "org_name", "organization") || "DevelopmentWala.org",
      sameAs: pick(row, "org_website") || "https://developmentwala.org",
      logo: ORG_LOGO,
    },
    applicationDeadline: deadline,
    url: absoluteUrl(opts.path),
    educationalProgramMode: pick(row, "fellowship_type", "scholarship_type") || (pick(row, "remote") ? "online" : "offline"),
    occupationalCategory: pick(row, "field") || "Social Sector",
    timeToComplete: pick(row, "duration"),
  };
}

export function articleSchema(post: AnyRow, opts: { path: string }) {
  const datePublished = isoDate(pick(post, "created_at"));
  const dateModified = isoDate(pick(post, "updated_at")) || datePublished;
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: pick(post, "title"),
    description: stripHtml(pick(post, "meta_description", "excerpt", "title"), 200),
    image: pick(post, "featured_image") ? [pick(post, "featured_image")] : undefined,
    datePublished,
    dateModified,
    author: {
      "@type": "Person",
      name: pick(post, "author_name") || "DevelopmentWala Editorial",
    },
    publisher: {
      "@type": "Organization",
      name: "DevelopmentWala.org",
      logo: { "@type": "ImageObject", url: ORG_LOGO },
    },
    mainEntityOfPage: { "@type": "WebPage", "@id": absoluteUrl(opts.path) },
    keywords: pick(post, "tags"),
    articleSection: Array.isArray(pick(post, "categories")) ? (pick(post, "categories") as string[]).join(", ") : undefined,
  };
}

export { breadcrumbList };
