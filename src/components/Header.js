import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  useMediaQuery,
  useTheme,
  Menu,
  MenuItem,
  IconButton,
  Avatar,
  Divider,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleAddMeal = () => {
    navigate('/add-recipe');
  };

  const handleProfileClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleAccountSettings = () => {
    handleClose();
    navigate('/account-settings');
  };

  const handleSignOut = async () => {
    handleClose();
    try {
      await signOut();
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const renderNavButton = (to, label, requiresAuth = false) => {
    if (requiresAuth && !user) {
      return null; // Don't render the button at all if it requires auth and user is not logged in
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
          {renderNavButton('/dashboard', 'Dashboard', true)} {/* Added requiresAuth=true */}
          {user && (
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
          )}
          {user ? (
            <>
              <IconButton 
                onClick={handleProfileClick}
                aria-controls={open ? 'profile-menu' : undefined}
                aria-haspopup="true"
                aria-expanded={open ? 'true' : undefined}
                sx={{ 
                  p: 0, 
                  ml: 1,
                  border: '2px solid',
                  borderColor: 'primary.main' 
                }}
              >
                <Avatar 
                  alt={user.email || 'User'} 
                  src={user.user_metadata?.avatar_url || ''} 
                  sx={{ width: 36, height: 36 }}
                >
                  {!user.user_metadata?.avatar_url && <AccountCircleIcon fontSize="large" />}
                </Avatar>
              </IconButton>
              <Menu
                id="profile-menu"
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                  'aria-labelledby': 'profile-button',
                }}
                anchorOrigin={{
                  vertical: 'bottom',
                  horizontal: 'right',
                }}
                transformOrigin={{
                  vertical: 'top',
                  horizontal: 'right',
                }}
                PaperProps={{
                  elevation: 3,
                  sx: {
                    minWidth: 180,
                    mt: 0.5,
                    '& .MuiMenuItem-root': {
                      px: 2,
                      py: 1,
                    },
                  },
                }}
              >
                <MenuItem onClick={handleAccountSettings}>
                  <SettingsIcon sx={{ mr: 1.5 }} />
                  Account Settings
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleSignOut}>
                  <LogoutIcon sx={{ mr: 1.5 }} />
                  Logout
                </MenuItem>
              </Menu>
            </>
          ) : (
            !user && (
              <Button
                variant="contained"
                color="success"
                component={Link}
                to="/signup"
                sx={{
                  whiteSpace: 'nowrap',
                  backgroundColor: '#5ebd21',
                  '&:hover': {
                    backgroundColor: '#4ca91b',
                  },
                  fontWeight: 'bold',
                  px: 3,
                  py: 1,
                  borderRadius: '4px',
                }}
              >
                Get Started
              </Button>
            )
          )}
        </Box>
      </Toolbar>
    </AppBar>
  );
}