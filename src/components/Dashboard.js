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
        {/* Removed the "Hungry Now?" section */}
      </div>

      <MealPlanner />
    </div>
  );
};

export default Dashboard;