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
import { useNavigate } from 'react-router-dom';

const Recipes = () => {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate();

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
      // Fetch meals with chef data from the database
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*, chef:chefs(id, name, profile_image)');

      if (mealsError) throw mealsError;

      // Fetch dietary tags from the database
      const { data: tagsData, error: tagsError } = await supabase
        .from('dietary_tags')
        .select('*');

      if (tagsError) throw tagsError;

      // Fetch meal categories from the database
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('meal_categories')
        .select('*');

      if (categoriesError) throw categoriesError;

      console.log('Fetched meals:', mealsData);
      console.log('Fetched tags:', tagsData);
      console.log('Fetched categories:', categoriesData);

      // Map tag IDs to tag names and category IDs to category names
      const processedMeals = mealsData.map(meal => {
        const mappedTags = (meal.tags || []).map(tagId => {
          const tag = tagsData.find(tag => tag.id === tagId);
          if (!tag) {
            console.warn(`Unmatched tag ID: ${tagId}`);
            return `Unknown Tag (${tagId})`; // Include the ID for easier debugging
          }
          return tag.name;
        });

        const mappedCategories = (meal.category || []).map(categoryId => {
          const category = categoriesData.find(cat => cat.id === categoryId);
          if (!category) {
            console.warn(`Unmatched category ID: ${categoryId}`);
            return `Unknown Category (${categoryId})`; // Include the ID for easier debugging
          }
          return category.name;
        });

        return {
          ...meal,
          imageUrl: getImageUrl(meal.image),
          totalTime: (meal.prep_time || 0) + (meal.cook_time || 0),
          tags: mappedTags,
          category: mappedCategories,
          chef: meal.chef // Include chef data
        };
      });

      setMeals(processedMeals);
    } catch (error) {
      console.error('Error fetching meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCardClick = (mealId) => {
    navigate(`/recipes/${mealId}`);
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
            <Card
              sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
              onClick={() => handleCardClick(meal.id)}
            >
              {meal.image && (
                <CardMedia
                  component="img"
                  height="200"
                  image={meal.image}
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
                      sx={{ backgroundColor: '#1976d2', color: 'white' }} // Improved visibility
                    />
                  ))}
                  {meal.tags && meal.tags.map((tag, index) => (
                    <Chip
                      key={`${index}-${tag}`}
                      label={tag}
                      size="small"
                      color="secondary"
                      sx={{ backgroundColor: '#388e3c', color: 'white' }} // Improved visibility
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 2 }}>
                  {meal.tags && meal.tags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      size="small"
                      sx={{ backgroundColor: 'green', color: 'white' }}
                    />
                  ))}
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2 }}>
                  {meal.chef ? (
                    <>
                      <img
                        src={meal.chef.profile_image || 'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                        alt={meal.chef.name || 'Anonymous Chef'}
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {meal.chef.name || 'Anonymous Chef'}
                      </Typography>
                    </>
                  ) : (
                    <>
                      <img
                        src={'https://upload.wikimedia.org/wikipedia/commons/a/ac/Default_pfp.jpg'}
                        alt={'Anonymous Chef'}
                        style={{ width: 40, height: 40, borderRadius: '50%' }}
                      />
                      <Typography variant="body2" color="text.secondary">
                        {'Anonymous Chef'}
                      </Typography>
                    </>
                  )}
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