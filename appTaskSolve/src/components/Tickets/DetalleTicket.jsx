import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, CircularProgress, Box, Alert, TextField, Button, Paper } from '@mui/material';

export default function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate(); // Hook para navegación
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [comentario, setComentario] = useState('');

  useEffect(() => {
    const fetchTicket = async () => {
      try {
        const res = await axios.get(`http://localhost:81/apiticket/ticket/${id}`);
        setTicket(res.data);
      } catch (err) {
        setError('No se pudo cargar la información del ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Detalles del Ticket #{id}
      </Typography>

      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate('/')}>
        Volver al Inicio
      </Button>

      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>
          Información general
        </Typography>

        <Typography><strong>Categoría:</strong> {ticket.categoria || 'N/A'}</Typography>
        <Typography><strong>Estado:</strong> {ticket.estado || 'N/A'}</Typography>
        <Typography><strong>Descripción:</strong> {ticket.descripcion || 'N/A'}</Typography>
        <Typography><strong>Fecha creación:</strong> {ticket.fecha_creacion || 'N/A'}</Typography>
        <Typography><strong>SLA:</strong> {ticket.sla || 'N/A'}</Typography>
      </Paper>

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


