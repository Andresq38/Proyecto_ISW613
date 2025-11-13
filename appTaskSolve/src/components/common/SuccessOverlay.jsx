import React from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, Box, Typography, Button } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';

/**
 * SuccessOverlay reusable dialog.
 * Props:
 *  - open: boolean
 *  - mode: 'create' | 'update'
 *  - entity: string (e.g. 'Categoría', 'Técnico', 'Ticket')
 *  - onClose: () => void
 *  - actions: array of { label, onClick, variant ('contained'|'outlined'), color }
 *  - subtitle: optional custom subtitle text
 */
export default function SuccessOverlay({
  open,
  mode = 'create',
  entity = 'Registro',
  onClose,
  actions = [],
  subtitle,
}) {
  const isCreate = mode === 'create';
  const title = isCreate ? `¡${entity} creada!` : `¡${entity} actualizada!`;
  const defaultSubtitle = isCreate
    ? `La ${entity.toLowerCase()} se registró correctamente. Puedes continuar sin abandonar la pantalla.`
    : `Los cambios de la ${entity.toLowerCase()} se guardaron correctamente.`;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      keepMounted
      PaperProps={{
        sx: {
          borderRadius: 4,
          py: 4,
          position: 'relative',
          overflow: 'visible',
          textAlign: 'center'
        }
      }}
    >
      <Box sx={{ position: 'absolute', top: -50, left: '50%', transform: 'translateX(-50%)' }}>
        <Box sx={{
          width: 100,
          height: 100,
          bgcolor: isCreate ? 'success.main' : 'info.main',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 6px 24px rgba(0,0,0,0.25)'
        }}>
          {isCreate ? (
            <CheckCircleIcon sx={{ fontSize: 64, color: 'common.white' }} />
          ) : (
            <AutoFixHighIcon sx={{ fontSize: 64, color: 'common.white' }} />
          )}
        </Box>
      </Box>
      <DialogTitle sx={{ mt: 6, fontWeight: 800, textAlign: 'center' }}>{title}</DialogTitle>
      <DialogContent>
        <Typography variant="body1" sx={{ mb: 2 }}>
          {subtitle || defaultSubtitle}
        </Typography>
        {isCreate && (
          <Typography variant="caption" color="text.secondary">
            (Los campos se han reiniciado)
          </Typography>
        )}
      </DialogContent>
      <DialogActions sx={{ justifyContent: 'center', pb: 3, flexWrap: 'wrap', gap: 2 }}>
        {actions.map((a, idx) => (
          <Button
            key={idx}
            onClick={a.onClick}
            variant={a.variant || 'contained'}
            color={a.color || (isCreate ? 'success' : 'info')}
            sx={{ minWidth: 160, fontWeight: 700 }}
          >
            {a.label}
          </Button>
        ))}
        {!actions.length && (
          <Button onClick={onClose} variant="contained" color={isCreate ? 'success' : 'info'} sx={{ minWidth: 160, fontWeight: 700 }}>
            Cerrar
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
