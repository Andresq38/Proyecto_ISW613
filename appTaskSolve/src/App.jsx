import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Home from './components/Home/Home';
import PageNotFound from './components/Home/PageNotFound';
import TicketsPorTecnico from './components/Tickets/TicketsPorTecnico';
import TicketsList from './components/Tickets/TicketsList';

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/tickets" element={<TicketsList />} />
          <Route path="/tickets/tecnico" element={<TicketsPorTecnico />} />
          <Route path="*" element={<PageNotFound />} />
        </Routes>
      </Layout>
    </Router>
  );
}
