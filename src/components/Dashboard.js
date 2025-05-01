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
import SendIcon from '@mui/icons-material/Send';
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

        <Card
          className="smart-meal-card"
          style={{
            margin: '20px 0',
            padding: 0,
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            width: '100%',
            border: 'none',
            position: 'relative', // for arrow positioning
            overflow: 'hidden',
          }}
        >
          <CardContent style={{ padding: 0 }}>
            <h2 className="smart-meal-title">
              Smart Meal Suggestions
            </h2>
            <Typography className="smart-meal-subtext" variant="body2">
              Get inspired! Browse personalized meal ideas or search for something you’re craving below.
            </Typography>
            <Box mt={2} style={{ padding: '0 0 20px 0' }}>
              <div style={{ position: 'relative', width: '100%' }}>
                <TextField
                  label="I'm craving..."
                  variant="outlined"
                  fullWidth
                  value={cravingInput}
                  onChange={(e) => setCravingInput(e.target.value)}
                  style={{ marginBottom: '10px', borderRadius: '5px' }}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleCravingSubmit(); }}
                  InputProps={{
                    style: { paddingRight: 48 },
                  }}
                />
                <button
                  onClick={handleCravingSubmit}
                  className="send-craving-btn"
                  aria-label="Send"
                  tabIndex={0}
                  type="button"
                >
                  <ArrowForwardIcon style={{ fontSize: 28, display: 'block', margin: 'auto' }} />
                </button>
              </div>
            </Box>
            <div style={{ position: 'relative', width: '100%', minHeight: 420 }}>
              <Typography variant="body1" color="textSecondary" className="meal-message-bubble">
                {timeOfDay === 'breakfast' && '☀️ Good Morning! Start your day with these breakfast suggestions.'}
                {timeOfDay === 'lunch' && '🌞 Good Afternoon! Here are some lunch ideas to keep you energized.'}
                {timeOfDay === 'dinner' && '🌙 Good Evening! Unwind with these dinner suggestions.'}
              </Typography>
              {/* Left Arrow - overlay inside scroll area */}
              <button
                style={{
                  position: 'absolute',
                  left: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollLeft ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  opacity: canScrollLeft ? 1 : 0.5,
                  pointerEvents: canScrollLeft ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                }}
                onClick={scrollLeft}
                aria-label="Scroll left"
                tabIndex={0}
              >
                <ChevronLeftIcon style={{ fontSize: 24 }} />
              </button>
              {/* Right Arrow - overlay inside scroll area */}
              <button
                style={{
                  position: 'absolute',
                  right: 8,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 3,
                  background: 'rgba(255,255,255,0.85)',
                  border: 'none',
                  borderRadius: '50%',
                  width: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: canScrollRight ? 'pointer' : 'not-allowed',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.10)',
                  opacity: canScrollRight ? 1 : 0.5,
                  pointerEvents: canScrollRight ? 'auto' : 'none',
                  transition: 'opacity 0.2s',
                }}
                onClick={scrollRight}
                aria-label="Scroll right"
                tabIndex={0}
              >
                <ChevronRightIcon style={{ fontSize: 24 }} />
              </button>
              <div
                className="meals"
                ref={mealsScrollRef}
                style={{
                  display: 'flex',
                  overflowX: 'hidden',
                  gap: '16px',
                  padding: '16px 32px', // padding for arrows
                  background: '#fff',
                  borderRadius: '8px',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                  margin: 0,
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
                    <div
                      key={meal.id}
                      style={{
                        minWidth: 280,
                        maxWidth: 280,
                        minHeight: 380,
                        maxHeight: 380,
                        flex: '0 0 auto',
                        display: 'flex',
                        background: '#fff',
                        borderRadius: '8px',
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                      }}
                    >
                      <MealCard meal={mealCardObj} />
                    </div>
                  );
                })}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <MealPlanner />
    </div>
  );
};

export default Dashboard;