import React from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import Header from './components/Header';
import MealPlanner from './components/MealPlanner';

const theme = createTheme({
  palette: {
    primary: {
      main: '#4CAF50', // Green color similar to Mealime
      light: '#80E27E',
      dark: '#087F23',
    },
    secondary: {
      main: '#E8F5E9', // Light mint background
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
  },
  typography: {
    fontFamily: '"Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: '3.5rem',
      fontWeight: 700,
      color: '#2E2E2E',
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 600,
        },
      },
    },
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #E8F5E9 0%, #FFFFFF 100%)',
        }}
      >
        <Header />
        <Container maxWidth="lg" sx={{ mt: 4 }}>
          <MealPlanner />
        </Container>
      </Box>
    </ThemeProvider>
  );
}

export default App; 