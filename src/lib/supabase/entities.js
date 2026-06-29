import { createClient } from '@/lib/supabase/client';
import { getSessionUser } from '@/lib/supabase/auth';
import {
  mapJob,
  mapInternship,
  mapFellowship,
  mapScholarship,
  mapGrant,
  mapEvent,
  mapEmployer,
  mapUserProfile,
  mapApplication,
  mapSavedJob,
  mapSavedOpportunity,
  mapNotification,
  applyPublishedFilter,
  sortRows,
} from '@/lib/supabase/mappers';
import {
  BlogPost,
  BlogCategory,
  SiteSettings,
  ContactMessage,
  EmailSubscription,
  Interview,
  Testimonial,
  queueNotificationEmail,
} from '@/lib/supabase/extra-entities';
import { toOpportunityInsert } from '@/lib/supabase/insert-mappers';

const OPPORTUNITY_TABLES = {
  job: { table: 'jobs', map: mapJob, employerCol: 'employer_id', titleCol: 'title' },
  internship: { table: 'internships', map: mapInternship, employerCol: 'employer_id', titleCol: 'title' },
  fellowship: { table: 'fellowships', map: mapFellowship, employerCol: 'employer_id', titleCol: 'title' },
  scholarship: { table: 'scholarships', map: mapScholarship, employerCol: 'employer_id', titleCol: 'title' },
  grant: { table: 'grants', map: mapGrant, employerCol: 'employer_id', titleCol: 'title' },
  event: { table: 'events', map: mapEvent, employerCol: 'owner_id', titleCol: 'title' },
};

const supabase = createClient();

async function getUserByEmail(email) {
  if (!email) return null;
  const trimmed = String(email).trim();
  const { data } = await supabase.from('users').select('*').ilike('email', trimmed).maybeSingle();
  return data;
}

function employerColumnForType(type) {
  return OPPORTUNITY_TABLES[type]?.employerCol || 'employer_id';
}

async function resolveOwnerIdFromEmail(email) {
  const user = await getUserByEmail(email);
  if (user?.id) return user.id;
  const session = getSessionUser();
  if (session?.email && session.email.toLowerCase() === String(email).trim().toLowerCase()) {
    return session.id;
  }
  return null;
}

function applicationOpportunityFilter(query, opportunityId) {
  const id = String(opportunityId).trim();
  // Quote UUIDs so PostgREST does not treat hyphens as filter syntax.
  return query.or(`opportunity_id.eq."${id}",job_id.eq."${id}"`);
}

async function resolveEmployerEmailForOpportunity(oppType, oppId) {
  const meta = OPPORTUNITY_TABLES[oppType] || OPPORTUNITY_TABLES.job;
  const { data: opp } = await supabase
    .from(meta.table)
    .select(meta.employerCol)
    .eq('id', oppId)
    .maybeSingle();
  const ownerId = opp?.[meta.employerCol];
  if (!ownerId) return null;
  const employer = await getUserById(ownerId);
  return employer?.email || null;
}

async function getUserById(id) {
  const { data } = await supabase.from('users').select('*').eq('id', id).maybeSingle();
  return data;
}

function matchesCriteria(row, criteria = {}) {
  return Object.entries(criteria).every(([key, value]) => {
    if (value === undefined || value === null) return true;
    if (key === 'status' && value === 'published') {
      return row.status === 'published' || row.is_active === true || row.status === 'Active';
    }
    if (key === 'opportunity_type') return true;
    if (key === 'user_email') return true;
    if (key === 'applicant_email') return true;
    if (key === 'employer_email') return true;
    if (key === 'submitted_by_email') return true;
    if (key === 'created_by') return true;
    if (key === 'employer_user_id') return true;
    if (key === 'user_type') return true;
    return row[key] === value;
  });
}

