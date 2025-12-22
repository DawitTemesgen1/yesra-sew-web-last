// // DEPRECATED: This file has been refactored into a modular structure
// // Please use src/admin/AdminDashboard.js instead
// // This file is kept for backward compatibility

// import React from 'react';
// import { Navigate } from 'react-router-dom';

// // Redirect to the new admin dashboard
// const AdminDashboardFixed = () => {
//   return <Navigate to="/admin" replace />;
// };

// export default AdminDashboardFixed;

// const AdminDashboard = () => {
//   const { t } = useTranslation();
//   const navigate = useNavigate();
//   const theme = useTheme();
//   const [activeTab, setActiveTab] = useState(0);
//   const [drawerOpen, setDrawerOpen] = useState(true);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [filterStatus, setFilterStatus] = useState('all');
//   const [selectedItems, setSelectedItems] = useState([]);
//   const [dialogOpen, setDialogOpen] = useState(false);
//   const [loading, setLoading] = useState(true);
//   const [refreshing, setRefreshing] = useState(false);
//   const [useMockData, setUseMockData] = useState(false);
//   const [dataFetched, setDataFetched] = useState(false);

//   

//   // Fetch data from backend
//   useEffect(() => {
//     
//     // Only fetch once on component mount or when useMockData changes
//     if (dataFetched && !useMockData) {
//       
//       return;
//     }
    
//     const fetchData = async () => {
//       try {
//         setLoading(true);
        
//         // Choose service based on backend availability
//         const currentService = useMockData ? mockAdminService : adminService;
        
//         // Fetch dashboard stats with error handling
//         try {
//           const statsData = await currentService.getDashboardStats();
//           setStats(statsData);
//         } catch (error) {
//           console.error('Error fetching dashboard stats:', error);
//           // Set default values when backend is not available
//           setStats({
//             totalListings: 0,
//             pendingReview: 0,
//             approvedListings: 0,
//             rejectedListings: 0,
//             totalUsers: 0,
//             activeUsers: 0,
//             revenue: 0
//           });
//         }

//         // Fetch listings with error handling
//         try {
//           const listingsData = await currentService.getPendingListings();
//           setListings(listingsData.listings || []);
//         } catch (error) {
//           console.error('Error fetching listings:', error);
//           setListings([]);
//         }

//         // Fetch users with error handling
//         try {
//           const usersData = await currentService.getAllUsers();
//           setUsers(usersData.users || []);
//         } catch (error) {
//           console.error('Error fetching users:', error);
//           setUsers([]);
//         }

//       } catch (error) {
//         console.error('Error fetching dashboard data:', error);
//         toast.error(t('failedToLoadData'));
//       } finally {
//         
//         setLoading(false);
//         setDataFetched(true);
//       }
//     };

//     fetchData();
//   }, [t, useMockData, dataFetched]);

//   // Navigation menu items - using useMemo to prevent re-creation on every render
//   const menuItems = useMemo(() => [
//     { id: 0, icon: <DashboardIcon />, label: t('dashboard'), category: 'core' },
//     { id: 1, icon: <Assignment />, label: t('tender'), category: 'core' },
//     { id: 2, icon: <Category />, label: t('home'), category: 'core' },
//     { id: 3, icon: <Category />, label: t('homes'), category: 'core' },
//     { id: 4, icon: <Category />, label: t('cars'), category: 'core' },
//     { id: 5, icon: <Category />, label: t('jobs'), category: 'core' },
//     { id: 6, icon: <Category />, label: t('categories'), category: 'core' },
//     { id: 7, icon: <People />, label: t('userManagement'), category: 'core' },
//     { divider: true },
//     { id: 8, icon: <TrendingUp />, label: t('analytics'), category: 'high' },
//     { id: 9, icon: <Settings />, label: t('systemSettings'), category: 'high' },
//     { id: 10, icon: <Email />, label: t('communication'), category: 'high' },
//     { id: 11, icon: <Payments />, label: t('financial'), category: 'high' },
//     { id: 12, icon: <Delete />, label: t('moderation'), category: 'high' },
//     { divider: true },
//     { id: 13, icon: <CardMembership />, label: t('membership'), category: 'advanced' },
//     { id: 14, icon: <History />, label: t('auditLogs'), category: 'advanced' },
//     { id: 15, icon: <Star />, label: t('featured'), category: 'advanced' },
//     { id: 16, icon: <RateReview />, label: t('reviews'), category: 'advanced' },
//     { id: 17, icon: <BarChart />, label: t('reports'), category: 'advanced' },
//     { id: 18, icon: <Security />, label: t('roles'), category: 'advanced' },
//     { divider: true },
//     { id: 19, icon: <Mail />, label: t('emailTemplates'), category: 'enterprise' },
//     { id: 20, icon: <Backup />, label: t('backup'), category: 'enterprise' },
//     { id: 21, icon: <Lock />, label: t('security'), category: 'enterprise' },
//     { id: 22, icon: <Api />, label: t('api'), category: 'enterprise' },
//     { id: 23, icon: <TrendingUp />, label: t('seoMarketing'), category: 'enterprise' },
//     { id: 24, icon: <Support />, label: t('support'), category: 'enterprise' },
//     { divider: true },
//     { id: 25, icon: <TrendingUp />, label: t('advancedAnalytics'), category: 'ultimate' },
//     { id: 26, icon: <Work />, label: t('multiTenancy'), category: 'ultimate' },
//     { id: 27, icon: <PlayArrow />, label: t('automation'), category: 'ultimate' },
//     { id: 28, icon: <Smartphone />, label: t('mobileApp'), category: 'ultimate' },
//     { id: 29, icon: <Gavel />, label: t('legalCompliance'), category: 'ultimate' },
//   ], [t]);

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

//   // Refresh data
//   const handleRefresh = async () => {
//     setRefreshing(true);
//     try {
//       // Choose service based on backend availability
//       const currentService = useMockData ? mockAdminService : adminService;
      
//       // Fetch dashboard stats
//       const statsData = await currentService.getDashboardStats();
//       setStats(statsData);

//       // Fetch listings
//       const listingsData = await currentService.getPendingListings();
//       setListings(listingsData.listings || []);

//       // Fetch users
//       try {
//         const usersData = await currentService.getAllUsers();
//         setUsers(usersData.users || []);
//       } catch (error) {
//         console.error('Error fetching users:', error);
//         setUsers([]);
//       }
      
//       toast.success(t('success'));
//     } catch (error) {
//       toast.error(t('failedToLoadData'));
//     } finally {
//       setRefreshing(false);
//     }
//   };

//   const handleMenuClick = (id) => {
//     setActiveTab(id);
//   };

//   const toggleDrawer = () => {
//     setDrawerOpen(!drawerOpen);
//   };

//   const renderDrawer = () => (
//     <Drawer
//       variant="persistent"
//       anchor="left"
//       open={drawerOpen}
//       sx={{
//         width: drawerOpen ? 280 : 0,
//         flexShrink: 0,
//         '& .MuiDrawer-paper': {
//           width: 280,
//           boxSizing: 'border-box',
//           borderRight: '1px solid rgba(0, 0, 0, 0.12)',
//           bgcolor: 'background.paper'
//         }
//       }}
//     >
//       <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
//         <Typography variant="h6" color="primary">
//           {t('adminPanel')}
//         </Typography>
//         <IconButton onClick={toggleDrawer} size="small">
//           <ChevronLeft />
//         </IconButton>
//       </Box>
//       <Divider />
//       <List sx={{ flex: 1, overflow: 'auto' }}>
//         {menuItems.map((item, index) => {
//           if (item.divider) {
//             return <Divider key={`divider-${index}`} sx={{ my: 1 }} />;
//           }
//           return (
//             <ListItem
//               button
//               key={item.id}
//               selected={activeTab === item.id}
//               onClick={() => handleMenuClick(item.id)}
//               sx={{
//                 '&.Mui-selected': {
//                   bgcolor: alpha(theme.palette.primary.main, 0.08),
//                   borderLeft: `3px solid ${theme.palette.primary.main}`,
//                   '&:hover': {
//                     bgcolor: alpha(theme.palette.primary.main, 0.12)
//                   }
//                 },
//                 '&:hover': {
//                   bgcolor: 'action.hover'
//                 }
//               }}
//             >
//               <ListItemIcon sx={{ color: activeTab === item.id ? 'primary.main' : 'inherit' }}>
//                 {item.icon}
//               </ListItemIcon>
//               <ListItemText 
//                 primary={item.label}
//                 primaryTypographyProps={{
//                   fontSize: '0.875rem',
//                   fontWeight: activeTab === item.id ? 600 : 400,
//                   color: activeTab === item.id ? 'primary.main' : 'inherit'
//                 }}
//               />
//             </ListItem>
//           );
//         })}
//       </List>
//       <Divider />
//       <Box sx={{ p: 2 }}>
//         <Typography variant="caption" color="text.secondary">
//           {t('version')}: 2.1.0
//         </Typography>
//       </Box>
//     </Drawer>
//   );

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
//       rejected: <CancelIcon />,
//       active: <CheckCircle />,
//       inactive: <AccessTime />,
//       verified: <CheckCircle />
//     };
//     return icons[status] || <AccessTime />;
//   };

//   const handleSelectItem = (id) => {
//     setSelectedItems(prev => 
//       prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
//     );
//   };

//   const handleSelectAll = () => {
//     if (selectedItems.length === listings.length) {
//       setSelectedItems([]);
//     } else {
//       setSelectedItems(listings.map(item => item.id));
//     }
//   };

//   const handleBulkAction = async (action) => {
//     try {
//       if (action === 'approve') {
//         for (const listingId of selectedItems) {
//           await adminService.updateListingStatus(listingId, 2, 'Approved by admin', 'Bulk approval from admin panel');
//         }
//         toast.success(t('listingsApproved'));
//       } else if (action === 'reject') {
//         for (const listingId of selectedItems) {
//           await adminService.updateListingStatus(listingId, 3, 'Rejected by admin', 'Bulk rejection from admin panel');
//         }
//         toast.success(t('listingsRejected'));
//       }
      
//       // Refresh data
//       handleRefresh();
//       setSelectedItems([]);
//       setDialogOpen(false);
//     } catch (error) {
//       console.error('Error performing bulk action:', error);
//       toast.error(t('failedToPerformAction'));
//     }
//   };

