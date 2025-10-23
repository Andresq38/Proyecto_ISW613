import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Button,
  Box,
  Chip,
  Grid,
  Divider,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import LabelIcon from '@mui/icons-material/Label';
import SchoolIcon from '@mui/icons-material/School';
import TimerIcon from '@mui/icons-material/Timer';
import { getApiOrigin } from '../../utils/apiBase';

const CategoriaDetalle = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [categoria, setCategoria] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getApiBase = () => getApiOrigin();

  useEffect(() => {
    const fetchCategoria = async () => {
      try {
        const apiBase = getApiBase();
        const response = await axios.get(`${apiBase}/apiticket/categoria_ticket/${id}`);
        
        if (response.data && response.data.data) {
          setCategoria(response.data.data);
        } else {
          setError('Categoría no encontrada');
        }
        setLoading(false);
      } catch (err) {
        console.error('Error al cargar categoría:', err);
        const status = err.response?.status || 'desconocido';
        setError(`Error al cargar categoría. Código de estado: ${status}`);
        setLoading(false);
      }
    };

    fetchCategoria();
  }, [id]);

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando categoría...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/categorias')}
          sx={{ mt: 2 }}
        >
          Volver a Categorías
        </Button>
      </Container>
    );
  }

  if (!categoria) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="warning">Categoría no encontrada</Alert>
        <Button 
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/categorias')}
          sx={{ mt: 2 }}
        >
          Volver a Categorías
        </Button>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Button 
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/categorias')}
        sx={{ mb: 3 }}
      >
        Volver a Categorías
      </Button>

      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600 }}>
        {categoria.nombre}
      </Typography>

      {/* Información del SLA */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <TimerIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              Acuerdo de Nivel de Servicio (SLA)
            </Typography>
          </Box>
          <Divider sx={{ mb: 2 }} />
          
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="body1" sx={{ mb: 1 }}>
                <strong>Nivel:</strong> {categoria.sla_nombre}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tiempo de Respuesta
                </Typography>
                <Typography variant="body2">
                  {categoria.tiempo_respuesta_min} - {categoria.tiempo_respuesta_max} horas
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Tiempo de Resolución
                </Typography>
                <Typography variant="body2">
                  {categoria.tiempo_resolucion_min} - {categoria.tiempo_resolucion_max} horas
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Grid container spacing={3}>
        {/* Etiquetas */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <LabelIcon sx={{ mr: 1, color: 'secondary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Etiquetas
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {categoria.etiquetas && categoria.etiquetas.length > 0 ? (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {categoria.etiquetas.map((etiqueta) => (
                    <Chip 
                      key={etiqueta.id_etiqueta}
                      label={etiqueta.nombre}
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay etiquetas asociadas a esta categoría.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* Especialidades */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <SchoolIcon sx={{ mr: 1, color: 'primary.main' }} />
                <Typography variant="h6" sx={{ fontWeight: 600 }}>
                  Especialidades Requeridas
                </Typography>
              </Box>
              <Divider sx={{ mb: 2 }} />
              
              {categoria.especialidades && categoria.especialidades.length > 0 ? (
                <List dense>
                  {categoria.especialidades.map((esp) => (
                    <ListItem key={esp.id_especialidad} sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={esp.nombre}
                        primaryTypographyProps={{ 
                          variant: 'body2',
                          sx: { fontWeight: 500 }
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No hay especialidades asociadas a esta categoría.
                </Typography>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default CategoriaDetalle;
