import React, { useState } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, Box } from '@mui/material';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import { useNavigate, useLocation } from 'react-router-dom';

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [message, setMessage] = useState('');

  // Color de advertencia fuerte
  const WARNING_COLOR = '#e65100';

  // Función para verificar si una ruta está activa
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  // Estilos para botones activos e inactivos
  const getButtonStyles = (path) => ({
    textTransform: 'uppercase',
    fontWeight: 700,
    fontSize: '1.25rem',
    letterSpacing: 0.3,
    px: 1,
    minWidth: 'auto',
    borderBottom: isActive(path) ? '3px solid white' : '3px solid transparent',
    borderRadius: 0,
    backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
    '&:hover': {
      backgroundColor: isActive(path) ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.1)',
    },
  });

  const handleMenuClick = (event) => setAnchorEl(event.currentTarget);
  const handleClose = () => setAnchorEl(null);

  const handleTicketOption = (role) => {
    handleClose();
    if (role === 'Tecnico') {
      navigate('/tickets/tecnico');
    } else if (role === 'Administrador') {
      navigate('/tickets');
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
            
          </Typography>
        </Box>
        {/* Left-aligned nav group: Home + Dashboard + Tickets + Técnicos + Categorías */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/')}
              sx={getButtonStyles('/')}
          >
            Home
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/dashboard')}
              sx={getButtonStyles('/dashboard')}
          >
            Dashboard
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={handleMenuClick}
            endIcon={<ArrowDropDownIcon />}
              sx={getButtonStyles('/tickets')}
          >
            Tickets
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/tecnicos')}
              sx={getButtonStyles('/tecnicos')}
          >
            Técnicos
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/categorias')}
              sx={getButtonStyles('/categorias')}
          >
            Categorías
          </Button>

          <Button
            variant="text"
            color="inherit"
            onClick={() => navigate('/asignaciones')}
              sx={getButtonStyles('/asignaciones')}
          >
            Asignaciones
          </Button>
        </Box>

        {/* Spacer to push any future items to the right */}
        <Box sx={{ flexGrow: 1 }} />

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
