import React from 'react';
import { Box, Typography } from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';

export default function Logo({ size = 'medium' }) {
  const sizes = {
    small: {
      icon: 24,
      text: '1.25rem',
    },
    medium: {
      icon: 32,
      text: '1.5rem',
    },
    large: {
      icon: 40,
      text: '2rem',
    },
  };

  const currentSize = sizes[size];

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1,
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <RestaurantMenuIcon
        sx={{
          fontSize: currentSize.icon,
          color: 'primary.main',
        }}
      />
      <Typography
        variant="h6"
        sx={{
          fontSize: currentSize.text,
          fontWeight: 800,
          background: 'linear-gradient(45deg, #5ebd21 30%, #98EE99 90%)',
          backgroundClip: 'text',
          WebkitBackgroundClip: 'text',
          color: 'transparent',
        }}
      >
        MealBuddy
      </Typography>
    </Box>
  );
} 