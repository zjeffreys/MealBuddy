import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import { format } from 'date-fns';
import './MealPlanner.css';
import MealCard from './MealCard';
import { FaLeaf, FaWeight, FaBacon, FaTimes, FaCheckCircle, FaPlusCircle } from 'react-icons/fa';
import Modal from 'react-modal';

// Set the app element for accessibility
Modal.setAppElement('#root');

// Add custom styles for the modal
const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const MealPlanner = () => {
  const [mealData, setMealData] = useState([]);
  const [dietPlans, setDietPlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
  ]); // Example diet plans with icons
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [availablePlans] = useState([
    { name: 'Keto', icon: <FaBacon /> },
    { name: 'Weight Loss', icon: <FaWeight /> },
    { name: 'Vegan', icon: <FaLeaf /> },
    { name: 'Paleo', icon: <FaLeaf /> },
    { name: 'Mediterranean', icon: <FaLeaf /> },
  ]);
  const [showAllPlans, setShowAllPlans] = useState(false);

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

  const handleRemovePlan = (index) => {
    const updatedPlans = dietPlans.filter((_, i) => i !== index);
    setDietPlans(updatedPlans);
  };

  const toggleShowAllPlans = () => {
    setShowAllPlans(!showAllPlans);
  };

  useEffect(() => {
    const fetchRandomMeals = async () => {
      try {
        const { data, error } = await supabase
          .from('meals')
          .select('*')
          .limit(10);

        if (error) throw error;

        setMealData(data);
      } catch (err) {
        console.error('Error fetching meals:', err);
      }
    };

    fetchRandomMeals();
  }, []);

  const filteredPlans = availablePlans.filter((plan) =>
    plan.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const currentDay = {
    day: format(new Date(), 'EEEE'),
    date: format(new Date(), 'EEE, MMM d'),
    totalCalories: 1500,
    meals: [
      { type: 'Breakfast', name: 'Bagel with Cream Cheese', calories: 400 },
      { type: 'Lunch', name: 'Chicken Caesar Wrap', calories: 450 },
      { type: 'Dinner', name: 'Grilled Shrimp Tacos', calories: 500 },
      { type: 'Snacks', name: 'Protein Bar', calories: 150 },
    ],
  };

  const days = [
    { day: 'Monday', date: 'Mon, Apr 21', totalCalories: 1530, meals: [
      { type: 'Breakfast', name: 'Avocado Toast', calories: 350 },
      { type: 'Lunch', name: 'Quinoa Salad', calories: 420 },
      { type: 'Dinner', name: 'Grilled Salmon', calories: 580 },
      { type: 'Snacks', name: 'Greek Yogurt with Berries', calories: 180 },
    ] },
    { day: 'Tuesday', date: 'Tue, Apr 22', totalCalories: 1300, meals: [
      { type: 'Breakfast', name: 'Smoothie Bowl', calories: 320 },
      { type: 'Lunch', name: 'Chicken Wrap', calories: 450 },
      { type: 'Dinner', name: 'Vegetable Stir Fry', calories: 380 },
      { type: 'Snacks', name: 'Hummus with Carrots', calories: 150 },
    ] },
    { day: 'Wednesday', date: 'Wed, Apr 23', totalCalories: 1400, meals: [
      { type: 'Breakfast', name: 'Pancakes', calories: 400 },
      { type: 'Lunch', name: 'Caesar Salad', calories: 350 },
      { type: 'Dinner', name: 'Spaghetti Bolognese', calories: 500 },
      { type: 'Snacks', name: 'Apple Slices with Peanut Butter', calories: 150 },
    ] },
    { day: 'Thursday', date: 'Thu, Apr 24', totalCalories: 1350, meals: [
      { type: 'Breakfast', name: 'Oatmeal with Bananas', calories: 300 },
      { type: 'Lunch', name: 'Turkey Sandwich', calories: 400 },
      { type: 'Dinner', name: 'Grilled Chicken with Vegetables', calories: 500 },
      { type: 'Snacks', name: 'Trail Mix', calories: 150 },
    ] },
    { day: 'Friday', date: 'Fri, Apr 25', totalCalories: 1450, meals: [
      { type: 'Breakfast', name: 'Scrambled Eggs with Toast', calories: 350 },
      { type: 'Lunch', name: 'Tuna Salad', calories: 400 },
      { type: 'Dinner', name: 'Beef Stir Fry', calories: 550 },
      { type: 'Snacks', name: 'Yogurt with Granola', calories: 150 },
    ] },
    { day: 'Saturday', date: 'Sat, Apr 26', totalCalories: 1500, meals: [
      { type: 'Breakfast', name: 'Bagel with Cream Cheese', calories: 400 },
      { type: 'Lunch', name: 'Chicken Caesar Wrap', calories: 450 },
      { type: 'Dinner', name: 'Grilled Shrimp Tacos', calories: 500 },
      { type: 'Snacks', name: 'Protein Bar', calories: 150 },
    ] },
    { day: 'Sunday', date: 'Sun, Apr 27', totalCalories: 1400, meals: [
      { type: 'Breakfast', name: 'French Toast', calories: 400 },
      { type: 'Lunch', name: 'Vegetable Soup', calories: 350 },
      { type: 'Dinner', name: 'Roast Chicken with Potatoes', calories: 500 },
      { type: 'Snacks', name: 'Cheese and Crackers', calories: 150 },
    ] },
  ];

  return (
    <div className="meal-planner">
      <h2>Meal Planner</h2>

      {/* Display subscribed diet plans with icons */}
      <div className="diet-plans">
        <button className="edit-button" onClick={toggleModal}>
          Manage Subscriptions
        </button>
        <h3>Subscribed Diet Plans</h3>
        <div className="diet-plan-cards">
          {dietPlans.map((plan, index) => (
            <div key={index} className="diet-plan-card">
              <div className="diet-plan-icon">{plan.icon}</div>
              <h4>{plan.name}</h4>
              <p>Explore meals tailored to your {plan.name} plan!</p>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={toggleModal}
        contentLabel="Manage Diet Plans"
        className="modal"
        overlayClassName="overlay"
        style={customStyles} // Apply custom styles
      >
        <FaTimes className="close-icon" onClick={toggleModal} />
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
          />
          <div className="available-plans">
            {filteredPlans
              .filter((plan) => !dietPlans.some((p) => p.name === plan.name)) // Exclude subscribed plans
              .map((plan, index) => (
                <div key={index} className="diet-plan-row">
                  <div className="diet-plan-icon">{plan.icon}</div>
                  <h4>{plan.name}</h4>
                  <button
                    onClick={() => handleToggleSubscription(plan)}
                    className="subscription-button unsubscribed"
                  >
                    Subscribe
                  </button>
                </div>
              ))}
          </div>
        </div>
      </Modal>

      <div className="current-day">
        <h3>{currentDay.day}</h3>
        <p>{currentDay.date}</p>
        <p>Total Calories: {currentDay.totalCalories} kcal</p>
        <div className="meals">
          {currentDay.meals.map((meal, idx) => (
            <MealCard key={idx} meal={{
              name: meal.name,
              image: mealData[idx % mealData.length]?.image || 'default-image.jpg',
              description: `${meal.type} - ${meal.calories} kcal`,
              dietaryInfo: { calories: meal.calories },
              prepTime: 0,
              cookTime: 0,
              tags: [],
            }} />
          ))}
        </div>
      </div>
      <div className="days-container">
        {days.map((day, index) => (
          <div key={index} className="current-day">
            <h3>{day.day}</h3>
            <p>{day.date}</p>
            <p>Total Calories: {day.totalCalories} kcal</p>
            <div className="meals">
              {day.meals.map((meal, idx) => (
                <MealCard key={idx} meal={{
                  name: meal.name,
                  image: mealData[idx % mealData.length]?.image || 'default-image.jpg',
                  description: `${meal.type} - ${meal.calories} kcal`,
                  dietaryInfo: { calories: meal.calories },
                  prepTime: 0,
                  cookTime: 0,
                  tags: [],
                }} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;