import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const user = await base44.auth.me();
        const role = user?.role;
        const ok = role === 'admin' || role === 'super_admin';
        if (!cancelled) {
          setIsAdmin(ok);
          if (ok) sessionStorage.setItem('ngo_admin', 'yes');
          else sessionStorage.removeItem('ngo_admin');
        }
      } catch {
        if (!cancelled) {
          setIsAdmin(false);
          sessionStorage.removeItem('ngo_admin');
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const login = async (email, password) => {
    try {
      const user = await base44.auth.login(email, password);
      if (user.role === 'super_admin' || user.role === 'admin') {
        sessionStorage.setItem('ngo_admin', 'yes');
        setIsAdmin(true);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  };

  const logout = () => {
    sessionStorage.removeItem('ngo_admin');
    localStorage.removeItem('ngo_user');
    setIsAdmin(false);
  };

  return (
    <AdminAuthContext.Provider value={{ isAdmin, login, logout, loading }}>
      {children}
    </AdminAuthContext.Provider>
  );
}

export function useAdminAuth() {
  return useContext(AdminAuthContext);
}
