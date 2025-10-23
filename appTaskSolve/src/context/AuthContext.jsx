import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getApiOrigin, getApiBaseWithPrefix } from '../utils/apiBase';

const AuthContext = createContext(null);

const API_BASE = getApiBaseWithPrefix('/apiticket');
// Asegurar baseURL de axios lo antes posible para evitar condiciones de carrera
axios.defaults.baseURL = API_BASE;
// NO usar withCredentials porque usamos JWT tokens en headers, no cookies
// axios.defaults.withCredentials = true;

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

  // Interceptores: ya no añadimos Authorization (usamos cookies), solo reaccionamos a 401
  useEffect(() => {
    console.log('🌐 axios.baseURL =', axios.defaults.baseURL);

    const reqId = axios.interceptors.request.use((config) => {
      // Leer de estado o, si faltara por timing, desde localStorage
      const currentToken = token || localStorage.getItem('authToken');
      if (currentToken) {
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${currentToken}`;
      }
      return config;
    });

    const resId = axios.interceptors.response.use(
      (res) => res,
      (err) => {
        if (err?.response?.status === 401) {
          console.warn('🔒 401 no autorizado. Cerrando sesión.');
          // Limpiar estado/almacenamiento y redirigir a login
          try { localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); } catch {}
          setToken(null); setUser(null);
          // Redirigir sin depender de hooks de router
          if (typeof window !== 'undefined') {
            const path = '/login';
            if (!window.location.pathname.includes(path)) window.location.assign(path);
          }
        }
        return Promise.reject(err);
      }
    );

    return () => {
      axios.interceptors.request.eject(reqId);
      axios.interceptors.response.eject(resId);
    };
  }, [token]);

  // Hacer login: backend devuelve token JWT y user
  const login = async (email, password) => {
    console.log('🔑 AuthContext.login() llamado con email:', email);
    const { data } = await axios.post('/auth/login', { email, password });
    console.log('📦 Respuesta del backend:', data);
    console.log('🎫 Token recibido:', data.token ? 'SÍ' : 'NO');
    console.log('👤 Usuario recibido:', data.user);
    
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('authUser', JSON.stringify(data.user));
    
    console.log('💾 Token guardado en localStorage');
    console.log('💾 Usuario guardado en localStorage');
    
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
