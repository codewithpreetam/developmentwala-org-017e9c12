import React, { useState } from 'react';
import { Link, useNavigate } from '@/lib/router-adapter';
import { useAuth } from '../auth/AuthContext';
import {
  LayoutDashboard, Building2, User, Plus, Briefcase, Users, CalendarDays,
  BarChart2, Archive, Bookmark, MessageSquare, Home, LogOut, Save, Bell,
  Mail, MessageCircle, BookmarkCheck, Settings, Inbox, Star, List, FileText,
} from 'lucide-react';
import UserAvatar from '@/components/shared/UserAvatar';

const ACCENT = '#4F46E5';

function getRoleConfig(user) {
  const role = (user?.role || '').toLowerCase();
  if (role === 'super_admin' || role === 'admin') {
    return {
      base: '/admin-dashboard',
      title: 'Admin',
      icon: LayoutDashboard,
      items: [
        { id: 'overview', label: 'Overview', icon: LayoutDashboard },
        { id: 'settings', label: 'Site Settings', icon: Settings },
        { id: 'pending', label: 'Pending', icon: Inbox },
        { id: 'featured', label: 'Featured', icon: Star },
        { id: 'post', label: 'Post New', icon: Plus },
        { id: 'my-posts', label: 'My Posts', icon: User },
        { id: 'all', label: 'All Opportunities', icon: List },
        { id: 'archive', label: 'Archive', icon: Archive },
        { id: 'users', label: 'Users', icon: Users },
        { id: 'blog', label: 'Blog', icon: FileText },
        { id: 'contacts', label: 'Messages', icon: MessageSquare },
      ],
    };
  }
  if (role === 'employer') {
    return {
      base: '/employer-dashboard',
      title: 'Employer',
      icon: Building2,
      items: [
        { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
        { id: 'profile', label: 'Organization', icon: Building2 },
        { id: 'employer_profile', label: 'Employer Profile', icon: User },
        { id: 'post', label: 'Post Opportunity', icon: Plus },
        { id: 'manage', label: 'My Posts', icon: Briefcase },
        { id: 'applicants', label: 'Applicants', icon: Users },
        { id: 'interviews', label: 'Interviews', icon: CalendarDays },
        { id: 'analytics', label: 'Analytics', icon: BarChart2 },
        { id: 'archive', label: 'Archive', icon: Archive },
        { id: 'saved', label: 'Saved', icon: Bookmark },
        { id: 'contact', label: 'Contact Us', icon: MessageSquare },
      ],
    };
  }
  return {
    base: '/candidate-dashboard',
    title: 'Job Seeker',
    icon: Briefcase,
    items: [
      { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
      { id: 'profile', label: 'My Profile', icon: User },
      { id: 'applications', label: 'Applications', icon: Briefcase },
      { id: 'interviews', label: 'My Interviews', icon: BookmarkCheck },
      { id: 'saved', label: 'Saved', icon: Save },
      { id: 'notifications', label: 'Notifications', icon: Bell },
      { id: 'alerts', label: 'Email Alerts', icon: Mail },
      { id: 'contact', label: 'Contact Us', icon: MessageCircle },
    ],
  };
}

export default function DashboardShell({ children, title }) {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  if (loading || !user) {
    return <>{children}</>;
  }

  const cfg = getRoleConfig(user);
  const HeaderIcon = cfg.icon;

  const handleLogout = async () => {
    try { await logout(); } catch {}
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[#f4f6fb]">
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-[#1a1c23] flex flex-col transition-transform duration-300 ${open ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:flex`}>
        <div className="px-6 py-5 border-b border-white/10">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: ACCENT }}>
              <HeaderIcon className="w-4 h-4 text-white" />
            </div>
            <span className="text-white font-bold text-sm leading-tight">DevelopmentWala.org</span>
          </Link>
        </div>
        <div className="px-5 py-4 border-b border-white/10">
          <div className="flex items-center gap-3">
            <UserAvatar user={user} size="md" background={ACCENT} />
            <div className="min-w-0">
              <p className="text-white text-sm font-semibold truncate">{user.full_name || cfg.title}</p>
              <p className="text-gray-400 text-xs truncate">{user.email}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {cfg.items.map(item => (
            <Link
              key={item.id}
              to={`${cfg.base}?tab=${item.id}`}
              onClick={() => setOpen(false)}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
            >
              <item.icon className="w-4 h-4 shrink-0" />
              <span className="flex-1">{item.label}</span>
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t border-white/10 space-y-1">
          <Link to="/" className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all">
            <Home className="w-4 h-4" /> View Website
          </Link>
          <button onClick={handleLogout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all">
            <LogOut className="w-4 h-4" /> Sign Out
          </button>
        </div>
      </aside>

      {open && <div className="fixed inset-0 bg-black/50 z-30 lg:hidden" onClick={() => setOpen(false)} />}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="bg-white border-b border-gray-200 px-4 lg:px-6 py-3 flex items-center gap-3 sticky top-0 z-20 lg:hidden">
          <button onClick={() => setOpen(true)} className="p-2 hover:bg-gray-100 rounded-lg" aria-label="Open menu">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
          </button>
          <h1 className="text-base font-bold text-gray-900">{title || 'Dashboard'}</h1>
        </header>
        <div className="flex-1 min-w-0">{children}</div>
      </div>
    </div>
  );
}