//   const handleListingAction = async (listingId, action) => {
//     try {
//       if (action === 'approve') {
//         await adminService.updateListingStatus(listingId, 2, 'Approved by admin', 'Individual approval from admin panel');
//         toast.success(t('listingApproved'));
//       } else if (action === 'reject') {
//         await adminService.updateListingStatus(listingId, 3, 'Rejected by admin', 'Individual rejection from admin panel');
//         toast.success(t('listingRejected'));
//       }
      
//       // Refresh data
//       handleRefresh();
//     } catch (error) {
//       console.error('Error performing listing action:', error);
//       toast.error(t('failedToPerformAction'));
//     }
//   };

//   const filteredListings = useMemo(() => listings.filter(listing => {
//     const matchesSearch = listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          listing.user?.toLowerCase().includes(searchTerm.toLowerCase());
//     const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
//     return matchesSearch && matchesFilter;
//   }), [listings, searchTerm, filterStatus]);

//   const filteredUsers = useMemo(() => users.filter(user => {
//     const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
//     return matchesSearch;
//   }), [users, searchTerm]);

//   const showBackendWarning = useMemo(() => 
//     stats.totalListings === 0 && listings.length === 0 && users.length === 0,
//     [stats.totalListings, listings.length, users.length]
//   );

//   const StatCard = ({ title, value, icon, color }) => (
//     <Card 
//       sx={{ 
//         height: '100%',
//         background: `linear-gradient(135deg, ${alpha(color, 0.1)}, ${alpha(color, 0.05)})`,
//         border: `1px solid ${alpha(color, 0.2)}`
//       }}
//     >
//       <CardContent sx={{ textAlign: 'center', py: 3 }}>
//         <Avatar sx={{ 
//           bgcolor: color, 
//           mx: 'auto', 
//           mb: 2,
//           width: 56,
//           height: 56
//         }}>
//           {icon}
//         </Avatar>
//         <Typography variant="h4" fontWeight="bold" color={color}>
//           {value.toLocaleString()}
//         </Typography>
//         <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
//           {t(title)}
//         </Typography>
//       </CardContent>
//     </Card>
//   );

//   const tabContent = useMemo(() => {
//     switch (activeTab) {
//       case 0: // Dashboard
//         return (
//           <Box>
//             {/* Backend Connection Warning */}
//             {showBackendWarning && (
//               <Alert severity="warning" sx={{ mb: 3 }}>
//                 <AlertTitle>Backend Connection Issue</AlertTitle>
//                 Unable to connect to the backend server. Some features may not work properly. 
//                 Please ensure the backend server is running on port 8000.
//                 {process.env.NODE_ENV === 'development' && (
//                   <Box sx={{ mt: 2 }}>
//                     <Button
//                       variant="outlined"
//                       size="small"
//                       onClick={() => setUseMockData(true)}
//                       sx={{ mr: 1 }}
//                     >
//                       Use Mock Data
//                     </Button>
//                     <Typography variant="caption" display="block">
//                       Enable mock data to test the admin panel without backend
//                     </Typography>
//                   </Box>
//                 )}
//               </Alert>
//             )}
            
//             {/* Stats Cards */}
//             <Grid container spacing={3} sx={{ mb: 4 }}>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard 
//                   title="totalListings" 
//                   value={stats.totalListings} 
//                   icon={<Assignment />}
//                   color={theme.palette.primary.main}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard 
//                   title="pendingReview" 
//                   value={stats.pendingReview} 
//                   icon={<AccessTime />}
//                   color={theme.palette.warning.main}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard 
//                   title="totalUsers" 
//                   value={stats.totalUsers} 
//                   icon={<People />}
//                   color={theme.palette.success.main}
//                 />
//               </Grid>
//               <Grid item xs={12} sm={6} md={3}>
//                 <StatCard 
//                   title="revenue" 
//                   value={`ETB ${stats.revenue.toLocaleString()}`} 
//                   icon={<Payments />}
//                   color={theme.palette.info.main}
//                 />
//               </Grid>
//             </Grid>

//             {/* Recent Activity and Quick Actions */}
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('recentActivity')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('activity')}</TableCell>
//                             <TableCell>{t('user')}</TableCell>
//                             <TableCell>{t('timestamp')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { activity: 'New tender posted', user: 'John Doe', timestamp: '2 hours ago', status: 'success' },
//                             { activity: 'Home listing approved', user: 'Admin', timestamp: '3 hours ago', status: 'success' },
//                             { activity: 'Car listing rejected', user: 'Admin', timestamp: '5 hours ago', status: 'warning' },
//                             { activity: 'New user registered', user: 'Jane Smith', timestamp: '6 hours ago', status: 'success' },
//                             { activity: 'Job posting updated', user: 'Mike Johnson', timestamp: '8 hours ago', status: 'info' }
//                           ].map((activity, i) => (
//                             <TableRow key={i}>
//                               <TableCell>{activity.activity}</TableCell>
//                               <TableCell>{activity.user}</TableCell>
//                               <TableCell>{activity.timestamp}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={activity.status} 
//                                   color={activity.status === 'success' ? 'success' : activity.status === 'warning' ? 'warning' : 'info'}
//                                 />
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
              
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('quickActions')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Button variant="contained" color="primary" fullWidth startIcon={<Add />}>
//                         {t('addNewListing')}
//                       </Button>
//                       <Button variant="outlined" fullWidth startIcon={<People />}>
//                         {t('manageUsers')}
//                       </Button>
//                       <Button variant="outlined" fullWidth startIcon={<TrendingUp />}>
//                         {t('viewAnalytics')}
//                       </Button>
//                       <Button variant="outlined" fullWidth startIcon={<Settings />}>
//                         {t('systemSettings')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
                
//                 <Card sx={{ mt: 2 }}>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('systemOverview')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('serverStatus')}: <Chip size="small" label="Online" color="success" />
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('databaseStatus')}: <Chip size="small" label="Connected" color="success" />
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('lastBackup')}: 2 hours ago
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('storageUsed')}: 2.3 GB / 10 GB
//                       </Typography>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 1: // Tender
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchTenders')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('filterByStatus')}</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     label={t('filterByStatus')}
//                   >
//                     <MenuItem value="all">{t('all')}</MenuItem>
//                     <MenuItem value="pending">{t('pending')}</MenuItem>
//                     <MenuItem value="approved">{t('approved')}</MenuItem>
//                     <MenuItem value="rejected">{t('rejected')}</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<Refresh />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     sx={{ flex: 1 }}
//                   >
//                     {t('refresh')}
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     sx={{ flex: 1 }}
//                   >
//                     {t('addTender')}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Tender Posts Table */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('tenderPosts')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.length === listings.length && listings.length > 0}
//                             onChange={handleSelectAll}
//                           />
//                         </TableCell>
//                         <TableCell>{t('title')}</TableCell>
//                         <TableCell>{t('company')}</TableCell>
//                         <TableCell>{t('deadline')}</TableCell>
//                         <TableCell>{t('budget')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { id: 1, title: 'Construction Project', company: 'ABC Corp', deadline: '2024-02-15', budget: 'ETB 500,000', status: 'pending' },
//                         { id: 2, title: 'IT Services', company: 'Tech Solutions', deadline: '2024-02-20', budget: 'ETB 200,000', status: 'approved' },
//                         { id: 3, title: 'Supply Contract', company: 'Global Trade', deadline: '2024-02-10', budget: 'ETB 150,000', status: 'rejected' }
//                       ].map(post => (
//                         <TableRow key={post.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(post.id)}
//                               onChange={() => handleSelectItem(post.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {post.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {post.views || 0} {t('views')}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>{post.company}</TableCell>
//                           <TableCell>{post.deadline}</TableCell>
//                           <TableCell>{post.budget}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={post.status}
//                               color={getStatusColor(post.status)}
//                               icon={getStatusIcon(post.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                               {post.status === 'pending' && (
//                                 <>
//                                   <Tooltip title={t('approve')}>
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title={t('reject')}>
//                                     <IconButton size="small" color="error">
//                                       <CancelIcon />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
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

//       case 2: // Home
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchHomes')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('filterByStatus')}</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     label={t('filterByStatus')}
//                   >
//                     <MenuItem value="all">{t('all')}</MenuItem>
//                     <MenuItem value="pending">{t('pending')}</MenuItem>
//                     <MenuItem value="approved">{t('approved')}</MenuItem>
//                     <MenuItem value="rejected">{t('rejected')}</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<Refresh />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     sx={{ flex: 1 }}
//                   >
//                     {t('refresh')}
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     sx={{ flex: 1 }}
//                   >
//                     {t('addHome')}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Home Posts Table */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('homePosts')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.length === listings.length && listings.length > 0}
//                             onChange={handleSelectAll}
//                           />
//                         </TableCell>
//                         <TableCell>{t('title')}</TableCell>
//                         <TableCell>{t('location')}</TableCell>
//                         <TableCell>{t('price')}</TableCell>
//                         <TableCell>{t('bedrooms')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { id: 1, title: 'Modern Apartment', location: 'Bole, Addis Ababa', price: 'ETB 25,000', bedrooms: 3, status: 'pending' },
//                         { id: 2, title: 'Family House', location: 'Kazanchis, Addis Ababa', price: 'ETB 35,000', bedrooms: 4, status: 'approved' },
//                         { id: 3, title: 'Studio Apartment', location: 'Mekane Yesus, Addis Ababa', price: 'ETB 8,000', bedrooms: 1, status: 'rejected' }
//                       ].map(post => (
//                         <TableRow key={post.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(post.id)}
//                               onChange={() => handleSelectItem(post.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {post.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {post.views || 0} {t('views')}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>{post.location}</TableCell>
//                           <TableCell>{post.price}</TableCell>
//                           <TableCell>{post.bedrooms}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={post.status}
//                               color={getStatusColor(post.status)}
//                               icon={getStatusIcon(post.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                               {post.status === 'pending' && (
//                                 <>
//                                   <Tooltip title={t('approve')}>
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title={t('reject')}>
//                                     <IconButton size="small" color="error">
//                                       <CancelIcon />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
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

