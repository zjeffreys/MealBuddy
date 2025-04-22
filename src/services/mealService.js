import { meals, mealCategories, dietaryTags } from '../data/meals';

export const getMealsByFilters = ({
  categories = [],
  tags = [],
  searchQuery = '',
  maxCalories = null,
  maxPrepTime = null,
}) => {
  return meals.filter(meal => {
    // Filter by categories
    if (categories.length > 0 && !meal.category.some(c => categories.includes(c))) {
      return false;
    }

    // Filter by tags
    if (tags.length > 0 && !meal.tags.some(t => tags.includes(t))) {
      return false;
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesName = meal.name.toLowerCase().includes(query);
      const matchesDescription = meal.description.toLowerCase().includes(query);
      const matchesTags = meal.tags.some(tag => tag.toLowerCase().includes(query));
      
      if (!matchesName && !matchesDescription && !matchesTags) {
        return false;
      }
    }

    // Filter by max calories
    if (maxCalories && meal.dietaryInfo.calories > maxCalories) {
      return false;
    }

    // Filter by max prep time
    if (maxPrepTime && meal.prepTime > maxPrepTime) {
      return false;
    }

    return true;
  });
};

export const generateMealPlan = ({
  selectedDates = [],
  selectedMealTypes = [],
  preferences = '',
  dietaryRestrictions = [],
  calorieTarget = null,
}) => {
  // Filter meals based on preferences and restrictions
  let availableMeals = getMealsByFilters({
    categories: selectedMealTypes,
    tags: dietaryRestrictions,
    maxCalories: calorieTarget,
  });

  // Create a meal plan for each day
  const mealPlan = selectedDates.map(date => {
    const dayPlan = {};
    
    selectedMealTypes.forEach(mealType => {
      // Filter meals for this specific meal type
      const mealsForType = availableMeals.filter(meal => 
        meal.category.includes(mealType)
      );

      // Randomly select a meal for this type
      const randomIndex = Math.floor(Math.random() * mealsForType.length);
      dayPlan[mealType] = mealsForType[randomIndex];
    });

    return {
      date,
      meals: dayPlan,
    };
  });

  return mealPlan;
};

export const getMealCategories = () => mealCategories;

export const getDietaryTags = () => dietaryTags;

export const getMealById = (id) => meals.find(meal => meal.id === id);

export const getRelatedMeals = (meal, limit = 3) => {
  if (!meal) return [];

  // Find meals with similar tags or categories
  const relatedMeals = meals
    .filter(m => m.id !== meal.id) // Exclude the current meal
    .map(m => {
      // Calculate similarity score based on shared tags and categories
      const sharedTags = m.tags.filter(tag => meal.tags.includes(tag)).length;
      const sharedCategories = m.category.filter(cat => meal.category.includes(cat)).length;
      
      return {
        ...m,
        similarityScore: (sharedTags * 2) + sharedCategories, // Tags are weighted more heavily
      };
    })
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return relatedMeals;
}; 