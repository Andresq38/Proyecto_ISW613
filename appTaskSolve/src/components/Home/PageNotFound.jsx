import React from 'react';
import { Box, Typography, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
//import errorImage from '../../assets/error.jpg'; // Asegúrate de tener esta imagen

const PageNotFound = () => {
  const navigate = useNavigate();

  return (
    <Box textAlign="center" py={5}>
      <Box sx={{ width: 200, height: 150, bgcolor: '#f0f0f0', mx: 'auto', mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 1 }}>
        <Typography color="text.secondary">404</Typography>
      </Box>
      <Typography variant="h4" gutterBottom>404 - Página no encontrada</Typography>
      <Button variant="contained" onClick={() => navigate('/')}>Volver al Inicio</Button>
    </Box>
  );
};

export default PageNotFound;
