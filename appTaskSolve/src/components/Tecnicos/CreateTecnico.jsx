import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Grid, Paper, Divider, Typography, FormControl, TextField, MenuItem, InputAdornment, Button, Snackbar, Alert, Autocomplete,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import AssignmentIcon from '@mui/icons-material/Assignment';
import SecurityIcon from '@mui/icons-material/Security';

const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:81';

const schema = yup.object({
  id_rol: yup.number()
    .min(1, 'Debe seleccionar un rol')
    .required('Debe seleccionar un rol'),
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
  disponibilidad: yup.boolean().when('id_rol', {
    is: (id_rol) => id_rol === 2,
    then: yup.boolean().required('Debe seleccionar la disponibilidad'),
    otherwise: yup.boolean(),
  }),
  especialidad: yup.mixed().when('id_rol', {
    is: (id_rol) => id_rol === 2,
    then: yup.mixed().required('Debe seleccionar una especialidad'),
    otherwise: yup.mixed(),
  }),
  carga_trabajo: yup.number(),
});

export default function CreateTecnico() {
  const navigate = useNavigate();
  const { control, handleSubmit, formState: { errors }, watch } = useForm({
    defaultValues: {
      id_rol: 0,
      id_usuario: '',
      nombre: '',
      correo: '',
      password: '',
      disponibilidad: true,
      especialidad: null,
      carga_trabajo: 0,
    },
    resolver: yupResolver(schema),
  });

  const [roles, setRoles] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  
  const selectedRol = watch('id_rol');
  const isTecnico = selectedRol === 2;

  useEffect(() => {
    const abort = new AbortController();
    (async () => {
      try {
        const rolesRes = await fetch(`${apiBase}/apiticket/rol`, { signal: abort.signal });
        setRoles(await rolesRes.json());
        
        const espRes = await fetch(`${apiBase}/apiticket/especialidad`, { signal: abort.signal });
        setEspecialidades(await espRes.json());
      } catch (_) {}
    })();
    return () => abort.abort();
  }, []);

  const onSubmit = async (v) => {
    // Por ahora solo mostramos un mensaje
    console.log('Formulario (sin guardar):', v);
    setSnackbar({ open: true, message: 'Datos capturados (guardado deshabilitado por ahora)', severity: 'info' });
  };

  const onError = () => setSnackbar({ open: true, message: 'Revisa los campos requeridos', severity: 'warning' });

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>Crear Nuevo Usuario</Typography>
          <Typography variant="body2" color="text.secondary">Complete el formulario para registrar un nuevo usuario o técnico</Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, borderTop: 4, borderTopColor: 'primary.main', borderRadius: 2 }}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
          {/* SECCIÓN: Datos de Usuario */}
          <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>Datos de usuario</Typography>
          <Grid container spacing={3}>
            {/* Rol */}
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="id_rol" control={control} render={({ field }) => (
                  <TextField
                    {...field}
                    id="id_rol"
                    label="Rol"
                    select
                    value={field.value || 0}
                    onChange={(e) => {
                      const val = parseInt(e.target.value, 10);
                      field.onChange(val > 0 ? val : 0);
                    }}
                    error={Boolean(errors.id_rol)}
                    helperText={errors.id_rol ? errors.id_rol.message : 'Seleccione el rol del usuario'}
                    InputProps={{
                      startAdornment: (<InputAdornment position="start"><SecurityIcon color="action" /></InputAdornment>)
                    }}
                  >
                    <MenuItem value={0}>-- Seleccionar Rol --</MenuItem>
                    {Array.isArray(roles) && roles.map(role => (
                      <MenuItem key={role.id_rol} value={role.id_rol}>
                        {role.descripcion}
                      </MenuItem>
                    ))}
                  </TextField>
                )} />
              </FormControl>
            </Grid>

            {/* Cédula */}
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

            {/* Nombre */}
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

            {/* Correo */}
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

            {/* Contraseña */}
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

          {/* SECCIÓN: Datos Técnicos (solo si rol = 2) */}
          {isTecnico && (
            <>
              <Divider sx={{ my: 3 }} />
              <Typography variant="h6" sx={{ mt: 1, mb: 2, fontWeight: 700 }}>Datos técnicos</Typography>
              <Grid container spacing={3}>
                {/* Disponibilidad */}
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

                {/* Especialidad */}
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

                {/* Carga Actual */}
                <Grid item xs={12} md={6}>
                  <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                    <Controller name="carga_trabajo" control={control} render={({ field }) => (
                      <TextField
                        {...field}
                        id="carga_trabajo"
                        label="Carga Actual"
                        type="number"
                        value={0}
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
            </>
          )}

          <Divider sx={{ my: 3 }} />
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
            <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ m: 0 }}>
              Guardar
            </Button>
            <Button variant="outlined" onClick={() => navigate(-1)} sx={{ m: 0 }}>
              Cancelar
            </Button>
          </Box>
        </form>
      </Paper>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar(s => ({ ...s, open: false }))}
          variant="filled"
          sx={{ width: '100%', fontSize: '1rem' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}


