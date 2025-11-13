import React, { useEffect, useState } from "react";
import {
  Container,
  Paper,
  Box,
  Grid,
  Typography,
  TextField,
  MenuItem,
  Button,
  Snackbar,
  Alert,
  CircularProgress,
  Checkbox,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { getApiOrigin } from "../../utils/apiBase";

export default function CreateCategoria({
  embedded = false,
  onCreated,
  hideEmbeddedHeader = false,
}) {
  const apiBase = getApiOrigin();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });
  const [slas, setSlas] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);
  const [especialidades, setEspecialidades] = useState([]);
  const [openEtiquetaDialog, setOpenEtiquetaDialog] = useState(false);
  const [newEtiqueta, setNewEtiqueta] = useState("");
  const [openEspDialog, setOpenEspDialog] = useState(false);
  const [newEspecialidad, setNewEspecialidad] = useState("");
  const [form, setForm] = useState({
    nombre: "",
    id_sla: "",
    etiquetas: [],
    especialidades: [],
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [slaRes, etqRes, espRes] = await Promise.all([
          axios.get(`${apiBase}/apiticket/sla`),
          axios.get(`${apiBase}/apiticket/etiqueta`),
          axios.get(`${apiBase}/apiticket/especialidad`),
        ]);
        setSlas(slaRes.data || []);
        setEtiquetas(etqRes.data || []);
        setEspecialidades(espRes.data || []);
      } catch (err) {
        setSnackbar({
          open: true,
          message: "Error cargando catálogos",
          severity: "error",
        });
      }
    };
    fetchData();
  }, [apiBase]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.id_sla) {
      setSnackbar({
        open: true,
        message: "Nombre y SLA son requeridos",
        severity: "warning",
      });
      return;
    }
    try {
      setLoading(true);
      const payload = {
        nombre: form.nombre.trim(),
        id_sla: parseInt(form.id_sla, 10),
        etiquetas: (form.etiquetas || [])
          .map((e) => e?.id_etiqueta)
          .filter((id) => Number.isInteger(id) && id > 0),
        especialidades: (form.especialidades || [])
          .map((e) => e?.id_especialidad)
          .filter((id) => Number.isInteger(id) && id > 0),
      };
      const res = await axios.post(
        `${apiBase}/apiticket/categoria_ticket`,
        payload,
        { headers: { "Content-Type": "application/json" } }
      );
      if (res?.data?.id_categoria || res?.data) {
        setSnackbar({
          open: true,
          message: "Categoría creada correctamente",
          severity: "success",
        });
        if (embedded) {
          // Reset form y refrescar listado si corresponde
          setForm({
            nombre: "",
            id_sla: "",
            etiquetas: [],
            especialidades: [],
          });
          if (typeof onCreated === "function") onCreated();
        } else {
          setTimeout(() => navigate("/categorias"), 800);
        }
      } else {
        setSnackbar({
          open: true,
          message: "Respuesta inválida del servidor",
          severity: "warning",
        });
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: err?.response?.data?.error || "Error al crear categoría",
        severity: "error",
      });
    } finally {
      setLoading(false);
    }
  };

  const FormContent = (
    <Paper
      elevation={2}
      sx={{
        p: { xs: 2, md: 3 },
        borderTop: 6,
        borderTopColor: "primary.main",
        borderRadius: 3,
        overflow: "visible",
      }}
    >
      {!embedded && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            mb: 2,
          }}
        >
          <Box>
            <Typography variant="h4" sx={{ fontWeight: 800 }}>
              Crear Categoría
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Defina el SLA y las etiquetas relacionadas
            </Typography>
          </Box>
          <Button variant="text" onClick={() => navigate(-1)}>
            &larr; Volver
          </Button>
        </Box>
      )}

      {embedded && !hideEmbeddedHeader && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 800 }}>
            Nueva categoría
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Defina el SLA y las etiquetas relacionadas
          </Typography>
        </Box>
      )}

      <form onSubmit={handleSubmit}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={5}>
            <TextField
              fullWidth
              label="Nombre"
              value={form.nombre}
              onChange={(e) =>
                setForm((f) => ({ ...f, nombre: e.target.value }))
              }
              sx={{ minWidth: { md: 300 } }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <TextField
              select
              fullWidth
              label="SLA"
              value={form.id_sla}
              onChange={(e) =>
                setForm((f) => ({ ...f, id_sla: e.target.value }))
              }
              sx={{ minWidth: { md: 200 } }}
            >
              {slas.map((s) => (
                <MenuItem key={s.id_sla} value={s.id_sla}>
                  {s.nombre}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Etiquetas relacionadas"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                  const count = (selected || []).length;
                  return count > 0 ? `${count} seleccionadas` : '';
                },
              }}
              value={form.etiquetas}
              onChange={(e) => {
                const values = (e.target.value || [])
                  .filter((v) => v && typeof v === 'object')
                  .filter((v, idx, arr) => arr.findIndex(x => x && x.id_etiqueta === v.id_etiqueta) === idx);
                setForm((f) => ({ ...f, etiquetas: values }));
              }}
              sx={{
                minWidth: { md: 170 },
                '& .MuiSelect-select': {
                  minHeight: 45,
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                }
              }}
            >
              {etiquetas.map((et) => {
                const checked = (form.etiquetas || []).some(
                  (sel) => sel && sel.id_etiqueta === et.id_etiqueta
                );
                return (
                  <MenuItem key={et.id_etiqueta} value={et}>
                    <Checkbox size="small" checked={checked} />
                    <ListItemText primary={et.nombre} />
                  </MenuItem>
                );
              })}
              <MenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpenEtiquetaDialog(true)}
              >
                Otros…
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Especialidades"
              InputLabelProps={{ shrink: true }}
              SelectProps={{
                multiple: true,
                renderValue: (selected) => {
                  const count = (selected || []).length;
                  return count > 0 ? `${count} seleccionadas` : '';
                },
              }}
              value={form.especialidades}
              onChange={(e) => {
                const values = (e.target.value || [])
                  .filter((v) => v && typeof v === 'object')
                  .filter((v, idx, arr) => arr.findIndex(x => x && x.id_especialidad === v.id_especialidad) === idx);
                setForm((f) => ({ ...f, especialidades: values }));
              }}
              sx={{
                minWidth: { md: 170},
                '& .MuiSelect-select': {
                  minHeight: 45,
                  display: 'flex',
                  alignItems: 'center',
                  py: 1,
                }
              }}
            >
              {especialidades.map((esp) => {
                const checked = (form.especialidades || []).some(
                  (sel) => sel && sel.id_especialidad === esp.id_especialidad
                );
                return (
                  <MenuItem key={esp.id_especialidad} value={esp}>
                    <Checkbox size="small" checked={checked} />
                    <ListItemText primary={esp.nombre} />
                  </MenuItem>
                );
              })}
              <MenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => setOpenEspDialog(true)}
              >
                Otros…
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5, mt: 1 }}>
              {(form.etiquetas || []).map((et) => (
                <Paper
                  key={`${et.id_etiqueta ?? "nuevo"}-${et.nombre}`}
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    typography: "caption",
                  }}
                >
                  {et.nombre}
                </Paper>
              ))}
              {(form.especialidades || []).map((esp) => (
                <Paper
                  key={`${esp.id_especialidad ?? "nuevo"}-${esp.nombre}`}
                  variant="outlined"
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 2,
                    typography: "caption",
                  }}
                >
                  {esp.nombre}
                </Paper>
              ))}
            </Box>
          </Grid>
        </Grid>

        <Box
          sx={{ display: "flex", gap: 2, justifyContent: "flex-end", mt: 4 }}
        >
          <Button type="submit" variant="contained" disabled={loading}>
            Guardar
          </Button>
          {!embedded && (
            <Button variant="outlined" onClick={() => navigate("/categorias")}>
              Cancelar
            </Button>
          )}
          {embedded && (
            <Button
              variant="outlined"
              onClick={() =>
                setForm({
                  nombre: "",
                  id_sla: "",
                  etiquetas: [],
                  especialidades: [],
                })
              }
            >
              Limpiar
            </Button>
          )}
        </Box>
      </form>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 3 }}>
          <CircularProgress />
        </Box>
      )}

      {/* Dialog para crear nueva etiqueta */}
      <Dialog open={openEtiquetaDialog} onClose={() => setOpenEtiquetaDialog(false)}>
        <DialogTitle>Nueva etiqueta</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nombre de la etiqueta"
            value={newEtiqueta}
            onChange={(e) => setNewEtiqueta(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEtiquetaDialog(false)}>Cancelar</Button>
          <Button
            disabled={!newEtiqueta.trim()}
            onClick={() => {
              const nombre = newEtiqueta.trim();
              if (!nombre) return;
              const temp = { id_etiqueta: undefined, nombre };
              setEtiquetas((prev) => [...prev, temp]);
              setForm((f) => ({ ...f, etiquetas: [...(f.etiquetas || []), temp] }));
              setNewEtiqueta("");
              setOpenEtiquetaDialog(false);
              setSnackbar({ open: true, message: "Etiqueta agregada (se creará al guardar)", severity: "info" });
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog para crear nueva especialidad (solo nombre, local) */}
      <Dialog open={openEspDialog} onClose={() => setOpenEspDialog(false)}>
        <DialogTitle>Nueva especialidad</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            margin="dense"
            label="Nombre de la especialidad"
            value={newEspecialidad}
            onChange={(e) => setNewEspecialidad(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEspDialog(false)}>Cancelar</Button>
          <Button
            disabled={!newEspecialidad.trim()}
            onClick={() => {
              const nombre = newEspecialidad.trim();
              if (!nombre) return;
              const temp = { id_especialidad: undefined, nombre };
              setEspecialidades((prev) => [...prev, temp]);
              setForm((f) => ({ ...f, especialidades: [...(f.especialidades || []), temp] }));
              setNewEspecialidad("");
              setOpenEspDialog(false);
              setSnackbar({ open: true, message: "Especialidad agregada (se creará al guardar)", severity: "info" });
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

  if (embedded) {
    return (
      <Box>
        {FormContent}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={4000}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      {FormContent}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
}
