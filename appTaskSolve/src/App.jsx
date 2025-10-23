import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import PageNotFound from './components/Home/PageNotFound';
import TicketsPorTecnico from './components/Tickets/TicketsPorTecnico';
import TicketsList from './components/Tickets/TicketsList';
import DetalleTicket from './components/Tickets/DetalleTicket';
import TecnicosList from './components/Tecnicos/TecnicosList';
import TecnicosHub from './components/Tecnicos/TecnicosHub';
import TecnicoDetalle from './components/Tecnicos/TecnicoDetalle';
import CategoriasList from './components/Categorias/CategoriasList';
import CategoriaDetalle from './components/Categorias/CategoriaDetalle';
import Dashboard from './components/Dashboard/Dashboard';
import AsignacionesTecnicos from './components/Asignaciones/AsignacionesTecnicos';
import Login from './components/Auth/Login';
import RequireAuth from './components/Auth/RequireAuth';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <Layout>
          <Routes>
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route path="/home" element={<Home />} />
          <Route element={<RequireAuth allowedRoles={["Administrador"]} />}> 
            <Route path="/dashboard" element={<Dashboard />} />
          </Route>
          <Route path="/asignaciones" element={<Navigate to="/tecnicos/asignaciones" replace />} />
          <Route path="/tickets" element={<TicketsList />} />
          <Route path="/tickets/tecnico" element={<TicketsPorTecnico />} />
          <Route path="/tickets/:id" element={<DetalleTicket />} />
          <Route element={<RequireAuth allowedRoles={["Administrador","Técnico","Tecnico"]} />}> 
            <Route path="/tecnicos/*" element={<TecnicosHub />} >
              <Route index element={<Navigate to="listado" replace />} />
              <Route path="listado" element={<TecnicosList />} />
              <Route path="asignaciones" element={<AsignacionesTecnicos />} />
              <Route path="tickets" element={<TicketsPorTecnico />} />
            </Route>
          </Route>
          <Route path="/tecnicos/:id" element={<TecnicoDetalle />} />
          <Route path="/categorias" element={<CategoriasList />} />
          <Route path="/categorias/:id" element={<CategoriaDetalle />} />
          <Route path="/login" element={<Login />} />
          <Route path="*" element={<PageNotFound />} />
          </Routes>
        </Layout>
      </AuthProvider>
    </Router>
  );
}
