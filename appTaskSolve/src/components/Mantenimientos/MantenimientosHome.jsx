import React from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardActionArea,
  CardContent,
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
      description: 'Administrar perfiles, especialidades y carga de trabajo.',
      to: '/tecnicos/crear',
      color: 'info',
      Icon: EngineeringIcon,
      gradient: ['#0d47a1', '#1976d2'],
    },
    {
      title: 'Categorías',
      description: 'Gestionar categorías y asociar etiquetas (taxonomía).',
      to: '/mantenimientos/categorias',
      color: 'warning',
      Icon: CategoryIcon,
      gradient: ['#e65100', '#fb8c00'],
    },
    {
      title: 'Tickets',
      description: 'Crear tickets internos de prueba y validar flujos.',
      to: '/tickets/crear',
      color: 'success',
      Icon: ConfirmationNumberIcon,
      gradient: ['#1b5e20', '#2e7d32'],
    },
  ];

  return (
    <Box sx={{ py: 3 }}>
      <Container maxWidth="lg">
        <Typography variant="h4" sx={{ fontWeight: 700, mb: 2 }}>
          Mantenimientos
        </Typography>
        {/* Mensaje introductorio eliminado para un look más limpio */}

        <Grid container spacing={2}>
          {tiles.map(({ title, description, to, color, Icon }) => (
            <Grid item xs={12} sm={6} md={4} key={title}>
              <Card
                elevation={2}
                sx={(theme) => ({
                  height: '100%',
                  borderRadius: 2.5,
                  overflow: 'hidden',
                  border: '1px solid',
                  borderColor: alpha(theme.palette.divider, 0.6),
                  backgroundColor: theme.palette.background.paper,
                  position: 'relative',
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 4,
                    backgroundColor: theme.palette[color].main,
                  },
                  transition: 'transform 140ms ease, box-shadow 140ms ease',
                  '&:hover': {
                    transform: 'translateY(-3px)',
                    boxShadow: 8,
                  },
                })}
              >
                <CardActionArea onClick={() => navigate(to)} aria-label={`Ir a ${title}`} sx={{ height: '100%' }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 1.25 }}>
                      <Box
                        sx={(theme) => ({
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 44,
                          height: 44,
                          borderRadius: '50%',
                          color: theme.palette[color].main,
                          backgroundColor: alpha(theme.palette[color].main, 0.12),
                          boxShadow: `0 2px 8px ${alpha(theme.palette[color].main,0.18)}`,
                        })}
                      >
                        <Icon fontSize="medium" />
                      </Box>
                      <Box sx={{ flexGrow: 1, minWidth:0 }}>
                        <Typography variant="subtitle1" sx={{ fontWeight: 700, lineHeight:1.15 }} noWrap>
                          {title}
                        </Typography>
                        {/* Subtítulo retirado para mantener minimalismo */}
                      </Box>
                    </Stack>
                    <Typography variant="body2" sx={{ color: 'text.secondary', lineHeight:1.4 }}>
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
