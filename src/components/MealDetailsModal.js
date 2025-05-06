import React, { useState, useRef } from 'react';
import Modal from 'react-modal';
import {
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  Chip,
  Stack,
  IconButton,
  Button,
  Menu,
  MenuItem,
  Divider,
  Tooltip
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import CloseIcon from '@mui/icons-material/Close';
import DownloadIcon from '@mui/icons-material/Download';
import ShareIcon from '@mui/icons-material/Share';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import EmailIcon from '@mui/icons-material/Email';
import WhatsAppIcon from '@mui/icons-material/WhatsApp';
import LockIcon from '@mui/icons-material/Lock';
import { FaTimes, FaFilePdf, FaPrint, FaFacebook, FaTwitter } from 'react-icons/fa';
import { useReactToPrint } from 'react-to-print';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

// Set the app element for accessibility
Modal.setAppElement('#root');

const MealDetailsModal = ({ isOpen, onClose, meal, isPremium }) => {
  const [shareMenuAnchor, setShareMenuAnchor] = useState(null);
  const contentRef = useRef(null);
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  // Handle printing functionality - moved before conditional return
  const handlePrint = useReactToPrint({
    content: () => contentRef.current,
    documentTitle: meal ? `${meal.name} Recipe` : 'Recipe',
    onAfterPrint: () => console.log('Print completed')
  });

  if (!meal) return null;

  // Open share menu
  const handleShareClick = (event) => {
    setShareMenuAnchor(event.currentTarget);
  };

  // Close share menu
  const handleShareClose = () => {
    setShareMenuAnchor(null);
  };

  // Generate and download PDF
  const handleDownloadPDF = async () => {
    setIsGeneratingPDF(true);
    
    try {
      const content = contentRef.current;
      const canvas = await html2canvas(content, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const imgWidth = 210; // A4 width in mm
      const imgHeight = canvas.height * imgWidth / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      pdf.save(`${meal.name.replace(/\s+/g, '-').toLowerCase()}-recipe.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Could not generate PDF. Please try again.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  // Copy recipe URL to clipboard
  const handleCopyLink = () => {
    // In a real app, this would be a unique recipe URL
    const recipeUrl = `${window.location.origin}/recipe/${meal.id}`;
    navigator.clipboard.writeText(recipeUrl)
      .then(() => {
        alert('Recipe link copied to clipboard!');
        handleShareClose();
      })
      .catch(err => {
        console.error('Failed to copy link:', err);
      });
  };

  // Share via email
  const handleEmailShare = () => {
    const subject = encodeURIComponent(`Recipe: ${meal.name}`);
    const body = encodeURIComponent(`Check out this recipe for ${meal.name}!\n\nIngredients:\n${
      meal.ingredients && meal.ingredients.map(ing => 
        typeof ing === 'string' ? ing : `${ing.amount || ''} ${ing.unit || ''} ${ing.item || ''}`
      ).join('\n')
    }\n\nFull recipe at: ${window.location.origin}/recipe/${meal.id}`);
    
    window.open(`mailto:?subject=${subject}&body=${body}`);
    handleShareClose();
  };

  // Share via social media platforms
  const handleSocialShare = (platform) => {
    const recipeUrl = `${window.location.origin}/recipe/${meal.id}`;
    const text = encodeURIComponent(`Check out this recipe for ${meal.name}!`);
    let shareUrl;
    
    switch(platform) {
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(recipeUrl)}`;
        break;
      case 'whatsapp':
        shareUrl = `https://wa.me/?text=${text}%20${encodeURIComponent(recipeUrl)}`;
        break;
      default:
        return;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    handleShareClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Meal Details"
      className="meal-detail-modal"
      overlayClassName="overlay"
      ariaHideApp={false}
    >
      <div className="meal-detail-content" ref={contentRef}>
        <IconButton 
          className="close-icon" 
          onClick={onClose} 
          aria-label="Close recipe details"
          sx={{ 
            position: 'absolute',
            top: 10,
            right: 10,
            zIndex: 10,
            color: '#fff',
            backgroundColor: 'rgba(0,0,0,0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.7)',
            }
          }}
        >
          <CloseIcon />
        </IconButton>
        
        {meal.image && (
          <div className="meal-image-container" style={{ position: 'relative' }}>
            <img
              src={meal.image}
              alt={meal.name}
              className="meal-detail-image"
              style={{
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
                <LockIcon sx={{ fontSize: 60, mb: 1 }} />
                <Typography variant="h6" gutterBottom>
                  Upgrade to Premium
                </Typography>
                <Typography variant="body1">
                  to see high quality recipe images
                </Typography>
              </Box>
            )}
          </div>
        )}
        
        <div className="meal-detail-info">
          <Typography variant="h4" gutterBottom>
            {meal.name}
          </Typography>
          
          <Box sx={{ mb: 2 }}>
            <Typography variant="body1" color="text.secondary">
              {meal.description}
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={3} sx={{ mb: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <LocalFireDepartmentIcon color="error" />
              <Typography variant="body1">
                {meal.dietaryInfo?.calories || 'N/A'} calories
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon color="primary" />
              <Typography variant="body1">
                {meal.prepTime + meal.cookTime} min total ({meal.prepTime} prep, {meal.cookTime} cook)
              </Typography>
            </Box>
          </Stack>
          
          {meal.tags && meal.tags.length > 0 && (
            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
              {meal.tags.map((tag, idx) => (
                <Chip
                  key={idx}
                  label={tag}
                  color="primary"
                  variant="outlined"
                />
              ))}
            </Box>
          )}
          
          {meal.ingredients && meal.ingredients.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Ingredients
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <List disablePadding sx={{ 
                  mb: 3,
                  filter: !isPremium ? 'blur(5px)' : 'none',
                  transition: 'filter 0.3s ease'
                }}>
                  {meal.ingredients.map((ingredient, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={
                          typeof ingredient === 'string' 
                            ? ingredient 
                            : `${ingredient.amount || ''} ${ingredient.unit || ''} ${ingredient.item || ''}`
                        } 
                      />
                    </ListItem>
                  ))}
                </List>
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
                      borderRadius: 1,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Upgrade to Premium
                    </Typography>
                    <Typography variant="body2">
                      to see ingredients
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
          
          {meal.instructions && meal.instructions.length > 0 && (
            <>
              <Typography variant="h6" gutterBottom>
                Instructions
              </Typography>
              <Box sx={{ position: 'relative' }}>
                <List disablePadding sx={{ 
                  filter: !isPremium ? 'blur(5px)' : 'none',
                  transition: 'filter 0.3s ease'
                }}>
                  {meal.instructions.map((instruction, idx) => (
                    <ListItem key={idx} disablePadding sx={{ py: 0.5 }}>
                      <ListItemText 
                        primary={`${idx + 1}. ${instruction}`} 
                      />
                    </ListItem>
                  ))}
                </List>
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
                      borderRadius: 1,
                    }}
                  >
                    <LockIcon sx={{ fontSize: 40, mb: 1 }} />
                    <Typography variant="body1" gutterBottom>
                      Upgrade to Premium
                    </Typography>
                    <Typography variant="body2">
                      to see cooking instructions
                    </Typography>
                  </Box>
                )}
              </Box>
            </>
          )}
          
          {!meal.ingredients && !meal.instructions && (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary">
                Full recipe details will be available soon!
              </Typography>
            </Box>
          )}
          
          {/* Recipe Actions - Download, Print, Share */}
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center', 
            gap: 2, 
            mt: 4, 
            pt: 2, 
            borderTop: '1px solid #eee' 
          }}>
            <Tooltip title="Download PDF">
              <Button 
                variant="outlined" 
                startIcon={<DownloadIcon />}
                onClick={handleDownloadPDF}
                disabled={isGeneratingPDF}
              >
                {isGeneratingPDF ? 'Creating PDF...' : 'Download PDF'}
              </Button>
            </Tooltip>
            
            <Tooltip title="Print Recipe">
              <Button 
                variant="outlined" 
                startIcon={<FaPrint />}
                onClick={handlePrint}
              >
                Print
              </Button>
            </Tooltip>
            
            <Tooltip title="Share Recipe">
              <Button 
                variant="outlined" 
                startIcon={<ShareIcon />}
                onClick={handleShareClick}
                aria-haspopup="true"
              >
                Share
              </Button>
            </Tooltip>
            
            <Menu
              id="share-menu"
              anchorEl={shareMenuAnchor}
              open={Boolean(shareMenuAnchor)}
              onClose={handleShareClose}
              anchorOrigin={{
                vertical: 'top',
                horizontal: 'center',
              }}
              transformOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
            >
              <MenuItem onClick={handleCopyLink}>
                <ContentCopyIcon fontSize="small" sx={{ mr: 1 }} />
                Copy Link
              </MenuItem>
              <MenuItem onClick={handleEmailShare}>
                <EmailIcon fontSize="small" sx={{ mr: 1 }} />
                Email
              </MenuItem>
              <Divider />
              <MenuItem onClick={() => handleSocialShare('facebook')}>
                <FaFacebook style={{ marginRight: 8 }} />
                Facebook
              </MenuItem>
              <MenuItem onClick={() => handleSocialShare('twitter')}>
                <FaTwitter style={{ marginRight: 8 }} />
                Twitter
              </MenuItem>
              <MenuItem onClick={() => handleSocialShare('whatsapp')}>
                <WhatsAppIcon fontSize="small" sx={{ mr: 1 }} />
                WhatsApp
              </MenuItem>
            </Menu>
          </Box>
        </div>
      </div>
    </Modal>
  );
};

export default MealDetailsModal;