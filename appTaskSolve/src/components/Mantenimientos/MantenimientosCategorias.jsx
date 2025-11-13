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
    <Box sx={{ width: '100%', py: 4 }}>
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

      {/* Renderizar solo el formulario (CreateCategoria incluye su propio Paper cuando está embedded) */}
      <Box>
        <CreateCategoria
          embedded
          hideEmbeddedHeader
          onCreated={() => setTimeout(() => navigate('/categorias'), 800)}
        />
      </Box>
    </Box>
  );
}
