import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Alert,
  CircularProgress,
  Box,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Category as CategoryIcon,
  People as PeopleIcon,
  ConfirmationNumber as TicketIcon,
  Label as LabelIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { getApiOrigin } from '../../utils/apiBase';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [categorias, setCategorias] = useState([]);
  const [tecnicos, setTecnicos] = useState([]);
  const [distribucion, setDistribucion] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const getApiBase = () => getApiOrigin();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const apiBase = getApiBase();
      
      // Obtener todas las categorías
      const categoriasRes = await axios.get(`${apiBase}/apiticket/categoria_ticket`);
      const categoriasData = Array.isArray(categoriasRes.data) ? categoriasRes.data : (categoriasRes.data?.data || []);
      setCategorias(categoriasData);

      // Obtener todos los técnicos
      const tecnicosRes = await axios.get(`${apiBase}/apiticket/tecnico`);
      const tecnicosData = Array.isArray(tecnicosRes.data) ? tecnicosRes.data : (tecnicosRes.data?.data || []);
      setTecnicos(tecnicosData);

      // Obtener todos los tickets para hacer estadísticas
      const ticketsRes = await axios.get(`${apiBase}/apiticket/ticket`);
      const ticketsData = Array.isArray(ticketsRes.data) ? ticketsRes.data : (ticketsRes.data?.data || []);

      // Calcular estadísticas
      const totalTickets = ticketsData.length;
      const totalCategorias = categoriasData.length;
      const totalTecnicos = tecnicosData.length;

      // Calcular distribución por estado
      const distribucionPorEstado = ticketsData.reduce((acc, ticket) => {
        const estado = ticket['Estado actual'] || 'Sin estado';
        acc[estado] = (acc[estado] || 0) + 1;
        return acc;
      }, {});

      // Calcular distribución por categoría
      const distribucionPorCategoria = ticketsData.reduce((acc, ticket) => {
        const categoria = ticket['Categoría'] || 'Sin categoría';
        acc[categoria] = (acc[categoria] || 0) + 1;
        return acc;
      }, {});

      setStats({
        totalCategorias,
        totalTecnicos,
        totalTickets,
        distribucionPorEstado,
        distribucionPorCategoria
      });

      // Preparar datos de distribución para tabla
      const distData = Object.entries(distribucionPorCategoria).map(([nombre, cantidad]) => ({
        categoria: nombre,
        cantidad
      }));
      setDistribucion(distData);

      setLoading(false);
    } catch (err) {
      console.error('Error al cargar datos del dashboard:', err);
      setError(`Error al cargar datos. Código: ${err.response?.status || 'desconocido'}`);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ textAlign: 'center', mt: 4 }}>
        <CircularProgress />
        <Typography variant="body1" sx={{ mt: 2 }}>
          Cargando dashboard...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ mt: 4 }}>
        <Alert severity="error">{error}</Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3, fontWeight: 600, display: 'flex', alignItems: 'center' }}>
        <AssessmentIcon sx={{ mr: 1, fontSize: 40 }} />
        Panel de Administración
      </Typography>

      {/* Estadísticas Generales */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          📊 Estadísticas Generales
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(102, 126, 234, 0.35)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <CategoryIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalCategorias}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>Categorías</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(240, 147, 251, 0.35)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <PeopleIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalTecnicos}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>Técnicos</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(79, 172, 254, 0.35)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <TicketIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {stats.totalTickets}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>Tickets</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ 
              background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
              color: 'white',
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: '0 12px 28px rgba(67, 233, 123, 0.35)',
              }
            }}>
              <CardContent sx={{ textAlign: 'center', py: 4 }}>
                <LabelIcon sx={{ fontSize: 48, mb: 2, opacity: 0.9 }} />
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                  {Object.keys(stats.distribucionPorEstado).length}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.95, fontWeight: 600 }}>Estados</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Categorías */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          📁 Categorías de Tickets
        </Typography>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>SLA</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Etiquetas</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length > 0 ? (
                categorias.map((cat) => (
                  <TableRow 
                    key={cat.id_categoria} 
                    hover 
                    sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                  >
                    <TableCell>
                      <Chip label={cat.id_categoria} color="primary" size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {cat.nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="text.secondary">
                        {cat.sla_nombre}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={`${cat.num_etiquetas} etiquetas`} 
                        color="secondary" 
                        variant="outlined" 
                        size="small" 
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay categorías disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Técnicos */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          👨‍💻 Técnicos
        </Typography>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>ID</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Nombre</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Correo</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Tickets Abiertos</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tecnicos.length > 0 ? (
                tecnicos.map((tec) => {
                  const cargaColor = parseInt(tec.tickets_abiertos) > 2 ? 'error' : 
                                     parseInt(tec.tickets_abiertos) > 0 ? 'warning' : 'success';
                  return (
                    <TableRow 
                      key={tec.id_tecnico} 
                      hover
                      sx={{ '&:hover': { bgcolor: 'action.hover' } }}
                    >
                      <TableCell>
                        <Chip label={tec.id_tecnico} color="primary" size="small" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {tec.nombre}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="text.secondary">
                          {tec.correo}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip 
                          label={tec.tickets_abiertos} 
                          color={cargaColor} 
                          size="small"
                          sx={{ fontWeight: 700 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay técnicos disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      <Divider sx={{ my: 4 }} />

      {/* Distribución de Tickets */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          🎯 Distribución de Tickets por Categoría
        </Typography>
        <TableContainer component={Paper} elevation={3}>
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'primary.main' }}>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }}>Categoría</TableCell>
                <TableCell sx={{ color: 'white', fontWeight: 700, py: 2 }} align="center">Cantidad</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {distribucion.length > 0 ? (
                distribucion.map((row, index) => (
                  <TableRow key={index} hover sx={{ '&:hover': { bgcolor: 'action.hover' } }}>
                    <TableCell>
                      <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {row.categoria}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Chip 
                        label={row.cantidad} 
                        color="primary" 
                        sx={{ fontWeight: 700, minWidth: 60 }}
                      />
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 4 }}>
                    <Typography variant="body2" color="text.secondary">
                      No hay tickets disponibles
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Box>

      {/* Distribución por Estado */}
      <Box sx={{ mb: 5 }}>
        <Typography variant="h5" gutterBottom sx={{ mb: 3, fontWeight: 700, color: 'text.primary' }}>
          📊 Distribución por Estado
        </Typography>
        <Grid container spacing={3}>
          {Object.entries(stats.distribucionPorEstado).length > 0 ? (
            Object.entries(stats.distribucionPorEstado).map(([estado, cantidad]) => (
              <Grid item xs={12} sm={6} md={4} key={estado}>
                <Card 
                  elevation={2}
                  sx={{
                    transition: 'transform 0.2s, box-shadow 0.2s',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: 4,
                    }
                  }}
                >
                  <CardContent sx={{ textAlign: 'center', py: 3 }}>
                    <Typography variant="h6" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                      {estado}
                    </Typography>
                    <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', my: 1 }}>
                      {cantidad}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                      tickets
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))
          ) : (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <Typography variant="body2" color="text.secondary">
                    No hay tickets disponibles
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      </Box>
    </Container>
  );
};

export default Dashboard;
