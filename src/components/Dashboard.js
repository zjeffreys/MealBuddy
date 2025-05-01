import React, { useEffect, useState } from 'react';
import './Dashboard.css';
import { supabase } from '../lib/supabaseClient';
import { getMealCategories, getDietaryTags, getImageUrl } from '../services/mealService';
import {
  Card,
  CardContent,
  Typography,
  Box,
  Stack,
  Grid,
  TextField,
  Button,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MealPlanner from './MealPlanner';
import { format } from 'date-fns';
import SubscribedDietPlans from './SubscribedDietPlans';
import { FaBacon, FaWeight, FaLeaf } from 'react-icons/fa';
import Modal from 'react-modal';
import { meals as staticMeals } from '../data/meals';
import MealCard from './MealCard';

const Dashboard = () => {
  const [cravingInput, setCravingInput] = useState('');
  const [timeOfDay, setTimeOfDay] = useState('');
  const [currentDateTime, setCurrentDateTime] = useState('');
  const [dietPlans, setDietPlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestedMeals, setSuggestedMeals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [tags, setTags] = useState([]);

  const filteredPlans = dietPlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  useEffect(() => {
    const determineTimeOfDay = () => {
      const currentHour = new Date().getHours();
      if (currentHour < 11) return 'breakfast';
      if (currentHour < 17) return 'lunch';
      return 'dinner';
    };

    setTimeOfDay(determineTimeOfDay());
  }, []);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const formattedDateTime = format(now, 'EEEE, MMMM do, yyyy h:mm a');
      setCurrentDateTime(formattedDateTime);
    };

    updateDateTime();
  }, []);

  useEffect(() => {
    const fetchSuggestedMeals = async () => {
      try {
        // Fetch meals, categories, and tags in parallel
        const [{ data: mealsData, error: mealsError }, { data: categoriesData }, { data: tagsData }] = await Promise.all([
          supabase.from('meals').select('*').limit(3),
          supabase.from('meal_categories').select('*'),
          supabase.from('dietary_tags').select('*'),
        ]);
        if (mealsError) throw mealsError;
        setCategories(categoriesData || []);
        setTags(tagsData || []);
        // Map category and tag IDs to names
        const processed = (mealsData || []).map(meal => ({
          ...meal,
          imageUrl: meal.image,
          categoryNames: (meal.category || []).map(cid => {
            const cat = (categoriesData || []).find(c => c.id === cid);
            return cat ? cat.name : cid;
          }),
          tagNames: (meal.tags || []).map(tid => {
            const tag = (tagsData || []).find(t => t.id === tid);
            return tag ? tag.name : tid;
          })
        }));
        setSuggestedMeals(processed);
      } catch (err) {
        setSuggestedMeals([]);
      }
    };
    fetchSuggestedMeals();
  }, []);

  const handleCravingSubmit = async () => {
    try {
      const { data: mealsData, error } = await supabase
        .from('meals')
        .select('*')
        .ilike('tags', `%${cravingInput}%`)
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;

      console.log(mealsData);
    } catch (err) {
      console.error('Error fetching meals based on craving:', err);
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-sections">
        <SubscribedDietPlans 
          dietPlans={filteredPlans} 
          setDietPlans={setDietPlans} 
          toggleModal={toggleModal} 
        />

        <Modal
          isOpen={isModalOpen}
          onRequestClose={toggleModal}
          contentLabel="Manage Diet Plans"
          className="modal"
          overlayClassName="overlay"
          ariaHideApp={false}
        >
          <h2>Manage Diet Plans</h2>
          <button onClick={toggleModal}>Close</button>
          {/* Add logic for managing diet plans here */}
        </Modal>

        <Card style={{ margin: '20px 0', padding: '20px', background: 'linear-gradient(135deg, #f5f7fa, #c3cfe2)', borderRadius: '15px', boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)', width: '100%' }}>
          <CardContent>
            <h2 style={{ fontFamily: 'Poppins, sans-serif', fontWeight: 'bold', color: '#333' }}>🌟 Smart Meal Suggestions</h2>
            <Typography variant="body1" color="textSecondary" style={{ marginBottom: '10px', fontSize: '1.1rem' }}>
              📅 Current Date and Time: {currentDateTime}
            </Typography>
            <Typography variant="body1" color="textSecondary" style={{ marginBottom: '20px', fontSize: '1.2rem', fontStyle: 'italic' }}>
              {timeOfDay === 'breakfast' && '☀️ Good Morning! Start your day with a delicious breakfast.'}
              {timeOfDay === 'lunch' && '🌞 Good Afternoon! Here are some lunch ideas to keep you energized.'}
              {timeOfDay === 'dinner' && '🌙 Good Evening! Unwind with these dinner suggestions.'}
            </Typography>
            <p style={{ fontSize: '1.3rem', fontWeight: '500', color: '#555' }}>Suggestions for {timeOfDay}:</p>
            <Grid container spacing={2}>
              {suggestedMeals.map((meal) => {
                // Compose the meal object for MealCard
                const mealCardObj = {
                  id: meal.id,
                  name: meal.name,
                  description: meal.description,
                  image: meal.imageUrl,
                  dietaryInfo: meal.dietary_info || {},
                  prepTime: meal.prep_time || 0,
                  cookTime: meal.cook_time || 0,
                  tags: [...(meal.categoryNames || []), ...(meal.tagNames || [])],
                  ingredients: meal.ingredients,
                  instructions: meal.instructions,
                  chef: meal.chef,
                  servings: meal.servings,
                  difficulty: meal.difficulty,
                };
                return (
                  <Grid item xs={12} sm={6} md={4} key={meal.id}>
                    <MealCard meal={mealCardObj} />
                  </Grid>
                );
              })}
            </Grid>

            <Box mt={4}>
              <TextField
                label="I'm craving..."
                variant="outlined"
                fullWidth
                value={cravingInput}
                onChange={(e) => setCravingInput(e.target.value)}
                style={{ marginBottom: '10px', borderRadius: '5px' }}
              />
              <Button
                variant="contained"
                style={{ backgroundColor: '#4caf50', color: '#fff', fontWeight: 'bold', padding: '10px 20px', borderRadius: '5px' }}
                onClick={handleCravingSubmit}
              >
                🍴 Find Meals
              </Button>
            </Box>
          </CardContent>
        </Card>
      </div>

      <MealPlanner />
    </div>
  );
};

export default Dashboard;