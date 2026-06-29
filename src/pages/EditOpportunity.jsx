import React, { useState, useEffect } from 'react';
import { useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { Save, ArrowLeft, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Navbar from '../components/layout/Navbar';
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
  const [item, setItem] = useState(null);
  const [type, setType] = useState('');
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
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
    const data = await base44.entities[cfg.entity].filter({ id }, '-created_date', 1);
    if (data.length > 0) {
      setItem(data[0]);
      setForm(data[0]);
    }
    setLoading(false);
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const handleBannerUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { alert('Image must be under 2MB'); return; }
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    u('banner_image', file_url);
    setUploading(false);
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    u('logo_url', file_url);
    setUploading(false);
  };

  const save = async () => {
    setSaving(true);
    const cfg = entityMap[type];
    await base44.entities[cfg.entity].update(item.id, form);
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
      <Navbar />

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
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                <Input value={form.location || ''} onChange={e => u('location', e.target.value)} placeholder="City, State" className="h-11 rounded-xl" />
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

              {/* Apply URL */}
              {(type === 'job') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Apply URL</label>
                  <Input value={form.apply_url || ''} onChange={e => u('apply_url', e.target.value)} placeholder="https://..." className="h-11 rounded-xl" />
                </div>
              )}
              {(type === 'internship' || type === 'fellowship' || type === 'scholarship' || type === 'grant') && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Application Link</label>
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

            {/* Banner Image */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">Banner Image</label>
              {form.banner_image && (
                <div className="relative mb-3 rounded-xl overflow-hidden aspect-video w-full max-w-sm">
                  <img src={form.banner_image} alt="Banner" className="w-full h-full object-cover" />
                  <button onClick={() => u('banner_image', '')} className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
              <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                {uploading ? 'Uploading...' : 'Upload Banner Image'}
                <input type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" disabled={uploading} />
              </label>
            </div>

            {/* Logo */}
            {(type === 'job') && (
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Logo</label>
                {form.logo_url && (
                  <div className="relative mb-3 w-20 h-20 rounded-xl overflow-hidden border border-gray-200">
                    <img src={form.logo_url} alt="Logo" className="w-full h-full object-contain" />
                    <button onClick={() => u('logo_url', '')} className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )}
                <label className="cursor-pointer flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium">
                  {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                </label>
              </div>
            )}
          </div>

          <div className="flex gap-3 mt-8">
            <button onClick={save} disabled={saving || uploading}
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