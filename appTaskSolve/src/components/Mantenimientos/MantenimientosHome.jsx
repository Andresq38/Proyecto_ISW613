import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
  Chip,
  Stack,
} from '@mui/material';
import { alpha } from '@mui/material/styles';
import EngineeringIcon from '@mui/icons-material/Engineering';
import CategoryIcon from '@mui/icons-material/Category';
import ConfirmationNumberIcon from '@mui/icons-material/ConfirmationNumber';
import { useNavigate } from 'react-router-dom';

export default function MantenimientosHome() {
  const navigate = useNavigate();

  const tiles = [
    {
      title: 'Técnicos',
      description: 'Crear y mantener técnicos (en progreso).',
      to: '/tecnicos/crear',
      color: 'info',
      status: 'En progreso',
      statusColor: 'info',
      Icon: EngineeringIcon,
    },
    {
      title: 'Categorías',
      description: 'Administrar categorías y etiquetas (próximamente).',
      to: '/categorias',
      color: 'warning',
      status: 'Próximamente',
      statusColor: 'warning',
      Icon: CategoryIcon,
    },
    {
      title: 'Tickets',
      description: 'Crear ticket de prueba (flujo operativo).',
      to: '/tickets/crear',
      color: 'success',
      status: 'Operativo',
      statusColor: 'success',
      Icon: ConfirmationNumberIcon,
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Mantenimientos
        </Typography>
        <Typography variant="body1" sx={{ color: 'text.secondary', mb: 3 }}>
          Aquí agruparemos todos los formularios de mantenimiento. Puedes usar estos accesos rápidos
          mientras completamos los formularios dedicados.
        </Typography>

        <Grid container spacing={2}>
          {tiles.map(({ title, description, to, color, status, statusColor, Icon }) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Card
                variant="outlined"
                sx={(theme) => ({
                  height: '100%',
                  borderLeftWidth: 6,
                  borderLeftStyle: 'solid',
                  borderLeftColor: theme.palette[color].main,
                  background: `linear-gradient(135deg, ${alpha(theme.palette[color].main, 0.08)}, ${alpha(
                    theme.palette[color].main,
                    0.02
                  )})`,
                  transition: 'transform 120ms ease, box-shadow 120ms ease',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 4,
                  },
                })}
              >
                <CardActionArea onClick={() => navigate(to)} aria-label={`Ir a ${title}`} sx={{ height: '100%' }}>
                  <CardContent>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mb: 1 }}>
                      <Box
                        sx={(theme) => ({
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 36,
                          height: 36,
                          borderRadius: '10px',
                          color: theme.palette[color].main,
                          backgroundColor: alpha(theme.palette[color].main, 0.12),
                        })}
                      >
                        <Icon fontSize="small" />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 700, flexGrow: 1 }}>
                        {title}
                      </Typography>
                      <Chip size="small" color={statusColor} variant="filled" label={status} />
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                      {description}
                    </Typography>
                  </CardContent>
                </CardActionArea>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Typography
          variant="caption"
          sx={{ color: 'text.disabled', display: 'block', textAlign: 'center', mt: 6 }}
        >
          © 2025 Sistema de Tickets
        </Typography>
      </Container>
    </Box>
  );
}
