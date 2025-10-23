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
  const [mainImageIndex, setMainImageIndex] = useState(0);

  // reset main image index when ticket changes
  useEffect(() => {
    setMainImageIndex(0);
  }, [ticket]);

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

      {/* Imágenes (carrusel manual) */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Imágenes del Ticket</Typography>
        {Array.isArray(ticket.imagenes) && ticket.imagenes.length > 0 ? (
          (() => {
            const UPLOADS_BASE = 'http://localhost:81/apiticket/uploads';
            const imgs = ticket.imagenes;
            const safeIndex = ((mainImageIndex % imgs.length) + imgs.length) % imgs.length;
            const main = imgs[safeIndex];
            const filename = main?.imagen || main?.url || main?.path || main?.image || '';
            return (
              <Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Button size="small" disabled={imgs.length <= 1} onClick={() => setMainImageIndex(i => (i - 1 + imgs.length) % imgs.length)}>&lt;</Button>
                  <Box sx={{ flex: 1, textAlign: 'center' }}>
                    <Box
                      component="img"
                      src={`${UPLOADS_BASE}/${filename}`}
                      alt={main?.imagen || ''}
                      sx={{ maxWidth: '100%', maxHeight: 420, borderRadius: 2 }}
                    />
                    {main?.descripcion && <Typography variant="caption" display="block">{main.descripcion}</Typography>}
                  </Box>
                  <Button size="small" disabled={imgs.length <= 1} onClick={() => setMainImageIndex(i => (i + 1) % imgs.length)}>&gt;</Button>
                </Box>
                <Box sx={{ display: 'flex', gap: 1, mt: 2, overflowX: 'auto' }}>
                  {imgs.map((im, idx) => {
                    const fn = im?.imagen || im?.url || im?.path || im?.image || '';
                    return (
                      <Box key={im.id_imagen ?? idx} onClick={() => setMainImageIndex(idx)} sx={{ cursor: 'pointer', border: idx === safeIndex ? '2px solid #1976d2' : '2px solid transparent', borderRadius: 1 }}>
                        <Box component="img" src={`${UPLOADS_BASE}/${fn}`} alt={im?.imagen || ''} sx={{ width: 100, height: 70, objectFit: 'cover', borderRadius: 1 }} />
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            );
          })()
        ) : (
          <Typography variant="body2">No hay imágenes asociadas a este ticket.</Typography>
        )}
      </Paper>

      {/* Comentario existente (solo lectura) */}
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Comentario</Typography>
        {ticket.comentario ? (
          <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>{ticket.comentario}</Typography>
        ) : (
          <Typography variant="body2" color="text.secondary">No hay comentarios registrados para este ticket.</Typography>
        )}
      </Paper>
    </Container>
  );
}
