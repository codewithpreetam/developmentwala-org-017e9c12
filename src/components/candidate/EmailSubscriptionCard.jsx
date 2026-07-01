import React, { useState, useEffect } from 'react';
import { api } from '@/api/apiClient';
import { Bell, BellOff, Check, Mail, Loader2, Settings2 } from 'lucide-react';

const SECTORS = [
  { id: 'education', label: 'Education' },
  { id: 'health', label: 'Health' },
  { id: 'environment', label: 'Environment' },
  { id: 'human_rights', label: 'Human Rights' },
  { id: 'poverty', label: 'Poverty Alleviation' },
  { id: 'gender_equality', label: 'Gender Equality' },
  { id: 'disaster_relief', label: 'Disaster Relief' },
  { id: 'governance', label: 'Governance' },
  { id: 'livelihood', label: 'Livelihood' },
  { id: 'child_welfare', label: 'Child Welfare' },
  { id: 'water_sanitation', label: 'Water & Sanitation' },
  { id: 'climate', label: 'Climate' },
];

const OPP_TYPES = [
  { id: 'job', label: 'Jobs' },
  { id: 'internship', label: 'Internships' },
  { id: 'fellowship', label: 'Fellowships' },
  { id: 'scholarship', label: 'Scholarships' },
  { id: 'grant', label: 'Grants' },
  { id: 'event', label: 'Events' },
];

export default function EmailSubscriptionCard({ user, profile }) {
  const [sub, setSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [active, setActive] = useState(true);
  const [sectors, setSectors] = useState([]);
  const [oppTypes, setOppTypes] = useState(['job', 'grant', 'internship', 'fellowship']);

  useEffect(() => {
    if (!user?.email) return;
    api.entities.EmailSubscription.filter({ user_email: user.email })
      .then(items => {
        if (items.length > 0) {
          const s = items[0];
          setSub(s);
          setActive(s.active ?? true);
          setSectors(s.sector_interests || []);
          setOppTypes(s.opportunity_types?.length ? s.opportunity_types : ['job', 'grant', 'internship', 'fellowship']);
        } else {
          // Pre-fill from profile
          setSectors(profile?.sector_interests || []);
        }
        setLoading(false);
      }).catch(() => setLoading(false));
  }, [user?.email]);

  const toggleSector = (id) => setSectors(prev => prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]);
  const toggleType = (id) => setOppTypes(prev => prev.includes(id) ? prev.filter(t => t !== id) : [...prev, id]);

  const handleSave = async () => {
    setSaving(true);
    const data = {
      user_email: user.email,
      full_name: user.full_name || '',
      active,
      sector_interests: sectors,
      opportunity_types: oppTypes,
      frequency: 'weekly',
    };
    if (sub) {
      await api.entities.EmailSubscription.update(sub.id, data);
    } else {
      const created = await api.entities.EmailSubscription.create(data);
      setSub(created);
    }
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-10">
      <Loader2 className="w-5 h-5 animate-spin text-gray-400" />
    </div>
  );

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
            <Mail className="w-5 h-5 text-indigo-600" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Weekly Email Alerts</h3>
            <p className="text-sm text-gray-500">Get new opportunities delivered to <span className="font-medium">{user?.email}</span></p>
          </div>
        </div>
        {/* Toggle */}
        <button
          onClick={() => setActive(v => !v)}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all ${active ? 'bg-indigo-600 text-white' : 'bg-gray-100 text-gray-500'}`}
        >
          {active ? <><Bell className="w-4 h-4" /> Active</> : <><BellOff className="w-4 h-4" /> Paused</>}
        </button>
      </div>

      {active && (
        <>
          {/* Opportunity Types */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-indigo-500" /> Opportunity Types
            </p>
            <div className="flex flex-wrap gap-2">
              {OPP_TYPES.map(t => (
                <button key={t.id} onClick={() => toggleType(t.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${oppTypes.includes(t.id) ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-300'}`}>
                  {oppTypes.includes(t.id) && <Check className="w-3 h-3 inline mr-1" />}
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sectors */}
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-1">Sector Interests</p>
            <p className="text-xs text-gray-400 mb-3">Leave all unselected to receive alerts for all sectors.</p>
            <div className="flex flex-wrap gap-2">
              {SECTORS.map(s => (
                <button key={s.id} onClick={() => toggleSector(s.id)}
                  className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${sectors.includes(s.id) ? 'bg-indigo-50 text-indigo-700 border-indigo-300' : 'bg-white text-gray-500 border-gray-200 hover:border-indigo-200'}`}>
                  {sectors.includes(s.id) && <Check className="w-3 h-3 inline mr-1" />}
                  {s.label}
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {!active && (
        <p className="text-sm text-gray-400 bg-gray-50 rounded-xl p-4 text-center">
          Email alerts are paused. Toggle to resume receiving weekly opportunity updates.
        </p>
      )}

      <div className="flex items-center justify-between pt-2 border-t border-gray-100">
        <p className="text-xs text-gray-400">Sent every Monday morning · Weekly digest</p>
        <button onClick={handleSave} disabled={saving}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors">
          {saved ? <><Check className="w-4 h-4" /> Saved</> : saving ? <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</> : 'Save Preferences'}
        </button>
      </div>
    </div>
  );
}