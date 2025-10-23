import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import PageNotFound from './components/Home/PageNotFound';
import TicketsPorTecnico from './components/Tickets/TicketsPorTecnico';
import TicketsList from './components/Tickets/TicketsList';
import TicketsPorAdmi from './components/Tickets/TicketsPorAdmi';
import TicketsPorCliente from './components/Tickets/TicketsPorCliente';
import DetalleTicket from './components/Tickets/DetalleTicket';
import TecnicosList from './components/Tecnicos/TecnicosList';
import TecnicosHub from './components/Tecnicos/TecnicosHub';
import TecnicoDetalle from './components/Tecnicos/TecnicoDetalle';
import CategoriasList from './components/Categorias/CategoriasList';
import CategoriaDetalle from './components/Categorias/CategoriaDetalle';
import Dashboard from './components/Dashboard/Dashboard';
import AsignacionesTecnicos from './components/Asignaciones/AsignacionesTecnicos';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/asignaciones" element={<Navigate to="/tecnicos/asignaciones" replace />} />
          <Route path="/tickets" element={<TicketsList />} />
          <Route path="/tickets/Administrador" element={<TicketsPorAdmi />} />
          <Route path="/tickets/cliente" element={<TicketsPorCliente />} />
          <Route path="/tickets/tecnico" element={<TicketsPorTecnico />} />
          <Route path="/tickets/:id" element={<DetalleTicket />} />
          <Route path="/tecnicos/*" element={<TecnicosHub />} >
            <Route index element={<Navigate to="listado" replace />} />
            <Route path="listado" element={<TecnicosList />} />
            <Route path="asignaciones" element={<AsignacionesTecnicos />} />
            <Route path="tickets" element={<TicketsPorTecnico />} />
          </Route>
          <Route path="/tecnicos/:id" element={<TecnicoDetalle />} />
          <Route path="/categorias" element={<CategoriasList />} />
          <Route path="/categorias/:id" element={<CategoriaDetalle />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
