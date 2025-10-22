import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../../context/UserContext';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Alert
} from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ErrorIcon from '@mui/icons-material/Error';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Detectar base del API automáticamente o por variable de entorno
const API_BASE = (
  (import.meta?.env?.VITE_API_BASE && `${import.meta.env.VITE_API_BASE}/apiticket`) ||
  (typeof window !== 'undefined'
    ? `${window.location.origin.replace(/:\d+$/, '')}/apiticket`
    : 'http://localhost/apiticket')
);

const statusColor = (estado) => {
  const map = {
    'Asignado': 'info',
    'En Proceso': 'warning',
    'Resuelto': 'success',
    'Cerrado': 'default'
  };
  return map[estado] || 'primary';
};

const getSlaUrgency = (slaText) => {
  if (!slaText) return null;
  
  const match = slaText.match(/(-?\d+)h/);
  if (!match) return null;
  
  const horas = parseInt(match[1]);
  
  if (horas < 0) {
    return { level: 'vencido', color: '#d32f2f', bgColor: '#ffebee', icon: ErrorIcon, label: 'VENCIDO', pulse: true };
  } else if (horas <= 2) {
    return { level: 'critico', color: '#d32f2f', bgColor: '#ffe0e0', icon: ErrorIcon, label: 'CRÍTICO', pulse: true };
  } else if (horas <= 4) {
    return { level: 'urgente', color: '#f57c00', bgColor: '#fff3e0', icon: WarningAmberIcon, label: 'URGENTE', pulse: false };
  } else if (horas <= 24) {
    return { level: 'proximo', color: '#ed6c02', bgColor: '#fff8e1', icon: AccessTimeIcon, label: 'PRÓXIMO', pulse: false };
  }
  
  return { level: 'normal', color: '#2e7d32', bgColor: '#f1f8f4', icon: AccessTimeIcon, label: 'NORMAL', pulse: false };
};

export default function TicketsList() {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { role, ids } = useUser();

  useEffect(() => {
    const controller = new AbortController();
    async function load() {
      try {
        setLoading(true);
        setError('');
        let url = `${API_BASE}/ticket`;
        if (role?.toLowerCase() === 'cliente' && ids?.idUsuario) {
          url = `${API_BASE}/ticket/getTicketByUsuario/${encodeURIComponent(ids.idUsuario)}`;
        } else if (role?.toLowerCase() === 'técnico' || role?.toLowerCase() === 'tecnico') {
          if (ids?.idTecnico) url = `${API_BASE}/ticket/getTicketByTecnico/${ids.idTecnico}`;
        }
        const res = await fetch(url, {
          headers: { 'Accept': 'application/json' },
          signal: controller.signal
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setTickets(Array.isArray(data) ? data : []);
      } catch (e) {
        if (e.name !== 'AbortError') setError(e.message || 'Error al cargar');
      } finally {
        setLoading(false);
      }
    }
    load();
    return () => controller.abort();
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
        Tickets
      </Typography>

      {loading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', my: 5 }}>
          <CircularProgress />
        </Box>
      )}

      {!!error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && tickets.length === 0 && (
        <Alert severity="info">No hay tickets para mostrar.</Alert>
      )}

      <Grid container spacing={3} sx={{ mt: 1 }}>
        {tickets.map((t, idx) => {
          const slaText = t['Tiempo restante SLA'] || t['Tiempo restante SLA (máx)'];
          const urgency = getSlaUrgency(slaText);
          const Icon = urgency?.icon;

          return (
            <Grid item xs={12} md={6} lg={4} key={idx}>
              <Card 
                elevation={urgency?.pulse ? 6 : 2} 
                sx={{ 
                  borderRadius: 2, 
                  cursor: 'pointer',
                  borderLeft: urgency ? `5px solid ${urgency.color}` : 'none',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 8
                  },
                  ...(urgency?.pulse && {
                    animation: 'pulse 2s infinite',
                    '@keyframes pulse': {
                      '0%, 100%': { boxShadow: `0 0 0 0 ${urgency.color}40` },
                      '50%': { boxShadow: `0 0 0 10px ${urgency.color}00` }
                    }
                  })
                }} 
                onClick={() => navigate(`/tickets/${t['Identificador del Ticket']}`)}
              >
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 1 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      ID #{t['Identificador del Ticket']}
                    </Typography>
                    {urgency?.pulse && (
                      <Chip 
                        size="small" 
                        label={urgency.label}
                        sx={{ 
                          bgcolor: urgency.color,
                          color: 'white',
                          fontWeight: 700,
                          fontSize: '0.65rem'
                        }}
                      />
                    )}
                  </Box>

                  <Typography variant="h6" sx={{ mb: 1.5 }}>{t['Categoría']}</Typography>

                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', mb: 1 }}>
                    <Chip size="small" label={t['Estado actual']} color={statusColor(t['Estado actual'])} />
                  </Box>

                  {/* Alerta SLA */}
                  {urgency && (
                    <Box 
                      sx={{ 
                        mt: 1.5, 
                        p: 1, 
                        bgcolor: urgency.bgColor,
                        borderRadius: 1,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1
                      }}
                    >
                      {Icon && <Icon sx={{ fontSize: 18, color: urgency.color }} />}
                      <Box sx={{ flex: 1 }}>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            fontWeight: 600, 
                            color: urgency.color,
                            display: 'block',
                            lineHeight: 1.2
                          }}
                        >
                          {urgency.label}
                        </Typography>
                        <Typography 
                          variant="caption" 
                          sx={{ 
                            color: 'text.secondary',
                            display: 'block',
                            lineHeight: 1.2
                          }}
                        >
                          {slaText}
                        </Typography>
                      </Box>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </Container>
  );
}
