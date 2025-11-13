import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Grid, Paper, Divider, Typography, FormControl, TextField, MenuItem, InputAdornment, Button, Snackbar, Alert, Autocomplete, CircularProgress, Breadcrumbs, Link,
} from '@mui/material';
import SuccessOverlay from '../common/SuccessOverlay';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import EditIcon from '@mui/icons-material/Edit';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import TecnicoService from '../../services/TecnicoService';

const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:81';

// Schema de validación (password opcional en edición)
const schema = yup.object({
  id_usuario: yup.string()
    .required('La cédula es requerida')
    .matches(/^[0-9]-[0-9]{4}-[0-9]{4}$/, 'Formato inválido. Use: #-####-####'),
  nombre: yup.string()
    .required('El nombre completo es requerido')
    .min(3, 'El nombre debe tener al menos 3 caracteres')
    .max(150, 'El nombre no puede exceder 150 caracteres')
    .matches(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, 'El nombre solo debe contener letras y espacios')
    .test('dos-palabras', 'Debe ingresar nombre y apellido (mínimo 2 palabras)', value => {
      if (!value) return false;
      const palabras = value.trim().split(/\s+/);
      return palabras.length >= 2 && palabras.every(p => p.length > 0);
    }),
  correo: yup.string()
    .required('El correo electrónico es requerido')
    .email('Debe ser un correo electrónico válido')
    .matches(/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, 'Formato de correo inválido'),
  password: yup.string()
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres')
    .optional(),
  disponibilidad: yup.boolean().required('Debe seleccionar la disponibilidad'),
  especialidad: yup.mixed().required('Debe seleccionar una especialidad'),
  carga_trabajo: yup.number().min(0, 'La carga debe ser 0 o mayor').optional(),
});

