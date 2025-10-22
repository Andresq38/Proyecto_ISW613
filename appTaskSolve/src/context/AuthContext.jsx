import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const getApiBase = () => {
  const candidate = import.meta?.env?.VITE_API_BASE;
  if (candidate) return candidate.replace(/\/$/, '');
  const { protocol, hostname } = window.location;
  return `${protocol}//${hostname}/apiticket`;
};

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => {
    const storedToken = localStorage.getItem('authToken');
    console.log('🔐 Token inicial desde localStorage:', storedToken ? 'EXISTE' : 'NO EXISTE');
    return storedToken;
  });
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('authUser');
    return raw ? JSON.parse(raw) : null;
  });

  // Sync axios header - ejecutar INMEDIATAMENTE cuando el componente se monta
  useEffect(() => {
    console.log('🔧 Configurando axios headers. Token:', token ? 'PRESENTE' : 'AUSENTE');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      console.log('✅ Header configurado:', axios.defaults.headers.common['Authorization']);
    } else {
      delete axios.defaults.headers.common['Authorization'];
      console.log('❌ Header eliminado');
    }
  }, [token]);

  const login = async (email, password) => {
    const apiBase = getApiBase();
    const { data } = await axios.post(`${apiBase}/auth/login`, { email, password });
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    return data.user;
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
