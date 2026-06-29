import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { base44 } from '@/api/base44Client';
import { useAuth } from '../components/auth/AuthContext';
import {
  User, Briefcase, Bell, Save, Upload, Camera,
  CheckCircle2, Clock, Star, XCircle, MessageCircle, LogOut, Plus, Eye, History,
  BookmarkCheck, LayoutDashboard, Search, ChevronRight, TrendingUp, MapPin, Trash2, AlertTriangle, X, Mail, Home
} from 'lucide-react';
import ApplicationDetailModal from '../components/candidate/ApplicationDetailModal';
import EmailSubscriptionCard from '../components/candidate/EmailSubscriptionCard';
import CandidateInterviewSection from '../components/interview/CandidateInterviewSection';
import PullToRefresh from '../components/PullToRefresh';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import SEOHead from '../components/shared/SEOHead';
import { getProfileCompletion } from '@/lib/supabase/extra-entities';
import { Progress } from '@/components/ui/progress';
import NotificationBell from '../components/shared/NotificationBell';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts';

const ACCENT = '#4F46E5';

const statusInfo = {
  applied: { label: 'Applied', color: 'bg-blue-100 text-blue-700', icon: Clock },
  reviewing: { label: 'Under Review', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  shortlisted: { label: 'Shortlisted', color: 'bg-indigo-100 text-indigo-700', icon: Star },
  interview: { label: 'Interview', color: 'bg-purple-100 text-purple-700', icon: MessageCircle },
  selected: { label: 'Selected / Hired', color: 'bg-green-100 text-green-700', icon: CheckCircle2 },
  rejected: { label: 'Rejected', color: 'bg-red-100 text-red-700', icon: XCircle },
};

const sectorOptions = ['education', 'health', 'environment', 'human_rights', 'poverty', 'gender_equality', 'disaster_relief', 'governance', 'livelihood', 'child_welfare', 'water_sanitation', 'other'];

const miniSparkData = [10, 28, 15, 35, 22, 40, 30].map(v => ({ v }));

const PAGE_SIZE_NOTIF = 10;

function NotificationList({ notifications }) {
  const [showCount, setShowCount] = useState(PAGE_SIZE_NOTIF);
  const visible = notifications.slice(0, showCount);
  return (
    <div>
      <div className="space-y-3">
        {visible.map(n => {
          const typeColors = {
            status_selected: 'border-l-green-500 bg-green-50',
            status_shortlisted: 'border-l-indigo-500 bg-indigo-50',
            status_interview: 'border-l-purple-500 bg-purple-50',
            status_rejected: 'border-l-red-500 bg-red-50',
            status_reviewing: 'border-l-yellow-500 bg-yellow-50',
          };
          const colorClass = typeColors[n.type] || 'border-l-blue-500 bg-white';
          const parts = n.message ? n.message.split('\n\n') : [];
          return (
            <div key={n.id} className={`rounded-xl border border-gray-200 border-l-4 p-4 ${colorClass}`}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <p className="font-bold text-gray-900 text-sm">{n.title}</p>
                <p className="text-xs text-gray-400 shrink-0">{n.created_date ? new Date(n.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
              </div>
              <div className="space-y-1">
                {parts.map((part, i) => {
                  if (part.startsWith('Next Steps:')) return (
                    <div key={i} className="bg-white/70 rounded-lg p-2 mt-1">
                      <p className="text-xs font-bold text-gray-500 mb-0.5">Next Steps</p>
                      <p className="text-xs text-gray-700">{part.replace('Next Steps: ', '')}</p>
                    </div>
                  );
                  return <p key={i} className="text-sm text-gray-700">{part}</p>;
                })}
              </div>
            </div>
          );
        })}
      </div>
      {showCount < notifications.length && (
        <button onClick={() => setShowCount(c => c + PAGE_SIZE_NOTIF)}
          className="mt-4 w-full py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-600 hover:bg-gray-50">
          View More ({notifications.length - showCount} remaining)
        </button>
      )}
    </div>
  );
}

export default function CandidateDashboard() {
  const { user, profile, refreshProfile, loading, logout } = useAuth();
  const [tab, setTab] = useState('overview');
  const [applications, setApplications] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [viewingApp, setViewingApp] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [contactForm, setContactForm] = useState({ subject: '', message: '' });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);
  const [form, setForm] = useState({
    full_name: '', phone: '', location: '', education: '',
    skills: '', experience: '', summary: '', sector_interests: [], cv_url: '',
    profile_picture: '',
  });
  const [uploadingPic, setUploadingPic] = useState(false);
  const [picError, setPicError] = useState('');
  const [savedItems, setSavedItems] = useState([]);
  const [profileCompletion, setProfileCompletion] = useState(0);

  useEffect(() => {
    if (user) loadData();
  }, [user]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name || user?.full_name || '',
        phone: profile.phone || '', location: profile.location || '',
        education: profile.education || '', skills: profile.skills || '',
        experience: profile.experience || '', summary: profile.summary || '',
        sector_interests: profile.sector_interests || [], cv_url: profile.cv_url || '',
        profile_picture: profile.profile_picture || '',
      });
    } else if (user) {
      setForm(f => ({ ...f, full_name: user.full_name || '' }));
    }
  }, [profile, user]);

  const loadData = async () => {
    const [apps, allNotifs, saved] = await Promise.all([
      base44.entities.Application.filter({ applicant_email: user.email }, '-created_date', 100),
      base44.entities.Notification.filter({ user_email: user.email }, '-created_date', 100),
      base44.entities.SavedOpportunity.filter({ user_email: user.email }, '-created_date', 100),
    ]);
    setSavedItems(saved);
    setApplications(apps);
    if (user?.user_id) {
      const score = await getProfileCompletion(user.user_id);
      setProfileCompletion(score);
    }
    const notifs = allNotifs.filter(n => !n.type || n.type.startsWith('status_') || n.type === 'application' || n.type?.startsWith('interview'));
    setNotifications(notifs);
    const unread = notifs.filter(n => !n.read);
    if (unread.length > 0) {
      await Promise.all(unread.map(n => base44.entities.Notification.update(n.id, { read: true })));
    }
  };

  const u = (k, v) => setForm(p => ({ ...p, [k]: v }));
  const toggleSector = (s) => setForm(p => ({ ...p, sector_interests: p.sector_interests.includes(s) ? p.sector_interests.filter(x => x !== s) : [...p.sector_interests, s] }));

  const submitContact = async () => {
    if (!contactForm.subject.trim() || !contactForm.message.trim()) return;
    setContactSending(true);
    await base44.entities.ContactMessage.create({ name: form.full_name || user.full_name || '', email: user.email, subject: contactForm.subject, message: contactForm.message });
    await base44.functions.invoke('sendContactEmail', { name: form.full_name || user.full_name || '', email: user.email, subject: contactForm.subject, message: contactForm.message }).catch(() => {});
    setContactSending(false); setContactSent(true); setContactForm({ subject: '', message: '' });
  };

  const saveProfile = async () => {
    setSaving(true);
    const data = { ...form, user_email: user.email, user_type: 'job_seeker' };
    if (profile?.id) await base44.entities.UserProfile.update(profile.id, data);
    else await base44.entities.UserProfile.create(data);
    await refreshProfile();
    if (user?.user_id) {
      const score = await getProfileCompletion(user.user_id);
      setProfileCompletion(score);
    }
    setSaving(false); setSaved(true); setTimeout(() => setSaved(false), 3000);
  };

  const handleCVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    u('cv_url', file_url);
  };

  const handleProfilePicUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadingPic(true);
    setPicError('');
    try {
      const { file_url } = await base44.integrations.Core.UploadFile({ file, folder: 'avatars' });
      u('profile_picture', file_url);
      const data = { ...form, profile_picture: file_url, user_email: user.email, user_type: 'job_seeker' };
      if (profile?.id) await base44.entities.UserProfile.update(profile.id, data);
      else await base44.entities.UserProfile.create(data);
      await refreshProfile();
    } catch (err) {
      setPicError(err.message || 'Failed to upload profile picture');
    } finally {
      setUploadingPic(false);
      e.target.value = '';
    }
  };

  const handleProfilePicDelete = async () => {
    u('profile_picture', '');
    setPicError('');
    try {
      const data = { ...form, profile_picture: '', user_email: user.email, user_type: 'job_seeker' };
      if (profile?.id) await base44.entities.UserProfile.update(profile.id, data);
      await refreshProfile();
    } catch (err) {
      setPicError(err.message || 'Failed to remove profile picture');
    }
  };

  if (loading) return <div className="min-h-screen flex items-center justify-center bg-[#f4f6fb]"><div className="w-8 h-8 border-2 border-red-500 border-t-transparent rounded-full animate-spin" /></div>;

  const unreadCount = notifications.filter(n => !n.read).length;
  const shortlisted = applications.filter(a => ['shortlisted', 'interview', 'selected'].includes(a.status)).length;

  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const chartData = months.map((month, idx) => {
    const monthApps = applications.filter(a => a.created_date && new Date(a.created_date).getMonth() === idx);
    return { month, applied: monthApps.length, shortlisted: monthApps.filter(a => ['shortlisted','interview','selected'].includes(a.status)).length };
  });

  const navItems = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'profile', label: 'My Profile', icon: User },
    { id: 'applications', label: 'Applications', icon: Briefcase, badge: applications.length },
    { id: 'interviews', label: 'My Interviews', icon: BookmarkCheck },
    { id: 'saved', label: 'Saved', icon: Save, badge: savedItems.length },
    { id: 'notifications', label: 'Notifications', icon: Bell, badge: unreadCount },
    { id: 'alerts', label: 'Email Alerts', icon: Mail },
    { id: 'contact', label: 'Contact Us', icon: MessageCircle },
  ];

  const statsCards = [
    { label: 'Applications Sent', value: applications.length, color: ACCENT },
    { label: 'Shortlisted', value: shortlisted, color: '#6366f1' },
    { label: 'Profile Views', value: profile ? 47 : 0, color: '#10b981' },
    { label: 'Notifications', value: notifications.length, color: '#f59e0b' },
  ];

  const skills = form.skills ? form.skills.split(',').slice(0, 4).map((s, i) => ({
    name: s.trim(), pct: [88, 75, 65, 55][i] || 50,
  })) : [];

  const displayName = form.full_name || user.full_name || 'Job Seeker';

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <SEOHead title="My Dashboard — DevelopmentWala.org" description="Manage your job seeker profile and track applications." />

      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1c23] flex flex-col transition-transform duration-300 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <Briefcase className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-lg">DevelopmentWala.org</span>
          </Link>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border-2 border-white/20">
              {form.profile_picture ? (
                <img src={form.profile_picture} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ background: ACCENT }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{displayName}</p>
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
              {item.badge > 0 && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full font-bold ${tab === item.id ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'}`}>{item.badge}</span>
              )}
            </button>
          ))}
          <Link to={createPageUrl('Jobs')} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Plus className="w-4 h-4" /> Browse Jobs
          </Link>
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Home className="w-4 h-4" /> View Website
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
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
            <h1 className="text-lg font-bold text-gray-900">{tab === 'overview' ? 'Dashboard' : navItems.find(n => n.id === tab)?.label || tab}</h1>
          </div>
          <div className="flex items-center gap-3">
            <div className="relative hidden md:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input type="text" placeholder="Search jobs..." className="pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none w-56" />
            </div>
            <NotificationBell userEmail={user.email} userRole="job_seeker" />
            <div className="w-9 h-9 rounded-full overflow-hidden cursor-pointer border-2 border-gray-200" onClick={() => setTab('profile')}>
              {form.profile_picture ? (
                <img src={form.profile_picture} alt={displayName} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-white text-sm font-bold" style={{ background: ACCENT }}>
                  {displayName.charAt(0).toUpperCase()}
                </div>
              )}
            </div>
          </div>
        </header>

        <PullToRefresh onRefresh={loadData}>
        <main className="flex-1 p-6 md:overflow-y-auto">

          {/* OVERVIEW */}
          {tab === 'overview' && (
            <div className="space-y-6">
              {profileCompletion < 100 && (
                <div className="bg-white rounded-2xl p-5 shadow-sm border border-indigo-100">
                  <div className="flex items-center justify-between mb-2">
                    <p className="font-semibold text-gray-900 text-sm">Profile completion</p>
                    <span className="text-sm font-bold text-indigo-600">{profileCompletion}%</span>
                  </div>
                  <Progress value={profileCompletion} className="h-2" />
                  <p className="text-xs text-gray-500 mt-2">
                    {profileCompletion < 70 ? 'Add your CV and professional details to strengthen applications.' : 'Almost there — complete your profile for best results.'}
                  </p>
                  <button type="button" onClick={() => setTab('profile')} className="mt-3 text-xs font-semibold text-indigo-600 hover:underline">
                    Complete profile →
                  </button>
                </div>
              )}
              {/* Stats */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {statsCards.map((s, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="text-xs text-gray-500 font-medium">{s.label}</p>
                        <p className="text-2xl font-bold text-gray-900 mt-1">{s.value.toLocaleString()}</p>
                        <span className="text-xs font-semibold text-green-600 flex items-center gap-0.5 mt-1">
                          <TrendingUp className="w-3 h-3" /> Active
                        </span>
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

              {/* Chart + Profile */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white rounded-2xl p-5 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900">Application Activity</h3>
                    <span className="text-xs text-gray-400">This Year</span>
                  </div>
                  <ResponsiveContainer width="100%" height={220}>
                    <AreaChart data={chartData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="gradApplied" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor={ACCENT} stopOpacity={0.2} />
                          <stop offset="95%" stopColor={ACCENT} stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="gradShort" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 11, fill: '#9ca3af' }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)', fontSize: 12 }} />
                      <Area type="monotone" dataKey="applied" name="Applied" stroke={ACCENT} strokeWidth={2.5} fill="url(#gradApplied)" />
                      <Area type="monotone" dataKey="shortlisted" name="Shortlisted" stroke="#6366f1" strokeWidth={2.5} fill="url(#gradShort)" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="flex items-center gap-6 mt-2">
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1 rounded-full inline-block" style={{ background: ACCENT }} /> Applied</span>
                    <span className="flex items-center gap-1.5 text-xs text-gray-500"><span className="w-3 h-1 rounded-full inline-block bg-indigo-500" /> Shortlisted</span>
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-5 shadow-sm flex flex-col">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border-2 border-gray-100">
                        {form.profile_picture ? (
                          <img src={form.profile_picture} alt={displayName} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-white text-lg font-bold" style={{ background: ACCENT }}>
                            {displayName.charAt(0).toUpperCase()}
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{displayName}</p>
                        {form.location && <p className="text-xs text-gray-400 flex items-center gap-1"><MapPin className="w-3 h-3" />{form.location}</p>}
                      </div>
                    </div>
                    <button onClick={() => setTab('profile')} className="text-xs font-bold text-white px-3 py-1.5 rounded-lg" style={{ background: ACCENT }}>Edit</button>
                  </div>
                  {skills.length > 0 ? (
                    <div className="space-y-3">
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">Top Skills</p>
                      {skills.map((sk, i) => (
                        <div key={i}>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="font-medium text-gray-700 capitalize">{sk.name}</span>
                            <span className="text-gray-400">{sk.pct}%</span>
                          </div>
                          <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full rounded-full" style={{ width: `${sk.pct}%`, background: [ACCENT,'#6366f1','#10b981','#f59e0b'][i] || ACCENT }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex-1 flex items-center justify-center text-center">
                      <div>
                        <p className="text-sm text-gray-400 mb-2">Add skills to your profile</p>
                        <button onClick={() => setTab('profile')} className="text-xs font-semibold px-4 py-2 rounded-lg text-white" style={{ background: ACCENT }}>Update Profile</button>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white rounded-2xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-gray-900">Recent Activity</h3>
                  <button onClick={() => setTab('applications')} className="text-xs font-semibold text-gray-400 hover:text-gray-600 flex items-center gap-1">View All <ChevronRight className="w-3.5 h-3.5" /></button>
                </div>
                {applications.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    <Briefcase className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No applications yet. <Link to={createPageUrl('Jobs')} className="font-semibold hover:underline" style={{ color: ACCENT }}>Browse Jobs</Link></p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 5).map(app => {
                      const status = statusInfo[app.status] || statusInfo.applied;
                      return (
                        <div key={app.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 cursor-pointer" onClick={() => setViewingApp(app)}>
                          <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${ACCENT}20` }}>
                            <Briefcase className="w-4 h-4" style={{ color: ACCENT }} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{app.opportunity_title || 'Opportunity'}</p>
                            <p className="text-xs text-gray-400">{app.organization || ''} {app.created_date ? '· ' + new Date(app.created_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : ''}</p>
                          </div>
                          <span className={`text-xs font-semibold px-2.5 py-1 rounded-full shrink-0 ${status.color}`}>{status.label}</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* PROFILE */}
          {tab === 'profile' && (
            <div className="max-w-2xl">
              <div className="bg-white rounded-2xl shadow-sm p-7">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-gray-900">Edit Your Profile</h2>
                  <span className="text-sm font-semibold text-indigo-600">{profileCompletion}% complete</span>
                </div>
                <Progress value={profileCompletion} className="h-2 mb-6" />

                {/* Profile Picture */}
                <div className="flex items-center gap-5 p-5 bg-gray-50 rounded-xl border border-gray-100 mb-6">
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
                        <input type="file" accept="image/*" onChange={handleProfilePicUpload} className="hidden" disabled={uploadingPic} />
                      </label>
                      {form.profile_picture && (
                        <button onClick={handleProfilePicDelete} className="text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-lg border border-red-200 flex items-center gap-1.5 transition-colors">
                          <Trash2 className="w-3.5 h-3.5" /> Remove
                        </button>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 mt-1.5">JPG, PNG or GIF • Max 5 MB</p>
                    {picError && <p className="text-xs text-red-600 mt-1">{picError}</p>}
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Full Name</label>
                      <Input value={form.full_name} onChange={(e) => u('full_name', e.target.value)} placeholder="Your full name" className="h-11 rounded-xl" />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-1.5">Phone</label>
                      <Input type="tel" value={form.phone} onChange={(e) => u('phone', e.target.value)} placeholder="+91 XXXXX XXXXX" className="h-11 rounded-xl" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Location</label>
                    <Input value={form.location} onChange={(e) => u('location', e.target.value)} placeholder="City, State" className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Education</label>
                    <Input value={form.education} onChange={(e) => u('education', e.target.value)} placeholder="Highest qualification, institution" className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Skills <span className="font-normal text-gray-400">(comma-separated)</span></label>
                    <Input value={form.skills} onChange={(e) => u('skills', e.target.value)} placeholder="Program management, fundraising, M and E..." className="h-11 rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Work Experience</label>
                    <Textarea value={form.experience} onChange={(e) => u('experience', e.target.value)} placeholder="Describe your work experience..." className="min-h-[100px] rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Profile Summary</label>
                    <Textarea value={form.summary} onChange={(e) => u('summary', e.target.value)} placeholder="Brief summary about yourself..." className="min-h-[80px] rounded-xl" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Social Sector Interests</label>
                    <div className="flex flex-wrap gap-2">
                      {sectorOptions.map(s => (
                        <button key={s} type="button" onClick={() => toggleSector(s)}
                          className={`text-xs px-3 py-1.5 rounded-full font-medium border transition-colors ${form.sector_interests.includes(s) ? 'text-white border-transparent' : 'bg-white text-gray-600 border-gray-200 hover:border-red-300'}`}
                          style={form.sector_interests.includes(s) ? { background: ACCENT, borderColor: ACCENT } : {}}>
                          {s.replace(/_/g, ' ')}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">Resume / CV</label>
                    <div className="border-2 border-dashed border-gray-200 rounded-xl p-5 text-center hover:border-red-300 transition-colors">
                      {form.cv_url ? (
                        <div className="flex items-center justify-center gap-3">
                          <CheckCircle2 className="w-5 h-5 text-green-600" />
                          <span className="text-sm text-gray-700 font-medium">CV uploaded</span>
                          <a href={form.cv_url} target="_blank" rel="noopener noreferrer" className="text-sm hover:underline" style={{ color: ACCENT }}>View</a>
                        </div>
                      ) : (
                        <label className="cursor-pointer">
                          <Upload className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">Upload PDF resume</p>
                          <input type="file" accept=".pdf" onChange={handleCVUpload} className="hidden" />
                        </label>
                      )}
                    </div>
                  </div>
                  <button onClick={saveProfile} disabled={saving}
                    className="text-white font-bold px-8 py-3 rounded-xl text-sm flex items-center gap-2 disabled:opacity-50"
                    style={{ background: ACCENT }}>
                    {saved ? <><CheckCircle2 className="w-4 h-4" /> Saved!</> : saving ? 'Saving...' : <><Save className="w-4 h-4" /> Save Profile</>}
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
                <p className="text-sm text-gray-500 mb-6">This will permanently delete your profile and all data. This action cannot be undone.</p>
                <div className="flex gap-3">
                  <button onClick={() => setDeleteModal(false)} className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors">Cancel</button>
                  <button
                    onClick={async () => {
                      setDeleting(true);
                      if (profile?.id) await base44.entities.UserProfile.delete(profile.id);
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

          {/* APPLICATIONS */}
          {tab === 'applications' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">My Applications</h2>
              {applications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                  <Briefcase className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">You haven't applied to any opportunities yet.</p>
                  <Link to={createPageUrl('Jobs')} className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-block" style={{ background: ACCENT }}>Browse Jobs</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {applications.map(app => {
                    const status = statusInfo[app.status] || statusInfo.applied;
                    const historyCount = Array.isArray(app.status_history) ? app.status_history.length : 0;
                    const lastUpdate = historyCount > 0 ? app.status_history[historyCount - 1] : null;
                    return (
                      <div key={app.id} className="bg-white rounded-xl shadow-sm p-5">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-gray-900">{app.opportunity_title || 'Opportunity'}</h3>
                            {app.organization && <p className="text-sm text-gray-500 mt-0.5">{app.organization}</p>}
                            <p className="text-xs text-gray-400 mt-1 capitalize">{app.opportunity_type} {app.created_date ? '· Applied ' + new Date(app.created_date).toLocaleDateString('en-IN') : ''}</p>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            <span className={`text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 ${status.color}`}>
                              <status.icon className="w-3.5 h-3.5" /> {status.label}
                            </span>
                            <button onClick={() => setViewingApp(app)} className="flex items-center gap-1.5 text-xs font-medium" style={{ color: ACCENT }}>
                              <Eye className="w-3.5 h-3.5" /> View Details
                            </button>
                          </div>
                        </div>
                        {lastUpdate && (
                          <div className="mt-3 pt-3 border-t border-gray-100 bg-blue-50 rounded-lg p-3">
                            <p className="text-xs font-bold text-blue-600 mb-1 flex items-center gap-1.5"><History className="w-3 h-3" /> Latest Update</p>
                            <p className="text-xs text-blue-900 line-clamp-2">{lastUpdate.message}</p>
                            {lastUpdate.next_steps && <p className="text-xs text-blue-700 mt-1 font-medium">Next: {lastUpdate.next_steps}</p>}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {tab === 'interviews' && <CandidateInterviewSection userEmail={user.email} />}

          {/* SAVED OPPORTUNITIES */}
          {tab === 'saved' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Saved Opportunities ({savedItems.length})</h2>
              {savedItems.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center">
                  <Save className="w-10 h-10 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-500 mb-4">No saved opportunities yet.</p>
                  <Link to="/jobs" className="text-white px-6 py-2.5 rounded-xl text-sm font-semibold inline-block" style={{ background: ACCENT }}>Browse Opportunities</Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {savedItems.map(item => (
                    <div key={item.id} className="bg-white rounded-xl shadow-sm p-5 flex items-center justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">{item.opportunity_title || 'Opportunity'}</h3>
                        {item.organization && <p className="text-sm text-gray-500 mt-0.5">{item.organization}</p>}
                        <div className="flex items-center gap-3 mt-1.5 flex-wrap text-xs text-gray-400">
                          {item.opportunity_type && <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-medium capitalize">{item.opportunity_type}</span>}
                          {item.deadline && <span className="flex items-center gap-1"><Clock className="w-3 h-3" />Deadline {new Date(item.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        {(item.detail_url || (item.detail_page && item.opportunity_id)) && (
                          <Link to={item.detail_url || `/${item.detail_page}?id=${item.opportunity_id}`}
                            className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg border border-blue-200">
                            <Eye className="w-3.5 h-3.5" /> View
                          </Link>
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

          {tab === 'notifications' && (
            <div>
              <h2 className="text-lg font-bold text-gray-900 mb-5">Notifications ({notifications.length})</h2>
              {notifications.length === 0 ? (
                <div className="bg-white rounded-2xl shadow-sm p-10 text-center"><Bell className="w-10 h-10 text-gray-200 mx-auto mb-3" /><p className="text-gray-500">No notifications yet.</p></div>
              ) : <NotificationList notifications={notifications} />}
            </div>
          )}

          {tab === 'alerts' && (
            <div className="max-w-2xl">
              <h2 className="text-lg font-bold text-gray-900 mb-5">Email Alerts</h2>
              <EmailSubscriptionCard user={user} profile={profile} />
            </div>
          )}

          {tab === 'contact' && (
            <div className="max-w-xl">
              <div className="bg-white rounded-2xl shadow-sm p-7">
                <h2 className="text-lg font-bold text-gray-900 mb-1">Contact Us</h2>
                <p className="text-gray-500 text-sm mb-6">Have a question or need help?</p>
                {contactSent ? (
                  <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                    <CheckCircle2 className="w-10 h-10 text-green-500 mx-auto mb-3" />
                    <p className="font-semibold text-green-800">Message sent!</p>
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
                      <MessageCircle className="w-4 h-4" /> {contactSending ? 'Sending...' : 'Send Message'}
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
        </PullToRefresh>
      </div>

      {viewingApp && <ApplicationDetailModal app={viewingApp} onClose={() => setViewingApp(null)} />}
    </div>
  );
}