//       case 3: // Homes
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchHomes')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('filterByStatus')}</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     label={t('filterByStatus')}
//                   >
//                     <MenuItem value="all">{t('all')}</MenuItem>
//                     <MenuItem value="pending">{t('pending')}</MenuItem>
//                     <MenuItem value="approved">{t('approved')}</MenuItem>
//                     <MenuItem value="rejected">{t('rejected')}</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<Refresh />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     sx={{ flex: 1 }}
//                   >
//                     {t('refresh')}
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     sx={{ flex: 1 }}
//                   >
//                     {t('addHomes')}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Homes Posts Table */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('homesPosts')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.length === listings.length && listings.length > 0}
//                             onChange={handleSelectAll}
//                           />
//                         </TableCell>
//                         <TableCell>{t('title')}</TableCell>
//                         <TableCell>{t('location')}</TableCell>
//                         <TableCell>{t('price')}</TableCell>
//                         <TableCell>{t('bedrooms')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { id: 1, title: 'Luxury Villa', location: 'Bole, Addis Ababa', price: 'ETB 45,000', bedrooms: 5, status: 'pending' },
//                         { id: 2, title: 'Penthouse', location: 'CMC, Addis Ababa', price: 'ETB 55,000', bedrooms: 4, status: 'approved' },
//                         { id: 3, title: 'Townhouse', location: 'Ayat, Addis Ababa', price: 'ETB 28,000', bedrooms: 3, status: 'rejected' }
//                       ].map(post => (
//                         <TableRow key={post.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(post.id)}
//                               onChange={() => handleSelectItem(post.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {post.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {post.views || 0} {t('views')}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>{post.location}</TableCell>
//                           <TableCell>{post.price}</TableCell>
//                           <TableCell>{post.bedrooms}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={post.status}
//                               color={getStatusColor(post.status)}
//                               icon={getStatusIcon(post.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                               {post.status === 'pending' && (
//                                 <>
//                                   <Tooltip title={t('approve')}>
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title={t('reject')}>
//                                     <IconButton size="small" color="error">
//                                       <CancelIcon />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
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

//       case 4: // Cars
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchCars')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('filterByStatus')}</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     label={t('filterByStatus')}
//                   >
//                     <MenuItem value="all">{t('all')}</MenuItem>
//                     <MenuItem value="pending">{t('pending')}</MenuItem>
//                     <MenuItem value="approved">{t('approved')}</MenuItem>
//                     <MenuItem value="rejected">{t('rejected')}</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<Refresh />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     sx={{ flex: 1 }}
//                   >
//                     {t('refresh')}
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     sx={{ flex: 1 }}
//                   >
//                     {t('addCar')}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Cars Posts Table */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('carPosts')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.length === listings.length && listings.length > 0}
//                             onChange={handleSelectAll}
//                           />
//                         </TableCell>
//                         <TableCell>{t('title')}</TableCell>
//                         <TableCell>{t('make')}</TableCell>
//                         <TableCell>{t('model')}</TableCell>
//                         <TableCell>{t('price')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { id: 1, title: 'Toyota Corolla 2022', make: 'Toyota', model: 'Corolla', price: 'ETB 1,200,000', status: 'pending' },
//                         { id: 2, title: 'Honda Civic 2021', make: 'Honda', model: 'Civic', price: 'ETB 980,000', status: 'approved' },
//                         { id: 3, title: 'Nissan Sentra 2020', make: 'Nissan', model: 'Sentra', price: 'ETB 750,000', status: 'rejected' }
//                       ].map(post => (
//                         <TableRow key={post.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(post.id)}
//                               onChange={() => handleSelectItem(post.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {post.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {post.views || 0} {t('views')}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>{post.make}</TableCell>
//                           <TableCell>{post.model}</TableCell>
//                           <TableCell>{post.price}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={post.status}
//                               color={getStatusColor(post.status)}
//                               icon={getStatusIcon(post.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                               {post.status === 'pending' && (
//                                 <>
//                                   <Tooltip title={t('approve')}>
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title={t('reject')}>
//                                     <IconButton size="small" color="error">
//                                       <CancelIcon />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
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

//       case 5: // Jobs
//         return (
//           <Box>
//             {/* Search and Filter */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={6}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchJobs')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <FormControl fullWidth>
//                   <InputLabel>{t('filterByStatus')}</InputLabel>
//                   <Select
//                     value={filterStatus}
//                     onChange={(e) => setFilterStatus(e.target.value)}
//                     label={t('filterByStatus')}
//                   >
//                     <MenuItem value="all">{t('all')}</MenuItem>
//                     <MenuItem value="pending">{t('pending')}</MenuItem>
//                     <MenuItem value="approved">{t('approved')}</MenuItem>
//                     <MenuItem value="rejected">{t('rejected')}</MenuItem>
//                   </Select>
//                 </FormControl>
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <Box sx={{ display: 'flex', gap: 1 }}>
//                   <Button
//                     variant="outlined"
//                     startIcon={<Refresh />}
//                     onClick={handleRefresh}
//                     disabled={refreshing}
//                     sx={{ flex: 1 }}
//                   >
//                     {t('refresh')}
//                   </Button>
//                   <Button
//                     variant="contained"
//                     color="primary"
//                     sx={{ flex: 1 }}
//                   >
//                     {t('addJob')}
//                   </Button>
//                 </Box>
//               </Grid>
//             </Grid>

//             {/* Jobs Posts Table */}
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('jobPosts')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell padding="checkbox">
//                           <input
//                             type="checkbox"
//                             checked={selectedItems.length === listings.length && listings.length > 0}
//                             onChange={handleSelectAll}
//                           />
//                         </TableCell>
//                         <TableCell>{t('title')}</TableCell>
//                         <TableCell>{t('company')}</TableCell>
//                         <TableCell>{t('location')}</TableCell>
//                         <TableCell>{t('salary')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { id: 1, title: 'Software Developer', company: 'Tech Corp', location: 'Addis Ababa', salary: 'ETB 25,000', status: 'pending' },
//                         { id: 2, title: 'Marketing Manager', company: 'Ad Agency', location: 'Bole, Addis Ababa', salary: 'ETB 18,000', status: 'approved' },
//                         { id: 3, title: 'Accountant', company: 'Finance Ltd', location: 'Kazanchis, Addis Ababa', salary: 'ETB 15,000', status: 'rejected' }
//                       ].map(post => (
//                         <TableRow key={post.id}>
//                           <TableCell padding="checkbox">
//                             <input
//                               type="checkbox"
//                               checked={selectedItems.includes(post.id)}
//                               onChange={() => handleSelectItem(post.id)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {post.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {post.views || 0} {t('views')}
//                               </Typography>
//                             </Box>
//                           </TableCell>
//                           <TableCell>{post.company}</TableCell>
//                           <TableCell>{post.location}</TableCell>
//                           <TableCell>{post.salary}</TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={post.status}
//                               color={getStatusColor(post.status)}
//                               icon={getStatusIcon(post.status)}
//                             />
//                           </TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                               {post.status === 'pending' && (
//                                 <>
//                                   <Tooltip title={t('approve')}>
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   </Tooltip>
//                                   <Tooltip title={t('reject')}>
//                                     <IconButton size="small" color="error">
//                                       <CancelIcon />
//                                     </IconButton>
//                                   </Tooltip>
//                                 </>
//                               )}
//                             </Box>
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

//       case 6: // Categories
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('addNewCategory')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('categoryName')}
//                         placeholder={t('enterCategoryName')}
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('categoryDescription')}
//                         placeholder={t('enterCategoryDescription')}
//                         multiline
//                         rows={3}
//                       />
//                       <FormControl fullWidth>
//                         <InputLabel>{t('parentCategory')}</InputLabel>
//                         <Select label={t('parentCategory')} defaultValue="">
//                           <MenuItem value="">{t('none')}</MenuItem>
//                           <MenuItem value="1">{t('tender')}</MenuItem>
//                           <MenuItem value="2">{t('home')}</MenuItem>
//                           <MenuItem value="3">{t('homes')}</MenuItem>
//                           <MenuItem value="4">{t('cars')}</MenuItem>
//                           <MenuItem value="5">{t('jobs')}</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <TextField
//                         fullWidth
//                         label={t('categoryIcon')}
//                         placeholder={t('enterIconName')}
//                       />
//                       <Box sx={{ display: 'flex', gap: 2 }}>
//                         <Button variant="contained" color="primary">
//                           {t('addCategory')}
//                         </Button>
//                         <Button variant="outlined">
//                           {t('cancel')}
//                         </Button>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('existingCategories')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('listings')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { name: 'Tender', count: 45, status: 'active' },
//                             { name: 'Home', count: 32, status: 'active' },
//                             { name: 'Homes', count: 28, status: 'active' },
//                             { name: 'Cars', count: 189, status: 'active' },
//                             { name: 'Jobs', count: 267, status: 'active' },
//                             { name: 'Electronics', count: 15, status: 'inactive' }
//                           ].map((category, i) => (
//                             <TableRow key={i}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {category.name}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{category.count}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={category.status} 
//                                   color={category.status === 'active' ? 'success' : 'default'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 7: // User Management
//         return (
//           <Box>
//             {/* Search */}
//             <Grid container spacing={2} sx={{ mb: 3 }}>
//               <Grid item xs={12} md={8}>
//                 <TextField
//                   fullWidth
//                   placeholder={t('searchUsers')}
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   InputProps={{ startAdornment: <Search /> }}
//                 />
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Button
//                   variant="outlined"
//                   startIcon={<Refresh />}
//                   onClick={handleRefresh}
//                   disabled={refreshing}
//                   fullWidth
//                 >
//                   {t('refresh')}
//                 </Button>
//               </Grid>
//             </Grid>

//             {/* Users Table */}
//             <Card>
//               <CardContent>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>{t('user')}</TableCell>
//                         <TableCell>{t('type')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                         <TableCell>{t('listings')}</TableCell>
//                         <TableCell>{t('joined')}</TableCell>
//                         <TableCell>{t('actions')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {filteredUsers.map(user => (
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
//                             <Chip size="small" label={user.type || t('individual')} />
//                           </TableCell>
//                           <TableCell>
//                             <Chip
//                               size="small"
//                               label={user.status || t('active')}
//                               color={getStatusColor(user.status)}
//                               icon={getStatusIcon(user.status)}
//                             />
//                           </TableCell>
//                           <TableCell>{user.listings || 0}</TableCell>
//                           <TableCell>{user.joined || 'N/A'}</TableCell>
//                           <TableCell>
//                             <Box sx={{ display: 'flex', gap: 1 }}>
//                               <Tooltip title={t('view')}>
//                                 <IconButton size="small">
//                                   <Visibility />
//                                 </IconButton>
//                               </Tooltip>
//                               <Tooltip title={t('edit')}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                               </Tooltip>
//                             </Box>
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

//       case 7: // Analytics & Reports
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               {/* Revenue Chart */}
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('revenueAnalytics')}
//                     </Typography>
//                     <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
//                       <Box sx={{ textAlign: 'center' }}>
//                         <TrendingUp sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
//                         <Typography variant="h4" color="primary.main" gutterBottom>
//                           ETB 2,456,789
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('totalRevenue')} - {t('last30Days')}
//                         </Typography>
//                         <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
//                           ↑ 23.5% {t('fromLastMonth')}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
              
