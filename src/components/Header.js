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
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import LockIcon from '@mui/icons-material/Lock';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import SettingsIcon from '@mui/icons-material/Settings';
import LogoutIcon from '@mui/icons-material/Logout';
import MenuIcon from '@mui/icons-material/Menu';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { useAuth } from '../contexts/AuthContext';
import Logo from './Logo';

export default function Header() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const handleAddMeal = () => {
    if (isMobile) {
      setDrawerOpen(false);
    }
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

  const toggleDrawer = (open) => (event) => {
    if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
      return;
    }
    setDrawerOpen(open);
  };

  const handleNavigation = (path) => {
    navigate(path);
    setDrawerOpen(false);
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

  const mobileDrawer = (
    <Box
      sx={{ width: 250 }}
      role="presentation"
      onClick={toggleDrawer(false)}
      onKeyDown={toggleDrawer(false)}
    >
      <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
        <Logo size="small" />
      </Box>
      <Divider />
      <List>
        <ListItem button onClick={() => handleNavigation('/')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/recipes')}>
          <ListItemIcon>
            <RestaurantIcon />
          </ListItemIcon>
          <ListItemText primary="Recipes" />
        </ListItem>
        <ListItem button onClick={() => handleNavigation('/pricing')}>
          <ListItemIcon>
            <LockIcon />
          </ListItemIcon>
          <ListItemText primary="Pricing" />
        </ListItem>
        {user && (
          <>
            <ListItem button onClick={() => handleNavigation('/dashboard')}>
              <ListItemIcon>
                <DashboardIcon />
              </ListItemIcon>
              <ListItemText primary="Dashboard" />
            </ListItem>
            <ListItem button onClick={handleAddMeal}>
              <ListItemIcon>
                <AddIcon />
              </ListItemIcon>
              <ListItemText primary="Add New Meal" />
            </ListItem>
          </>
        )}
      </List>
      <Divider />
      {user ? (
        <List>
          <ListItem button onClick={handleAccountSettings}>
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Account Settings" />
          </ListItem>
          <ListItem button onClick={handleSignOut}>
            <ListItemIcon>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      ) : (
        <List>
          <ListItem button onClick={() => handleNavigation('/signup')}>
            <ListItemIcon>
              <AccountCircleIcon />
            </ListItemIcon>
            <ListItemText primary="Get Started" />
          </ListItem>
        </List>
      )}
    </Box>
  );

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
        
        {/* Mobile Menu */}
        {isMobile ? (
          <>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="menu"
              onClick={toggleDrawer(true)}
              sx={{ ml: 1 }}
            >
              <MenuIcon />
            </IconButton>
            <Drawer
              anchor="right"
              open={drawerOpen}
              onClose={toggleDrawer(false)}
            >
              {mobileDrawer}
            </Drawer>
          </>
        ) : (
          // Desktop Menu
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
            {renderNavButton('/recipes', 'Recipes')}
            {renderNavButton('/pricing', 'Pricing')}
            {renderNavButton('/dashboard', 'Dashboard', true)}
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
                Add New Meal
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
        )}
      </Toolbar>
    </AppBar>
  );
}