import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

function normalizeRole(r){
  if (!r) return r;
  return r === 'Técnico' ? 'Tecnico' : r;
}

export default function RequireAuth({ allowedRoles }){
  const { user } = useAuth();
  const location = useLocation();

  if (!user){
    return <Navigate to="/login" state={{ from: location }} replace />;
  }
  if (Array.isArray(allowedRoles) && allowedRoles.length){
    const u = normalizeRole(user.rol);
    const allowed = allowedRoles.map(normalizeRole);
    if (!allowed.includes(u)){
      return <Navigate to="/" replace />;
    }
  }
  return <Outlet/>;
}
