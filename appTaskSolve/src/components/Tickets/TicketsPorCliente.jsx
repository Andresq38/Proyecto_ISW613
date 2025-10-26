import React, { useState, useEffect } from 'react';
import {
  Container, Typography, FormControl, InputLabel,
  Select, MenuItem, Grid, Card, CardContent, Box, CircularProgress, Alert, Chip, useTheme, Button,
  Dialog, DialogTitle, DialogContent, DialogActions
} from '@mui/material';
// Calendar
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import enUS from 'date-fns/locale/en-US';
import 'react-big-calendar/lib/css/react-big-calendar.css';
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

  const locales = { 'en-US': enUS };
  const localizer = dateFnsLocalizer({ format, parse, startOfWeek, getDay, locales });

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
        // Do not auto-select a client; keep the select empty so user chooses explicitly
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
        // Use the "completos" endpoint so we have fecha_creacion and related data
        const res = await axios.get(`${apiBase}/apiticket/ticket/getTicketsCompletos`);
        const data = Array.isArray(res.data) ? res.data : [];
        // Filter to tickets belonging to the selected user
        const userTickets = data.filter(t => String(t.id_usuario) === String(usuarioSeleccionado));
        const mapped = userTickets.map(t => {
          const estadoVal = (t.estado && (t.estado.nombre ?? t.estado)) || (t['Estado actual'] ?? '');
          const slaVal = (t.sla && (t.sla.tiempo_restante ?? t.sla)) || (t['Tiempo restante SLA'] ?? '');
          return ({
            id_ticket: parseInt(t.id_ticket ?? t['Identificador del Ticket'] ?? t.id, 10),
            titulo: t.titulo ?? t['Título'] ?? 'Ticket',
            estado: estadoVal,
            sla: slaVal,
            _raw: t
          });
        });
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

  // Build calendar events from tickets (use creation date)
  // Build calendar events from tickets using fecha_creacion from the ticket completo
  const events = tickets.map(t => {
    const raw = t._raw || {};
    const dateStr = raw.fecha_creacion || raw['fecha_creacion'] || raw['Fecha de creación'] || raw.fecha || raw.created_at;
    if (!dateStr) return null; // skip tickets without a creation date
    const start = new Date(dateStr);
    const end = new Date(start.getTime() + 60 * 60 * 1000);
    return {
      id: t.id_ticket,
      title: `#${t.id_ticket} ${t.titulo}`,
      start,
      end,
      allDay: false,
      resource: t
    };
  }).filter(Boolean);

  const eventStyleGetter = (event) => ({
    style: {
      backgroundColor: '#1976d2', // change this color to adjust calendar event color
      borderRadius: '4px',
      color: 'white',
      border: 'none'
    }
  });

  // Hover message and dialog states
  const [hoveredTicket, setHoveredTicket] = useState(null); // object { title, msg }
  const [hoverPos, setHoverPos] = useState(null);
  const [selectedTicket, setSelectedTicket] = useState(null); // when set, dialog opens

  const handleSelectEvent = (ev) => {
    // clear hover preview when opening dialog
    setHoveredTicket(null);
    setHoverPos(null);
    const found = tickets.find(t => Number(t.id_ticket) === Number(ev.id));
    setSelectedTicket(found?._raw || found || ev.resource?._raw || ev.resource || null);
  };

  const CalendarEvent = ({ event }) => (
    <div
      onMouseEnter={(e) => {
        const x = e.clientX;
        const y = e.clientY;
        const left = Math.min(x + 12, window.innerWidth - 320);
        const top = Math.min(y + 12, window.innerHeight - 120);
        setHoverPos({ left, top });
        setHoveredTicket({ title: event.title, msg: 'Haga clic para ver un resumen detallado de este ticket.' });
      }}
      onMouseLeave={() => { setHoveredTicket(null); setHoverPos(null); }}
      style={{ padding: 4 }}
    >
      {event.title}
    </div>
  );

  const getField = (raw, names) => {
    for (const n of names) if (raw[n]) return raw[n];
    return null;
  };

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, color: 'primary.main', fontWeight: 700 }}>
        Tickets por Cliente
      </Typography>

      <FormControl fullWidth variant="outlined" sx={{ mb: 4 }}>
        <InputLabel id="select-usuario-label" shrink>Seleccionar Cliente</InputLabel>
        <Select
          labelId="select-usuario-label"
          value={usuarioSeleccionado}
          label="Seleccionar Cliente"
          onChange={(e) => setUsuarioSeleccionado(e.target.value)}
          displayEmpty
          renderValue={(selected) => {
            if (!selected) return 'Seleccione un cliente...';
            const found = usuarios.find(u => String(u.id_usuario) === String(selected));
            return found ? found.nombre : selected;
          }}
        >
          <MenuItem value="" disabled>
            Seleccione un cliente...
          </MenuItem>
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
                    cursor: 'pointer'
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
          !loading && usuarioSeleccionado ? (
            <Grid item xs={12}>
              <Typography color="text.secondary">No hay tickets para el cliente seleccionado.</Typography>
            </Grid>
          ) : null
        )}
      </Grid>

      {/* Calendar view below the tickets list */}
      <Box sx={{ mt: 4 }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Calendario de tickets (por fecha de creación)</Typography>
        <Card>
          <CardContent>
            <div style={{ height: 520 }}>
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                defaultView="month"
                views={["month", "week", "day"]}
                eventPropGetter={eventStyleGetter}
                onSelectEvent={handleSelectEvent}
                // Disable the calendar's native tooltip/title to avoid duplicate browser tooltips
                tooltipAccessor={() => null}
                components={{ event: CalendarEvent }}
              />
            </div>
          </CardContent>
        </Card>
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Los eventos se generan desde la fecha de creación del ticket.
        </Typography>
      </Box>
      {/* Dialog summary (opens on click) */}
      <Dialog open={!!selectedTicket} onClose={() => setSelectedTicket(null)} maxWidth="sm" fullWidth>
        <DialogTitle>Resumen del ticket</DialogTitle>
        <DialogContent dividers>
          {selectedTicket ? (
            <Box sx={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 1 }}>
              <Typography variant="subtitle2" color="text.secondary">Ticket</Typography>
              <Typography variant="body1">{selectedTicket.id_ticket ?? selectedTicket.id}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Título</Typography>
              <Typography variant="body1">{selectedTicket.titulo ?? selectedTicket.Título}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Descripción</Typography>
              <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>{selectedTicket.descripcion ?? selectedTicket.Descripción ?? 'Sin descripción'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Prioridad</Typography>
              <Typography variant="body1">{selectedTicket.prioridad ?? selectedTicket.priority ?? 'N/A'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Categoría</Typography>
              <Typography variant="body1">{(selectedTicket.categoria && (selectedTicket.categoria.nombre ?? selectedTicket.categoria)) || selectedTicket.categoria_descripcion || 'N/A'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Técnico</Typography>
              <Typography variant="body1">{(selectedTicket.tecnico && (selectedTicket.tecnico.nombre ?? selectedTicket.tecnico.nombre_usuario ?? selectedTicket.tecnico)) || 'No asignado'}</Typography>

              <Typography variant="subtitle2" color="text.secondary">Cliente</Typography>
              <Typography variant="body1">{(selectedTicket.usuario && (selectedTicket.usuario.nombre ?? selectedTicket.usuario)) || selectedTicket.id_usuario || 'N/A'}</Typography>
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedTicket(null)}>Cerrar</Button>
          {selectedTicket && (
            <Button variant="contained" onClick={() => window.location.assign(`/tickets/${selectedTicket.id_ticket ?? selectedTicket.id}`)}>Ver detalle</Button>
          )}
        </DialogActions>
      </Dialog>
      {hoveredTicket && hoverPos && (
        <Box sx={{ position: 'fixed', left: hoverPos.left, top: hoverPos.top, width: 300, bgcolor: '#fff', color: '#000', boxShadow: 3, borderRadius: 2, p: 2, zIndex: 1400, pointerEvents: 'none' }}>
          <Typography variant="subtitle2" sx={{ color: '#000', fontStyle: 'italic' }}>{hoveredTicket.title}</Typography>
          <Typography variant="body2" sx={{ color: '#000', mt: 1 }}>{hoveredTicket.msg}</Typography>
        </Box>
      )}
    </Container>
  );
};

export default TicketsPorCliente;
