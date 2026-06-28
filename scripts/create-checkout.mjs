#!/usr/bin/env node
/**
 * Create a Stripe Checkout session for employer featured listings.
 * Usage: node --env-file=.env scripts/create-checkout.mjs employer@example.com
 */
const email = process.argv[2];
const STRIPE_SECRET = process.env.STRIPE_SECRET_KEY;
const BASE_URL = process.env.APP_BASE_URL || 'http://localhost:5173';

if (!STRIPE_SECRET) {
  console.error('Set STRIPE_SECRET_KEY in .env');
  process.exit(1);
}

const params = new URLSearchParams({
  'mode': 'payment',
  'success_url': `${BASE_URL}/EmployerDashboard?payment=success`,
  'cancel_url': `${BASE_URL}/Pricing?payment=cancelled`,
  'line_items[0][price_data][currency]': 'inr',
  'line_items[0][price_data][product_data][name]': 'Featured Listing — 30 days',
  'line_items[0][price_data][unit_amount]': '499900',
  'line_items[0][quantity]': '1',
});
if (email) params.set('customer_email', email);

const res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${STRIPE_SECRET}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: params,
});

const data = await res.json();
if (!res.ok) {
  console.error(data);
  process.exit(1);
}
console.log(JSON.stringify({ url: data.url, id: data.id }, null, 2));
