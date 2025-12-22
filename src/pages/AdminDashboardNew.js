// import React, { useState, useEffect } from 'react';
// import {
//   Box, Container, Typography, Grid, Card, CardContent,
//   Button, Avatar, Chip, Table, TableBody, TableCell,
//   TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
//   TextField, Select, MenuItem, FormControl, InputLabel,
//   Dialog, DialogTitle, DialogContent, DialogActions, CircularProgress
// } from '@mui/material';
// import {
//   Dashboard as DashboardIcon, People, Assignment, Settings,
//   Payments, Email, CheckCircle, Cancel as CancelIcon, AccessTime, Visibility, Edit,
//   Delete, Search, Filter
// } from '@mui/icons-material';
// import { useNavigate } from 'react-router-dom';
// import adminService from '../services/adminService';
// import toast from 'react-hot-toast';

// const AdminDashboard = () => {
//   const navigate = useNavigate();
//   const [activeTab, setActiveTab] = useState(0);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);

//   // Real data states
//   const [stats, setStats] = useState({
//     totalListings: 0,
//     pendingReview: 0,
//     approvedListings: 0,
//     rejectedListings: 0,
//     totalUsers: 0,
//     activeUsers: 0,
//     revenue: 0
//   });

//   const [listings, setListings] = useState([]);
//   const [users, setUsers] = useState([]);

//   // Fetch data from backend
//   useEffect(() => {
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Fetch dashboard stats
//         const statsData = await adminService.getDashboardStats();
//         setStats(statsData);

//         // Fetch listings
//         const listingsData = await adminService.getPendingListings();
//         setListings(listingsData.listings || []);

//         // Fetch users (we'll need to add this endpoint)
//         try {
//           const usersData = await adminService.getAllUsers();
//           setUsers(usersData.users || []);
//         } catch (error) {
//           console.error('Error fetching users:', error);
//           setUsers([]);
//         }

//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//         toast.error('Failed to load dashboard data');
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchData();
//   }, []);

//   const getStatusColor = (status) => {
//     const colors = {
//       pending: 'warning',
//       approved: 'success',
//       rejected: 'error',
//       active: 'success',
//       inactive: 'default',
//       verified: 'info'
//     };
//     return colors[status] || 'default';
//   };

//   const getStatusIcon = (status) => {
//     const icons = {
//       pending: <AccessTime />,
//       approved: <CheckCircle />,
//       rejected: <Cancel />,
//       active: <CheckCircle />,
//       inactive: <AccessTime />,
//       verified: <CheckCircle />
//     };
//     return icons[status] || <AccessTime />;
//   };

//   const handleTabChange = (event, newValue) => {
//     setActiveTab(newValue);
//   };

