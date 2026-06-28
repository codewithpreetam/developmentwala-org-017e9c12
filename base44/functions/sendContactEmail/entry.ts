import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { name, email, phone, subject, message } = await req.json();

    if (!name || !email || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save to database
    const record = await base44.asServiceRole.entities.ContactMessage.create({
      name, email, phone: phone || '', subject: subject || '', message, read: false
    });

    // Send email notification to admin
    await base44.asServiceRole.integrations.Core.SendEmail({
      to: 'jobboardsupport@developmentwala.org',
      from_name: 'DevelopmentWala Contact Form',
      subject: `New Contact Form Message: ${subject || 'No Subject'}`,
      body: `
<h2>New Contact Form Submission</h2>
<p><strong>Name:</strong> ${name}</p>
<p><strong>Email:</strong> ${email}</p>
${phone ? `<p><strong>Phone:</strong> ${phone}</p>` : ''}
<p><strong>Subject:</strong> ${subject || 'N/A'}</p>
<hr />
<p><strong>Message:</strong></p>
<p>${message.replace(/\n/g, '<br/>')}</p>
      `.trim()
    });

    return Response.json({ success: true, id: record.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});