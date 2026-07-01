import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Camera, Save, CheckCircle2, Trash2 } from 'lucide-react';

const GENDERS = ['Male', 'Female', 'Non-binary', 'Prefer not to say', 'Other'];

const EMPTY_FORM = {
  full_name: '', designation: '', age: '', gender: '',
  office_location: '', email_id: '', employer_linkedin_url: '', profile_picture: '',
};

export default function EmployerProfileSection({ user, ACCENT, onProfilePicChange }) {
  const [profile, setProfile] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState('');

  useEffect(() => { if (user) loadProfile(); }, [user?.id]);

  const loadProfile = async () => {
    const profiles = await api.entities.UserProfile.filter({ user_email: user.email, user_type: 'employer' });
    if (profiles.length > 0) {
      const p = profiles[0];
      setProfile(p);
      setForm({
        full_name: p.full_name || user.full_name || '',
        designation: p.designation || '',
        age: p.age || '',
        gender: p.gender || '',
        office_location: p.office_location || '',
        email_id: p.email_id || user.email || '',
        employer_linkedin_url: p.employer_linkedin_url || '',
        profile_picture: p.profile_picture || '',
      });
    } else {
      setForm({ ...EMPTY_FORM, full_name: user.full_name || '', email_id: user.email || '' });
    }
  };

  const f = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const save = async () => {
    setSaving(true);
    const data = { ...form, age: form.age ? Number(form.age) : undefined, user_email: user.email, user_type: 'employer' };
    let updated;
    if (profile?.id) {
      updated = await api.entities.UserProfile.update(profile.id, data);
    } else {
      updated = await api.entities.UserProfile.create(data);
      setProfile(updated);
    }
    if (onProfilePicChange) onProfilePicChange(form.profile_picture);
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const handlePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    setPicError('');
    try {
      const { file_url } = await api.integrations.Core.UploadFile({ file, folder: 'avatars' });
      f('profile_picture', file_url);
      const data = { ...form, profile_picture: file_url, age: form.age ? Number(form.age) : undefined, user_email: user.email, user_type: 'employer' };
      let updated;
      if (profile?.id) {
        updated = await api.entities.UserProfile.update(profile.id, data);
      } else {
        updated = await api.entities.UserProfile.create(data);
        setProfile(updated);
      }
      if (onProfilePicChange) onProfilePicChange(file_url);
    } catch (err) {
      setPicError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPic(false);
      e.target.value = '';
    }
  };

  const removePic = async () => {
    f('profile_picture', '');
    setPicError('');
    if (!profile?.id) {
      if (onProfilePicChange) onProfilePicChange('');
      return;
    }
    try {
      const data = { ...form, profile_picture: '', age: form.age ? Number(form.age) : undefined, user_email: user.email, user_type: 'employer' };
      await api.entities.UserProfile.update(profile.id, data);
      if (onProfilePicChange) onProfilePicChange('');
    } catch (err) {
      setPicError(err.message || 'Failed to remove profile picture');
    }
  };

  const displayName = form.full_name || user?.full_name || 'E';

  return (
    <div className="max-w-2xl">
      <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-200" style={{ colorScheme: 'light' }}>
        <h2 className="text-lg font-bold text-gray-900 mb-1">Employer Profile</h2>
        <p className="text-sm text-gray-500 mb-6">Your personal details as the profile holder.</p>

        <div className="space-y-5">
          {/* Profile Picture */}
          <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100">
            <div className="relative shrink-0">
              {form.profile_picture ? (
                <img src={form.profile_picture} alt="Profile" className="w-20 h-20 rounded-full object-cover border-2 border-white shadow-md" />
              ) : (
                <div className="w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md" style={{ background: ACCENT }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
              {uploadingPic && (
                <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                </div>
              )}
            </div>
            <div>
              <p className="font-semibold text-gray-900 text-sm mb-2">Profile Picture</p>
              <div className="flex items-center gap-2 flex-wrap">
                <label className="cursor-pointer text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>
                  <Camera className="w-3.5 h-3.5" />
                  {form.profile_picture ? 'Change Photo' : 'Upload Photo'}
                  <input type="file" accept="image/*" onChange={handlePicUpload} className="hidden" disabled={uploadingPic} />
                </label>
                {form.profile_picture && (
                  <button onClick={removePic} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors">
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-400 mt-1.5">Recommended square 400×400px • JPG/PNG/WebP • Auto-converted to WebP (max 150 KB)</p>
              {picError && <p className="text-xs text-red-600 mt-1">{picError}</p>}
            </div>
          </div>

          {/* Name & Designation */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Full Name</label>
              <Input value={form.full_name} onChange={e => f('full_name', e.target.value)} placeholder="Your full name" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Designation</label>
              <Input value={form.designation} onChange={e => f('designation', e.target.value)} placeholder="e.g. HR Manager, Director" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
            </div>
          </div>

          {/* Age & Gender */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Age</label>
              <Input type="number" value={form.age} onChange={e => f('age', e.target.value)} placeholder="Your age" min="18" max="100" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-1.5">Gender / Sex</label>
              <Select value={form.gender} onValueChange={v => f('gender', v)}>
                <SelectTrigger className="h-11 rounded-xl border-gray-300 bg-white text-gray-900">
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  {GENDERS.map(g => <SelectItem key={g} value={g}>{g}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Office Location */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Office Location</label>
            <Input value={form.office_location} onChange={e => f('office_location', e.target.value)} placeholder="City, State or Full Address" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
          </div>

          {/* Email ID */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">Email ID</label>
            <Input type="email" value={form.email_id} onChange={e => f('email_id', e.target.value)} placeholder="your@email.com" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
          </div>

          {/* LinkedIn */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-1.5">LinkedIn Profile URL</label>
            <Input type="url" value={form.employer_linkedin_url} onChange={e => f('employer_linkedin_url', e.target.value)} placeholder="https://linkedin.com/in/yourprofile" className="h-11 rounded-xl border-gray-300 bg-white text-gray-900 placeholder:text-gray-400" />
          </div>

          <button onClick={save} disabled={saving}
            className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50 transition-opacity"
            style={{ background: ACCENT }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
          </button>
        </div>
      </div>
    </div>
  );
}