import React, { useEffect, useState } from 'react';
import { Container, Typography, Grid, Card, CardContent, Chip, Box, CircularProgress, Alert, Avatar, Button, Divider, Dialog, DialogTitle, DialogContent, DialogActions, IconButton, Tooltip, Snackbar } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { getApiOrigin } from '../../utils/apiBase';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';
import AssignmentIcon from '@mui/icons-material/Assignment';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import WarningIcon from '@mui/icons-material/Warning';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import SuccessOverlay from '../common/SuccessOverlay';

// Centralizado
const getApiBase = () => getApiOrigin();

export default function TecnicosList() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteMode, setDeleteMode] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [targetTecnico, setTargetTecnico] = useState(null);
  const [showDeleteSuccess, setShowDeleteSuccess] = useState(false);
  const [deletedInfo, setDeletedInfo] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });
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
        // Ordenar ascendente por id_tecnico para mostrar en lista
        const sorted = (tecnicosData || []).slice().sort((a, b) => {
          const ai = (a?.id_tecnico ?? a?.id) || 0;
          const bi = (b?.id_tecnico ?? b?.id) || 0;
          return Number(ai) - Number(bi);
        });
        setItems(sorted);
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

  const requestDelete = (tecnico) => {
    setTargetTecnico(tecnico);
    setConfirmOpen(true);
  };

  const confirmDelete = async () => {
    if (!targetTecnico) return;
    const t = targetTecnico;
    setConfirmOpen(false);
    setTargetTecnico(null);
    try {
      const apiBase = getApiBase();
      await axios.delete(`${apiBase}/apiticket/tecnico/${t.id_tecnico}`);
      setItems(prev => prev.filter(x => x.id_tecnico !== t.id_tecnico));
      setDeletedInfo(t);
      setShowDeleteSuccess(true);
    } catch (err) {
      console.error('Error eliminando técnico:', err);
      setSnackbar({ open: true, message: err?.response?.data?.error || err?.message || 'No se pudo eliminar', severity: 'error' });
    }
  };

  const closeOverlay = () => {
    setShowDeleteSuccess(false);
    setDeletedInfo(null);
  };

  return (
    <Container sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Typography variant="h4" gutterBottom sx={{ fontWeight: 700, color: 'text.primary' }}>
          👨‍💻 Técnicos
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" size="small" onClick={() => navigate('/tecnicos/crear')}>Nuevo</Button>
          <Button
            size="small"
            variant={deleteMode ? 'contained' : 'outlined'}
            color="error"
            startIcon={<DeleteForeverIcon />}
            onClick={() => setDeleteMode(v => !v)}
          >
            {deleteMode ? 'Cancelar' : 'Eliminar'}
          </Button>
        </Box>
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
          const disponibleCalculada = ticketsAbiertos < 5;
          const cargaColor = ticketsAbiertos >= 5 ? 'error' : (ticketsAbiertos >= 3 ? 'warning' : 'success');
          const cargaLabel = ticketsAbiertos >= 5 ? 'Saturado' : (ticketsAbiertos >= 3 ? 'Ocupado' : 'Disponible');
          
          return (
            <Grid item xs={12} sm={6} md={4} key={t.id_tecnico}>
              <Card 
                elevation={3}
                sx={{ 
                  height: '100%',
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
                onClick={() => { if (!deleteMode) navigate(`/tecnicos/${t.id_tecnico}`); }}
              >
                <CardContent sx={{ 
                  p: 2.5, 
                  flex: 1,
                  display: 'flex', 
                  flexDirection: 'column',
                  '&:last-child': { pb: 2.5 }
                }}>
                  {/* Avatar y nombre */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: 'primary.main', 
                        width: 52, 
                        height: 52,
                        mr: 1.5,
                        flexShrink: 0
                      }}
                    >
                      <PersonIcon sx={{ fontSize: 28 }} />
                    </Avatar>
                    <Box sx={{ 
                      flex: 1, 
                      minWidth: 0,
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 0.5
                    }}>
                      <Typography 
                        variant="h6" 
                        sx={{ 
                          fontWeight: 600, 
                          lineHeight: 1.3, 
                          fontSize: '1rem'
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
                          height: 20, 
                          fontSize: '0.7rem', 
                          alignSelf: 'flex-start',
                          '& .MuiChip-label': { px: 1, py: 0 } 
                        }}
                      />
                    </Box>
                    {deleteMode && (
                      <Tooltip title={`Eliminar técnico #${t.id_tecnico}`}> 
                        <IconButton color="error" size="small" onClick={(e) => { e.stopPropagation(); requestDelete(t); }}>
                          <DeleteForeverIcon />
                        </IconButton>
                      </Tooltip>
                    )}
                  </Box>

                  {/* Correo */}
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, minHeight: 24 }}>
                    <EmailIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18, flexShrink: 0 }} />
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      noWrap 
                      sx={{ 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis', 
                        flex: 1, 
                        fontSize: '0.813rem'
                      }} 
                      title={t.correo || ''}
                    >
                      {t.correo || '—'}
                    </Typography>
                  </Box>

                  <Divider sx={{ my: 1.5 }} />

                  {/* Disponibilidad */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5, minHeight: 28 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.813rem'
                      }}
                    >
                      {disponibleCalculada ? (
                        <CheckCircleIcon sx={{ fontSize: 16, mr: 0.5, color: 'success.main', flexShrink: 0 }} />
                      ) : (
                        <WarningIcon sx={{ fontSize: 16, mr: 0.5, color: 'warning.main', flexShrink: 0 }} />
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
                        minWidth: 90, 
                        height: 24, 
                        fontSize: '0.7rem',
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  </Box>

                  {/* Tickets abiertos */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', minHeight: 28 }}>
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        fontSize: '0.813rem'
                      }}
                    >
                      <AssignmentIcon sx={{ fontSize: 16, mr: 0.5, flexShrink: 0 }} />
                      Tickets abiertos:
                    </Typography>
                    <Chip 
                      label={ticketsAbiertos} 
                      color={ticketsAbiertos > 0 ? 'info' : 'default'}
                      size="small"
                      variant="outlined"
                      sx={{ 
                        fontWeight: 600, 
                        minWidth: 40, 
                        height: 24, 
                        fontSize: '0.75rem',
                        '& .MuiChip-label': { px: 1.5 }
                      }}
                    />
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
      {/* Diálogo confirmación */}
      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar eliminación</DialogTitle>
        <DialogContent>
          ¿Seguro que deseas eliminar el técnico #{targetTecnico?.id_tecnico}? Esta acción es permanente.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button color="error" variant="contained" onClick={confirmDelete}>Eliminar</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        message={snackbar.message}
      />

      <SuccessOverlay
        open={showDeleteSuccess}
        mode="delete"
        entity="Técnico"
        subtitle={`El técnico #${deletedInfo?.id_tecnico} ha sido eliminado correctamente.`}
        onClose={closeOverlay}
        actions={[{
          label: 'Cerrar',
          onClick: closeOverlay,
          variant: 'contained',
          color: 'error'
        }, {
          label: 'Crear Técnico',
          onClick: () => { closeOverlay(); navigate('/tecnicos/crear'); },
          variant: 'outlined',
          color: 'error'
        }]}
      />
    </Container>
  );
}
