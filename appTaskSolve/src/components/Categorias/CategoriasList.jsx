import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Alert,
  CircularProgress,
  Chip,
  Box,
  Avatar
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import CategoryIcon from '@mui/icons-material/Category';
import TimerIcon from '@mui/icons-material/Timer';
import LabelIcon from '@mui/icons-material/Label';

const CategoriasList = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Detección dinámica de la API base
  const getApiBase = () => {
    const envApiBase = import.meta.env.VITE_API_BASE;
    if (envApiBase) return envApiBase;
    
    const currentUrl = window.location.origin;
    if (currentUrl.includes(':5173') || currentUrl.includes(':3000')) {
      return 'http://localhost';
    }
    return currentUrl;
  };

  useEffect(() => {
    const fetchCategorias = async () => {
      try {
        const apiBase = getApiBase();
        const response = await axios.get(`${apiBase}/apiticket/categoria_ticket`);
        
        console.log('Datos de categorías:', response.data); // Para debug
        
        // Manejar diferentes formatos de respuesta
        const categoriasData = Array.isArray(response.data) ? response.data : (response.data?.data || []);
        setCategorias(categoriasData);
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar categorías:', err);
        const status = err.response?.status || 'desconocido';
        setError(`Error al cargar categorías. Código de estado: ${status}`);
        setLoading(false);
      }
    };

    fetchCategorias();
  }, []);

  const handleCategoriaClick = (idCategoria) => {
    navigate(`/categorias/${idCategoria}`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <Box sx={{ textAlign: 'center' }}>
          <CircularProgress size={60} />
          <Typography variant="body1" sx={{ mt: 2, color: 'text.secondary' }}>
            Cargando categorías...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
        📁 Categorías de Tickets
      </Typography>

      {categorias.length === 0 ? (
        <Alert severity="info">No hay categorías disponibles.</Alert>
      ) : (
        <Grid container spacing={3}>
          {categorias.map((cat) => (
            <Grid item xs={12} sm={6} md={4} key={cat.id_categoria}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6
                  }
                }}
                onClick={() => handleCategoriaClick(cat.id_categoria)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Avatar y nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 48, 
                        height: 48,
                        mr: 2 
                      }}
                    >
                      <CategoryIcon />
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          color: 'text.primary',
                          lineHeight: 1.3,
                          mb: 0.5
                        }}
                      >
                        {cat.nombre}
                      </Typography>
                      <Chip 
                        label={`ID: ${cat.id_categoria}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                      />
                    </Box>
                  </Box>

                  {/* SLA */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <TimerIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary">
                      {cat.sla_nombre}
                    </Typography>
                  </Box>

                  {/* Etiquetas */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LabelIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Etiquetas:
                      </Typography>
                    </Box>
                    <Chip 
                      label={cat.num_etiquetas}
                      color="secondary"
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}
    </Container>
  );
};

export default CategoriasList;
