import React, { createContext, useState, useContext, useEffect } from 'react';
import { getSessionUser, toAppUser } from '@/lib/supabase/auth';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'supabase' });

  useEffect(() => {
    const sessionUser = getSessionUser();
    if (sessionUser) {
      setUser(toAppUser(sessionUser));
      setIsAuthenticated(true);
    }
    setIsLoadingAuth(false);
  }, []);

  const logout = (shouldRedirect = true) => {
    localStorage.removeItem('ngo_user');
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = '/SignIn';
  };

  const navigateToLogin = () => {
    window.location.href = '/SignIn';
  };

  const checkAppState = async () => {
    const sessionUser = getSessionUser();
    setUser(sessionUser ? toAppUser(sessionUser) : null);
    setIsAuthenticated(!!sessionUser);
    setAuthError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated,
      isLoadingAuth,
      isLoadingPublicSettings,
      authError,
      appPublicSettings,
      logout,
      navigateToLogin,
      checkAppState,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