async function enrichWithEmployerEmail(rows, mapFn) {
  const employerIds = [...new Set(rows.map((r) => r.employer_id || r.owner_id).filter(Boolean))];
  const emailByEmployerId = {};
  const nameByEmployerId = {};
  const designationByEmployerId = {};

  if (employerIds.length) {
    const [{ data: users }, { data: profiles }] = await Promise.all([
      supabase.from('users').select('id,email,first_name,last_name').in('id', employerIds),
      supabase.from('employer_profiles').select('user_id,data').in('user_id', employerIds),
    ]);

    (users || []).forEach((u) => {
      emailByEmployerId[u.id] = u.email;
      nameByEmployerId[u.id] = [u.first_name, u.last_name].filter(Boolean).join(' ').trim();
    });
    (profiles || []).forEach((p) => {
      const data = p.data || {};
      if (data.fullName) nameByEmployerId[p.user_id] = data.fullName;
      if (data.roleDesignation) designationByEmployerId[p.user_id] = data.roleDesignation;
    });
  }

  return rows.map((row) => {
    const employerId = row.employer_id || row.owner_id;
    const email = employerId ? emailByEmployerId[employerId] : null;
    return mapFn(row, {
      submitted_by_email: email,
      created_by: email,
      submitted_by_name: row.contact_name || (employerId ? nameByEmployerId[employerId] : null) || null,
      posted_by_designation: employerId ? designationByEmployerId[employerId] : null,
    });
  });
}

