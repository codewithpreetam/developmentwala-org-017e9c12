import React, { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { api } from '@/api/apiClient';
import { refreshSiteSettings } from '../../hooks/useSiteSettings';
import {
  GripVertical, Upload, CheckCircle2, Image, Globe, Eye, EyeOff, Save, RefreshCw
} from 'lucide-react';
import { Input } from '@/components/ui/input';

const DEFAULT_NAV_ITEMS = [
  { id: 'jobs', label: 'Jobs', enabled: true },
  { id: 'internships', label: 'Internships', enabled: true },
  { id: 'fellowships', label: 'Fellowships', enabled: true },
  { id: 'scholarships', label: 'Scholarships', enabled: true },
  { id: 'grants', label: 'Grants', enabled: true },
  { id: 'events', label: 'Events', enabled: true },
  { id: 'blog', label: 'Blog', enabled: true },
  { id: 'employers', label: 'Employers', enabled: true },
];

const DEFAULT_OPP_TYPES = [
  { id: 'job', label: 'Jobs', enabled: true },
  { id: 'internship', label: 'Internships', enabled: true },
  { id: 'fellowship', label: 'Fellowships', enabled: true },
  { id: 'scholarship', label: 'Scholarships', enabled: true },
  { id: 'grant', label: 'Grants', enabled: true },
  { id: 'event', label: 'Events', enabled: true },
];

const DEFAULT_SECTORS = [
  { id: 'education', label: 'Education', enabled: true },
  { id: 'health', label: 'Health', enabled: true },
  { id: 'environment', label: 'Environment', enabled: true },
  { id: 'human_rights', label: 'Human Rights', enabled: true },
  { id: 'poverty', label: 'Poverty Alleviation', enabled: true },
  { id: 'gender_equality', label: 'Gender Equality', enabled: true },
  { id: 'disaster_relief', label: 'Disaster Relief', enabled: true },
  { id: 'governance', label: 'Governance', enabled: true },
  { id: 'livelihood', label: 'Livelihood', enabled: true },
  { id: 'child_welfare', label: 'Child Welfare', enabled: true },
  { id: 'water_sanitation', label: 'Water & Sanitation', enabled: true },
  { id: 'climate', label: 'Climate', enabled: true },
  { id: 'other', label: 'Other', enabled: true },
];

const ACCENT = '#4F46E5';

function reorder(list, startIndex, endIndex) {
  const result = [...list];
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
}

function DraggableList({ items, setItems, listId }) {
  const toggle = (id) => setItems(prev => prev.map(i => i.id === id ? { ...i, enabled: !i.enabled } : i));

  return (
    <DragDropContext onDragEnd={({ source, destination }) => {
      if (!destination) return;
      setItems(prev => reorder(prev, source.index, destination.index));
    }}>
      <Droppable droppableId={listId}>
        {(provided) => (
          <div ref={provided.innerRef} {...provided.droppableProps} className="space-y-2">
            {items.map((item, index) => (
              <Draggable key={item.id} draggableId={item.id} index={index}>
                {(p, snapshot) => (
                  <div
                    ref={p.innerRef}
                    {...p.draggableProps}
                    className={`flex items-center gap-3 p-3 rounded-xl border transition-all select-none ${
                      snapshot.isDragging ? 'shadow-lg bg-indigo-50 border-indigo-200' : 'bg-white border-gray-200'
                    } ${!item.enabled ? 'opacity-50' : ''}`}
                  >
                    <div {...p.dragHandleProps} className="cursor-grab active:cursor-grabbing text-gray-300 hover:text-gray-500">
                      <GripVertical className="w-4 h-4" />
                    </div>
                    <span className="flex-1 text-sm font-medium text-gray-800">{item.label}</span>
                    <button
                      onClick={() => toggle(item.id)}
                      className={`p-1.5 rounded-lg transition-colors ${item.enabled ? 'text-green-600 hover:bg-green-50' : 'text-gray-300 hover:bg-gray-100'}`}
                    >
                      {item.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}

export default function SiteSettingsPanel() {
  const [settingsId, setSettingsId] = useState(null);
  const [logoUrl, setLogoUrl] = useState('');
  const [siteName, setSiteName] = useState('DevelopmentWala.org');
  const [navItems, setNavItems] = useState(DEFAULT_NAV_ITEMS);
  const [oppTypes, setOppTypes] = useState(DEFAULT_OPP_TYPES);
  const [sectors, setSectors] = useState(DEFAULT_SECTORS);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.entities.SiteSettings.list().then(items => {
      if (items.length > 0) {
        const s = items[0];
        setSettingsId(s.id);
        setLogoUrl(s.logo_url || '');
        setSiteName(s.site_name || 'DevelopmentWala.org');
        if (s.nav_items?.length) setNavItems(s.nav_items);
        if (s.opportunity_types?.length) setOppTypes(s.opportunity_types);
        if (s.sectors?.length) setSectors(s.sectors);
      }
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    const { file_url } = await api.integrations.Core.UploadFile({ file });
    setLogoUrl(file_url);
    setUploading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    const data = {
      logo_url: logoUrl,
      site_name: siteName,
      nav_items: navItems,
      opportunity_types: oppTypes,
      sectors: sectors,
    };
    if (settingsId) {
      await api.entities.SiteSettings.update(settingsId, data);
    } else {
      const created = await api.entities.SiteSettings.create(data);
      setSettingsId(created.id);
    }
    await refreshSiteSettings();
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const resetToDefaults = () => {
    setNavItems(DEFAULT_NAV_ITEMS);
    setOppTypes(DEFAULT_OPP_TYPES);
    setSectors(DEFAULT_SECTORS);
  };

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
    </div>
  );

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Site Customization</h2>
          <p className="text-sm text-gray-500 mt-0.5">Manage logo, navigation, and content ordering</p>
        </div>
        <div className="flex gap-2">
          <button onClick={resetToDefaults} className="flex items-center gap-1.5 text-sm text-gray-500 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-xl font-medium transition-colors">
            <RefreshCw className="w-4 h-4" /> Reset
          </button>
          <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm text-white px-5 py-2 rounded-xl font-semibold disabled:opacity-50 transition-colors" style={{ background: ACCENT }}>
            {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Changes</>}
          </button>
        </div>
      </div>

      {/* BRANDING */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2">
          <Image className="w-5 h-5 text-indigo-500" /> Branding
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Logo */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">Website Logo</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-indigo-300 transition-colors">
              {logoUrl ? (
                <div className="space-y-3">
                  <img src={logoUrl} alt="Site Logo" className="h-16 mx-auto object-contain rounded-lg" />
                  <div className="flex items-center justify-center gap-2">
                    <label className="cursor-pointer text-xs font-semibold text-white px-3 py-1.5 rounded-lg" style={{ background: ACCENT }}>
                      {uploading ? 'Uploading...' : 'Replace Logo'}
                      <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                    </label>
                    <button onClick={() => setLogoUrl('')} className="text-xs text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg font-semibold">Remove</button>
                  </div>
                </div>
              ) : (
                <label className="cursor-pointer block">
                  <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-sm text-gray-500 mb-1">Upload your logo</p>
                  <p className="text-xs text-gray-400">PNG, SVG, JPG recommended</p>
                  <span className="mt-3 inline-block text-xs font-semibold text-white px-4 py-2 rounded-lg" style={{ background: ACCENT }}>
                    {uploading ? 'Uploading...' : 'Choose File'}
                  </span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploading} />
                </label>
              )}
            </div>
          </div>
          {/* Site Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              <Globe className="w-4 h-4 inline mr-1 text-indigo-500" />Site Name
            </label>
            <Input
              value={siteName}
              onChange={e => setSiteName(e.target.value)}
              placeholder="DevelopmentWala.org"
              className="h-11 rounded-xl"
            />
            <p className="text-xs text-gray-400 mt-2">Shown in browser tab, emails, and social sharing</p>
          </div>
        </div>
      </div>

      {/* NAV MENU */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Navigation Menu</h3>
        <p className="text-sm text-gray-400 mb-4">Drag to reorder. Click the eye icon to show/hide items.</p>
        <DraggableList items={navItems} setItems={setNavItems} listId="nav-items" />
      </div>

      {/* OPPORTUNITY TYPES */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Opportunity Types</h3>
        <p className="text-sm text-gray-400 mb-4">Control which types appear and their display order across the site.</p>
        <DraggableList items={oppTypes} setItems={setOppTypes} listId="opp-types" />
      </div>

      {/* SECTORS */}
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <h3 className="font-bold text-gray-900 mb-2">Sectors / Categories</h3>
        <p className="text-sm text-gray-400 mb-4">Enable or disable sector categories used in filtering and tagging.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {sectors.map(sector => (
            <button
              key={sector.id}
              onClick={() => setSectors(prev => prev.map(s => s.id === sector.id ? { ...s, enabled: !s.enabled } : s))}
              className={`flex items-center justify-between px-4 py-2.5 rounded-xl border text-sm font-medium transition-all ${
                sector.enabled
                  ? 'bg-indigo-50 border-indigo-200 text-indigo-800'
                  : 'bg-gray-50 border-gray-200 text-gray-400'
              }`}
            >
              <span>{sector.label}</span>
              {sector.enabled ? <Eye className="w-3.5 h-3.5 text-indigo-400" /> : <EyeOff className="w-3.5 h-3.5 text-gray-300" />}
            </button>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={handleSave} disabled={saving} className="flex items-center gap-1.5 text-sm text-white px-8 py-3 rounded-xl font-semibold disabled:opacity-50" style={{ background: ACCENT }}>
          {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save All Changes</>}
        </button>
      </div>
    </div>
  );
}