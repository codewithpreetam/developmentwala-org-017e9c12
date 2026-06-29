import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import {
  Building2, Briefcase, Users, Plus, Save, LogOut,
  CheckCircle2, Eye, Pencil, X, Mail, Phone, MapPin,
  GraduationCap, Briefcase as BriefcaseIcon, FileText, Star, Download, User, History,
  BarChart2, Archive, MessageSquare, CalendarDays, LayoutDashboard, Search, TrendingUp, ChevronRight, Trash2, AlertTriangle, Bookmark, Clock, Upload, Camera, Home
} from 'lucide-react';
import StatusUpdateModal from '../components/employer/StatusUpdateModal';
import EmployerProfileSection from '../components/employer/EmployerProfileSection';
import EmployerAnalytics from '../components/employer/EmployerAnalytics';
import EmployerInterviewPanel from '../components/interview/EmployerInterviewPanel';
import PullToRefresh from '../components/PullToRefresh';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import SEOHead from '../components/shared/SEOHead';
import NotificationBell from '../components/shared/NotificationBell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, LineChart, Line
} from 'recharts';

const ACCENT = '#4F46E5';

const statusOptions = [
  { value: 'applied', label: 'Applied', color: 'bg-blue-100 text-blue-700' },
  { value: 'reviewing', label: 'Reviewing', color: 'bg-yellow-100 text-yellow-700' },
  { value: 'shortlisted', label: 'Shortlisted', color: 'bg-indigo-100 text-indigo-700' },
  { value: 'interview', label: 'Interview', color: 'bg-purple-100 text-purple-700' },
  { value: 'selected', label: 'Selected / Hired', color: 'bg-green-100 text-green-700' },
  { value: 'rejected', label: 'Rejected', color: 'bg-red-100 text-red-700' },
];

const sectorOptions = [
  { value: 'education', label: 'Education' }, { value: 'health', label: 'Health' },
  { value: 'environment', label: 'Environment' }, { value: 'human_rights', label: 'Human Rights' },
  { value: 'poverty', label: 'Poverty' }, { value: 'gender_equality', label: 'Gender Equality' },
  { value: 'disaster_relief', label: 'Disaster Relief' }, { value: 'governance', label: 'Governance' },
  { value: 'livelihood', label: 'Livelihood' }, { value: 'child_welfare', label: 'Child Welfare' },
  { value: 'water_sanitation', label: 'Water &amp; Sanitation' }, { value: 'other', label: 'Other' },
];

const ngoTypes = [
  { value: 'ngo', label: 'NGO' }, { value: 'trust', label: 'Trust' }, { value: 'society', label: 'Society' },
  { value: 'section8', label: 'Section 8 Company' }, { value: 'social_enterprise', label: 'Social Enterprise' },
  { value: 'foundation', label: 'Foundation' }, { value: 'un_agency', label: 'UN Agency' },
  { value: 'ingo', label: 'INGO' }, { value: 'government', label: 'Government' }, { value: 'other', label: 'Other' },
];

const miniSparkData = Array.from({ length: 7 }, (_, i) => ({ v: Math.floor(Math.random() * 40) + 10 }));

