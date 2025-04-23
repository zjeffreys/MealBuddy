import { supabase } from '../lib/supabaseClient';

const seedCategories = async () => {
  const categories = [
    { name: 'Breakfast', description: 'Morning meals' },
    { name: 'Lunch', description: 'Midday meals' },
    { name: 'Dinner', description: 'Evening meals' },
    { name: 'Snack', description: 'Small meals between main meals' },
    { name: 'Dessert', description: 'Sweet treats' }
  ];

  for (const category of categories) {
    const { error } = await supabase
      .from('meal_categories')
      .insert([category]);

    if (error) {
      console.error('Error seeding category:', error);
    }
  }
};

const seedTags = async () => {
  const tags = [
    { name: 'Vegetarian', description: 'Contains no meat or fish' },
    { name: 'Vegan', description: 'Contains no animal products' },
    { name: 'Gluten-Free', description: 'Contains no gluten' },
    { name: 'Dairy-Free', description: 'Contains no dairy' },
    { name: 'High-Protein', description: 'Rich in protein' },
    { name: 'Low-Carb', description: 'Low in carbohydrates' },
    { name: 'Quick & Easy', description: 'Can be prepared quickly' },
    { name: 'Meal Prep', description: 'Good for meal prepping' }
  ];

  for (const tag of tags) {
    const { error } = await supabase
      .from('dietary_tags')
      .insert([tag]);

    if (error) {
      console.error('Error seeding tag:', error);
    }
  }
};

export const seedDatabase = async () => {
  try {
    await seedCategories();
    await seedTags();
    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}; 