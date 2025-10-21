import React, { useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Box, useTheme } from '@mui/material';
import axios from 'axios';
import { Button } from '@mui/material';
// La importación de datos se elimina porque el entorno no puede resolver rutas relativas.
// import { TICKET_DATA_HOME } from '../../data/Data'; 

// Datos simulados movidos directamente al componente para asegurar la ejecución
const TICKET_DATA_HOME = [
  { id_ticket: 1, titulo: "Error en inicio de sesión", fecha_creacion: "2025-10-18", estado: "Abierto" },
  { id_ticket: 2, titulo: "Actualización de software", fecha_creacion: "2025-10-17", estado: "En progreso" },
  { id_ticket: 3, titulo: "Problemas con impresora", fecha_creacion: "2025-10-16", estado: "Cerrado" },
];


const Home = () => {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const apiBase = ''; // leave blank to use same origin, or set to full host if backend is on different port
  const theme = useTheme(); // Hook para acceder al tema

  const getStatusColor = (estado) => {
    switch (estado) {
      case "Abierto": return theme.palette.success.main;
      case "En progreso": return theme.palette.warning.main;
      case "Cerrado": return theme.palette.grey[500];
      default: return theme.palette.grey[700];
    }
  };

  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiBase}/apiticket/ticket`);
      // backend may return { status:..., result: [...] } or directly an array
      const data = res.data?.result ?? res.data ?? [];
      setTickets(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error(err);
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchTickets();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography component="h1" variant="h2" align="center" gutterBottom>
        Gestión de Tickets de Soporte
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" mb={6}>
        Consulta el estado de los tickets de soporte activos y recientes.
      </Typography>

      <Box textAlign="center" mb={3}>
        <Typography variant="h4" color="primary">🎟️ Tiquetes Recientes</Typography>
        <Box sx={{ mt: 1 }}>
          <Button size="small" variant="outlined" onClick={fetchTickets} disabled={loading}>Recargar</Button>
        </Box>
      </Box>

      {loading ? (
        <Typography align="center">Cargando...</Typography>
      ) : error ? (
        <Typography color="error" align="center">{error}</Typography>
      ) : (
        <Grid container spacing={3} justifyContent="center">
          {tickets.map((ticket) => (
            <Grid item xs={12} sm={6} md={4} key={ticket.id_ticket || ticket.id}>
              <Card elevation={3} sx={{ borderRadius: 2 }}>
                <CardContent>
                  <Typography variant="h6">#{ticket.id_ticket || ticket.id} — {ticket.titulo || ticket.subject || ticket.short_description}</Typography>
                  <Typography color="text.secondary" sx={{ mb: 1 }}>📅 {ticket.fecha_creacion || ticket.created_at}</Typography>
                  <Typography
                    sx={{
                      mt: 1,
                      fontWeight: 'bold',
                      color: getStatusColor(ticket.estado || ticket.state),
                      p: 0.5,
                      borderRadius: 1,
                      display: 'inline-block'
                    }}
                  >
                    Estado: {ticket.estado || ticket.state}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default Home;
