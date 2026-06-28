import React, { useEffect } from 'react';
import { useNavigate } from '@/lib/router-adapter';
import { createPageUrl } from '@/utils';
import { useAuth } from '../components/auth/AuthContext';
import { dashboardForRole } from '@/lib/auth/roles';
import { signUpUrl } from '@/lib/auth/redirect';

export default function ChooseRole() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (loading) return;
    if (!user) {
      window.location.href = signUpUrl('');
      return;
    }
    navigate(createPageUrl(dashboardForRole(user.role)));
  }, [user, loading, navigate]);

  return null;
}