//               {/* Quick Stats */}
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('quickStats')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('avgListingPrice')}</Typography>
//                         <Typography variant="h6" color="primary.main">ETB 25,000</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('conversionRate')}</Typography>
//                         <Typography variant="h6" color="success.main">12.5%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('activeCategories')}</Typography>
//                         <Typography variant="h6" color="info.main">8</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('avgTimeOnSite')}</Typography>
//                         <Typography variant="h6" color="warning.main">4m 32s</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('bounceRate')}</Typography>
//                         <Typography variant="h6" color="error.main">32.4%</Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* User Growth */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('userGrowth')}
//                     </Typography>
//                     <Box sx={{ height: 250, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
//                       <Box sx={{ textAlign: 'center' }}>
//                         <People sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
//                         <Typography variant="h4" color="success.main" gutterBottom>
//                           15,234
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('totalUsers')} - {t('last30Days')}
//                         </Typography>
//                         <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
//                           ↑ 18.2% {t('fromLastMonth')}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Category Performance */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('categoryPerformance')}
//                     </Typography>
//                     <Box sx={{ height: 250, overflow: 'auto' }}>
//                       <TableContainer>
//                         <Table size="small">
//                           <TableHead>
//                             <TableRow>
//                               <TableCell>{t('category')}</TableCell>
//                               <TableCell>{t('listings')}</TableCell>
//                               <TableCell>{t('views')}</TableCell>
//                               <TableCell>{t('conversion')}</TableCell>
//                             </TableRow>
//                           </TableHead>
//                           <TableBody>
//                             {[
//                               { category: 'Cars', listings: 189, views: 45678, conversion: '8.5%' },
//                               { category: 'Jobs', listings: 267, views: 34234, conversion: '12.3%' },
//                               { category: 'Homes', listings: 156, views: 28901, conversion: '6.7%' },
//                               { category: 'Tender', listings: 45, views: 12345, conversion: '15.2%' },
//                               { category: 'Home', listings: 32, views: 8765, conversion: '9.8%' }
//                             ].map((cat, i) => (
//                               <TableRow key={i}>
//                                 <TableCell>{cat.category}</TableCell>
//                                 <TableCell>{cat.listings}</TableCell>
//                                 <TableCell>{cat.views.toLocaleString()}</TableCell>
//                                 <TableCell>
//                                   <Chip size="small" label={cat.conversion} color="success" />
//                                 </TableCell>
//                               </TableRow>
//                             ))}
//                           </TableBody>
//                         </Table>
//                       </TableContainer>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Top Performing Listings */}
//               <Grid item xs={12}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('topPerformingListings')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('title')}</TableCell>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('views')}</TableCell>
//                             <TableCell>{t('inquiries')}</TableCell>
//                             <TableCell>{t('conversionRate')}</TableCell>
//                             <TableCell>{t('revenue')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { title: 'Luxury Villa in Bole', category: 'Homes', views: 12345, inquiries: 234, conversion: '1.9%', revenue: 'ETB 450,000' },
//                             { title: 'Toyota Land Cruiser 2023', category: 'Cars', views: 9876, inquiries: 156, conversion: '1.6%', revenue: 'ETB 2,100,000' },
//                             { title: 'Senior Developer Position', category: 'Jobs', views: 8765, inquiries: 321, conversion: '3.7%', revenue: 'ETB 75,000' },
//                             { title: 'Construction Tender - Road Project', category: 'Tender', views: 6543, inquiries: 89, conversion: '1.4%', revenue: 'ETB 5,000,000' }
//                           ].map((listing, i) => (
//                             <TableRow key={i}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {listing.title}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={listing.category} />
//                               </TableCell>
//                               <TableCell>{listing.views.toLocaleString()}</TableCell>
//                               <TableCell>{listing.inquiries}</TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={listing.conversion} color="success" />
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color="success.main" fontWeight="medium">
//                                   {listing.revenue}
//                                 </Typography>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 8: // System Settings
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('generalSettings')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
//                       <Box>
//                         <Typography variant="subtitle2" gutterBottom>
//                           {t('siteMaintenance')}
//                         </Typography>
//                         <FormControlLabel
//                           control={<Switch defaultChecked />}
//                           label={t('siteOnline')}
//                         />
//                         <Box sx={{ mt: 2 }}>
//                           <TextField
//                             fullWidth
//                             label={t('maintenanceMessage')}
//                             multiline
//                             rows={2}
//                             defaultValue="Site is under maintenance. Please check back later."
//                           />
//                         </Box>
//                       </Box>
                      
//                       <Box>
//                         <Typography variant="subtitle2" gutterBottom>
//                           {t('userRegistration')}
//                         </Typography>
//                         <FormControlLabel
//                           control={<Switch defaultChecked />}
//                           label={t('allowNewRegistrations')}
//                         />
//                         <FormControlLabel
//                           control={<Switch />}
//                           label={t('requireEmailVerification')}
//                         />
//                         <FormControlLabel
//                           control={<Switch defaultChecked />}
//                           label={t('allowSocialLogin')}
//                         />
//                       </Box>

//                       <Box>
//                         <Typography variant="subtitle2" gutterBottom>
//                           {t('listingSettings')}
//                         </Typography>
//                         <FormControlLabel
//                           control={<Switch />}
//                           label={t('requireAdminApproval')}
//                         />
//                         <FormControlLabel
//                           control={<Switch defaultChecked />}
//                           label={t('allowFeaturedListings')}
//                         />
//                         <Box sx={{ mt: 2 }}>
//                           <TextField
//                             fullWidth
//                             label={t('maxListingsPerUser')}
//                             type="number"
//                             defaultValue="10"
//                           />
//                         </Box>
//                       </Box>

//                       <Box>
//                         <Typography variant="subtitle2" gutterBottom>
//                           {t('siteInformation')}
//                         </Typography>
//                         <TextField
//                           fullWidth
//                           label={t('siteName')}
//                           defaultValue="YesraSew"
//                           sx={{ mb: 2 }}
//                         />
//                         <TextField
//                           fullWidth
//                           multiline
//                           rows={3}
//                           label={t('siteDescription')}
//                           defaultValue="Quality Gold Marketplace for Ethiopia"
//                         />
//                         <TextField
//                           fullWidth
//                           label={t('contactEmail')}
//                           type="email"
//                           defaultValue="info@yesrasew.com"
//                           sx={{ mt: 2 }}
//                         />
//                         <TextField
//                           fullWidth
//                           label={t('phoneNumber')}
//                           defaultValue="+251 911 234 567"
//                           sx={{ mt: 2 }}
//                         />
//                       </Box>

//                       <Button variant="contained" color="primary">
//                         {t('saveSettings')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('systemInfo')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('serverStatus')}
//                         </Typography>
//                         <Chip size="small" label={t('online')} color="success" />
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('databaseStatus')}
//                         </Typography>
//                         <Chip size="small" label={t('connected')} color="success" />
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('lastBackup')}
//                         </Typography>
//                         <Typography variant="body2">2 hours ago</Typography>
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('storageUsed')}
//                         </Typography>
//                         <Typography variant="body2">2.3 GB / 10 GB</Typography>
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('systemVersion')}
//                         </Typography>
//                         <Typography variant="body2">v2.1.0</Typography>
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('uptime')}
//                         </Typography>
//                         <Typography variant="body2">45 days, 12 hours</Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>

//                 <Card sx={{ mt: 2 }}>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('performanceSettings')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('enableCaching')}
//                       />
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('enableCompression')}
//                       />
//                       <FormControlLabel
//                         control={<Switch />}
//                         label={t('debugMode')}
//                       />
//                       <Box sx={{ mt: 2 }}>
//                         <TextField
//                           fullWidth
//                           label={t('cacheTimeout')}
//                           type="number"
//                           defaultValue="3600"
//                           helperText={t('seconds')}
//                         />
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>

