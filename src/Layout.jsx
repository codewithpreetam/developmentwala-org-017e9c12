import React from 'react';
import { AdminAuthProvider } from './components/admin/AdminAuth';
import { AuthProvider } from './components/auth/AuthContext';
import SignupPopup from './components/shared/SignupPopup';

// Pages where we should NOT show the signup popup
const NO_POPUP_PAGES = [
  'SignIn', 'SignUp', 'VerifyEmail', 'ForgotPassword', 'ResetPassword',
  'ChooseRole', 'AdminLogin', 'AdminDashboard', 'CandidateDashboard', 'EmployerDashboard',
];

export default function Layout({ children, currentPageName }) {
  const showPopup = !NO_POPUP_PAGES.includes(currentPageName);
  return (
    <AdminAuthProvider>
      <AuthProvider>
        <div className="min-h-screen flex flex-col bg-white">
          {children}
          {showPopup && <SignupPopup />}
        </div>
      </AuthProvider>
    </AdminAuthProvider>
  );
}