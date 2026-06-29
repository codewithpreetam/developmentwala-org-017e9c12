import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import { setSessionUser, clearSessionUser, toAppUser } from '@/lib/supabase/auth';
import { base44 } from '@/api/base44Client';

const supabase = createClient();
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = useCallback(async (authUser) => {
    if (!authUser) {
      setUser(null);
      setProfile(null);
      clearSessionUser();
      setLoading(false);
      return;
    }
    try {
      const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', authUser.id)
        .maybeSingle();
      if (error) throw error;
      const appUser = toAppUser(dbUser, authUser);
      setUser(appUser);
      setSessionUser(appUser);
      try {
        const profiles = await base44.entities.UserProfile.filter({ user_email: appUser.email });
        setProfile(profiles[0] || null);
      } catch {
        setProfile(null);
      }
      // Consume post-OAuth redirect target once the session is fully hydrated.
      try {
        if (typeof window !== 'undefined') {
          const dest = sessionStorage.getItem('post_auth_redirect');
          if (dest) {
            sessionStorage.removeItem('post_auth_redirect');
            // Defer so React state commits before navigation.
            setTimeout(() => { window.location.assign(dest); }, 0);
          }
        }
      } catch {}
    } catch (err) {
      console.error('Auth profile load failed', err);
      setUser(null);
      setProfile(null);
      clearSessionUser();
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let mounted = true;
    let lastUserId = null;
    const init = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (!mounted) return;
      lastUserId = authUser?.id || null;
      await loadProfile(authUser);
    };
    init();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      // Only react to true identity changes. TOKEN_REFRESHED / INITIAL_SESSION
      // re-emits would otherwise rebuild the `user` object on a timer and reset
      // dashboard form state while the employer was still typing.
      if (event !== 'SIGNED_IN' && event !== 'SIGNED_OUT' && event !== 'USER_UPDATED') return;
      const nextId = session?.user?.id || null;
      if (event !== 'SIGNED_OUT' && nextId === lastUserId) return;
      lastUserId = nextId;
      loadProfile(session?.user ?? null);
    });
    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  const login = async (email, password) => {
    const me = await base44.auth.login(email, password);
    setUser(me);
    try {
      const profiles = await base44.entities.UserProfile.filter({ user_email: me.email });
      setProfile(profiles[0] || null);
    } catch {
      setProfile(null);
    }
    return me;
  };

  const refreshProfile = async () => {
    const { data: { user: authUser } } = await supabase.auth.getUser();
    await loadProfile(authUser);
  };

  const logout = async () => {
    await base44.auth.logout('/sign-in');
    setUser(null);
    setProfile(null);
    clearSessionUser();
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
