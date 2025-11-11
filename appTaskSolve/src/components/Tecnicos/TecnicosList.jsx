import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Chip, Box, CircularProgress, Alert, Avatar, Button, Divider } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiOrigin } from '../../utils/apiBase';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';

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
        <Button variant="contained" color="primary" onClick={() => navigate('/tecnicos/crear')}>
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
          // Disponibilidad calculada basada en carga (< 5 tickets = disponible)
          const disponibleCalculada = ticketsAbiertos < 5;
          
          // Color según carga de trabajo
          const cargaColor = ticketsAbiertos >= 5 ? 'error' : (ticketsAbiertos >= 3 ? 'warning' : 'success');
          const cargaLabel = ticketsAbiertos >= 5 ? 'Saturado' : (ticketsAbiertos >= 3 ? 'Ocupado' : 'Disponible');
          
          return (
            <Grid item xs={12} sm={6} md={4} key={t.id_tecnico}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
                  minHeight: 270,
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  borderTop: `4px solid`,
                  borderTopColor: disponibleCalculada ? 'success.main' : 'warning.main',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 6,
                  },
                  display: 'flex',
                  flexDirection: 'column'
                }} 
                onClick={() => navigate(`/tecnicos/${t.id_tecnico}`)}
              >
                <CardContent sx={{ 
                  p: 3, 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:last-child': { pb: 3 }
                }}>
                  {/* Avatar y nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2.5, height: 64 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 56, 
                        height: 56,
                        mr: 2,
                        flexShrink: 0
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 32 }} />
                    </Avatar>
                    <Box sx={{ 
                      flex: 1, 
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'center',
                      height: '100%'
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          lineHeight: 1.4, 
                          fontSize: '1.125rem',
                          mb: 0.75
                        }} 
                        noWrap 
                        title={t.nombre}
                      >
                        {t.nombre}
                      </Typography>
                      <Chip 
                        label={`ID: ${t.id_tecnico}`} 
                        size="small" 
                        color="primary" 
                        variant="outlined"
                        sx={{ 
                          height: 22, 
                          fontSize: '0.7rem', 
                          alignSelf: 'flex-start',
                          '& .MuiChip-label': { px: 1.5, py: 0 } 
                        }}
                      />
                    </Box>
                  </Box>

                  {/* Correo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2.5, height: 28 }}>
                    <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20, flexShrink: 0 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap 
                      sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        flex: 1, 
                        fontSize: '0.875rem', 
                        lineHeight: 1.75
                      }} 
                      title={t.correo || ''}
                    >
                      {t.correo || '—'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 2 }} />

                  {/* Disponibilidad */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, height: 32 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.875rem', 
                        lineHeight: 2,
                        height: '100%'
                      }}
                    >
                      {disponibleCalculada ? (
                        <CheckCircleIcon sx={{ fontSize: 18, mr: 0.5, color: 'success.main', flexShrink: 0 }} />
                      ) : (
                        <WarningIcon sx={{ fontSize: 18, mr: 0.5, color: 'warning.main', flexShrink: 0 }} />
                      )}
                      Disponibilidad:
                    </Typography>
                    <Chip 
                      label={cargaLabel}
                      color={cargaColor}
                      size="small"
                      variant="filled"
                      sx={{ 
                        fontWeight: 600, 
                        width: 95, 
                        height: 26, 
                        fontSize: '0.75rem', 
                        flexShrink: 0,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
                    />
                  </Box>

                  {/* Tickets abiertos */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 32 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.875rem', 
                        lineHeight: 2,
                        height: '100%'
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 18, mr: 0.5, flexShrink: 0 }} />
                      Tickets abiertos:
                    </Typography>
                    <Chip 
                      label={ticketsAbiertos} 
                      color={ticketsAbiertos > 0 ? 'info' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 600, 
                        width: 45, 
                        height: 26, 
                        fontSize: '0.75rem', 
                        flexShrink: 0,
                        '& .MuiChip-label': {
                          px: 1.5
                        }
                      }}
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
