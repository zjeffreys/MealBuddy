import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  Button,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MealDetailsModal from './MealDetailsModal';
import LockIcon from '@mui/icons-material/Lock';

const MealCard = ({ meal, isPremium }) => {
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
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height="200"
            image={meal.image}
            alt={meal.name}
            sx={{
              filter: !isPremium ? 'blur(5px)' : 'none',
              transition: 'filter 0.3s ease'
            }}
          />
          {!isPremium && (
            <Box
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: 'rgba(0, 0, 0, 0.5)',
                color: 'white',
                padding: 2,
                textAlign: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: 40, mb: 1 }} />
              <Typography variant="body1" gutterBottom>
                Upgrade to Premium
              </Typography>
              <Typography variant="body2" sx={{ mb: 1 }}>
                to see full images
              </Typography>
            </Box>
          )}
        </Box>
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
        isPremium={isPremium}
      />
    </>
  );
};

export default MealCard;