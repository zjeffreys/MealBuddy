import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { supabase } from '../lib/supabaseClient';
import { getMealCategories, getDietaryTags } from '../services/mealService';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  Grid,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MealPlanner from './MealPlanner';

const Dashboard = () => {
  const [recommendedMeals, setRecommendedMeals] = useState([]);
  const [showRecommendations, setShowRecommendations] = useState(false);

  const handleHungryNowClick = () => {
    setShowRecommendations(true);
  };

  useEffect(() => {
    const fetchRecommendedMeals = async () => {
      try {
        const [categoriesData, tagsData] = await Promise.all([
          getMealCategories(),
          getDietaryTags(),
        ]);

        const { data: mealsData, error } = await supabase
          .from('meals')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(3);

        if (error) throw error;

        const processedMeals = mealsData.map((meal) => {
          console.log('Tags Data:', tagsData);
          console.log('Meal Tags:', meal.tags);

          const mappedDietaryTags = (meal.tags || []).map((tagId) => {
            const tag = tagsData.find((tag) => tag.id === tagId);
            return tag ? tag.label : `Unknown Tag (${tagId})`;
          });

          const mappedCategories = (meal.category || []).map((categoryId) => {
            const category = categoriesData.find((cat) => cat.id === categoryId);
            return category ? category.name : `Unknown Category (${categoryId})`;
          });

          return {
            ...meal,
            dietaryTags: mappedDietaryTags, // Map dietary tags correctly from Supabase UUIDs
            category: mappedCategories,
          };
        });

        setRecommendedMeals(processedMeals);
        console.log('Processed Recommended Meals:', processedMeals);
      } catch (err) {
        console.error('Error fetching recommended meals:', err);
      }
    };

    fetchRecommendedMeals();
  }, []);

  return (
    <div className="dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-sections">
        <div className="dashboard-card">
          <h2>Hungry Now?</h2>
          <p>Get instant meal suggestions based on what you have</p>
          <button onClick={handleHungryNowClick}>I'm Hungry Now!</button>
        </div>
      </div>

      {showRecommendations && (
        <>
          <h2>Recommended For You</h2>
          <Grid container spacing={3}>
            {recommendedMeals.map((meal) => (
              <Grid item xs={12} sm={6} md={4} key={meal.id}>
                <Card
                  sx={{ height: '100%', display: 'flex', flexDirection: 'column', cursor: 'pointer' }}
                >
                  <CardMedia
                    component="img"
                    height="200"
                    image={meal.image}
                    alt={meal.name}
                    sx={{ objectFit: 'cover' }}
                  />
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
                          {meal.prep_time + meal.cook_time} min
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
                          sx={{ backgroundColor: '#1976d2', color: 'white' }}
                        />
                      ))}
                      {meal.dietaryTags && meal.dietaryTags.map((tag, index) => (
                        <Chip
                          key={`${index}-${tag}`}
                          label={tag}
                          size="small"
                          color="secondary"
                          sx={{ backgroundColor: '#388e3c', color: 'white' }}
                        />
                      ))}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      <MealPlanner />
    </div>
  );
};

export default Dashboard;