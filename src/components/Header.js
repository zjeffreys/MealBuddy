import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

function Header() {
  return (
    <AppBar position="static" color="transparent" elevation={0}>
      <Toolbar>
        <Box display="flex" alignItems="center" sx={{ flexGrow: 1 }}>
          <RestaurantMenuIcon sx={{ color: 'primary.main', fontSize: 32, mr: 1 }} />
          <Typography
            variant="h6"
            component="div"
            sx={{
              flexGrow: 1,
              fontWeight: 700,
              color: 'primary.main',
              fontSize: '1.5rem',
            }}
          >
            MealBuddy
          </Typography>
        </Box>
        <Button color="primary" variant="text" sx={{ mx: 1 }}>
          Recipes
        </Button>
        <Button color="primary" variant="text" sx={{ mx: 1 }}>
          Meal Plans
        </Button>
        <Button
          color="primary"
          variant="contained"
          sx={{
            ml: 2,
            px: 3,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
          }}
        >
          Get Started
        </Button>
      </Toolbar>
    </AppBar>
  );
}

export default Header; 