// Server-only Mailchimp helpers. Never import from client code.
import { createHash } from "node:crypto";

const SERVER = process.env.MAILCHIMP_SERVER_PREFIX || "us16";
const API_KEY = process.env.MAILCHIMP_API_KEY || "";
const LIST_ID = process.env.MAILCHIMP_LIST_ID || "";
const BASE = `https://${SERVER}.api.mailchimp.com/3.0`;
const DOUBLE_OPT_IN = true;

const DEFAULT_TAGS = ["DevelopmentWala.org", "Newsletter", "Website Subscriber"];

function authHeader() {
  return "Basic " + Buffer.from(`anystring:${API_KEY}`).toString("base64");
}

function subscriberHash(email: string) {
  return createHash("md5").update(email.trim().toLowerCase()).digest("hex");
}

async function mc<T = any>(
  path: string,
  init: RequestInit & { retries?: number } = {},
): Promise<{ ok: boolean; status: number; data: T | null; error?: string }> {
  if (!API_KEY || !LIST_ID) {
    return { ok: false, status: 500, data: null, error: "Mailchimp not configured" };
  }
  const retries = init.retries ?? 2;
  let lastErr = "";
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(`${BASE}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          Authorization: authHeader(),
          ...(init.headers || {}),
        },
      });
      const text = await res.text();
      const data = text ? JSON.parse(text) : null;
      if (res.status === 429 || res.status >= 500) {
        lastErr = `mailchimp_${res.status}`;
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      return { ok: res.ok, status: res.status, data, error: res.ok ? undefined : (data as any)?.detail };
    } catch (e: any) {
      lastErr = e?.message || "network_error";
      await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
    }
  }
  return { ok: false, status: 0, data: null, error: lastErr };
}

export async function subscribeEmail(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  source?: string;
}) {
  const email = (input.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { success: false, error: "Please enter a valid email address." };
  }
  const hash = subscriberHash(email);

  // Check if already subscribed (clean status)
  const existing = await mc<any>(`/lists/${LIST_ID}/members/${hash}`, { method: "GET", retries: 1 });
  if (existing.ok && existing.data?.status === "subscribed") {
    // Ensure tags
    await mc(`/lists/${LIST_ID}/members/${hash}/tags`, {
      method: "POST",
      body: JSON.stringify({ tags: DEFAULT_TAGS.map((name) => ({ name, status: "active" })) }),
    });
    return { success: true, already_subscribed: true };
  }

  // Upsert with double opt-in
  const upsert = await mc<any>(`/lists/${LIST_ID}/members/${hash}`, {
    method: "PUT",
    body: JSON.stringify({
      email_address: email,
      status_if_new: DOUBLE_OPT_IN ? "pending" : "subscribed",
      status: existing.ok && existing.data?.status === "pending" ? "pending" : undefined,
      merge_fields: {
        ...(input.firstName ? { FNAME: input.firstName } : {}),
        ...(input.lastName ? { LNAME: input.lastName } : {}),
        ...(input.source ? { SOURCE: input.source } : { SOURCE: "DevelopmentWala.org" }),
      },
      tags: DEFAULT_TAGS,
    }),
  });

  if (!upsert.ok) {
    if (upsert.status === 400 && /already a list member/i.test(upsert.error || "")) {
      return { success: true, already_subscribed: true };
    }
    console.error("[mailchimp] subscribe failed", upsert.status, upsert.error);
    return { success: false, error: "Subscription failed. Please try again later." };
  }

  // Add tags explicitly (PUT-as-create sometimes ignores tag merges on update)
  await mc(`/lists/${LIST_ID}/members/${hash}/tags`, {
    method: "POST",
    body: JSON.stringify({ tags: DEFAULT_TAGS.map((name) => ({ name, status: "active" })) }),
  });

  return {
    success: true,
    pending: DOUBLE_OPT_IN && upsert.data?.status === "pending",
  };
}

export async function getNewsletterStats() {
  if (!API_KEY || !LIST_ID) {
    return { configured: false as const };
  }
  const list = await mc<any>(`/lists/${LIST_ID}`, { method: "GET" });
  const growth = await mc<any>(`/lists/${LIST_ID}/growth-history?count=2&sort_field=month&sort_dir=DESC`, { method: "GET" });
  const reports = await mc<any>(`/reports?count=10&type=rss&sort_field=send_time&sort_dir=DESC`, { method: "GET" });

  const stats = list.data?.stats || {};
  const reportsList = reports.data?.reports || [];
  const totalsSent = reportsList.length;
  const opensAvg = totalsSent
    ? reportsList.reduce((s: number, r: any) => s + (r.opens?.open_rate || 0), 0) / totalsSent
    : (stats.open_rate || 0) / 100;
  const clicksAvg = totalsSent
    ? reportsList.reduce((s: number, r: any) => s + (r.clicks?.click_rate || 0), 0) / totalsSent
    : (stats.click_rate || 0) / 100;
  const lastReport = reportsList[0];

  return {
    configured: true as const,
    listName: list.data?.name || "",
    memberCount: stats.member_count || 0,
    unsubscribeCount: stats.unsubscribe_count || 0,
    cleanedCount: stats.cleaned_count || 0,
    weeklyGrowth: growth.data?.history?.[0]?.subscribed || 0,
    lastSubscribeAt: stats.last_sub_date || null,
    avgOpenRate: opensAvg,
    avgClickRate: clicksAvg,
    totalCampaignsSent: totalsSent,
    lastCampaign: lastReport
      ? {
          name: lastReport.campaign_title || lastReport.subject_line,
          sentAt: lastReport.send_time,
          openRate: lastReport.opens?.open_rate || 0,
          clickRate: lastReport.clicks?.click_rate || 0,
          emailsSent: lastReport.emails_sent || 0,
        }
      : null,
  };
}
