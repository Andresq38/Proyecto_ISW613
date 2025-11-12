import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Box,
  Button,
  Container,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
  Snackbar,
  Alert,
  CircularProgress,
  Tooltip,
  Autocomplete,
  Divider,
  Chip,
  Fade,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveRoundedIcon from '@mui/icons-material/SaveRounded';
import CancelRoundedIcon from '@mui/icons-material/CancelRounded';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import CategoryOutlinedIcon from '@mui/icons-material/CategoryOutlined';
import FlagOutlinedIcon from '@mui/icons-material/FlagOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { getApiOrigin } from '../../utils/apiBase';
import { formatDate } from '../../utils/format';

// Usuario solicitante fijo mientras no hay autenticación
const CURRENT_USER = '1-1343-0736';

export default function CreateTicket() {
  const navigate = useNavigate();
  const apiBase = useMemo(() => `${getApiOrigin()}/apiticket`, []);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [showSuccessOverlay, setShowSuccessOverlay] = useState(false);

  const [prioridades, setPrioridades] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [categoriaPreview, setCategoriaPreview] = useState(null);

  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    prioridad: 'Media',
    id_usuario: CURRENT_USER,
    id_etiqueta: ''
  });
  const [usuarioInfo, setUsuarioInfo] = useState(null);
  const [fechaCreacion] = useState(() => new Date());
  const [touched, setTouched] = useState({});

  const errors = {
    titulo: !form.titulo?.trim() ? 'Requerido' : '',
    descripcion: !form.descripcion?.trim() ? 'Requerido' : '',
    id_etiqueta: !form.id_etiqueta ? 'Seleccione una etiqueta' : '',
  };
  const isValid = !errors.titulo && !errors.descripcion && !errors.id_etiqueta;

  const prioridadColor = (p) => {
    switch (p) {
      case 'Alta': return 'error';
      case 'Media': return 'warning';
      case 'Baja': return 'info';
      default: return 'default';
    }
  };

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setError('');
        // Cargar prioridades, etiquetas y usuario solicitante
        const [pRes, eRes, uRes] = await Promise.all([
          axios.get(`${apiBase}/ticket/prioridades`, { signal: controller.signal }),
          axios.get(`${apiBase}/etiqueta`, { signal: controller.signal }),
          axios.get(`${apiBase}/usuario/${CURRENT_USER}`, { signal: controller.signal })
        ]);
        setPrioridades(Array.isArray(pRes.data) ? pRes.data : []);
        setEtiquetas(Array.isArray(eRes.data) ? eRes.data : (eRes.data?.data || []));
        // Normalizar usuario
        const u = uRes?.data;
        if (u && (u.id_usuario || u.nombre)) {
          setUsuarioInfo({
            id: u.id_usuario ?? CURRENT_USER,
            nombre: u.nombre ?? 'Usuario',
            correo: u.correo ?? '—'
          });
        }
      } catch (e) {
        if (e.name !== 'AbortError' && e.code !== 'ERR_CANCELED') {
          setError(e.response?.data?.error || e.message || 'Error al cargar datos iniciales');
        }
      }
    }
    load();
    return () => controller.abort();
  }, [apiBase]);

  // Al elegir etiqueta, obtenemos la categoría asociada para mostrarla (optimizado vía endpoint directo)
  useEffect(() => {
    const controller = new AbortController();
    async function fetchCategoria() {
      setCategoriaPreview(null);
      if (!form.id_etiqueta) return;
      try {
        const res = await axios.get(`${apiBase}/categoria_ticket/getCategoriaByEtiqueta/${form.id_etiqueta}`, { signal: controller.signal });
        const cat = res?.data || null;
        if (cat?.id_categoria) {
          setCategoriaPreview({ id_categoria: cat.id_categoria, nombre: cat.nombre });
        }
      } catch (e) {
        // silencioso
      }
    }
    fetchCategoria();
    return () => controller.abort();
  }, [form.id_etiqueta, apiBase]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const markTouched = (name) => setTouched((t) => ({ ...t, [name]: true }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!isValid) {
      setSnackbar({ open: true, message: 'Completa los campos requeridos', severity: 'warning' });
      setTouched({ titulo: true, descripcion: true, id_etiqueta: true });
      return;
    }
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      const res = await axios.post(`${apiBase}/ticket`, {
        titulo: form.titulo,
        descripcion: form.descripcion,
        prioridad: form.prioridad,
        id_usuario: form.id_usuario,
        id_etiqueta: form.id_etiqueta ? Number(form.id_etiqueta) : undefined
      });
      const created = res?.data;
      const idTicket = created?.id_ticket;
      if (!idTicket) {
        throw new Error('No se recibió el ID del ticket creado');
      }

  const successMessage = `Ticket ${idTicket} creado exitosamente`;
      setSuccess(successMessage);
      setSnackbar({ open: true, message: successMessage, severity: 'success' });
      setShowSuccessOverlay(true);
      // Redirigir al inicio principal después de un breve delay
      setTimeout(() => {
        navigate('/', { state: { toast: successMessage, refresh: true, id: idTicket }, replace: true });
      }, 1500);
    } catch (e) {
      const msg = e.response?.data?.message || e.response?.data?.error || e.message || 'Error al crear el ticket';
      setError(msg);
      setSnackbar({ open: true, message: msg, severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
    <Container maxWidth="lg" sx={{ py: 5, position: 'relative' }}>
      {/* Encabezado estilizado */}
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Box>
          <Typography variant="h4" sx={{ fontWeight: 700 }}>Crear Nuevo Ticket</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            Complete el formulario para registrar su solicitud
          </Typography>
        </Box>
  <Button variant="text" onClick={() => navigate('/mantenimientos')} startIcon={<ArrowBackIcon />}>Volver</Button>
      </Box>

      {/* Formulario principal */}
      <Paper
        elevation={3}
        sx={{
          p: 4,
          borderRadius: 3,
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #ffffff 0%, #f5f9ff 60%)',
          border: '1px solid #e0e7ef',
        }}
      >
        {/* Ribbon Prioridad */}
        <Chip
          label={`Prioridad: ${form.prioridad}`}
          color={prioridadColor(form.prioridad)}
          size="small"
          sx={{ position: 'absolute', top: 12, right: 12, fontWeight: 600 }}
          icon={<FlagOutlinedIcon />}
        />

        <form onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Título"
                name="titulo"
                value={form.titulo}
                onChange={handleChange}
                onBlur={() => markTouched('titulo')}
                required
                error={Boolean(touched.titulo && errors.titulo)}
                helperText={touched.titulo && errors.titulo}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                select
                fullWidth
                label="Prioridad"
                name="prioridad"
                value={form.prioridad}
                onChange={handleChange}
                InputProps={{ startAdornment: <FlagOutlinedIcon sx={{ mr: 1, color: prioridadColor(form.prioridad) + '.main' }} /> }}
              >
                {prioridades.map((p) => (
                  <MenuItem key={p} value={p}>{p}</MenuItem>
                ))}
              </TextField>
            </Grid>

            <Grid item xs={12}>
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Descripción"
                name="descripcion"
                value={form.descripcion}
                onChange={handleChange}
                onBlur={() => markTouched('descripcion')}
                required
                error={Boolean(touched.descripcion && errors.descripcion)}
                helperText={touched.descripcion && errors.descripcion}
                InputProps={{
                  startAdornment: <DescriptionOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />,
                }}
              />
            </Grid>

            <Grid item xs={12}>
              <Autocomplete
                options={etiquetas}
                loading={etiquetas.length === 0}
                // Mostrar texto completo de la etiqueta; si no hay nombre, mostrar solo id
                getOptionLabel={(opt) => {
                  if (!opt) return '';
                  const obj = typeof opt === 'object' ? opt : etiquetas.find((e) => String(e.id_etiqueta) === String(opt)) || {};
                  const id = obj.id_etiqueta ?? obj.id ?? '';
                  const name = obj.nombre ?? obj.label ?? obj.etiqueta ?? '';
                  return name ? `${id} - ${name}` : String(id ?? '');
                }}
                renderOption={(props, option) => (
                  <li {...props} key={option.id_etiqueta ?? option.id} style={{ whiteSpace: 'normal', wordWrap: 'break-word' }}>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 1, py: 1 }}>
                      <LabelOutlinedIcon sx={{ color: 'primary.main', flexShrink: 0, mt: 0.5 }} />
                      <Typography variant="body2" sx={{ lineHeight: 1.6 }}>
                        {`${option.id_etiqueta ?? option.id} - ${option.nombre ?? option.label ?? ''}`}
                      </Typography>
                    </Box>
                  </li>
                )}
                ListboxProps={{
                  style: { maxHeight: '400px' }
                }}
                slotProps={{
                  paper: {
                    sx: {
                      width: '600px',
                      maxWidth: '90vw',
                      '& .MuiAutocomplete-listbox': {
                        '& .MuiAutocomplete-option': {
                          minHeight: '56px',
                          alignItems: 'flex-start'
                        }
                      }
                    }
                  }
                }}
                onChange={(_, val) => setForm((f) => ({ ...f, id_etiqueta: val?.id_etiqueta || '' }))}
                renderInput={(params) => {
                  const selectedEtiqueta = etiquetas.find((e) => String(e.id_etiqueta) === String(form.id_etiqueta));
                  const displayText = selectedEtiqueta 
                    ? `${selectedEtiqueta.id_etiqueta} - ${selectedEtiqueta.nombre || ''}`
                    : '';
                  
                  return (
                    <TextField
                      {...params}
                      label="Etiqueta"
                      required
                      onBlur={() => markTouched('id_etiqueta')}
                      error={Boolean(touched.id_etiqueta && errors.id_etiqueta)}
                      helperText={touched.id_etiqueta && errors.id_etiqueta || (displayText ? displayText : '')}
                      InputProps={{
                        ...params.InputProps,
                        startAdornment: <LabelOutlinedIcon sx={{ mr: 1, color: 'primary.main' }} />
                      }}
                    />
                  );
                }}
                value={etiquetas.find((e) => String(e.id_etiqueta) === String(form.id_etiqueta)) || null}
                isOptionEqualToValue={(o, v) => String(o.id_etiqueta) === String(v.id_etiqueta)}
              />
            </Grid>

            <Grid item xs={12} md={6}>
              <Tooltip title="Se deriva automáticamente según la etiqueta elegida" placement="top">
                <TextField
                  fullWidth
                  label="Categoría (derivada)"
                  value={categoriaPreview ? `${categoriaPreview.id_categoria} - ${categoriaPreview.nombre}` : ''}
                  InputProps={{
                    readOnly: true,
                    startAdornment: <CategoryOutlinedIcon sx={{ mr: 1, color: categoriaPreview ? 'success.main' : 'text.disabled' }} />
                  }}
                  placeholder="Se mostrará al elegir una etiqueta"
                />
              </Tooltip>
            </Grid>

            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Usuario solicitante"
                value={usuarioInfo ? usuarioInfo.nombre : ''}
                InputProps={{
                  readOnly: true,
                  startAdornment: <PersonOutlineIcon sx={{ mr: 1, color: 'primary.main' }} />
                }}
                helperText={usuarioInfo?.correo ? usuarioInfo.correo : ''}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Fecha de creación"
                value={formatDate(fechaCreacion)}
                InputProps={{ readOnly: true }}
              />
            </Grid>

            <Grid item xs={12}>
              <Divider sx={{ my: 1 }} />
              <Fade in timeout={500}>
                <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', justifyContent: 'flex-end', mt: 2 }}>
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={loading || !isValid}
                    startIcon={!loading ? <SaveRoundedIcon /> : null}
                    sx={{ minWidth: 180, fontWeight: 600 }}
                  >
                    {loading ? <CircularProgress size={20} /> : 'Guardar Ticket'}
                  </Button>
                  <Button
                    variant="outlined"
                    color="inherit"
                    onClick={() => navigate('/tickets', { replace: true })}
                    startIcon={<CancelRoundedIcon />}
                    sx={{ minWidth: 140 }}
                  >
                    Cancelar
                  </Button>
                </Box>
              </Fade>
            </Grid>
          </Grid>
        </form>
      </Paper>

      {/* Overlay de éxito */}
      {showSuccessOverlay && (
        <Fade in={showSuccessOverlay}>
          <Box sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0,0,0,0.35)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: (theme) => theme.zIndex.modal + 1
          }}>
            <Paper elevation={6} sx={{ p: 4, borderRadius: 3, textAlign: 'center', minWidth: 320 }}>
              <Typography variant="h6" sx={{ fontWeight: 700, mb: 1 }}>Ticket creado exitosamente</Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>Redirigiendo...</Typography>
              <CircularProgress size={32} />
            </Paper>
          </Box>
        </Fade>
      )}
    </Container>
    <Snackbar
      open={snackbar.open}
      autoHideDuration={3500}
      onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
    >
      <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
        {snackbar.message}
      </Alert>
    </Snackbar>
    </>
  );
}
