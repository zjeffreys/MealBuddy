import React, { useState } from 'react';
import { Box, Button, Alert, CircularProgress } from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const seedCategories = async () => {
  const categories = [
    { name: 'Breakfast', description: 'Morning meals' },
    { name: 'Lunch', description: 'Midday meals' },
    { name: 'Dinner', description: 'Evening meals' },
    { name: 'Snack', description: 'Small meals between main meals' },
    { name: 'Dessert', description: 'Sweet treats' }
  ];

  const { error } = await supabase
    .from('meal_categories')
    .insert(categories);

  if (error) throw error;
};

const seedTags = async () => {
  const tags = [
    { name: 'Vegetarian', description: 'Contains no meat or fish' },
    { name: 'Vegan', description: 'Contains no animal products' },
    { name: 'Gluten-Free', description: 'Contains no gluten' },
    { name: 'Dairy-Free', description: 'Contains no dairy' },
    { name: 'High-Protein', description: 'Rich in protein' },
    { name: 'Low-Carb', description: 'Low in carbohydrates' },
    { name: 'Quick & Easy', description: 'Can be prepared quickly' },
    { name: 'Meal Prep', description: 'Good for meal prepping' }
  ];

  const { error } = await supabase
    .from('dietary_tags')
    .insert(tags);

  if (error) throw error;
};

const AdminPanel = () => {
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSeedDatabase = async () => {
    setLoading(true);
    setStatus(null);

    try {
      await seedCategories();
      await seedTags();
      setStatus({ type: 'success', message: 'Database seeded successfully!' });
    } catch (error) {
      console.error('Error seeding database:', error);
      setStatus({ type: 'error', message: 'Failed to seed database. Check console for details.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Button
        variant="contained"
        onClick={handleSeedDatabase}
        disabled={loading}
        sx={{ mb: 2 }}
      >
        {loading ? <CircularProgress size={24} /> : 'Seed Database'}
      </Button>

      {status && (
        <Alert severity={status.type} sx={{ mt: 2 }}>
          {status.message}
        </Alert>
      )}
    </Box>
  );
};

export default AdminPanel; 