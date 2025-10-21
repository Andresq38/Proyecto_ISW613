import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState('');

  // Color de advertencia fuerte
  const WARNING_COLOR = '#e65100';

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleTicketOption = (role) => {
    handleClose();
    if (role === 'Tecnico') {
      navigate('/tickets/tecnico');
    } else {
      const msg = `Navegación a ${role} aún no implementada.`;
      console.log(msg);
      setMessage(msg);
      setTimeout(() => setMessage(''), 3000);
    }
  };

  return (
    <AppBar position="sticky">
      <Toolbar>
        {/* Logo + Wordmark: place your file at appTaskSolve/public/logo.png */}
        <Box
          onClick={() => navigate('/')}
          sx={{ display: 'flex', alignItems: 'center', mr: 2, cursor: 'pointer' }}
          aria-label="Go to home"
        >
          <Box sx={{ width: 48, height: 48, bgcolor: 'white', borderRadius: 1, p: 0.5, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: 1 }}>
            <Box
              component="img"
              src="/logo.png"
              alt="TaskSolve"
              sx={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', display: 'block' }}
              onError={(e) => {
                // if PNG fails, try SVG version
                if (e.target && e.target.src && !e.target.src.endsWith('/logo.svg')) {
                  e.target.src = '/logo.svg';
                } else {
                  e.target.style.display = 'none';
                  const el = document.getElementById('ts-logo-fallback');
                  if (el) el.style.display = 'flex';
                }
              }}
            />
          </Box>
          <Box id="ts-logo-fallback" sx={{ width: 44, height: 44, ml: -6, bgcolor: 'white', borderRadius: 1, display: 'none', alignItems: 'center', justifyContent: 'center', color: 'black', boxShadow: 1 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 700, fontSize: 12 }}>TS</Typography>
          </Box>

          {/* Wordmark: hidden on xs, visible from md+ */}
          <Typography
            variant="subtitle1"
            sx={{ display: { xs: 'none', md: 'flex' }, fontWeight: 700, ml: 1, color: 'var(--brand)', letterSpacing: 0.2 }}
          >
            TaskSolve
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{ flexGrow: 1, cursor: 'pointer' }}
          onClick={() => navigate('/')}
        >
          SISTEMA DE TICKETS
        </Typography>

        <Button color="inherit" onClick={handleMenuClick}>TICKETS</Button>

        <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={handleClose}>
          <MenuItem onClick={() => handleTicketOption('Administrador')}>Administrador</MenuItem>
          <MenuItem onClick={() => handleTicketOption('Cliente')}>Cliente</MenuItem>
          <MenuItem onClick={() => handleTicketOption('Tecnico')}>Técnico</MenuItem>
        </Menu>
      </Toolbar>
      {message && (
        <Box sx={{ bgcolor: WARNING_COLOR, color: 'white', p: 1, textAlign: 'center' }}>
          {message}
        </Box>
      )}
    </AppBar>
  );
};

export default Header;
