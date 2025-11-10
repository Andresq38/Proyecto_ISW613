import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Chip, Box, CircularProgress, Alert, Avatar, Button } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiOrigin } from '../../utils/apiBase';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';

// Centralizado
const getApiBase = () => getApiOrigin();

export default function TecnicosList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError('');
        const apiBase = getApiBase();
        
        const res = await axios.get(`${apiBase}/apiticket/tecnico`, { 
          signal: controller.signal 
        });
        
        console.log('Datos de técnicos:', res.data); // Para debug
        
        // Manejar diferentes formatos de respuesta
        const tecnicosData = Array.isArray(res.data) ? res.data : (res.data?.data || []);
        setItems(tecnicosData);
      } catch (e) {
        if (e.name !== 'AbortError' && e.code !== 'ERR_CANCELED') {
          console.error('Error al cargar técnicos:', e);
          setError(e.response?.data?.error || e.message || 'Error al cargar técnicos');
        }
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          👨‍💻 Técnicos
        </Typography>
        //Botón para crear técnico//
        <Button variant="contained" color="primary" onClick={() => navigate('/tecnicos/crear') }>
          Crear técnico
        </Button>
      </Box>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
          <CircularProgress size={60} />
        </Box>
      )}
      
      {!!error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {!loading && !error && items.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          No hay técnicos para mostrar.
        </Alert>
      )}

      <Grid container spacing={3}>
        {items.map((t) => {
          const ticketsAbiertos = parseInt(t.tickets_abiertos) || 0;
          const chipColor = ticketsAbiertos > 2 ? 'error' : (ticketsAbiertos > 0 ? 'warning' : 'success');
          
          return (
            <Grid item xs={12} sm={6} md={4} key={t.id_tecnico}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  }
                }} 
                onClick={() => navigate(`/tecnicos/${t.id_tecnico}`)}
              >
                <CardContent sx={{ p: 3 }}>
                  {/* Avatar y nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 56, 
                        height: 56,
                        mr: 2 
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600, lineHeight: 1.2 }}>
                        {t.nombre}
                      </Typography>
                      <Chip 
                        label={`ID: ${t.id_tecnico}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ mt: 0.5 }}
                      />
                    </Box>
                  </Box>

                  {/* Correo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ wordBreak: 'break-word' }}>
                      {t.correo}
                    </Typography>
                  </Box>

                  {/* Tickets abiertos */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <AssignmentIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                      <Typography variant="body2" color="text.secondary">
                        Carga de trabajo:
                      </Typography>
                    </Box>
                    <Chip 
                      label={ticketsAbiertos} 
                      color={chipColor} 
                      size="small"
                      sx={{ fontWeight: 700 }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
