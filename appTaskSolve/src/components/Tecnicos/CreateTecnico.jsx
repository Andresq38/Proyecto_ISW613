import { useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { useForm, Controller, useFieldArray } from 'react-hook-form';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import AddIcon from '@mui/icons-material/Add';
import Tooltip from '@mui/material/Tooltip';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import TecnicoService from '../../services/TecnicoService';
import React from 'react';




export default function CreateTecnico(){
  const navigate = useNavigate();
  let formData=new FormData()
  // Esquema de validación
 const tecnicoSchema = yup.object({
    nombre: yup.string().required('El nombre es requerido'),
    apellidos: yup.string().required('Los apellidos son requeridos'),
    telefono: yup
      .string()
      .matches(/^[0-9]+$/, 'Solo se permiten números')
      .min(8, 'Debe tener al menos 8 dígitos')
      .required('El teléfono es requerido'),
    correo: yup
      .string()
      .email('Debe ser un correo válido')
      .required('El correo es requerido'),
    especialidad: yup.string().required('La especialidad es requerida'),
    nombre_usuario: yup.string().required('El usuario es requerido'),
    contrasena: yup
      .string()
      .min(6, 'La contraseña debe tener mínimo 6 caracteres')
      .required('La contraseña es requerida'),
  });

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      nombre: '',
      apellidos: '',
      telefono: '',
      correo: '',
      especialidad: '',
      nombre_usuario: '',
      contrasena: '',
      rol: 'Técnico', // rol por defecto
    },
    resolver: yupResolver(tecnicoSchema),
  });


   const [error, setError] = useState('');

   const onSubmit = async (data) => {
    try {
      console.log('Formulario:', data);
      const response = await TecnicoService.createTecnico(data);
      if (response.data != null) {
        toast.success(`Técnico creado correctamente`, {
          duration: 4000,
          position: 'top-center',
        });
        navigate('/tecnico-table'); // redirección a la tabla
      } else {
        toast.error('Error al crear el técnico');
      }
    } catch (error) {
      console.error(error);
      setError(error);
      toast.error('Hubo un problema al guardar el técnico');
    }
  };

  const onError = (errors) => console.log(errors);
    return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Button variant="text" onClick={() => navigate(-1)}>&larr; Volver</Button>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 700 }}>
          Crear Técnico
        </Typography>
        <Box />
      </Box>

      <form onSubmit={handleSubmit(onSubmit, onError)} noValidate>
        <Grid container spacing={2}>
          <Grid item xs={12}>
          </Grid>

          {/* Nombre */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="nombre"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="nombre"
                    label="Nombre"
                    error={Boolean(errors.nombre)}
                    helperText={errors.nombre ? errors.nombre.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Apellidos */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="apellidos"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="apellidos"
                    label="Apellidos"
                    error={Boolean(errors.apellidos)}
                    helperText={errors.apellidos ? errors.apellidos.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Teléfono */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="telefono"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="telefono"
                    label="Teléfono"
                    error={Boolean(errors.telefono)}
                    helperText={errors.telefono ? errors.telefono.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Correo */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="correo"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="correo"
                    label="Correo"
                    error={Boolean(errors.correo)}
                    helperText={errors.correo ? errors.correo.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Especialidad */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="especialidad"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="especialidad"
                    label="Especialidad"
                    error={Boolean(errors.especialidad)}
                    helperText={errors.especialidad ? errors.especialidad.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Nombre de usuario */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="nombre_usuario"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="nombre_usuario"
                    label="Usuario"
                    error={Boolean(errors.nombre_usuario)}
                    helperText={errors.nombre_usuario ? errors.nombre_usuario.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Contraseña */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="contrasena"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    id="contrasena"
                    label="Contraseña"
                    type="password"
                    error={Boolean(errors.contrasena)}
                    helperText={errors.contrasena ? errors.contrasena.message : ''}
                  />
                )}
              />
            </FormControl>
          </Grid>

          {/* Rol (por defecto oculto o solo lectura) */}
          <Grid item xs={6}>
            <FormControl variant="standard" fullWidth sx={{ m: 1 }}>
              <Controller
                name="rol"
                control={control}
                render={({ field }) => (
                  <TextField {...field} id="rol" label="Rol" InputProps={{ readOnly: true }} />
                )}
              />
            </FormControl>
          </Grid>

          {/* Botón de enviar */}
          <Grid item xs={12}>
            <Button type="submit" variant="contained" color="primary" sx={{ m: 1 }}>
              Guardar Técnico
            </Button>
            <Button variant="outlined" onClick={() => navigate('/tecnicos/listado')} sx={{ m: 1 }}>
              Cancelar
            </Button>
          </Grid>
        </Grid>
      </form>
    </>
  );
}


