import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, CircularProgress, Box, Alert, 
  TextField, Button, Paper, Chip, Grid 
} from '@mui/material';

export default function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      const apiBase = 'http://localhost:81';
      try {
        // Use the endpoint that returns the ticket with related objects (usuario, tecnico, categoria, sla, etiquetas)
        const res = await axios.get(`${apiBase}/apiticket/ticket/getTicketCompletoById/${id}`);
        // API returns the ticket object directly in res.data
        setTicket(res.data || null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // If API returned no ticket
  if (!ticket) return <Alert severity="info">Ticket no encontrado.</Alert>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Detalles del Ticket #{ticket.id_ticket}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate('/')}>
        Volver al Inicio
      </Button>

      {/* Información General */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Información General</Typography>
        <Typography><strong>Título:</strong> {ticket.titulo}</Typography>
        <Typography><strong>Descripción:</strong> {ticket.descripcion}</Typography>
        <Typography><strong>Prioridad:</strong> {ticket.prioridad}</Typography>
        <Typography><strong>Estado:</strong> {ticket.estado?.nombre || 'N/A'}</Typography>
        <Typography><strong>Fecha creación:</strong> {ticket.fecha_creacion}</Typography>
        <Typography><strong>Fecha cierre:</strong> {ticket.fecha_cierre || 'No cerrado'}</Typography>
        <Typography><strong>ID SLA:</strong> {ticket.sla?.id_sla || 'N/A'}</Typography>
        <Typography><strong>SLA Descripcion:</strong> {ticket.sla?.nombre || 'N/A'}</Typography>
        <Typography><strong>Tiempo restante SLA:</strong> {ticket.sla?.tiempo_restante || 'N/A'}</Typography>
      </Paper>

      {/* Usuario Afectado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Usuario Afectado</Typography>
        <Typography><strong>Nombre:</strong> {ticket.usuario?.nombre || ''}</Typography>
        <Typography><strong>Correo:</strong> {ticket.usuario?.correo || ''}</Typography>
        <Typography><strong>ID Usuario:</strong> {ticket.usuario?.id_usuario || ''}</Typography>
      </Paper>

      {/* Técnico Asignado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Técnico Asignado</Typography>
        <Typography><strong>Nombre:</strong> {ticket.tecnico?.nombre_usuario || 'No asignado'}</Typography>
        <Typography><strong>Correo:</strong> {ticket.tecnico?.correo_usuario || 'No asignado'}</Typography>
        <Typography><strong>ID Técnico:</strong> {ticket.tecnico?.id_tecnico || 'N/A'}</Typography>
      </Paper>

      {/* Categoría */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Categoría</Typography>
        <Typography><strong>Descripción:</strong> {ticket.categoria?.nombre || 'N/A'}</Typography>
        <Typography><strong>ID Categoría:</strong> {ticket.categoria?.id_categoria || 'N/A'}</Typography>
      </Paper>

      {/* Etiquetas */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Etiquetas Asociadas</Typography>
        {ticket.etiquetas?.length > 0 ? (
          <Grid container direction="column" spacing={1} sx={{ mt: 1 }}>
            {ticket.etiquetas
              .slice()
              .sort((a, b) => (a?.id_etiqueta ?? a?.id ?? 0) - (b?.id_etiqueta ?? b?.id ?? 0))
              .map((et) => {
              const id = et?.id_etiqueta ?? et?.id ?? '';
              const descripcion = et?.etiqueta ?? et?.nombre ?? et?.label ?? 'Descripción no disponible';
              const key = id || descripcion;
              return (
                <Grid item xs={12} key={key}>
                  <Paper sx={{ bgcolor: 'white', color: '#000000ff', p: 2 }} elevation={2}>
                    <Typography variant="subtitle2">ID etiqueta: {id}</Typography>
                    <Typography variant="body2">Descripción: {descripcion}</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography>No hay etiquetas asociadas</Typography>
        )}
      </Paper>

      {/* Comentario */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Agregar Comentario</Typography>
        <TextField
          fullWidth
          multiline
          minRows={3}
          value={comentario}
          onChange={(e) => setComentario(e.target.value)}
          placeholder="Escribí tu comentario aquí..."
        />
        <Button variant="contained" sx={{ mt: 2 }}>Enviar comentario</Button>
      </Paper>
    </Container>
  );
}