export default function EmployerDashboard() {
  const { user, loading, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tab, setTabState] = useState(searchParams.get('tab') || 'overview');
  const setTab = (next) => { setTabState(next); setSearchParams({ tab: next }, { replace: true }); };
  useEffect(() => { const t = searchParams.get('tab'); if (t && t !== tab) setTabState(t); }, [searchParams]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [org, setOrg] = useState(null);
  const [myJobs, setMyJobs] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [saving, setSaving] = useState(false);
  const [savedMsg, setSavedMsg] = useState('');
  const [orgForm, setOrgForm] = useState({ org_name: '', ngo_type: '', website: '', location: '', about: '', sector: '', contact_email: '', linkedin_url: '', twitter_url: '', facebook_url: '', instagram_url: '', logo_url: '' });
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [selectedJobId, setSelectedJobId] = useState('');
  const [viewingProfile, setViewingProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [statusModalApp, setStatusModalApp] = useState(null);
  const [allApplicants, setAllApplicants] = useState([]);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [empProfilePic, setEmpProfilePic] = useState('');
  const [savedItems, setSavedItems] = useState([]);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  const loadData = async () => {
    const fetchMine = async (entity, type) => {
      if (!user?.id) return [];
      const items = await entity.filter({ employer_user_id: user.id }, '-created_date', 200);
      return items.map((i) => ({ ...i, _type: type }));
    };

    // Fetch in two batches to avoid rate limits
    const [orgs, empProfiles, jobs, internships, fellowships] = await Promise.all([
      base44.entities.Organization.filter({ user_email: user.email }),
      base44.entities.UserProfile.filter({ user_email: user.email, user_type: 'employer' }),
      fetchMine(base44.entities.Job, 'job'),
      fetchMine(base44.entities.Internship, 'internship'),
      fetchMine(base44.entities.Fellowship, 'fellowship'),
    ]);

    const signupOrgName = (empProfiles[0]?.org_name || '').trim();
    const defaultOrgName = signupOrgName || user.full_name || user.email.split('@')[0] || 'My Organization';

    if (orgs.length > 0) {
      const o = orgs[0];
      setOrg(o);
      setOrgForm({
        org_name: signupOrgName || o.org_name || defaultOrgName,
        ngo_type: o.ngo_type || '',
        website: o.website || '',
        location: o.location || '',
        about: o.about || '',
        sector: o.sector || '',
        contact_email: o.contact_email || '',
        linkedin_url: o.linkedin_url || '',
        twitter_url: o.twitter_url || '',
        facebook_url: o.facebook_url || '',
        instagram_url: o.instagram_url || '',
        logo_url: o.logo_url || '',
      });
    } else {
      const created = await base44.entities.Organization.create({
        user_email: user.email,
        org_name: defaultOrgName,
        email: user.email,
      });
      setOrg(created);
      setOrgForm((f) => ({
        ...f,
        org_name: defaultOrgName,
        contact_email: f.contact_email || user.email,
      }));
    }

    if (empProfiles.length > 0 && empProfiles[0].profile_picture) {
      setEmpProfilePic(empProfiles[0].profile_picture);
    }

    const [scholarships, grants, events] = await Promise.all([
      fetchMine(base44.entities.Scholarship, 'scholarship'),
      fetchMine(base44.entities.Grant, 'grant'),
      fetchMine(base44.entities.Event, 'event'),
    ]);

    const allPosts = [...jobs, ...internships, ...fellowships, ...scholarships, ...grants, ...events].sort((a, b) => new Date(b.created_date) - new Date(a.created_date));
    setMyJobs(allPosts);
    if (allPosts.length > 0 && !selectedJobId) setSelectedJobId(allPosts[0].id);

    if (allPosts.length > 0) {
      const appResults = await Promise.all(
        allPosts.map((j) => base44.entities.Application.filter({ opportunity_id: j.id }, '-created_date', 200))
      );
      const allApps = appResults.flat();
      const seenIds = new Set();
      setAllApplicants(allApps.filter((a) => { if (seenIds.has(a.id)) return false; seenIds.add(a.id); return true; }));
    } else {
      setAllApplicants([]);
    }

    const saved = await base44.entities.SavedOpportunity.filter({ user_email: user.email }, '-created_date', 100);
    setSavedItems(saved);
  };

  useEffect(() => {
    if (selectedJobId && user) loadApplicants(selectedJobId);
  }, [selectedJobId, user]);

  useEffect(() => {
    if (tab === 'applicants' && selectedJobId && user) loadApplicants(selectedJobId);
  }, [tab]);

  const loadApplicants = async (jobId) => {
    if (!jobId) {
      setApplicants([]);
      return;
    }
    const apps = await base44.entities.Application.filter({ opportunity_id: jobId }, '-created_date', 200);
    setApplicants(apps);
  };

  const uo = (k, v) => {
    setOrgForm(p => ({ ...p, [k]: v }));
  };

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingLogo(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    uo('logo_url', file_url);
    setUploadingLogo(false);
  };

  const submitContact = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setContactSending(true);
    await base44.entities.ContactMessage.create({ name: orgForm.org_name || user.full_name || '', email: user.email, subject: contactForm.subject, message: contactForm.message });
    await base44.functions.invoke('sendContactEmail', { name: orgForm.org_name || user.full_name || '', email: user.email, subject: contactForm.subject, message: contactForm.message }).catch(() => {});
    setContactSending(false); setContactSent(true); setContactForm({ subject: '', message: '' });
  };

  const saveOrg = async () => {
    setSaving(true);
    try {
      const data = { ...orgForm, user_email: user.email };
      let saved;
      if (org?.id) {
        saved = await base44.entities.Organization.update(org.id, data);
        setOrg(saved);
      } else {
        saved = await base44.entities.Organization.create({
          ...data,
          org_name: orgForm.org_name,
          email: orgForm.contact_email || user.email,
        });
        setOrg(saved);
      }
      setOrgForm((prev) => ({
        org_name: saved.org_name ?? saved.name ?? prev.org_name,
        ngo_type: saved.ngo_type ?? prev.ngo_type,
        website: saved.website ?? '',
        location: saved.location ?? '',
        about: saved.about ?? '',
        sector: saved.sector ?? '',
        contact_email: saved.contact_email || prev.contact_email || user.email,
        linkedin_url: saved.linkedin_url ?? '',
        twitter_url: saved.twitter_url ?? '',
        facebook_url: saved.facebook_url ?? '',
        instagram_url: saved.instagram_url ?? '',
        logo_url: saved.logo_url ?? '',
      }));
      setSavedMsg('Organization profile saved!');
      setTimeout(() => setSavedMsg(''), 3000);
      await loadData();
    } catch (err) {
      setSavedMsg(err.message || 'Failed to save organization profile.');
      setTimeout(() => setSavedMsg(''), 4000);
    } finally {
      setSaving(false);
    }
  };

  const openApplicantProfile = async (app) => {
    setLoadingProfile(true); setViewingProfile({ app, profile: null });
    const profiles = await base44.entities.UserProfile.filter({ user_email: app.applicant_email });
    setViewingProfile({ app, profile: profiles[0] || null }); setLoadingProfile(false);
  };

  // Optimistic status update — immediately reflects in UI, then refreshes in background
  const handleStatusUpdated = (newStatus) => {
    if (newStatus && statusModalApp) {
      const id = statusModalApp.id;
      const patch = (a) => a.id === id ? { ...a, status: newStatus } : a;
      setApplicants(prev => prev.map(patch));
      setAllApplicants(prev => prev.map(patch));
    }
    loadApplicants(selectedJobId);
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  const oneMonthAgo = new Date(); oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
  const archivedJobs = myJobs.filter(j => { const dl = j.deadline || j.application_deadline; return dl && new Date(dl) < oneMonthAgo; });
  const publishedJobs = myJobs.filter(j => j.status === 'published');

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = months.map((month, idx) => {
    const monthApps = allApplicants.filter(a => a.created_date && new Date(a.created_date).getMonth() === idx);
    return { month, applications: monthApps.length, shortlisted: monthApps.filter(a => ['shortlisted','interview','selected'].includes(a.status)).length };
  });

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'Organization', icon: Building2 },
    { id: 'employer_profile', label: 'Employer Profile', icon: User },
    { id: 'post', label: 'Post Opportunity', icon: Plus },
    { id: 'manage', label: `My Posts (${myJobs.length})`, icon: Briefcase },
    { id: 'applicants', label: 'Applicants', icon: Users },
    { id: 'interviews', label: 'Interviews', icon: CalendarDays },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'archive', label: `Archive (${archivedJobs.length})`, icon: Archive },
    { id: 'saved', label: `Saved (${savedItems.length})`, icon: Bookmark },
    { id: 'contact', label: 'Contact Us', icon: MessageSquare },
  ];

  const statsCards = [
    { label: 'Active Listings', value: publishedJobs.length, color: ACCENT },
    { label: 'Total Applicants', value: allApplicants.length, color: '#6366f1' },
    { label: 'Shortlisted', value: allApplicants.filter(a => ['shortlisted','interview','selected'].includes(a.status)).length, color: '#10b981' },
    { label: 'Hired', value: allApplicants.filter(a => a.status === 'selected').length, color: '#f59e0b' },
  ];

  const typeBadge = { job: 'bg-blue-50 text-blue-700', internship: 'bg-purple-50 text-purple-700', fellowship: 'bg-indigo-50 text-indigo-700', scholarship: 'bg-yellow-50 text-yellow-700', grant: 'bg-green-50 text-green-700', event: 'bg-pink-50 text-pink-700' };
  const detailPageMap = { job: 'JobDetail', internship: 'InternshipDetail', fellowship: 'FellowshipDetail', scholarship: 'ScholarshipDetail', grant: 'GrantDetail', event: 'EventDetail' };

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SEOHead title="Employer Dashboard — DevelopmentWala.org" description="Manage your NGO job listings and applicants." />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1c23] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <Building2 className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">DevelopmentWala.org</span>
          </Link>
        </div>

        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            {empProfilePic ? (
              <img src={empProfilePic} alt="Profile" className="w-10 h-10 rounded-full object-cover border-2 border-white/20 shrink-0" />
            ) : (
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-bold shrink-0" style={{ background: ACCENT }}>
                {(orgForm.org_name || user.full_name || 'E').charAt(0).toUpperCase()}
              </div>
            )}
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{orgForm.org_name || user.full_name || 'Employer'}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map(item => (
            <button key={item.id} onClick={() => { setTab(item.id); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${tab === item.id ? 'text-white' : 'text-gray-400 hover:text-white hover:bg-white/5'}`}
              style={tab === item.id ? { background: ACCENT } : {}}>
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 text-left">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Home className="w-4 h-4" /> View Website
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {sidebarOpen && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between sticky top-0 z-20">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen(true)} className="lg:hidden p-2 hover:bg-gray-100 rounded-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            </button>
            <h1 className="text-lg font-bold text-gray-900 capitalize">{tab === 'overview' ? 'Dashboard' : navItems.find(n => n.id === tab)?.label || tab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none w-56" />
            </div>
            <NotificationBell userEmail={user.email} userRole="employer" />
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-bold cursor-pointer" style={{ background: ACCENT }}
              onClick={() => setTab('profile')}>
              {(orgForm.org_name || user.full_name || 'E').charAt(0).toUpperCase()}
            </div>
          </div>
        </header>

        <PullToRefresh onRefresh={loadData}>
        <main className="flex-1 p-6 md:overflow-y-auto">
          {savedMsg && <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-5 py-3 rounded-xl text-sm font-medium flex items-center gap-2"><CheckCircle2 className="w-4 h-4" />{savedMsg}</div>}

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-1">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{s.value}</p>
                      </div>
                      <div className="w-16 h-10">
                        <ResponsiveContainer width="100%" height="100%">
                          <LineChart data={miniSparkData}><Line type="monotone" dataKey="v" stroke={s.color} strokeWidth={2} dot={false} /></LineChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Application Trends</h3>
                    <span className="text-xs text-gray-400">This Year</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="empApp" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="empShort" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10b981" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                      <Area type="monotone" dataKey="applications" name="Applications" stroke={ACCENT} strokeWidth={2.5} fill="url(#empApp)" />
                      <Area type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#10b981" strokeWidth={2.5} fill="url(#empShort)" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Recent Listings</h3>
                    <button onClick={() => setTab('manage')} className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">All <ChevronRight className="w-3.5 h-3.5" /></button>
                  </div>
                  {myJobs.length === 0 ? (
                    <div className="text-center py-8">
                      <Briefcase className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                      <p className="text-sm text-gray-400">No listings yet</p>
                      <button onClick={() => setTab('post')} className="mt-3 text-xs text-white px-4 py-2 rounded-lg font-semibold" style={{ background: ACCENT }}>Post Now</button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {myJobs.slice(0, 5).map(job => (
                        <div key={`${job._type}-${job.id}`} className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-50">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: `${ACCENT}15` }}>
                            <Briefcase className="w-3.5 h-3.5" style={{ color: ACCENT }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-gray-900 truncate">{job.title}</p>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium capitalize ${typeBadge[job._type] || 'bg-gray-50 text-gray-600'}`}>{job._type}</span>
                          </div>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{job.status}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Recent applicants */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Applicants</h3>
                  <button onClick={() => setTab('applicants')} className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
                {allApplicants.length === 0 ? (
                  <div className="text-center py-8 text-gray-400"><Users className="w-8 h-8 mx-auto mb-2 opacity-30" /><p className="text-sm">No applicants yet.</p></div>
                ) : (
                  <div className="space-y-2">
                    {allApplicants.slice(0, 5).map(app => {
                      const st = statusOptions.find(s => s.value === app.status);
                      return (
                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50">
                          <div className="w-9 h-9 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0" style={{ background: ACCENT }}>
                            {(app.applicant_name || app.applicant_email || 'A').charAt(0).toUpperCase()}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{app.applicant_name || app.applicant_email}</p>
                            <p className="text-xs text-gray-400 truncate">{app.opportunity_title}</p>
                          </div>
                          {st && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${st.color}`}>{st.label}</span>}
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ORGANIZATION PROFILE */}
          {tab === 'profile' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm p-7 border border-gray-200" style={{ colorScheme: 'light' }}>
                <h2 className="text-lg font-bold text-gray-900 mb-6">Organization Profile</h2>
                <div className="space-y-5">
                  {/* Logo Upload */}
                  <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100">
                    <div className="relative shrink-0">
                      {orgForm.logo_url ? (
                        <img src={orgForm.logo_url} alt="Org Logo" className="w-20 h-20 rounded-xl object-contain border border-gray-200 bg-white p-1" />
                      ) : (
                        <div className="w-20 h-20 rounded-xl flex items-center justify-center text-white text-2xl font-bold bg-gradient-to-br from-indigo-500 to-blue-600">
                          {(orgForm.org_name || 'O').charAt(0).toUpperCase()}
                        </div>
                      )}
                      {uploadingLogo && (
                        <div className="absolute inset-0 rounded-xl bg-black/40 flex items-center justify-center">
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-1">Organization Logo</p>
                      <p className="text-xs text-gray-400 mb-2">Shown on job listings, detail pages and employer profile</p>
                      <div className="flex items-center gap-2 flex-wrap">
                        <label className="cursor-pointer text-xs font-semibold text-white px-3 py-1.5 rounded-lg flex items-center gap-1.5 hover:opacity-90 transition-opacity" style={{ background: ACCENT }}>
                          <Camera className="w-3.5 h-3.5" />
                          {orgForm.logo_url ? 'Replace Logo' : 'Upload Logo'}
                          <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" disabled={uploadingLogo} />
                        </label>
                        {orgForm.logo_url && (
                          <button onClick={() => uo('logo_url', '')} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors">
                            <Trash2 className="w-3.5 h-3.5" /> Remove
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Organization Name</label>
                      <Input
                        value={orgForm.org_name}
                        onChange={(e) => uo('org_name', e.target.value)}
                        placeholder="Your organization's display name"
                        className="h-11 rounded-xl"
                      />
                      <p className="text-xs text-gray-500 mt-1">Shown on every opportunity you post. Updates sync everywhere automatically.</p>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">NGO Type</label>
                      <Select value={orgForm.ngo_type} onValueChange={(v) => uo('ngo_type', v)}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent>{ngoTypes.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Website</label>
                      <Input type="url" value={orgForm.website} onChange={(e) => uo('website', e.target.value)} placeholder="https://yourorg.org" className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                      <Input value={orgForm.location} onChange={(e) => uo('location', e.target.value)} placeholder="City, State" className="h-11 rounded-xl" />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Sector</label>
                      <Select value={orgForm.sector} onValueChange={(v) => uo('sector', v)}>
                        <SelectTrigger className="h-11 rounded-xl"><SelectValue placeholder="Select sector" /></SelectTrigger>
                        <SelectContent>{sectorOptions.map(o => <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Contact Email</label>
                      <Input type="email" value={orgForm.contact_email} onChange={(e) => uo('contact_email', e.target.value)} placeholder="hr@org.ngo" className="h-11 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">About Organization</label>
                    <Textarea value={orgForm.about} onChange={(e) => uo('about', e.target.value)} placeholder="Brief description of your organization..." className="min-h-[100px] rounded-xl" />
                  </div>
                  <div className="border-t border-gray-100 pt-5">
                    <p className="text-sm font-bold text-gray-700 mb-4">Social Media Links</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><label className="block text-sm font-medium text-gray-600 mb-1.5">LinkedIn</label><Input type="url" value={orgForm.linkedin_url} onChange={(e) => uo('linkedin_url', e.target.value)} placeholder="https://linkedin.com/company/..." className="h-11 rounded-xl" /></div>
                      <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Twitter / X</label><Input type="url" value={orgForm.twitter_url} onChange={(e) => uo('twitter_url', e.target.value)} placeholder="https://twitter.com/..." className="h-11 rounded-xl" /></div>
                      <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Facebook</label><Input type="url" value={orgForm.facebook_url} onChange={(e) => uo('facebook_url', e.target.value)} placeholder="https://facebook.com/..." className="h-11 rounded-xl" /></div>
                      <div><label className="block text-sm font-medium text-gray-600 mb-1.5">Instagram</label><Input type="url" value={orgForm.instagram_url} onChange={(e) => uo('instagram_url', e.target.value)} placeholder="https://instagram.com/..." className="h-11 rounded-xl" /></div>
                    </div>
                  </div>
                  <button onClick={saveOrg} disabled={saving || !orgForm.org_name}
                    className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                    style={{ background: ACCENT }}>
                    <Save className="w-4 h-4" /> {saving ? 'Saving...' : 'Save Profile'}
                  </button>
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-bold text-red-600 mb-2">Danger Zone</h3>
                    <button onClick={() => setDeleteModal(true)}
                      className="flex items-center gap-2 text-sm font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 px-5 py-2.5 rounded-xl transition-colors">
                      <Trash2 className="w-4 h-4" /> Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {deleteModal && (
            <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center shrink-0">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                  </div>
                  <h3 className="font-bold text-gray-900">Delete Account?</h3>
                </div>
                <p className="text-sm text-gray-500 mb-6">This will permanently delete your organization profile and all data. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      if (org?.id) await base44.entities.Organization.delete(org.id);
                      setDeleteModal(false);
                      logout();
                    }}
                    disabled={deleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-sm font-semibold disabled:opacity-60 transition-colors">
                    {deleting ? 'Deleting...' : 'Yes, Delete'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* POST */}
          {tab === 'post' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-2">Post an Opportunity</h2>
                <p className="text-gray-500 text-sm mb-6">Choose the type to use the dedicated form with all relevant fields.</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {[
                    { label: 'Job', page: 'SubmitJob', color: 'bg-blue-50 text-blue-600 border-blue-100', desc: 'Full-time, part-time or volunteer' },
                    { label: 'Internship', page: 'SubmitInternship', color: 'bg-purple-50 text-purple-600 border-purple-100', desc: 'Short-term learning opportunities' },
                    { label: 'Fellowship', page: 'SubmitFellowship', color: 'bg-indigo-50 text-indigo-600 border-indigo-100', desc: 'Structured leadership programmes' },
                    { label: 'Scholarship', page: 'SubmitScholarship', color: 'bg-yellow-50 text-yellow-600 border-yellow-100', desc: 'Education funding opportunities' },
                    { label: 'Grant', page: 'SubmitGrant', color: 'bg-green-50 text-green-600 border-green-100', desc: 'Funding for NGOs &amp; nonprofits' },
                    { label: 'Event', page: 'SubmitEvent', color: 'bg-pink-50 text-pink-600 border-pink-100', desc: 'Conferences, webinars &amp; workshops' },
                  ].map(t => (
                    <Link key={t.label} to={createPageUrl(t.page)} className={`flex items-center gap-4 p-4 rounded-xl border-2 hover:shadow-md transition-all ${t.color}`}>
                      <div>
                        <div className="font-semibold text-gray-900 text-sm">Post {t.label}</div>
                        <div className="text-xs text-gray-500 mt-0.5">{t.desc}</div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* MANAGE */}
          {tab === 'manage' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">My Posted Opportunities</h2>
              {myJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                  <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No opportunities posted yet.</p>
                  <button onClick={() => setTab('post')} className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold" style={{ background: ACCENT }}>Post First Opportunity</button>
                </div>
              ) : (
                <div className="space-y-3">
                  {myJobs.map(job => (
                    <div key={`${job._type}-${job.id}`} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900">{job.title}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${typeBadge[job._type] || 'bg-gray-50 text-gray-600'}`}>{job._type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${job.status === 'published' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>{job.status}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <button onClick={() => { setSelectedJobId(job.id); setTab('applicants'); }} className="flex items-center gap-1.5 text-xs text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium"><Users className="w-3.5 h-3.5" /> Applicants</button>
                        <Link to={createPageUrl(`EditOpportunity?id=${job.id}&type=${job._type}`)} className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg hover:bg-orange-100 font-medium"><Pencil className="w-3.5 h-3.5" /> Edit</Link>
                        <Link to={createPageUrl(`${detailPageMap[job._type] || 'JobDetail'}?id=${job.id}`)} className="flex items-center gap-1.5 text-xs text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg hover:bg-gray-100 font-medium"><Eye className="w-3.5 h-3.5" /> View</Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* APPLICANTS */}
          {tab === 'applicants' && (
            <div>
              <div className="flex items-center gap-4 mb-5 flex-wrap">
                <h2 className="text-lg font-bold text-gray-900">Applicants</h2>
                {myJobs.length > 0 && (
                  <Select value={selectedJobId} onValueChange={(v) => setSelectedJobId(v)}>
                    <SelectTrigger className="w-72 rounded-xl"><SelectValue placeholder="Select opportunity" /></SelectTrigger>
                    <SelectContent>
                      {myJobs.map((j) => (
                        <SelectItem key={`${j._type}-${j.id}`} value={j.id}>{j.title}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
              {applicants.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center"><Users className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No applicants yet for this opportunity.</p></div>
              ) : (
                <div className="space-y-3">
                  {applicants.map(app => {
                    const currentStatus = statusOptions.find(s => s.value === app.status);
                    const historyCount = Array.isArray(app.status_history) ? app.status_history.length : 0;
                    return (
                      <div key={app.id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                          <div className="flex-1">
                            <h3 className="font-semibold text-gray-900">{app.applicant_name || app.applicant_email}</h3>
                            <p className="text-sm text-gray-500">{app.applicant_email}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                              {currentStatus && <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${currentStatus.color}`}>{currentStatus.label}</span>}
                              {historyCount > 0 && <span className="text-xs text-gray-400 flex items-center gap-1"><History className="w-3 h-3" /> {historyCount} update{historyCount !== 1 ? 's' : ''}</span>}
                            </div>
                          </div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <button onClick={() => openApplicantProfile(app)} className="flex items-center gap-1.5 text-xs text-green-700 bg-green-50 px-3 py-1.5 rounded-lg hover:bg-green-100 font-medium border border-green-200"><User className="w-3.5 h-3.5" /> View Profile</button>
                            <button onClick={() => setStatusModalApp(app)} className="flex items-center gap-1.5 text-xs text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 font-medium border border-blue-200"><Mail className="w-3.5 h-3.5" /> Update Status</button>
                          </div>
                        </div>
                        {historyCount > 0 && (
                          <div className="mt-3 pt-3 border-t border-gray-100">
                            <p className="text-xs text-gray-400 mb-1">Last update:</p>
                            <p className="text-xs text-gray-600 line-clamp-1">{app.status_history[historyCount - 1]?.message}</p>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* EMPLOYER PROFILE */}
          {tab === 'employer_profile' && (
            <EmployerProfileSection user={user} ACCENT={ACCENT} onProfilePicChange={setEmpProfilePic} />
          )}

          {/* INTERVIEWS */}
          {tab === 'interviews' && <EmployerInterviewPanel employerEmail={user.email} orgName={orgForm.org_name} allApplicants={allApplicants} />}

          {/* ANALYTICS */}
          {tab === 'analytics' && <EmployerAnalytics myJobs={myJobs} applicants={allApplicants} />}

          {/* ARCHIVE */}
          {tab === 'archive' && (
            <div>
              <div className="flex items-center gap-3 mb-5">
                <Archive className="w-5 h-5 text-gray-400" />
                <h2 className="text-lg font-bold text-gray-900">Archived Opportunities</h2>
                <span className="text-xs bg-gray-100 text-gray-500 px-2.5 py-1 rounded-full font-medium">Deadline expired</span>
              </div>
              {archivedJobs.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center"><Archive className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No archived opportunities yet.</p></div>
              ) : (
                <div className="space-y-3">
                  {archivedJobs.map(job => {
                    const dl = job.deadline || job.application_deadline;
                    return (
                      <div key={`${job._type}-${job.id}`} className="bg-gray-50 rounded-xl border border-gray-200 p-5 flex items-center justify-between gap-4 opacity-80">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-gray-700">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1 flex-wrap">
                            <span className={`text-xs px-2 py-0.5 rounded-full capitalize font-medium ${typeBadge[job._type] || 'bg-gray-50 text-gray-600'}`}>{job._type}</span>
                            {dl && <span className="text-xs text-red-400">Deadline: {new Date(dl).toLocaleDateString('en-IN')}</span>}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link to={createPageUrl(`${detailPageMap[job._type] || 'JobDetail'}?id=${job.id}`)} className="flex items-center gap-1.5 text-xs text-gray-500 bg-white px-3 py-1.5 rounded-lg font-medium border border-gray-200"><Eye className="w-3.5 h-3.5" /> View</Link>
                          <Link to={createPageUrl(`EditOpportunity?id=${job.id}&type=${job._type}`)} className="flex items-center gap-1.5 text-xs text-orange-600 bg-orange-50 px-3 py-1.5 rounded-lg font-medium"><Pencil className="w-3.5 h-3.5" /> Repost</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* SAVED */}
          {tab === 'saved' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Saved Opportunities ({savedItems.length})</h2>
              <p className="text-sm text-gray-400 mb-5">Bookmark events, grants, and other opportunities for quick access.</p>
              {savedItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                  <Bookmark className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No saved opportunities yet.</p>
                  <Link to="/events" className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-block" style={{ background: ACCENT }}>Browse Events</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.opportunity_title || 'Opportunity'}</h3>
                        {item.organization && <p className="text-sm text-gray-500 mt-0.5">{item.organization}</p>}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                          {item.opportunity_type && (
                            <span className={`px-2 py-0.5 rounded-full font-medium capitalize ${{ event: 'bg-pink-50 text-pink-700', grant: 'bg-green-50 text-green-700' }[item.opportunity_type] || 'bg-indigo-50 text-indigo-700'}`}>
                              {item.opportunity_type}
                            </span>
                          )}
                          {item.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline {new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {item.detail_page && item.opportunity_id && (
                          <a href={`/${item.detail_page}?id=${item.opportunity_id}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                            <Eye className="w-3.5 h-3.5" /> View
                          </a>
                        )}
                        <button onClick={async () => {
                          await base44.entities.SavedOpportunity.delete(item.id);
                          setSavedItems(prev => prev.filter(s => s.id !== item.id));
                        }} className="flex items-center gap-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200">
                          <X className="w-3.5 h-3.5" /> Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* CONTACT */}
          {tab === 'contact' && (
            <div className="max-w-xl">
              <div className="bg-white rounded-2xl shadow-sm p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Us</h2>
                <p className="text-gray-500 text-sm mb-6">Have a question or need help? Send us a message.</p>
                {contactSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-green-800">Message sent!</p>
                    <p className="text-green-600 text-sm mt-1">We'll get back to you soon.</p>
                    <button onClick={() => setContactSent(false)} className="mt-4 text-sm text-green-700 underline">Send another</button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Subject</label>
                      <Input value={contactForm.subject} onChange={(e) => setContactForm(f => ({ ...f, subject: e.target.value }))} placeholder="What can we help you with?" className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Message</label>
                      <Textarea value={contactForm.message} onChange={(e) => setContactForm(f => ({ ...f, message: e.target.value }))} placeholder="Describe your issue or question..." className="min-h-[120px] rounded-xl" />
                    </div>
                    <button onClick={submitContact} disabled={contactSending || !contactForm.subject || !contactForm.message}
                      className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                      style={{ background: ACCENT }}>
                      <MessageSquare className="w-4 h-4" /> {contactSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        </PullToRefresh>
      </div>

      {/* Status Modal */}
      {statusModalApp && (
        <StatusUpdateModal
          app={statusModalApp}
          orgName={orgForm.org_name}
          onClose={() => setStatusModalApp(null)}
          onUpdated={handleStatusUpdated}
        />
      )}

      {/* Applicant Profile Modal */}
      {viewingProfile && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4 py-8 overflow-y-auto">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl my-auto">
            <div className="flex items-center justify-between p-6 border-b border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg">Applicant Profile</h3>
              <button onClick={() => setViewingProfile(null)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-5 h-5 text-gray-500" /></button>
            </div>
            <div className="p-6">
              {loadingProfile ? (
                <div className="flex items-center justify-center py-12"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>
              ) : (
                <>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 text-white text-xl font-bold" style={{ background: ACCENT }}>
                      {(viewingProfile.profile?.full_name || viewingProfile.app.applicant_name || 'A').charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-gray-900">{viewingProfile.profile?.full_name || viewingProfile.app.applicant_name || 'Unknown'}</h4>
                      <div className="flex flex-wrap gap-3 mt-1.5 text-sm text-gray-500">
                        <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{viewingProfile.app.applicant_email}</span>
                        {viewingProfile.profile?.phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{viewingProfile.profile.phone}</span>}
                        {viewingProfile.profile?.location && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{viewingProfile.profile.location}</span>}
                      </div>
                    </div>
                  </div>
                  {!viewingProfile.profile ? (
                    <div className="bg-gray-50 rounded-xl p-5 text-center text-gray-400 text-sm">This applicant has not set up a full profile yet.</div>
                  ) : (
                    <div className="space-y-4">
                      {viewingProfile.profile.summary && <div className="bg-blue-50 rounded-xl p-4"><p className="text-xs font-bold text-blue-700 mb-1.5">Profile Summary</p><p className="text-sm text-blue-900">{viewingProfile.profile.summary}</p></div>}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {viewingProfile.profile.education && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><GraduationCap className="w-3.5 h-3.5" /> Education</p><p className="text-sm text-gray-800">{viewingProfile.profile.education}</p></div>}
                        {viewingProfile.profile.skills && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><Star className="w-3.5 h-3.5" /> Skills</p><div className="flex flex-wrap gap-1.5">{viewingProfile.profile.skills.split(',').map(s => s.trim()).filter(Boolean).map(skill => <span key={skill} className="text-xs bg-white border border-gray-200 text-gray-700 px-2.5 py-1 rounded-full">{skill}</span>)}</div></div>}
                      </div>
                      {viewingProfile.profile.experience && <div className="bg-gray-50 rounded-xl p-4"><p className="text-xs font-bold text-gray-500 mb-1.5 flex items-center gap-1.5"><BriefcaseIcon className="w-3.5 h-3.5" /> Work Experience</p><p className="text-sm text-gray-800 whitespace-pre-line">{viewingProfile.profile.experience}</p></div>}
                      {viewingProfile.app.cover_letter && <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100"><p className="text-xs font-bold text-yellow-700 mb-1.5 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Cover Letter</p><p className="text-sm text-yellow-900">{viewingProfile.app.cover_letter}</p></div>}
                      {viewingProfile.profile.cv_url && (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                          <div className="flex items-center justify-between px-4 py-2.5 bg-gray-50 border-b border-gray-200">
                            <span className="text-xs font-semibold text-gray-600 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Resume / CV</span>
                            <a href={viewingProfile.profile.cv_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-xs text-blue-600 font-semibold"><Download className="w-3.5 h-3.5" /> Download</a>
                          </div>
                          <iframe src={`https://docs.google.com/viewer?url=${encodeURIComponent(viewingProfile.profile.cv_url)}&embedded=true`} className="w-full h-[420px] bg-gray-50" title="Resume Preview" />
                        </div>
                      )}
                    </div>
                  )}
                  <div className="flex items-center justify-between mt-6 pt-5 border-t border-gray-100">
                    <a href={`mailto:${viewingProfile.app.applicant_email}`} className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 font-medium"><Mail className="w-4 h-4" /> Email Applicant</a>
                    <button onClick={() => setViewingProfile(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold px-6 py-2.5 rounded-xl text-sm">Close</button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}