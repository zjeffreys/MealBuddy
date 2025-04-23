import React from 'react';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        px: 2,
        mt: 'auto',
        backgroundColor: 'primary.main',
        color: 'white',
      }}
    >
      <Container maxWidth="lg">
        <Grid container spacing={4}>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              MealBuddy
            </Typography>
            <Typography variant="body2">
              Your personal meal planning companion
            </Typography>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Quick Links
            </Typography>
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              <Link component={RouterLink} to="/" color="inherit" sx={{ mb: 1 }}>
                Meal Planner
              </Link>
              <Link component={RouterLink} to="/recipes" color="inherit" sx={{ mb: 1 }}>
                Recipes
              </Link>
              <Link component={RouterLink} to="/admin" color="inherit">
                Admin
              </Link>
            </Box>
          </Grid>
          <Grid item xs={12} sm={4}>
            <Typography variant="h6" gutterBottom>
              Connect
            </Typography>
            <Typography variant="body2">
              Have questions or suggestions?
            </Typography>
            <Typography variant="body2">
              Contact us at: support@mealbuddy.com
            </Typography>
          </Grid>
        </Grid>
        <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid rgba(255, 255, 255, 0.1)' }}>
          <Typography variant="body2" align="center">
            © {new Date().getFullYear()} MealBuddy. All rights reserved.
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 