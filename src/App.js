import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import { CssBaseline, Box, Container } from '@mui/material';
import Header from './components/Header';
import Footer from './components/Footer';
import MealPlanner from './components/MealPlanner';
import Recipes from './components/Recipes';
import AdminPanel from './components/AdminPanel';
import Login from './components/Auth/Login';
import SignUp from './components/Auth/SignUp';
import { getMealCategories } from './services/mealService';
import AddMealForm from './components/AddMealForm';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import RecipeDetails from './components/RecipeDetails';
import Dashboard from './components/Dashboard';

const theme = createTheme({
  palette: {
    primary: {
      main: '#5ebd21', // Brighter green
      light: '#98EE99',
      dark: '#338A3E',
    },
    secondary: {
      main: '#E8F5E9', // Light mint background
    },
    background: {
      default: '#FFFFFF',
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2E2E2E',
      secondary: '#666666',
    },
  },
  typography: {
    fontFamily: '"Nunito", "Segoe UI", "Helvetica Neue", Arial, sans-serif',
    h1: {
      fontSize: { xs: '2.5rem', sm: '3.5rem' },
      fontWeight: 800,
      color: '#2E2E2E',
    },
    h2: {
      fontSize: { xs: '2rem', sm: '2.5rem' },
      fontWeight: 700,
    },
    h3: {
      fontSize: { xs: '1.75rem', sm: '2rem' },
      fontWeight: 700,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      fontWeight: 500,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 6,
          textTransform: 'none',
          fontWeight: 600,
          padding: '8px 16px',
        },
        contained: {
          boxShadow: 'none',
          color: '#FFFFFF',
          '&:hover': {
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#FFFFFF',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        },
      },
    },
    MuiContainer: {
      styleOverrides: {
        root: {
          padding: { xs: '16px', sm: '24px' },
        },
      },
    },
  },
});

function App() {
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getMealCategories();
      } catch (err) {
        setError(err.message);
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  return (
    <AuthProvider>
      <Router>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Box
            sx={{
              minHeight: '100vh',
              display: 'flex',
              flexDirection: 'column',
              backgroundColor: '#FFFFFF',
            }}
          >
            <Header />
            <Container 
              maxWidth="lg" 
              sx={{ 
                mt: { xs: 2, sm: 4 },
                mb: { xs: 2, sm: 4 },
                flex: 1,
              }}
            >
              <Routes>
                <Route path="/" element={<MealPlanner />} />
                <Route path="/recipes" element={<Recipes />} />
                <Route path="/recipes/:id" element={<RecipeDetails />} />
                <Route path="/add-recipe" element={<AddMealForm onSubmit={() => {}} onCancel={() => {}} />} />
                <Route path="/admin" element={
                  <ProtectedRoute>
                    <AdminPanel />
                  </ProtectedRoute>
                } />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<SignUp />} />
                <Route path="/dashboard" element={<Dashboard />} />
              </Routes>
            </Container>
            {error && (
              <Box sx={{ p: 2, backgroundColor: 'error.light', color: 'error.contrastText' }}>
                Error: {error}
              </Box>
            )}
            <Footer />
          </Box>
        </ThemeProvider>
      </Router>
    </AuthProvider>
  );
}

export default App;