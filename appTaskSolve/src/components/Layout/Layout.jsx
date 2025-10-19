import React from 'react'; 
import PropTypes from 'prop-types'; 
import { Container } from '@mui/material'; 
import { Toaster } from 'react-hot-toast';
import Header from './Header'; 
import { Footer } from './Footer'; 
 
Layout.propTypes = { children: PropTypes.node.isRequired }; 
 
export function Layout({ children }) { 
  return ( 
    <> 
      <Header /> 
      <Container 
        maxWidth="xl" 
        style={{ paddingTop: '1rem', paddingBottom: '4.5rem' }} 
      > 
        <Toaster position="top-center" /> 
            {children} 
      </Container> 
      <Footer />
    </> 
  ); 
} 