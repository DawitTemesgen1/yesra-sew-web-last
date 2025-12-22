import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Button, Avatar, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Paper, Tabs, Tab,
  TextField, Select, MenuItem, FormControl, InputLabel,
  Dialog, DialogTitle, DialogContent, DialogActions,
  LinearProgress, Alert, IconButton, Tooltip, Badge,
  Switch, FormControlLabel, Accordion, AccordionSummary,
  AccordionDetails, List, ListItem, ListItemText,
  ListItemIcon, Divider, Stack, Skeleton,
  useTheme, alpha, CircularProgress, Container
} from '@mui/material';
import {
  Dashboard as DashboardIcon, People, Assignment, Settings,
  Payment, Email, CheckCircle, Cancel, AccessTime, Visibility, Edit,
  Delete, Search, Filter, TrendingUp, TrendingDown,
  AttachMoney, ShoppingCart, Message, Notifications,
  Security, Storage, Speed, Analytics, Report,
  Download, Upload, Refresh, Block, VerifiedUser,
  Business, Person, Category, LocalOffer, Star,
  Warning, Info, ExpandMore, Send, Block as BlockIcon,
  AdminPanelSettings, DynamicForm, Group, FolderCopy,
  Campaign, AppSettingsAlt, SecurityRounded, Save,
  CardMembership, CardMembership as SubscriptionIcon, Share as ShareIcon
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';

// Import new components
import AdminManagement from '../components/AdminManagement';
import CompanyManagement from '../components/CompanyManagement';
import TemplateManagement from '../components/TemplateManagement';
import MembershipSubscription from '../components/MembershipSubscription';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoApprove, setAutoApprove] = useState(false);

  // Enhanced mock data
  const [stats] = useState({
    totalListings: 1234,
    pendingReview: 45,
    approvedListings: 890,
    rejectedListings: 67,
    totalUsers: 8912,
    activeUsers: 2341,
    revenue: 125600,
    todayRevenue: 12500,
    monthlyGrowth: 12.5,
    conversionRate: 3.2,
    avgResponseTime: 2.4,
    serverUptime: 99.9,
    storageUsed: 67.8,
    bandwidthUsed: 45.2
  });

  const [listings] = useState([
    { id: 1, title: 'Toyota V8 2022', category: 'Cars', user: 'John Doe', email: 'john@email.com', status: 'pending', price: 2500000, views: 234, likes: 45, shares: 12, featured: false, verified: false, date: '2024-01-15', location: 'Addis Ababa' },
    { id: 2, title: '3 Bedroom Apartment', category: 'Homes', user: 'Jane Smith', email: 'jane@email.com', status: 'pending', price: 15000, views: 156, likes: 23, shares: 8, featured: true, verified: true, date: '2024-01-14', location: 'Bole' },
    { id: 3, title: 'Software Developer', category: 'Jobs', user: 'Tech Corp', email: 'hr@techcorp.com', status: 'approved', price: 25000, views: 89, likes: 67, shares: 5, featured: false, verified: true, date: '2024-01-13', location: 'Kazanchis' },
    { id: 4, title: 'iPhone 13 Pro', category: 'Electronics', user: 'Mike Wilson', email: 'mike@email.com', status: 'rejected', price: 45000, views: 345, likes: 12, shares: 3, featured: false, verified: false, date: '2024-01-12', location: 'Mekelle' },
    { id: 5, title: 'Office Space for Rent', category: 'Commercial', user: 'Real Estate Co', email: 'info@realestate.com', status: 'pending', price: 5000, views: 67, likes: 8, shares: 2, featured: false, verified: false, date: '2024-01-11', location: 'Hawassa' }
  ]);

  const [users] = useState([
    { id: 1, name: 'John Doe', email: 'john@email.com', type: 'individual', status: 'active', listings: 5, joined: '2024-01-01', lastActive: '2024-01-15', verified: true, premium: false, rating: 4.5 },
    { id: 2, name: 'Jane Smith', email: 'jane@email.com', type: 'business', status: 'active', listings: 12, joined: '2024-01-02', lastActive: '2024-01-14', verified: true, premium: true, rating: 4.8 },
    { id: 3, name: 'Tech Corp', email: 'hr@techcorp.com', type: 'business', status: 'verified', listings: 8, joined: '2024-01-03', lastActive: '2024-01-13', verified: true, premium: true, rating: 4.9 },
    { id: 4, name: 'Spam User', email: 'spam@bad.com', type: 'individual', status: 'suspended', listings: 0, joined: '2024-01-10', lastActive: '2024-01-10', verified: false, premium: false, rating: 1.0 }
  ]);

  const [transactions] = useState([
    { id: 1, user: 'John Doe', amount: 2500, type: 'listing_fee', status: 'completed', date: '2024-01-15', method: 'telebirr' },
    { id: 2, user: 'Jane Smith', amount: 150, type: 'premium', status: 'completed', date: '2024-01-14', method: 'chappa' },
    { id: 3, user: 'Tech Corp', amount: 5000, type: 'featured', status: 'pending', date: '2024-01-13', method: 'bank' },
    { id: 4, user: 'Mike Wilson', amount: 100, type: 'verification', status: 'completed', date: '2024-01-12', method: 'telebirr' }
  ]);

  const [reports] = useState([
    { id: 1, type: 'spam', listing: 'Fake iPhone', reporter: 'User123', status: 'pending', date: '2024-01-15' },
    { id: 2, type: 'inappropriate', listing: 'Bad Content', reporter: 'User456', status: 'resolved', date: '2024-01-14' },
    { id: 3, type: 'fraud', listing: 'Scam Listing', reporter: 'User789', status: 'investigating', date: '2024-01-13' }
  ]);

  const getStatusColor = (status) => {
    const colors = {
      pending: 'warning',
      approved: 'success',
      rejected: 'error',
      active: 'success',
      inactive: 'default',
      verified: 'info',
      suspended: 'error',
      completed: 'success',
      investigating: 'warning',
      resolved: 'success'
    };
    return colors[status] || 'default';
  };

  const getStatusColorForAvatar = (status) => {
    const color = getStatusColor(status);
    return color === 'default' ? 'action.disabledBackground' : `${color}.main`;
  };

  const getStatusIcon = (status) => {
    const icons = {
      pending: <AccessTime />,
      approved: <CheckCircle />,
      rejected: <Cancel />,
      active: <CheckCircle />,
      inactive: <AccessTime />,
      verified: <VerifiedUser />,
      suspended: <BlockIcon />,
      completed: <CheckCircle />,
      investigating: <Warning />,
      resolved: <Info />
    };
    return icons[status] || <AccessTime />;
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleBulkAction = (action) => {
    setSelectedItems([]);
    setDialogOpen(false);
  };

  const filteredListings = listings.filter(listing => {
    const matchesSearch = listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || listing.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const tabContent = () => {
    switch (activeTab) {
      case 0: // Dashboard
        return (
          <Box>
            {/* Enhanced Stats Cards */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'primary.main', mx: 'auto', mb: 2 }}>
                      <Assignment />
                    </Avatar>
                    <Typography variant="h4">{stats.totalListings}</Typography>
                    <Typography color="text.secondary">Total Listings</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>+12% this month</Typography>
                    </Box>
                  </CardContent>
                  <LinearProgress variant="determinate" value={67} sx={{ height: 3 }} />
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'warning.main', mx: 'auto', mb: 2 }}>
                      <AccessTime />
                    </Avatar>
                    <Typography variant="h4">{stats.pendingReview}</Typography>
                    <Typography color="text.secondary">Pending Review</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'warning.main' }}>
                      <TrendingDown fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>-5% this week</Typography>
                    </Box>
                  </CardContent>
                  <LinearProgress variant="determinate" value={45} sx={{ height: 3, bgcolor: 'warning.main' }} />
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'success.main', mx: 'auto', mb: 2 }}>
                      <People />
                    </Avatar>
                    <Typography variant="h4">{stats.totalUsers}</Typography>
                    <Typography color="text.secondary">Total Users</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>+18% this month</Typography>
                    </Box>
                  </CardContent>
                  <LinearProgress variant="determinate" value={82} sx={{ height: 3, bgcolor: 'success.main' }} />
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card sx={{ position: 'relative', overflow: 'hidden' }}>
                  <CardContent sx={{ textAlign: 'center' }}>
                    <Avatar sx={{ bgcolor: 'info.main', mx: 'auto', mb: 2 }}>
                      <Payment />
                    </Avatar>
                    <Typography variant="h4">ETB {stats.revenue.toLocaleString()}</Typography>
                    <Typography color="text.secondary">Revenue</Typography>
                    <Box sx={{ mt: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'success.main' }}>
                      <TrendingUp fontSize="small" />
                      <Typography variant="caption" sx={{ ml: 0.5 }}>+25% this month</Typography>
                    </Box>
                  </CardContent>
                  <LinearProgress variant="determinate" value={91} sx={{ height: 3, bgcolor: 'info.main' }} />
                </Card>
              </Grid>
            </Grid>

            {/* System Health */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Health</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Speed sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                          <Typography variant="h6">{stats.serverUptime}%</Typography>
                          <Typography variant="caption" color="text.secondary">Server Uptime</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Storage sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                          <Typography variant="h6">{stats.storageUsed}%</Typography>
                          <Typography variant="caption" color="text.secondary">Storage Used</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Performance Metrics</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <TrendingUp sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                          <Typography variant="h6">{stats.conversionRate}%</Typography>
                          <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
                        </Box>
                      </Grid>
                      <Grid item xs={6}>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                          <Message sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                          <Typography variant="h6">{stats.avgResponseTime}h</Typography>
                          <Typography variant="caption" color="text.secondary">Avg Response</Typography>
                        </Box>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>

            {/* Recent Activity & Quick Actions */}
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Recent Activity</Typography>
                    <List>
                      {listings.slice(0, 4).map(listing => (
                        <React.Fragment key={listing.id}>
                          <ListItem>
                            <ListItemIcon>
                              <Avatar sx={{ bgcolor: getStatusColorForAvatar(listing.status) }}>
                                {getStatusIcon(listing.status)}
                              </Avatar>
                            </ListItemIcon>
                            <ListItemText
                              primary={`${listing.title} - ${listing.user}`}
                              secondary={`${listing.category} • ${listing.date}`}
                            />
                            <Chip size="small" label={listing.status} color={getStatusColor(listing.status)} />
                          </ListItem>
                          <Divider variant="inset" component="li" />
                        </React.Fragment>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>Quick Actions</Typography>
                    <Stack spacing={2}>
                      <Button variant="contained" startIcon={<Refresh />} fullWidth>
                        Refresh Data
                      </Button>
                      <Button variant="outlined" startIcon={<Download />} fullWidth>
                        Export Report
                      </Button>
                      <Button variant="outlined" startIcon={<Notifications />} fullWidth>
                        Send Notification
                      </Button>
                      <Button variant="outlined" startIcon={<Security />} fullWidth>
                        Security Check
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      case 1: // Listings
        return (
          <Box>
            {/* Enhanced Search and Filter */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search listings..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <Search /> }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                  >
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="pending">Pending</MenuItem>
                    <MenuItem value="approved">Approved</MenuItem>
                    <MenuItem value="rejected">Rejected</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Category</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Categories</MenuItem>
                    <MenuItem value="cars">Cars</MenuItem>
                    <MenuItem value="homes">Homes</MenuItem>
                    <MenuItem value="jobs">Jobs</MenuItem>
                    <MenuItem value="electronics">Electronics</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button
                  variant="contained"
                  fullWidth
                  disabled={selectedItems.length === 0}
                  onClick={() => setDialogOpen(true)}
                  sx={{ height: '56px' }}
                >
                  Bulk Action ({selectedItems.length})
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="outlined" fullWidth startIcon={<Refresh />} sx={{ height: '56px' }}>
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Listings Table */}
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell padding="checkbox">
                          <input
                            type="checkbox"
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedItems(filteredListings.map(l => l.id));
                              } else {
                                setSelectedItems([]);
                              }
                            }}
                          />
                        </TableCell>
                        <TableCell>Listing</TableCell>
                        <TableCell>Category</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Price</TableCell>
                        <TableCell>Engagement</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {filteredListings.map(listing => (
                        <TableRow key={listing.id}>
                          <TableCell padding="checkbox">
                            <input
                              type="checkbox"
                              checked={selectedItems.includes(listing.id)}
                              onChange={() => handleSelectItem(listing.id)}
                            />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2" fontWeight="medium">
                                {listing.title}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {listing.location} • {listing.date}
                              </Typography>
                              <Box sx={{ mt: 1 }}>
                                {listing.featured && <Chip size="small" label="Featured" color="primary" sx={{ mr: 1 }} />}
                                {listing.verified && <Chip size="small" label="Verified" color="success" />}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={listing.category} />
                          </TableCell>
                          <TableCell>
                            <Box>
                              <Typography variant="body2">{listing.user}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {listing.email}
                              </Typography>
                            </Box>
                          </TableCell>
                          <TableCell>ETB {listing.price.toLocaleString()}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Visibility fontSize="small" />
                                <Typography variant="caption">{listing.views}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Star fontSize="small" />
                                <Typography variant="caption">{listing.likes}</Typography>
                              </Box>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <ShareIcon fontSize="small" />
                                <Typography variant="caption">{listing.shares}</Typography>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={listing.status}
                              color={getStatusColor(listing.status)}
                              icon={getStatusIcon(listing.status)}
                            />
                          </TableCell>
                          <TableCell>
                            <Tooltip title="View">
                              <IconButton size="small"><Visibility /></IconButton>
                            </Tooltip>
                            <Tooltip title="Edit">
                              <IconButton size="small"><Edit /></IconButton>
                            </Tooltip>
                            <Tooltip title="Feature">
                              <IconButton size="small" color="primary"><Star /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete">
                              <IconButton size="small" color="error"><Delete /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case 2: // Users
        return (
          <Box>
            {/* User Search and Filter */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={4}>
                <TextField
                  fullWidth
                  placeholder="Search users..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  InputProps={{ startAdornment: <Search /> }}
                />
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Type</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Types</MenuItem>
                    <MenuItem value="individual">Individual</MenuItem>
                    <MenuItem value="business">Business</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <FormControl fullWidth>
                  <InputLabel>Status</InputLabel>
                  <Select defaultValue="all">
                    <MenuItem value="all">All Status</MenuItem>
                    <MenuItem value="active">Active</MenuItem>
                    <MenuItem value="suspended">Suspended</MenuItem>
                    <MenuItem value="verified">Verified</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="contained" fullWidth startIcon={<Download />}>
                  Export Users
                </Button>
              </Grid>
              <Grid item xs={12} md={2}>
                <Button variant="outlined" fullWidth startIcon={<Refresh />}>
                  Refresh
                </Button>
              </Grid>
            </Grid>

            {/* Users Table */}
            <Card>
              <CardContent>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>User</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Listings</TableCell>
                        <TableCell>Rating</TableCell>
                        <TableCell>Joined</TableCell>
                        <TableCell>Last Active</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {users.map(user => (
                        <TableRow key={user.id}>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                                {user.type === 'business' ? <Business /> : <Person />}
                              </Avatar>
                              <Box>
                                <Typography variant="body2" fontWeight="medium">
                                  {user.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary">
                                  {user.email}
                                </Typography>
                                <Box sx={{ mt: 0.5 }}>
                                  {user.verified && <Chip size="small" label="Verified" color="success" sx={{ mr: 1 }} />}
                                  {user.premium && <Chip size="small" label="Premium" color="primary" />}
                                </Box>
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={user.type} color={user.type === 'business' ? 'primary' : 'default'} />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={user.status}
                              color={getStatusColor(user.status)}
                              icon={getStatusIcon(user.status)}
                            />
                          </TableCell>
                          <TableCell>{user.listings}</TableCell>
                          <TableCell>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                              <Typography variant="body2">{user.rating}</Typography>
                            </Box>
                          </TableCell>
                          <TableCell>{user.joined}</TableCell>
                          <TableCell>{user.lastActive}</TableCell>
                          <TableCell>
                            <Tooltip title="View Profile">
                              <IconButton size="small"><Visibility /></IconButton>
                            </Tooltip>
                            <Tooltip title="Edit User">
                              <IconButton size="small"><Edit /></IconButton>
                            </Tooltip>
                            <Tooltip title="Suspend">
                              <IconButton size="small" color="error"><Block /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case 3: // Companies
        return <CompanyManagement />;

      case 4: // Membership & Subscriptions
        return <MembershipSubscription />;

      case 6: // Reports
        return (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2, bgcolor: 'warning.light' }}>
                  <Warning sx={{ fontSize: 32, color: 'warning.dark', mb: 1 }} />
                  <Typography variant="h5">{reports.filter(r => r.status === 'pending').length}</Typography>
                  <Typography variant="caption">Pending Reports</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2, bgcolor: 'info.light' }}>
                  <Analytics sx={{ fontSize: 32, color: 'info.dark', mb: 1 }} />
                  <Typography variant="h5">{reports.filter(r => r.status === 'investigating').length}</Typography>
                  <Typography variant="caption">Under Investigation</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2, bgcolor: 'success.light' }}>
                  <CheckCircle sx={{ fontSize: 32, color: 'success.dark', mb: 1 }} />
                  <Typography variant="h5">{reports.filter(r => r.status === 'resolved').length}</Typography>
                  <Typography variant="caption">Resolved</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2, bgcolor: 'error.light' }}>
                  <Report sx={{ fontSize: 32, color: 'error.dark', mb: 1 }} />
                  <Typography variant="h5">{reports.length}</Typography>
                  <Typography variant="caption">Total Reports</Typography>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Content Reports</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Report ID</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Listing</TableCell>
                        <TableCell>Reporter</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {reports.map(report => (
                        <TableRow key={report.id}>
                          <TableCell>#{report.id.toString().padStart(6, '0')}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={report.type}
                              color={report.type === 'spam' ? 'warning' : report.type === 'fraud' ? 'error' : 'default'}
                            />
                          </TableCell>
                          <TableCell>{report.listing}</TableCell>
                          <TableCell>{report.reporter}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={report.status}
                              color={getStatusColor(report.status)}
                              icon={getStatusIcon(report.status)}
                            />
                          </TableCell>
                          <TableCell>{report.date}</TableCell>
                          <TableCell>
                            <Tooltip title="Investigate">
                              <IconButton size="small"><Search /></IconButton>
                            </Tooltip>
                            <Tooltip title="Resolve">
                              <IconButton size="small" color="success"><CheckCircle /></IconButton>
                            </Tooltip>
                            <Tooltip title="Delete Content">
                              <IconButton size="small" color="error"><Delete /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case 5: // Transactions
        return (
          <Box>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <AttachMoney sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
                  <Typography variant="h5">ETB {stats.todayRevenue.toLocaleString()}</Typography>
                  <Typography variant="caption" color="text.secondary">Today's Revenue</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <TrendingUp sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
                  <Typography variant="h5">{stats.monthlyGrowth}%</Typography>
                  <Typography variant="caption" color="text.secondary">Monthly Growth</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <ShoppingCart sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
                  <Typography variant="h5">{transactions.length}</Typography>
                  <Typography variant="caption" color="text.secondary">Total Transactions</Typography>
                </Card>
              </Grid>
              <Grid item xs={12} md={3}>
                <Card sx={{ textAlign: 'center', py: 2 }}>
                  <Payment sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
                  <Typography variant="h5">ETB {(stats.revenue / 30).toFixed(0)}</Typography>
                  <Typography variant="caption" color="text.secondary">Daily Average</Typography>
                </Card>
              </Grid>
            </Grid>

            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>Recent Transactions</Typography>
                <TableContainer>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Transaction ID</TableCell>
                        <TableCell>User</TableCell>
                        <TableCell>Amount</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Method</TableCell>
                        <TableCell>Status</TableCell>
                        <TableCell>Date</TableCell>
                        <TableCell>Actions</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {transactions.map(transaction => (
                        <TableRow key={transaction.id}>
                          <TableCell>#{transaction.id.toString().padStart(6, '0')}</TableCell>
                          <TableCell>{transaction.user}</TableCell>
                          <TableCell>ETB {transaction.amount.toLocaleString()}</TableCell>
                          <TableCell>
                            <Chip size="small" label={transaction.type.replace('_', ' ')} />
                          </TableCell>
                          <TableCell>
                            <Chip size="small" label={transaction.method} variant="outlined" />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={transaction.status}
                              color={getStatusColor(transaction.status)}
                              icon={getStatusIcon(transaction.status)}
                            />
                          </TableCell>
                          <TableCell>{transaction.date}</TableCell>
                          <TableCell>
                            <Tooltip title="View Details">
                              <IconButton size="small"><Visibility /></IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Box>
        );

      case 7: // Templates
        return <TemplateManagement />;

      case 8: // Admin Management
        return <AdminManagement />;

      case 9: // Settings
        return (
          <Box>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>General Settings</Typography>
                    <Stack spacing={3}>
                      <FormControlLabel
                        control={<Switch checked={notifications} onChange={(e) => setNotifications(e.target.checked)} />}
                        label="Enable Email Notifications"
                      />
                      <FormControlLabel
                        control={<Switch checked={autoApprove} onChange={(e) => setAutoApprove(e.target.checked)} />}
                        label="Auto-approve Verified Users"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable User Registration"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Require Email Verification"
                      />
                      <FormControlLabel
                        control={<Switch defaultChecked />}
                        label="Enable Featured Listings"
                      />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={6}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Configuration</Typography>
                    <Stack spacing={3}>
                      <TextField
                        fullWidth
                        label="Site Name"
                        defaultValue="Yesra Sew"
                      />
                      <TextField
                        fullWidth
                        label="Admin Email"
                        defaultValue="admin@yesrasew.com"
                      />
                      <TextField
                        fullWidth
                        label="Max Listings per User"
                        type="number"
                        defaultValue="10"
                      />
                      <TextField
                        fullWidth
                        label="Featured Listing Price (ETB)"
                        type="number"
                        defaultValue="500"
                      />
                      <Button variant="contained" startIcon={<Save />}>
                        Save Settings
                      </Button>
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>System Maintenance</Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} md={3}>
                        <Button variant="outlined" fullWidth startIcon={<Refresh />}>
                          Clear Cache
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button variant="outlined" fullWidth startIcon={<Download />}>
                          Backup Database
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button variant="outlined" fullWidth startIcon={<Upload />}>
                          Restore Database
                        </Button>
                      </Grid>
                      <Grid item xs={12} md={3}>
                        <Button variant="outlined" color="error" fullWidth startIcon={<Delete />}>
                          Clean Old Data
                        </Button>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </Box>
        );

      default:
        return <Typography>Tab content coming soon...</Typography>;
    }
  };

  return (
    <Box sx={{ bgcolor: 'background.default', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 3, mb: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box>
              <Typography variant="h4" fontWeight="bold">
                Admin Panel
              </Typography>
              <Typography variant="body1" sx={{ opacity: 0.9 }}>
                Complete marketplace management system
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Badge badgeContent={stats.pendingReview} color="error">
                <IconButton sx={{ color: 'white' }}>
                  <Notifications />
                </IconButton>
              </Badge>
              <IconButton sx={{ color: 'white' }}>
                <Refresh />
              </IconButton>
            </Box>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg">
        {/* Enhanced Tabs */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable" scrollButtons="auto">
            <Tab icon={<DashboardIcon />} label="Dashboard" />
            <Tab icon={<Assignment />} label="Listings" />
            <Tab icon={<People />} label="Users" />
            <Tab icon={<Business />} label="Companies" />
            <Tab icon={<CardMembership />} label="Membership" />
            <Tab icon={<Payment />} label="Transactions" />
            <Tab icon={<Report />} label="Reports" />
            <Tab icon={<DynamicForm />} label="Templates" />
            <Tab icon={<AdminPanelSettings />} label="Admin Mgmt" />
            <Tab icon={<Settings />} label="Settings" />
          </Tabs>
        </Box>

        {/* Tab Content */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          tabContent()
        )}
      </Container>

      {/* Bulk Action Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Bulk Action Confirmation</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to perform an action on {selectedItems.length} selected items?
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button onClick={() => handleBulkAction('approve')} color="success">
            Approve Selected
          </Button>
          <Button onClick={() => handleBulkAction('reject')} color="error">
            Reject Selected
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdminDashboard;

