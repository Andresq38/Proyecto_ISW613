import React, { useState, useEffect } from 'react';
import {
  Container, Typography, FormControl, InputLabel,
  Select, MenuItem, Grid, Card, CardContent, Box, CircularProgress, Alert, Chip, useTheme
} from '@mui/material';
import axios from 'axios';
import { getApiOrigin } from '../../utils/apiBase';

const TicketsPorCliente = () => {
  const apiBase = getApiOrigin();
  const [usuarioSeleccionado, setUsuarioSeleccionado] = useState(''); // id_usuario
  const [usuarios, setUsuarios] = useState([]); // [{id_usuario, nombre}]
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

  // Cargar todos los usuarios (clientes)
  useEffect(() => {
    const fetchUsuarios = async () => {
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/apiticket/usuario`);
        const data = Array.isArray(res.data) ? res.data : [];
        // Map and capture possible role field names, then filter to role === 3 (cliente)
        const mapped = data.map(u => ({
          id_usuario: u.id_usuario ?? u.id ?? u.ID_USUARIO,
          id_rol: u.id_rol ?? u.idRol ?? u.rol_id ?? u.rol ?? u.role ?? u.ID_ROL ?? null,
          nombre: (u.nombre ?? u.nombre_usuario) || ((`${u.nombre || ''} ${u.apellido || ''}`).trim()) || 'Sin nombre'
        }));
        const clientes = mapped.filter(u => Number(u.id_rol) === 3);
        setUsuarios(clientes);
        if (clientes.length > 0) setUsuarioSeleccionado(prev => prev || clientes[0].id_usuario);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la lista de usuarios');
      }
    };
    fetchUsuarios();
  }, []);

  // Cargar tickets por usuario seleccionado
  useEffect(() => {
    const fetchTickets = async () => {
      if (!usuarioSeleccionado) { setTickets([]); return; }
      setLoading(true);
      setError(null);
      try {
        const res = await axios.get(`${apiBase}/apiticket/ticket/getTicketByUsuario/${usuarioSeleccionado}`);
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
        setError('No se pudieron cargar los tickets del usuario seleccionado');
      } finally {
        setLoading(false);
      }
    };
    fetchTickets();
  }, [usuarioSeleccionado]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>
        Tickets por Cliente
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="select-usuario-label">Seleccionar Cliente</InputLabel>
        <Select
          labelId="select-usuario-label"
          value={usuarioSeleccionado}
          label="Seleccionar Cliente"
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
        >
          {usuarios.map((u) => (
            <MenuItem key={u.id_usuario} value={u.id_usuario}>{u.nombre}</MenuItem>
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
          <Grid item xs={12}><Alert severity="error">{error}</Alert></Grid>
        )}

        {!loading && !error && tickets.length > 0 ? (
          tickets.map((ticket) => (
              <Grid item xs={12} md={6} key={ticket.id_ticket}>
                <Card
                  elevation={2}
                  sx={{
                    borderRadius: 2,
                    borderLeft: `6px solid ${getStatusColor(ticket.estado)}`,
                    cursor: 'pointer',
                    '&:hover': { boxShadow: 8 }
                  }}
                  onClick={() => window.location.assign(`/tickets/${ticket.id_ticket}`)}
                >
                  <CardContent>
                    <Typography variant="h6">#{ticket.id_ticket} - {ticket.titulo}</Typography>
                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mt: 1 }}>
                      <Chip size="small" label={ticket.estado} sx={{ bgcolor: getStatusColor(ticket.estado), color: '#fff' }} />
                      {ticket.sla && <Chip size="small" variant="outlined" label={`SLA: ${ticket.sla}`} />}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))
        ) : (
          !loading && (
            <Grid item xs={12}>
              <Typography color="text.secondary">No hay tickets para el cliente seleccionado.</Typography>
            </Grid>
          )
        )}
      </Grid>
    </Container>
  );
};

export default TicketsPorCliente;
