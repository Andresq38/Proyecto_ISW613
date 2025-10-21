import React, { useState, useEffect } from 'react';
import {
  Container, Typography, FormControl, InputLabel,
  Select, MenuItem, Grid, Card, CardContent, Box
} from '@mui/material';
// Eliminada la importación de '../../data/Data' que causaba el error de compilación.

// --- Datos simulados movidos directamente al componente ---
const TECNICOS = ["Luis", "Maria", "Carlos"];
const TICKET_DATA_TECNICO = [
  { id_ticket: 1, titulo: "Error en red", tecnico: "Luis", estado: "Abierto", fecha_creacion: "2025-10-10" },
  { id_ticket: 2, titulo: "Pantalla azul", tecnico: "Maria", estado: "En progreso", fecha_creacion: "2025-10-11" },
  { id_ticket: 3, titulo: "No imprime", tecnico: "Carlos", estado: "Cerrado", fecha_creacion: "2025-10-12" },
  { id_ticket: 4, titulo: "Mouse no funciona", tecnico: "Luis", estado: "Abierto", fecha_creacion: "2025-10-13" },
  { id_ticket: 5, titulo: "Correo no sincroniza", tecnico: "Maria", estado: "Abierto", fecha_creacion: "2025-10-14" },
];
// --------------------------------------------------------

const TicketsPorTecnico = () => {
  const [tecnicoSeleccionado, setTecnicoSeleccionado] = useState("");
  const [ticketsFiltrados, setTicketsFiltrados] = useState([]);

  useEffect(() => {
    if (tecnicoSeleccionado) {
      // Usamos la constante local TICKET_DATA_TECNICO
      const filtrados = TICKET_DATA_TECNICO.filter(t => t.tecnico === tecnicoSeleccionado);
      setTicketsFiltrados(filtrados);
    } else {
        setTicketsFiltrados([]);
    }
  }, [tecnicoSeleccionado]);

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        Tickets Asignados por Técnico
      </Typography>

      <FormControl fullWidth sx={{ mb: 4 }}>
        <InputLabel id="select-tecnico-label">Seleccionar Técnico</InputLabel>
        <Select
          labelId="select-tecnico-label"
          value={tecnicoSeleccionado}
          label="Seleccionar Técnico"
          onChange={(e) => setTecnicoSeleccionado(e.target.value)}
        >
          {/* Usamos la constante local TECNICOS */}
          {TECNICOS.map((t) => (
            <MenuItem key={t} value={t}>{t}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Grid container spacing={3}>
        {ticketsFiltrados.length > 0 ? (
            ticketsFiltrados.map((ticket) => (
            <Grid item xs={12} md={6} key={ticket.id_ticket}>
                <Card elevation={2} sx={{ borderRadius: 2 }}>
                <CardContent>
                    <Typography variant="h6">#{ticket.id_ticket} - {ticket.titulo}</Typography>
                    <Typography color="text.secondary">Técnico: <Box component="span" fontWeight="bold">{ticket.tecnico}</Box></Typography>
                    <Typography color="text.secondary" sx={{ mb: 1 }}>📅 {ticket.fecha_creacion}</Typography>
                    <Typography fontWeight="bold" color="primary">Estado: {ticket.estado}</Typography>
                </CardContent>
                </Card>
            </Grid>
            ))
        ) : (
            tecnicoSeleccionado && (
                <Grid item xs={12}>
                    <Typography color="text.secondary">No hay tickets asignados a {tecnicoSeleccionado}.</Typography>
                </Grid>
            )
        )}
      </Grid>
      {!tecnicoSeleccionado && (
          <Typography color="text.secondary" align="center" sx={{ mt: 5 }}>
            Por favor, selecciona un técnico para ver sus tickets asignados.
          </Typography>
      )}
    </Container>
  );
};

export default TicketsPorTecnico;
