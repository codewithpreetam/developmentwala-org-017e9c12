import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAuth } from './AuthContext';
import { redirectToSignIn } from '@/lib/auth/redirect';
import { AlertTriangle } from 'lucide-react';

const Spinner = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

function RoleMismatch({ requiredRoles }) {
  const label = requiredRoles.includes('employer') ? 'an employer' : 'a job seeker';
  return (
    <div className="min-h-[50vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full bg-white rounded-2xl border border-gray-100 p-8 text-center shadow-lg">
        <AlertTriangle className="w-10 h-10 text-amber-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-gray-900 mb-2">Wrong account type</h2>
        <p className="text-sm text-gray-500 mb-6">
          This page requires {label} account. Please sign in with the correct account.
        </p>
        <Link
          to={createPageUrl('SignIn')}
          className="inline-flex h-11 items-center px-6 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm"
        >
          Switch account
        </Link>
      </div>
    </div>
  );
}

export default function RequireAuth({ children, roles }) {
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      redirectToSignIn(window.location.pathname + window.location.search);
    }
  }, [user, loading]);

  if (loading) return <Spinner />;
  if (!user) return <Spinner />;

  if (roles?.length && !roles.includes(user.role)) {
    return <RoleMismatch requiredRoles={roles} />;
  }

  return children;
}
