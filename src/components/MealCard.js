import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MealDetailsModal from './MealDetailsModal';

const MealCard = ({ meal }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleMealClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <Card 
        className="meal-card-clickable"
        onClick={handleMealClick}
        sx={{ 
          position: 'relative',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: 4,
          },
          cursor: 'pointer',
        }}
      >
        <div className="view-recipe">View Recipe</div>
        <CardMedia
          component="img"
          height="200"
          image={meal.image}
          alt={meal.name}
        />
        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="h6" gutterBottom>
            {meal.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ mb: 2 }}
          >
            {meal.description}
          </Typography>
          
          <Stack direction="row" spacing={2} sx={{ mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalFireDepartmentIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {meal.dietaryInfo.calories} cal
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon color="action" fontSize="small" />
              <Typography variant="body2" color="text.secondary">
                {meal.prepTime + meal.cookTime} min
              </Typography>
            </Box>
          </Stack>

          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
            {meal.tags.map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={tag}
                size="small"
                color="primary"
                variant="outlined"
              />
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Modal for displaying meal details */}
      <MealDetailsModal 
        isOpen={isModalOpen}
        onClose={closeModal}
        meal={meal}
      />
    </>
  );
};

export default MealCard;