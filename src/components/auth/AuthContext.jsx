import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { base44 } from '@/api/base44Client';
import { getSessionUser, toAppUser } from '@/lib/supabase/auth';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (email) => {
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: email });
      setProfile(profiles[0] || null);
    } catch {
      setProfile(null);
    }
  }, []);

  const initAuth = useCallback(async () => {
    try {
      const sessionUser = getSessionUser();
      if (sessionUser) {
        const me = toAppUser(sessionUser);
        setUser(me);
        await loadProfile(me.email);
      } else {
        setUser(null);
        setProfile(null);
      }
    } catch {
      setUser(null);
      setProfile(null);
    }
    setLoading(false);
  }, [loadProfile]);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const login = async (email, password) => {
    const me = await base44.auth.login(email, password);
    setUser(me);
    await loadProfile(me.email);
    return me;
  };

  const refreshProfile = async () => {
    if (user) await loadProfile(user.email);
  };

  const logout = () => {
    base44.auth.logout('/SignIn');
    setUser(null);
    setProfile(null);
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, login, refreshProfile, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
