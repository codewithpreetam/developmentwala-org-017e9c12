import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { createClient } from '@/lib/supabase/client';

const supabase = createClient();
import { useAdminAuth } from '../components/admin/AdminAuth';
import { useAuth } from '../components/auth/AuthContext';
import UserAvatar from '../components/shared/UserAvatar';
import {
  LayoutDashboard, Plus, Inbox, List, LogOut, Briefcase,
  Clock, CheckCircle2, XCircle, Trash2, Eye, EyeOff,
  Building2, GraduationCap, Star, DollarSign, Calendar, Pencil, Archive,
  Users, Download, FileText, MessageSquare, Mail, ChevronRight, Settings, User, Bell
} from 'lucide-react';
import SiteSettingsPanel from '../components/admin/SiteSettingsPanel';
import { DEFAULT_LOGO } from '@/lib/brand';
import BlogManager from '../components/admin/BlogManager';
import { format } from 'date-fns';
import ReactMarkdown from 'react-markdown';
import NotificationBell from '../components/shared/NotificationBell';
import NotificationsPanel from '../components/shared/NotificationsPanel';
import AdminMessagesPanel from '../components/messaging/AdminMessagesPanel';
import NewsletterPanel from '../components/admin/NewsletterPanel';
import AdminProfileSection from '../components/admin/AdminProfileSection';

const ACCENT = '#4F46E5';

const statusBadge = {
  published: 'bg-green-100 text-green-700',
  pending: 'bg-yellow-100 text-yellow-700',
  draft: 'bg-gray-100 text-gray-600',
  rejected: 'bg-red-100 text-red-700',
};

const typeConfig = {
  job:         { label: 'Job',         color: 'bg-blue-100 text-blue-700',    icon: Briefcase,     entity: 'Job',         detailPage: 'JobDetail' },
  internship:  { label: 'Internship',  color: 'bg-purple-100 text-purple-700',icon: GraduationCap, entity: 'Internship',  detailPage: 'InternshipDetail' },
  fellowship:  { label: 'Fellowship',  color: 'bg-indigo-100 text-indigo-700',icon: Star,          entity: 'Fellowship',  detailPage: 'FellowshipDetail' },
  scholarship: { label: 'Scholarship', color: 'bg-yellow-100 text-yellow-700',icon: GraduationCap, entity: 'Scholarship', detailPage: 'ScholarshipDetail' },
  grant:       { label: 'Grant',       color: 'bg-green-100 text-green-700',  icon: DollarSign,    entity: 'Grant',       detailPage: 'GrantDetail' },
  event:       { label: 'Event',       color: 'bg-pink-100 text-pink-700',    icon: Calendar,      entity: 'Event',       detailPage: 'EventDetail' },
};

function normalize(items, type) {
  return items.map(i => ({
    ...i, _type: type, _entity: typeConfig[type].entity,
    organization_display: i.organization || i.organization_name || i.organizer_name || i.funding_agency || i.provider_name || '',
  }));
}

