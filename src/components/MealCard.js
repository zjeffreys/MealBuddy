import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  Typography,
  Box,
  Chip,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import MealDetailsModal from './MealDetailsModal';
import LockIcon from '@mui/icons-material/Lock';

const MealCard = ({ meal, isPremium }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

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
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          transition: 'transform 0.2s, box-shadow 0.3s',
          '&:hover': {
            transform: isMobile ? 'none' : 'translateY(-4px)',
            boxShadow: 4,
          },
          cursor: 'pointer',
          borderRadius: '12px',
          overflow: 'hidden',
          boxShadow: '0 3px 6px rgba(0,0,0,0.16)'
        }}
      >
        <div className="view-recipe">View Recipe</div>
        <Box sx={{ position: 'relative' }}>
          <CardMedia
            component="img"
            height={isMobile ? "140" : "200"}
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
                padding: isMobile ? 1 : 2,
                textAlign: 'center',
              }}
            >
              <LockIcon sx={{ fontSize: isMobile ? 30 : 40, mb: 0.5 }} />
              <Typography variant={isMobile ? "body2" : "body1"} gutterBottom>
                Upgrade to Premium
              </Typography>
              {!isMobile && (
                <Typography variant="body2" sx={{ mb: 1 }}>
                  to see full images
                </Typography>
              )}
            </Box>
          )}
        </Box>
        <CardContent sx={{ 
          flexGrow: 1, 
          padding: isMobile ? '12px' : '16px',
          '&:last-child': { paddingBottom: isMobile ? '12px' : '16px' } 
        }}>
          <Typography 
            variant={isMobile ? "subtitle1" : "h6"} 
            gutterBottom
            sx={{
              fontSize: isMobile ? '0.95rem' : '1.25rem',
              fontWeight: 600,
              lineHeight: 1.2,
              mb: 0.5
            }}
          >
            {meal.name}
          </Typography>
          <Typography 
            variant="body2" 
            color="text.secondary"
            sx={{ 
              mb: 1.5,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              lineHeight: 1.3,
              fontSize: isMobile ? '0.8rem' : '0.875rem',
              height: isMobile ? 'auto' : '2.6rem',
            }}
          >
            {meal.description}
          </Typography>
          
          <Stack 
            direction="row" 
            spacing={2} 
            sx={{ mb: 1 }}
            justifyContent="flex-start"
          >
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <LocalFireDepartmentIcon color="error" fontSize="small" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                {meal.dietaryInfo.calories} cal
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <AccessTimeIcon color="primary" fontSize="small" sx={{ fontSize: isMobile ? '1rem' : '1.25rem' }} />
              <Typography variant="body2" color="text.secondary" sx={{ fontSize: isMobile ? '0.75rem' : '0.875rem' }}>
                {meal.prepTime + meal.cookTime} min
              </Typography>
            </Box>
          </Stack>

          <Box 
            sx={{ 
              display: 'flex', 
              flexWrap: 'wrap', 
              gap: 0.5,
              mt: 'auto' 
            }}
          >
            {meal.tags.slice(0, isMobile ? 2 : 3).map((tag, index) => (
              <Chip
                key={`${tag}-${index}`}
                label={tag}
                size="small"
                color="primary"
                variant="outlined"
                sx={{
                  height: isMobile ? '20px' : '24px',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  '& .MuiChip-label': {
                    padding: isMobile ? '0px 8px' : '0px 12px',
                  }
                }}
              />
            ))}
            {meal.tags.length > (isMobile ? 2 : 3) && (
              <Chip
                label={`+${meal.tags.length - (isMobile ? 2 : 3)}`}
                size="small"
                variant="outlined"
                sx={{
                  height: isMobile ? '20px' : '24px',
                  fontSize: isMobile ? '0.65rem' : '0.75rem',
                  '& .MuiChip-label': {
                    padding: isMobile ? '0px 8px' : '0px 12px',
                  }
                }}
              />
            )}
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