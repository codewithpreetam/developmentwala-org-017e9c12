import { createClient } from '@/lib/supabase/client';
import { getSessionUser } from '@/lib/supabase/auth';
import { sortRows } from '@/lib/supabase/mappers';

const supabase = createClient();

async function getUserByEmail(email) {
  const { data } = await supabase.from('users').select('*').eq('email', email).maybeSingle();
  return data;
}

function mapBlogPost(row) {
  return {
    id: row.id,
    title: row.title,
    slug: row.slug,
    content: row.content,
    excerpt: row.excerpt,
    featured_image: row.featured_image,
    categories: row.categories || [],
    tags: row.tags,
    status: row.status,
    meta_title: row.meta_title,
    meta_description: row.meta_description,
    author_name: row.author_name,
    read_time: row.read_time,
    created_date: row.created_at,
    updated_date: row.updated_at,
  };
}

function mapBlogCategory(row) {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    created_date: row.created_at,
  };
}

export const BlogPost = {
  async list(sort = '-created_at', limit = 100) {
    const { data, error } = await supabase.from('blog_posts').select('*').limit(limit);
    if (error) throw error;
    return sortRows((data || []).map(mapBlogPost), sort === '-created_date' ? '-created_at' : sort);
  },
  async filter(criteria = {}, sort = '-created_at', limit = 100) {
    let query = supabase.from('blog_posts').select('*');
    if (criteria.status) query = query.eq('status', criteria.status);
    if (criteria.slug) query = query.eq('slug', criteria.slug);
    if (criteria.id) query = query.eq('id', criteria.id);
    const { data, error } = await query.limit(limit);
    if (error) throw error;
    let rows = (data || []).map(mapBlogPost);
    if (criteria.categories?.length) {
      rows = rows.filter((r) => criteria.categories.some((c) => r.categories?.includes(c)));
    }
    return sortRows(rows, sort === '-created_date' ? '-created_at' : sort);
  },
  async create(payload) {
    const { data, error } = await supabase.from('blog_posts').insert({
      title: payload.title,
      slug: payload.slug || payload.title?.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
      content: payload.content,
      excerpt: payload.excerpt,
      featured_image: payload.featured_image,
      categories: payload.categories || [],
      tags: payload.tags,
      status: payload.status || 'draft',
      meta_title: payload.meta_title,
      meta_description: payload.meta_description,
      author_name: payload.author_name,
      read_time: payload.read_time,
      updated_at: new Date().toISOString(),
    }).select('*').single();
    if (error) throw error;
    return mapBlogPost(data);
  },
  async update(id, payload) {
    const { data, error } = await supabase.from('blog_posts').update({ ...payload, updated_at: new Date().toISOString() }).eq('id', id).select('*').single();
    if (error) throw error;
    return mapBlogPost(data);
  },
  async delete(id) {
    const { error } = await supabase.from('blog_posts').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export const BlogCategory = {
  async list(sort = 'name', limit = 50) {
    const { data, error } = await supabase.from('blog_categories').select('*').limit(limit);
    if (error) throw error;
    return sortRows((data || []).map(mapBlogCategory), sort);
  },
  async filter(criteria = {}) {
    let query = supabase.from('blog_categories').select('*');
    if (criteria.slug) query = query.eq('slug', criteria.slug);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map(mapBlogCategory);
  },
  async create(payload) {
    const { data, error } = await supabase.from('blog_categories').insert(payload).select('*').single();
    if (error) throw error;
    return mapBlogCategory(data);
  },
  async update(id, payload) {
    const { data, error } = await supabase.from('blog_categories').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return mapBlogCategory(data);
  },
  async delete(id) {
    const { error } = await supabase.from('blog_categories').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export const SiteSettings = {
  async filter() {
    const { data, error } = await supabase.from('site_settings').select('*').limit(1).maybeSingle();
    if (error) throw error;
    if (!data) return [{ id: 'default', settings: {} }];
    return [{ id: data.id, ...data.settings, settings: data.settings, updated_date: data.updated_at }];
  },
  async update(id, payload) {
    const settings = payload.settings || payload;
    const { data, error } = await supabase.from('site_settings').update({
      settings,
      updated_at: new Date().toISOString(),
    }).eq('id', id).select('*').single();
    if (error) throw error;
    return { id: data.id, settings: data.settings };
  },
  async create(payload) {
    const { data, error } = await supabase.from('site_settings').insert({
      settings: payload.settings || payload,
    }).select('*').single();
    if (error) throw error;
    return { id: data.id, settings: data.settings };
  },
};

export const ContactMessage = {
  async list(sort = '-created_at', limit = 200) {
    const { data, error } = await supabase.from('contact_messages').select('*').order('created_at', { ascending: false }).limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, created_date: r.created_at }));
  },
  async filter(criteria = {}) {
    let query = supabase.from('contact_messages').select('*');
    if (criteria.status) query = query.eq('status', criteria.status);
    if (criteria.user_id) query = query.eq('user_id', criteria.user_id);
    const { data, error } = await query.order('created_at', { ascending: false });
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, created_date: r.created_at }));
  },
  async listForUser(userId, limit = 100) {
    if (!userId) return [];
    const { data, error } = await supabase
      .from('contact_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;
    return (data || []).map((r) => ({ ...r, created_date: r.created_at }));
  },
  async create(payload) {
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    const { data, error } = await supabase.from('contact_messages').insert({
      name: payload.name,
      email: payload.email,
      subject: payload.subject,
      message: payload.message,
      status: 'new',
      user_id: authUser?.id || null,
      unread_for_admin: true,
      unread_for_user: false,
    }).select('*').single();
    if (error) throw error;
    return { ...data, created_date: data.created_at };
  },
  async update(id, payload) {
    const { data, error } = await supabase.from('contact_messages').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
  async delete(id) {
    const { error } = await supabase.from('contact_messages').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  },
};

export const ContactReply = {
  async listForMessage(messageId) {
    if (!messageId) return [];
    const { data, error } = await supabase
      .from('contact_message_replies')
      .select('*')
      .eq('message_id', messageId)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return data || [];
  },
  async send({ messageId, body, role, senderName }) {
    const { data: authData } = await supabase.auth.getUser();
    const authUser = authData?.user;
    if (!authUser) throw new Error('Not authenticated');
    const { data, error } = await supabase.from('contact_message_replies').insert({
      message_id: messageId,
      body: String(body || '').trim(),
      sender_role: role,
      sender_id: authUser.id,
      sender_name: senderName || authUser.email,
    }).select('*').single();
    if (error) throw error;
    return data;
  },
};

export const EmailSubscription = {
  async filter(criteria = {}) {
    let query = supabase.from('email_subscriptions').select('*');
    if (criteria.user_email) query = query.eq('user_email', criteria.user_email);
    if (criteria.email) query = query.eq('email', criteria.email);
    if (criteria.active !== undefined) query = query.eq('active', criteria.active);
    const { data, error } = await query;
    if (error) throw error;
    return (data || []).map((r) => ({
      id: r.id,
      user_email: r.user_email || r.email,
      email: r.email,
      full_name: r.full_name,
      active: r.active,
      sector_interests: r.sector_interests || [],
      opportunity_types: r.opportunity_types || [],
      frequency: 'weekly',
      created_date: r.created_at,
    }));
  },
  async create(payload) {
    const email = (payload.email || payload.user_email || '').trim().toLowerCase();
    const { data: existing } = await supabase.from('email_subscriptions').select('*').eq('email', email).maybeSingle();
    if (existing) {
      return {
        id: existing.id,
        user_email: existing.email,
        email: existing.email,
        active: existing.active,
        already_subscribed: true,
      };
    }
    const { data, error } = await supabase.from('email_subscriptions').upsert({
      email,
      user_email: payload.user_email || email,
      full_name: payload.full_name,
      opportunity_types: payload.opportunity_types || ['job', 'internship', 'fellowship', 'scholarship', 'grant', 'event'],
      sector_interests: payload.sector_interests || [],
      active: true,
      source: payload.source || 'app',
    }, { onConflict: 'email' }).select('*').single();
    if (error) throw error;
    return { id: data.id, user_email: data.email, email: data.email, active: data.active, success: true };
  },
  async update(id, payload) {
    const { data, error } = await supabase.from('email_subscriptions').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    return data;
  },
};

function mapInterview(row) {
  const scheduled = row.scheduled_at ? new Date(row.scheduled_at) : null;
  return {
    id: row.id,
    application_id: row.application_id,
    employer_email: row.employer_email,
    employer_id: row.employer_id,
    candidate_email: row.candidate_email,
    candidate_id: row.candidate_id,
    job_title: row.opportunity_title,
    opportunity_title: row.opportunity_title,
    date: scheduled ? scheduled.toISOString().split('T')[0] : null,
    start_time: scheduled ? scheduled.toTimeString().slice(0, 5) : null,
    scheduled_at: row.scheduled_at,
    duration: row.duration_minutes,
    meeting_link: row.meeting_link,
    location: row.location,
    interview_type: row.mode || 'video',
    status: row.status || 'confirmed',
    notes: row.notes,
    created_date: row.created_at,
  };
}

const INTERVIEW_COLUMNS = new Set([
  'application_id', 'candidate_id', 'candidate_email', 'employer_id', 'employer_email',
  'opportunity_title', 'scheduled_at', 'duration_minutes', 'mode', 'meeting_link',
  'location', 'status', 'notes',
]);

export const Interview = {
  async filter(criteria = {}, sort = '-created_at', limit = 100) {
    let query = supabase.from('interviews').select('*');
    if (criteria.employer_email) query = query.eq('employer_email', criteria.employer_email);
    if (criteria.candidate_email) query = query.eq('candidate_email', criteria.candidate_email);
    if (criteria.candidate_id) query = query.eq('candidate_id', criteria.candidate_id);
    if (criteria.application_id) query = query.eq('application_id', criteria.application_id);
    const { data, error } = await query.limit(limit);
    if (error) throw error;
    const rows = (data || []).map(mapInterview);

    // Enrich with candidate names from public.users
    const ids = [...new Set(rows.map(r => r.candidate_id).filter(Boolean))];
    const emails = [...new Set(rows.filter(r => !r.candidate_id && r.candidate_email).map(r => r.candidate_email))];
    const nameById = {};
    const nameByEmail = {};
    if (ids.length) {
      const { data: us } = await supabase.from('users').select('id,email,first_name,last_name').in('id', ids);
      (us || []).forEach(u => {
        const n = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || (u.email ? u.email.split('@')[0] : '');
        nameById[u.id] = n;
      });
    }
    if (emails.length) {
      const { data: us } = await supabase.from('users').select('email,first_name,last_name').in('email', emails);
      (us || []).forEach(u => {
        const n = [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || (u.email ? u.email.split('@')[0] : '');
        nameByEmail[u.email] = n;
      });
    }
    rows.forEach(r => {
      r.candidate_name = nameById[r.candidate_id] || nameByEmail[r.candidate_email] || (r.candidate_email ? r.candidate_email.split('@')[0] : 'Candidate');
    });
    return sortRows(rows, sort === '-created_date' ? '-created_at' : sort);
  },
  async create(payload) {
    let scheduledAt = null;
    if (payload.date && payload.start_time) {
      scheduledAt = new Date(`${payload.date}T${payload.start_time}:00`).toISOString();
    } else if (payload.scheduled_at) {
      scheduledAt = payload.scheduled_at;
    }
    // application_id column is bigint in DB but our app uses uuid; only pass it when numeric
    const appIdNum = payload.application_id && /^\d+$/.test(String(payload.application_id)) ? Number(payload.application_id) : null;
    const insert = {
      application_id: appIdNum,
      candidate_id: payload.candidate_id || null,
      candidate_email: payload.candidate_email,
      employer_id: payload.employer_id || null,
      employer_email: payload.employer_email,
      opportunity_title: payload.job_title || payload.opportunity_title,
      scheduled_at: scheduledAt,
      duration_minutes: payload.duration || payload.duration_minutes || 30,
      mode: payload.interview_type || 'video',
      meeting_link: payload.meeting_link,
      location: payload.location,
      status: payload.status || 'confirmed',
      notes: payload.notes,
    };
    const { data, error } = await supabase.from('interviews').insert(insert).select('*').single();
    if (error) throw error;
    return mapInterview(data);
  },
  async update(id, payload) {
    const patch = {};
    if (payload.date && payload.start_time) {
      patch.scheduled_at = new Date(`${payload.date}T${payload.start_time}:00`).toISOString();
    } else if (payload.scheduled_at) {
      patch.scheduled_at = payload.scheduled_at;
    }
    if (payload.duration != null) patch.duration_minutes = payload.duration;
    if (payload.interview_type) patch.mode = payload.interview_type;
    // Whitelist any remaining known columns
    for (const k of Object.keys(payload)) {
      if (INTERVIEW_COLUMNS.has(k)) patch[k] = payload[k];
    }
    const { data, error } = await supabase.from('interviews').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    return mapInterview(data);
  },
  async delete(id) {
    const { error } = await supabase.from('interviews').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

export const Testimonial = {
  async filter(criteria = {}) {
    let query = supabase.from('testimonials').select('*');
    if (criteria.featured) query = query.eq('featured', true);
    const { data, error } = await query.order('sort_order', { ascending: true });
    if (error) throw error;
    return data || [];
  },
};

export async function queueNotificationEmail(toEmail, subject, bodyHtml) {
  const { error } = await supabase.from('email_queue').insert({
    to_email: toEmail,
    subject,
    body_html: bodyHtml,
  });
  if (error) throw error;
}

export async function getProfileCompletion(userId) {
  const { data, error } = await supabase.rpc('candidate_profile_completion', { p_user_id: userId });
  if (error) return 0;
  return data ?? 0;
}

export async function searchOpportunities(type, params = {}) {
  const { data, error } = await supabase.rpc('search_opportunities', {
    p_type: type,
    p_query: params.query || null,
    p_location: params.location || null,
    p_sector: params.sector || null,
    p_experience_min: params.experienceMin ?? null,
    p_sort: params.sort || 'newest',
    p_limit: params.limit || 20,
    p_offset: params.offset || 0,
  });
  if (error) throw error;
  return data || [];
}
