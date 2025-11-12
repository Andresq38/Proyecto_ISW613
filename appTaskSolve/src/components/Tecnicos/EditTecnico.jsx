import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Box, Grid, Paper, Divider, Typography, FormControl, TextField, MenuItem, InputAdornment, Button, Snackbar, Alert, Autocomplete, CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TecnicoService from '../../services/TecnicoService';

const apiBase = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_API_BASE) || 'http://localhost:81';

// Schema de validación (password opcional en edición)
const schema = yup.object({
  id_usuario: yup.string().required('La cédula es requerida').matches(/^[0-9]-[0-9]{4}-[0-9]{4}$/, 'Formato: #-####-####'),
  nombre: yup.string().required('El nombre es requerido').min(3, 'Mínimo 3 caracteres').max(150, 'Máximo 150 caracteres'),
  correo: yup.string().email('Debe ser un correo válido').required('El correo es requerido'),
  password: yup.string().min(6, 'Mínimo 6 caracteres').optional(),
  disponibilidad: yup.boolean().required(),
  especialidades: yup.array().of(yup.mixed()).min(1, 'Seleccione al menos una especialidad'),
});

export default function EditTecnico() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    defaultValues: {
      id_usuario: '', nombre: '', correo: '', password: '', disponibilidad: true, especialidades: [],
    }, resolver: yupResolver(schema),
  });
  const [especialidades, setEspecialidades] = useState([]);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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
          // Mapear especialidades del técnico (pueden venir como array de IDs o array de objetos)
          const especialidadesTecnico = Array.isArray(tecnicoData.especialidades)
            ? tecnicoData.especialidades.map(e => 
                typeof e === 'object' ? e : especialidadesData.find(esp => esp.id_especialidad === e)
              ).filter(Boolean)
            : [];

          reset({
            id_usuario: tecnicoData.id_usuario || '',
            nombre: tecnicoData.nombre_usuario || tecnicoData.nombre || '',
            correo: tecnicoData.correo_usuario || tecnicoData.correo || '',
            password: '', // Dejar vacío en edición
            disponibilidad: tecnicoData.disponibilidad === 1 || tecnicoData.disponibilidad === true,
            especialidades: especialidadesTecnico,
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
        especialidades: (v.especialidades || []).map(e => e.id_especialidad),
      };
      console.log('Payload a enviar:', payload);

      // Solo incluir password si se proporcionó
      if (v.password && v.password.trim()) {
        payload.password = v.password;
      }

      const { data } = await TecnicoService.updateTecnico(payload);
      
      if (data?.id_tecnico || data) {
        setSnackbar({ open: true, message: 'Técnico actualizado correctamente', severity: 'success' });
        setTimeout(() => navigate(`/tecnicos/${id}`), 1000);
      } else {
        setSnackbar({ open: true, message: 'Respuesta inválida del servidor', severity: 'warning' });
      }
    } catch (err) {
      console.error('Error al actualizar:', err);
      setSnackbar({ open: true, message: err?.response?.data?.error || err?.message || 'Error al actualizar', severity: 'error' });
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
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>Editar Técnico</Typography>
          <Typography variant="body2" color="text.secondary">Actualice la información del técnico</Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
      </Box>
      <Paper elevation={2} sx={{ p: 3, borderTop: 4, borderTopColor: 'warning.main', borderRadius: 2 }}>
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
                    helperText={errors.id_usuario ? errors.id_usuario.message : 'Formato: #-####-####'} 
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
                  <TextField {...field} id="nombre" label="Nombre Completo" error={Boolean(errors.nombre)} helperText={errors.nombre ? errors.nombre.message : ''} InputProps={{ startAdornment: (<InputAdornment position="start"><PersonIcon color="action" /></InputAdornment>) }} />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="correo" control={control} render={({ field }) => (
                  <TextField {...field} id="correo" label="Correo Electrónico" type="email" error={Boolean(errors.correo)} helperText={errors.correo ? errors.correo.message : ''} placeholder="usuario@empresa.com" InputProps={{ startAdornment: (<InputAdornment position="start"><EmailIcon color="action" /></InputAdornment>) }} />
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="password" control={control} render={({ field }) => (
                  <TextField {...field} id="password" label="Nueva Contraseña (opcional)" type="password" error={Boolean(errors.password)} helperText={errors.password ? errors.password.message : 'Dejar vacío para mantener la actual'} InputProps={{ startAdornment: (<InputAdornment position="start"><LockIcon color="action" /></InputAdornment>) }} />
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
                  <TextField {...field} id="disponibilidad" label="Disponible" select value={field.value ? 'true' : 'false'} onChange={(e) => field.onChange(e.target.value === 'true')}>
                    <MenuItem value="true"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><CheckCircleOutlineIcon color="success" fontSize="small" /> Sí</Box></MenuItem>
                    <MenuItem value="false"><Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}><HighlightOffIcon color="warning" fontSize="small" /> No</Box></MenuItem>
                  </TextField>
                )} />
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6}>
              <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
                <Controller name="especialidades" control={control} render={({ field }) => (
                  <Autocomplete 
                    multiple 
                    id="especialidades" 
                    options={Array.isArray(especialidades) ? especialidades : []} 
                    getOptionLabel={(o) => o.nombre} 
                    value={field.value} 
                    onChange={(_, v) => field.onChange(v)} 
                    isOptionEqualToValue={(o, v) => o.id_especialidad === v.id_especialidad} 
                    renderInput={(params) => (
                      <TextField {...params} label="Especialidades" error={Boolean(errors.especialidades)} helperText={errors.especialidades ? errors.especialidades.message : ''} />
                    )} 
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
      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(s => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}
