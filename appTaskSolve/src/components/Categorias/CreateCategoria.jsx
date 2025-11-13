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
  const [selectedEtiqueta, setSelectedEtiqueta] = useState("");
  const [selectedEspecialidad, setSelectedEspecialidad] = useState("");

  // catálogos ordenados para los combo-box (selects): id ascendente
  const sortedCatalogEtiquetas = (etiquetas || []).slice().sort((a, b) => {
    const ai = a?.id_etiqueta;
    const bi = b?.id_etiqueta;
    if (ai != null && bi != null) return Number(ai) - Number(bi);
    if (ai != null) return -1;
    if (bi != null) return 1;
    return String(a?.nombre || "").localeCompare(String(b?.nombre || ""));
  });

  const sortedCatalogEspecialidades = (especialidades || []).slice().sort((a, b) => {
    const ai = a?.id_especialidad;
    const bi = b?.id_especialidad;
    if (ai != null && bi != null) return Number(ai) - Number(bi);
    if (ai != null) return -1;
    if (bi != null) return 1;
    return String(a?.nombre || "").localeCompare(String(b?.nombre || ""));
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
      const toIntArray = (arr, key) =>
        (arr || [])
          .map((e) => {
            const v = e?.[key];
            if (v == null) return null;
            const n = Number(v);
            return Number.isFinite(n) && n > 0 ? n : null;
          })
          .filter((x) => x != null);

      const payload = {
        nombre: form.nombre.trim(),
        id_sla: parseInt(form.id_sla, 10),
        etiquetas: toIntArray(form.etiquetas, 'id_etiqueta'),
        especialidades: toIntArray(form.especialidades, 'id_especialidad'),
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
              label="Etiqueta (agregar)"
              InputLabelProps={{ shrink: true }}
              value={selectedEtiqueta}
              onChange={(e) => {
                const sel = e.target.value;
                if (sel && typeof sel === 'object') {
                  const exists = (form.etiquetas || []).some(it => {
                    if (!it) return false;
                    if (it.id_etiqueta && sel.id_etiqueta) return it.id_etiqueta === sel.id_etiqueta;
                    return String(it.nombre || '').trim().toLowerCase() === String(sel.nombre || '').trim().toLowerCase();
                  });
                  if (!exists) setForm(f => ({ ...f, etiquetas: [...(f.etiquetas||[]), sel] }));
                }
                setSelectedEtiqueta("");
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
              <MenuItem value="">-- Seleccione --</MenuItem>
              {sortedCatalogEtiquetas.map((et) => (
                <MenuItem key={et.id_etiqueta} value={et}>{et.nombre}</MenuItem>
              ))}
              <MenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setOpenEtiquetaDialog(true); setSelectedEtiqueta(""); }}
              >
                Otros…
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              select
              fullWidth
              label="Especialidad (agregar)"
              InputLabelProps={{ shrink: true }}
              value={selectedEspecialidad}
              onChange={(e) => {
                const sel = e.target.value;
                if (sel && typeof sel === 'object') {
                  const exists = (form.especialidades || []).some(it => {
                    if (!it) return false;
                    if (it.id_especialidad && sel.id_especialidad) return it.id_especialidad === sel.id_especialidad;
                    return String(it.nombre || '').trim().toLowerCase() === String(sel.nombre || '').trim().toLowerCase();
                  });
                  if (!exists) setForm(f => ({ ...f, especialidades: [...(f.especialidades||[]), sel] }));
                }
                setSelectedEspecialidad("");
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
              <MenuItem value="">-- Seleccione --</MenuItem>
              {sortedCatalogEspecialidades.map((esp) => (
                <MenuItem key={esp.id_especialidad} value={esp}>{esp.nombre}</MenuItem>
              ))}
              <MenuItem
                onMouseDown={(e) => e.preventDefault()}
                onClick={() => { setOpenEspDialog(true); setSelectedEspecialidad(""); }}
              >
                Otros…
              </MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12}>
            <Grid container spacing={2}>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 1.5, borderRadius: 2, p: 2, minHeight: 180 }}>
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Etiquetas
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {(form.etiquetas || []).map((et) => (
                      <Box key={`et-${String(et.id_etiqueta || et.nombre)}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, mb: 2, backgroundColor: 'transparent' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {`${et.id_etiqueta ? et.id_etiqueta + ' - ' : ''}${et.nombre}`}
                        </Typography>
                        <Button size="small" onClick={() => setForm(f => ({ ...f, etiquetas: (f.etiquetas||[]).filter(x => {
                          if (!x) return false;
                          if (x.id_etiqueta && et.id_etiqueta) return x.id_etiqueta !== et.id_etiqueta;
                          return String(x.nombre || '').trim().toLowerCase() !== String(et.nombre || '').trim().toLowerCase();
                        }) }))}>Quitar</Button>
                      </Box>
                    ))}
                    {(!(form.etiquetas || []).length) && (
                      <Typography variant="body2" color="text.secondary">No hay etiquetas seleccionadas</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
              <Grid item xs={12} md={6}>
                <Paper variant="outlined" sx={{ borderColor: 'primary.main', borderWidth: 1.5, borderRadius: 2, p: 2, minHeight: 180 }}>
                  <Typography sx={{ mb: 1, fontWeight: 700 }}>
                    Especialidades
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {(form.especialidades || []).map((esp) => (
                      <Box key={`esp-${String(esp.id_especialidad || esp.nombre)}`} sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1.5px solid', borderColor: 'primary.main', borderRadius: 2, p: 2, mb: 2, backgroundColor: 'transparent' }}>
                        <Typography variant="body2" sx={{ fontWeight: 700 }}>
                          {`${esp.id_especialidad ? esp.id_especialidad + ' - ' : ''}${esp.nombre}`}
                        </Typography>
                        <Button size="small" onClick={() => setForm(f => ({ ...f, especialidades: (f.especialidades||[]).filter(x => {
                          if (!x) return false;
                          if (x.id_especialidad && esp.id_especialidad) return x.id_especialidad !== esp.id_especialidad;
                          return String(x.nombre || '').trim().toLowerCase() !== String(esp.nombre || '').trim().toLowerCase();
                        }) }))}>Quitar</Button>
                      </Box>
                    ))}
                    {(!(form.especialidades || []).length) && (
                      <Typography variant="body2" color="text.secondary">No hay especialidades seleccionadas</Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            </Grid>
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
            onClick={async () => {
              const nombre = newEtiqueta.trim();
              if (!nombre) return;
              try {
                setLoading(true);
                // crear etiqueta en servidor
                const res = await axios.post(`${apiBase}/apiticket/etiqueta`, { nombre }, { headers: { 'Content-Type': 'application/json' } });
                const created = res?.data;
                if (created && created.id_etiqueta) {
                  const existsInForm = (form.etiquetas || []).some(it => it && ((it.id_etiqueta && it.id_etiqueta === created.id_etiqueta) || String(it.nombre||'').trim().toLowerCase() === String(created.nombre||'').trim().toLowerCase()));
                  if (!existsInForm) setForm((f) => ({ ...f, etiquetas: [...(f.etiquetas || []), created] }));
                  setEtiquetas((prev) => {
                    const already = (prev || []).some(it => it && it.id_etiqueta === created.id_etiqueta);
                    return already ? prev : [...prev, created];
                  });
                  setSnackbar({ open: true, message: "Etiqueta creada", severity: "success" });
                } else {
                  setSnackbar({ open: true, message: "No se pudo crear la etiqueta", severity: "error" });
                }
              } catch (err) {
                setSnackbar({ open: true, message: err?.response?.data?.error || 'Error creando etiqueta', severity: 'error' });
              } finally {
                setNewEtiqueta("");
                setOpenEtiquetaDialog(false);
                setLoading(false);
              }
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
            onClick={async () => {
              const nombre = newEspecialidad.trim();
              if (!nombre) return;
              try {
                setLoading(true);
                // id_sla: use selected SLA if provided, otherwise fallback to 1
                const idSla = form.id_sla ? parseInt(form.id_sla, 10) : 1;
                // create especialidad with temporary id_categoria = 1 as requested
                const res = await axios.post(`${apiBase}/apiticket/especialidad`, { nombre, id_sla: idSla, id_categoria: 1 }, { headers: { 'Content-Type': 'application/json' } });
                const created = res?.data;
                if (created && created.id_especialidad) {
                  const existsInForm = (form.especialidades || []).some(it => it && ((it.id_especialidad && it.id_especialidad === created.id_especialidad) || String(it.nombre||'').trim().toLowerCase() === String(created.nombre||'').trim().toLowerCase()));
                  if (!existsInForm) setForm((f) => ({ ...f, especialidades: [...(f.especialidades || []), created] }));
                  setEspecialidades((prev) => {
                    const already = (prev || []).some(it => it && it.id_especialidad === created.id_especialidad);
                    return already ? prev : [...prev, created];
                  });
                  setSnackbar({ open: true, message: "Especialidad creada", severity: "success" });
                } else {
                  setSnackbar({ open: true, message: "No se pudo crear la especialidad", severity: "error" });
                }
              } catch (err) {
                setSnackbar({ open: true, message: err?.response?.data?.error || 'Error creando especialidad', severity: 'error' });
              } finally {
                setNewEspecialidad("");
                setOpenEspDialog(false);
                setLoading(false);
              }
            }}
          >
            Agregar
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );

  // If embedded, keep the same compact layout
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

  // For the full page view: return a single full-width container (the form Paper)
  return (
    <Box sx={{ width: '100%', p: 0 }}>
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
