import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabaseClient';
import './MealPlanner.css';

const MealPlanner = () => {
  const [mealData, setMealData] = useState([]);

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
    // Add more days as needed
  ];

  return (
    <div className="meal-planner">
      <h2>Meal Planner</h2>
      <div className="planner-container">
        {days.map((day, index) => (
          <div key={index} className="planner-day">
            <h3>{day.day}</h3>
            <p>{day.date}</p>
            <p>Total Calories: {day.totalCalories} kcal</p>
            <div className="meals">
              {day.meals.map((meal, idx) => (
                <div key={idx} className={`meal ${meal.type.toLowerCase()}`}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p>{meal.type}</p>
                      <p>{meal.name}</p>
                      <p>{meal.calories} kcal</p>
                    </div>
                    <img
                      src={mealData[idx % mealData.length]?.image || 'default-image.jpg'}
                      alt={meal.name}
                      style={{ width: '80px', height: '80px', borderRadius: '4px', marginLeft: '10px', objectFit: 'cover' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MealPlanner;