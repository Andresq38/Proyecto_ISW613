import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Grid, Paper, Divider, Typography, FormControl, TextField, MenuItem, InputAdornment, Button, Snackbar, Alert, Autocomplete,
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
import TecnicoService from '../../services/TecnicoService';

const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:81';

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
    .required('La contraseña es requerida')
    .min(6, 'La contraseña debe tener al menos 6 caracteres')
    .max(50, 'La contraseña no puede exceder 50 caracteres'),
  disponibilidad: yup.boolean().required('Debe seleccionar la disponibilidad'),
  especialidad: yup.mixed().required('Debe seleccionar una especialidad'),
  carga_trabajo: yup.number().min(0, 'La carga debe ser 0 o mayor').required(),
});

export default function CreateTecnico() {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      id_usuario: '', nombre: '', correo: '', password: '', disponibilidad: true, especialidad: null, carga_trabajo: 0,
    }, resolver: yupResolver(schema),
  });
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [successOpen, setSuccessOpen] = useState(false);
  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const espRes = await fetch(`${apiBase}/apiticket/especialidad`, { signal: abort.signal });
        setEspecialidades(await espRes.json());
      } catch (_) { }
    })();
    return () => abort.abort();
  }, []);
  const onSubmit = async (v) => {
    try {
      const payload = {
        id_usuario: v.id_usuario, 
        nombre: v.nombre, 
        correo: v.correo, 
        password: v.password,
        disponibilidad: v.disponibilidad ? 1 : 0,
        carga_trabajo: v.carga_trabajo || 0,
        especialidades: v.especialidad ? [v.especialidad.id_especialidad] : [],
      };
      const { data } = await TecnicoService.createTecnico(payload);
      if (data?.id_tecnico) {
        setSuccessOpen(true);
        // reset form for next creation
        // Using react-hook-form reset? Simpler: window scroll & optional manual clearing via navigate if desired.
        window.scrollTo(0,0);
      } else {
        setSnackbar({ open: true, message: 'Respuesta inválida del servidor', severity: 'warning' });
      }
    } catch (err) {
      setSnackbar({ open: true, message: err?.message || 'Error al guardar el técnico', severity: 'error' });
    }
  };
  const onError = () => setSnackbar({ open: true, message: 'Revisa los campos requeridos', severity: 'warning' });
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>Crear Nuevo Técnico</Typography>
          <Typography variant="body2" color="text.secondary">Complete el formulario para registrar un nuevo técnico</Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
      </Box>
      <Paper elevation={2} sx={{ p: 3, borderTop: 4, borderTopColor: 'primary.main', borderRadius: 2 }}>
        <SuccessOverlay
          open={successOpen}
          mode="create"
          entity="Técnico"
          onClose={() => setSuccessOpen(false)}
          actions={[
            { label: 'Crear otro', onClick: () => { setSuccessOpen(false); }, variant: 'contained', color: 'success' },
            { label: 'Ir al listado', onClick: () => { setSuccessOpen(false); navigate('/tecnicos'); }, variant: 'outlined', color: 'success' }
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
                    helperText={errors.id_usuario ? errors.id_usuario.message : 'Ingrese la cédula con formato: #-####-####'} 
                    InputProps={{ 
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
                    label="Contraseña" 
                    type="password" 
                    error={Boolean(errors.password)} 
                    helperText={errors.password ? errors.password.message : 'Mínimo 6 caracteres'} 
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
                    helperText="Se inicializa en 0 para nuevos técnicos"
                    disabled
                  />
                )} />
              </FormControl>
            </Grid>
          </Grid>
          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ m: 0 }}>Guardar Técnico</Button>
            <Button variant="outlined" onClick={() => navigate('/tecnicos')} sx={{ m: 0 }}>Cancelar</Button>
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


