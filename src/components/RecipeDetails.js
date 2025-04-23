import React from 'react';
import { useParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Container,
  Card,
  CardMedia,
  CardContent,
  List,
  ListItem,
  ListItemText
} from '@mui/material';
import { supabase } from '../lib/supabaseClient';

const RecipeDetails = () => {
  const { id } = useParams();
  const [meal, setMeal] = React.useState(null);

  React.useEffect(() => {
    const fetchMeal = async () => {
      const { data, error } = await supabase
        .from('meals')
        .select('*')
        .eq('id', id)
        .single();

      if (!error) {
        setMeal(data);
      }
    };

    fetchMeal();
  }, [id]);

  if (!meal) {
    return <Typography>Loading...</Typography>;
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Card>
        {meal.image && (
          <CardMedia
            component="img"
            height="300"
            image={meal.image}
            alt={meal.name}
          />
        )}
        <CardContent>
          <Typography variant="h4" gutterBottom>
            {meal.name}
          </Typography>
          <Typography variant="body1" color="text.secondary" paragraph>
            Total Time: {meal.prep_time + meal.cook_time} minutes
          </Typography>
          <Typography variant="h6" gutterBottom>
            Ingredients
          </Typography>
          <List>
            {meal.ingredients.map((ingredient, index) => (
              <ListItem key={index}>
                <ListItemText
                  primary={`${ingredient.amount} ${ingredient.unit} ${ingredient.item}`}
                />
              </ListItem>
            ))}
          </List>
          <Typography variant="h6" gutterBottom>
            Instructions
          </Typography>
          <List>
            {meal.instructions.map((instruction, index) => (
              <ListItem key={index}>
                <ListItemText primary={`${index + 1}. ${instruction}`} />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>
    </Container>
  );
};

export default RecipeDetails;