import React, { useState, useEffect } from 'react';
import {
  Container, Typography, FormControl, InputLabel,
  Select, MenuItem, Grid, Card, CardContent, Box, CircularProgress, Alert, Chip, useTheme
} from '@mui/material';
import axios from 'axios';

const TicketsPorTecnico = () => {
  const apiBase = 'http://localhost';
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState(''); // id_tecnico
  const [tecnicos, setTecnicos] = useState([]); // [{id_tecnico, nombre}]
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const theme = useTheme();

  const getStatusColor = (estado) => {
    const e = (estado || '').toLowerCase();
    if (e.includes('asignado') || e.includes('abierto')) return theme.palette.info.main;
    if (e.includes('proceso')) return theme.palette.warning.main;
    if (e.includes('resuelto')) return theme.palette.success.main;
    if (e.includes('cerrado')) return theme.palette.grey[500];
    return theme.palette.grey[700];
  };

  // Cargar todos los técnicos (aunque no tengan tickets asignados)
  useEffect(() => {
    const fetchTecnicos = async () => {
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/apiticket/tecnico`);
        const data = Array.isArray(res.data) ? res.data : [];
        // normalizar campos
        const mapped = data.map(t => ({
          id_tecnico: t.id_tecnico ?? t.ID_TECNICO ?? t.id,
          nombre: t.nombre ?? t.nombre_usuario ?? 'Sin nombre'
        }));
        setTecnicos(mapped);
        // Preseleccionar el primer técnico disponible si no hay uno ya seleccionado
        if (mapped.length > 0) {
          setTecnicoSeleccionado(prev => prev || mapped[0].id_tecnico);
        }
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de técnicos');
      }
    };
    fetchTecnicos();
  }, []);

  // Cargar tickets por técnico seleccionado
  useEffect(() => {
    const fetchTickets = async () => {
      if (!tecnicoSeleccionado) { setTickets([]); return; }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/apiticket/ticket/getTicketByTecnico/${tecnicoSeleccionado}`);
        const data = Array.isArray(res.data) ? res.data : [];
        const mapped = data.map(t => ({
          id_ticket: parseInt(t['Identificador del Ticket'] ?? t.id_ticket ?? t.id, 10),
          titulo: t['Categoría'] ?? t.titulo ?? 'Ticket',
          estado: t['Estado actual'] ?? t.estado ?? '',
          sla: t['Tiempo restante SLA (máx)'] ?? t.sla ?? ''
        }));
        setTickets(mapped);
      } catch (err) {
        console.error(err);
        setError('No se pudieron cargar los tickets del técnico seleccionado');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [tecnicoSeleccionado]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>
        Tickets Asignados por Técnico
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="select-tecnico-label">Seleccionar Técnico</InputLabel>
        <Select
          labelId="select-tecnico-label"
          value={tecnicoSeleccionado}
          label="Seleccionar Técnico"
          onChange={(e) => setTecnicoSeleccionado(e.target.value)}
        >
          {tecnicos.map((t) => (
            <MenuItem key={t.id_tecnico} value={t.id_tecnico}>{t.nombre}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {loading && (
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          </Grid>
        )}
        {!!error && !loading && (
          <Grid item xs={12}>
            <Alert severity="error">{error}</Alert>
          </Grid>
        )}
        {!loading && !error && tickets.length > 0 ? (
            tickets.map((ticket) => (
            <Grid item xs={12} md={6} key={ticket.id_ticket}>
                <Card elevation={2} sx={{ borderRadius: 2, borderLeft: `6px solid ${getStatusColor(ticket.estado)}` }}>
                <CardContent>
                    <Typography variant="h6">#{ticket.id_ticket} - {ticket.titulo}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                      <Chip size="small" label={ticket.estado} sx={{ bgcolor: getStatusColor(ticket.estado), color: '#fff' }} />
                      {ticket.sla && (
                        <Chip size="small" variant="outlined" label={`SLA: ${ticket.sla}`} />
                      )}
                    </Box>
                </CardContent>
                </Card>
            </Grid>
            ))
        ) : (
            tecnicoSeleccionado && !loading && !error && (
                <Grid item xs={12}>
                    <Typography color="text.secondary">No hay tickets asignados para el técnico seleccionado.</Typography>
                </Grid>
            )
        )}
      </Grid>
      {!tecnicoSeleccionado && (
          <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
            Por favor, selecciona un técnico para ver sus tickets asignados.
          </Typography>
      )}
    </Container>
  );
};

export default TicketsPorTecnico;
