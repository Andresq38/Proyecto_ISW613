import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { 
  Container, Typography, CircularProgress, Box, Alert, 
  TextField, Button, Paper, Chip, Grid, Rating, 
  Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, Select, MenuItem, Snackbar
} from '@mui/material';
import StarIcon from '@mui/icons-material/Star';
import ChangeCircleIcon from '@mui/icons-material/ChangeCircle';
// Se removieron iconos de carga/eliminación de imágenes para modo solo lectura
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import { getApiOrigin } from '../../utils/apiBase';

export default function DetalleTicket() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Estados para el diálogo de cambio de estado
  const [openDialog, setOpenDialog] = useState(false);
  const [nuevoEstado, setNuevoEstado] = useState('');
  const [observaciones, setObservaciones] = useState('');
  const [estadosDisponibles, setEstadosDisponibles] = useState([]);
  const [loadingEstados, setLoadingEstados] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });


  const getApiBase = () => getApiOrigin();

  useEffect(() => {
    const fetchTicket = async () => {
      const apiBase = getApiBase();
      try {
        // Use the endpoint that returns the ticket with related objects (usuario, tecnico, categoria, sla, etiquetas)
        const res = await axios.get(`${apiBase}/apiticket/ticket/getTicketCompletoById/${id}`);
        // API returns the ticket object directly in res.data
        setTicket(res.data || null);
      } catch (err) {
        console.error(err);
        setError('No se pudo cargar la información del ticket.');
      } finally {
        setLoading(false);
      }
    };
    fetchTicket();
  }, [id]);

  const fetchEstados = async () => {
    setLoadingEstados(true);
    try {
      const apiBase = getApiBase();
      const res = await axios.get(`${apiBase}/apiticket/estado`);
      const estados = Array.isArray(res.data) ? res.data : (res.data?.data || []);
      setEstadosDisponibles(estados);
    } catch (err) {
      console.error('Error al cargar estados:', err);
      setSnackbar({ open: true, message: 'Error al cargar estados disponibles', severity: 'error' });
    } finally {
      setLoadingEstados(false);
    }
  };

  const handleOpenDialog = () => {
    fetchEstados();
    setNuevoEstado(ticket?.id_estado || '');
    setObservaciones('');
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setNuevoEstado('');
    setObservaciones('');
  };

  const handleCambiarEstado = async () => {
    if (!nuevoEstado) {
      setSnackbar({ open: true, message: 'Por favor selecciona un estado', severity: 'warning' });
      return;
    }

    try {
      const apiBase = getApiBase();
      const response = await axios.post(`${apiBase}/apiticket/ticket/cambiarEstado`, {
        id_ticket: parseInt(id),
        id_estado: parseInt(nuevoEstado),
        observaciones: observaciones || null
      });

      if (response.data.success) {
        setSnackbar({ open: true, message: 'Estado actualizado correctamente', severity: 'success' });
        handleCloseDialog();
        
        // Recargar el ticket para reflejar los cambios
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } else {
        setSnackbar({ open: true, message: response.data.message || 'Error al actualizar estado', severity: 'error' });
      }
    } catch (err) {
      console.error('Error al cambiar estado:', err);
      setSnackbar({ open: true, message: 'Error al cambiar el estado del ticket', severity: 'error' });
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // Se removieron manejadores de carga de imágenes para modo solo lectura

  if (loading) return <Box textAlign="center" mt={5}><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  // If API returned no ticket
  if (!ticket) return <Alert severity="info">Ticket no encontrado.</Alert>;

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Detalles del Ticket #{ticket.id_ticket}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Volver al Inicio
        </Button>
        <Button 
          variant="contained" 
          color="primary"
          startIcon={<ChangeCircleIcon />}
          onClick={handleOpenDialog}
          disabled={ticket?.estado?.nombre === 'Cerrado'}
        >
          Cambiar Estado
        </Button>
      </Box>

      {/* Alerta SLA Prominente */}
      {ticket?.sla?.tiempo_restante && ticket?.estado?.nombre !== 'Cerrado' && (() => {
        const slaText = ticket.sla.tiempo_restante;
        const match = slaText.match(/(-?\d+)h/);
        if (!match) return null;
        
        const horas = parseInt(match[1]);
        let urgencyConfig;
        
        if (horas < 0) {
          urgencyConfig = { 
            severity: 'error', 
            title: '⚠️ SLA VENCIDO', 
            color: '#d32f2f',
            bgColor: '#ffebee',
            message: `Este ticket ha excedido su tiempo SLA por ${Math.abs(horas)} horas. Requiere atención inmediata.`
          };
        } else if (horas <= 2) {
          urgencyConfig = { 
            severity: 'error', 
            title: '🚨 SLA CRÍTICO', 
            color: '#d32f2f',
            bgColor: '#ffe0e0',
            message: `Solo quedan ${horas} horas para cumplir con el SLA. Acción urgente requerida.`
          };
        } else if (horas <= 4) {
          urgencyConfig = { 
            severity: 'warning', 
            title: '⚡ SLA URGENTE', 
            color: '#f57c00',
            bgColor: '#fff3e0',
            message: `Quedan ${horas} horas para el vencimiento del SLA. Prioridad alta.`
          };
        } else if (horas <= 24) {
          urgencyConfig = { 
            severity: 'warning', 
            title: '⏰ SLA PRÓXIMO A VENCER', 
            color: '#ed6c02',
            bgColor: '#fff8e1',
            message: `El SLA vence en ${horas} horas. Mantener seguimiento.`
          };
        }

        if (!urgencyConfig) return null;

        return (
          <Alert 
            severity={urgencyConfig.severity}
            icon={false}
            sx={{ 
              mb: 3, 
              p: 3,
              bgcolor: urgencyConfig.bgColor,
              borderLeft: `6px solid ${urgencyConfig.color}`,
              '& .MuiAlert-message': {
                width: '100%'
              }
            }}
          >
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 700, 
                mb: 1,
                color: urgencyConfig.color
              }}
            >
              {urgencyConfig.title}
            </Typography>
            <Typography variant="body1" sx={{ mb: 1 }}>
              {urgencyConfig.message}
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', mt: 2 }}>
              <Chip 
                label={`Tiempo restante: ${slaText}`}
                sx={{ 
                  bgcolor: 'white',
                  fontWeight: 600,
                  borderLeft: `3px solid ${urgencyConfig.color}`
                }}
              />
              <Chip 
                label={`SLA: ${ticket.sla?.nombre || 'N/A'}`}
                variant="outlined"
              />
              <Chip 
                label={`Prioridad: ${ticket.prioridad || 'N/A'}`}
                color={ticket.prioridad === 'Alta' ? 'error' : ticket.prioridad === 'Media' ? 'warning' : 'default'}
              />
            </Box>
          </Alert>
        );
      })()}

      {/* Información General */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Información General</Typography>
        <Typography><strong>Título:</strong> {ticket.titulo}</Typography>
        <Typography><strong>Descripción:</strong> {ticket.descripcion}</Typography>
        <Typography><strong>Prioridad:</strong> {ticket.prioridad}</Typography>
        <Typography><strong>Estado:</strong> {ticket.estado?.nombre || 'N/A'}</Typography>
        <Typography><strong>Fecha creación:</strong> {ticket.fecha_creacion}</Typography>
        <Typography><strong>Fecha cierre:</strong> {ticket.fecha_cierre || 'No cerrado'}</Typography>
      </Paper>

      {/* Métricas de SLA y Cumplimiento */}
      <Paper sx={{ p: 3, mb: 4, bgcolor: '#f0f7ff', border: '2px solid #2196f3' }}>
        <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <AccessTimeIcon />
          Métricas de SLA y Cumplimiento
        </Typography>

        {ticket.sla ? (
          <Grid container spacing={3} sx={{ mt: 1 }}>
            {/* Columna 1: Información del SLA */}
            <Grid item xs={12} md={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  Nivel de SLA
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {ticket.sla.nombre || 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  SLA Respuesta
                </Typography>
                <Typography variant="body1">
                  {ticket.sla.tiempo_respuesta_min && ticket.sla.tiempo_respuesta_max 
                    ? `${ticket.sla.tiempo_respuesta_min} - ${ticket.sla.tiempo_respuesta_max} minutos`
                    : 'N/A'}
                </Typography>
              </Box>

              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  SLA de Resolución
                </Typography>
                <Typography variant="body1">
                  {ticket.sla.tiempo_resolucion_min && ticket.sla.tiempo_resolucion_max 
                    ? `${ticket.sla.tiempo_resolucion_min} - ${ticket.sla.tiempo_resolucion_max} minutos (${(ticket.sla.tiempo_resolucion_max / 60).toFixed(1)}h)`
                    : 'N/A'}
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                  Tiempo Restante SLA
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600, color: ticket.sla.tiempo_restante?.includes('-') ? 'error.main' : 'success.main' }}>
                  {ticket.sla.tiempo_restante || 'N/A'}
                </Typography>
              </Box>
            </Grid>

            {/* Columna 2: Métricas de Cumplimiento */}
            <Grid item xs={12} md={6}>
              {(() => {
                // Calcular días de resolución
                const fechaCreacion = new Date(ticket.fecha_creacion);
                const fechaFin = ticket.fecha_cierre ? new Date(ticket.fecha_cierre) : new Date();
                const diasResolucion = Math.floor((fechaFin - fechaCreacion) / (1000 * 60 * 60 * 24));
                const horasResolucion = Math.floor((fechaFin - fechaCreacion) / (1000 * 60 * 60));
                const minutosTranscurridos = Math.floor((fechaFin - fechaCreacion) / (1000 * 60));

                // Calcular cumplimiento de respuesta (asumimos que la primera entrada en historial es la respuesta)
                const tiempoRespuestaMax = ticket.sla.tiempo_respuesta_max || 0;
                const primeraRespuesta = ticket.historial_estados && ticket.historial_estados.length > 0 
                  ? ticket.historial_estados[0] 
                  : null;
                
                let cumplimientoRespuesta = 'Pendiente';
                if (primeraRespuesta) {
                  const fechaRespuesta = new Date(primeraRespuesta.fecha_cambio);
                  const minutosHastaRespuesta = Math.floor((fechaRespuesta - fechaCreacion) / (1000 * 60));
                  cumplimientoRespuesta = minutosHastaRespuesta <= tiempoRespuestaMax ? 'Cumplido' : 'No Cumplido';
                }

                // Calcular cumplimiento de resolución
                const tiempoResolucionMax = ticket.sla.tiempo_resolucion_max || 0;
                let cumplimientoResolucion = 'En Proceso';
                
                if (ticket.estado?.nombre === 'Resuelto' || ticket.estado?.nombre === 'Cerrado') {
                  cumplimientoResolucion = minutosTranscurridos <= tiempoResolucionMax ? 'Cumplido' : 'No Cumplido';
                } else if (minutosTranscurridos > tiempoResolucionMax) {
                  cumplimientoResolucion = 'Vencido';
                }

                return (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                        Días de Resolución
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {diasResolucion} {diasResolucion === 1 ? 'día' : 'días'} ({horasResolucion}h)
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {ticket.fecha_cierre ? 'Ticket cerrado' : 'En curso'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                        Cumplimiento de Respuesta
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={cumplimientoRespuesta}
                          color={
                            cumplimientoRespuesta === 'Cumplido' ? 'success' : 
                            cumplimientoRespuesta === 'No Cumplido' ? 'error' : 
                            'default'
                          }
                          icon={cumplimientoRespuesta === 'Cumplido' ? <CheckCircleIcon /> : 
                                cumplimientoRespuesta === 'No Cumplido' ? <ErrorIcon /> : 
                                <AccessTimeIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="subtitle2" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
                        Cumplimiento de Resolución
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip 
                          label={cumplimientoResolucion}
                          color={
                            cumplimientoResolucion === 'Cumplido' ? 'success' : 
                            cumplimientoResolucion === 'No Cumplido' || cumplimientoResolucion === 'Vencido' ? 'error' : 
                            'warning'
                          }
                          icon={cumplimientoResolucion === 'Cumplido' ? <CheckCircleIcon /> : 
                                (cumplimientoResolucion === 'No Cumplido' || cumplimientoResolucion === 'Vencido') ? <ErrorIcon /> : 
                                <AccessTimeIcon />}
                          sx={{ fontWeight: 600 }}
                        />
                      </Box>
                      {cumplimientoResolucion === 'En Proceso' && (
                        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
                          Tiempo transcurrido: {Math.floor(minutosTranscurridos / 60)}h {minutosTranscurridos % 60}m
                        </Typography>
                      )}
                    </Box>
                  </>
                );
              })()}
            </Grid>
          </Grid>
        ) : (
          <Alert severity="info" sx={{ mt: 2 }}>
            No hay información de SLA disponible para este ticket.
          </Alert>
        )}
      </Paper>

      {/* Valoración del Servicio */}
      {(ticket.puntaje || ticket.comentario) && (
        <Paper sx={{ p: 3, mb: 4, bgcolor: '#f8f9fa', border: '2px solid #e3f2fd' }}>
          <Typography variant="h6" color="primary" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <StarIcon sx={{ color: '#ffc107' }} />
            Valoración del Servicio
          </Typography>
          
          {ticket.puntaje && (
            <Box sx={{ mb: 2 }}>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Calificación:
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Rating 
                  value={parseInt(ticket.puntaje) || 0} 
                  readOnly 
                  size="large"
                  precision={1}
                  emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                />
                <Typography variant="h6" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  {ticket.puntaje}/5
                </Typography>
              </Box>
            </Box>
          )}

          {ticket.comentario && (
            <Box>
              <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
                Comentario del cliente:
              </Typography>
              <Paper sx={{ p: 2, bgcolor: 'white', borderLeft: '4px solid #1976d2' }} elevation={0}>
                <Typography variant="body1" sx={{ fontStyle: 'italic', color: 'text.primary' }}>
                  "{ticket.comentario}"
                </Typography>
              </Paper>
            </Box>
          )}

          {!ticket.puntaje && !ticket.comentario && (
            <Alert severity="info" sx={{ mt: 1 }}>
              Este ticket aún no ha sido valorado por el cliente.
            </Alert>
          )}
        </Paper>
      )}

      {/* Usuario Afectado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Usuario Afectado</Typography>
        <Typography><strong>Nombre:</strong> {ticket.usuario?.nombre || ''}</Typography>
        <Typography><strong>Correo:</strong> {ticket.usuario?.correo || ''}</Typography>
        <Typography><strong>ID Usuario:</strong> {ticket.usuario?.id_usuario || ''}</Typography>
      </Paper>

      {/* Técnico Asignado */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Técnico Asignado</Typography>
        <Typography><strong>Nombre:</strong> {ticket.tecnico?.nombre_usuario || 'No asignado'}</Typography>
        <Typography><strong>Correo:</strong> {ticket.tecnico?.correo_usuario || 'No asignado'}</Typography>
        <Typography><strong>ID Técnico:</strong> {ticket.tecnico?.id_tecnico || 'N/A'}</Typography>
      </Paper>

      {/* Categoría */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Categoría</Typography>
        <Typography><strong>Descripción:</strong> {ticket.categoria?.nombre || 'N/A'}</Typography>
        <Typography><strong>ID Categoría:</strong> {ticket.categoria?.id_categoria || 'N/A'}</Typography>
      </Paper>

      {/* Etiquetas */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Etiquetas Asociadas</Typography>
        {ticket.etiquetas?.length > 0 ? (
          <Grid container direction="column" spacing={1} sx={{ mt: 1 }}>
            {ticket.etiquetas
              .slice()
              .sort((a, b) => (a?.id_etiqueta ?? a?.id ?? 0) - (b?.id_etiqueta ?? b?.id ?? 0))
              .map((et) => {
              const id = et?.id_etiqueta ?? et?.id ?? '';
              const descripcion = et?.etiqueta ?? et?.nombre ?? et?.label ?? 'Descripción no disponible';
              const key = id || descripcion;
              return (
                <Grid item xs={12} key={key}>
                  <Paper sx={{ bgcolor: 'white', color: '#000000ff', p: 2 }} elevation={2}>
                    <Typography variant="subtitle2">ID etiqueta: {id}</Typography>
                    <Typography variant="body2">Descripción: {descripcion}</Typography>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        ) : (
          <Typography>No hay etiquetas asociadas</Typography>
        )}
      </Paper>

      {/* Historial de estados */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Historial de estados</Typography>
        {Array.isArray(ticket.historial_estados) && ticket.historial_estados.length > 0 ? (
          <Grid container spacing={2}>
            {ticket.historial_estados.map((h) => (
              <Grid item xs={12} key={h.id_historial}>
                <Paper sx={{ p: 2 }}>
                  <Typography variant="subtitle2">{h.estado} — {h.fecha_cambio}</Typography>
                  {h.observaciones && (
                    <Typography variant="body2" color="text.secondary">{h.observaciones}</Typography>
                  )}
                  {/* Imágenes asociadas a este item de historial */}
                  {ticket.imagenes_por_historial?.[h.id_historial]?.length > 0 && (
                    <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 1 }}>
                      {ticket.imagenes_por_historial[h.id_historial].map((img) => (
                        <Box key={img.id_imagen} component="img" src={img.url} alt={`img-${img.id_imagen}`} sx={{ width: 120, height: 90, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }} />
                      ))}
                    </Box>
                  )}
                </Paper>
              </Grid>
            ))}
          </Grid>
        ) : (
          <Typography color="text.secondary">Sin historial</Typography>
        )}
      </Paper>

      {/* Imágenes del ticket (solo lectura) */}
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" color="primary" gutterBottom>Imágenes adjuntas al ticket</Typography>
        {Array.isArray(ticket.imagenes) && ticket.imagenes.length > 0 ? (
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {ticket.imagenes.map((img) => (
              <Box key={img.id_imagen} component="img" src={img.url} alt={`ticket-img-${img.id_imagen}`} sx={{ width: 140, height: 100, objectFit: 'cover', borderRadius: 1, border: '1px solid #eee' }} />
            ))}
          </Box>
        ) : (
          <Typography color="text.secondary">Sin imágenes adjuntas</Typography>
        )}
      </Paper>

      {/* Comentarios (solo lectura) */}
      {Array.isArray(ticket.comentarios) && ticket.comentarios.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Typography variant="h6" color="primary" gutterBottom>Comentarios</Typography>
          <Grid container spacing={2}>
            {ticket.comentarios.map((c, idx) => (
              <Grid item xs={12} key={c.id_comentario || idx}>
                <Paper sx={{ p: 2 }} elevation={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    {c.autor || 'Usuario'} — {c.fecha || ''}
                  </Typography>
                  <Typography variant="body1">{c.texto || c.comentario || ''}</Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Paper>
      )}

      {/* Diálogo para cambiar estado */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ bgcolor: 'primary.main', color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
          <ChangeCircleIcon />
          Cambiar Estado del Ticket
        </DialogTitle>
        <DialogContent sx={{ mt: 3 }}>
          <FormControl fullWidth sx={{ mb: 3 }}>
            <InputLabel id="estado-select-label">Nuevo Estado</InputLabel>
            <Select
              labelId="estado-select-label"
              value={nuevoEstado}
              label="Nuevo Estado"
              onChange={(e) => setNuevoEstado(e.target.value)}
              disabled={loadingEstados}
            >
              {estadosDisponibles.map((estado) => (
                <MenuItem key={estado.id_estado} value={estado.id_estado}>
                  {estado.nombre}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            multiline
            minRows={4}
            label="Observaciones"
            placeholder="Ingresa observaciones sobre el cambio de estado (opcional)"
            value={observaciones}
            onChange={(e) => setObservaciones(e.target.value)}
          />

          <Alert severity="info" sx={{ mt: 2 }}>
            Este cambio se registrará en el historial del ticket con la fecha y hora actual.
          </Alert>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleCloseDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={handleCambiarEstado} 
            variant="contained" 
            color="primary"
            disabled={!nuevoEstado}
          >
            Confirmar Cambio
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar para notificaciones */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
