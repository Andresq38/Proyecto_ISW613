import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getApiOrigin, getApiBaseWithPrefix } from '../utils/apiBase';

const AuthContext = createContext(null);

const API_BASE = getApiBaseWithPrefix('/apiticket');
// Asegurar baseURL de axios lo antes posible para evitar condiciones de carrera
axios.defaults.baseURL = API_BASE;
// Enviar cookies (credenciales) con las peticiones para soportar sesiones server-side
axios.defaults.withCredentials = true;

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
      try {
        const method = (config.method || 'get').toUpperCase();
        const url = config.url || config.baseURL || '<unknown>';
        console.log('➤ Outgoing request', method, url, 'withCredentials=', axios.defaults.withCredentials);
      } catch (e) {}
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

  // Hacer login: backend creará la sesión y enviará cookie HttpOnly. El endpoint devuelve el user.
  const login = async (email, password) => {
    const { data } = await axios.post('/auth/login', { email, password });
    setUser(data.user);
    try { localStorage.setItem('authUser', JSON.stringify(data.user)); } catch {}
    return data.user;
  };

  const logout = async () => {
    try { await axios.post('/auth/logout'); } catch (e) {}
    setToken(null);
    setUser(null);
    try { localStorage.removeItem('authToken'); localStorage.removeItem('authUser'); } catch {}
  };

  // Al montar, intentar obtener el usuario desde la sesión server-side
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const res = await axios.get('/auth/me');
        if (mounted) {
          setUser(res.data.user || null);
          try { localStorage.setItem('authUser', JSON.stringify(res.data.user || null)); } catch {}
        }
      } catch (e) {
        if (mounted) setUser(null);
      }
    })();
    return () => { mounted = false; };
  }, []);

  const value = useMemo(() => ({ token, user, login, logout }), [token, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