//                 <Card sx={{ mt: 2 }}>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('securitySettings')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('enableTwoFactor')}
//                       />
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('forceSSL')}
//                       />
//                       <FormControlLabel
//                         control={<Switch />}
//                         label={t('enableCaptcha')}
//                       />
//                       <Box sx={{ mt: 2 }}>
//                         <TextField
//                           fullWidth
//                           label={t('sessionTimeout')}
//                           type="number"
//                           defaultValue="30"
//                           helperText={t('minutes')}
//                         />
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 9: // Communication Management
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('sendAnnouncement')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('announcementTitle')}
//                         placeholder={t('enterTitle')}
//                       />
//                       <TextField
//                         fullWidth
//                         multiline
//                         rows={4}
//                         label={t('announcementMessage')}
//                         placeholder={t('enterMessage')}
//                       />
//                       <FormControl fullWidth>
//                         <InputLabel>{t('sendTo')}</InputLabel>
//                         <Select label={t('sendTo')} defaultValue="all">
//                           <MenuItem value="all">{t('allUsers')}</MenuItem>
//                           <MenuItem value="active">{t('activeUsers')}</MenuItem>
//                           <MenuItem value="verified">{t('verifiedUsers')}</MenuItem>
//                           <MenuItem value="premium">{t('premiumUsers')}</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('sendEmailNotification')}
//                       />
//                       <FormControlLabel
//                         control={<Switch />}
//                         label={t('sendSMSNotification')}
//                       />
//                       <Box sx={{ display: 'flex', gap: 2 }}>
//                         <Button variant="contained" color="primary">
//                           {t('sendAnnouncement')}
//                         </Button>
//                         <Button variant="outlined">
//                           {t('schedule')}
//                         </Button>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('recentAnnouncements')}
//                     </Typography>
//                     <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
//                       {[
//                         { title: 'New Features Released', message: 'We have added new categories...', sentTo: 'All Users', date: '2 hours ago', status: 'delivered' },
//                         { title: 'Maintenance Notice', message: 'System will be down for maintenance...', sentTo: 'All Users', date: '1 day ago', status: 'delivered' },
//                         { title: 'Premium Benefits', message: 'Check out our new premium features...', sentTo: 'Premium Users', date: '3 days ago', status: 'delivered' },
//                         { title: 'Holiday Sale', message: 'Special discount on featured listings...', sentTo: 'All Users', date: '1 week ago', status: 'scheduled' }
//                       ].map((announcement, i) => (
//                         <Box key={i} sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
//                           <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
//                             <Box sx={{ flex: 1 }}>
//                               <Typography variant="body2" fontWeight="medium">
//                                 {announcement.title}
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
//                                 {announcement.message.substring(0, 50)}...
//                               </Typography>
//                               <Typography variant="caption" color="text.secondary">
//                                 {t('sentTo')}: {announcement.sentTo} • {announcement.date}
//                               </Typography>
//                             </Box>
//                             <Chip 
//                               size="small" 
//                               label={announcement.status} 
//                               color={announcement.status === 'delivered' ? 'success' : 'warning'}
//                             />
//                           </Box>
//                         </Box>
//                       ))}
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('emailTemplates')}
//                     </Typography>
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('template')}</TableCell>
//                             <TableCell>{t('usage')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { template: 'Welcome Email', usage: 1234 },
//                             { template: 'Listing Approved', usage: 567 },
//                             { template: 'Password Reset', usage: 89 },
//                             { template: 'Newsletter', usage: 2345 }
//                           ].map((template, i) => (
//                             <TableRow key={i}>
//                               <TableCell>{template.template}</TableCell>
//                               <TableCell>{template.usage}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('communicationStats')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('totalEmailsSent')}</Typography>
//                         <Typography variant="h6" color="primary.main">4,567</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('totalSMSsent')}</Typography>
//                         <Typography variant="h6" color="success.main">1,234</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('emailOpenRate')}</Typography>
//                         <Typography variant="h6" color="info.main">68.5%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('clickRate')}</Typography>
//                         <Typography variant="h6" color="warning.main">12.3%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('unsubscribedUsers')}</Typography>
//                         <Typography variant="h6" color="error.main">23</Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );
//                     <Box sx={{ maxHeight: 400, overflow: 'auto' }}>
//                       {[1, 2, 3].map(i => (
//                         <Box key={i} sx={{ py: 2, borderBottom: 1, borderColor: 'divider' }}>
//                           <Typography variant="body2" fontWeight="medium">
//                             {t('systemMaintenanceScheduled')}
//                           </Typography>
//                           <Typography variant="caption" color="text.secondary">
//                             {t('sentTo')} 1,234 {t('users')} • 2 {t('hoursAgo')}
//                           </Typography>
//                         </Box>
//                       ))}
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 10: // Financial Management
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               {/* Revenue Overview */}
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="totalRevenue" 
//                   value={`ETB ${stats.revenue.toLocaleString()}`} 
//                   icon={<Payments />}
//                   color={theme.palette.success.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="pendingPayouts" 
//                   value="ETB 45,000" 
//                   icon={<AccessTime />}
//                   color={theme.palette.warning.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="commissionEarned" 
//                   value="ETB 12,500" 
//                   icon={<TrendingUp />}
//                   color={theme.palette.info.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="activeSubscriptions" 
//                   value="234" 
//                   icon={<People />}
//                   color={theme.palette.primary.main}
//                 />
//               </Grid>

//               {/* Revenue Chart */}
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('revenueOverview')}
//                     </Typography>
//                     <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
//                       <Box sx={{ textAlign: 'center' }}>
//                         <TrendingUp sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
//                         <Typography variant="h4" color="success.main" gutterBottom>
//                           ETB 2,456,789
//                         </Typography>
//                         <Typography variant="body2" color="text.secondary">
//                           {t('totalRevenue')} - {t('last30Days')}
//                         </Typography>
//                         <Typography variant="body2" color="success.main" sx={{ mt: 1 }}>
//                           ↑ 23.5% {t('fromLastMonth')}
//                         </Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Quick Stats */}
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('financialStats')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('avgTransaction')}</Typography>
//                         <Typography variant="h6" color="primary.main">ETB 2,345</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('commissionRate')}</Typography>
//                         <Typography variant="h6" color="success.main">5.2%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('refundRate')}</Typography>
//                         <Typography variant="h6" color="error.main">1.8%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('successRate')}</Typography>
//                         <Typography variant="h6" color="info.main">98.2%</Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Transactions Table */}
//               <Grid item xs={12}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('recentTransactions')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('transactionId')}</TableCell>
//                             <TableCell>{t('user')}</TableCell>
//                             <TableCell>{t('type')}</TableCell>
//                             <TableCell>{t('amount')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('date')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 'TRX001', user: 'John Doe', type: 'Listing Fee', amount: 'ETB 500', status: 'completed', date: '2024-01-15' },
//                             { id: 'TRX002', user: 'Jane Smith', type: 'Premium Subscription', amount: 'ETB 2,500', status: 'completed', date: '2024-01-15' },
//                             { id: 'TRX003', user: 'Mike Johnson', type: 'Featured Listing', amount: 'ETB 1,000', status: 'pending', date: '2024-01-14' },
//                             { id: 'TRX004', user: 'Sarah Williams', type: 'Commission', amount: 'ETB 250', status: 'completed', date: '2024-01-14' },
//                             { id: 'TRX005', user: 'David Brown', type: 'Refund', amount: 'ETB -500', status: 'processed', date: '2024-01-13' },
//                             { id: 'TRX006', user: 'Lisa Anderson', type: 'Listing Fee', amount: 'ETB 750', status: 'failed', date: '2024-01-13' }
//                           ].map((transaction, i) => (
//                             <TableRow key={i}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {transaction.id}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{transaction.user}</TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={transaction.type} />
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color={transaction.amount.startsWith('-') ? 'error.main' : 'success.main'} fontWeight="medium">
//                                   {transaction.amount}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={transaction.status} 
//                                   color={
//                                     transaction.status === 'completed' ? 'success' : 
//                                     transaction.status === 'pending' ? 'warning' : 
//                                     transaction.status === 'processed' ? 'info' : 'error'
//                                   }
//                                 />
//                               </TableCell>
//                               <TableCell>{transaction.date}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                   {transaction.status === 'pending' && (
//                                     <IconButton size="small" color="success">
//                                       <CheckCircle />
//                                     </IconButton>
//                                   )}
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Payout Management */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('pendingPayouts')}
//                     </Typography>
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('user')}</TableCell>
//                             <TableCell>{t('amount')}</TableCell>
//                             <TableCell>{t('requested')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { user: 'Alice Cooper', amount: 'ETB 5,000', requested: '2 days ago' },
//                             { user: 'Bob Martin', amount: 'ETB 3,500', requested: '3 days ago' },
//                             { user: 'Carol White', amount: 'ETB 7,200', requested: '5 days ago' }
//                           ].map((payout, i) => (
//                             <TableRow key={i}>
//                               <TableCell>{payout.user}</TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color="success.main" fontWeight="medium">
//                                   {payout.amount}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{payout.requested}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small" color="success">
//                                     <CheckCircle />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <CancelIcon />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Revenue by Category */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('revenueByCategory')}
//                     </Typography>
//                     <TableContainer>
//                       <Table size="small">
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('transactions')}</TableCell>
//                             <TableCell>{t('revenue')}</TableCell>
//                             <TableCell>{t('growth')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { category: 'Cars', transactions: 89, revenue: 'ETB 445,000', growth: '+12.5%' },
//                             { category: 'Jobs', transactions: 156, revenue: 'ETB 312,000', growth: '+8.3%' },
//                             { category: 'Homes', transactions: 67, revenue: 'ETB 502,500', growth: '+15.7%' },
//                             { category: 'Tender', transactions: 23, revenue: 'ETB 345,000', growth: '+22.1%' },
//                             { category: 'Home', transactions: 45, revenue: 'ETB 112,500', growth: '+5.2%' }
//                           ].map((cat, i) => (
//                             <TableRow key={i}>
//                               <TableCell>{cat.category}</TableCell>
//                               <TableCell>{cat.transactions}</TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color="success.main" fontWeight="medium">
//                                   {cat.revenue}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color="success.main">
//                                   {cat.growth}
//                                 </Typography>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 11: // Content Moderation
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               {/* Moderation Stats */}
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="pendingReviews" 
//                   value="23" 
//                   icon={<AccessTime />}
//                   color={theme.palette.warning.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="reportedListings" 
//                   value="8" 
//                   icon={<Warning />}
//                   color={theme.palette.error.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="flaggedUsers" 
//                   value="5" 
//                   icon={<PersonOff />}
//                   color={theme.palette.info.main}
//                 />
//               </Grid>
//               <Grid item xs={12} md={3}>
//                 <StatCard 
//                   title="resolvedToday" 
//                   value="45" 
//                   icon={<CheckCircle />}
//                   color={theme.palette.success.main}
//                 />
//               </Grid>