//   const handleSelectItem = (id) => {
//     setSelectedItems(prev => 
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   const handleBulkAction = async (action) => {
//     try {
//       if (action === 'approve') {
//         for (const listingId of selectedItems) {
//           await adminService.updateListingStatus(listingId, 2, 'Approved by admin', '');
//         }
//         toast.success('Listings approved successfully');
//       } else if (action === 'reject') {
//         for (const listingId of selectedItems) {
//           await adminService.updateListingStatus(listingId, 3, 'Rejected by admin', '');
//         }
//         toast.success('Listings rejected successfully');
//       }
      
//       // Refresh data
//       const listingsData = await adminService.getPendingListings();
//       setListings(listingsData.listings || []);
      
//       setSelectedItems([]);
//       setDialogOpen(false);
//     } catch (error) {
//       console.error('Error performing bulk action:', error);
//       toast.error('Failed to perform action');
//     }
//   };

//   const handleListingAction = async (listingId, action) => {
//     try {
//       if (action === 'approve') {
//         await adminService.updateListingStatus(listingId, 2, 'Approved by admin', '');
//         toast.success('Listing approved successfully');
//       } else if (action === 'reject') {
//         await adminService.updateListingStatus(listingId, 3, 'Rejected by admin', '');
//         toast.success('Listing rejected successfully');
//       }
      
//       // Refresh data
//       const listingsData = await adminService.getPendingListings();
//       setListings(listingsData.listings || []);
//     } catch (error) {
//       console.error('Error performing listing action:', error);
//       toast.error('Failed to perform action');
//     }
//   };

//   const filteredListings = listings.filter(listing => {
//     const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          listing.user.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
//     return matchesSearch && matchesFilter;
//   });

//   const tabContent = () => {
//     switch (activeTab) {
//       case 0: // Dashboard
//         return (
//           <Box>
//             {/* Stats Cards */}
//             <Grid container spacing={3} sx={{ mb: 4 }}>
//               <Grid item xs={12} sm={6} md={3}>
//                 <Card>
//                   <CardContent sx={{ textAlign: 'center' }}>
//                     <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
//                       <Assignment />
//                     </Avatar>
//                     <Typography variant="h4">{stats.totalListings}</Typography>
//                     <Typography color="text.secondary">Total Listings</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <Card>
//                   <CardContent sx={{ textAlign: 'center' }}>
//                     <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
//                       <AccessTime />
//                     </Avatar>
//                     <Typography variant="h4">{stats.pendingReview}</Typography>
//                     <Typography color="text.secondary">Pending Review</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <Card>
//                   <CardContent sx={{ textAlign: 'center' }}>
//                     <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
//                       <People />
//                     </Avatar>
//                     <Typography variant="h4">{stats.totalUsers}</Typography>
//                     <Typography color="text.secondary">Total Users</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <Card>
//                   <CardContent sx={{ textAlign: 'center' }}>
//                     <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
//                       <Payments />
//                     </Avatar>
//                     <Typography variant="h4">ETB {stats.revenue.toLocaleString()}</Typography>
//                     <Typography color="text.secondary">Revenue</Typography>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>

//             {/* Recent Activity */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>Recent Activity</Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>Listing</TableCell>
//                         <TableCell>User</TableCell>
//                         <TableCell>Status</TableCell>
//                         <TableCell>Date</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {listings.slice(0, 3).map(listing => (
//                         <TableRow key={listing.id}>
//                           <TableCell>{listing.title}</TableCell>
//                           <TableCell>{listing.user}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={listing.status}
//                               color={getStatusColor(listing.status)}
//                               icon={getStatusIcon(listing.status)}
//                             />
//                           </TableCell>
//                           <TableCell>{listing.date}</TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </CardContent>
//             </Card>
//           </Box>
//         );

//       case 1: // Listings
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder="Search listings..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>Status</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                   >
//                     <MenuItem value="all">All Status</MenuItem>
//                     <MenuItem value="pending">Pending</MenuItem>
//                     <MenuItem value="approved">Approved</MenuItem>
//                     <MenuItem value="rejected">Rejected</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Button
//                   variant="contained"
//                   fullWidth
//                   disabled={selectedItems.length === 0}
//                   onClick={() => setDialogOpen(true)}
//                   sx={{ height: '56px' }}
//                 >
//                   Bulk Action ({selectedItems.length})
//                 </Button>
//               </Grid>
//             </Grid>

//             {/* Listings Table */}
//             <Card>
//               <CardContent>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             onChange={(e) => {
//                               if (e.target.checked) {
//                                 setSelectedItems(filteredListings.map(l => l.id));
//                               } else {
//                                 setSelectedItems([]);
//                               }
//                             }}
//                           />
//                         </TableCell>
//                         <TableCell>Listing</TableCell>
//                         <TableCell>Category</TableCell>
//                         <TableCell>User</TableCell>
//                         <TableCell>Price</TableCell>
//                         <TableCell>Status</TableCell>
//                         <TableCell>Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {filteredListings.map(listing => (
//                         <TableRow key={listing.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(listing.id)}
//                               onChange={() => handleSelectItem(listing.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {listing.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {listing.views} views
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Chip size="small" label={listing.category} />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2">{listing.user}</Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {listing.email}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>ETB {listing.price.toLocaleString()}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={listing.status}
//                               color={getStatusColor(listing.status)}
//                               icon={getStatusIcon(listing.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Button 
//                               size="small" 
//                               startIcon={<Visibility />}
//                               onClick={() => navigate(`/listings/${listing.id}`)}
//                             >
//                               View
//                             </Button>
//                             {listing.status === 'pending' && (
//                               <>
//                                 <Button 
//                                   size="small" 
//                                   color="success" 
//                                   startIcon={<CheckCircle />}
//                                   onClick={() => handleListingAction(listing.id, 'approve')}
//                                   sx={{ ml: 1 }}
//                                 >
//                                   Approve
//                                 </Button>
//                                 <Button 
//                                   size="small" 
//                                   color="error" 
//                                   startIcon={<CancelIcon />}
//                                   onClick={() => handleListingAction(listing.id, 'reject')}
//                                   sx={{ ml: 1 }}
//                                 >
//                                   Reject
//                                 </Button>
//                               </>
//                             )}
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </CardContent>
//             </Card>
//           </Box>
//         );

//       case 2: // Users
//         return (
//           <Box>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>User Management</Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>User</TableCell>
//                         <TableCell>Type</TableCell>
//                         <TableCell>Status</TableCell>
//                         <TableCell>Listings</TableCell>
//                         <TableCell>Joined</TableCell>
//                         <TableCell>Actions</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {users.map(user => (
//                         <TableRow key={user.id}>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {user.name}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {user.email}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>
//                             <Chip size="small" label={user.type} />
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={user.status}
//                               color={getStatusColor(user.status)}
//                               icon={getStatusIcon(user.status)}
//                             />
//                           </TableCell>
//                           <TableCell>{user.listings}</TableCell>
//                           <TableCell>{user.joined}</TableCell>
//                           <TableCell>
//                             <Button size="small" startIcon={<Visibility />}>View</Button>
//                             <Button size="small" color="error" startIcon={<Delete />} sx={{ ml: 1 }}>Remove</Button>
//                           </TableCell>
//                         </TableRow>
//                       ))}
//                     </TableBody>
//                   </Table>
//                 </TableContainer>
//               </CardContent>
//             </Card>
//           </Box>
//         );

//       default:
//         return <Typography>Tab content coming soon...</Typography>;
//     }
//   };

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
//       {/* Header */}
//       <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mb: 3 }}>
//         <Container maxWidth="lg">
//           <Typography variant="h4" fontWeight="bold">
//             Admin Dashboard
//           </Typography>
//           <Typography variant="body1" sx={{ opacity: 0.9 }}>
//             Manage your marketplace with complete control
//           </Typography>
//         </Container>
//       </Box>

//       <Container maxWidth="lg">
//         {/* Tabs */}
//         <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
//           <Tabs value={activeTab} onChange={handleTabChange}>
//             <Tab icon={<DashboardIcon />} label="Dashboard" />
//             <Tab icon={<Assignment />} label="Listings" />
//             <Tab icon={<People />} label="Users" />
//             <Tab icon={<Settings />} label="Settings" />
//           </Tabs>
//         </Box>

//         {/* Tab Content */}
//         {tabContent()}
//       </Container>

//       {/* Bulk Action Dialog */}
//       <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//         <DialogTitle>Bulk Action</DialogTitle>
//         <DialogContent>
//           <Typography>
//             Perform action on {selectedItems.length} selected items
//           </Typography>
//         </DialogContent>
//         <DialogActions>
//           <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
//           <Button onClick={() => handleBulkAction('approve')} color="success">
//             Approve
//           </Button>
//           <Button onClick={() => handleBulkAction('reject')} color="error">
//             Reject
//           </Button>
//         </DialogActions>
//       </Dialog>
//     </Box>
//   );
// };

// export default AdminDashboard;

