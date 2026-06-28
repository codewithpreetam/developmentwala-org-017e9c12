import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Allow both scheduled (service role) and manual admin trigger
    const user = await base44.auth.me().catch(() => null);
    const isScheduled = !user; // called by automation with no user token

    if (user && user.role !== 'admin') {
      return Response.json({ error: 'Forbidden' }, { status: 403 });
    }

    const sdk = base44.asServiceRole;

    // Fetch all active subscriptions
    const subscriptions = await sdk.entities.EmailSubscription.filter({ active: true });
    if (!subscriptions.length) {
      return Response.json({ sent: 0, message: 'No active subscriptions' });
    }

    // Fetch opportunities created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    const since = sevenDaysAgo.toISOString();

    const [jobs, internships, fellowships, scholarships, grants, events] = await Promise.all([
      sdk.entities.Job.filter({ status: 'published' }),
      sdk.entities.Internship.filter({ status: 'published' }),
      sdk.entities.Fellowship.filter({ status: 'published' }),
      sdk.entities.Scholarship.filter({ status: 'published' }),
      sdk.entities.Grant.filter({ status: 'published' }),
      sdk.entities.Event.filter({ status: 'published' }),
    ]);

    const allNew = [
      ...jobs.map(j => ({ ...j, _type: 'job', _label: 'Job', _org: j.organization || '', _page: 'JobDetail' })),
      ...internships.map(j => ({ ...j, _type: 'internship', _label: 'Internship', _org: j.organization_name || '', _page: 'InternshipDetail' })),
      ...fellowships.map(j => ({ ...j, _type: 'fellowship', _label: 'Fellowship', _org: j.organization_name || '', _page: 'FellowshipDetail' })),
      ...scholarships.map(j => ({ ...j, _type: 'scholarship', _label: 'Scholarship', _org: j.provider_name || '', _page: 'ScholarshipDetail' })),
      ...grants.map(j => ({ ...j, _type: 'grant', _label: 'Grant', _org: j.funding_agency || '', _page: 'GrantDetail' })),
      ...events.map(j => ({ ...j, _type: 'event', _label: 'Event', _org: j.organizer_name || '', _page: 'EventDetail' })),
    ].filter(item => new Date(item.created_date) >= sevenDaysAgo);

    let sentCount = 0;

    for (const sub of subscriptions) {
      // Filter by subscriber's opted-in types
      const types = sub.opportunity_types?.length ? sub.opportunity_types : ['job', 'grant', 'internship', 'fellowship', 'scholarship', 'event'];
      const sectors = sub.sector_interests || [];

      const relevant = allNew.filter(item => {
        const typeMatch = types.includes(item._type);
        const sectorMatch = sectors.length === 0 || sectors.includes(item.sector);
        return typeMatch && sectorMatch;
      });

      if (!relevant.length) continue;

      // Build email HTML
      const rows = relevant.slice(0, 20).map(item => `
        <tr>
          <td style="padding:12px 16px;border-bottom:1px solid #f3f4f6;">
            <span style="display:inline-block;background:#e0e7ff;color:#4338ca;font-size:11px;font-weight:600;padding:2px 8px;border-radius:20px;margin-bottom:4px;">${item._label}</span>
            <div style="font-weight:600;color:#111827;font-size:15px;margin-bottom:2px;">${item.title}</div>
            ${item._org ? `<div style="color:#6b7280;font-size:13px;">${item._org}</div>` : ''}
            ${item.deadline || item.application_deadline ? `<div style="color:#ef4444;font-size:12px;margin-top:2px;">Deadline: ${item.deadline || item.application_deadline}</div>` : ''}
          </td>
        </tr>
      `).join('');

      const emailBody = `
        <div style="font-family:'Inter',Arial,sans-serif;max-width:600px;margin:0 auto;background:#ffffff;">
          <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 24px;text-align:center;border-radius:12px 12px 0 0;">
            <h1 style="color:white;margin:0;font-size:24px;font-weight:700;">Your Weekly Opportunities</h1>
            <p style="color:#c7d2fe;margin:8px 0 0;font-size:14px;">Fresh listings from Development Wala</p>
          </div>
          <div style="padding:24px;">
            <p style="color:#374151;font-size:15px;margin-bottom:20px;">Hi ${sub.full_name || 'there'},<br/><br/>Here are <strong>${relevant.length}</strong> new opportunities posted this week that match your interests:</p>
            <table style="width:100%;border-collapse:collapse;background:#f9fafb;border-radius:8px;overflow:hidden;">
              ${rows}
            </table>
            <div style="text-align:center;margin-top:28px;">
              <a href="https://www.developmentwala.org" style="background:#4f46e5;color:white;text-decoration:none;padding:12px 32px;border-radius:8px;font-weight:600;font-size:15px;display:inline-block;">Browse All Opportunities →</a>
            </div>
            <hr style="border:none;border-top:1px solid #e5e7eb;margin:28px 0;"/>
            <p style="color:#9ca3af;font-size:12px;text-align:center;">You're receiving this because you subscribed to weekly alerts on Development Wala.<br/>To unsubscribe, visit your <a href="https://www.developmentwala.org/CandidateDashboard" style="color:#4f46e5;">dashboard settings</a>.</p>
          </div>
        </div>
      `;

      await sdk.integrations.Core.SendEmail({
        to: sub.user_email,
        subject: `🔔 ${relevant.length} New Opportunities This Week – Development Wala`,
        body: emailBody,
        from_name: 'Development Wala Alerts',
      });

      // Update last_sent_at
      await sdk.entities.EmailSubscription.update(sub.id, { last_sent_at: new Date().toISOString() });

      sentCount++;
    }

    return Response.json({ sent: sentCount, total_subscriptions: subscriptions.length, new_opportunities: allNew.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});