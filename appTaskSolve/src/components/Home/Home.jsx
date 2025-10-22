import React, { useEffect, useMemo, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Box,
  useTheme,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  Button
} from '@mui/material';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Datos simulados como fallback
const TICKET_DATA_HOME = [];

const Home = () => {
  const [tickets, setTickets] = useState(TICKET_DATA_HOME);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIds, setSelectedIds] = useState([]);
  const apiBase = 'http://localhost:81';
  const theme = useTheme();
  const navigate = useNavigate(); // Hook para navegación

  // Colores según estado
  const getStatusColor = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e.includes('abierto') || e.includes('asignado')) return theme.palette.info.main;
    if (e.includes('proceso')) return theme.palette.warning.main;
    if (e.includes('resuelto')) return theme.palette.success.main;
    if (e.includes('cerrado')) return theme.palette.grey[500];
    return theme.palette.grey[700];
  };

  // Traer tickets
  const fetchTickets = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${apiBase}/apiticket/ticket`);
      const data = res.data ?? [];
      if (Array.isArray(data) && data.length > 0) {
        const mapped = data.map((t) => ({
          id_ticket: parseInt(t['Identificador del Ticket'], 10),
          titulo: t['Categoría'],
          fecha_creacion: t['Fecha de creación'] || '',
          estado: t['Estado actual'],
          sla: t['Tiempo restante SLA (máx)'] || ''
        }));
        const order = ['Asignado', 'En Proceso', 'Resuelto', 'Cerrado'];
        const sorted = mapped.sort((a, b) => order.indexOf(a.estado) - order.indexOf(b.estado));
        setTickets(sorted);
      }
    } catch (err) {
      console.error(err);
      setError('Error al cargar tickets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
  }, []);

  // Agrupar por estado
  const grupos = useMemo(() => {
    const g = tickets.reduce((acc, t) => {
      const estado = t.estado || 'Otros';
      if (!acc[estado]) acc[estado] = [];
      acc[estado].push(t);
      return acc;
    }, {});
    const order = ['Asignado', 'En Proceso', 'Resuelto', 'Cerrado'];
    return order.filter((e) => g[e]?.length).map((e) => ({ titulo: e, items: g[e] }));
  }, [tickets]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography component="h1" variant="h2" align="center" gutterBottom>
        Gestión de Tickets de Soporte
      </Typography>

      {/* Toolbar */}
      <Box display="flex" justifyContent="center" alignItems="center" sx={{ mb: 1 }}>
        <Box sx={{ mr: 2 }}>
          <Typography variant="body2" color="text.secondary">
            Seleccionados: <strong>{selectedIds.length}</strong>
          </Typography>
        </Box>
        <Box>
          <Button
            size="small"
            color="error"
            variant="outlined"
            disabled={selectedIds.length === 0}
            sx={{ mr: 1 }}
          >
            Borrar
          </Button>
          <Button size="small" variant="outlined" onClick={fetchTickets} disabled={loading}>
            Recargar
          </Button>
        </Box>
      </Box>

      <Typography variant="h5" align="center" color="text.secondary" mb={6}>
        Consulta el estado de los tickets de soporte activos y recientes.
      </Typography>

      <Box textAlign="center" mb={3}>
        <Typography variant="h4" color="primary">🎟️ Tiquetes Recientes</Typography>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}
      {!!error && !loading && (
        <Alert severity="error" sx={{ maxWidth: 800, mx: 'auto' }}>{error}</Alert>
      )}

      {!loading && !error && grupos.map((grupo, gi) => (
        <Box key={grupo.titulo} sx={{ mt: gi === 0 ? 0 : 4 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Chip
              label={grupo.titulo}
              color={
                grupo.titulo === 'Asignado' ? 'info' :
                grupo.titulo === 'En Proceso' ? 'warning' :
                grupo.titulo === 'Resuelto' ? 'success' : 'default'
              }
            />
            <Divider sx={{ flex: 1, ml: 2 }} />
          </Box>

          <Grid container spacing={3}>
            {grupo.items.map((ticket) => {
              const id = ticket.id_ticket;
              const isSelected = selectedIds.includes(id);

              return (
                <Grid item xs={12} sm={6} md={4} key={id}>
                  <Card
                    elevation={3}
                    sx={{
                      borderRadius: 2,
                      height: "100%",
                      bgcolor: isSelected ? "rgba(200,255,200,0.4)" : "background.paper",
                      cursor: "pointer",
                      transition: "0.2s ease",
                      "&:hover": { transform: "scale(1.02)", boxShadow: 6 },
                    }}
                    onClick={() => navigate(`/tickets/${id}`)} // navega al detalle
                  >
                    <CardContent>
                      <Typography variant="subtitle2" color="text.secondary">ID #{id}</Typography>
                      <Typography variant="h6" sx={{ mb: 1 }}>{ticket.titulo}</Typography>

                      <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                        <Chip size="small" label={ticket.estado} sx={{ bgcolor: getStatusColor(ticket.estado), color: '#fff' }} />
                        {ticket.sla && (
                          <Chip size="small" variant="outlined" label={`SLA: ${ticket.sla}`} />
                        )}
                      </Box>

                      {/* Checkbox independiente */}
                      <Box onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar ticket ${id}`}
                          checked={isSelected}
                          onChange={(e) => {
                            if (e.target.checked) setSelectedIds(prev => [...prev, id]);
                            else setSelectedIds(prev => prev.filter(x => x !== id));
                          }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      ))}
    </Container>
  );
};

export default Home;
