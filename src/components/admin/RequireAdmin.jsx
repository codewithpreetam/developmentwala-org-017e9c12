import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useAdminAuth } from './AdminAuth';

const Spinner = () => (
  <div className="min-h-[50vh] flex items-center justify-center">
    <div className="w-8 h-8 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
  </div>
);

export default function RequireAdmin({ children }) {
  const { isAdmin, loading } = useAdminAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !isAdmin) {
      navigate(createPageUrl('AdminLogin'));
    }
  }, [isAdmin, loading, navigate]);

  if (loading || !isAdmin) return <Spinner />;
  return children;
}
