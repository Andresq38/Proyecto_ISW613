import React, { useEffect, useState } from "react";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Box from "@mui/material/Box";

export function Home() {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    // Simulación de datos de prueba
    setTickets([
      {
        id_ticket: 1,
        titulo: "Error en inicio de sesión",
        fecha_creacion: "2025-10-18",
        estado: "Abierto",
      },
      {
        id_ticket: 2,
        titulo: "Solicitud de actualización de software",
        fecha_creacion: "2025-10-17",
        estado: "En progreso",
      },
      {
        id_ticket: 3,
        titulo: "Problemas con impresora",
        fecha_creacion: "2025-10-16",
        estado: "Cerrado",
      },
    ]);
  }, []);

  return (
    <Container sx={{ py: 4 }}>
      {/* Sección de encabezado */}
      <Typography
        component="h1"
        variant="h2"
        align="center"
        color="text.primary"
        gutterBottom
      >
        Alquiler de Películas
      </Typography>
      <Typography variant="h5" align="center" color="text.secondary" mb={6}>
        Descubre y alquila tus películas favoritas por días.
      </Typography>

      {/* Sección de Tiquetes Activos */}
      <Box textAlign="center" mb={3}>
        <Typography variant="h4" component="h2" color="primary" gutterBottom>
          🎟️ Tiquetes Activos
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {tickets.map((ticket) => (
          <Grid item xs={12} sm={6} md={4} key={ticket.id_ticket}>
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: 3,
                "&:hover": { boxShadow: 6, transform: "scale(1.02)" },
                transition: "all 0.2s ease-in-out",
              }}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  #{ticket.id_ticket} — {ticket.titulo}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  📅 Fecha: {ticket.fecha_creacion}
                </Typography>
                <Typography
                  variant="body1"
                  sx={{
                    mt: 1,
                    fontWeight: "bold",
                    color:
                      ticket.estado === "Abierto"
                        ? "green"
                        : ticket.estado === "En progreso"
                        ? "orange"
                        : "gray",
                  }}
                >
                  Estado: {ticket.estado}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}