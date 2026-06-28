#!/usr/bin/env node
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const BASE_URL = process.env.APP_BASE_URL || 'https://developmentwala.org';

async function main() {
  const client = await pool.connect();
  try {
    const since = new Date();
    since.setDate(since.getDate() - 7);

    const { rows: subs } = await client.query(
      `SELECT * FROM email_subscriptions WHERE active = true`
    );

    const { rows: jobs } = await client.query(
      `SELECT title, organization, deadline, created_at FROM jobs WHERE is_active = true AND created_at >= $1 ORDER BY created_at DESC LIMIT 30`,
      [since]
    );

    let queued = 0;
    for (const sub of subs) {
      const types = sub.opportunity_types || ['job'];
      if (!types.includes('job') || jobs.length === 0) continue;

      const rows = jobs.slice(0, 15).map((j) =>
        `<li><strong>${j.title}</strong> — ${j.organization || 'NGO'}${j.deadline ? ` (due ${new Date(j.deadline).toLocaleDateString()})` : ''}</li>`
      ).join('');

      const html = `
        <h2>Your Weekly Social Impact Opportunities</h2>
        <p>Hi ${sub.full_name || 'there'}, here are ${jobs.length} new listings this week:</p>
        <ul>${rows}</ul>
        <p><a href="${BASE_URL}/Jobs">Browse all opportunities</a></p>
      `;

      await client.query(
        `INSERT INTO email_queue (to_email, subject, body_html) VALUES ($1, $2, $3)`,
        [sub.email, 'Your weekly DevelopmentWala opportunity digest', html]
      );
      queued++;
    }
    console.log(`Queued ${queued} weekly alert(s) for ${subs.length} subscriber(s)`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
