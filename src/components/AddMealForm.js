import React, { useState } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Chip,
  Stack,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  OutlinedInput,
  Alert,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
} from '@mui/material';
import { mealCategories, dietaryTags } from '../data/meals';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

const AddMealForm = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    category: [],
    dietaryInfo: {
      calories: '',
      protein: '',
      carbs: '',
      fat: '',
      fiber: '',
    },
    tags: [],
    prepTime: '',
    cookTime: '',
    difficulty: 'easy',
    servings: '',
    ingredients: [{ item: '', amount: '', unit: '' }],
    instructions: [''],
  });

  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
    // Clear error when field is modified
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const handleCategoryChange = (event) => {
    setFormData(prev => ({
      ...prev,
      category: event.target.value
    }));
  };

  const handleTagsChange = (event) => {
    setFormData(prev => ({
      ...prev,
      tags: event.target.value
    }));
  };

  const handleIngredientChange = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map((ing, i) => 
        i === index ? { ...ing, [field]: value } : ing
      )
    }));
  };

  const addIngredient = () => {
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, { item: '', amount: '', unit: '' }]
    }));
  };

  const removeIngredient = (index) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter((_, i) => i !== index)
    }));
  };

  const handleInstructionChange = (index, value) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((inst, i) => 
        i === index ? value : inst
      )
    }));
  };

  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  const removeInstruction = (index) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const newMeal = {
      ...formData,
      id: String(Date.now()),
      dietaryInfo: {
        calories: Number(formData.dietaryInfo.calories),
        protein: Number(formData.dietaryInfo.protein),
        carbs: Number(formData.dietaryInfo.carbs),
        fat: Number(formData.dietaryInfo.fat),
        fiber: Number(formData.dietaryInfo.fiber),
      },
      prepTime: Number(formData.prepTime),
      cookTime: Number(formData.cookTime),
      servings: Number(formData.servings),
    };
    
    onSubmit(newMeal);
    setSubmitted(true);
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.image.trim()) newErrors.image = 'Image URL is required';
    if (!formData.prepTime) newErrors.prepTime = 'Prep time is required';
    if (!formData.cookTime) newErrors.cookTime = 'Cook time is required';
    if (!formData.servings) newErrors.servings = 'Number of servings is required';
    if (formData.ingredients.some(ing => !ing.item.trim())) {
      newErrors.ingredients = 'All ingredients must be filled out';
    }
    if (formData.instructions.some(inst => !inst.trim())) {
      newErrors.instructions = 'All instructions must be filled out';
    }
    return newErrors;
  };

  if (submitted) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Alert severity="success" sx={{ mb: 2 }}>
          Thank you for contributing! Your meal has been added successfully.
        </Alert>
        <Button variant="contained" onClick={() => {
          setSubmitted(false);
          setFormData({
            name: '',
            description: '',
            image: '',
            category: [],
            dietaryInfo: {
              calories: '',
              protein: '',
              carbs: '',
              fat: '',
              fiber: '',
            },
            tags: [],
            prepTime: '',
            cookTime: '',
            difficulty: 'easy',
            servings: '',
            ingredients: [{ item: '', amount: '', unit: '' }],
            instructions: [''],
          });
        }}>
          Add Another Meal
        </Button>
        <Button sx={{ ml: 2 }} onClick={onCancel}>
          Return to Meal Planner
        </Button>
      </Box>
    );
  }

  return (
    <Paper component="form" onSubmit={handleSubmit} sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Add Your Recipe
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Share your favorite recipe with the MealBuddy community! Please provide as much detail as possible to help others recreate your dish.
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Recipe Name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            error={!!errors.name}
            helperText={errors.name}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            multiline
            rows={3}
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            error={!!errors.description}
            helperText={errors.description}
          />
        </Grid>

        <Grid item xs={12}>
          <TextField
            required
            fullWidth
            label="Image URL"
            name="image"
            value={formData.image}
            onChange={handleChange}
            error={!!errors.image}
            helperText={errors.image || "Provide a URL to an image of your dish"}
          />
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Categories</InputLabel>
            <Select
              multiple
              value={formData.category}
              onChange={handleCategoryChange}
              input={<OutlinedInput label="Categories" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={mealCategories.find(cat => cat.id === value)?.name} 
                    />
                  ))}
                </Box>
              )}
            >
              {mealCategories.map((category) => (
                <MenuItem key={category.id} value={category.id}>
                  {category.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Tags</InputLabel>
            <Select
              multiple
              value={formData.tags}
              onChange={handleTagsChange}
              input={<OutlinedInput label="Tags" />}
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                  {selected.map((value) => (
                    <Chip 
                      key={value} 
                      label={dietaryTags.find(tag => tag.id === value)?.label} 
                    />
                  ))}
                </Box>
              )}
            >
              {dietaryTags.map((tag) => (
                <MenuItem key={tag.id} value={tag.id}>
                  {tag.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Nutritional Information
          </Typography>
          <Grid container spacing={2}>
            {Object.keys(formData.dietaryInfo).map((key) => (
              <Grid item xs={6} sm={4} md={2.4} key={key}>
                <TextField
                  required
                  fullWidth
                  type="number"
                  label={key.charAt(0).toUpperCase() + key.slice(1)}
                  name={`dietaryInfo.${key}`}
                  value={formData.dietaryInfo[key]}
                  onChange={handleChange}
                  error={!!errors[`dietaryInfo.${key}`]}
                  helperText={errors[`dietaryInfo.${key}`]}
                />
              </Grid>
            ))}
          </Grid>
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            type="number"
            label="Prep Time (minutes)"
            name="prepTime"
            value={formData.prepTime}
            onChange={handleChange}
            error={!!errors.prepTime}
            helperText={errors.prepTime}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            type="number"
            label="Cook Time (minutes)"
            name="cookTime"
            value={formData.cookTime}
            onChange={handleChange}
            error={!!errors.cookTime}
            helperText={errors.cookTime}
          />
        </Grid>

        <Grid item xs={12} sm={4}>
          <TextField
            required
            fullWidth
            type="number"
            label="Servings"
            name="servings"
            value={formData.servings}
            onChange={handleChange}
            error={!!errors.servings}
            helperText={errors.servings}
          />
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Ingredients
          </Typography>
          {errors.ingredients && (
            <Typography color="error" variant="caption">
              {errors.ingredients}
            </Typography>
          )}
          <List>
            {formData.ingredients.map((ingredient, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText>
                  <TextField
                    fullWidth
                    label={`Ingredient ${index + 1}`}
                    value={ingredient.item}
                    onChange={(e) => handleIngredientChange(index, 'item', e.target.value)}
                    margin="dense"
                  />
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeIngredient(index)}
                    disabled={formData.ingredients.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addIngredient}
            sx={{ mt: 1 }}
          >
            Add Ingredient
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          {errors.instructions && (
            <Typography color="error" variant="caption">
              {errors.instructions}
            </Typography>
          )}
          <List>
            {formData.instructions.map((instruction, index) => (
              <ListItem key={index} disablePadding>
                <ListItemText>
                  <TextField
                    fullWidth
                    label={`Step ${index + 1}`}
                    value={instruction}
                    onChange={(e) => handleInstructionChange(index, e.target.value)}
                    margin="dense"
                    multiline
                  />
                </ListItemText>
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => removeInstruction(index)}
                    disabled={formData.instructions.length === 1}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
          <Button
            startIcon={<AddCircleOutlineIcon />}
            onClick={addInstruction}
            sx={{ mt: 1 }}
          >
            Add Step
          </Button>
        </Grid>

        <Grid item xs={12}>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button onClick={onCancel}>Cancel</Button>
            <Button type="submit" variant="contained">Submit Recipe</Button>
          </Stack>
        </Grid>
      </Grid>
    </Paper>
  );
};

export default AddMealForm; 