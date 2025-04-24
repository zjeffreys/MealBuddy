import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Paper,
  CircularProgress,
  FormControl,
  Stack,
  Checkbox,
  FormGroup,
  FormControlLabel,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  ToggleButton,
  ToggleButtonGroup,
  Chip,
  AppBar,
  Toolbar,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import SendIcon from '@mui/icons-material/Send';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import RepeatIcon from '@mui/icons-material/Repeat';
import TodayIcon from '@mui/icons-material/Today';
import AddIcon from '@mui/icons-material/Add';
import { addDays, format, startOfToday, endOfToday } from 'date-fns';
import { generateMealPlan, getDietaryTags } from '../services/mealService';
import MealCard from './MealCard';
import AddMealForm from './AddMealForm';

// Mock data for meal suggestions (replace with actual API calls later)
const mockMeals = [
  {
    id: 1,
    name: 'Grilled Chicken Salad',
    image: 'https://source.unsplash.com/random/400x300/?salad',
    calories: 350,
    time: '25 mins',
  },
  {
    id: 2,
    name: 'Salmon with Quinoa',
    image: 'https://source.unsplash.com/random/400x300/?salmon',
    calories: 450,
    time: '30 mins',
  },
  {
    id: 3,
    name: 'Vegetarian Stir Fry',
    image: 'https://source.unsplash.com/random/400x300/?stirfry',
    calories: 300,
    time: '20 mins',
  },
];

const thinkingPhrases = [
  "Analyzing your preferences...",
  "Exploring delicious options...",
  "Crafting your perfect meal plan...",
  "Considering nutritional balance...",
  "Finding the best recipes for you...",
];

const mealTypes = [
  { id: 'breakfast', label: 'Breakfast' },
  { id: 'lunch', label: 'Lunch' },
  { id: 'dinner', label: 'Dinner' },
  { id: 'snack', label: 'Snacks' },
];

const weekDays = [
  { id: 'monday', label: 'Mon' },
  { id: 'tuesday', label: 'Tue' },
  { id: 'wednesday', label: 'Wed' },
  { id: 'thursday', label: 'Thu' },
  { id: 'friday', label: 'Fri' },
  { id: 'saturday', label: 'Sat' },
  { id: 'sunday', label: 'Sun' },
];

