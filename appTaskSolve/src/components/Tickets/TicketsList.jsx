import React, { useEffect, useState } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';

const API_BASE = 'http://localhost/apiticket';

const statusColor = (estado) => {
  const map = {
    'Asignado': 'info',
    'En Proceso': 'warning',
    'Resuelto': 'success',
    'Cerrado': 'default'
  };
  return map[estado] || 'primary';
};

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError('');
        const res = await fetch(`${API_BASE}/ticket`, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Tickets
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!!error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tickets.length === 0 && (
        <Alert severity="info">No hay tickets para mostrar.</Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {tickets.map((t, idx) => (
          <Grid item xs={12} md={6} lg={4} key={idx}>
            <Card elevation={2} sx={{ borderRadius: 2 }}>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">ID #{t['Identificador del Ticket']}</Typography>
                <Typography variant="h6" sx={{ mb: 1 }}>{t['Categoría']}</Typography>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                  <Chip size="small" label={t['Estado actual']} color={statusColor(t['Estado actual'])} />
                  <Chip size="small" variant="outlined" label={`SLA: ${t['Tiempo restante SLA (máx)']}`} />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}
