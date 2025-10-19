import React from 'react';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Grid from "@mui/material/Grid2";
import error from '../../assets/error.jpg';
import { useNavigate } from 'react-router-dom'; 
import { Button } from '@mui/material';


export function PageNotFound() { 
    const navigate = useNavigate();

    const back = () => { 
        navigate(-1); 
    };
    return ( 
        <Container component="main" sx={{ mt: 8, mb: 2 }}> 
            <Grid container spacing={2}> 
                <Grid size={4}> 
                    <Box 
                        component="img" 
                        sx={{ 
                            borderRadius: '4%', 
                            maxWidth: '100%', 
                            height: 'auto', 
                        }} 
                        alt="404 Error" 
                        src={error} 
                    /> 
                </Grid> 
                <Grid size={8}> 
                    <Typography 
                        component="h1" 
                        variant="h2" 
                        align="center" 
                        color="text.primary"
                        gutterBottom 
                    > 
                        Recurso no encontrado 
                    </Typography> 
                    <Typography variant="h5" align="center" color="text.secondary"> 
                        La página que está buscando podría haber sido eliminada, cambio su 
                        nombre o no está disponible temporalmente 
                    </Typography> 
                    <Box 
                        sx={{ 
                            display: 'flex', 
                            justifyContent: 'center', 
                            alignItems: 'center', 
                            p: 1, 
                            m: 1, 
                        }} 
                    > 
                        <Button 
                            variant="contained" 
                            onClick={() => back()} 
                            color="secondary" 
                        > 
                            Regresar 
                        </Button> 
                    </Box> 
                </Grid> 
            </Grid> 
        </Container> 
    ); 
}