import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { createClient } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Camera, Save, CheckCircle2, Trash2, Shield } from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

const supabase = createClient();

export default function AdminProfileSection({ user, ACCENT = '#4F46E5', onProfilePicChange }) {
  const [form, setForm] = useState({ full_name: '', designation: '', phone: '', profile_image: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user) return;
    setForm({
      full_name: user.full_name || [user.first_name, user.last_name].filter(Boolean).join(' ') || '',
      designation: user.designation || '',
      phone: user.phone || '',
      profile_image: user.profile_image || user.profile_picture || '',
    });
  }, [user?.id]);

  const f = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const persist = async (overrides = {}) => {
    const merged = { ...form, ...overrides };
    const parts = (merged.full_name || '').trim().split(/\s+/);
    const patch = {
      first_name: parts[0] || '',
      last_name: parts.slice(1).join(' ') || '',
      profile_image: merged.profile_image || null,
    };
    const { error: err } = await supabase.from('users').update(patch).eq('id', user.id);
    if (err) throw err;
  };

  const save = async () => {
    setSaving(true); setError('');
    try {
      await persist();
      setSaved(true); setTimeout(() => setSaved(false), 2500);
      onProfilePicChange?.(form.profile_image);
    } catch (e) {
      setError(e.message || 'Could not save profile.');
    } finally {
      setSaving(false);
    }
  };

  const onPic = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true); setError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file, folder: 'avatars' });
      f('profile_image', file_url);
      await persist({ profile_image: file_url });
      onProfilePicChange?.(file_url);
    } catch (err) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removePic = async () => {
    f('profile_image', '');
    try { await persist({ profile_image: '' }); onProfilePicChange?.(''); } catch (e) { setError(e.message); }
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div className="bg-white rounded-2xl shadow-sm p-6 md:p-8">
        <div className="flex items-start gap-2 mb-6">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${ACCENT}18`, color: ACCENT }}>
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
            <p className="text-sm text-gray-500">Update the name and avatar that appears across the dashboard.</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="relative">
            <UserAvatar user={{ ...user, profile_image: form.profile_image, full_name: form.full_name }} size="xl" background={ACCENT} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold text-gray-900">{form.full_name || 'Admin'}</p>
            <p className="text-sm text-gray-500 truncate">{user?.email}</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <label className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold rounded-lg cursor-pointer text-white" style={{ background: ACCENT }}>
                <Camera className="w-3.5 h-3.5" /> {uploading ? 'Uploading…' : form.profile_image ? 'Change Photo' : 'Upload Photo'}
                <input type="file" accept="image/*" className="hidden" onChange={onPic} disabled={uploading} />
              </label>
              {form.profile_image && (
                <button onClick={removePic} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">
                  <Trash2 className="w-3.5 h-3.5" /> Remove
                </button>
              )}
            </div>
            {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Full Name</label>
            <Input value={form.full_name} onChange={(e) => f('full_name', e.target.value)} placeholder="e.g. Preetam Singh" className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Email</label>
            <Input value={user?.email || ''} disabled className="h-11 rounded-xl bg-gray-50" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Designation</label>
            <Input value={form.designation} onChange={(e) => f('designation', e.target.value)} placeholder="e.g. Platform Lead" className="h-11 rounded-xl" />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1.5">Phone</label>
            <Input value={form.phone} onChange={(e) => f('phone', e.target.value)} placeholder="Optional" className="h-11 rounded-xl" />
          </div>
        </div>

        <div className="mt-7 flex items-center justify-end gap-3">
          {saved && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Saved</span>}
          <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white disabled:opacity-60" style={{ background: ACCENT }}>
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Profile'}
          </button>
        </div>
      </div>
    </div>
  );
}
