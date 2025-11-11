import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import InputAdornment from '@mui/material/InputAdornment';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';
import PersonIcon from '@mui/icons-material/Person';
import BadgeIcon from '@mui/icons-material/Badge';
import EmailIcon from '@mui/icons-material/Email';
import LockIcon from '@mui/icons-material/Lock';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import Tooltip from '@mui/material/Tooltip';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import { Snackbar, Alert } from '@mui/material';
import TecnicoService from '../../services/TecnicoService';
import React from 'react';




export default function CreateTecnico(){
  const navigate = useNavigate();
  let formData=new FormData()
  // Esquema de validación
  const tecnicoSchema = yup.object({
    id_usuario: yup
      .string()
      .required('La cédula es requerida')
      .matches(/^[0-9]-[0-9]{4}-[0-9]{4}$/, 'Formato: #-####-####'),
    nombre: yup
      .string()
      .required('El nombre es requerido')
      .min(3, 'Mínimo 3 caracteres')
      .max(150, 'Máximo 150 caracteres'),
    correo: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido'),
    password: yup
      .string()
      .min(6, 'La contraseña debe tener mínimo 6 caracteres')
      .required('La contraseña es requerida'),
    disponibilidad: yup.boolean(),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      id_usuario: '',
      nombre: '',
      correo: '',
      password: '',
      disponibilidad: true,
      carga_trabajo: 0, // readonly
    },
    resolver: yupResolver(tecnicoSchema),
  });


   const [error, setError] = useState('');

  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const onSubmit = async (formValues) => {
    try {
      // Prepara payload exacto para backend
      const payload = {
        id_usuario: formValues.id_usuario,
        nombre: formValues.nombre,
        correo: formValues.correo,
        password: formValues.password,
        disponibilidad: formValues.disponibilidad ? 1 : 0
      };
      const { data } = await TecnicoService.createTecnico(payload);
      if (data?.id_tecnico) {
        setSnackbar({ open: true, message: 'Técnico creado correctamente', severity: 'success' });
        setTimeout(() => navigate('/tecnicos'), 1300);
      } else {
        setSnackbar({ open: true, message: 'La respuesta del servidor no es válida', severity: 'warning' });
      }
    } catch (err) {
      console.error(err);
      setError(err?.message || 'Error desconocido');
      setSnackbar({ open: true, message: 'Hubo un problema al guardar el técnico', severity: 'error' });
    }
  };

  const onError = (errors) => console.log(errors);
    return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Box sx={{ textAlign: 'left' }}>
          <Typography variant="h4" sx={{ fontWeight: 800, lineHeight: 1 }}>
            Crear Nuevo Técnico
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Complete el formulario para registrar un nuevo técnico
          </Typography>
        </Box>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
      </Box>

      <Paper elevation={2} sx={{ p: 3, borderTop: 4, borderTopColor: 'primary.main', borderRadius: 2 }}>
        <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={3}>
          <Grid item xs={12}>
          </Grid>

          {/* ID Usuario (Cédula) */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="id_usuario"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="id_usuario"
                    label="Cédula (ID Usuario)"
                    placeholder="1-2345-6789"
                    error={Boolean(errors.id_usuario)}
                    helperText={errors.id_usuario ? errors.id_usuario.message : 'Formato: #-####-####'}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <BadgeIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Nombre Completo */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="nombre"
                    label="Nombre Completo"
                    error={Boolean(errors.nombre)}
                    helperText={errors.nombre ? errors.nombre.message : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <PersonIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Correo */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="correo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="correo"
                    label="Correo Electrónico"
                    type="email"
                    error={Boolean(errors.correo)}
                    helperText={errors.correo ? errors.correo.message : ''}
                    placeholder="usuario@empresa.com"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <EmailIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Contraseña */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="password"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="password"
                    label="Contraseña"
                    type="password"
                    error={Boolean(errors.password)}
                    helperText={errors.password ? errors.password.message : ''}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <LockIcon color="action" />
                        </InputAdornment>
                      )
                    }}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Disponibilidad */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="disponibilidad"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="disponibilidad"
                    label="Disponible"
                    select
                    value={field.value ? 'true' : 'false'}
                    onChange={(e) => field.onChange(e.target.value === 'true')}
                  >
                    <MenuItem value="true">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <CheckCircleOutlineIcon color="success" fontSize="small" /> Sí
                      </Box>
                    </MenuItem>
                    <MenuItem value="false">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <HighlightOffIcon color="warning" fontSize="small" /> No
                      </Box>
                    </MenuItem>
                  </TextField>
                )}
              />
            </FormControl>
          </Grid>

          {/* Carga de Trabajo (readonly) */}
          <Grid item xs={12} md={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="carga_trabajo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="carga_trabajo"
                    label="Carga de Trabajo Actual"
                    type="number"
                    InputProps={{ readOnly: true }}
                    helperText="Se calcula automáticamente"
                  />
                )}
              />
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <Divider sx={{ my: 1 }} />
          </Grid>

          {/* Botón de enviar */}
          <Grid item xs={12}>
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button type="submit" variant="contained" color="primary" startIcon={<SaveIcon />} sx={{ m: 0 }}>
                Guardar Técnico
              </Button>
              <Button variant="outlined" onClick={() => navigate('/tecnicos')} sx={{ m: 0 }}>
                Cancelar
              </Button>
            </Box>
          </Grid>
        </Grid>
      </form>
      </Paper>
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(s => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(s => ({ ...s, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>
    </>
  );
}


