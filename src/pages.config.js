/**
 * pages.config.js - Page routing configuration
 * 
 * This file is AUTO-GENERATED. Do not add imports or modify PAGES manually.
 * Pages are auto-registered when you create files in the ./pages/ folder.
 * 
 * THE ONLY EDITABLE VALUE: mainPage
 * This controls which page is the landing page (shown when users visit the app).
 * 
 * Example file structure:
 * 
 *   import HomePage from './pages/HomePage';
 *   import Dashboard from './pages/Dashboard';
 *   import Settings from './pages/Settings';
 *   
 *   export const PAGES = {
 *       "HomePage": HomePage,
 *       "Dashboard": Dashboard,
 *       "Settings": Settings,
 *   }
 *   
 *   export const pagesConfig = {
 *       mainPage: "HomePage",
 *       Pages: PAGES,
 *   };
 * 
 * Example with Layout (wraps all pages):
 *
 *   import Home from './pages/Home';
 *   import Settings from './pages/Settings';
 *   import __Layout from './Layout.jsx';
 *
 *   export const PAGES = {
 *       "Home": Home,
 *       "Settings": Settings,
 *   }
 *
 *   export const pagesConfig = {
 *       mainPage: "Home",
 *       Pages: PAGES,
 *       Layout: __Layout,
 *   };
 *
 * To change the main page from HomePage to Dashboard, use find_replace:
 *   Old: mainPage: "HomePage",
 *   New: mainPage: "Dashboard",
 *
 * The mainPage value must match a key in the PAGES object exactly.
 */
import AdminDashboard from './pages/AdminDashboard';
import AdminLogin from './pages/AdminLogin';
import CandidateDashboard from './pages/CandidateDashboard';
import EmployerDashboard from './pages/EmployerDashboard';
import EventDetail from './pages/EventDetail';
import Events from './pages/Events';
import FellowshipDetail from './pages/FellowshipDetail';
import Fellowships from './pages/Fellowships';
import GrantDetail from './pages/GrantDetail';
import Grants from './pages/Grants';
import Home from './pages/Home';
import InternshipDetail from './pages/InternshipDetail';
import Internships from './pages/Internships';
import JobDetail from './pages/JobDetail';
import Jobs from './pages/Jobs';
import PostOpportunity from './pages/PostOpportunity';
import ScholarshipDetail from './pages/ScholarshipDetail';
import Scholarships from './pages/Scholarships';
import SubmitEvent from './pages/SubmitEvent';
import SubmitFellowship from './pages/SubmitFellowship';
import SubmitGrant from './pages/SubmitGrant';
import SubmitInternship from './pages/SubmitInternship';
import SubmitJob from './pages/SubmitJob';
import SubmitScholarship from './pages/SubmitScholarship';
import EditOpportunity from './pages/EditOpportunity';
import EmployerProfile from './pages/EmployerProfile';
import Employers from './pages/Employers';
import __Layout from './Layout.jsx';


export const PAGES = {
    "AdminDashboard": AdminDashboard,
    "AdminLogin": AdminLogin,
    "CandidateDashboard": CandidateDashboard,
    "EmployerDashboard": EmployerDashboard,
    "EventDetail": EventDetail,
    "Events": Events,
    "FellowshipDetail": FellowshipDetail,
    "Fellowships": Fellowships,
    "GrantDetail": GrantDetail,
    "Grants": Grants,
    "Home": Home,
    "InternshipDetail": InternshipDetail,
    "Internships": Internships,
    "JobDetail": JobDetail,
    "Jobs": Jobs,
    "PostOpportunity": PostOpportunity,
    "ScholarshipDetail": ScholarshipDetail,
    "Scholarships": Scholarships,
    "SubmitEvent": SubmitEvent,
    "SubmitFellowship": SubmitFellowship,
    "SubmitGrant": SubmitGrant,
    "SubmitInternship": SubmitInternship,
    "SubmitJob": SubmitJob,
    "SubmitScholarship": SubmitScholarship,
    "EditOpportunity": EditOpportunity,
    "EmployerProfile": EmployerProfile,
    "Employers": Employers,
}

export const pagesConfig = {
    mainPage: "Home",
    Pages: PAGES,
    Layout: __Layout,
};