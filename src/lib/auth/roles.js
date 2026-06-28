import { Users, Building2, Briefcase, GraduationCap, Star, Shield } from 'lucide-react';

export function dashboardForRole(role) {
  if (role === 'employer') return 'EmployerDashboard';
  if (role === 'super_admin') return 'AdminDashboard';
  return 'CandidateDashboard';
}

export const roleConfig = {
  job_seeker: {
    id: 'job_seeker',
    label: 'Job Seeker',
    icon: Users,
    dbRole: 'candidate',
    signUpRole: 'candidate',
    headline: 'Find your next role in social impact',
    subline: 'Browse jobs, fellowships, internships, scholarships, grants and events across India\'s NGO sector.',
    perks: [
      { icon: Briefcase, text: 'Apply to curated NGO opportunities' },
      { icon: Star, text: 'Track applications and interview updates' },
      { icon: GraduationCap, text: 'Save listings and get weekly alerts' },
    ],
  },
  employer: {
    id: 'employer',
    label: 'Employer / NGO',
    icon: Building2,
    dbRole: 'employer',
    signUpRole: 'employer',
    headline: 'Hire passionate talent for your mission',
    subline: 'Post opportunities, manage applicants, and build your organisation profile on India\'s social sector platform.',
    perks: [
      { icon: Briefcase, text: 'Publish jobs, grants, fellowships and events' },
      { icon: Users, text: 'Review applicants with built-in ATS workflows' },
      { icon: Shield, text: 'Reach candidates who care about social impact' },
    ],
  },
};

export const BRAND_GRADIENT = 'linear-gradient(135deg, #1e1b4b 0%, #3730a3 40%, #4f46e5 70%, #6366f1 100%)';
