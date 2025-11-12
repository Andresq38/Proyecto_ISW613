import React from 'react';
import { Container, Typography, Box, Paper, Button, Stack } from '@mui/material';
import FolderSpecialIcon from '@mui/icons-material/FolderSpecial';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CreateCategoria from '../Categorias/CreateCategoria';
import { useNavigate } from 'react-router-dom';

// Vista de mantenimiento simplificada: solo formulario de creación
export default function MantenimientosCategorias() {
  const navigate = useNavigate();
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Encabezado estilo mantenimiento profesional */}
      <Box sx={{ mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
        <Stack direction="row" spacing={1} alignItems="center">
          <FolderSpecialIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>Crear Nueva Categoría</Typography>
            <Typography variant="body2" color="text.secondary">Complete el formulario para registrar la categoría</Typography>
          </Box>
        </Stack>
        <Button startIcon={<ArrowBackIcon />} variant="text" onClick={() => navigate(-1)} sx={{ fontWeight: 600 }}>
          Volver
        </Button>
      </Box>

      {/* Contenedor del formulario */}
      <Paper elevation={3} sx={{ p: { xs: 2, md: 3 }, borderRadius: 3, borderTop: 6, borderTopColor: 'primary.main' }}>
        <CreateCategoria
          embedded
          hideEmbeddedHeader
          onCreated={() => setTimeout(() => navigate('/categorias'), 800)}
        />
      </Paper>
    </Container>
  );
}
