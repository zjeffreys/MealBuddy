import OpenAI from 'openai';
import axios from 'axios';
import { supabase } from '../lib/supabaseClient';
import readline from 'readline';
import chalk from 'chalk';
import ora from 'ora';
import fetch from 'node-fetch';

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

// Create readline interface for terminal interaction
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Terminal spinner for loading states
const spinner = ora();

// Function to get meal data from GPT-4 Vision
async function getMealDataFromImage(imageUrl) {
  try {
    spinner.start('Analyzing image with GPT-4 Vision...');
    const completion = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
      messages: [
        {
          role: "user",
          content: [
            { 
              type: "text", 
              text: "Analyze this food image and provide a JSON response with: name, description, ingredients (array of {item, amount, unit}), nutrition (calories, protein, carbs, fat), type (breakfast/lunch/dinner/snack), tags (array of dietary tags), and difficulty (easy/medium/hard)." 
            },
            { type: "image_url", url: imageUrl }
          ],
        },
      ],
    });
    spinner.succeed('Image analyzed successfully');
    return JSON.parse(completion.choices[0].message.content);
  } catch (error) {
    spinner.fail('Failed to analyze image');
    console.error(chalk.red('Error analyzing image:'), error);
    return null;
  }
}

// Function to upload image to Supabase
async function uploadImageToSupabase(imageUrl, mealName) {
  try {
    spinner.start('Uploading image to Supabase...');
    const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const filename = `${Date.now()}-${mealName.toLowerCase().replace(/[^a-z0-9]/g, '-')}.jpg`;
    
    const { error } = await supabase.storage
      .from('meal-images')
      .upload(filename, imageResponse.data, {
        contentType: 'image/jpeg'
      });

    if (error) throw error;
    spinner.succeed('Image uploaded successfully');
    return filename;
  } catch (error) {
    spinner.fail('Failed to upload image');
    console.error(chalk.red('Error uploading image:'), error);
    return null;
  }
}

// Function to save meal data to database
async function saveMealToDatabase(mealData, imageFilename) {
  try {
    spinner.start('Saving meal to database...');
    const { error } = await supabase.from('meals').insert([{
      name: mealData.name,
      description: mealData.description,
      image: imageFilename,
      ingredients: mealData.ingredients,
      dietary_info: mealData.nutrition,
      category: [mealData.type],
      tags: mealData.tags,
      difficulty: mealData.difficulty,
      prep_time: Math.floor(Math.random() * 30) + 10,
      cook_time: Math.floor(Math.random() * 30) + 10,
      servings: Math.floor(Math.random() * 4) + 2
    }]);

    if (error) throw error;
    spinner.succeed('Meal saved to database');
    return true;
  } catch (error) {
    spinner.fail('Failed to save meal');
    console.error(chalk.red('Error saving meal:'), error);
    return false;
  }
}

// Main seeding function
async function seedMeals(count = 100) {
  console.log(chalk.blue('\n🚀 Starting meal seeding process...\n'));
  
  try {
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < count; i++) {
      console.log(chalk.yellow(`\nProcessing meal ${i + 1}/${count}`));
      
      const imageUrl = `https://via.placeholder.com/300?text=Meal+${i + 1}`;
      const mealData = await getMealDataFromImage(imageUrl);
      if (!mealData) {
        failCount++;
        continue;
      }

      const imageFilename = await uploadImageToSupabase(imageUrl, mealData.name);
      if (!imageFilename) {
        failCount++;
        continue;
      }

      const saved = await saveMealToDatabase(mealData, imageFilename);
      if (saved) {
        successCount++;
      } else {
        failCount++;
      }

      // Add delay between requests
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log(chalk.green(`\n✅ Seeding complete!`));
    console.log(chalk.green(`Successfully added: ${successCount} meals`));
    console.log(chalk.red(`Failed to add: ${failCount} meals`));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Error during seeding process:'), error);
  } finally {
    rl.close();
  }
}

// Function to seed meals with chefs
const seedMealsWithChefs = async () => {
  try {
    // Example data for seeding
    const meals = [
      {
        name: 'Apple Smoothie',
        description: 'A refreshing apple smoothie for any time of the day.',
        category: ['Breakfast'],
        tags: ['Vegan', 'Healthy'],
        prep_time: 5,
        cook_time: 0,
        servings: 2,
        difficulty: 'Easy',
        ingredients: [
          '2 green apples',
          '1 cup milk',
          '1 tablespoon honey',
          '1/2 teaspoon cinnamon powder'
        ],
        instructions: [
          'Core and chop the apples.',
          'Add apples, milk, honey, and cinnamon to a blender.',
          'Blend until smooth.',
          'Serve chilled.'
        ],
        image: 'https://paqyyefqkhxkyshwrbxq.supabase.co/storage/v1/object/public/meal-images/pexels_9032667.jpeg',
        chef: {
          name: 'Pexels Chef',
          profile_image: 'https://images.pexels.com/users/avatars/12345/pexels-chef.jpeg'
        }
      }
    ];

    for (const meal of meals) {
      // Upload chef profile image to Supabase storage
      const profileImageResponse = await fetch(meal.chef.profile_image);
      const profileImageBlob = await profileImageResponse.blob();
      const profileImageName = `${meal.chef.name.replace(/\s+/g, '_').toLowerCase()}_${Date.now()}.jpeg`;

      const { data: profileImageData, error: profileImageError } = await supabase.storage
        .from('chef-profile-images')
        .upload(profileImageName, profileImageBlob, {
          contentType: 'image/jpeg'
        });

      if (profileImageError) {
        console.error('Error uploading chef profile image:', profileImageError);
        continue;
      }

      const profileImageUrl = supabase.storage
        .from('chef-profile-images')
        .getPublicUrl(profileImageName).data.publicUrl;

      // Insert chef into the database
      const { data: chefData, error: chefError } = await supabase
        .from('chefs')
        .insert({
          name: meal.chef.name,
          profile_image: profileImageUrl
        })
        .select()
        .single();

      if (chefError) {
        console.error('Error inserting chef:', chefError);
        continue;
      }

      // Insert meal into the database with the chef_id
      const { data: mealData, error: mealError } = await supabase
        .from('meals')
        .insert({
          name: meal.name,
          description: meal.description,
          category: meal.category,
          tags: meal.tags,
          prep_time: meal.prep_time,
          cook_time: meal.cook_time,
          servings: meal.servings,
          difficulty: meal.difficulty,
          ingredients: meal.ingredients,
          instructions: meal.instructions,
          image: meal.image,
          chef_id: chefData.id
        })
        .select()
        .single();

      if (mealError) {
        console.error('Error inserting meal:', mealError);
        continue;
      }

      console.log('Successfully added meal with chef:', mealData);
    }
  } catch (error) {
    console.error('Error seeding meals with chefs:', error);
  }
};

seedMealsWithChefs();

// Start the seeding process
console.log(chalk.blue('Meal Buddy - Seeder'));
console.log(chalk.gray('This script will seed your database with meals\n'));

rl.question(chalk.yellow('How many meals would you like to seed? (default: 100): '), (answer) => {
  const count = parseInt(answer) || 100;
  seedMeals(count);
});