function MealPlanner({ showAddMealForm, setShowAddMealForm }) {
  const [activeStep, setActiveStep] = useState(0);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [selectedMeals, setSelectedMeals] = useState({
    breakfast: false,
    lunch: false,
    dinner: false,
    snack: false,
  });
  const [planType, setPlanType] = useState('today');
  const [startDate, setStartDate] = useState(startOfToday());
  const [endDate, setEndDate] = useState(endOfToday());
  const [selectedDays, setSelectedDays] = useState([]);
  const [thinkingText, setThinkingText] = useState('');
  const [currentPhraseIndex, setCurrentPhraseIndex] = useState(0);
  const [currentCharIndex, setCurrentCharIndex] = useState(0);

  const handlePlanTypeChange = (event, newType) => {
    if (newType !== null) {
      setPlanType(newType);
      if (newType === 'today') {
        setStartDate(startOfToday());
        setEndDate(endOfToday());
      } else if (newType === 'date-range') {
        setStartDate(startOfToday());
        setEndDate(addDays(startOfToday(), 7));
      }
    }
  };

  const handleDayToggle = (day) => {
    setSelectedDays(prev => 
      prev.includes(day)
        ? prev.filter(d => d !== day)
        : [...prev, day]
    );
  };

  const handleMealTypeChange = (event) => {
    setSelectedMeals({
      ...selectedMeals,
      [event.target.name]: event.target.checked,
    });
  };

  const getSelectedMealTypes = () => {
    return Object.entries(selectedMeals)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  useEffect(() => {
    if (loading) {
      const phraseInterval = setInterval(() => {
        setCurrentPhraseIndex((prev) => (prev + 1) % thinkingPhrases.length);
        setCurrentCharIndex(0);
      }, 2000);

      const charInterval = setInterval(() => {
        setCurrentCharIndex((prev) => {
          const currentPhrase = thinkingPhrases[currentPhraseIndex];
          if (prev < currentPhrase.length) {
            setThinkingText(currentPhrase.substring(0, prev + 1));
            return prev + 1;
          }
          return prev;
        });
      }, 50);

      return () => {
        clearInterval(phraseInterval);
        clearInterval(charInterval);
      };
    } else {
      setThinkingText('');
      setCurrentPhraseIndex(0);
      setCurrentCharIndex(0);
    }
  }, [loading, currentPhraseIndex]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    // Generate dates array based on plan type
    let dates = [];
    if (planType === 'today') {
      dates = [new Date()];
    } else if (planType === 'date-range') {
      let currentDate = new Date(startDate);
      while (currentDate <= endDate) {
        dates.push(new Date(currentDate));
        currentDate.setDate(currentDate.getDate() + 1);
      }
    } else {
      // For recurring weekly plan, use the next occurrence of each selected day
      const today = new Date();
      dates = selectedDays.map(day => {
        const dayIndex = weekDays.findIndex(d => d.id === day);
        const date = new Date(today);
        const diff = (dayIndex + 7 - today.getDay()) % 7;
        date.setDate(date.getDate() + diff);
        return date;
      });
    }

    // Get selected meal types
    const selectedMealTypes = Object.entries(selectedMeals)
      .filter(([_, isSelected]) => isSelected)
      .map(([type]) => type);

    // Generate meal plan
    const plan = generateMealPlan({
      selectedDates: dates,
      selectedMealTypes,
      preferences: prompt,
      dietaryRestrictions: [], // Could be added as a filter in the future
      calorieTarget: null, // Could be added as a filter in the future
    });

    setSuggestions(plan);
    setLoading(false);
  };

  const handleAddMeal = (newMeal) => {
    // Here you would typically make an API call to save the meal
    console.log('New meal to be added:', newMeal);
    setShowAddMealForm(false);
  };

  const handleDownload = () => {
    const element = document.createElement('a');
    const file = new Blob([JSON.stringify(suggestions, null, 2)], {
      type: 'application/json',
    });
    element.href = URL.createObjectURL(file);
    element.download = 'meal-plan.json';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const steps = [
    {
      label: 'Choose When to Plan',
      content: (
        <Stack spacing={3}>
          <ToggleButtonGroup
            value={planType}
            exclusive
            onChange={handlePlanTypeChange}
            fullWidth
            sx={{ mb: 2 }}
          >
            <ToggleButton 
              value="today" 
              aria-label="today"
              sx={{ 
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <TodayIcon />
              <Typography variant="body2">Today</Typography>
            </ToggleButton>
            <ToggleButton 
              value="date-range" 
              aria-label="date range"
              sx={{ 
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <CalendarMonthIcon />
              <Typography variant="body2">Date Range</Typography>
            </ToggleButton>
            <ToggleButton 
              value="recurring" 
              aria-label="recurring"
              sx={{ 
                py: 2,
                display: 'flex',
                flexDirection: 'column',
                gap: 1
              }}
            >
              <RepeatIcon />
              <Typography variant="body2">Weekly</Typography>
            </ToggleButton>
          </ToggleButtonGroup>

          {planType === 'today' ? (
            <Box sx={{ textAlign: 'center' }}>
              <Typography variant="h6" color="primary" gutterBottom>
                Planning for Today
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {format(new Date(), 'EEEE, MMMM d, yyyy')}
              </Typography>
            </Box>
          ) : planType === 'date-range' ? (
            <LocalizationProvider dateAdapter={AdapterDateFns}>
              <Stack spacing={2}>
                <DatePicker
                  label="Start Date"
                  value={startDate}
                  onChange={(newValue) => {
                    setStartDate(newValue);
                    setEndDate(addDays(newValue, 7));
                  }}
                  disablePast
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
                <DatePicker
                  label="End Date"
                  value={endDate}
                  onChange={(newValue) => setEndDate(newValue)}
                  disablePast
                  minDate={startDate}
                  slotProps={{
                    textField: { fullWidth: true },
                  }}
                />
              </Stack>
            </LocalizationProvider>
          ) : (
            <Box>
              <Typography variant="subtitle1" gutterBottom>
                Select days for your weekly meal plan:
              </Typography>
              <Box 
                sx={{ 
                  display: 'flex', 
                  gap: 1, 
                  flexWrap: 'wrap',
                  justifyContent: 'center'
                }}
              >
                {weekDays.map((day) => (
                  <Chip
                    key={day.id}
                    label={day.label}
                    onClick={() => handleDayToggle(day.id)}
                    color="primary"
                    variant={selectedDays.includes(day.id) ? "filled" : "outlined"}
                    sx={{ 
                      minWidth: '70px',
                      fontSize: '1rem',
                    }}
                  />
                ))}
              </Box>
            </Box>
          )}
        </Stack>
      ),
    },
    {
      label: 'Select Meal Types',
      content: (
        <FormControl 
          component="fieldset" 
          sx={{ 
            width: '100%',
            p: 2, 
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1
          }}
        >
          <Grid container spacing={2}>
            {mealTypes.map((type) => (
              <Grid item xs={6} sm={3} key={type.id}>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={selectedMeals[type.id]}
                      onChange={handleMealTypeChange}
                      name={type.id}
                      color="primary"
                    />
                  }
                  label={type.label}
                />
              </Grid>
            ))}
          </Grid>
        </FormControl>
      ),
    },
  ];

  const isStepValid = (step) => {
    switch (step) {
      case 0:
        if (planType === 'today') return true;
        return planType === 'date-range' 
          ? (startDate && endDate && endDate >= startDate)
          : selectedDays.length > 0;
      case 1:
        return Object.values(selectedMeals).some(Boolean);
      default:
        return true;
    }
  };

  if (showAddMealForm) {
    return (
      <Box sx={{ py: 4 }}>
        <Typography
          variant="h4"
          sx={{
            mb: 3,
            textAlign: 'center',
          }}
        >
          Add a New Recipe
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          sx={{ mb: 4, textAlign: 'center' }}
        >
          MealBuddy is a community-driven platform. Share your favorite recipes with others!
        </Typography>
        <AddMealForm 
          onSubmit={handleAddMeal}
          onCancel={() => setShowAddMealForm(false)}
        />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: 4 }}>
      <Grid container spacing={4} alignItems="center">
        <Grid item xs={12} md={6}>
          <Box sx={{ 
            pr: { md: 4 },
            position: 'relative',
            '&::after': {
              content: '""',
              position: 'absolute',
              bottom: -20,
              left: 0,
              width: '60px',
              height: '4px',
              backgroundColor: 'primary.main',
              borderRadius: '2px',
            }
          }}>
            <Typography
              variant="h1"
              sx={{
                mb: 3,
                fontSize: { xs: '2.5rem', md: '3.5rem' },
                fontWeight: 800,
                lineHeight: 1.1,
                background: 'linear-gradient(45deg, #5ebd21 30%, #98EE99 90%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                color: 'transparent',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                letterSpacing: '-0.02em',
                textTransform: 'capitalize',
              }}
            >
              Meal Planning Made Easy
            </Typography>
            
            <Typography
              variant="h6"
              color="text.secondary"
              sx={{ 
                mb: 4,
                fontSize: { xs: '1.1rem', md: '1.25rem' },
                lineHeight: 1.6,
                maxWidth: '90%',
                opacity: 0.9,
                fontWeight: 600,
              }}
            >
              Tell us what you're looking for, and we'll create a personalized meal plan that fits your lifestyle and preferences perfectly.
            </Typography>

            <Box sx={{ 
              display: 'flex', 
              gap: 2, 
              flexWrap: 'wrap',
              mt: 4 
            }}>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                '&::before': {
                  content: '"✓"',
                  color: 'primary.main',
                  fontWeight: 'bold',
                }
              }}>
                Customized to your taste
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                '&::before': {
                  content: '"✓"',
                  color: 'primary.main',
                  fontWeight: 'bold',
                }
              }}>
                Easy to follow recipes
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1,
                fontWeight: 600,
                '&::before': {
                  content: '"✓"',
                  color: 'primary.main',
                  fontWeight: 'bold',
                }
              }}>
                Save time and money
              </Typography>
            </Box>
          </Box>
        </Grid>

        <Grid item xs={12} md={6}>
          <Paper
            component="form"
            onSubmit={handleSubmit}
            elevation={2}
            sx={{
              p: 3,
              borderRadius: 2,
            }}
          >
            <Stepper activeStep={activeStep} orientation="vertical">
              {steps.map((step, index) => (
                <Step key={step.label}>
                  <StepLabel>{step.label}</StepLabel>
                  <StepContent>
                    <Box sx={{ mb: 2 }}>
                      {step.content}
                      <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
                        <Button
                          variant="contained"
                          onClick={index === steps.length - 1 ? handleSubmit : handleNext}
                          disabled={loading || !isStepValid(index)}
                        >
                          {index === steps.length - 1 ? 'Generate Plan' : 'Continue'}
                        </Button>
                        {index > 0 && (
                          <Button onClick={handleBack}>
                            Back
                          </Button>
                        )}
                      </Box>
                    </Box>
                  </StepContent>
                </Step>
              ))}
            </Stepper>
          </Paper>
        </Grid>
      </Grid>

      {loading && (
        <Box
          sx={{
            textAlign: 'center',
            mb: 4,
            minHeight: '3em',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h6"
            color="primary"
            sx={{
              fontWeight: 500,
              opacity: 0.9,
              animation: 'pulse 1.5s infinite',
              '@keyframes pulse': {
                '0%': { opacity: 0.6 },
                '50%': { opacity: 1 },
                '100%': { opacity: 0.6 },
              },
            }}
          >
            {thinkingText}
          </Typography>
        </Box>
      )}

      {suggestions.length > 0 && (
        <Box>
          <Typography variant="h5" sx={{ mb: 3 }}>
            Your Meal Plan
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              {planType === 'today' 
                ? `Today, ${format(new Date(), 'MMMM d, yyyy')}`
                : planType === 'date-range'
                  ? `${format(startDate, 'MMM d, yyyy')} - ${format(endDate, 'MMM d, yyyy')}`
                  : `Weekly plan for: ${selectedDays.map(day => 
                      day.charAt(0).toUpperCase() + day.slice(1)
                    ).join(', ')}`
              }
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              Selected meal types: {getSelectedMealTypes().map(type => 
                type.charAt(0).toUpperCase() + type.slice(1)
              ).join(', ')}
            </Typography>
          </Box>

          {suggestions.map((dayPlan, index) => (
            <Box key={index} sx={{ mb: 4 }}>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {format(dayPlan.date, 'EEEE, MMMM d')}
              </Typography>
              <Grid container spacing={3}>
                {Object.entries(dayPlan.meals).map(([mealType, meal]) => (
                  <Grid item xs={12} sm={6} md={4} key={`${dayPlan.date}-${mealType}`}>
                    <Box sx={{ mb: 1 }}>
                      <Typography variant="subtitle2" color="primary">
                        {mealType.charAt(0).toUpperCase() + mealType.slice(1)}
                      </Typography>
                    </Box>
                    <MealCard meal={meal} />
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}

          <Box sx={{ textAlign: 'center', mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleDownload}
              sx={{ mt: 2 }}
            >
              Download Meal Plan
            </Button>
          </Box>
        </Box>
      )}
    </Box>
  );
}

export default MealPlanner;