function createTableEntity(table, mapFn, type = 'job') {
  return {
    async list(sort = '-created_at', limit = 200) {
      const { data, error } = await supabase.from(table).select('*').limit(limit);
      if (error) throw error;
      return sortRows(await enrichWithEmployerEmail(data || [], mapFn), sort);
    },

    async filter(criteria = {}, sort = '-created_at', limit = 200) {
      let query = supabase.from(table).select('*');
      const employerCol = employerColumnForType(type);
      const employerEmail = criteria.submitted_by_email || criteria.created_by;

      if (criteria.employer_user_id) {
        query = query.eq(employerCol, criteria.employer_user_id);
      } else if (employerEmail) {
        const ownerId = await resolveOwnerIdFromEmail(employerEmail);
        if (!ownerId) return [];
        query = query.eq(employerCol, ownerId);
      }
      if (criteria.status === 'published') {
        if (type === 'job') query = query.eq('is_active', true);
        else if (type !== 'event') query = query.in('status', ['Active', 'active', 'published']);
      }
      if (criteria.featured === true) query = query.eq('featured', true);
      if (criteria.id) query = query.eq('id', criteria.id);
      if (criteria.slug) query = query.eq('slug', criteria.slug);

      const { data, error } = await query.limit(limit);
      if (error) throw error;

      let rows = data || [];
      rows = rows.filter((row) => matchesCriteria(mapFn(row), criteria));
      return sortRows(await enrichWithEmployerEmail(rows, mapFn), sort);
    },

    async create(payload) {
      const session = getSessionUser();
      // Always tie listings to the logged-in poster; contact email is display-only.
      let employerId = session?.id || payload.employer_id;
      if (!employerId) {
        const employerEmail = payload.submitted_by_email || payload.created_by;
        if (employerEmail) {
          employerId = await resolveOwnerIdFromEmail(employerEmail);
        }
      }
      if (!employerId) {
        throw new Error('You must be signed in to post an opportunity.');
      }

      const insert = toOpportunityInsert(type, payload, { employerId });
      const { data, error } = await supabase.from(table).insert(insert).select('*').single();
      if (error) throw error;
      return mapFn(data);
    },

    async update(id, payload) {
      const patch = { ...payload };
      if (type === 'job') {
        if (patch.status === 'published') patch.is_active = true;
        if (patch.status === 'draft' || patch.status === 'rejected' || patch.status === 'pending') patch.is_active = false;
        delete patch.status;
      } else if (patch.status) {
        if (patch.status === 'published') patch.status = 'Active';
        if (patch.status === 'draft' || patch.status === 'rejected' || patch.status === 'pending') patch.status = 'Inactive';
      }
      const { data, error } = await supabase.from(table).update(patch).eq('id', id).select('*').single();
      if (error) throw error;
      return mapFn(data);
    },

    async delete(id) {
      const { error } = await supabase.from(table).delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  };
}

const Job = createTableEntity('jobs', mapJob, 'job');
const Internship = createTableEntity('internships', mapInternship, 'internship');
const Fellowship = createTableEntity('fellowships', mapFellowship, 'fellowship');
const Scholarship = createTableEntity('scholarships', mapScholarship, 'scholarship');
const Grant = createTableEntity('grants', mapGrant, 'grant');
const Event = createTableEntity('events', mapEvent, 'event');

function mapOrganizationRow(row, extra = {}) {
  return {
    ...mapEmployer(row),
    user_email: extra.user_email || row.email || null,
    contact_email: extra.contact_email || extra.user_email || row.email || null,
    linkedin_url: row.social_linkedin || '',
    twitter_url: row.social_twitter || '',
    facebook_url: row.social_facebook || '',
    instagram_url: row.social_instagram || '',
    ngo_type: extra.ngo_type || '',
  };
}

async function syncEmployerOrgMeta(userEmail, { ngo_type } = {}) {
  if (!userEmail || ngo_type === undefined) return;
  const user = await getUserByEmail(userEmail);
  if (!user) return;
  const { data: existing } = await supabase
    .from('employer_profiles')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();
  await supabase.from('employer_profiles').upsert({
    user_id: user.id,
    profile_completed: true,
    data: { ...(existing?.data || {}), organizationType: ngo_type },
    updated_at: new Date().toISOString(),
  });
}

function organizationPatchFromPayload(payload = {}) {
  const patch = {};
  if (payload.logo_url !== undefined) patch.logo = payload.logo_url || null;
  if (payload.location !== undefined || payload.city !== undefined) {
    patch.location = payload.city || payload.location || null;
  }
  if (payload.sector !== undefined || payload.tags !== undefined) {
    patch.tags = payload.sector || payload.tags || null;
  }
  if (payload.about !== undefined) patch.about = payload.about || null;
  if (payload.website !== undefined) patch.website = payload.website || null;
  if (payload.contact_email !== undefined || payload.email !== undefined) {
    patch.email = payload.contact_email || payload.email || null;
  }
  if (payload.facebook_url !== undefined) patch.social_facebook = payload.facebook_url || null;
  if (payload.twitter_url !== undefined) patch.social_twitter = payload.twitter_url || null;
  if (payload.linkedin_url !== undefined) patch.social_linkedin = payload.linkedin_url || null;
  if (payload.instagram_url !== undefined) patch.social_instagram = payload.instagram_url || null;
  if (payload.phone !== undefined) patch.phone = payload.phone || null;
  return patch;
}

async function fetchOrganizationsForUser(email, limit = 200) {
  const trimmed = String(email).trim();
  let user = await getUserByEmail(trimmed);
  if (!user) {
    const session = getSessionUser();
    if (session?.email?.toLowerCase() === trimmed.toLowerCase()) user = session;
    else return [];
  }

  const { data: byEmail, error: emailError } = await supabase
    .from('employers')
    .select('*')
    .ilike('email', trimmed)
    .limit(limit);
  if (emailError) throw emailError;

  let rows = byEmail || [];
  const { data: employerProfile } = await supabase
    .from('employer_profiles')
    .select('data')
    .eq('user_id', user.id)
    .maybeSingle();
  const profileData = employerProfile?.data || {};

  if (!rows.length && profileData.organizationName) {
    const { data: byName, error: nameError } = await supabase
      .from('employers')
      .select('*')
      .ilike('name', profileData.organizationName)
      .limit(limit);
    if (nameError) throw nameError;
    rows = byName || [];
  }

  return { rows, userEmail: trimmed, ngo_type: profileData.organizationType || '' };
}

const Organization = {
  async list(sort = '-created_at', limit = 200) {
    const { data, error } = await supabase.from('employers').select('*').limit(limit);
    if (error) throw error;
    return sortRows(data || [], sort).map((row) => mapOrganizationRow(row));
  },

  async filter(criteria = {}, sort = '-created_at', limit = 200) {
    if (criteria.user_email) {
      const { rows, userEmail, ngo_type } = await fetchOrganizationsForUser(criteria.user_email, limit);
      return sortRows(rows, sort).map((row) => mapOrganizationRow(row, {
        user_email: userEmail,
        contact_email: userEmail,
        ngo_type,
      }));
    }

    let query = supabase.from('employers').select('*');

    if (criteria.id != null && criteria.id !== '') {
      const id = Number(criteria.id);
      if (!Number.isNaN(id)) query = query.eq('id', id);
    } else if (criteria.org_name) {
      query = query.ilike('name', `%${String(criteria.org_name).trim()}%`);
    }

    const { data, error } = await query.limit(limit);
    if (error) throw error;
    const rows = data || [];
    return sortRows(rows, sort).map((row) => mapOrganizationRow(row, {
      user_email: criteria.user_email || row.email || null,
      contact_email: criteria.user_email || row.email || null,
    }));
  },

  async create(payload) {
    const { data, error } = await supabase.from('employers').insert({
      name: payload.org_name || payload.name || 'Organization',
      ...organizationPatchFromPayload({
        ...payload,
        contact_email: payload.contact_email ?? payload.email ?? payload.user_email,
      }),
    }).select('*').single();
    if (error) throw error;

    if (payload.ngo_type !== undefined && payload.user_email) {
      await syncEmployerOrgMeta(payload.user_email, { ngo_type: payload.ngo_type });
    }

    return mapOrganizationRow(data, {
      user_email: payload.user_email || data.email,
      contact_email: payload.contact_email || payload.email || data.email,
      ngo_type: payload.ngo_type,
    });
  },

  async update(id, payload) {
    const patch = organizationPatchFromPayload(payload);
    const { data, error } = await supabase.from('employers').update(patch).eq('id', id).select('*').single();
    if (error) throw error;

    let ngoType = payload.ngo_type;
    if (payload.ngo_type !== undefined && payload.user_email) {
      await syncEmployerOrgMeta(payload.user_email, { ngo_type: payload.ngo_type });
    } else if (payload.user_email) {
      const user = await getUserByEmail(payload.user_email);
      if (user) {
        const { data: ep } = await supabase
          .from('employer_profiles')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();
        ngoType = ep?.data?.organizationType || '';
      }
    }

    return mapOrganizationRow(data, {
      user_email: payload.user_email || data.email,
      contact_email: payload.contact_email || payload.email || data.email,
      ngo_type: ngoType ?? '',
    });
  },

  async delete(id) {
    const { error } = await supabase.from('employers').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

const UserProfile = {
  async list(sort = '-created_at', limit = 500) {
    const { data: users, error } = await supabase.from('users').select('*').limit(limit);
    if (error) throw error;
    const profiles = await Promise.all((users || []).map((u) => this.filter({ user_email: u.email })));
    return sortRows(profiles.flat(), sort === '-created_date' ? '-updated_date' : sort);
  },

  async filter(criteria = {}) {
    const email = criteria.user_email;
    if (!email) return [];
    const user = await getUserByEmail(email);
    if (!user) return [];
    if (criteria.user_type === 'employer' && user.role !== 'employer') return [];
    if (criteria.user_type === 'job_seeker' && user.role !== 'candidate') return [];

    const [{ data: candidateProfile }, { data: employerProfile }, { data: candidateSetup }] = await Promise.all([
      supabase.from('candidate_profiles').select('*').eq('user_id', user.user_id).maybeSingle(),
      supabase.from('employer_profiles').select('*').eq('user_id', user.id).maybeSingle(),
      supabase.from('candidate_profiles_setup').select('*').eq('user_id', user.id).maybeSingle(),
    ]);

    return [mapUserProfile(user, candidateProfile, employerProfile, candidateSetup)];
  },

  async create(payload) {
    const user = await getUserByEmail(payload.user_email);
    if (!user) throw new Error('User not found');
    const role = payload.user_type === 'employer' ? 'employer' : 'candidate';
    await supabase.from('users').update({ role }).eq('id', user.id);
    if (role === 'employer') {
      const { data: existing } = await supabase
        .from('employer_profiles')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();
      await supabase.from('employer_profiles').upsert({
        user_id: user.id,
        profile_completed: true,
        data: existing?.data || { organizationName: payload.full_name || user.email.split('@')[0] },
      });
    }
    return this.update(user.id, payload);
  },

  async update(id, payload) {
    const user = await getUserById(id);
    if (!user) throw new Error('User not found');

    const isEmployer = payload.user_type === 'employer' || user.role === 'employer';
    const userPatch = {};

    if (payload.full_name) {
      const parts = payload.full_name.trim().split(/\s+/);
      userPatch.first_name = parts[0] || '';
      userPatch.last_name = parts.slice(1).join(' ') || '';
    }
    if (payload.profile_picture !== undefined) {
      userPatch.profile_image = payload.profile_picture || null;
    }
    if (Object.keys(userPatch).length) {
      await supabase.from('users').update(userPatch).eq('id', user.id);
    }

    if (isEmployer) {
      const { data: existing } = await supabase
        .from('employer_profiles')
        .select('data')
        .eq('user_id', user.id)
        .maybeSingle();
      const prev = existing?.data || {};
      const data = {
        ...prev,
        fullName: payload.full_name ?? prev.fullName,
        roleDesignation: payload.designation ?? prev.roleDesignation,
        age: payload.age !== undefined ? payload.age : prev.age,
        gender: payload.gender ?? prev.gender,
        officeLocation: payload.office_location ?? prev.officeLocation,
        workEmail: payload.email_id ?? prev.workEmail,
        linkedinUrl: payload.employer_linkedin_url ?? prev.linkedinUrl,
        organizationType: payload.ngo_type ?? prev.organizationType,
        profilePicture: payload.profile_picture !== undefined
          ? (payload.profile_picture || null)
          : prev.profilePicture,
      };
      await supabase.from('employer_profiles').upsert({
        user_id: user.id,
        profile_completed: true,
        data,
        updated_at: new Date().toISOString(),
      });
    } else {
      const candidatePatch = { user_id: user.user_id, updated_at: new Date().toISOString() };
      if (payload.profile_picture !== undefined) candidatePatch.profile_picture_url = payload.profile_picture || null;
      if (payload.cv_url !== undefined) candidatePatch.cv_url = payload.cv_url;
      if (payload.skills !== undefined) candidatePatch.skills = payload.skills;
      if (payload.summary !== undefined || payload.biography !== undefined) {
        candidatePatch.biography = payload.summary || payload.biography;
      }
      if (payload.professional_title !== undefined) candidatePatch.professional_title = payload.professional_title;
      if (payload.education !== undefined) candidatePatch.education_level = payload.education;
      if (payload.experience !== undefined) candidatePatch.experience_level = payload.experience;

      const { data: existing } = await supabase
        .from('candidate_profiles')
        .select('id')
        .eq('user_id', user.user_id)
        .maybeSingle();

      if (existing) {
        await supabase.from('candidate_profiles').update(candidatePatch).eq('user_id', user.user_id);
      } else {
        await supabase.from('candidate_profiles').insert(candidatePatch);
      }

      if (payload.phone !== undefined || payload.location !== undefined || payload.sector_interests !== undefined) {
        const { data: setupExisting } = await supabase
          .from('candidate_profiles_setup')
          .select('data')
          .eq('user_id', user.id)
          .maybeSingle();
        const prevSetup = setupExisting?.data || {};
        await supabase.from('candidate_profiles_setup').upsert({
          user_id: user.id,
          profile_completed: true,
          data: {
            ...prevSetup,
            phone: payload.phone ?? prevSetup.phone,
            location: payload.location ?? prevSetup.location,
            sectorInterests: payload.sector_interests ?? prevSetup.sectorInterests,
          },
          updated_at: new Date().toISOString(),
        });
      }
    }

    return (await this.filter({ user_email: user.email }))[0];
  },

  async delete(id) {
    const user = await getUserById(id);
    if (!user) return true;
    await supabase.from('candidate_profiles').delete().eq('user_id', user.user_id);
    await supabase.from('employer_profiles').delete().eq('user_id', user.id);
    await supabase.from('users').delete().eq('id', id);
    return true;
  },
};

async function getOpportunityMeta(type, id) {
  const meta = OPPORTUNITY_TABLES[type] || OPPORTUNITY_TABLES.job;
  const { data } = await supabase.from(meta.table).select(`${meta.titleCol}, ${meta.employerCol}`).eq('id', id).maybeSingle();
  return data;
}

const Application = {
  async filter(criteria = {}, sort = '-applied_at', limit = 200) {
    let query = supabase.from('applications').select('*');
    if (criteria.opportunity_id) {
      query = applicationOpportunityFilter(query, criteria.opportunity_id);
    }
    if (criteria.opportunity_type) query = query.eq('opportunity_type', criteria.opportunity_type);
    const { data, error } = await query.limit(limit);
    if (error) throw error;

    const rows = data || [];
    const employerIdFilter = criteria.employer_email
      ? await resolveOwnerIdFromEmail(criteria.employer_email)
      : null;
    const applicantEmailFilter = criteria.applicant_email
      ? String(criteria.applicant_email).trim().toLowerCase()
      : null;

    const enriched = await Promise.all(rows.map(async (row) => {
      const oppType = row.opportunity_type || 'job';
      const oppId = row.opportunity_id || row.job_id;
      const [candidate, opp] = await Promise.all([
        getUserById(row.candidate_id),
        getOpportunityMeta(oppType, oppId),
      ]);
      const email = candidate?.email || null;
      if (applicantEmailFilter && email?.toLowerCase() !== applicantEmailFilter) return null;
      if (employerIdFilter && opp) {
        const employerCol = OPPORTUNITY_TABLES[oppType]?.employerCol || 'employer_id';
        const ownerId = opp[employerCol];
        if (ownerId && String(ownerId) !== String(employerIdFilter)) return null;
      }
      return mapApplication(row, email, opp?.title, candidate, {
        opportunity_title: opp?.title,
      });
    }));

    return sortRows(enriched.filter(Boolean), sort === '-created_date' ? '-applied_at' : sort);
  },

  async create(payload) {
    const user = payload.applicant_email
      ? await getUserByEmail(payload.applicant_email)
      : getSessionUser();
    if (!user?.id) throw new Error('You must be signed in to apply.');
    const oppType = payload.opportunity_type || 'job';
    const oppId = payload.opportunity_id || payload.job_id;
    if (!oppId) throw new Error('Missing opportunity id.');

    const oppIdStr = String(oppId);
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(oppIdStr);

    // Duplicate guard (also enforced by unique index)
    const { data: existing } = await supabase
      .from('applications')
      .select('id')
      .eq('candidate_id', user.id)
      .eq('opportunity_type', oppType)
      .eq('opportunity_id', oppIdStr)
      .maybeSingle();
    if (existing?.id) {
      const err = new Error('You have already applied to this opportunity.');
      err.code = 'ALREADY_APPLIED';
      throw err;
    }

    const insert = {
      job_id: oppType === 'job' && isUuid ? oppIdStr : null,
      opportunity_id: oppIdStr,
      opportunity_type: oppType,
      candidate_id: user.id,
      status: payload.status || 'applied',
      cover_letter: payload.cover_letter || null,
      cv_url: payload.cv_url || null,
      applicant_name: payload.applicant_name || null,
    };
    const { data, error } = await supabase.from('applications').insert(insert).select('*').single();
    if (error) {
      if (error.code === '23505') {
        const dup = new Error('You have already applied to this opportunity.');
        dup.code = 'ALREADY_APPLIED';
        throw dup;
      }
      throw new Error(error.message || 'Could not submit your application. Please try again.');
    }
    const opp = await getOpportunityMeta(oppType, oppId);
    const employerEmail = payload.employer_email
      || await resolveEmployerEmailForOpportunity(oppType, oppId);
    const app = mapApplication(data, user.email, opp?.title, user, {
      applicant_name: payload.applicant_name,
      opportunity_title: payload.opportunity_title || opp?.title,
      employer_email: employerEmail,
    });
    if (employerEmail) {
      await queueNotificationEmail(
        employerEmail,
        `New application: ${opp?.title || 'Opportunity'}`,
        `<p>${user.email} applied for <strong>${opp?.title || 'your listing'}</strong>.</p>`
      ).catch(() => {});
      await Notification.create({
        user_email: employerEmail,
        title: 'New application received',
        message: `${payload.applicant_name || user.email} applied for ${opp?.title || 'your listing'}`,
        type: 'application',
        entity_id: data.id,
      }).catch(() => {});
    }
    return app;
  },


  async update(id, payload) {
    const patch = { ...payload };
    if (patch.status) {
      const statusMap = { reviewing: 'Under Review', applied: 'Applied' };
      patch.status = statusMap[patch.status] || patch.status;
    }
    const { data, error } = await supabase.from('applications').update(patch).eq('id', id).select('*').single();
    if (error) throw error;
    const candidate = await getUserById(data.candidate_id);
    const oppType = data.opportunity_type || 'job';
    const opp = await getOpportunityMeta(oppType, data.opportunity_id || data.job_id);
    const app = mapApplication(data, candidate?.email, opp?.title, candidate);
    if (candidate?.email && payload.status) {
      await queueNotificationEmail(
        candidate.email,
        `Application update: ${opp?.title || 'Opportunity'}`,
        `<p>Your application status is now <strong>${app.status}</strong>.</p>`
      );
      await Notification.create({
        user_email: candidate.email,
        title: 'Application status updated',
        message: `Status: ${app.status} for ${opp?.title || 'opportunity'}`,
        type: 'application_update',
        entity_id: data.id,
      }).catch(() => {});
    }
    return app;
  },
};

const SavedOpportunity = {
  async filter(criteria = {}) {
    if (!criteria.user_email) return [];
    const user = await getUserByEmail(criteria.user_email);
    if (!user) return [];
    const [{ data: generic }, { data: legacy }] = await Promise.all([
      supabase.from('saved_opportunities').select('*').eq('user_id', user.user_id),
      supabase.from('saved_jobs').select('*').eq('user_id', user.user_id),
    ]);
    const rows = [
      ...(generic || []).map((r) => ({ ...r, _source: 'generic' })),
      ...(legacy || []).map((r) => ({ ...r, opportunity_type: 'job', opportunity_id: r.job_id, _source: 'legacy' })),
    ];
    const enriched = await Promise.all(rows.map(async (row) => {
      const type = row.opportunity_type || 'job';
      const id = row.opportunity_id || row.job_id;
      const meta = OPPORTUNITY_TABLES[type] || OPPORTUNITY_TABLES.job;
      const { data: opp } = await supabase.from(meta.table).select('title, slug').eq('id', id).maybeSingle();
      if (row._source === 'legacy') {
        return mapSavedJob({ ...row, user_email: criteria.user_email }, opp);
      }
      return mapSavedOpportunity({ ...row, user_email: criteria.user_email }, opp, type);
    }));
    return enriched;
  },

  async create(payload) {
    const user = await getUserByEmail(payload.user_email);
    if (!user) throw new Error('User not found');
    const type = payload.opportunity_type || 'job';
    const oppId = payload.opportunity_id;
    if (type === 'job') {
      const { data, error } = await supabase.from('saved_jobs').insert({
        user_id: user.user_id,
        job_id: oppId,
      }).select('*').single();
      if (error && !error.message?.includes('duplicate')) throw error;
      if (data) return mapSavedJob({ ...data, user_email: payload.user_email });
    }
    const { data, error } = await supabase.from('saved_opportunities').upsert({
      user_id: user.user_id,
      opportunity_type: type,
      opportunity_id: oppId,
    }, { onConflict: 'user_id,opportunity_type,opportunity_id' }).select('*').single();
    if (error) throw error;
    const meta = OPPORTUNITY_TABLES[type];
    const { data: opp } = await supabase.from(meta.table).select('title, slug').eq('id', oppId).maybeSingle();
    return mapSavedOpportunity({ ...data, user_email: payload.user_email }, opp, type);
  },

  async delete(id) {
    await supabase.from('saved_opportunities').delete().eq('id', id);
    const { error } = await supabase.from('saved_jobs').delete().eq('id', id);
    if (error) throw error;
    return true;
  },
};

const Notification = {
  async filter(criteria = {}, sort = '-created_at', limit = 50) {
    let query = supabase.from('notifications').select('*');
    if (criteria.user_email) {
      const user = await getUserByEmail(criteria.user_email);
      if (!user) return [];
      query = query.eq('user_id', user.id);
    }
    const { data, error } = await query.limit(limit);
    if (error) throw error;
    const rows = await Promise.all((data || []).map(async (row) => {
      const user = row.user_id ? await getUserById(row.user_id) : null;
      return mapNotification(row, user?.email || criteria.user_email);
    }));
    return sortRows(rows, sort === '-created_date' ? '-created_at' : sort);
  },

  async create(payload) {
    const user = payload.user_email ? await getUserByEmail(payload.user_email) : getSessionUser();
    const { data, error } = await supabase.from('notifications').insert({
      entity_title: payload.title || payload.entity_title,
      details: payload.message || payload.details,
      type: payload.type,
      entity_id: payload.entity_id,
      user_id: user?.id,
      read: false,
    }).select('*').single();
    if (error) throw error;
    return mapNotification(data, user?.email);
  },

  async update(id, payload) {
    const { data, error } = await supabase.from('notifications').update(payload).eq('id', id).select('*').single();
    if (error) throw error;
    const user = data.user_id ? await getUserById(data.user_id) : null;
    return mapNotification(data, user?.email);
  },
};

export const entities = {
  Job,
  Internship,
  Fellowship,
  Scholarship,
  Grant,
  Event,
  Organization,
  UserProfile,
  Application,
  SavedOpportunity,
  Notification,
  Interview,
  ContactMessage,
  EmailSubscription,
  BlogPost,
  BlogCategory,
  SiteSettings,
  Testimonial,
  User: {
    async list(sort = '-created_at', limit = 500) {
      const { data, error } = await supabase.from('users').select('*').limit(limit);
      if (error) throw error;
      return sortRows((data || []).map((u) => ({
        ...u,
        full_name: [u.first_name, u.last_name].filter(Boolean).join(' ').trim() || u.email,
        created_date: u.created_at,
        user_type: u.role === 'employer' ? 'employer' : u.role === 'candidate' ? 'job_seeker' : u.role,
      })), sort === '-created_date' ? '-created_at' : sort);
    },
    async filter() {
      return this.list();
    },
    async delete(id) {
      const { error } = await supabase.from('users').delete().eq('id', id);
      if (error) throw error;
      return true;
    },
  },
};