//               {/* Reported Listings */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('reportedListings')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('listing')}</TableCell>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('reason')}</TableCell>
//                             <TableCell>{t('reportedBy')}</TableCell>
//                             <TableCell>{t('date')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { title: 'Suspicious Car Listing', category: 'Cars', reason: 'Fraudulent photos', reportedBy: 'John Doe', date: '2 hours ago' },
//                             { title: 'Inappropriate Job Post', category: 'Jobs', reason: 'Discriminatory content', reportedBy: 'Jane Smith', date: '5 hours ago' },
//                             { title: 'Fake Home Rental', category: 'Homes', reason: 'Scam listing', reportedBy: 'Mike Johnson', date: '1 day ago' },
//                             { title: 'Misleading Tender', category: 'Tender', reason: 'False information', reportedBy: 'Sarah Williams', date: '2 days ago' }
//                           ].map((listing, i) => (
//                             <TableRow key={i}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {listing.title}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={listing.category} />
//                               </TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={listing.reason} color="error" />
//                               </TableCell>
//                               <TableCell>{listing.reportedBy}</TableCell>
//                               <TableCell>{listing.date}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                   <IconButton size="small" color="success">
//                                     <CheckCircle />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Flagged Users */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('flaggedUsers')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('user')}</TableCell>
//                             <TableCell>{t('reports')}</TableCell>
//                             <TableCell>{t('reason')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { user: 'spam_user123', reports: 5, reason: 'Spam posting', status: 'suspended' },
//                             { user: 'fake_seller456', reports: 3, reason: 'Fraudulent activity', status: 'under_review' },
//                             { user: 'abusive_user789', reports: 7, reason: 'Harassment', status: 'banned' },
//                             { user: 'duplicate_poster', reports: 2, reason: 'Multiple accounts', status: 'warning' }
//                           ].map((user, i) => (
//                             <TableRow key={i}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {user.user}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={user.reports} color="error" />
//                               </TableCell>
//                               <TableCell>{user.reason}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={user.status.replace('_', ' ')} 
//                                   color={
//                                     user.status === 'banned' ? 'error' : 
//                                     user.status === 'suspended' ? 'warning' : 
//                                     user.status === 'under_review' ? 'info' : 'default'
//                                   }
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                   <IconButton size="small" color="success">
//                                     <CheckCircle />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Block />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Pending Reviews */}
//               <Grid item xs={12}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('pendingReviews')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell padding="checkbox">
//                               <input type="checkbox" />
//                             </TableCell>
//                             <TableCell>{t('title')}</TableCell>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('submittedBy')}</TableCell>
//                             <TableCell>{t('submittedOn')}</TableCell>
//                             <TableCell>{t('priority')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { title: 'Luxury Apartment for Rent', category: 'Homes', submittedBy: 'Alice Cooper', submittedOn: '1 hour ago', priority: 'high' },
//                             { title: 'Software Developer Job', category: 'Jobs', submittedBy: 'Bob Martin', submittedOn: '3 hours ago', priority: 'medium' },
//                             { title: 'Construction Equipment Tender', category: 'Tender', submittedBy: 'Carol White', submittedOn: '5 hours ago', priority: 'high' },
//                             { title: 'Used Toyota Car', category: 'Cars', submittedBy: 'David Brown', submittedOn: '1 day ago', priority: 'low' }
//                           ].map((item, i) => (
//                             <TableRow key={i}>
//                               <TableCell padding="checkbox">
//                                 <input type="checkbox" />
//                               </TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {item.title}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Chip size="small" label={item.category} />
//                               </TableCell>
//                               <TableCell>{item.submittedBy}</TableCell>
//                               <TableCell>{item.submittedOn}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={item.priority} 
//                                   color={item.priority === 'high' ? 'error' : item.priority === 'medium' ? 'warning' : 'default'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                   <IconButton size="small" color="success">
//                                     <CheckCircle />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <CancelIcon />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               {/* Moderation Actions */}
//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('moderationActions')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Button variant="contained" color="primary" fullWidth>
//                         {t('approveSelected')}
//                       </Button>
//                       <Button variant="outlined" color="error" fullWidth>
//                         {t('rejectSelected')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('requestMoreInfo')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('escalateToAdmin')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={6}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('moderationStats')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('avgReviewTime')}</Typography>
//                         <Typography variant="h6" color="success.main">2.5 hours</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('accuracyRate')}</Typography>
//                         <Typography variant="h6" color="primary.main">94.2%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('falsePositiveRate')}</Typography>
//                         <Typography variant="h6" color="warning.main">3.8%</Typography>
//                       </Box>
//                       <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
//                         <Typography variant="body2">{t('escalationsToday')}</Typography>
//                         <Typography variant="h6" color="error.main">2</Typography>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 12: // Membership Plans
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('createNewPlan')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('planName')}
//                         placeholder={t('enterPlanName')}
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('planPrice')}
//                         placeholder="ETB 0"
//                         type="number"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('planDuration')}
//                         placeholder="30"
//                         type="number"
//                       />
//                       <TextField
//                         fullWidth
//                         multiline
//                         rows={4}
//                         label={t('planFeatures')}
//                         placeholder={t('enterFeatures')}
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('createPlan')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>

//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('existingPlans')}
//                     </Typography>
//                     <Grid container spacing={3}>
//                       {[
//                         {
//                           name: 'Basic',
//                           price: 'Free',
//                           duration: 'Forever',
//                           features: ['5 listings', 'Basic support'],
//                           users: 120
//                         },
//                         {
//                           name: 'Premium',
//                           price: 'ETB 500',
//                           duration: '30 days',
//                           features: ['50 listings', 'Priority support', 'Featured listings'],
//                           users: 45
//                         },
//                         {
//                           name: 'Business',
//                           price: 'ETB 2,000',
//                           duration: '30 days',
//                           features: ['Unlimited listings', 'Dedicated support', 'Analytics'],
//                           users: 12
//                         }
//                       ].map((plan, i) => (
//                         <Grid item xs={12} md={4} key={i}>
//                           <Card variant="outlined">
//                             <CardContent>
//                               <Typography variant="h6" fontWeight="bold">
//                                 {plan.name}
//                               </Typography>
//                               <Typography variant="h5" color="primary.main" gutterBottom>
//                                 {plan.price}
//                               </Typography>
//                               <Typography variant="body2" color="text.secondary" gutterBottom>
//                                 {plan.duration}
//                               </Typography>
//                               <Box sx={{ mb: 2 }}>
//                                 {plan.features.map((feature, j) => (
//                                   <Typography key={j} variant="caption" display="block">
//                                     • {feature}
//                                   </Typography>
//                                 ))}
//                               </Box>
//                               <Typography variant="caption" color="text.secondary">
//                                 {plan.users} {t('activeUsers')}
//                               </Typography>
//                               <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
//                                 <IconButton size="small">
//                                   <Edit />
//                                 </IconButton>
//                                 <IconButton size="small" color="error">
//                                   <Delete />
//                                 </IconButton>
//                               </Box>
//                             </CardContent>
//                           </Card>
//                         </Grid>
//                       ))}
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 13: // Audit Logs
//         return (
//           <Box>
//             <Card>
//               <CardContent>
//                 <Typography variant="h6" gutterBottom>
//                   {t('auditLogs')}
//                 </Typography>
//                 <TableContainer>
//                   <Table>
//                     <TableHead>
//                       <TableRow>
//                         <TableCell>{t('timestamp')}</TableCell>
//                         <TableCell>{t('admin')}</TableCell>
//                         <TableCell>{t('action')}</TableCell>
//                         <TableCell>{t('target')}</TableCell>
//                         <TableCell>{t('ipAddress')}</TableCell>
//                         <TableCell>{t('status')}</TableCell>
//                       </TableRow>
//                     </TableHead>
//                     <TableBody>
//                       {[
//                         { admin: 'Admin User', action: 'Approved listing', target: 'Listing #123', ip: '192.168.1.1', status: 'success' },
//                         { admin: 'Admin User', action: 'Deleted user', target: 'User #456', ip: '192.168.1.1', status: 'success' },
//                         { admin: 'Admin User', action: 'Failed login attempt', target: 'Admin Panel', ip: '192.168.1.2', status: 'failed' }
//                       ].map((log, i) => (
//                         <TableRow key={i}>
//                           <TableCell>2024-01-{15 + i} 10:{30 + i}:00</TableCell>
//                           <TableCell>{log.admin}</TableCell>
//                           <TableCell>{log.action}</TableCell>
//                           <TableCell>{log.target}</TableCell>
//                           <TableCell>{log.ip}</TableCell>
//                           <TableCell>
//                             <Chip 
//                               size="small" 
//                               label={log.status} 
//                               color={log.status === 'success' ? 'success' : 'error'}
//                             />
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

