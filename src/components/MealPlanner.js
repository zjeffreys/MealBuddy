import React, { useState, useEffect, useRef, createRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format, addDays } from 'date-fns';
import './MealPlanner.css';
import MealCard from './MealCard';
import { FaLeaf, FaWeight, FaBacon, FaTimes, FaCheckCircle, FaPlusCircle, FaSyncAlt, FaSave, FaArrowLeft, FaArrowRight } from 'react-icons/fa';
import Modal from 'react-modal';
import { getImageUrl } from '../services/mealService';

// Set the app element for accessibility
Modal.setAppElement('#root');

const MealPlanner = () => {
  const [meals, setMeals] = useState([]);
  const [mealsLoading, setMealsLoading] = useState(true);
  const [mealPlan, setMealPlan] = useState([]);
  const [currentDayMeals, setCurrentDayMeals] = useState(null);
  
  const [dietPlans, setDietPlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
  ]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
    { name: 'Paleo', icon: <FaLeaf /> },
    { name: 'Mediterranean', icon: <FaLeaf /> },
  ]);
  const [groceryModalOpen, setGroceryModalOpen] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const currentDayMealsRef = useRef(null);
  const [mealRefs, setMealRefs] = useState([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const toggleModal = () => {
    setIsModalOpen(!isModalOpen);
  };

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleToggleSubscription = (plan) => {
    if (dietPlans.some((p) => p.name === plan.name)) {
      setDietPlans(dietPlans.filter((p) => p.name !== plan.name));
    } else {
      setDietPlans([...dietPlans, plan]);
    }
  };

  const handleGenerateClick = () => {
    setGroceryModalOpen(true);
  };

  const handleGroceryModalClose = () => {
    setGroceryModalOpen(false);
  };

  const handleDateSubmit = () => {
    console.log(`Generating grocery list for: ${startDate} to ${endDate}`);
    setGroceryModalOpen(false);
  };

  const filteredPlans = availablePlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Create refs for each day when mealPlan changes
  useEffect(() => {
    if (mealPlan.length > 0) {
      setMealRefs(mealPlan.map(() => createRef()));
    }
  }, [mealPlan]);

  // Add window resize listener
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Scroll functions for meal containers
  const scrollMeals = (direction, containerRef) => {
    if (!containerRef || !containerRef.current) return;
    
    const scrollAmount = isMobile ? 200 : 300;
    const currentPosition = containerRef.current.scrollLeft;
    
    containerRef.current.scrollTo({
      left: direction === 'left' ? currentPosition - scrollAmount : currentPosition + scrollAmount,
      behavior: 'smooth'
    });
  };

  // Fetch meal data from Supabase
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        setMealsLoading(true);
        
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

        // Map tag IDs to tag names and category IDs to category names
        const processedMeals = mealsData.map(meal => {
          const mappedTags = (meal.tags || []).map(tagId => {
            const tag = tagsData.find(tag => tag.id === tagId);
            if (!tag) return `Unknown Tag`;
            return tag.name;
          });

          const mappedCategories = (meal.category || []).map(categoryId => {
            const category = categoriesData.find(cat => cat.id === categoryId);
            if (!category) return `Unknown Category`;
            return category.name;
          });

          return {
            ...meal,
            image: meal.image,
            tags: mappedTags,
            category: mappedCategories,
            totalTime: (meal.prep_time || 0) + (meal.cook_time || 0),
            prepTime: meal.prep_time || 0,
            cookTime: meal.cook_time || 0,
            dietaryInfo: {
              calories: meal.dietary_info?.calories || Math.floor(Math.random() * 300) + 200,
            }
          };
        });

        setMeals(processedMeals);
        
        // Generate meal plan
        generateMealPlan(processedMeals);
      } catch (err) {
        console.error('Error fetching meals:', err);
      } finally {
        setMealsLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Generate a random meal plan using the fetched meals
  const generateMealPlan = (availableMeals) => {
    if (!availableMeals.length) return;

    // Function to randomly select meals for a type
    const selectMealsForType = (type, count = 1) => {
      // Filter meals that might match this type based on category or name
      const mealsForType = availableMeals.filter(meal => {
        const lowerType = type.toLowerCase();
        const hasMatchingCategory = meal.category.some(cat => 
          cat.toLowerCase().includes(lowerType)
        );
        const nameContainsType = meal.name.toLowerCase().includes(lowerType);
        return hasMatchingCategory || nameContainsType;
      });

      // If we don't have enough type-specific meals, use any meals
      const mealPool = mealsForType.length >= count ? mealsForType : availableMeals;
      
      // Shuffle and pick meals
      return [...mealPool]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(meal => ({
          ...meal,
          type, // Add the meal type
        }));
    };

    // Get today's date
    const today = new Date();
    
    // Create meals for today
    const todayMeals = [
      ...selectMealsForType('Breakfast', 1),
      ...selectMealsForType('Lunch', 1),
      ...selectMealsForType('Dinner', 1),
      ...selectMealsForType('Snack', 1)
    ];
    
    // Calculate total calories
    const todayTotalCalories = todayMeals.reduce(
      (sum, meal) => sum + (meal.dietaryInfo?.calories || 0), 
      0
    );

    setCurrentDayMeals({
      day: format(today, 'EEEE'),
      date: format(today, 'EEE, MMM d'),
      totalCalories: todayTotalCalories,
      meals: todayMeals
    });

    // Create week meal plan
    const weekMealPlan = [];
    for (let i = 1; i <= 7; i++) {
      const date = addDays(today, i);
      const dayMeals = [
        ...selectMealsForType('Breakfast', 1),
        ...selectMealsForType('Lunch', 1),
        ...selectMealsForType('Dinner', 1),
        ...selectMealsForType('Snack', 1)
      ];
      
      const totalCalories = dayMeals.reduce(
        (sum, meal) => sum + (meal.dietaryInfo?.calories || 0), 
        0
      );

      weekMealPlan.push({
        day: format(date, 'EEEE'),
        date: format(date, 'EEE, MMM d'),
        totalCalories,
        meals: dayMeals
      });
    }

    setMealPlan(weekMealPlan);
  };

  const handleRegenerateMeals = (dayIndex) => {
    if (!meals.length) return;
    
    // Function to randomly select meals for a type
    const selectMealsForType = (type, count = 1) => {
      const mealsForType = meals.filter(meal => {
        const lowerType = type.toLowerCase();
        const hasMatchingCategory = meal.category.some(cat => 
          cat.toLowerCase().includes(lowerType)
        );
        const nameContainsType = meal.name.toLowerCase().includes(lowerType);
        return hasMatchingCategory || nameContainsType;
      });

      const mealPool = mealsForType.length >= count ? mealsForType : meals;
      
      return [...mealPool]
        .sort(() => 0.5 - Math.random())
        .slice(0, count)
        .map(meal => ({
          ...meal,
          type,
        }));
    };

    // Regenerate for current day
    if (dayIndex === 'current' && currentDayMeals) {
      const newMeals = [
        ...selectMealsForType('Breakfast', 1),
        ...selectMealsForType('Lunch', 1),
        ...selectMealsForType('Dinner', 1),
        ...selectMealsForType('Snack', 1)
      ];
      
      const totalCalories = newMeals.reduce(
        (sum, meal) => sum + (meal.dietaryInfo?.calories || 0), 
        0
      );

      setCurrentDayMeals({
        ...currentDayMeals,
        totalCalories,
        meals: newMeals
      });
    } 
    // Regenerate for a day in the week
    else if (typeof dayIndex === 'number' && mealPlan[dayIndex]) {
      const newMeals = [
        ...selectMealsForType('Breakfast', 1),
        ...selectMealsForType('Lunch', 1),
        ...selectMealsForType('Dinner', 1),
        ...selectMealsForType('Snack', 1)
      ];
      
      const totalCalories = newMeals.reduce(
        (sum, meal) => sum + (meal.dietaryInfo?.calories || 0), 
        0
      );

      const updatedMealPlan = [...mealPlan];
      updatedMealPlan[dayIndex] = {
        ...updatedMealPlan[dayIndex],
        totalCalories,
        meals: newMeals
      };

      setMealPlan(updatedMealPlan);
    }
  };

  const handleSaveMeals = (dayIndex) => {
    // In a real app, this would save the meals to a database or user profile
    console.log(`Meals saved for day: ${dayIndex}`);
    
    // Show a temporary save confirmation
    alert('Meal plan saved successfully!');
  };

  // Method to render a mobile-friendly day
  const renderDayMeals = (day, dayIndex) => {
    // Determine which ref to use
    const ref = dayIndex === 'current' ? currentDayMealsRef : mealRefs[dayIndex];
    
    return (
      <div key={dayIndex} className="current-day">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3>{day.day}</h3>
          <div className="action-buttons">
            <button onClick={() => handleRegenerateMeals(dayIndex)} title="Regenerate Meals">
              <FaSyncAlt />
            </button>
            <button onClick={() => handleSaveMeals(dayIndex)} title="Save Meals">
              <FaSave />
            </button>
          </div>
        </div>
        <p>{day.date}</p>
        <p>Total Calories: {day.totalCalories} kcal</p>
        
        <div className="meals-container" style={{ position: 'relative' }}>
          {/* Only show navigation arrows if not on a small mobile device */}
          {!isMobile && (
            <>
              <button 
                className="scroll-button left" 
                onClick={() => scrollMeals('left', ref)}
                style={{
                  position: 'absolute',
                  left: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <FaArrowLeft />
              </button>
              <button 
                className="scroll-button right" 
                onClick={() => scrollMeals('right', ref)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  zIndex: 2,
                  background: 'rgba(255,255,255,0.8)',
                  border: 'none',
                  borderRadius: '50%',
                  width: '36px',
                  height: '36px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                }}
              >
                <FaArrowRight />
              </button>
            </>
          )}
          
          <div 
            className="meals" 
            ref={ref}
            style={{ 
              WebkitOverflowScrolling: 'touch',
              maxWidth: '100%',
              boxSizing: 'border-box'
            }}
          >
            {day.meals.map((meal, idx) => (
              <MealCard key={idx} meal={{
                id: meal.id,
                name: meal.name,
                image: meal.image,
                description: `${meal.type} - ${meal.dietaryInfo.calories} kcal`,
                dietaryInfo: meal.dietaryInfo,
                prepTime: meal.prepTime,
                cookTime: meal.cookTime,
                tags: meal.tags,
                ingredients: meal.ingredients || [],
                instructions: meal.instructions || [],
                chef: meal.chef,
                category: meal.category
              }} />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (mealsLoading) {
    return <div className="meal-planner loading">Loading meal data...</div>;
  }

  return (
    <div className="meal-planner">
      <h2>Meal Planner</h2>

      <button
        className="generate-grocery-list-button"
        onClick={handleGenerateClick}
        aria-label="Generate Smart Grocery List"
      >
        Generate Smart Grocery List
      </button>

      {/* Display subscribed diet plans with icons */}
      <div className="diet-plans">
        <h3>Subscribed Diet Plans</h3>
        <div className="diet-plan-cards">
          {dietPlans.map((plan, index) => (
            <div key={index} className="diet-plan-card">
              <div className="diet-plan-icon">{plan.icon}</div>
              <h4>{plan.name}</h4>
            </div>
          ))}
          <div 
            className="diet-plan-card" 
            onClick={toggleModal}
            style={{ 
              cursor: 'pointer', 
              backgroundColor: '#f0f8ff', 
              borderStyle: 'dashed'
            }}
          >
            <div className="diet-plan-icon" style={{ color: '#2196f3' }}>
              <FaPlusCircle />
            </div>
            <h4>Add More</h4>
          </div>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        contentLabel="Manage Diet Plans"
        className="modal"
        overlayClassName="overlay"
        ariaHideApp={false} // Fix for screen readers
      >
        <FaTimes className="close-icon" onClick={toggleModal} aria-label="Close dialog" />
        <h2>Manage Diet Plans</h2>

        {/* Display subscribed plans at the top */}
        <div className="subscribed-plans">
          <h3>Subscribed Plans</h3>
          <div className="available-plans">
            {dietPlans.map((plan, index) => (
              <div key={index} className="diet-plan-row">
                <div className="diet-plan-icon">{plan.icon}</div>
                <h4>{plan.name}</h4>
                <button
                  onClick={() => handleToggleSubscription(plan)}
                  className="subscription-button subscribed"
                  aria-label={`Unsubscribe from ${plan.name}`}
                >
                  Subscribed
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Search and discover more plans */}
        <div className="discover-plans">
          <h3>Discover More Plans</h3>
          <input
            type="text"
            className="search-input"
            placeholder="Search for diet plans..."
            value={searchQuery}
            onChange={handleSearch}
            aria-label="Search for diet plans"
          />
          <div className="available-plans">
            {filteredPlans
              .filter((plan) => !dietPlans.some((p) => p.name === plan.name))
              .map((plan, index) => (
                <div key={index} className="diet-plan-row">
                  <div className="diet-plan-icon">{plan.icon}</div>
                  <h4>{plan.name}</h4>
                  <button
                    onClick={() => handleToggleSubscription(plan)}
                    className="subscription-button unsubscribed"
                    aria-label={`Subscribe to ${plan.name}`}
                  >
                    Subscribe
                  </button>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      {/* Display current day */}
      {currentDayMeals && renderDayMeals(currentDayMeals, 'current')}

      {/* Display week meal plan */}
      <div className="days-container">
        {mealPlan.map((day, index) => renderDayMeals(day, index))}
      </div>

      {/* Grocery list modal */}
      {groceryModalOpen && (
        <>
          <div className="modal-overlay" onClick={handleGroceryModalClose}></div>
          <div className="grocery-list-modal">
            <h3>Select Date Range</h3>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              aria-label="Start date"
            />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              aria-label="End date"
            />
            <button onClick={handleDateSubmit}>Generate</button>
            <button onClick={handleGroceryModalClose}>Cancel</button>
          </div>
        </>
      )}
    </div>
  );
};

export default MealPlanner;