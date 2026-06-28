import React, { createContext, useContext, useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';

const AdminAuthContext = createContext(null);

export function AdminAuthProvider({ children }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const session = sessionStorage.getItem('ngo_admin');
    setIsAdmin(session === 'yes');
    setLoading(false);
  }, []);

  const login = async (email, password) => {
    try {
      const user = await base44.auth.login(email, password);
      if (user.role === 'super_admin') {
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
