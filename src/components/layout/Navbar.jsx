import React, { useState, useRef } from 'react';
import { Link, useLocation } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { Menu, X, ChevronDown, User, LogOut, LayoutDashboard, GraduationCap, Star, BookOpen, IndianRupee, Calendar, Briefcase } from 'lucide-react';
import { useAuth } from '../auth/AuthContext';
import { base44 } from '@/api/base44Client';
import { useSiteSettings } from '../../hooks/useSiteSettings';
import { getLogoUrl, getSiteName } from '@/lib/brand';
import UserAvatar from '@/components/shared/UserAvatar';

const opportunityLinks = [
  { label: 'Jobs', page: 'Jobs', icon: Briefcase, desc: 'Full-time & contract roles' },
  { label: 'Internships', page: 'Internships', icon: GraduationCap, desc: 'Short-term learning roles' },
  { label: 'Scholarships', page: 'Scholarships', icon: BookOpen, desc: 'Education funding' },
  { label: 'Fellowships', page: 'Fellowships', icon: Star, desc: 'Leadership programmes' },
  { label: 'Events', page: 'Events', icon: Calendar, desc: 'Conferences & webinars' },
  { label: 'Grants', page: 'Grants', icon: IndianRupee, desc: 'Funding for NGOs' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [opportunitiesOpen, setOpportunitiesOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, profile, logout } = useAuth();
  const closeTimer = useRef(null);
  const siteSettings = useSiteSettings();
  const logoUrl = getLogoUrl(siteSettings);
  const siteName = getSiteName(siteSettings);

  const getDashboardLink = () => {
    if (!user) return null;
    if (user.role === 'admin') return createPageUrl('AdminDashboard');
    if (profile?.user_type === 'employer') return createPageUrl('EmployerDashboard');
    return createPageUrl('CandidateDashboard');
  };

  const handleMouseEnter = () => {
    clearTimeout(closeTimer.current);
    setOpportunitiesOpen(true);
  };

  const handleMouseLeave = () => {
    closeTimer.current = setTimeout(() => setOpportunitiesOpen(false), 150);
  };

  return (
    <header className="sticky top-0 z-50 flex justify-center pt-3 pb-2 px-3 sm:px-4 pointer-events-none">
      <div className="pointer-events-auto w-full max-w-5xl bg-white/70 backdrop-blur-2xl border border-white/60 shadow-xl shadow-black/10 rounded-2xl px-4">
        <div className="flex items-center justify-between h-14">
          {/* Logo */}
          <Link to="/" className="flex items-center shrink-0">
            <img src={logoUrl} alt={siteName} className="h-9 object-contain" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-0.5">
            <Link to={createPageUrl('Home')}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-colors">
              Home
            </Link>

            {/* Opportunities mega dropdown */}
            <div className="relative" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
              <button className={`flex items-center gap-1 px-3.5 py-2 rounded-xl text-sm font-medium transition-colors ${opportunitiesOpen ? 'text-gray-900 bg-black/5' : 'text-gray-500 hover:text-gray-900 hover:bg-black/5'}`}>
                Opportunities
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${opportunitiesOpen ? 'rotate-180' : ''}`} />
              </button>

              <div className={`absolute top-full left-1/2 -translate-x-1/2 mt-3 w-[min(400px,90vw)] bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl shadow-black/10 py-3 px-3 z-50 transition-all duration-200 origin-top ${opportunitiesOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                <div className="grid grid-cols-2 gap-1">
                  {opportunityLinks.map(l => {
                    const LIcon = l.icon;
                    return (
                      <Link key={l.page} to={createPageUrl(l.page)}
                        onClick={() => setOpportunitiesOpen(false)}
                        className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-black/5 transition-colors group">
                        <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-gray-200 flex items-center justify-center shrink-0 transition-colors">
                          <LIcon className="w-4 h-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{l.label}</div>
                          <div className="text-xs text-gray-400">{l.desc}</div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
                <div className="border-t border-gray-100 mt-2 pt-2 px-1">
                  <Link to={createPageUrl('PostOpportunity')} onClick={() => setOpportunitiesOpen(false)}
                    className="flex items-center justify-center gap-2 w-full bg-gray-900 hover:bg-black text-white text-sm font-semibold py-2.5 rounded-xl transition-colors">
                    + Post an Opportunity
                  </Link>
                </div>
              </div>
            </div>

            <Link to={createPageUrl('Employers')}
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-colors">
              Organizations
            </Link>
            <Link to="/blog"
              className="px-3.5 py-2 rounded-xl text-sm font-medium text-gray-500 hover:text-gray-900 hover:bg-black/5 transition-colors">
              Blog
            </Link>
          </nav>

          {/* Right side */}
          <div className="hidden lg:flex items-center gap-2">
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  onBlur={() => setTimeout(() => setUserMenuOpen(false), 150)}
                  className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-black/10 text-sm font-medium text-gray-700 hover:bg-black/5 transition-colors"
                >
                  <UserAvatar user={user} size="xs" background="#111827" />
                  <span className="max-w-24 truncate">{user.full_name || user.email.split('@')[0]}</span>
                  <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>
                <div className={`absolute right-0 top-full mt-2 w-48 bg-white/80 backdrop-blur-2xl border border-white/60 rounded-2xl shadow-2xl shadow-black/10 py-1.5 z-50 transition-all duration-150 origin-top-right ${userMenuOpen ? 'opacity-100 scale-100 pointer-events-auto' : 'opacity-0 scale-95 pointer-events-none'}`}>
                  {getDashboardLink() && (
                    <Link to={getDashboardLink()} onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-black/5 transition-colors rounded-xl mx-1">
                      <LayoutDashboard className="w-4 h-4 text-gray-400" /> Dashboard
                    </Link>
                  )}
                  <button onClick={logout} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors rounded-xl mx-1">
                    <LogOut className="w-4 h-4" /> Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <>
                <Link to={createPageUrl('SignIn')}
                  className="px-4 py-2 rounded-xl text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-black/5 border border-black/10 transition-colors">
                  Sign In
                </Link>
                <Link to={createPageUrl('PostOpportunity')}
                  className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
                  Post Opportunity
                </Link>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button onClick={() => setOpen(!open)} className="lg:hidden p-2 rounded-xl text-gray-500 hover:bg-black/5 transition-colors">
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`lg:hidden overflow-hidden transition-all duration-300 ${open ? 'max-h-[80vh] overflow-y-auto py-3 pb-5' : 'max-h-0'}`}>
          <div className="border-t border-black/5 pt-3 space-y-0.5">
            <Link to={createPageUrl('Home')} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-black/5 rounded-xl">Home</Link>
            <div className="px-4 py-2">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Opportunities</p>
              <div className="grid grid-cols-2 gap-1">
                {opportunityLinks.map(l => {
                  const LIcon = l.icon;
                  return (
                    <Link key={l.page} to={createPageUrl(l.page)} onClick={() => setOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-black/5 rounded-xl">
                      <LIcon className="w-4 h-4 text-gray-400" /> {l.label}
                    </Link>
                  );
                })}
              </div>
            </div>
            <Link to={createPageUrl('Employers')} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-black/5 rounded-xl">Organizations</Link>
            <Link to="/blog" onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-600 hover:bg-black/5 rounded-xl">Blog</Link>
            {user ? (
              <>
                <div className="flex items-center gap-3 px-4 py-3 mt-1 border-t border-black/5">
                  <UserAvatar user={user} size="md" background="#111827" />
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-900 truncate">{user.full_name || user.email?.split('@')[0]}</p>
                    <p className="text-xs text-gray-500 truncate">{user.email}</p>
                  </div>
                </div>
                {getDashboardLink() && <Link to={getDashboardLink()} onClick={() => setOpen(false)} className="block px-4 py-2.5 text-sm font-medium text-gray-700 hover:bg-black/5 rounded-xl">Dashboard</Link>}
                <button onClick={logout} className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-500 hover:bg-red-50 rounded-xl">Sign Out</button>
              </>
            ) : (
              <div className="px-4 pt-2 flex flex-col gap-2">
                <Link to={createPageUrl('SignIn')} onClick={() => setOpen(false)} className="block w-full text-center border border-black/10 text-gray-700 py-3 rounded-xl text-sm font-medium">Sign In</Link>
                <Link to={createPageUrl('PostOpportunity')} onClick={() => setOpen(false)} className="block text-center bg-gray-900 text-white py-3 rounded-xl text-sm font-semibold">Post Opportunity</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}