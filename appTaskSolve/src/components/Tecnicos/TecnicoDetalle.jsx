import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Typography, CircularProgress, Box, Alert, Paper, Chip, Grid, Button } from '@mui/material';

const apiBase = (import.meta?.env?.VITE_API_BASE)
  || (typeof window !== 'undefined' ? window.location.origin.replace(/:\\d+$/, '') : 'http://localhost');

export default function TecnicoDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const run = async () => {
      try {
        const res = await axios.get(`${apiBase}/apiticket/tecnico/${id}`);
        setData(res.data || null);
      } catch (e) {
        console.error(e);
        setError('No se pudo cargar la información del técnico.');
      } finally {
        setLoading(false);
      }
    };
    run();
  }, [id]);

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!data) return <Alert severity="info">Técnico no encontrado</Alert>;

  const disponibilidad = (data.disponibilidad_tabla ?? data.disponibilidad_calculada) ? 'Disponible' : 'Ocupado';

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Técnico: {data.nombre_usuario}
      </Typography>
      <Button variant="outlined" sx={{ mb: 3 }} onClick={() => navigate('/tecnicos')}>Volver al listado</Button>

      {/* Datos personales */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>Datos personales</Typography>
        <Typography><strong>Nombre:</strong> {data.nombre_usuario}</Typography>
        <Typography><strong>Correo:</strong> {data.correo_usuario}</Typography>
        <Typography><strong>ID Técnico:</strong> {data.id_tecnico}</Typography>
        <Chip size="small" label={`Disponibilidad: ${disponibilidad}`} color={disponibilidad === 'Disponible' ? 'success' : 'warning'} sx={{ mt: 1 }} />
      </Paper>

      {/* Carga de trabajo */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>Carga de trabajo</Typography>
        {Array.isArray(data.carga_trabajo) && data.carga_trabajo.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {data.carga_trabajo.map((r, idx) => (
              <Chip key={idx} label={`${r.estado}: ${r.total}`} />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Sin tickets asignados</Typography>
        )}
      </Paper>

      {/* Especialidades */}
      <Paper sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" color="primary" gutterBottom>Especialidades</Typography>
        {Array.isArray(data.especialidades) && data.especialidades.length > 0 ? (
          <Grid container spacing={1}>
            {data.especialidades.map((e) => (
              <Grid item key={e.id_especialidad} xs={12} sm={6} md={4}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">{e.nombre}</Typography>
                  {e.descripcion && <Typography variant="body2" color="text.secondary">{e.descripcion}</Typography>}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">No se registran especialidades</Typography>
        )}
      </Paper>
    </Container>
  );
}
