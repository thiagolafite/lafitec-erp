import React, { createContext, useContext, useState, useEffect } from 'react';
import { storage } from '../services/storage';
import { supabaseService } from '../services/supabaseService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const current = storage.getCurrentSession();
    if (current) {
      setSession(current);
      if (supabaseService.isConfigured() && current.empresa?.id) {
        supabaseService.syncAllDataFromSupabase(current.empresa.id).catch(() => {});
      }
    }
    setLoading(false);
  }, []);

  const login = async (email, senha) => {
    let res = null;

    if (supabaseService.isConfigured()) {
      try {
        res = await supabaseService.login(email, senha);
      } catch (err) {
        console.warn('Supabase login error, attempting fallback:', err);
      }
    }

    if (!res) {
      res = storage.login(email, senha);
    }

    if (res) {
      setSession(res);
      storage.saveCurrentSession(res);
      return res;
    } else {
      throw new Error('E-mail ou senha incorretos.');
    }
  };

  const sendVerificationCode = async (email, nome) => {
    return await supabaseService.sendVerificationCode(email, nome);
  };

  const verifyEmailCode = (email, code) => {
    return supabaseService.verifyEmailCode(email, code);
  };

  const registerEmpresaWithCompany = async (userData, companyData) => {
    let res = null;

    if (supabaseService.isConfigured()) {
      res = await supabaseService.registerEmpresaWithCompany(userData, companyData);
    }

    if (!res) {
      // Local storage fallback
      res = storage.registerEmpresa({
        nomeEmpresa: companyData.razaoSocial || companyData.nomeEmpresa,
        cnpj: companyData.cnpj,
        nomeAdmin: userData.nome,
        email: userData.email,
        senha: userData.senha,
        plano: companyData.plano
      });
    }

    if (res) {
      setSession(res);
      storage.saveCurrentSession(res);
      return res;
    } else {
      throw new Error('Não foi possível registrar a empresa.');
    }
  };

  const registerEmpresa = async (data) => {
    return registerEmpresaWithCompany(
      { nome: data.nomeAdmin, email: data.email, senha: data.senha },
      { razaoSocial: data.nomeEmpresa, cnpj: data.cnpj, plano: data.plano }
    );
  };

  const logout = () => {
    storage.logout();
    setSession(null);
  };

  const switchDemoEmpresa = (targetEmpresaId) => {
    const usuarios = storage.getUsuariosEmpresa(targetEmpresaId);
    if (usuarios.length > 0) {
      const u = usuarios[0];
      const res = storage.login(u.email, u.senha);
      if (res) {
        setSession(res);
        storage.saveCurrentSession(res);
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
      sendVerificationCode,
      verifyEmailCode,
      registerEmpresaWithCompany,
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
