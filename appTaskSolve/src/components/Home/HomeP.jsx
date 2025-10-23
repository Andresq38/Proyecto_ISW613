import React from 'react';
import { Box, Typography, Container, Card, CardContent } from '@mui/material';
//import TaskSolveLogo from '../../uploads/TaskSolve-Logo.jpg'; // Asegúrate de tener esta imagen

const authors = [
  'Joseph Rodolfo Segura Mora',
  'Andres Mauricio Castillo Cruz',
  'Andrés Quesada Molina'
];

const HomeP = () => {
  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}>
        <Card sx={{ width: { xs: '95%', md: 1000 }, borderRadius: 3, boxShadow: 8, overflow: 'hidden' }}>
          <Box>
            <Box component="img"
              src="/uploads/TaskSolve-Logo.jpg"
              alt="TaskSolve"
              sx={{ width: '100%', height: { xs: 220, md: 340 }, objectFit: 'cover', display: 'block' }}
              onError={(e) => {
                // try several filename variants (case, hyphen, no hyphen)
                const fallbacks = ['/uploads/TaskSolve-logo.jpg', '/uploads/TaskSolve-logo.png', '/uploads/TaskSolve.jpg', '/uploads/TaskSolve.png', '/uploads/TaskSolve-Logo.jpg'];
                const img = e.target;
                const current = img.src || '';
                // find next fallback not equal to current
                const next = fallbacks.find(f => current.indexOf(f) === -1);
                if (next) img.src = next; else {
                  // last resort: show a subtle placeholder color
                  img.style.display = 'none';
                  const p = document.createElement('div');
                  p.style.width = '100%';
                  p.style.height = img.style.height || '300px';
                  p.style.background = 'linear-gradient(135deg,#0b3d91,#062c5f)';
                  img.parentNode.insertBefore(p, img);
                }
              }}
            />

            <CardContent sx={{ bgcolor: 'rgba(11,61,145,0.92)', color: '#fff', display: 'flex', flexDirection: 'column', justifyContent: 'center', p: 6 }}>
              <Typography variant="h3" component="h1" sx={{ color: '#fff', fontWeight: 900, fontStyle: 'italic' }}>
                "TaskSolve — la mejor opción para gestionar tus tickets"
              </Typography>
              <Typography variant="h6" sx={{ color: '#e6f0ff', mt: 2, fontWeight: 800 }}>
                Simplifica, asigna y resuelve. Tu soporte, más rápido y más organizado.
              </Typography>
            </CardContent>
          </Box>
        </Card>
      </Box>

      <Container sx={{ py: 6 }}>
        <Typography variant="h2" component="h2" sx={{ textAlign: 'center', mb: 4, fontWeight: 800, color: 'primary.main' }}>
          Autores
        </Typography>

        <Box sx={{ display: 'flex', gap: 3, justifyContent: 'center', flexWrap: 'wrap' }}>
          {authors.map((name) => {
            const initials = name
              .split(' ')
              .map((s) => s[0] || '')
              .filter(Boolean)
              .slice(0, 2)
              .join('')
              .toUpperCase();

            return (
              <Box key={name} sx={{ width: 260, p: 2, borderRadius: 2, boxShadow: 3, textAlign: 'center', bgcolor: 'background.paper' }}>
                <Box sx={{ width: 72, height: 72, borderRadius: '50%', bgcolor: 'primary.main', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', mx: 'auto', fontWeight: 800, fontSize: 20, mb: 1 }}>
                  {initials}
                </Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>{name}</Typography>
                <Typography variant="caption" color="text.secondary">Equipo TaskSolve</Typography>
              </Box>
            );
          })}
        </Box>
      </Container>
    </Box>
  );
};

export default HomeP;
