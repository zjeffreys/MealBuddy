import React, { useState, useEffect } from 'react';
import {
  Grid,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Container,
  CircularProgress,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Stack,
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import { getImageUrl } from '../services/mealService';

const Recipes = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    fetchMeals();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('meal_categories')
      .select('*');
    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchMeals = async () => {
    try {
      const { data, error } = await supabase
        .from('meals')
        .select('*');

      if (error) throw error;

      // Add image URLs and process the data
      const processedMeals = data.map(meal => ({
        ...meal,
        imageUrl: getImageUrl(meal.image),
        totalTime: (meal.prep_time || 0) + (meal.cook_time || 0)
      }));

      setMeals(processedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMeals = meals.filter(meal => {
    const matchesCategory = filter === 'all' || (meal.category && meal.category.includes(filter));
    const matchesSearch = meal.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         (meal.description && meal.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Our Recipes
      </Typography>

      <Box sx={{ mb: 4 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search recipes"
              variant="outlined"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} md={6}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={filter}
                label="Category"
                onChange={(e) => setFilter(e.target.value)}
              >
                <MenuItem value="all">All Categories</MenuItem>
                {categories.map((category) => (
                  <MenuItem key={category.id} value={category.name}>
                    {category.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {filteredMeals.map((meal) => (
          <Grid item xs={12} sm={6} md={4} key={meal.id}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {meal.imageUrl && (
                <CardMedia
                  component="img"
                  height="200"
                  image={meal.imageUrl}
                  alt={meal.name}
                  sx={{ objectFit: 'cover' }}
                />
              )}
              <CardContent sx={{ flexGrow: 1 }}>
                <Typography gutterBottom variant="h6" component="h2">
                  {meal.name}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  {meal.description}
                </Typography>
                
                <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <AccessTimeIcon color="action" fontSize="small" />
                    <Typography variant="body2" color="text.secondary">
                      {meal.totalTime} min
                    </Typography>
                  </Box>
                </Stack>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {meal.category && meal.category.map((cat, index) => (
                    <Chip
                      key={`${index}-${cat}`}
                      label={cat}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                  ))}
                  {meal.tags && meal.tags.map((tag, index) => (
                    <Chip
                      key={`${index}-${tag}`}
                      label={tag}
                      size="small"
                      color="secondary"
                      variant="outlined"
                    />
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default Recipes; 