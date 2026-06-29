import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { getSessionUser, setSessionUser, clearSessionUser, toAppUser } from '@/lib/supabase/auth';
import { createPageUrl } from '@/utils';

const supabase = createClient();
const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [isLoadingPublicSettings] = useState(false);
  const [authError, setAuthError] = useState(null);
  const [appPublicSettings] = useState({ id: 'supabase' });

  const refresh = useCallback(async () => {
    const sessionUser = getSessionUser();
    setUser(sessionUser ? toAppUser(sessionUser) : null);
    setIsAuthenticated(!!sessionUser);
  }, []);

  useEffect(() => {
    let mounted = true;
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data, error } = await supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle();
        if (!error && data) {
          const appUser = toAppUser(data, authUser);
          setSessionUser(appUser);
          if (mounted) {
            setUser(appUser);
            setIsAuthenticated(true);
          }
        }
      }
      if (mounted) setIsLoadingAuth(false);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const authUser = session?.user ?? null;
      if (authUser) {
        supabase
          .from('users')
          .select('*')
          .eq('id', authUser.id)
          .maybeSingle()
          .then(({ data, error }) => {
            if (!error && data) {
              const appUser = toAppUser(data, authUser);
              setSessionUser(appUser);
              if (mounted) {
                setUser(appUser);
                setIsAuthenticated(true);
              }
            }
          });
      } else {
        clearSessionUser();
        if (mounted) {
          setUser(null);
          setIsAuthenticated(false);
        }
      }
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const logout = async (shouldRedirect = true) => {
    await supabase.auth.signOut();
    clearSessionUser();
    setUser(null);
    setIsAuthenticated(false);
    if (shouldRedirect) window.location.href = createPageUrl('SignIn');
  };

  const navigateToLogin = () => {
    window.location.href = createPageUrl('SignIn');
  };

  const checkAppState = async () => {
    await refresh();
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
