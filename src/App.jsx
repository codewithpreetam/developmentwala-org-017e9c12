import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { pagesConfig } from './pages.config'
import { BrowserRouter as Router, Route, Routes, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import PageNotFound from './lib/PageNotFound';
import { useEffect } from 'react';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import RequireAuth from './components/auth/RequireAuth';
import RequireAdmin from './components/admin/RequireAdmin';
import { redirectToSignIn } from '@/lib/auth/redirect';

import MobileBottomNav from './components/MobileBottomNav';

// Sign In page
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import Pricing from './pages/Pricing';
import JobDetail from './pages/JobDetail';

// Post opportunity hub
import PostOpportunity from './pages/PostOpportunity';

// New separate submit pages
import SubmitInternship from './pages/SubmitInternship';
import SubmitFellowship from './pages/SubmitFellowship';
import SubmitScholarship from './pages/SubmitScholarship';
import SubmitGrant from './pages/SubmitGrant';
import SubmitEvent from './pages/SubmitEvent';

// Role selection
import ChooseRole from './pages/ChooseRole';

// Employer & edit pages
import EditOpportunity from './pages/EditOpportunity';
import EmployerProfile from './pages/EmployerProfile';
import Employers from './pages/Employers';

// Blog pages
import Blog from './pages/Blog';
import BlogPostPage from './pages/BlogPost';
import BlogCategoryPage from './pages/BlogCategory';

// New detail pages
import InternshipDetail from './pages/InternshipDetail';
import FellowshipDetail from './pages/FellowshipDetail';
import ScholarshipDetail from './pages/ScholarshipDetail';
import GrantDetail from './pages/GrantDetail';
import EventDetail from './pages/EventDetail';
import Contact from './pages/Contact';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfUse from './pages/TermsOfUse';
import Legal from './pages/Legal';
import Sitemap from './pages/Sitemap';

const PRESERVE_SCROLL = ['/', '/Jobs', '/CandidateDashboard', '/EmployerDashboard'];

function ScrollMemory() {
  const loc = useLocation();
  useEffect(() => {
    const key = `scroll_${loc.pathname}`;
    if (PRESERVE_SCROLL.includes(loc.pathname)) {
      const saved = sessionStorage.getItem(key);
      if (saved) requestAnimationFrame(() => window.scrollTo(0, parseInt(saved, 10)));
    } else {
      window.scrollTo(0, 0);
    }
    return () => {
      if (PRESERVE_SCROLL.includes(loc.pathname)) {
        sessionStorage.setItem(key, String(window.scrollY));
      }
    };
  }, [loc.pathname]);
  return null;
}

const { Pages, Layout, mainPage } = pagesConfig;
const mainPageKey = mainPage ?? Object.keys(Pages)[0];
const MainPage = mainPageKey ? Pages[mainPageKey] : <></>;

const LayoutWrapper = ({ children, currentPageName }) => Layout ?
  <Layout currentPageName={currentPageName}>{children}</Layout>
  : <>{children}</>;

const AUTH_BY_PAGE = {
  CandidateDashboard: ['candidate'],
  EmployerDashboard: ['employer'],
  AdminDashboard: 'admin',
  EditOpportunity: ['employer', 'super_admin'],
  SubmitJob: ['employer', 'super_admin'],
  SubmitInternship: ['employer', 'super_admin'],
  SubmitFellowship: ['employer', 'super_admin'],
  SubmitScholarship: ['employer', 'super_admin'],
  SubmitGrant: ['employer', 'super_admin'],
  SubmitEvent: ['employer', 'super_admin'],
};

function wrapProtected(path, element) {
  const rule = AUTH_BY_PAGE[path];
  if (rule === 'admin') return <RequireAdmin>{element}</RequireAdmin>;
  if (Array.isArray(rule)) return <RequireAuth roles={rule}>{element}</RequireAuth>;
  return element;
}

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError, navigateToLogin } = useAuth();

  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const apply = (e) => { document.documentElement.classList.toggle('dark', e.matches); };
    apply(mq);
    mq.addEventListener('change', apply);
    return () => mq.removeEventListener('change', apply);
  }, []);

  const location = useLocation();

  // Show loading spinner while checking app public settings or auth
  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-slate-800 rounded-full animate-spin"></div>
      </div>
    );
  }

  // Handle authentication errors
  if (authError) {
    if (authError.type === 'user_not_registered') {
      return <UserNotRegisteredError />;
    } else if (authError.type === 'auth_required') {
      // Redirect to our custom sign-in page so users can choose their role first
      const currentPath = window.location.pathname + window.location.search;
      const isAlreadyOnSignIn = window.location.pathname === '/SignIn';
      if (!isAlreadyOnSignIn) {
        redirectToSignIn(currentPath);
      } else {
        navigateToLogin();
      }
      return null;
    }
  }

  return (
    <>
    <ScrollMemory />
    <AnimatePresence mode="wait">
      <motion.div key={location.key} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.18, ease: 'easeOut' }}>
    <Routes location={location}>
      <Route path="/" element={
        <LayoutWrapper currentPageName={mainPageKey}>
          <MainPage />
        </LayoutWrapper>
      } />
      {Object.entries(Pages).map(([path, Page]) => (
        <Route
          key={path}
          path={`/${path}`}
          element={
            <LayoutWrapper currentPageName={path}>
              {wrapProtected(path, <Page />)}
            </LayoutWrapper>
          }
        />
      ))}
      {/* Sign In / Sign Up */}
      <Route path="/SignIn" element={<LayoutWrapper currentPageName="SignIn"><SignIn /></LayoutWrapper>} />
      <Route path="/SignUp" element={<LayoutWrapper currentPageName="SignUp"><SignUp /></LayoutWrapper>} />
      <Route path="/VerifyEmail" element={<LayoutWrapper currentPageName="VerifyEmail"><VerifyEmail /></LayoutWrapper>} />
      <Route path="/ForgotPassword" element={<LayoutWrapper currentPageName="ForgotPassword"><ForgotPassword /></LayoutWrapper>} />
      <Route path="/ResetPassword" element={<LayoutWrapper currentPageName="ResetPassword"><ResetPassword /></LayoutWrapper>} />
      <Route path="/Pricing" element={<LayoutWrapper currentPageName="Pricing"><Pricing /></LayoutWrapper>} />

      {/* SEO-friendly opportunity detail URLs */}
      <Route path="/jobs/:slug" element={<LayoutWrapper currentPageName="JobDetail"><JobDetail /></LayoutWrapper>} />
      <Route path="/internships/:slug" element={<LayoutWrapper currentPageName="InternshipDetail"><InternshipDetail /></LayoutWrapper>} />
      <Route path="/fellowships/:slug" element={<LayoutWrapper currentPageName="FellowshipDetail"><FellowshipDetail /></LayoutWrapper>} />
      <Route path="/scholarships/:slug" element={<LayoutWrapper currentPageName="ScholarshipDetail"><ScholarshipDetail /></LayoutWrapper>} />
      <Route path="/grants/:slug" element={<LayoutWrapper currentPageName="GrantDetail"><GrantDetail /></LayoutWrapper>} />
      <Route path="/events/:slug" element={<LayoutWrapper currentPageName="EventDetail"><EventDetail /></LayoutWrapper>} />

      {/* Post hub */}
      <Route path="/PostOpportunity" element={<LayoutWrapper currentPageName="PostOpportunity"><PostOpportunity /></LayoutWrapper>} />

      {/* Submit forms */}
      <Route path="/SubmitInternship" element={<LayoutWrapper currentPageName="SubmitInternship"><RequireAuth roles={['employer', 'super_admin']}><SubmitInternship /></RequireAuth></LayoutWrapper>} />
      <Route path="/SubmitFellowship" element={<LayoutWrapper currentPageName="SubmitFellowship"><RequireAuth roles={['employer', 'super_admin']}><SubmitFellowship /></RequireAuth></LayoutWrapper>} />
      <Route path="/SubmitScholarship" element={<LayoutWrapper currentPageName="SubmitScholarship"><RequireAuth roles={['employer', 'super_admin']}><SubmitScholarship /></RequireAuth></LayoutWrapper>} />
      <Route path="/SubmitGrant" element={<LayoutWrapper currentPageName="SubmitGrant"><RequireAuth roles={['employer', 'super_admin']}><SubmitGrant /></RequireAuth></LayoutWrapper>} />
      <Route path="/SubmitEvent" element={<LayoutWrapper currentPageName="SubmitEvent"><RequireAuth roles={['employer', 'super_admin']}><SubmitEvent /></RequireAuth></LayoutWrapper>} />

      {/* Role selection */}
      <Route path="/ChooseRole" element={<LayoutWrapper currentPageName="ChooseRole"><ChooseRole /></LayoutWrapper>} />

      {/* Employer & edit pages */}
      <Route path="/EditOpportunity" element={<LayoutWrapper currentPageName="EditOpportunity"><RequireAuth roles={['employer', 'super_admin']}><EditOpportunity /></RequireAuth></LayoutWrapper>} />
      <Route path="/EmployerProfile" element={<LayoutWrapper currentPageName="EmployerProfile"><EmployerProfile /></LayoutWrapper>} />
      <Route path="/Employers" element={<LayoutWrapper currentPageName="Employers"><Employers /></LayoutWrapper>} />

      {/* Detail pages */}
      <Route path="/InternshipDetail" element={<LayoutWrapper currentPageName="InternshipDetail"><InternshipDetail /></LayoutWrapper>} />
      <Route path="/FellowshipDetail" element={<LayoutWrapper currentPageName="FellowshipDetail"><FellowshipDetail /></LayoutWrapper>} />
      <Route path="/ScholarshipDetail" element={<LayoutWrapper currentPageName="ScholarshipDetail"><ScholarshipDetail /></LayoutWrapper>} />
      <Route path="/GrantDetail" element={<LayoutWrapper currentPageName="GrantDetail"><GrantDetail /></LayoutWrapper>} />
      <Route path="/EventDetail" element={<LayoutWrapper currentPageName="EventDetail"><EventDetail /></LayoutWrapper>} />

      {/* Contact */}
      <Route path="/Contact" element={<LayoutWrapper currentPageName="Contact"><Contact /></LayoutWrapper>} />

      {/* Legal pages */}
      <Route path="/PrivacyPolicy" element={<LayoutWrapper currentPageName="PrivacyPolicy"><PrivacyPolicy /></LayoutWrapper>} />
      <Route path="/TermsOfUse" element={<LayoutWrapper currentPageName="TermsOfUse"><TermsOfUse /></LayoutWrapper>} />
      <Route path="/Legal" element={<LayoutWrapper currentPageName="Legal"><Legal /></LayoutWrapper>} />
      <Route path="/Sitemap" element={<LayoutWrapper currentPageName="Sitemap"><Sitemap /></LayoutWrapper>} />

      {/* Blog */}
      <Route path="/blog" element={<LayoutWrapper currentPageName="Blog"><Blog /></LayoutWrapper>} />
      <Route path="/blog/category/:slug" element={<LayoutWrapper currentPageName="BlogCategory"><BlogCategoryPage /></LayoutWrapper>} />
      <Route path="/blog/:slug" element={<LayoutWrapper currentPageName="BlogPost"><BlogPostPage /></LayoutWrapper>} />

      <Route path="*" element={<PageNotFound />} />
    </Routes>
      </motion.div>
    </AnimatePresence>
    <MobileBottomNav />
    </>
  );
};


function App() {

  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  )
}

export default App