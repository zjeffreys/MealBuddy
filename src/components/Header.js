import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const handleAddMeal = () => {
    navigate('/add-recipe');
  };

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderNavButton = (to, label, requiresAuth = false) => {
    if (requiresAuth && !user) {
      return (
        <Button
          component={Link}
          to={to}
          color="inherit"
          startIcon={<LockIcon />}
        >
          {label}
        </Button>
      );
    }
    return (
      <Button
        component={Link}
        to={to}
        color="inherit"
      >
        {label}
      </Button>
    );
  };

  return (
    <AppBar position="sticky" sx={{ boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
      <Toolbar>
        <Box
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <Logo size={isMobile ? 'small' : 'medium'} />
        </Box>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {renderNavButton('/recipes', 'Recipes')}
          <Button
            variant="contained"
            color="primary"
            startIcon={<AddIcon />}
            onClick={handleAddMeal}
            sx={{
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              px: 2,
              ml: 1,
              backgroundColor: 'primary.main',
              '&:hover': {
                backgroundColor: 'primary.dark',
              },
            }}
          >
            {isMobile ? 'Add Meal' : 'Add New Meal'}
          </Button>
          {user ? (
            <Button
              variant="outlined"
              color="inherit"
              onClick={handleSignOut}
              sx={{ whiteSpace: 'nowrap' }}
            >
              Sign Out
            </Button>
          ) : (
            <>
              <Button
                variant="outlined"
                color="inherit"
                component={Link}
                to="/login"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Sign In
              </Button>
              <Button
                variant="contained"
                color="primary"
                component={Link}
                to="/signup"
                sx={{ whiteSpace: 'nowrap' }}
              >
                Sign Up
              </Button>
            </>
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
} 