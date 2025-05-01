import React, { useEffect, useState, useRef } from 'react';
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
  Chip,
  InputAdornment,
  IconButton,
  Paper,
  Divider,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import MealPlanner from './MealPlanner';
import { format } from 'date-fns';
import SubscribedDietPlans from './SubscribedDietPlans';
import { FaBacon, FaWeight, FaLeaf } from 'react-icons/fa';
import Modal from 'react-modal';
import { meals as staticMeals } from '../data/meals';
import MealCard from './MealCard';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import SearchIcon from '@mui/icons-material/Search';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

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
  const mealsScrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

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
          supabase.from('meals').select('*').limit(4), // changed from 3 to 4
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

  useEffect(() => {
    handleScroll();
  }, [suggestedMeals]);

  const handleCravingSubmit = async () => {
    try {
      const query = `${cravingInput} ${filteredPlans.map(plan => plan.name).join(' ')}`.trim();

      // Fetch similar meals from the backend
      const response = await fetch(`https://mealbuddybackend.onrender.com/search_meals?query=${encodeURIComponent(query)}`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch similar meals from backend');
      }

      const similarMeals = await response.json();

      if (!similarMeals || similarMeals.length === 0) {
        setSuggestedMeals([]);
        return;
      }

      // Extract IDs from the similar meals
      const mealIds = similarMeals.map(meal => meal.id);

      // Fetch meal details from Supabase using the IDs
      const { data: mealsData, error: mealsError } = await supabase
        .from('meals')
        .select('*')
        .in('id', mealIds);

      if (mealsError) {
        throw new Error('Failed to fetch meals from Supabase');
      }

      // Ensure each meal has a valid image source
      const processedMeals = (mealsData || []).map(meal => ({
        ...meal,
        imageUrl: meal.image || '/public/assets/logo.svg', // Default image if none exists
      }));

      setSuggestedMeals(processedMeals);
    } catch (err) {
      console.error('Error fetching meals based on craving:', err);
      setSuggestedMeals([]);
    }
  };

  const handleScroll = () => {
    const scrollElement = mealsScrollRef.current;
    if (scrollElement) {
      setCanScrollLeft(scrollElement.scrollLeft > 0);
      setCanScrollRight(scrollElement.scrollLeft < scrollElement.scrollWidth - scrollElement.clientWidth);
    }
  };

  const scrollLeft = () => {
    const scrollElement = mealsScrollRef.current;
    if (scrollElement) {
      scrollElement.scrollBy({ left: -280, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    const scrollElement = mealsScrollRef.current;
    if (scrollElement) {
      scrollElement.scrollBy({ left: 280, behavior: 'smooth' });
    }
  };

  return (
    <div className="dashboard">
      <h1>Welcome Back!</h1>
      <div className="dashboard-sections">
        <div style={{ marginBottom: 2 }}>
          <SubscribedDietPlans 
            dietPlans={filteredPlans} 
            setDietPlans={setDietPlans} 
            toggleModal={toggleModal} 
          />
        </div>

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

        <Paper
          elevation={2}
          className="smart-meal-card"
          sx={{
            margin: '20px 0',
            padding: 0,
            borderRadius: '12px',
            width: '100%',
            border: 'none',
            position: 'relative',
            overflow: 'hidden',
            background: '#fcfcfc', // Lighter, more subtle background color
          }}
        >
          <Box sx={{ padding: '20px 24px 0' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
              <RestaurantIcon sx={{ fontSize: 28, marginRight: '12px', color: '#4a90e2' }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600 }}>
                Smart Meal Suggestions
              </Typography>
            </Box>
            
            <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
              Get inspired! Browse personalized meal ideas or search for something specific.
            </Typography>

            {/* Search input with better styling */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              <TextField
                fullWidth
                placeholder="I'm craving..."
                variant="outlined"
                value={cravingInput}
                onChange={(e) => setCravingInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleCravingSubmit(); }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: cravingInput ? (
                    <InputAdornment position="end">
                      <IconButton
                        size="small"
                        aria-label="clear search"
                        onClick={() => setCravingInput('')}
                        edge="end"
                      >
                        <ClearIcon fontSize="small" />
                      </IconButton>
                    </InputAdornment>
                  ) : null,
                  sx: {
                    borderRadius: '10px',
                    '& .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#e0e0e0',
                    },
                  }
                }}
              />
              <Button 
                variant="contained"
                color="primary"
                onClick={handleCravingSubmit}
                sx={{
                  position: 'absolute',
                  right: '-1px',
                  top: '1px',
                  bottom: '1px',
                  borderRadius: '0 8px 8px 0',
                  minWidth: '54px',
                  boxShadow: 'none',
                }}
              >
                <ArrowForwardIcon />
              </Button>
            </Box>

            {/* Quick filter chips */}
            <Stack 
              direction="row" 
              spacing={1} 
              sx={{ overflowX: 'auto', pb: 2, flexWrap: 'nowrap' }}
            >
              <Chip
                label="Quick"
                variant="outlined"
                onClick={() => setCravingInput('quick')}
                sx={{ borderRadius: '16px' }}
              />
              <Chip
                label="Healthy"
                variant="outlined"
                onClick={() => setCravingInput('healthy')}
                sx={{ borderRadius: '16px' }}
              />
              <Chip
                label="Vegetarian"
                variant="outlined"
                onClick={() => setCravingInput('vegetarian')}
                sx={{ borderRadius: '16px' }}
              />
              <Chip
                label="High Protein"
                variant="outlined"
                onClick={() => setCravingInput('high protein')}
                sx={{ borderRadius: '16px' }}
              />
              <Chip
                label="Dessert"
                variant="outlined"
                onClick={() => setCravingInput('dessert')}
                sx={{ borderRadius: '16px' }}
              />
            </Stack>

            {/* Time based message with better styling */}
            <Paper
              elevation={0}
              sx={{
                background: timeOfDay === 'breakfast' ? '#FFF9E6' : 
                           timeOfDay === 'lunch' ? '#F0F7F0' : '#F4F1F8',
                padding: '16px',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                mb: 3,
                border: '1px solid',
                borderColor: timeOfDay === 'breakfast' ? '#F0E6C0' : 
                            timeOfDay === 'lunch' ? '#D0E6D0' : '#E0D6E6',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                <Typography variant="body1" sx={{ fontWeight: 500, color: 'text.primary' }}>
                  {timeOfDay === 'breakfast' && '☀️ Good Morning! Start your day with these breakfast suggestions.'}
                  {timeOfDay === 'lunch' && '🌞 Good Afternoon! Here are some lunch ideas to keep you energized.'}
                  {timeOfDay === 'dinner' && '🌙 Good Evening! Unwind with these dinner suggestions.'}
                </Typography>
              </Box>
            </Paper>
            
            {/* Meal suggestions area */}
            <Box sx={{ position: 'relative', mb: 3 }}>
              {/* Navigation arrows with improved styling */}
              {canScrollLeft && (
                <IconButton
                  onClick={scrollLeft}
                  aria-label="Scroll left"
                  sx={{
                    position: 'absolute',
                    left: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': { background: 'rgba(255,255,255,1)' },
                  }}
                >
                  <ChevronLeftIcon />
                </IconButton>
              )}
              {canScrollRight && (
                <IconButton
                  onClick={scrollRight}
                  aria-label="Scroll right"
                  sx={{
                    position: 'absolute',
                    right: -20,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    zIndex: 3,
                    background: 'rgba(255,255,255,0.9)',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
                    '&:hover': { background: 'rgba(255,255,255,1)' },
                  }}
                >
                  <ChevronRightIcon />
                </IconButton>
              )}
              
              {/* Improved meal cards container */}
              <Box
                ref={mealsScrollRef}
                sx={{
                  display: 'flex',
                  overflowX: 'auto',
                  gap: '16px',
                  pb: 2,
                  scrollbarWidth: 'none', // Firefox
                  '&::-webkit-scrollbar': {
                    display: 'none', // Chrome, Safari, Edge
                  },
                  '-ms-overflow-style': 'none', // IE
                  scrollBehavior: 'smooth',
                }}
                onScroll={handleScroll}
              >
                {suggestedMeals.map((meal) => {
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
                    <Box
                      key={meal.id}
                      sx={{
                        minWidth: 280,
                        maxWidth: 280,
                        height: 380,
                        flex: '0 0 auto',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        transition: 'all 0.1s ease',
                        border: '1px solid #eaeaea',
                        '&:hover': {
                          borderColor: '#d0d0d0',
                        },
                      }}
                    >
                      <MealCard meal={mealCardObj} />
                    </Box>
                  );
                })}
              </Box>
            </Box>
          </Box>
        </Paper>
      </div>

      <MealPlanner />
    </div>
  );
};

export default Dashboard;