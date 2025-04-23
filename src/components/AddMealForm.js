import React, { useState, useCallback } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  CircularProgress,
  Alert,
  TextField,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Autocomplete,
} from '@mui/material';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { supabase } from '../lib/supabaseClient';
import OpenAI from 'openai';
import { useNavigate } from 'react-router-dom';
import { createMeal } from '../services/mealService';

const openai = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true
});

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

const AddMealForm = () => {
  const navigate = useNavigate();
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '', // Initialized as an empty string
    prepTime: '',
    cookTime: '',
    servings: '',
    difficulty: '',
    ingredients: [],
    instructions: [],
    categories: [],
    dietaryTags: []
  });

  const handleImageChange = async (event) => {
    const file = event.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError('Image size should be less than 5MB');
        return;
      }

      // Create a preview URL for the image
      const previewUrl = URL.createObjectURL(file);
      setImageFile(file);
      setImagePreview(previewUrl);
      setError('');
    }
  };

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleImageChange({ target: { files: [file] } });
  }, []);

  const handleFileInputChange = (e) => {
    const file = e.target.files[0];
    handleImageChange({ target: { files: [file] } });
  };

  const analyzeImageWithAI = async (imageUrl, description) => {
    try {
      const aiResponse = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: `Analyze this food image and provide the following information in JSON format: name, prepTime (in minutes), cookTime (in minutes), servings, difficulty (easy/medium/hard), ingredients (array of objects with item, amount, and unit), and instructions (array of steps). Also suggest appropriate categories and dietary tags. Use this description as additional context: "${description}"`
              },
              {
                type: "image_url",
                image_url: {
                  url: imageUrl
                }
              }
            ]
          }
        ],
        max_tokens: 2000
      });

      // Extract and parse the JSON from the response
      const content = aiResponse.choices[0].message.content;
      try {
        // Remove the code block markers if present
        const jsonString = content.replace(/```json\n|\n```/g, '').trim();
        return JSON.parse(jsonString);
      } catch (parseError) {
        console.error('Error parsing AI response:', content);
        throw new Error('Failed to parse AI response');
      }
    } catch (error) {
      console.error('Error analyzing image:', error);
      throw new Error(`Failed to analyze image with AI: ${error.message}`);
    }
  };

  const fetchDietaryTags = async () => {
    const { data, error } = await supabase
      .from('dietary_tags')
      .select('*');

    if (error) {
      console.error('Error fetching dietary tags:', error);
      return [];
    }

    return data;
  };

  const handleGenerateRecipe = async () => {
    if (!imageFile) {
      setError('Please upload an image');
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Upload the image to Supabase storage
      const fileExt = imageFile.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;

      const { error: uploadError, data: uploadData } = await supabase.storage
        .from('meal-images')
        .upload(fileName, imageFile);

      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        setError('Failed to upload the image. Please try again.');
        setLoading(false);
        return;
      }

      // Get the public URL of the uploaded image
      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from('meal-images')
        .getPublicUrl(fileName);

      if (publicUrlError || !publicUrlData.publicUrl) {
        console.error('Error getting public URL:', publicUrlError);
        setError('Failed to retrieve the public URL for the uploaded image.');
        setLoading(false);
        return;
      }

      const publicUrl = publicUrlData.publicUrl;

      // Use the public URL for AI analysis
      const mealData = await analyzeImageWithAI(publicUrl, formData.description);

      // Update form data with AI-generated content and the image URL
      setFormData({
        ...formData,
        name: mealData.name,
        prepTime: mealData.prepTime,
        cookTime: mealData.cookTime,
        servings: mealData.servings,
        difficulty: mealData.difficulty,
        ingredients: mealData.ingredients,
        instructions: mealData.instructions,
        categories: mealData.categories,
        dietaryTags: mealData.dietaryTags,
        image: publicUrl
      });
    } catch (error) {
      console.error('Error generating recipe:', error);
      setError(`Failed to generate recipe: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess(false);
  
    if (!formData.image) {
      setError('Image upload failed. Please try again.');
      setLoading(false);
      return;
    }

    // Remove the user-provided description from the formData before saving
    const { description, ...dataToSave } = formData;

    try {
      // Save the meal to the database without the description
      const savedMeal = await createMeal(dataToSave);
      console.log('Meal saved:', savedMeal);
      setSuccess(true);
      setError('');
      setFormData({
        name: '',
        prepTime: '',
        cookTime: '',
        servings: '',
        difficulty: '',
        ingredients: [],
        instructions: [],
        categories: [],
        dietaryTags: [],
        image: '' // Reset image field
      });
    } catch (error) {
      console.error('Error saving meal:', error);
      setError('Failed to save the meal to the database. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '200px' }}>
        <CircularProgress />
        <Typography sx={{ ml: 2 }}>Analyzing your image and generating recipe details...</Typography>
      </Box>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add a New Recipe
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Upload an image of your dish and provide a description. Our AI will analyze it to create a complete recipe!
      </Typography>

      <Box sx={{ mt: 4 }}>
        <Box 
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          sx={{ 
            textAlign: 'center',
            border: '2px dashed',
            borderColor: isDragging ? 'primary.main' : 'grey.300',
            borderRadius: 2,
            p: 4,
            mb: 3,
            backgroundColor: isDragging ? 'rgba(25, 118, 210, 0.04)' : '#fafafa',
            transition: 'all 0.2s ease-in-out',
            cursor: 'pointer',
            '&:hover': {
              borderColor: 'primary.main',
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          {!imagePreview ? (
            <Box
              component="label"
              sx={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: 2,
                cursor: 'pointer'
              }}
            >
              <CloudUploadIcon 
                sx={{ 
                  fontSize: 48,
                  color: 'primary.main',
                  opacity: 0.7
                }} 
              />
              <Box>
                <Typography variant="h6" color="primary">
                  Upload Image
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Click to browse or drag and drop
                </Typography>
              </Box>
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
              />
            </Box>
          ) : (
            <Box
              component="img"
              src={imagePreview}
              alt="Preview"
              sx={{
                maxWidth: '100%',
                maxHeight: 300,
                borderRadius: 1,
              }}
            />
          )}
        </Box>

        <Grid container spacing={3}>
          <Grid item xs={12}>
            <TextField
              fullWidth
              label="Description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              multiline
              rows={3}
              placeholder="Describe your dish, including any special ingredients or cooking methods..."
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleGenerateRecipe}
              disabled={!imageFile || !(formData.description?.trim())}
              sx={{ mb: 3, width: '100%' }}
            >
              Generate Recipe
            </Button>
          </Grid>

          {formData.name && (
            <>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Recipe Name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Prep Time (minutes)"
                  type="number"
                  value={formData.prepTime}
                  onChange={(e) => setFormData({ ...formData, prepTime: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Cook Time (minutes)"
                  type="number"
                  value={formData.cookTime}
                  onChange={(e) => setFormData({ ...formData, cookTime: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Servings"
                  type="number"
                  value={formData.servings}
                  onChange={(e) => setFormData({ ...formData, servings: e.target.value })}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>Difficulty</InputLabel>
                  <Select
                    value={formData.difficulty}
                    onChange={(e) => setFormData({ ...formData, difficulty: e.target.value })}
                    label="Difficulty"
                  >
                    <MenuItem value="easy">Easy</MenuItem>
                    <MenuItem value="medium">Medium</MenuItem>
                    <MenuItem value="hard">Hard</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Ingredients
                </Typography>
                {formData.ingredients.map((ingredient, index) => (
                  <Box key={index} sx={{ mb: 1 }}>
                    <Grid container spacing={2}>
                      <Grid item xs={5}>
                        <TextField
                          fullWidth
                          label="Item"
                          value={ingredient.item}
                          onChange={(e) => {
                            const newIngredients = [...formData.ingredients];
                            newIngredients[index].item = e.target.value;
                            setFormData({ ...formData, ingredients: newIngredients });
                          }}
                        />
                      </Grid>
                      <Grid item xs={3}>
                        <TextField
                          fullWidth
                          label="Amount"
                          type="number"
                          value={ingredient.amount}
                          onChange={(e) => {
                            const newIngredients = [...formData.ingredients];
                            newIngredients[index].amount = e.target.value;
                            setFormData({ ...formData, ingredients: newIngredients });
                          }}
                        />
                      </Grid>
                      <Grid item xs={4}>
                        <TextField
                          fullWidth
                          label="Unit"
                          value={ingredient.unit}
                          onChange={(e) => {
                            const newIngredients = [...formData.ingredients];
                            newIngredients[index].unit = e.target.value;
                            setFormData({ ...formData, ingredients: newIngredients });
                          }}
                        />
                      </Grid>
                    </Grid>
                  </Box>
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Instructions
                </Typography>
                {formData.instructions.map((instruction, index) => (
                  <TextField
                    key={index}
                    fullWidth
                    multiline
                    rows={2}
                    value={instruction}
                    onChange={(e) => {
                      const newInstructions = [...formData.instructions];
                      newInstructions[index] = e.target.value;
                      setFormData({ ...formData, instructions: newInstructions });
                    }}
                    sx={{ mb: 1 }}
                  />
                ))}
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Categories
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.categories.map((category, index) => (
                    <Chip
                      key={index}
                      label={category}
                      onDelete={() => {
                        const newCategories = formData.categories.filter((_, i) => i !== index);
                        setFormData({ ...formData, categories: newCategories });
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Dietary Tags
                </Typography>
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                  {formData.dietaryTags.map((tag, index) => (
                    <Chip
                      key={index}
                      label={tag}
                      onDelete={() => {
                        const newTags = formData.dietaryTags.filter((_, i) => i !== index);
                        setFormData({ ...formData, dietaryTags: newTags });
                      }}
                    />
                  ))}
                </Box>
              </Grid>

              <Grid item xs={12}>
                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  Save Recipe
                </Button>
              </Grid>
            </>
          )}
        </Grid>
          
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </Box>
    </Paper>
  );
};

export default AddMealForm;