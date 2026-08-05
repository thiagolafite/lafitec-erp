import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = storage.getCurrentSession();
    if (current) {
      setSession(current);
    }
    setLoading(false);
  }, []);

  const login = (email, senha) => {
    const res = storage.login(email, senha);
    if (res) {
      setSession(res);
      return res;
    } else {
      throw new Error('E-mail ou senha incorretos.');
    }
  };

  const registerEmpresa = (data) => {
    const res = storage.registerEmpresa(data);
    setSession(res);
    return res;
  };

  const logout = () => {
    storage.logout();
    setSession(null);
  };

  // Helper for quick demo switching between tenants
  const switchDemoEmpresa = (targetEmpresaId) => {
    const usuarios = storage.getUsuariosEmpresa(targetEmpresaId);
    if (usuarios.length > 0) {
      const u = usuarios[0];
      const res = storage.login(u.email, u.senha);
      if (res) {
        setSession(res);
      }
    }
  };

  const refreshSession = () => {
    const current = storage.getCurrentSession();
    if (current) {
      setSession({ ...current });
    }
  };

  return (
    <AuthContext.Provider value={{
      user: session?.user || null,
      empresa: session?.empresa || null,
      isAuthenticated: !!session,
      loading,
      login,
      registerEmpresa,
      logout,
      switchDemoEmpresa,
      refreshSession
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};