function downloadCSV(data, filename) {
  if (!data.length) return;
  const keys = Object.keys(data[0]);
  const rows = [keys.join(','), ...data.map(row => keys.map(k => {
    const val = row[k] === null || row[k] === undefined ? '' : String(row[k]);
    return `"${val.replace(/"/g, '""')}"`;
  }).join(','))];
  const blob = new Blob([rows.join('\n')], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
}

export default function AdminDashboard() {
  const { isAdmin, logout, loading: authLoading } = useAdminAuth();
  const { user: authUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState(searchParams.get('tab') || 'overview');
  const setTab = (next) => { setTabState(next); setSearchParams({ tab: next }, { replace: true }); };
  useEffect(() => { const t = searchParams.get('tab'); if (t && t !== tab) setTabState(t); }, [searchParams]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [allItems, setAllItems] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allProfiles, setAllProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [contacts, setContacts] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [previewItem, setPreviewItem] = useState(null);
  const [typeFilter, setTypeFilter] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [userTab, setUserTab] = useState('job_seeker');

  useEffect(() => { if (isAdmin) loadAll(); }, [isAdmin]);

  const loadAll = async () => {
    setLoading(true);
    const [jobs, internships, fellowships, scholarships, grants, events, users, profiles, contactMsgs] = await Promise.all([
      base44.entities.Job.list('-created_date', 500), base44.entities.Internship.list('-created_date', 500),
      base44.entities.Fellowship.list('-created_date', 500), base44.entities.Scholarship.list('-created_date', 500),
      base44.entities.Grant.list('-created_date', 500), base44.entities.Event.list('-created_date', 500),
      base44.entities.User.list('-created_date', 500), base44.entities.UserProfile.list('-created_date', 500),
      base44.entities.ContactMessage.list('-created_date', 200),
    ]);
    const combined = [
      ...normalize(jobs,'job'), ...normalize(internships,'internship'), ...normalize(fellowships,'fellowship'),
      ...normalize(scholarships,'scholarship'), ...normalize(grants,'grant'), ...normalize(events,'event'),
    ].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setAllItems(combined); setAllUsers(users); setAllProfiles(profiles); setContacts(contactMsgs); setLoading(false);
  };

  const getEntity = (type) => base44.entities[typeConfig[type].entity];

  const reject = async (item) => {
    setProcessing(true);
    await getEntity(item._type).update(item.id, { status: 'rejected' });
    const email = item.submitted_by_email || item.created_by;
    if (email) await base44.entities.Notification.create({ user_email: email, title: 'Opportunity Not Approved', message: `Your ${item._type} "${item.title}" was not approved.`, type: 'rejection', read: false, link: '' }).catch(() => {});
    await loadAll(); setPreviewItem(null); setProcessing(false);
  };

  const del = async (item) => {
    if (!confirm('Delete this item?')) return;
    setProcessing(true); await getEntity(item._type).delete(item.id); await loadAll(); setProcessing(false);
  };

  const toggle = async (item) => {
    setProcessing(true);
    await getEntity(item._type).update(item.id, { status: item.status === 'published' ? 'draft' : 'published' });
    await loadAll(); setProcessing(false);
  };

  const toggleFeatured = async (item) => {
    setProcessing(true);
    await getEntity(item._type).update(item.id, { featured: !item.featured });
    await loadAll(); setProcessing(false);
  };


  const deleteUser = async (userId) => {
    if (!confirm('Delete this user and their profile?')) return;
    setProcessing(true);
    const profile = allProfiles.find(p => p.user_email === allUsers.find(u => u.id === userId)?.email);
    if (profile) await base44.entities.UserProfile.delete(profile.id).catch(() => {});
    await base44.entities.User.delete(userId).catch(() => {});
    await loadAll(); setProcessing(false);
  };

  const approve = async (item) => {
    setProcessing(true);
    await getEntity(item._type).update(item.id, { status: 'published' });
    const email = item.submitted_by_email || item.created_by;
    if (email) await base44.entities.Notification.create({ user_email: email, title: 'Your opportunity is now live!', message: `Your ${item._type} "${item.title}" has been approved and is now published on DevelopmentWala.org.`, type: 'approval', read: false, link: `/${typeConfig[item._type].detailPage}?id=${item.id}` }).catch(() => {});
    await loadAll(); setPreviewItem(null); setProcessing(false);
  };

  const pending = allItems.filter(j => j.status === 'pending');
  const published = allItems.filter(j => j.status === 'published');
  const rejected = allItems.filter(j => j.status === 'rejected');
  const featured = allItems.filter(j => j.featured);
  const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const archived = allItems.filter(j => { const dl = j.deadline || j.application_deadline; return dl && new Date(dl) < oneMonthAgo; });
  const jobSeekers = allUsers.filter(u => { const p = allProfiles.find(p => p.user_email === u.email); return !p || p.user_type === 'job_seeker'; });
  const employers = allUsers.filter(u => { const p = allProfiles.find(p => p.user_email === u.email); return p?.user_type === 'employer'; });
  const oppTypes = [{ value: '', label: 'All Types' }, ...Object.entries(typeConfig).map(([v, c]) => ({ value: v, label: c.label }))];
  const sourceFilters = [
    { value: '', label: 'All Sources' },
    { value: 'admin', label: 'Admin Posts' },
    { value: 'employers', label: 'Employer Submissions' },
  ];

  const adminEmails = new Set(
    allUsers.filter(u => u.role === 'super_admin').map(u => u.email?.toLowerCase()).filter(Boolean)
  );
  const isAdminPost = (item) => adminEmails.has((item.submitted_by_email || item.created_by || '').toLowerCase());
  const adminPosts = allItems.filter(isAdminPost);
  const employerPosts = allItems.filter(i => !isAdminPost(i));

  const displayItems = allItems.filter(j => {
    if (tab === 'my-posts' && !isAdminPost(j)) return false;
    if (tab === 'all' && sourceFilter === 'admin' && !isAdminPost(j)) return false;
    if (tab === 'all' && sourceFilter === 'employers' && isAdminPost(j)) return false;
    if (typeFilter && j._type !== typeFilter) return false;
    return true;
  });
  const unreadContacts = contacts.filter(c => !c.read).length;

  const exportOpportunitiesCSV = () => {
    const rows = displayItems.map(item => ({ type: item._type, title: item.title, organization: item.organization_display, status: item.status, deadline: item.deadline || item.application_deadline || '', created_date: item.created_date, submitted_by_name: item.submitted_by_name || '', submitted_by_email: item.submitted_by_email || '', location: item.location || '', sector: item.sector || '' }));
    downloadCSV(rows, tab === 'my-posts' ? 'development_wala_admin_posts.csv' : 'development_wala_opportunities.csv');
  };
  const exportUsersCSV = (users, type) => {
    const rows = users.map(u => { const p = allProfiles.find(p => p.user_email === u.email) || {}; return { full_name: u.full_name || '', email: u.email, role: u.role || '', user_type: p.user_type || 'job_seeker', phone: p.phone || '', location: p.location || '', education: p.education || '', skills: p.skills || '', organization: p.org_name || '', joined_date: u.created_date }; });
    downloadCSV(rows, `development_wala_${type}.csv`);
  };

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'settings', label: 'Site Settings', icon: Settings },
    { id: 'pending', label: `Pending${pending.length > 0 ? ` (${pending.length})` : ''}`, icon: Inbox },
    { id: 'featured', label: `Featured (${featured.length})`, icon: Star },
    { id: 'post', label: 'Post New', icon: Plus },
    { id: 'my-posts', label: `My Posts${adminPosts.length ? ` (${adminPosts.length})` : ''}`, icon: User },
    { id: 'all', label: 'All Opportunities', icon: List },
    { id: 'archive', label: `Archive (${archived.length})`, icon: Archive },
    { id: 'users', label: `Users (${allUsers.length})`, icon: Users },
    { id: 'blog', label: 'Blog', icon: FileText },
    { id: 'contacts', label: `Messages${unreadContacts > 0 ? ` (${unreadContacts})` : ''}`, icon: MessageSquare },
    { id: 'newsletter', label: 'Newsletter', icon: Mail },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'profile', label: 'My Profile', icon: User },
  ];

  if (authLoading) return null;

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1c23] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <LayoutDashboard className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm leading-tight">DevelopmentWala.org</span>
          </Link>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0 overflow-hidden" style={{ background: ACCENT }}>
              {authUser?.profile_image
                ? <img src={authUser.profile_image} alt="Admin" className="w-full h-full object-cover" />
                : <img src={DEFAULT_LOGO} alt="DW" className="w-full h-full object-contain p-1" />}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-white text-sm font-semibold truncate">{authUser?.full_name || 'DevelopmentWala.org'}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <p className="text-gray-400 text-[11px] truncate">Admin Account</p>
                <span className="text-[10px] bg-indigo-500/20 text-indigo-300 px-1.5 py-0.5 rounded-full font-medium shrink-0">Admin</span>
              </div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setPreviewItem(null); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              style={tab === item.id ? { background: ACCENT } : {}}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
          <button onClick={() => { logout(); navigate(createPageUrl('AdminLogin')); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4 shrink-0" /> Sign Out
          </button>
        </nav>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900">{navItems.find(n => n.id === tab)?.label || 'Overview'}</h1>
          </div>
          <div className="flex items-center gap-3">
            <NotificationBell userEmail={authUser?.email} userRole="admin" />
            <UserAvatar user={authUser} size="sm" background={ACCENT} />
          </div>
        </header>

        <main className="flex-1 p-6 overflow-y-auto">
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: `${ACCENT} transparent transparent transparent` }} />
            </div>
          ) : (
            <>
              {/* OVERVIEW */}
              {tab === 'overview' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Listings', val: allItems.length, icon: Briefcase, color: ACCENT },
                      { label: 'Published', val: published.length, icon: CheckCircle2, color: '#10b981' },
                      { label: 'Pending Review', val: pending.length, icon: Clock, color: '#f59e0b' },
                      { label: 'Rejected', val: rejected.length, icon: XCircle, color: '#ef4444' },
                    ].map((s, i) => (
                      <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                        <div className="flex items-start justify-between mb-1">
                          <div>
                            <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                            <p className="text-2xl font-bold text-gray-900 mt-1">{s.val}</p>
                          </div>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${s.color}18` }}>
                            <s.icon className="w-4 h-4" style={{ color: s.color }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-3 md:grid-cols-6 gap-3">
                    {Object.entries(typeConfig).map(([type, cfg]) => {
                      const TypeIcon = cfg.icon;
                      const count = allItems.filter(i => i._type === type).length;
                      return (
                        <div key={type} className="bg-white rounded-2xl p-4 text-center shadow-sm">
                          <div className={`w-9 h-9 rounded-xl flex items-center justify-center mx-auto mb-2 ${cfg.color}`}><TypeIcon className="w-4 h-4" /></div>
                          <div className="text-xl font-bold text-gray-900">{count}</div>
                          <div className="text-xs text-gray-500">{cfg.label}s</div>
                        </div>
                      );
                    })}
                  </div>
                  {pending.length > 0 && (
                    <div className="bg-white rounded-2xl shadow-sm p-5">
                      <div className="flex items-center justify-between mb-4">
                        <h3 className="font-bold text-gray-900 flex items-center gap-2"><Inbox className="w-4 h-4 text-yellow-500" /> Pending Submissions</h3>
                        <button onClick={() => setTab('pending')} className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">View All ({pending.length}) <ChevronRight className="w-3.5 h-3.5" /></button>
                      </div>
                      <div className="space-y-3">
                        {pending.slice(0, 5).map(item => (
                          <PendingRow key={`${item._type}-${item.id}`} item={item} onApprove={approve} onReject={reject} onPreview={setPreviewItem} processing={processing} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* PENDING */}
              {tab === 'pending' && (
                <div>
                  <h2 className="font-bold text-xl text-gray-900 mb-5">Pending Submissions ({pending.length})</h2>
                  {pending.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">
                      <CheckCircle2 className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>All caught up! No pending submissions.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        {pending.map(item => (
                          <PendingRow key={`${item._type}-${item.id}`} item={item} onApprove={approve} onReject={reject} onPreview={setPreviewItem} processing={processing} selected={previewItem?.id === item.id && previewItem?._type === item._type} />
                        ))}
                      </div>
                      {previewItem && (
                        <div className="bg-white rounded-2xl shadow-sm p-6 max-h-[70vh] overflow-y-auto sticky top-4">
                          <div className="flex items-center gap-2 mb-4">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${typeConfig[previewItem._type]?.color}`}>{typeConfig[previewItem._type]?.label}</span>
                            <span className="text-xs text-gray-400 font-bold uppercase tracking-wider">Preview</span>
                          </div>
                          <h2 className="text-xl font-bold text-gray-900 mb-1">{previewItem.title}</h2>
                          {previewItem.organization_display && <p className="text-gray-500 text-sm flex items-center gap-1.5 mb-4"><Building2 className="w-4 h-4" />{previewItem.organization_display}</p>}
                          {previewItem.submitted_by_name && <p className="text-xs text-gray-400 mb-1">Submitted by: {previewItem.submitted_by_name} ({previewItem.submitted_by_email})</p>}
                          <div className="prose prose-sm max-w-none text-gray-600 mt-4"><ReactMarkdown>{previewItem.description}</ReactMarkdown></div>
                          <div className="mt-5 flex gap-2">
                            <button onClick={() => approve(previewItem)} disabled={processing}
                              className="flex-1 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5 disabled:opacity-50"
                              style={{ background: ACCENT }}>
                              <CheckCircle2 className="w-4 h-4" /> Approve
                            </button>
                            <button onClick={() => reject(previewItem)} disabled={processing}
                              className="flex-1 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-sm font-semibold py-2.5 rounded-xl flex items-center justify-center gap-1.5">
                              <XCircle className="w-4 h-4" /> Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* FEATURED */}
              {tab === 'featured' && (
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <h2 className="font-bold text-xl text-gray-900 flex items-center gap-2">
                      <Star className="w-5 h-5 text-yellow-500" /> Featured Opportunities
                      <span className="text-sm font-normal text-gray-500">({featured.length} featured)</span>
                    </h2>
                  </div>
                  {featured.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm">
                      <Star className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      <p>No featured opportunities yet.</p>
                      <p className="text-xs mt-1">Go to "All Opportunities" and click the star to feature a listing.</p>
                    </div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {featured.map(item => {
                          const cfg = typeConfig[item._type]; const TypeIcon = cfg?.icon || Briefcase;
                          return (
                            <div key={`${item._type}-${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${cfg?.color}`}><TypeIcon className="w-4 h-4" /></div>
                                <div className="min-w-0">
                                  <p className="font-semibold text-gray-900 text-sm truncate">{item.title}</p>
                                  <div className="flex items-center gap-2 mt-0.5">
                                    {item.organization_display && <span className="text-xs text-gray-400 truncate">{item.organization_display}</span>}
                                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[item.status] || statusBadge.draft}`}>{item.status}</span>
                                  </div>
                                </div>
                              </div>
                              <button onClick={() => toggleFeatured(item)} disabled={processing}
                                className="flex items-center gap-1.5 text-xs bg-yellow-100 text-yellow-700 hover:bg-yellow-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                                <Star className="w-3.5 h-3.5 fill-current" /> Unfeature
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}


              {/* POST NEW */}
              {tab === 'post' && (
                <div className="max-w-2xl">
                  <div className="bg-white rounded-2xl shadow-sm p-7">
                    <h2 className="text-lg font-bold text-gray-900 mb-2">Post a New Opportunity</h2>
                    <p className="text-gray-500 text-sm mb-6">Choose the type to use the dedicated form with all relevant fields.</p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {Object.entries(typeConfig).map(([type, cfg]) => {
                        const TypeIcon = cfg.icon;
                        return (
                          <Link key={type} to={createPageUrl(`Submit${cfg.entity}`)}
                            className="bg-white rounded-xl border-2 border-gray-100 hover:border-indigo-300 p-5 flex items-center gap-4 transition-all hover:shadow-md">
                            <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${cfg.color}`}><TypeIcon className="w-5 h-5" /></div>
                            <div>
                              <div className="font-semibold text-gray-900 text-sm">Post {cfg.label}</div>
                              <div className="text-xs text-gray-400">Dedicated {cfg.label.toLowerCase()} form</div>
                            </div>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ALL OPPORTUNITIES / MY POSTS */}
              {(tab === 'all' || tab === 'my-posts') && (
                <div>
                  <div className="flex items-center gap-4 mb-5 flex-wrap">
                    <h2 className="font-bold text-xl text-gray-900">
                      {tab === 'my-posts' ? `My Posts (${adminPosts.length})` : `All Opportunities (${allItems.length})`}
                    </h2>
                    <button onClick={exportOpportunitiesCSV} className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium ml-auto" style={{ background: ACCENT }}>
                      <Download className="w-3.5 h-3.5" /> Export CSV
                    </button>
                  </div>

                  {tab === 'all' && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {sourceFilters.map(s => {
                        const count = s.value === 'admin' ? adminPosts.length : s.value === 'employers' ? employerPosts.length : allItems.length;
                        return (
                          <button key={s.value || 'all'} onClick={() => setSourceFilter(s.value)}
                            className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${sourceFilter === s.value ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                            style={sourceFilter === s.value ? { background: ACCENT } : {}}>
                            {s.label}{s.value ? ` (${count})` : ''}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {tab === 'my-posts' && (
                    <p className="text-sm text-gray-500 mb-4">Opportunities you posted directly as admin.</p>
                  )}

                  <div className="flex gap-2 flex-wrap mb-5">
                    {oppTypes.map(t => (
                      <button key={t.value} onClick={() => setTypeFilter(t.value)}
                        className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${typeFilter === t.value ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-indigo-300'}`}
                        style={typeFilter === t.value ? { background: ACCENT } : {}}>
                        {t.label}
                      </button>
                    ))}
                  </div>

                  <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                    {displayItems.length === 0 ? (
                      <div className="text-center py-16 text-gray-400">
                        <Briefcase className="w-10 h-10 mx-auto mb-3 opacity-30" />
                        <p>{tab === 'my-posts' ? 'You have not posted any opportunities yet.' : 'No listings match these filters.'}</p>
                        {tab === 'my-posts' && (
                          <Link to={createPageUrl('SubmitJob')} className="inline-flex mt-4 text-sm font-semibold text-indigo-600 hover:text-indigo-700">
                            Post your first opportunity →
                          </Link>
                        )}
                      </div>
                    ) : (
                      <div className="divide-y divide-gray-100">
                        {displayItems.map(item => {
                          const cfg = typeConfig[item._type]; const TypeIcon = cfg?.icon || Briefcase;
                          return (
                            <div key={`${item._type}-${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <TypeIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="font-medium text-gray-900 text-sm truncate">{item.title}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${statusBadge[item.status] || statusBadge.draft}`}>{item.status}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5 flex-wrap">
                                  {item.organization_display && <span className="text-xs text-gray-400">{item.organization_display}</span>}
                                  <span className="text-xs text-gray-300">{item.created_date ? format(new Date(item.created_date), 'dd MMM yyyy') : ''}</span>
                                  {(item.submitted_by_email || item.created_by) && (
                                    <span className="text-xs text-gray-400">By: {item.submitted_by_email || item.created_by}</span>
                                  )}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                {item.status === 'pending' && (
                                  <>
                                    <button onClick={() => approve(item)} disabled={processing} className="text-xs bg-green-100 text-green-700 hover:bg-green-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">Approve</button>
                                    <button onClick={() => reject(item)} disabled={processing} className="text-xs bg-red-100 text-red-700 hover:bg-red-200 px-2.5 py-1.5 rounded-lg font-medium transition-colors">Reject</button>
                                  </>
                                )}
                                <button onClick={() => toggleFeatured(item)} disabled={processing}
                                  className={`p-2 rounded-lg transition-colors ${item.featured ? 'text-yellow-500 hover:text-yellow-600 hover:bg-yellow-50' : 'text-gray-300 hover:text-yellow-500 hover:bg-yellow-50'}`}>
                                  <Star className={`w-4 h-4 ${item.featured ? 'fill-current' : ''}`} />
                                </button>
                                <Link to={createPageUrl(`EditOpportunity?id=${item.id}&type=${item._type}`)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors">
                                  <Pencil className="w-4 h-4" />
                                </Link>
                                <button onClick={() => toggle(item)} disabled={processing} className="p-2 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors">
                                  {item.status === 'published' ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                </button>
                                <button onClick={() => del(item)} disabled={processing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ARCHIVE */}
              {tab === 'archive' && (
                <div>
                  <div className="flex items-center gap-3 mb-5">
                    <Archive className="w-5 h-5 text-gray-400" />
                    <h2 className="font-bold text-xl text-gray-900">Archived Opportunities</h2>
                    <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Deadline expired over 1 month ago</span>
                  </div>
                  {archived.length === 0 ? (
                    <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm"><Archive className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No archived opportunities yet.</p></div>
                  ) : (
                    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                      <div className="divide-y divide-gray-100">
                        {archived.map(item => {
                          const cfg = typeConfig[item._type]; const TypeIcon = cfg?.icon || Briefcase;
                          const dl = item.deadline || item.application_deadline;
                          return (
                            <div key={`${item._type}-${item.id}`} className="flex items-center justify-between gap-4 px-5 py-4 hover:bg-gray-50 opacity-75">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2.5 flex-wrap">
                                  <TypeIcon className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                                  <span className="font-medium text-gray-700 text-sm truncate">{item.title}</span>
                                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
                                </div>
                                <div className="flex items-center gap-3 mt-0.5">
                                  {item.organization_display && <span className="text-xs text-gray-400">{item.organization_display}</span>}
                                  {dl && <span className="text-xs text-red-400">Deadline: {format(new Date(dl), 'dd MMM yyyy')}</span>}
                                </div>
                              </div>
                              <div className="flex items-center gap-1.5 shrink-0">
                                <Link to={createPageUrl(`EditOpportunity?id=${item.id}&type=${item._type}`)} className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"><Pencil className="w-4 h-4" /></Link>
                                <button onClick={() => del(item)} disabled={processing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* USERS */}
              {tab === 'users' && (
                <div>
                  <div className="flex items-center justify-between gap-4 mb-5 flex-wrap">
                    <h2 className="font-bold text-xl text-gray-900">User Management</h2>
                    <div className="flex gap-2">
                      <button onClick={() => exportUsersCSV(jobSeekers, 'job_seekers')} className="flex items-center gap-1.5 text-xs text-white px-3 py-1.5 rounded-lg font-medium" style={{ background: ACCENT }}>
                        <Download className="w-3.5 h-3.5" /> Export Job Seekers
                      </button>
                      <button onClick={() => exportUsersCSV(employers, 'employers')} className="flex items-center gap-1.5 text-xs bg-indigo-100 text-indigo-700 hover:bg-indigo-200 px-3 py-1.5 rounded-lg font-medium transition-colors">
                        <Download className="w-3.5 h-3.5" /> Export Employers
                      </button>
                    </div>
                  </div>
                  <div className="flex gap-1 mb-5 bg-gray-100 rounded-xl p-1 w-fit">
                    {[{ id: 'all', label: `All Users (${allUsers.length})` }, { id: 'job_seeker', label: `Job Seekers (${jobSeekers.length})` }, { id: 'employer', label: `Employers (${employers.length})` }].map(t => (
                      <button key={t.id} onClick={() => setUserTab(t.id)}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${userTab === t.id ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}>
                        {t.label}
                      </button>
                    ))}
                  </div>
                  {(() => {
                    const displayUsers = userTab === 'job_seeker' ? jobSeekers : userTab === 'employer' ? employers : allUsers;
                    return displayUsers.length === 0 ? (
                      <div className="text-center py-16 text-gray-400 bg-white rounded-2xl shadow-sm"><Users className="w-10 h-10 mx-auto mb-3 opacity-30" /><p>No users found.</p></div>
                    ) : (
                      <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-100">
                          {displayUsers.map(u => {
                            const profile = allProfiles.find(p => p.user_email === u.email);
                            return (
                              <div key={u.id} className="flex items-start justify-between gap-4 px-5 py-4 hover:bg-gray-50">
                                <div className="flex items-center gap-3 flex-1 min-w-0">
                                  <div className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 text-white text-sm font-bold" style={{ background: ACCENT }}>
                                    {(u.full_name || u.email || '?')[0].toUpperCase()}
                                  </div>
                                  <div className="min-w-0 flex-1">
                                    <div className="flex items-center gap-2 flex-wrap">
                                      <p className="font-semibold text-gray-900 text-sm">{u.full_name || '(No name)'}</p>
                                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${userTab === 'employer' ? 'bg-indigo-100 text-indigo-700' : 'bg-blue-100 text-blue-700'}`}>
                                        {userTab === 'employer' ? 'Employer' : 'Job Seeker'}
                                      </span>
                                    </div>
                                    <p className="text-xs text-gray-500">{u.email}</p>
                                    {profile && (
                                      <div className="flex flex-wrap gap-x-3 gap-y-0.5 mt-1">
                                        {profile.phone && <span className="text-xs text-gray-400">📞 {profile.phone}</span>}
                                        {profile.location && <span className="text-xs text-gray-400">📍 {profile.location}</span>}
                                        {profile.education && <span className="text-xs text-gray-400">🎓 {profile.education}</span>}
                                        {profile.skills && <span className="text-xs text-gray-400 truncate max-w-xs">🛠 {profile.skills}</span>}
                                        {profile.org_name && <span className="text-xs text-gray-400">🏢 {profile.org_name}</span>}
                                      </div>
                                    )}
                                    <p className="text-xs text-gray-300 mt-0.5">Joined: {u.created_date ? format(new Date(u.created_date), 'dd MMM yyyy') : 'Unknown'}</p>
                                  </div>
                                </div>
                                <div className="flex items-center gap-1 shrink-0">
                                  {u.role === 'employer' && (
                                    <>
                                      <button onClick={async () => { await supabase.rpc('set_employer_verification', { p_user_id: u.id, p_verified: true }); loadData(); }}
                                        className="text-xs px-2 py-1 rounded-lg bg-green-50 text-green-700 hover:bg-green-100">Verify</button>
                                      <button onClick={async () => { await supabase.rpc('set_employer_verification', { p_user_id: u.id, p_verified: false }); loadData(); }}
                                        className="text-xs px-2 py-1 rounded-lg bg-red-50 text-red-600 hover:bg-red-100">Reject</button>
                                    </>
                                  )}
                                  <button onClick={() => deleteUser(u.id)} disabled={processing} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"><Trash2 className="w-4 h-4" /></button>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* SITE SETTINGS */}
              {tab === 'settings' && <SiteSettingsPanel />}

              {/* BLOG */}
              {tab === 'blog' && <BlogManager />}

              {/* CONTACTS */}
              {tab === 'contacts' && (
                <AdminMessagesPanel
                  contacts={contacts}
                  onChanged={loadAll}
                />
              )}

              {/* NEWSLETTER */}
              {tab === 'newsletter' && <NewsletterPanel />}

              {/* NOTIFICATIONS */}
              {tab === 'notifications' && authUser?.email && (
                <div className="max-w-4xl">
                  <NotificationsPanel userEmail={authUser.email} role="admin" />
                </div>
              )}

              {/* PROFILE */}
              {tab === 'profile' && authUser && (
                <AdminProfileSection user={authUser} ACCENT={ACCENT} />
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}

function PendingRow({ item, onApprove, onReject, onPreview, processing, selected }) {
  const cfg = typeConfig[item._type];
  const TypeIcon = cfg?.icon || Briefcase;
  return (
    <div onClick={() => onPreview(item)}
      className={`p-4 rounded-2xl border cursor-pointer transition-all shadow-sm ${selected ? 'border-indigo-300 bg-indigo-50' : 'border-gray-200 bg-white hover:border-indigo-200'}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg?.color}`}>{cfg?.label}</span>
          </div>
          <h3 className="font-semibold text-gray-900 text-sm">{item.title}</h3>
          {item.organization_display && <p className="text-xs text-gray-400 mt-0.5">{item.organization_display}</p>}
          {item.submitted_by_name && <p className="text-xs text-gray-400">By: {item.submitted_by_name}</p>}
          <p className="text-xs text-gray-300 mt-1">{item.created_date ? format(new Date(item.created_date), 'dd MMM yyyy, HH:mm') : ''}</p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button onClick={(e) => { e.stopPropagation(); onApprove(item); }} disabled={processing}
            className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
          </button>
          <button onClick={(e) => { e.stopPropagation(); onReject(item); }} disabled={processing}
            className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition-colors">
            <XCircle className="w-3.5 h-3.5" /> Reject
          </button>
        </div>
      </div>
    </div>
  );
}