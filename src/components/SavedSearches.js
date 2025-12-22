// // Saved Searches Component
// import React, { useState, useEffect } from 'react';
// import {
//   Card, CardContent, Typography, Button, Box, Chip, Dialog,
//   DialogTitle, DialogContent, DialogActions, TextField, List,
//   ListItem, ListItemText, ListItemSecondaryAction, IconButton,
//   Alert, Tooltip, Collapse
// } from '@mui/material';
// import {
//   Search, Bookmark, BookmarkBorder, Delete, Edit, NotificationsActive,
//   ExpandMore, ExpandLess
// } from '@mui/icons-material';
// import { motion } from 'framer-motion';
// import apiService from '../services/api';
// import toast from 'react-hot-toast';

// const SavedSearches = () => {
//   const [savedSearches, setSavedSearches] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [editingSearch, setEditingSearch] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [isExpanded, setIsExpanded] = useState(true);
//   const [formData, setFormData] = useState({
//     name: '',
//     search_query: '',
//     category: '',
//     min_price: '',
//     max_price: '',
//     location: ''
//   });

//   useEffect(() => {
//     fetchSavedSearches();
//   }, []);

//   const fetchSavedSearches = async () => {
//     try {
//       const response = await apiService.getSavedSearches();
//       setSavedSearches(response.data || []);
//     } catch (error) {
//     }
//   };

//   const handleSaveSearch = async () => {
//     if (!formData.name || !formData.search_query) {
//       toast.error('Please provide a name and search query');
//       return;
//     }

//     setLoading(true);
//     try {
//       if (editingSearch) {
//         await apiService.updateSavedSearch(editingSearch.id, formData);
//         toast.success('Search updated successfully!');
//       } else {
//         await apiService.saveSearch(formData);
//         toast.success('Search saved successfully!');
//       }
      
//       setDialogOpen(false);
//       setEditingSearch(null);
//       setFormData({
//         name: '',
//         search_query: '',
//         category: '',
//         min_price: '',
//         max_price: '',
//         location: ''
//       });
//       fetchSavedSearches();
//     } catch (error) {
//       toast.error('Failed to save search');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEditSearch = (search) => {
//     setEditingSearch(search);
//     setFormData({
//       name: search.name,
//       search_query: search.search_query,
//       category: search.category || '',
//       min_price: search.min_price || '',
//       max_price: search.max_price || '',
//       location: search.location || ''
//     });
//     setDialogOpen(true);
//   };

//   const handleDeleteSearch = async (searchId) => {
//     try {
//       await apiService.deleteSavedSearch(searchId);
//       toast.success('Search deleted successfully!');
//       fetchSavedSearches();
//     } catch (error) {
//       toast.error('Failed to delete search');
//     }
//   };

//   const formatSearchDescription = (search) => {
//     const parts = [];
//     if (search.category) parts.push(`Category: ${search.category}`);
//     if (search.min_price || search.max_price) {
//       const priceRange = search.min_price && search.max_price 
//         ? `${search.min_price} - ${search.max_price} ETB`
//         : search.min_price 
//         ? `From ${search.min_price} ETB`
//         : `Up to ${search.max_price} ETB`;
//       parts.push(`Price: ${priceRange}`);
//     }
//     if (search.location) parts.push(`Location: ${search.location}`);
    
//     return parts.length > 0 ? parts.join(' • ') : 'No filters';
//   };

