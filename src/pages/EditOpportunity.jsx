import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { api } from '@/api/apiClient';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
// Navbar provided by DashboardShell wrapper route
import SEOHead from '../components/shared/SEOHead';
import CountrySelect from '../components/forms/CountrySelect';
import { DEFAULT_COUNTRY } from '../components/forms/formOptions';
import { useAuth } from '../components/auth/AuthContext';
import { isPlatformAdmin } from '@/lib/supabase/auth';


const entityMap = {
  job: { entity: 'Job', detailPage: 'JobDetail', label: 'Job' },
  internship: { entity: 'Internship', detailPage: 'InternshipDetail', label: 'Internship' },
  fellowship: { entity: 'Fellowship', detailPage: 'FellowshipDetail', label: 'Fellowship' },
  scholarship: { entity: 'Scholarship', detailPage: 'ScholarshipDetail', label: 'Scholarship' },
  grant: { entity: 'Grant', detailPage: 'GrantDetail', label: 'Grant' },
  event: { entity: 'Event', detailPage: 'EventDetail', label: 'Event' },
};

const sectorOptions = [
  { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
  { value: 'poverty', label: 'Poverty' }, { value: 'gender_equality', label: 'Gender Equality' },
  { value: 'disaster_relief', label: 'Disaster Relief' }, { value: 'governance', label: 'Governance' },
  { value: 'livelihood', label: 'Livelihood' }, { value: 'child_welfare', label: 'Child Welfare' },
  { value: 'water_sanitation', label: 'Water & Sanitation' }, { value: 'climate', label: 'Climate' }, { value: 'other', label: 'Other' },
];

const locationTypeOptions = [
  { value: 'online', label: 'Online' }, { value: 'offline', label: 'In-person' }, { value: 'hybrid', label: 'Hybrid' },
];

export default function EditOpportunity() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const isAdmin = isPlatformAdmin(user);
  const [item, setItem] = useState(null);
  const [type, setType] = useState('');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    const t = params.get('type');
    if (id && t && entityMap[t]) {
      setType(t);
      loadItem(t, id);
    } else {
      navigate(-1);
    }
  }, []);

  const loadItem = async (t, id) => {
    const cfg = entityMap[t];
    const data = await api.entities[cfg.entity].filter({ id }, '-created_date', 1);
    if (data.length > 0) {
      setItem(data[0]);
      setForm(data[0]);
    }
    setLoading(false);
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));




  const save = async () => {
    setSaving(true);
    const cfg = entityMap[type];
    await api.entities[cfg.entity].update(item.id, form);
    setSavedMsg('Changes saved successfully!');
    setTimeout(() => setSavedMsg(''), 3000);
    setSaving(false);
  };

  const cfg = entityMap[type];

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
    </div>
  );

  if (!item) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead title={`Edit ${cfg?.label} — DevelopmentWala.org`} description="Edit your opportunity listing." />



      <div className="max-w-3xl mx-auto px-4 py-8">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 mb-6">
          <ArrowLeft className="w-4 h-4" /> Back
        </button>

        <div className="bg-white rounded-2xl border border-gray-200 p-7">
          <h1 className="text-xl font-bold text-gray-900 mb-1">Edit {cfg?.label}</h1>
          <p className="text-gray-500 text-sm mb-7">Changes will go live immediately on the website.</p>

          {savedMsg && (
            <div className="mb-5 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-xl text-sm font-medium">
              ✅ {savedMsg}
            </div>
          )}

          <div className="space-y-5">
            {/* Title */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Title *</label>
              <Input value={form.title || ''} onChange={e => u('title', e.target.value)} className="h-11 rounded-xl" />
            </div>

            {/* Organization name */}
            {(type === 'job') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization</label>
                <Input value={form.organization || ''} onChange={e => u('organization', e.target.value)} className="h-11 rounded-xl" />
              </div>
            )}
            {(type === 'internship' || type === 'fellowship') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization</label>
                <Input value={form.organization_name || ''} onChange={e => u('organization_name', e.target.value)} className="h-11 rounded-xl" />
              </div>
            )}
            {type === 'event' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organizer Name</label>
                <Input value={form.organizer_name || ''} onChange={e => u('organizer_name', e.target.value)} className="h-11 rounded-xl" />
              </div>
            )}
            {type === 'grant' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Funding Agency</label>
                <Input value={form.funding_agency || ''} onChange={e => u('funding_agency', e.target.value)} className="h-11 rounded-xl" />
              </div>
            )}
            {type === 'scholarship' && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Provider Name</label>
                <Input value={form.provider_name || ''} onChange={e => u('provider_name', e.target.value)} className="h-11 rounded-xl" />
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Description *</label>
              <Textarea value={form.description || ''} onChange={e => u('description', e.target.value)} className="min-h-[160px] rounded-xl" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Location */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location / City</label>
                <Input value={form.location || form.city || ''} onChange={e => u('location', e.target.value)} placeholder="City" className="h-11 rounded-xl" />
              </div>

              {/* State */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">State</label>
                <Input value={form.state || ''} onChange={e => u('state', e.target.value)} placeholder="e.g. Maharashtra" className="h-11 rounded-xl" />
              </div>

              {/* Location type */}
              {form.location_type !== undefined && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location Type</label>
                  <Select value={form.location_type || ''} onValueChange={v => u('location_type', v)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select" /></SelectTrigger>
                    <SelectContent>{locationTypeOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {/* Deadline */}
              {(type === 'job') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline</label>
                  <Input type="date" value={form.deadline || ''} onChange={e => u('deadline', e.target.value)} className="h-11 rounded-xl" />
                </div>
              )}
              {(type === 'internship' || type === 'fellowship' || type === 'scholarship' || type === 'grant') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Deadline</label>
                  <Input type="date" value={form.application_deadline || ''} onChange={e => u('application_deadline', e.target.value)} className="h-11 rounded-xl" />
                </div>
              )}
              {type === 'event' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Date</label>
                    <Input type="date" value={form.event_date || ''} onChange={e => u('event_date', e.target.value)} className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Registration Link</label>
                    <Input value={form.registration_link || ''} onChange={e => u('registration_link', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
                  </div>
                </>
              )}

              {/* Job-specific: Salary + Experience */}
              {type === 'job' && (
                <>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Salary (₹)</label>
                    <Input value={form.salary || ''} onChange={e => u('salary', e.target.value)} placeholder="e.g. ₹5-8 LPA" className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Experience Required</label>
                    <Input value={form.experience_required || ''} onChange={e => u('experience_required', e.target.value)} placeholder="e.g. 2+ years or Fresher" className="h-11 rounded-xl" />
                  </div>
                </>
              )}

              {/* Sector */}
              {form.sector !== undefined && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sector</label>
                  <Select value={form.sector || ''} onValueChange={v => u('sector', v)}>
                    <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
                    <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
              )}

              {/* Apply URL / Application Link — admin only.
                  Employers' applicants apply directly through the website. */}
              {isAdmin && (type === 'job') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apply URL <span className="text-xs font-normal text-gray-400">(admin)</span></label>
                  <Input value={form.apply_url || ''} onChange={e => u('apply_url', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
                </div>
              )}
              {isAdmin && (type === 'internship' || type === 'fellowship' || type === 'scholarship' || type === 'grant') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Link <span className="text-xs font-normal text-gray-400">(admin)</span></label>
                  <Input value={form.application_link || ''} onChange={e => u('application_link', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
                </div>
              )}

              {/* Country */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Country</label>
                <CountrySelect value={form.country || DEFAULT_COUNTRY} onChange={(v) => u('country', v)} className="h-11 rounded-xl" />
              </div>
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Tags (comma-separated)</label>
              <Input value={form.tags || ''} onChange={e => u('tags', e.target.value)} placeholder="education, youth, NGO" className="h-11 rounded-xl" />
            </div>
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={save} disabled={saving}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2">
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            <button onClick={() => navigate(-1)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium px-6 py-3 rounded-xl text-sm">
              Cancel

            </button>
          </div>
        </div>
      </div>
    </div>
  );
}