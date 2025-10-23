// Centraliza la detección del origen del API.
// Preferimos que todo el equipo use http://localhost:81 por defecto.

export const getApiOrigin = () => {
  const env = typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE;
  if (env) return env.replace(/\/$/, '');
  return 'http://localhost:81';
};

export const getApiBaseWithPrefix = (prefix = '/apiticket') => `${getApiOrigin()}${prefix}`;
