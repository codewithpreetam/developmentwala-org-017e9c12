#!/usr/bin/env node
import pg from 'pg';

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';

async function sendViaResend(to, subject, html) {
  if (!RESEND_API_KEY) {
    console.log(`[email:skipped] No RESEND_API_KEY — would send to ${to}: ${subject}`);
    return { ok: true, skipped: true };
  }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from: FROM_EMAIL, to: [to], subject, html }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err);
  }
  return { ok: true };
}

async function main() {
  const client = await pool.connect();
  try {
    const { rows } = await client.query(
      `SELECT id, to_email, subject, body_html FROM email_queue WHERE status = 'pending' ORDER BY created_at LIMIT 50`
    );
    for (const row of rows) {
      try {
        await sendViaResend(row.to_email, row.subject, row.body_html);
        await client.query(
          `UPDATE email_queue SET status = 'sent', sent_at = now() WHERE id = $1`,
          [row.id]
        );
        console.log(`Sent: ${row.subject} → ${row.to_email}`);
      } catch (e) {
        await client.query(
          `UPDATE email_queue SET status = 'failed', error = $2 WHERE id = $1`,
          [row.id, e.message]
        );
        console.error(`Failed ${row.id}:`, e.message);
      }
    }
    console.log(`Processed ${rows.length} email(s)`);
  } finally {
    client.release();
    await pool.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
