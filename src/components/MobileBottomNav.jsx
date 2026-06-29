import React, { useEffect } from 'react';
import { useNavigate, useLocation } from '@/lib/router-adapter';
import { Home, Briefcase, LayoutDashboard } from 'lucide-react';
import { useAuth } from './auth/AuthContext';
import { createPageUrl } from '@/utils';

const DASHBOARD_PATHS = ['/candidate-dashboard', '/employer-dashboard', '/admin-dashboard'];

const getTabKey = (pathname) => {
  if (pathname === '/') return 'home';
  if (DASHBOARD_PATHS.some(p => pathname.startsWith(p))) return 'dashboard';
  return 'jobs';
};

export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const auth = useAuth();
  const user = auth?.user;
  const profile = auth?.profile;

  // Save current path to this tab's stack entry
  useEffect(() => {
    const key = getTabKey(pathname);
    sessionStorage.setItem(`tab_stack_${key}`, pathname + window.location.search);
  }, [pathname]);

  const getDashboardDefault = () => {
    if (!user) return createPageUrl('SignIn');
    if (user.role === 'admin') return createPageUrl('AdminDashboard');
    if (profile?.user_type === 'employer') return createPageUrl('EmployerDashboard');
    return createPageUrl('CandidateDashboard');
  };

  const goToTab = (tabKey, defaultPath) => {
    const currentTab = getTabKey(pathname);
    if (currentTab === tabKey) {
      // Already on this tab — tap again to go to tab root
      navigate(defaultPath);
    } else {
      // Restore last visited path within this tab
      const saved = sessionStorage.getItem(`tab_stack_${tabKey}`);
      navigate(saved || defaultPath);
    }
  };

  const activeTab = getTabKey(pathname);

  const tabs = [
    { key: 'home', icon: Home, label: 'Home', defaultPath: '/' },
    { key: 'jobs', icon: Briefcase, label: 'Jobs', defaultPath: '/jobs' },
    { key: 'dashboard', icon: LayoutDashboard, label: user ? 'Dashboard' : 'Sign In', defaultPath: getDashboardDefault() },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-white border-t border-gray-200 pb-safe">
      <div className="flex items-center justify-around h-14">
        {tabs.map(({ key, icon: Icon, label, defaultPath }) => {
          const active = activeTab === key;
          return (
            <button
              key={key}
              onClick={() => goToTab(key, defaultPath)}
              className={`flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-gray-400'
              }`}
            >
              <Icon className={`w-5 h-5 ${active ? 'stroke-2' : 'stroke-[1.5]'}`} />
              <span className={`text-[10px] font-medium ${active ? 'text-primary' : 'text-gray-400'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}