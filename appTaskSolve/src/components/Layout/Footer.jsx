import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box 
      component="footer" 
      sx={{ 
        py: 2, 
        textAlign: 'center', 
        bgcolor: '#f5f5f5', 
        borderTop: '1px solid #e0e0e0',
        mt: 'auto'
      }}
    >
      <Typography variant="body2" color="text.secondary">
        © {new Date().getFullYear()} Sistema de Tickets
      </Typography>
    </Box>
  );
};

export default Footer;
