import { supabase } from '../lib/supabaseClient';

// Helper function to get the public URL for an image
export const getImageUrl = (path) => {
  if (!path) return null;
  const { data } = supabase.storage
    .from('meal-images')
    .getPublicUrl(path);
  return data.publicUrl;
};

export const getMealsByFilters = async ({
  categories = [],
  tags = [],
  searchQuery = '',
  maxCalories = null,
  maxPrepTime = null,
}) => {
  console.log('Filters applied:', { categories, tags, searchQuery, maxCalories, maxPrepTime });

  let query = supabase
    .from('meals')
    .select('*');

  // Apply filters
  if (categories.length > 0) {
    query = query.contains('category', categories);
  }

  if (tags.length > 0) {
    query = query.contains('tags', tags);
  }

  if (searchQuery) {
    query = query.or(`name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`);
  }

  if (maxCalories) {
    query = query.lte('dietary_info->calories', maxCalories);
  }

  if (maxPrepTime) {
    query = query.lte('prep_time', maxPrepTime);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching meals:', error);
    return [];
  }

  console.log('Meals fetched:', data);

  // Add public URLs for images
  return data.map(meal => ({
    ...meal,
    imageUrl: getImageUrl(meal.image)
  }));
};

export const generateMealPlan = async ({
  selectedDates = [],
  selectedMealTypes = [],
  preferences = '',
  dietaryRestrictions = [],
  calorieTarget = null,
}) => {
  // Fetch all categories and tags to map names to IDs
  const allTags = await getDietaryTags();

  // Map dietary restrictions to their corresponding IDs
  const tagIds = dietaryRestrictions.length > 0
    ? dietaryRestrictions
    : allTags.map(tag => tag.id);

  // Get available meals based on filters
  let availableMeals = await getMealsByFilters({
    tags: tagIds,
    maxCalories: calorieTarget,
  });

  // If no meals match the filters, fetch all meals as a fallback
  if (availableMeals.length === 0) {
    console.warn('No meals matched the filters. Fetching all meals as a fallback.');
    availableMeals = await getMealsByFilters({});
  }

  // Create a meal plan for each day
  const mealPlan = selectedDates.map(date => {
    const dayPlan = {};

    // Ignore meal types and pick up to 5 random meals for the day
    const randomMeals = availableMeals.sort(() => 0.5 - Math.random()).slice(0, 5);
    dayPlan['meals'] = randomMeals;

    return {
      date,
      meals: dayPlan,
    };
  });

  return mealPlan;
};

export const getMealCategories = async () => {
  const { data, error } = await supabase
    .from('meal_categories')
    .select('*');

  if (error) {
    console.error('Error fetching meal categories:', error);
    return [];
  }

  return data;
};

export const getDietaryTags = async () => {
  const { data, error } = await supabase
    .from('dietary_tags')
    .select('*');

  if (error) {
    console.error('Error fetching dietary tags:', error);
    return [];
  }

  return data;
};

export const getMealById = async (id) => {
  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching meal by id:', error);
    return null;
  }

  return {
    ...data,
    imageUrl: getImageUrl(data.image)
  };
};

export const getRelatedMeals = async (meal, limit = 3) => {
  if (!meal) return [];

  const { data, error } = await supabase
    .from('meals')
    .select('*')
    .neq('id', meal.id);

  if (error) {
    console.error('Error fetching related meals:', error);
    return [];
  }

  // Calculate similarity scores and add image URLs
  const relatedMeals = data
    .map(m => ({
      ...m,
      imageUrl: getImageUrl(m.image),
      similarityScore: (
        m.tags.filter(tag => meal.tags.includes(tag)).length * 2 +
        m.category.filter(cat => meal.category.includes(cat)).length
      ),
    }))
    .sort((a, b) => b.similarityScore - a.similarityScore)
    .slice(0, limit);

  return relatedMeals;
};

export const createMeal = async (mealData) => {
  try {
    console.log('Debugging mealData:', mealData);

    // Fetch categories and tags first
    const [categoriesData, tagsData] = await Promise.all([
      getMealCategories(),
      getDietaryTags()
    ]);

    // Format the data to match the database schema
    const formattedMealData = {
      name: mealData.name,
      description: mealData.description,
      image: mealData.image,
      category: Array.isArray(mealData.category) ? mealData.category.map(id => categoriesData.find(cat => cat.id === id)?.name || id) : [],
      tags: Array.isArray(mealData.tags) ? mealData.tags.map(id => tagsData.find(tag => tag.id === id)?.name || id) : [],
      prep_time: Number(mealData.prepTime),
      cook_time: Number(mealData.cookTime),
      servings: Number(mealData.servings),
      difficulty: mealData.difficulty,
      ingredients: Array.isArray(mealData.ingredients) ? mealData.ingredients.map(ing => ({
        item: ing.item,
        amount: Number(ing.amount),
        unit: ing.unit
      })) : [],
      instructions: Array.isArray(mealData.instructions) ? mealData.instructions.filter(inst => inst.trim() !== '') : []
    };

    console.log('Formatted meal data:', formattedMealData);

    const { data, error } = await supabase
      .from('meals')
      .insert([formattedMealData])
      .select()
      .single();

    if (error) {
      console.error('Error creating meal:', error);
      throw error;
    }

    return {
      ...data,
      imageUrl: getImageUrl(data.image)
    };
  } catch (error) {
    console.error('Error in createMeal:', error);
    throw error;
  }
};