//   return (
//     <Card sx={{ mb: 2 }}>
//       <CardContent>
//         <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
//           <Bookmark color="primary" sx={{ mr: 1 }} />
//           <Typography variant="h6" sx={{ flexGrow: 1 }}>
//             Saved Searches
//           </Typography>
//           <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
//             <Button
//               variant="contained"
//               startIcon={<Search />}
//               onClick={() => setDialogOpen(true)}
//               size="small"
//             >
//               Save Current Search
//             </Button>
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
//           {savedSearches.length === 0 ? (
//             <Alert severity="info">
//               <Typography variant="body2">
//                 Save your searches to get notified when new listings match your criteria.
//               </Typography>
//             </Alert>
//           ) : (
//             <List>
//               {savedSearches.map((search, index) => (
//                 <motion.div
//                   key={search.id}
//                   initial={{ opacity: 0, x: -20 }}
//                   animate={{ opacity: 1, x: 0 }}
//                   transition={{ delay: index * 0.1 }}
//                 >
//                   <ListItem
//                     sx={{
//                       border: 1,
//                       borderColor: 'divider',
//                       borderRadius: 1,
//                       mb: 1,
//                       '&:hover': { bgcolor: 'action.hover' }
//                     }}
//                   >
//                     <ListItemText
//                       primary={
//                         <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                           <Typography variant="subtitle1" sx={{ flexGrow: 1 }}>
//                             {search.name}
//                           </Typography>
//                           <Chip
//                             label="Active"
//                             color="success"
//                             size="small"
//                             icon={<NotificationsActive />}
//                             sx={{ ml: 1 }}
//                           />
//                         </Box>
//                       }
//                       secondary={
//                         <Box>
//                           <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
//                             "{search.search_query}"
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {formatSearchDescription(search)}
//                           </Typography>
//                         </Box>
//                       }
//                     />
//                     <ListItemSecondaryAction>
//                       <Tooltip title="Edit">
//                         <IconButton
//                           onClick={() => handleEditSearch(search)}
//                           size="small"
//                           sx={{ mr: 1 }}
//                         >
//                           <Edit />
//                         </IconButton>
//                       </Tooltip>
//                       <Tooltip title="Delete">
//                         <IconButton
//                           onClick={() => handleDeleteSearch(search.id)}
//                           size="small"
//                           color="error"
//                         >
//                           <Delete />
//                         </IconButton>
//                       </Tooltip>
//                     </ListItemSecondaryAction>
//                   </ListItem>
//                 </motion.div>
//               ))}
//             </List>
//           )}

//           <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
//             <DialogTitle>
//               {editingSearch ? 'Edit Saved Search' : 'Save Current Search'}
//             </DialogTitle>
//             <DialogContent>
//               <TextField
//                 fullWidth
//                 label="Search Name"
//                 value={formData.name}
//                 onChange={(e) => setFormData({ ...formData, name: e.target.value })}
//                 placeholder="e.g., Cheap cars in Addis"
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 fullWidth
//                 label="Search Query"
//                 value={formData.search_query}
//                 onChange={(e) => setFormData({ ...formData, search_query: e.target.value })}
//                 placeholder="e.g., Toyota, Hyundai, apartment for rent"
//                 sx={{ mb: 2 }}
//               />

//               <TextField
//                 fullWidth
//                 label="Category (Optional)"
//                 value={formData.category}
//                 onChange={(e) => setFormData({ ...formData, category: e.target.value })}
//                 placeholder="e.g., Cars, Homes, Jobs"
//                 sx={{ mb: 2 }}
//               />

//               <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
//                 <TextField
//                   fullWidth
//                   label="Min Price (ETB)"
//                   type="number"
//                   value={formData.min_price}
//                   onChange={(e) => setFormData({ ...formData, min_price: e.target.value })}
//                   placeholder="0"
//                 />
//                 <TextField
//                   fullWidth
//                   label="Max Price (ETB)"
//                   type="number"
//                   value={formData.max_price}
//                   onChange={(e) => setFormData({ ...formData, max_price: e.target.value })}
//                   placeholder="100000"
//                 />
//               </Box>

//               <TextField
//                 fullWidth
//                 label="Location (Optional)"
//                 value={formData.location}
//                 onChange={(e) => setFormData({ ...formData, location: e.target.value })}
//                 placeholder="e.g., Addis Ababa, Bahir Dar"
//               />
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
//               <Button
//                 onClick={handleSaveSearch}
//                 variant="contained"
//                 disabled={loading}
//               >
//                 {editingSearch ? 'Update' : 'Save'}
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </Collapse>
//       </CardContent>
//     </Card>
//   );
// };

// export default SavedSearches;

