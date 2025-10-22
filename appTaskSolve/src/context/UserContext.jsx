import React, { createContext, useContext, useMemo, useState } from 'react';

/*
  UserContext mantiene el rol e identificadores del usuario actual para filtrar la
  información según el enunciado. No es editable desde la UI (se puede ajustar aquí
  o mediante variables de entorno para pruebas).
*/

const DEFAULT_ROLE = import.meta?.env?.VITE_DEFAULT_ROLE || 'Administrador';
const DEFAULT_USER_ID = import.meta?.env?.VITE_DEFAULT_USER_ID || '2-0901-0847'; // cliente de ejemplo
const DEFAULT_TECH_ID = parseInt(import.meta?.env?.VITE_DEFAULT_TECH_ID || '1', 10); // técnico de ejemplo

const UserContext = createContext(null);

export function UserProvider({ children }) {
  const [role, setRole] = useState(DEFAULT_ROLE); // 'Administrador' | 'Cliente' | 'Técnico'
  const [ids] = useState({ idUsuario: DEFAULT_USER_ID, idTecnico: DEFAULT_TECH_ID });

  const value = useMemo(() => ({ role, ids, setRole }), [role, ids]);
  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used within a UserProvider');
  return ctx;
}