//       case 14: // Featured Listings
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('featuredListings')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('title')}</TableCell>
//                             <TableCell>{t('category')}</TableCell>
//                             <TableCell>{t('owner')}</TableCell>
//                             <TableCell>{t('featuredUntil')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, title: 'Luxury Apartment', category: 'Real Estate', owner: 'John Doe', featuredUntil: '2024-02-15', status: 'active' },
//                             { id: 2, title: 'iPhone 14 Pro', category: 'Electronics', owner: 'Jane Smith', featuredUntil: '2024-02-10', status: 'active' },
//                             { id: 3, title: 'Toyota Corolla', category: 'Vehicles', owner: 'Mike Johnson', featuredUntil: '2024-02-20', status: 'expired' }
//                           ].map((listing, i) => (
//                             <TableRow key={listing.id}>
//                               <TableCell>{listing.title}</TableCell>
//                               <TableCell><Chip size="small" label={listing.category} /></TableCell>
//                               <TableCell>{listing.owner}</TableCell>
//                               <TableCell>{listing.featuredUntil}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={listing.status} 
//                                   color={listing.status === 'active' ? 'success' : 'default'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('featureNewListing')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('listingId')}
//                         placeholder="Enter listing ID"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('duration')}
//                         type="number"
//                         placeholder="30 days"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('price')}
//                         type="number"
//                         placeholder="ETB 500"
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('featureListing')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 15: // Reviews Management
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('reviewsManagement')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('reviewer')}</TableCell>
//                             <TableCell>{t('listing')}</TableCell>
//                             <TableCell>{t('rating')}</TableCell>
//                             <TableCell>{t('comment')}</TableCell>
//                             <TableCell>{t('date')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, reviewer: 'Alice Brown', listing: 'Luxury Apartment', rating: 5, comment: 'Excellent property!', date: '2024-01-15', status: 'approved' },
//                             { id: 2, reviewer: 'Bob Wilson', listing: 'iPhone 14 Pro', rating: 2, comment: 'Not as described', date: '2024-01-14', status: 'pending' },
//                             { id: 3, reviewer: 'Carol Davis', listing: 'Toyota Corolla', rating: 4, comment: 'Good value', date: '2024-01-13', status: 'approved' }
//                           ].map((review, i) => (
//                             <TableRow key={review.id}>
//                               <TableCell>{review.reviewer}</TableCell>
//                               <TableCell>{review.listing}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
//                                   {[...Array(5)].map((_, j) => (
//                                     <Star key={j} sx={{ 
//                                       fontSize: 16, 
//                                       color: j < review.rating ? 'gold' : 'grey.300' 
//                                     }} />
//                                   ))}
//                                   <Typography variant="caption" sx={{ ml: 1 }}>
//                                     {review.rating}.0
//                                   </Typography>
//                                 </Box>
//                               </TableCell>
//                               <TableCell sx={{ maxWidth: 200 }}>{review.comment}</TableCell>
//                               <TableCell>{review.date}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={review.status} 
//                                   color={review.status === 'approved' ? 'success' : review.status === 'pending' ? 'warning' : 'error'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small" color="success">
//                                     <CheckCircle />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <CancelIcon />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('reviewStatistics')}
//                     </Typography>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('totalReviews')}: 156
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('averageRating')}: 4.2/5.0
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('pendingReviews')}: 8
//                       </Typography>
//                     </Box>
//                     <Button variant="outlined" fullWidth>
//                       {t('exportReviews')}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 13: // Reports & Analytics
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('reportsAnalytics')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('monthlyReport')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('totalRevenue')}: ETB 45,000
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('newUsers')}: 156
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('activeListings')}: 89
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('downloadPdf')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('categoryReport')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('realEstate')}: 45 listings
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('vehicles')}: 32 listings
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('electronics')}: 28 listings
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('viewDetails')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('generateReport')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <FormControl fullWidth>
//                         <InputLabel>{t('reportType')}</InputLabel>
//                         <Select label={t('reportType')}>
//                           <MenuItem value="monthly">{t('monthly')}</MenuItem>
//                           <MenuItem value="quarterly">{t('quarterly')}</MenuItem>
//                           <MenuItem value="yearly">{t('yearly')}</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <TextField
//                         fullWidth
//                         label={t('dateRange')}
//                         type="date"
//                         InputLabelProps={{ shrink: true }}
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('generateReport')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 14: // User Roles & Permissions
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('userRolesPermissions')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('role')}</TableCell>
//                             <TableCell>{t('description')}</TableCell>
//                             <TableCell>{t('users')}</TableCell>
//                             <TableCell>{t('permissions')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, role: 'Super Admin', description: 'Full system access', users: 2, permissions: 'All' },
//                             { id: 2, role: 'Admin', description: 'Manage listings and users', users: 5, permissions: 'Read, Write, Delete' },
//                             { id: 3, role: 'Moderator', description: 'Content moderation', users: 8, permissions: 'Read, Write' },
//                             { id: 4, role: 'Support', description: 'Customer support', users: 3, permissions: 'Read' }
//                           ].map((role, i) => (
//                             <TableRow key={role.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {role.role}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{role.description}</TableCell>
//                               <TableCell>{role.users}</TableCell>
//                               <TableCell>
//                                 <Typography variant="caption" color="text.secondary">
//                                   {role.permissions}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('createNewRole')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('roleName')}
//                         placeholder="Enter role name"
//                       />
//                       <TextField
//                         fullWidth
//                         multiline
//                         rows={3}
//                         label={t('description')}
//                         placeholder="Enter role description"
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('createRole')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 15: // Email Templates
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('emailTemplates')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('templateName')}</TableCell>
//                             <TableCell>{t('subject')}</TableCell>
//                             <TableCell>{t('lastModified')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, name: 'Welcome Email', subject: 'Welcome to YesraSew!', modified: '2024-01-10', status: 'active' },
//                             { id: 2, name: 'Listing Approved', subject: 'Your listing has been approved', modified: '2024-01-08', status: 'active' },
//                             { id: 3, name: 'Password Reset', subject: 'Reset your password', modified: '2024-01-05', status: 'draft' }
//                           ].map((template, i) => (
//                             <TableRow key={template.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {template.name}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{template.subject}</TableCell>
//                               <TableCell>{template.modified}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={template.status} 
//                                   color={template.status === 'active' ? 'success' : 'default'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('createTemplate')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('templateName')}
//                         placeholder="Enter template name"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('subject')}
//                         placeholder="Enter email subject"
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('createTemplate')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 16: // Backup & Recovery
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('backupRecovery')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('lastBackup')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('date')}: January 15, 2024
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('size')}: 2.3 GB
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('status')}: {t('completed')}
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('download')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('scheduledBackup')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('frequency')}: Daily
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('nextBackup')}: Tomorrow, 2:00 AM
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('retention')}: 30 days
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('configure')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('backupActions')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Button variant="contained" color="primary" fullWidth>
//                         {t('createBackup')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('restoreBackup')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('backupSettings')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 17: // Security Settings
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('securitySettings')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('passwordPolicy')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('minLength')}: 8 characters
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('requireUppercase')}: Yes
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('requireNumbers')}: Yes
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('requireSpecialChars')}: Yes
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('configure')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('twoFactorAuth')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('status')}: {t('enabled')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('method')}: SMS + Email
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('backupCodes')}: 10 available
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('manage')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('securityLogs')}
//                     </Typography>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('failedLogins')}: 3 (last 24h)
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('suspiciousActivity')}: 0
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('blockedIPs')}: 12
//                       </Typography>
//                     </Box>
//                     <Button variant="outlined" fullWidth>
//                       {t('viewLogs')}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 18: // API Management
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('apiManagement')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('apiKey')}</TableCell>
//                             <TableCell>{t('application')}</TableCell>
//                             <TableCell>{t('usage')}</TableCell>
//                             <TableCell>{t('lastUsed')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, key: 'api_key_***123', app: 'Mobile App', usage: '1,234 / 10,000', lastUsed: '2 hours ago', status: 'active' },
//                             { id: 2, key: 'api_key_***456', app: 'Web Client', usage: '5,678 / 10,000', lastUsed: '5 minutes ago', status: 'active' },
//                             { id: 3, key: 'api_key_***789', app: 'Third Party', usage: '9,876 / 10,000', lastUsed: '1 day ago', status: 'limited' }
//                           ].map((apiKey, i) => (
//                             <TableRow key={apiKey.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontFamily="monospace">
//                                   {apiKey.key}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{apiKey.app}</TableCell>
//                               <TableCell>
//                                 <Typography variant="body2" color="text.secondary">
//                                   {apiKey.usage}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{apiKey.lastUsed}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={apiKey.status} 
//                                   color={apiKey.status === 'active' ? 'success' : apiKey.status === 'limited' ? 'warning' : 'error'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Refresh />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('generateApiKey')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('applicationName')}
//                         placeholder="Enter application name"
//                       />
//                       <FormControl fullWidth>
//                         <InputLabel>{t('rateLimit')}</InputLabel>
//                         <Select label={t('rateLimit')}>
//                           <MenuItem value="1000">1,000 requests/hour</MenuItem>
//                           <MenuItem value="5000">5,000 requests/hour</MenuItem>
//                           <MenuItem value="10000">10,000 requests/hour</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <Button variant="contained" color="primary">
//                         {t('generateKey')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 19: // SEO & Marketing
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('seoMarketing')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('seoSettings')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('metaTitle')}: YesraSew - Ethiopian Marketplace
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('metaDescription')}: Buy and sell in Ethiopia
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('keywords')}: 25 keywords configured
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('editSeo')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('analyticsIntegration')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('googleAnalytics')}: Connected
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('searchConsole')}: Connected
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('facebookPixel')}: Connected
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('configure')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('marketingTools')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Button variant="contained" color="primary" fullWidth>
//                         {t('sitemapGenerator')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('robotsTxt')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('socialMedia')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 20: // Support & Helpdesk
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('supportHelpdesk')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('ticketId')}</TableCell>
//                             <TableCell>{t('subject')}</TableCell>
//                             <TableCell>{t('user')}</TableCell>
//                             <TableCell>{t('priority')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, ticketId: '#SUP001', subject: 'Cannot upload images', user: 'John Doe', priority: 'High', status: 'open' },
//                             { id: 2, ticketId: '#SUP002', subject: 'Payment issue', user: 'Jane Smith', priority: 'Medium', status: 'in-progress' },
//                             { id: 3, ticketId: '#SUP003', subject: 'Account verification', user: 'Mike Johnson', priority: 'Low', status: 'resolved' }
//                           ].map((ticket, i) => (
//                             <TableRow key={ticket.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {ticket.ticketId}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{ticket.subject}</TableCell>
//                               <TableCell>{ticket.user}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={ticket.priority} 
//                                   color={ticket.priority === 'High' ? 'error' : ticket.priority === 'Medium' ? 'warning' : 'success'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={ticket.status} 
//                                   color={ticket.status === 'open' ? 'error' : ticket.status === 'in-progress' ? 'warning' : 'success'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Visibility />
//                                   </IconButton>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('supportStats')}
//                     </Typography>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('openTickets')}: 12
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('avgResponseTime')}: 2.5 hours
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('satisfactionRate')}: 94%
//                       </Typography>
//                     </Box>
//                     <Button variant="outlined" fullWidth>
//                       {t('createTicket')}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 21: // Advanced Analytics
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('advancedAnalytics')}
//                     </Typography>
//                     <Grid container spacing={3}>
//                       <Grid item xs={12} md={3}>
//                         <Card variant="outlined">
//                           <CardContent sx={{ textAlign: 'center' }}>
//                             <TrendingUp sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
//                             <Typography variant="h5" fontWeight="bold">
//                               85.4%
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('conversionRate')}
//                             </Typography>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={3}>
//                         <Card variant="outlined">
//                           <CardContent sx={{ textAlign: 'center' }}>
//                             <People sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
//                             <Typography variant="h5" fontWeight="bold">
//                               12,543
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('activeUsers')}
//                             </Typography>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={3}>
//                         <Card variant="outlined">
//                           <CardContent sx={{ textAlign: 'center' }}>
//                             <Payments sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
//                             <Typography variant="h5" fontWeight="bold">
//                               ETB 234K
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('monthlyRevenue')}
//                             </Typography>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={3}>
//                         <Card variant="outlined">
//                           <CardContent sx={{ textAlign: 'center' }}>
//                             <Assignment sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
//                             <Typography variant="h5" fontWeight="bold">
//                               8,921
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('totalListings')}
//                             </Typography>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('userBehaviorAnalytics')}
//                     </Typography>
//                     <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
//                       {t('userEngagementMetrics')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Box>
//                         <Typography variant="body2" gutterBottom>
//                           {t('pageViews')}: 45,234 ({t('up')} 12%)
//                         </Typography>
//                         <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
//                           <Box sx={{ width: '75%', bgcolor: 'primary.main', height: 8, borderRadius: 1 }} />
//                         </Box>
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" gutterBottom>
//                           {t('avgSessionDuration')}: 4m 32s ({t('up')} 8%)
//                         </Typography>
//                         <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
//                           <Box sx={{ width: '68%', bgcolor: 'success.main', height: 8, borderRadius: 1 }} />
//                         </Box>
//                       </Box>
//                       <Box>
//                         <Typography variant="body2" gutterBottom>
//                           {t('bounceRate')}: 32% ({t('down')} 5%)
//                         </Typography>
//                         <Box sx={{ width: '100%', bgcolor: 'grey.200', borderRadius: 1, height: 8 }}>
//                           <Box sx={{ width: '32%', bgcolor: 'warning.main', height: 8, borderRadius: 1 }} />
//                         </Box>
//                       </Box>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('reportingTools')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <Button variant="contained" color="primary" fullWidth>
//                         {t('generateReport')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('exportData')}
//                       </Button>
//                       <Button variant="outlined" fullWidth>
//                         {t('scheduleReports')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 22: // Multi-Tenancy
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('multiTenancy')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('tenant')}</TableCell>
//                             <TableCell>{t('domain')}</TableCell>
//                             <TableCell>{t('users')}</TableCell>
//                             <TableCell>{t('listings')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, tenant: 'YesraSew Main', domain: 'yesrasew.com', users: 15420, listings: 8921, status: 'active' },
//                             { id: 2, tenant: 'EthioMarket', domain: 'ethiomarket.yesrasew.com', users: 3240, listings: 1823, status: 'active' },
//                             { id: 3, tenant: 'Addis Classifieds', domain: 'addis.yesrasew.com', users: 1890, listings: 945, status: 'suspended' }
//                           ].map((tenant, i) => (
//                             <TableRow key={tenant.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {tenant.tenant}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{tenant.domain}</TableCell>
//                               <TableCell>{tenant.users.toLocaleString()}</TableCell>
//                               <TableCell>{tenant.listings.toLocaleString()}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={tenant.status} 
//                                   color={tenant.status === 'active' ? 'success' : 'error'}
//                                 />
//                               </TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <Settings />
//                                   </IconButton>
//                                   <IconButton size="small" color="error">
//                                     <Delete />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('createTenant')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('tenantName')}
//                         placeholder="Enter tenant name"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('subdomain')}
//                         placeholder="Enter subdomain"
//                       />
//                       <TextField
//                         fullWidth
//                         label={t('adminEmail')}
//                         type="email"
//                         placeholder="Enter admin email"
//                       />
//                       <Button variant="contained" color="primary">
//                         {t('createTenant')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 23: // Automation & Workflow
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('automationWorkflow')}
//                     </Typography>
//                     <TableContainer>
//                       <Table>
//                         <TableHead>
//                           <TableRow>
//                             <TableCell>{t('workflow')}</TableCell>
//                             <TableCell>{t('trigger')}</TableCell>
//                             <TableCell>{t('action')}</TableCell>
//                             <TableCell>{t('status')}</TableCell>
//                             <TableCell>{t('lastRun')}</TableCell>
//                             <TableCell>{t('actions')}</TableCell>
//                           </TableRow>
//                         </TableHead>
//                         <TableBody>
//                           {[
//                             { id: 1, workflow: 'New Listing Approval', trigger: 'Listing created', action: 'Send notification', status: 'active', lastRun: '2 hours ago' },
//                             { id: 2, workflow: 'User Welcome Email', trigger: 'User registration', action: 'Send welcome email', status: 'active', lastRun: '15 minutes ago' },
//                             { id: 3, workflow: 'Expired Listings', trigger: 'Daily check', action: 'Archive expired listings', status: 'paused', lastRun: '1 day ago' }
//                           ].map((workflow, i) => (
//                             <TableRow key={workflow.id}>
//                               <TableCell>
//                                 <Typography variant="body2" fontWeight="medium">
//                                   {workflow.workflow}
//                                 </Typography>
//                               </TableCell>
//                               <TableCell>{workflow.trigger}</TableCell>
//                               <TableCell>{workflow.action}</TableCell>
//                               <TableCell>
//                                 <Chip 
//                                   size="small" 
//                                   label={workflow.status} 
//                                   color={workflow.status === 'active' ? 'success' : workflow.status === 'paused' ? 'warning' : 'error'}
//                                 />
//                               </TableCell>
//                               <TableCell>{workflow.lastRun}</TableCell>
//                               <TableCell>
//                                 <Box sx={{ display: 'flex', gap: 1 }}>
//                                   <IconButton size="small">
//                                     <PlayArrow />
//                                   </IconButton>
//                                   <IconButton size="small">
//                                     <Edit />
//                                   </IconButton>
//                                 </Box>
//                               </TableCell>
//                             </TableRow>
//                           ))}
//                         </TableBody>
//                       </Table>
//                     </TableContainer>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('createWorkflow')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <TextField
//                         fullWidth
//                         label={t('workflowName')}
//                         placeholder="Enter workflow name"
//                       />
//                       <FormControl fullWidth>
//                         <InputLabel>{t('triggerEvent')}</InputLabel>
//                         <Select label={t('triggerEvent')}>
//                           <MenuItem value="listing_created">Listing Created</MenuItem>
//                           <MenuItem value="user_registered">User Registered</MenuItem>
//                           <MenuItem value="payment_received">Payment Received</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <FormControl fullWidth>
//                         <InputLabel>{t('actionType')}</InputLabel>
//                         <Select label={t('actionType')}>
//                           <MenuItem value="send_email">Send Email</MenuItem>
//                           <MenuItem value="update_status">Update Status</MenuItem>
//                           <MenuItem value="create_task">Create Task</MenuItem>
//                         </Select>
//                       </FormControl>
//                       <Button variant="contained" color="primary">
//                         {t('createWorkflow')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 23: // Mobile App Management
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('mobileAppManagement')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('appVersions')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('currentVersion')}: 2.1.0
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('playStore')}: Published
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('appStore')}: Under Review
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('releaseNewVersion')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('appStatistics')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('totalDownloads')}: 45,234
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('activeUsers')}: 12,543
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('avgRating')}: 4.5/5.0
//                             </Typography>
//                             <Button variant="outlined" size="small" sx={{ mt: 1 }}>
//                               {t('viewAnalytics')}
//                             </Button>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('appSettings')}
//                     </Typography>
//                     <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('pushNotifications')}
//                       />
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('locationServices')}
//                       />
//                       <FormControlLabel
//                         control={<Switch />}
//                         label={t('biometricAuth')}
//                       />
//                       <FormControlLabel
//                         control={<Switch defaultChecked />}
//                         label={t('offlineMode')}
//                       />
//                       <Button variant="contained" color="primary" fullWidth>
//                         {t('updateSettings')}
//                       </Button>
//                     </Box>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       case 24: // Legal Compliance
//         return (
//           <Box>
//             <Grid container spacing={3}>
//               <Grid item xs={12} md={8}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('legalCompliance')}
//                     </Typography>
//                     <Grid container spacing={2}>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('privacyPolicy')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('lastUpdated')}: January 15, 2024
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('version')}: 2.0
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('status')}: {t('active')}
//                             </Typography>
//                             <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//                               <Button variant="outlined" size="small">
//                                 {t('view')}
//                               </Button>
//                               <Button variant="outlined" size="small">
//                                 {t('edit')}
//                               </Button>
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                       <Grid item xs={12} md={6}>
//                         <Card variant="outlined">
//                           <CardContent>
//                             <Typography variant="h6" gutterBottom>
//                               {t('termsOfService')}
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('lastUpdated')}: January 10, 2024
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('version')}: 3.1
//                             </Typography>
//                             <Typography variant="body2" color="text.secondary">
//                               {t('status')}: {t('active')}
//                             </Typography>
//                             <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
//                               <Button variant="outlined" size="small">
//                                 {t('view')}
//                               </Button>
//                               <Button variant="outlined" size="small">
//                                 {t('edit')}
//                               </Button>
//                             </Box>
//                           </CardContent>
//                         </Card>
//                       </Grid>
//                     </Grid>
//                   </CardContent>
//                 </Card>
//               </Grid>
//               <Grid item xs={12} md={4}>
//                 <Card>
//                   <CardContent>
//                     <Typography variant="h6" gutterBottom>
//                       {t('complianceStatus')}
//                     </Typography>
//                     <Box sx={{ mb: 2 }}>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('gdprCompliant')}: ✅ {t('yes')}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('ccpaCompliant')}: ✅ {t('yes')}
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('dataRetention')}: 30 days
//                       </Typography>
//                       <Typography variant="body2" color="text.secondary">
//                         {t('cookiePolicy')}: ✅ {t('active')}
//                       </Typography>
//                     </Box>
//                     <Button variant="outlined" fullWidth>
//                       {t('generateComplianceReport')}
//                     </Button>
//                   </CardContent>
//                 </Card>
//               </Grid>
//             </Grid>
//           </Box>
//         );

