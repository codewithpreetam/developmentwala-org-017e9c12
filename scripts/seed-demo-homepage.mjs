#!/usr/bin/env node
/**
 * Seeds published opportunities for homepage hero stats (demo-home-* slugs).
 * Run: npm run db:seed-homepage
 * Requires: npm run db:seed-demo (demo employer account)
 */
import pg from 'pg';
import { getConnectionString, validateConnectionString } from './lib/run-sql-file.mjs';

const { Pool } = pg;

const EMPLOYER_ID = '11111111-1111-4111-8111-111111111102';
const ORG_NAME = 'Development Wala Demo NGO';

const SECTORS = [
  'education', 'health', 'environment', 'human_rights', 'poverty', 'gender_equality',
  'disaster_relief', 'governance', 'livelihood', 'child_welfare', 'water_sanitation', 'climate',
];

const JOB_SECTORS = SECTORS;
const INTERNSHIP_SECTORS = SECTORS.slice(0, 6);
const FELLOWSHIP_SECTORS = SECTORS.slice(0, 6);
const SCHOLARSHIP_SECTORS = SECTORS.slice(0, 4);
const GRANT_SECTORS = SECTORS.slice(0, 4);
const EVENT_SECTORS = SECTORS.slice(0, 4);

function label(sector) {
  return sector.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

async function cleanup(pool) {
  await pool.query(`DELETE FROM jobs WHERE slug LIKE 'demo-home-%'`);
  await pool.query(`DELETE FROM internships WHERE slug LIKE 'demo-home-%'`);
  await pool.query(`DELETE FROM fellowships WHERE slug LIKE 'demo-home-%'`);
  await pool.query(`DELETE FROM scholarships WHERE slug LIKE 'demo-home-%'`);
  await pool.query(`DELETE FROM grants WHERE title LIKE 'Demo Home Grant —%'`);
  await pool.query(`DELETE FROM events WHERE title LIKE 'Demo Home Event —%'`);
}

async function seedJobs(pool) {
  const deadline = new Date(Date.now() + 60 * 86400000).toISOString();
  const today = new Date().toISOString().split('T')[0];

  for (const sector of JOB_SECTORS) {
    const slug = `demo-home-job-${sector}`;
    await pool.query(
      `INSERT INTO jobs (
        title, slug, description, qualifications, role_category, employment_type,
        experience_min, salary_currency, salary_value, salary_unit_text,
        date_posted, valid_through, is_active, organization, country, city, state,
        employer_id, featured
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,true,$13,$14,$15,$16,$17,$18)`,
      [
        `Demo Home Job — ${label(sector)}`,
        slug,
        `Demo listing for homepage analytics. Join our ${label(sector)} program team and drive social impact across India.`,
        'Bachelor degree or equivalent experience in the social sector.',
        sector,
        'Full-time',
        1,
        'INR',
        450000,
        'YEAR',
        today,
        deadline,
        ORG_NAME,
        'India',
        'New Delhi',
        'Delhi',
        EMPLOYER_ID,
        sector === 'education' || sector === 'health',
      ]
    );
  }
}

async function seedInternships(pool) {
  const deadline = new Date(Date.now() + 45 * 86400000).toISOString().split('T')[0];

  for (const sector of INTERNSHIP_SECTORS) {
    await pool.query(
      `INSERT INTO internships (
        title, slug, description, eligibility, application_process, duration,
        internship_type, field, country, city, state, deadline, org_name,
        contact_email, featured, status, employer_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        `Demo Home Internship — ${label(sector)}`,
        `demo-home-internship-${sector}`,
        `Hands-on internship in ${label(sector)} for students and early-career professionals.`,
        'Undergraduate students or recent graduates.',
        'Apply via email with CV and cover letter.',
        '3 months',
        'Hybrid',
        sector,
        'India',
        'Mumbai',
        'Maharashtra',
        deadline,
        ORG_NAME,
        'employer@developmentwala.org',
        sector === 'environment',
        'Active',
        EMPLOYER_ID,
      ]
    );
  }
}

async function seedFellowships(pool) {
  const deadline = new Date(Date.now() + 90 * 86400000).toISOString().split('T')[0];

  for (const sector of FELLOWSHIP_SECTORS) {
    await pool.query(
      `INSERT INTO fellowships (
        title, slug, description, eligibility, application_process, duration,
        fellowship_type, field, country, city, state, deadline, org_name,
        contact_email, featured, status, employer_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)`,
      [
        `Demo Home Fellowship — ${label(sector)}`,
        `demo-home-fellowship-${sector}`,
        `Fellowship opportunity focused on ${label(sector)} leadership and field practice.`,
        '2+ years of relevant NGO or development sector experience.',
        'Submit online application with statement of purpose.',
        '12 months',
        'Leadership',
        sector,
        'India',
        'Bengaluru',
        'Karnataka',
        deadline,
        ORG_NAME,
        'employer@developmentwala.org',
        sector === 'governance',
        'Active',
        EMPLOYER_ID,
      ]
    );
  }
}

async function seedScholarships(pool) {
  const deadline = new Date(Date.now() + 120 * 86400000).toISOString().split('T')[0];

  for (const sector of SCHOLARSHIP_SECTORS) {
    await pool.query(
      `INSERT INTO scholarships (
        title, slug, description, eligibility, application_process, benefits,
        scholarship_type, field, level, country, deadline, org_name,
        contact_email, featured, status, employer_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16)`,
      [
        `Demo Home Scholarship — ${label(sector)}`,
        `demo-home-scholarship-${sector}`,
        `Scholarship supporting studies and research in ${label(sector)}.`,
        'Indian nationals pursuing undergraduate or postgraduate studies.',
        'Apply with academic transcripts and recommendation letter.',
        'Tuition support and mentorship.',
        'Merit-based',
        sector,
        'Postgraduate',
        'India',
        deadline,
        ORG_NAME,
        'employer@developmentwala.org',
        false,
        'Active',
        EMPLOYER_ID,
      ]
    );
  }
}

async function seedGrants(pool) {
  const deadline = new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0];

  for (const sector of GRANT_SECTORS) {
    await pool.query(
      `INSERT INTO grants (
        title, organization, type, sector, eligible, amount, deadline, description,
        status, featured, employer_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
      [
        `Demo Home Grant — ${label(sector)}`,
        ORG_NAME,
        'Project Grant',
        sector,
        'Registered NGOs and community-based organizations in India.',
        '₹5,00,000',
        deadline,
        `Funding for ${label(sector)} initiatives with measurable community outcomes.`,
        'Active',
        sector === 'livelihood',
        EMPLOYER_ID,
      ]
    );
  }
}

async function seedEvents(pool) {
  const start = new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0];
  const end = new Date(Date.now() + 31 * 86400000).toISOString().split('T')[0];

  for (const sector of EVENT_SECTORS) {
    await pool.query(
      `INSERT INTO events (
        title, organizer, type, mode, location, start_date, end_date, link, email,
        description, tags, owner_id
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
      [
        `Demo Home Event — ${label(sector)}`,
        ORG_NAME,
        'Conference',
        'Hybrid',
        'New Delhi, India',
        start,
        end,
        'https://developmentwala.org/events',
        'employer@developmentwala.org',
        `Demo conference on ${label(sector)} for NGOs and social sector professionals.`,
        sector,
        EMPLOYER_ID,
      ]
    );
  }
}

async function printStats(pool) {
  const [jobs, internships, fellowships, scholarships, grants, events] = await Promise.all([
    pool.query(`SELECT COUNT(*)::int AS c FROM jobs WHERE is_active = true`),
    pool.query(`SELECT COUNT(*)::int AS c FROM internships WHERE status IN ('Active','active','published')`),
    pool.query(`SELECT COUNT(*)::int AS c FROM fellowships WHERE status IN ('Active','active','published')`),
    pool.query(`SELECT COUNT(*)::int AS c FROM scholarships WHERE status IN ('Active','active','published')`),
    pool.query(`SELECT COUNT(*)::int AS c FROM grants WHERE status IN ('Active','active','published')`),
    pool.query(`SELECT COUNT(*)::int AS c FROM events`),
  ]);

  const counts = {
    jobs: jobs.rows[0].c,
    internships: internships.rows[0].c,
    fellowships: fellowships.rows[0].c,
    scholarships: scholarships.rows[0].c,
    grants: grants.rows[0].c,
    events: events.rows[0].c,
  };
  const live = Object.values(counts).reduce((s, n) => s + n, 0);
  const types = Object.values(counts).filter((n) => n > 0).length;

  const sectors = await pool.query(`
    SELECT COUNT(DISTINCT sector)::int AS c FROM (
      SELECT role_category AS sector FROM jobs WHERE is_active = true
      UNION ALL SELECT field FROM internships WHERE status IN ('Active','active','published')
      UNION ALL SELECT field FROM fellowships WHERE status IN ('Active','active','published')
      UNION ALL SELECT field FROM scholarships WHERE status IN ('Active','active','published')
      UNION ALL SELECT sector FROM grants WHERE status IN ('Active','active','published')
      UNION ALL SELECT tags FROM events
    ) s WHERE sector IS NOT NULL AND sector <> ''
  `);

  console.log('Homepage stats preview:');
  console.log(`  Live opportunities: ${live}+`);
  console.log(`  Opportunity types:  ${types}`);
  console.log(`  Sectors covered:    ${sectors.rows[0].c}+`);
  console.log('  Breakdown:', counts);
}

async function main() {
  const connectionString = getConnectionString();
  validateConnectionString(connectionString);

  const pool = new Pool({
    connectionString,
    ssl: { rejectUnauthorized: false },
  });

  try {
    const employer = await pool.query('SELECT id FROM users WHERE email = $1', ['employer@developmentwala.org']);
    if (!employer.rows.length) {
      throw new Error('Demo employer not found. Run: npm run db:seed-demo');
    }

    await cleanup(pool);
    await seedJobs(pool);
    await seedInternships(pool);
    await seedFellowships(pool);
    await seedScholarships(pool);
    await seedGrants(pool);
    await seedEvents(pool);
    await printStats(pool);
    console.log('Demo homepage data seeded successfully.');
  } finally {
    await pool.end();
  }
}

main().catch((err) => {
  console.error(err.message);
  process.exit(1);
});
