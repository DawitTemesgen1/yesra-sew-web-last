// // Smart Recommendations Component
// import React, { useState, useEffect } from 'react';
// import {
//   Card, CardContent, Typography, Box, Chip, Button, Grid,
//   CircularProgress, Alert, Avatar, IconButton, Collapse
// } from '@mui/material';
// import {
//   ThumbUp, ThumbDown, Refresh, Star, LocationOn, TrendingUp,
//   ExpandMore, ExpandLess
// } from '@mui/icons-material';
// import { motion } from 'framer-motion';
// import apiService from '../services/api';
// import { useNavigate } from 'react-router-dom';

// const SmartRecommendations = ({ userId, category, limit = 6 }) => {
//   const [recommendations, setRecommendations] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(true);
//   const navigate = useNavigate();

//   useEffect(() => {
//     fetchRecommendations();
//   }, [userId, category]);

//   const fetchRecommendations = async () => {
//     try {
//       setLoading(true);
//       const response = await apiService.getRecommendedListings();
//       setRecommendations(response.data || []);
//     } catch (error) {
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       await fetchRecommendations();
//     } catch (error) {
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleFeedback = async (listingId, feedback) => {
//     try {
//       await apiService.updateRecommendationFeedback(listingId, { feedback });
//       // Remove the item from recommendations after feedback
//       setRecommendations(prev => prev.filter(item => item.id !== listingId));
//     } catch (error) {
//     }
//   };

//   const formatPrice = (price) => {
//     return price ? `${price.toLocaleString()} ETB` : 'Contact for price';
//   };

//   const getRecommendationReason = (item) => {
//     if (item.recommendation_reason) {
//       return item.recommendation_reason;
//     }
    
//     const reasons = [
//       'Based on your recent searches',
//       'Similar to items you liked',
//       'Popular in your area',
//       'Trending now',
//       'Because you viewed similar items',
//       'Recommended for you'
//     ];
    
//     return reasons[Math.floor(Math.random() * reasons.length)];
//   };

//   if (loading) {
//     return (
//       <Card sx={{ mb: 2 }}>
//         <CardContent sx={{ textAlign: 'center', py: 4 }}>
//           <CircularProgress />
//           <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
//             Finding recommendations for you...
//           </Typography>
//         </CardContent>
//       </Card>
//     );
//   }

//   return (
//     <Card sx={{ mb: 2 }}>
//       <CardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//           <TrendingUp color="primary" sx={{ mr: 1 }} />
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Recommended for You
//           </Typography>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <IconButton
//               onClick={handleRefresh}
//               disabled={refreshing}
//               size="small"
//             >
//               <Refresh />
//             </IconButton>
//             <IconButton
//               onClick={() => setIsExpanded(!isExpanded)}
//               size="small"
//               sx={{
//                 transition: 'transform 0.2s ease',
//                 transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
//               }}
//             >
//               <ExpandMore />
//             </IconButton>
//           </Box>
//         </Box>

//         <Collapse in={isExpanded} timeout={300}>
//           {recommendations.length === 0 ? (
//             <Alert severity="info">
//               <Typography variant="body2">
//                 Start browsing and we'll recommend items based on your interests!
//               </Typography>
//             </Alert>
//           ) : (
//             <Grid container spacing={2}>
//               {recommendations.slice(0, limit).map((item, index) => (
//                 <Grid item xs={12} sm={6} md={4} key={item.id}>
//                   <motion.div
//                     initial={{ opacity: 0, y: 20 }}
//                     animate={{ opacity: 1, y: 0 }}
//                     transition={{ delay: index * 0.1 }}
//                   >
//                     <Card
//                       sx={{
//                         cursor: 'pointer',
//                         height: '100%',
//                         display: 'flex',
//                         flexDirection: 'column',
//                         '&:hover': {
//                           boxShadow: 3,
//                           transform: 'translateY(-2px)'
//                         },
//                         transition: 'all 0.2s ease'
//                       }}
//                       onClick={() => navigate(`/listings/${item.id}`)}
//                     >
//                       <Box sx={{ position: 'relative' }}>
//                         {item.images && item.images[0] && (
//                           <Box
//                             component="img"
//                             src={item.images[0]}
//                             alt={item.title}
//                             sx={{
//                               width: '100%',
//                               height: 140,
//                               objectFit: 'cover'
//                             }}
//                           />
//                         )}
                        
//                         {/* Recommendation Badge */}
//                         <Chip
//                           label="Recommended"
//                           color="primary"
//                           size="small"
//                           sx={{
//                             position: 'absolute',
//                             top: 8,
//                             left: 8,
//                             fontSize: '0.7rem'
//                           }}
//                         />
                        
//                         {/* Price Badge */}
//                         {item.price && (
//                           <Chip
//                             label={formatPrice(item.price)}
//                             color="secondary"
//                             size="small"
//                             sx={{
//                               position: 'absolute',
//                               bottom: 8,
//                               right: 8,
//                               fontSize: '0.7rem',
//                               fontWeight: 'bold'
//                             }}
//                           />
//                         )}
//                       </Box>

//                       <CardContent sx={{ flexGrow: 1, pb: 1 }}>
//                         <Typography variant="subtitle2" sx={{ mb: 1 }}>
//                           {item.title}
//                         </Typography>
                        
//                         <Typography variant="caption" color="text.secondary" sx={{ mb: 1 }}>
//                           {item.category}
//                         </Typography>

//                         {item.location && (
//                           <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
//                             <LocationOn sx={{ fontSize: 14, mr: 0.5, color: 'text.secondary' }} />
//                             <Typography variant="caption" color="text.secondary">
//                               {item.location}
//                             </Typography>
//                           </Box>
//                         )}

//                         <Typography variant="caption" color="primary" sx={{ mb: 2, display: 'block' }}>
//                           {getRecommendationReason(item)}
//                         </Typography>

//                         {/* Feedback Buttons */}
//                         <Box sx={{ display: 'flex', gap: 1, mt: 'auto' }}>
//                           <Button
//                             size="small"
//                             startIcon={<ThumbUp />}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleFeedback(item.id, 'like');
//                             }}
//                             sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
//                           >
//                             Like
//                           </Button>
//                           <Button
//                             size="small"
//                             startIcon={<ThumbDown />}
//                             onClick={(e) => {
//                               e.stopPropagation();
//                               handleFeedback(item.id, 'dislike');
//                             }}
//                             sx={{ fontSize: '0.7rem', minWidth: 'auto', px: 1 }}
//                           >
//                             Hide
//                           </Button>
//                         </Box>
//                       </CardContent>
//                     </Card>
//                   </motion.div>
//                 </Grid>
//               ))}
//             </Grid>
//           )}

//           {recommendations.length > limit && (
//             <Box sx={{ textAlign: 'center', mt: 2 }}>
//               <Button
//                 variant="outlined"
//                 onClick={() => navigate('/recommendations')}
//               >
//                 View All Recommendations
//               </Button>
//             </Box>
//           )}

//           <Alert severity="info" sx={{ mt: 2 }}>
//             <Typography variant="caption">
//               💡 Recommendations improve as you browse and interact with listings
//             </Typography>
//           </Alert>
//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };

// export default SmartRecommendations;