//       default:
//         return <Typography variant="h6">{t('comingSoon')}</Typography>;
//     }
//   }, [activeTab, t, showBackendWarning, stats, listings, users, filteredListings, filteredUsers, searchTerm, filterStatus, selectedItems, navigate, handleSelectItem, handleSelectAll, handleListingAction, getStatusColor, getStatusIcon, useMockData, setUseMockData, handleRefresh, refreshing]);

//   if (loading) {
//     return (
//       <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
//         <CircularProgress />
//       </Box>
//     );
//   }

//   return (
//     <Box sx={{ display: 'flex', bgcolor: 'background.default', minHeight: '100vh' }}>
//       {/* Drawer */}
//       {renderDrawer()}

//       {/* Main Content */}
//       <Box sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column' }}>
//         {/* Header */}
//         <AppBar 
//           position="static" 
//           elevation={1}
//           sx={{ 
//             bgcolor: 'background.paper',
//             color: 'text.primary',
//             borderBottom: '1px solid rgba(0, 0, 0, 0.12)'
//           }}
//         >
//           <Toolbar>
//             <IconButton
//               edge="start"
//               color="inherit"
//               onClick={toggleDrawer}
//               sx={{ mr: 2 }}
//             >
//               <Menu />
//             </IconButton>
//             <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
//               {menuItems.find(item => item.id === activeTab)?.label || t('dashboard')}
//               {useMockData && (
//                 <Chip 
//                   size="small" 
//                   label="Mock Data" 
//                   color="secondary" 
//                   sx={{ ml: 2 }} 
//                 />
//               )}
//             </Typography>
//             <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
//               <Button
//                 variant="outlined"
//                 startIcon={<Refresh />}
//                 onClick={handleRefresh}
//                 disabled={refreshing}
//                 size="small"
//               >
//                 {t('refresh')}
//               </Button>
//               <IconButton color="inherit">
//                 <Avatar sx={{ width: 32, height: 32, bgcolor: 'primary.main' }}>
//                   A
//                 </Avatar>
//               </IconButton>
//             </Box>
//           </Toolbar>
//         </AppBar>

//         {/* Page Content */}
//         <Container maxWidth="xl" sx={{ flex: 1, py: 3 }}>
//           {tabContent}
//         </Container>

//         {/* Bulk Action Dialog */}
//         <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)}>
//           <DialogTitle>{t('bulkAction')}</DialogTitle>
//           <DialogContent>
//             <Typography>
//               {t('performActionOnItems', { count: selectedItems.length })}
//             </Typography>
//           </DialogContent>
//           <DialogActions>
//             <Button onClick={() => setDialogOpen(false)}>{t('cancel')}</Button>
//             <Button onClick={() => handleBulkAction('approve')} color="success">
//               {t('approve')}
//             </Button>
//             <Button onClick={() => handleBulkAction('reject')} color="error">
//               {t('reject')}
//             </Button>
//           </DialogActions>
//         </Dialog>
//       </Box>
//     </Box>
//   );
// };

// export default AdminDashboard;

