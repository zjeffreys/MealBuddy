import React, { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminPanel = () => {
  const [mealCategories, setMealCategories] = useState([]);
  const [dietaryTags, setDietaryTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data: categoriesData, error: categoriesError } = await supabase
          .from('meal_categories')
          .select('*');

        if (categoriesError) throw categoriesError;

        const { data: tagsData, error: tagsError } = await supabase
          .from('dietary_tags')
          .select('*');

        if (tagsError) throw tagsError;

        setMealCategories(categoriesData);
        setDietaryTags(tagsData);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError('Failed to fetch data. Please check your database.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div>
      <h2>Meal Categories</h2>
      <ul>
        {mealCategories.map((category) => (
          <li key={category.id}>{category.name}</li>
        ))}
      </ul>

      <h2>Dietary Tags</h2>
      <ul>
        {dietaryTags.map((tag) => (
          <li key={tag.id}>{tag.name}</li>
        ))}
      </ul>
    </div>
  );
};

export default AdminPanel;