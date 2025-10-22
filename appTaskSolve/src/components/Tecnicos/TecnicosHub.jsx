import React from 'react';
import { Box, Tabs, Tab } from '@mui/material';
import { NavLink, Outlet, useLocation } from 'react-router-dom';

export default function TecnicosHub() {
  const location = useLocation();

  const tabs = [
    { label: 'Listado', to: '/tecnicos/listado', value: 'listado' },
    { label: 'Asignaciones', to: '/tecnicos/asignaciones', value: 'asignaciones' },
    { label: 'Tickets por Técnico', to: '/tecnicos/tickets', value: 'tickets' },
  ];

  const current = tabs.find(t => location.pathname.includes(`/tecnicos/${t.value}`))?.value || 'listado';

  return (
    <Box sx={{ width: '100%' }}>
      <Tabs
        value={current}
        textColor="inherit"
        TabIndicatorProps={{ style: { backgroundColor: '#fff', height: 3 } }}
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: 1,
          px: { xs: 1, md: 2 },
          pt: 0.5,
          mb: 2,
          '& .MuiTab-root': { fontWeight: 700, color: 'white' },
        }}
      >
        {tabs.map(t => (
          <Tab
            key={t.value}
            label={t.label}
            value={t.value}
            component={NavLink}
            to={t.to}
            sx={{
              '&.Mui-selected': { bgcolor: 'rgba(255,255,255,0.15)' },
            }}
          />
        ))}
      </Tabs>

      <Box sx={{ mt: 1 }}>
        <Outlet />
      </Box>
    </Box>
  );
}