export default function EditTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      id_usuario: '', nombre: '', correo: '', password: '', disponibilidad: true, especialidad: null, carga_trabajo: 0,
    }, resolver: yupResolver(schema),
  });
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [successOpen, setSuccessOpen] = useState(false);

  // Cargar datos del técnico y catálogos
  useEffect(() => {
    let isMounted = true;
    (async () => {
      try {
        setLoading(true);
        // Cargar catálogos y datos del técnico en paralelo
        const [espRes, tecnicoRes] = await Promise.all([
          fetch(`${apiBase}/apiticket/especialidad`),
          TecnicoService.getTecnicoById(id),
        ]);

        const especialidadesData = await espRes.json();
        
        // Debug: Ver qué devuelve la API
        console.log('Respuesta completa de la API:', tecnicoRes.data);
        
        // La respuesta de axios viene en tecnicoRes.data
        // Verificar si la respuesta es un array o un objeto directo
        const tecnicoData = Array.isArray(tecnicoRes.data) 
          ? (tecnicoRes.data.length > 0 ? tecnicoRes.data[0] : null)
          : tecnicoRes.data;

        console.log('Datos del técnico procesados:', tecnicoData);

        if (!isMounted) return;

        setEspecialidades(especialidadesData);

        // Verificar si se encontró el técnico
        if (!tecnicoData) {
          setLoadError('No se encontró el técnico');
          setLoading(false);
          return;
        }

        // Precargar datos del técnico en el formulario
        if (tecnicoData) {
          // Obtener la primera especialidad (selección única)
          const especialidadTecnico = Array.isArray(tecnicoData.especialidades) && tecnicoData.especialidades.length > 0
            ? tecnicoData.especialidades[0]
            : null;

          reset({
            id_usuario: tecnicoData.id_usuario || '',
            nombre: tecnicoData.nombre_usuario || tecnicoData.nombre || '',
            correo: tecnicoData.correo_usuario || tecnicoData.correo || '',
            password: '', // Dejar vacío en edición
            disponibilidad: tecnicoData.disponibilidad === 1 || tecnicoData.disponibilidad === true,
            especialidad: especialidadTecnico,
            carga_trabajo: tecnicoData.carga_trabajo || 0,
          });
        }

        if (isMounted) {
          setLoading(false);
        }
      } catch (err) {
        console.error('Error al cargar datos:', err);
        if (isMounted) {
          setLoadError('Error al cargar los datos del técnico');
          setLoading(false);
        }
      }
    })();
    return () => { isMounted = false; };
  }, [id, reset]);

  const onSubmit = async (v) => {
    try {
      console.log('Datos del formulario antes de enviar:', v);
      const payload = {
        id_tecnico: parseInt(id),
        id_usuario: v.id_usuario,
        nombre: v.nombre,
        correo: v.correo,
        disponibilidad: v.disponibilidad ? 1 : 0,
        especialidades: v.especialidad ? [v.especialidad.id_especialidad] : [],
      };
      console.log('Payload a enviar:', payload);

      // Solo incluir password si se proporcionó
      if (v.password && v.password.trim()) {
        payload.password = v.password;
      }

      const { data } = await TecnicoService.updateTecnico(payload);
      
      if (data?.id_tecnico || data) {
        setSuccessOpen(true);
      } else {
        setSnackbar({ open: true, message: 'Respuesta inválida del servidor', severity: 'warning' });
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      setSnackbar({ open: true, message: err?.response?.data?.error || err?.message || 'Error al actualizar el técnico', severity: 'error' });
    }
  };

  const onError = () => setSnackbar({ open: true, message: 'Revisa los campos requeridos', severity: 'warning' });

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 400 }}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (loadError) {
    return (
      <Box sx={{ textAlign: 'center', mt: 4 }}>
        <Alert severity="error" sx={{ mb: 2 }}>{loadError}</Alert>
        <Button variant="outlined" onClick={() => navigate('/tecnicos')}>Volver al listado</Button>
      </Box>
    );
  }

  return (
    <>
      {/* Breadcrumb */}
      <Breadcrumbs 
        separator={<NavigateNextIcon fontSize="small" />} 
        sx={{ mb: 2 }}
      >
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/'); }}
        >
          Inicio
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/mantenimientos'); }}
        >
          Mantenimientos
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate('/tecnicos'); }}
        >
          Técnicos
        </Link>
        <Link 
          underline="hover" 
          color="inherit" 
          href="#" 
          onClick={(e) => { e.preventDefault(); navigate(`/tecnicos/${id}`); }}
        >
          Detalle
        </Link>
        <Typography color="warning.main" sx={{ display: 'flex', alignItems: 'center', gap: 0.5, fontWeight: 600 }}>
          <EditIcon fontSize="small" />
          Editar
        </Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>Editar Técnico</Typography>
          <Typography variant="body2" color="text.secondary">Actualice la información del técnico</Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
      </Box>
      <Paper elevation={2} sx={{ p: 3, borderTop: 4, borderTopColor: 'warning.main', borderRadius: 2, bgcolor: 'background.paper', position: 'relative' }}>
        <SuccessOverlay
          open={successOpen}
          mode="update"
          entity="Técnico"
          onClose={() => setSuccessOpen(false)}
          actions={[
            { label: 'Ver detalle', onClick: () => { setSuccessOpen(false); navigate(`/tecnicos/${id}`); }, variant: 'contained', color: 'info' },
            { label: 'Ir al listado', onClick: () => { setSuccessOpen(false); navigate('/tecnicos'); }, variant: 'outlined', color: 'info' }
          ]}
        />
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>Datos personales</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="id_usuario" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="id_usuario" 
                    label="Cédula (ID Usuario)" 
                    placeholder="1-2345-6789" 
                    error={Boolean(errors.id_usuario)} 
                    helperText={errors.id_usuario ? errors.id_usuario.message : 'Campo de solo lectura - No editable'} 
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: (<InputAdornment position="start"><BadgeIcon color="action" /></InputAdornment>) 
                    }} 
                  />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="nombre" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="nombre" 
                    label="Nombre Completo" 
                    placeholder="Juan Pérez González"
                    error={Boolean(errors.nombre)} 
                    helperText={errors.nombre ? errors.nombre.message : 'Ingrese nombre y apellido(s) completos'} 
                    InputProps={{ 
                      startAdornment: (<InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>) 
                    }} 
                  />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="correo" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="correo" 
                    label="Correo Electrónico" 
                    type="email" 
                    error={Boolean(errors.correo)} 
                    helperText={errors.correo ? errors.correo.message : 'Ej: usuario@empresa.com'} 
                    placeholder="usuario@empresa.com" 
                    InputProps={{ 
                      startAdornment: (<InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>) 
                    }} 
                  />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="password" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="password" 
                    label="Nueva Contraseña (opcional)" 
                    type="password" 
                    error={Boolean(errors.password)} 
                    helperText={errors.password ? errors.password.message : 'Dejar en blanco para mantener la contraseña actual'} 
                    InputProps={{ 
                      startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>) 
                    }} 
                  />
                )} />
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>Datos técnicos</Typography>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="disponibilidad" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="disponibilidad" 
                    label="Estado de Disponibilidad" 
                    select 
                    value={field.value ? 'true' : 'false'} 
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                    helperText="Indica si el técnico está disponible para recibir tickets"
                  >
                    <MenuItem value="true">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> Disponible
                      </Box>
                    </MenuItem>
                    <MenuItem value="false">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HighlightOffIcon color="warning" fontSize="small" /> No Disponible
                      </Box>
                    </MenuItem>
                  </TextField>
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="especialidad" control={control} render={({ field }) => (
                  <Autocomplete 
                    id="especialidad" 
                    options={Array.isArray(especialidades) ? especialidades : []} 
                    getOptionLabel={(o) => o.nombre || ''} 
                    value={field.value} 
                    onChange={(_, v) => field.onChange(v)} 
                    isOptionEqualToValue={(o, v) => o.id_especialidad === v.id_especialidad} 
                    renderInput={(params) => (
                      <TextField 
                        {...params} 
                        label="Especialidad" 
                        error={Boolean(errors.especialidad)} 
                        helperText={errors.especialidad ? errors.especialidad.message : 'Seleccione una especialidad'} 
                      />
                    )} 
                  />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="carga_trabajo" control={control} render={({ field }) => (
                  <TextField 
                    {...field} 
                    id="carga_trabajo" 
                    label="Carga Actual" 
                    type="number" 
                    InputProps={{ 
                      readOnly: true,
                      startAdornment: (<InputAdornment position="start"><AssignmentIcon color="action" /></InputAdornment>) 
                    }} 
                    helperText="Campo de solo lectura"
                    disabled
                  />
                )} />
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ m: 0 }}>Actualizar Técnico</Button>
            <Button variant="outlined" onClick={() => navigate(`/tecnicos/${id}`)} sx={{ m: 0 }}>Cancelar</Button>
          </Box>
        </form>
      </Paper>
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))} variant="filled" sx={{ width: '100%', fontSize: '1rem' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
