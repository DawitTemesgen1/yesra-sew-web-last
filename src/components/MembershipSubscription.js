import React, { useState } from 'react';
import {
  Box, Typography, Button, Card, CardContent, Chip,
  TextField, Grid, Stack, Divider,
  List, ListItem, ListItemText, ListItemIcon, Avatar, Select, MenuItem,
  FormControlLabel, Switch, Accordion, AccordionSummary, AccordionDetails,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, IconButton, LinearProgress, Tabs, Tab
} from '@mui/material';
import {
  Star, Check, Search, TrendingUp, Cancel,
  CardMembership, AttachMoney,
  CheckCircle, AccessTime, Edit, Add,
  Refresh, Download, Visibility, Block,
  ExpandMore, Business, Person, Category, Delete
} from '@mui/icons-material';
import adminService from '../services/adminService';
import toast from 'react-hot-toast';

const MembershipSubscription = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPlan, setFilterPlan] = useState('all');

  // State
  const [plans, setPlans] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [newPlan, setNewPlan] = useState({
    name: '',
    type: 'individual',
    price: '',
    duration: 'monthly',
    features: '',
    category_limits: {} // { categoryId: limit }
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansData, catsData] = await Promise.all([
        adminService.getMembershipPlans(),
        adminService.getCategories()
      ]);
      setPlans(plansData);
      setCategories(catsData || []);
    } catch (err) {
      console.error("Error loading plans", err);
      toast.error("Failed to load plans");
    } finally {
      setLoading(false);
    }
  };

  const handleCreatePlan = async () => {
    try {
      if (!newPlan.name || !newPlan.price) {
        toast.error("Name and Price are required");
        return;
      }

      const planData = {
        name: newPlan.name,
        price: parseFloat(newPlan.price),
        duration: newPlan.duration,
        features: newPlan.features.split('\n').filter(f => f.trim()).map(f => f.trim()),
        category_limits: newPlan.category_limits,
        is_active: true,
        display_order: plans.length + 1
      };

      await adminService.createMembershipPlan(planData);
      toast.success("Plan created successfully");
      setNewPlan({ name: '', type: 'individual', price: '', duration: 'monthly', features: '', category_limits: {} });
      fetchData();
    } catch (err) {
      console.error(err);
      toast.error("Failed to create plan");
    }
  };

  const handleDeletePlan = async (id) => {
    if (!window.confirm("Delete this plan?")) return;
    try {
      await adminService.deleteMembershipPlan(id);
      toast.success("Plan deleted");
      fetchData();
    } catch (err) {
      toast.error("Failed to delete plan");
    }
  };

  const updateNewPlanLimit = (catSlug, value) => {
    setNewPlan(prev => ({
      ...prev,
      category_limits: {
        ...prev.category_limits,
        [catSlug]: parseInt(value) || 0
      }
    }));
  };

  // Active Subscriptions
  const [subscriptions, setSubscriptions] = useState([
    {
      id: 1,
      user: 'John Doe',
      email: 'john@email.com',
      plan: 'Premium',
      type: 'individual',
      status: 'active',
      startDate: '2024-01-01',
      endDate: '2024-02-01',
      autoRenew: true,
      paymentMethod: 'Telebirr',
      amount: 299,
      listingsUsed: 8,
      listingsLimit: 25,
      featuredUsed: 1,
      featuredLimit: 3
    },
    {
      id: 2,
      user: 'Jane Smith',
      email: 'jane@company.com',
      plan: 'Business',
      type: 'business',
      status: 'active',
      startDate: '2024-01-05',
      endDate: '2024-02-05',
      autoRenew: true,
      paymentMethod: 'Chappa',
      amount: 999,
      listingsUsed: 45,
      listingsLimit: -1,
      featuredUsed: 7,
      featuredLimit: 10
    },
    {
      id: 3,
      user: 'Tech Corp',
      email: 'hr@techcorp.com',
      plan: 'Enterprise',
      type: 'business',
      status: 'active',
      startDate: '2024-01-10',
      endDate: '2024-02-10',
      autoRenew: true,
      paymentMethod: 'Bank Transfer',
      amount: 2999,
      listingsUsed: 120,
      listingsLimit: -1,
      featuredUsed: 25,
      featuredLimit: -1
    },
    {
      id: 4,
      user: 'Mike Wilson',
      email: 'mike@email.com',
      plan: 'Basic',
      type: 'individual',
      status: 'expired',
      startDate: '2023-12-01',
      endDate: '2024-01-01',
      autoRenew: false,
      paymentMethod: 'Free',
      amount: 0,
      listingsUsed: 3,
      listingsLimit: 5,
      featuredUsed: 0,
      featuredLimit: 0
    }
  ]);

  // Subscription Analytics
  const [analytics] = useState({
    totalSubscriptions: 1880,
    activeSubscriptions: 1655,
    monthlyRevenue: 429700,
    yearlyRevenue: 5156400,
    churnRate: 2.3,
    conversionRate: 12.5,
    avgSubscriptionValue: 259.50
  });

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      expired: 'error',
      cancelled: 'warning',
      pending: 'info'
    };
    return colors[status] || 'default';
  };

  const getStatusIcon = (status) => {
    const icons = {
      active: <CheckCircle />,
      expired: <Cancel />,
      cancelled: <Block />,
      pending: <AccessTime /> // Fixed: Using AccessTime instead of Clock
    };
    return icons[status] || <AccessTime />;
  };

  const filteredSubscriptions = subscriptions.filter(sub => {
    const matchesSearch = sub.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sub.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || sub.status === filterStatus;
    const matchesPlan = filterPlan === 'all' || sub.plan === filterPlan;
    return matchesSearch && matchesStatus && matchesPlan;
  });

  const renderMembershipPlans = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Membership Plans</Typography>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {plans.map(plan => (
          <Grid item xs={12} md={6} lg={3} key={plan.id}>
            <Card sx={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              border: plan.name.includes('Premium') ? '2px solid #28a745' : '1px solid #e0e0e0',
              '&:hover': { transform: 'translateY(-5px)', boxShadow: 3 }
            }}>
              {/* Optional: Add Popular Badge if needed based on plan property */}
              <CardContent sx={{ flexGrow: 1, textAlign: 'center' }}>
                <Avatar sx={{ bgcolor: plan.color || '#1976d2', mx: 'auto', mb: 2, width: 56, height: 56 }}>
                  <Star />
                </Avatar>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  {plan.name}
                </Typography>
                <Typography variant="h4" color="primary.main" gutterBottom>
                  {plan.price === 0 ? 'Free' : `ETB ${plan.price}`}
                  <Typography variant="caption" display="block">
                    /{plan.duration}
                  </Typography>
                </Typography>

                {/* Limits Display */}
                <Stack direction="row" flexWrap="wrap" gap={1} justifyContent="center" mb={2}>
                  {Object.entries(plan.category_limits || {}).map(([cat, limit]) => (
                    <Chip key={cat} size="small" label={`${cat}: ${limit === -1 ? '∞' : limit}`} variant="outlined" />
                  ))}
                </Stack>

                <List dense>
                  {(plan.features || []).map((feature, index) => (
                    <ListItem key={index} sx={{ px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 24 }}>
                        <CheckCircle sx={{ fontSize: 16, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={typeof feature === 'string' ? feature : JSON.stringify(feature)} />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
              <Box sx={{ p: 2, mt: 'auto' }}>
                <Stack spacing={1}>
                  <Button variant="outlined" size="small" startIcon={<Edit />}>
                    Edit Plan
                  </Button>
                  <Button variant="outlined" color="error" size="small" startIcon={<Delete />} onClick={() => handleDeletePlan(plan.id)}>
                    Delete
                  </Button>
                </Stack>
              </Box>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h6">Plan Management</Typography>
        <Button variant="contained" startIcon={<Add />}>Add New Plan</Button>
      </Box>

      <Card>
        <CardContent>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}>
              <Typography>Create Custom Plan</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <TextField
                    fullWidth label="Plan Name" placeholder="e.g., Job Pro"
                    value={newPlan.name} onChange={e => setNewPlan({ ...newPlan, name: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    fullWidth label="Price (ETB)" type="number"
                    value={newPlan.price} onChange={e => setNewPlan({ ...newPlan, price: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <Select fullWidth value={newPlan.duration} onChange={e => setNewPlan({ ...newPlan, duration: e.target.value })}>
                    <MenuItem value="monthly">Monthly</MenuItem>
                    <MenuItem value="yearly">Yearly</MenuItem>
                    <MenuItem value="lifetime">Lifetime</MenuItem>
                  </Select>
                </Grid>

                {/* Dynamic Categories Limits */}
                <Grid item xs={12}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>Category Limits (Enter -1 for Unlimited, 0 for None)</Typography>
                  <Stack direction="row" flexWrap="wrap" gap={2}>
                    {categories.map(cat => (
                      <TextField
                        key={cat.id}
                        label={cat.name}
                        type="number"
                        size="small"
                        sx={{ width: 120 }}
                        value={newPlan.category_limits[cat.slug] ?? 0}
                        onChange={(e) => updateNewPlanLimit(cat.slug, e.target.value)}
                      />
                    ))}
                  </Stack>
                </Grid>

                <Grid item xs={12}>
                  <TextField
                    fullWidth multiline rows={3} label="Features (one per line)"
                    value={newPlan.features} onChange={e => setNewPlan({ ...newPlan, features: e.target.value })}
                  />
                </Grid>
                <Grid item xs={12}>
                  <Button variant="contained" startIcon={<Add />} onClick={handleCreatePlan}>Create Plan</Button>
                </Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </CardContent>
      </Card>
    </Box>
  );

  const renderActiveSubscriptions = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h6">Active Subscriptions</Typography>
        <Button variant="contained" startIcon={<Refresh />}>Refresh</Button>
      </Box>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search subscriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search /> }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Select fullWidth value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="expired">Expired</MenuItem>
            <MenuItem value="cancelled">Cancelled</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={3}>
          <Select fullWidth value={filterPlan} onChange={(e) => setFilterPlan(e.target.value)}>
            <MenuItem value="all">All Plans</MenuItem>
            <MenuItem value="Basic">Basic</MenuItem>
            <MenuItem value="Premium">Premium</MenuItem>
            <MenuItem value="Business">Business</MenuItem>
            <MenuItem value="Enterprise">Enterprise</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="outlined" startIcon={<Download />} fullWidth>
            Export
          </Button>
        </Grid>
      </Grid>

      {/* Subscriptions Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Payment</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredSubscriptions.map(sub => (
                  <TableRow key={sub.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          {sub.type === 'business' ? <Business /> : <Person />}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {sub.user}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {sub.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {sub.plan}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sub.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={sub.status}
                        color={getStatusColor(sub.status)}
                        icon={getStatusIcon(sub.status)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {sub.startDate} to {sub.endDate}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                          <Switch size="small" checked={sub.autoRenew} />
                          <Typography variant="caption" sx={{ ml: 1 }}>
                            Auto-renew
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          Listings: {sub.listingsUsed}
                          {sub.listingsLimit === -1 ? ' (∞)' : `/${sub.listingsLimit}`}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Featured: {sub.featuredUsed}
                          {sub.featuredLimit === -1 ? ' (∞)' : `/${sub.featuredLimit}`}
                        </Typography>
                        <LinearProgress
                          variant="determinate"
                          value={sub.listingsLimit === -1 ? 50 : (sub.listingsUsed / sub.listingsLimit) * 100}
                          sx={{ mt: 1, height: 4 }}
                        />
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          ETB {sub.amount}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {sub.paymentMethod}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small" title="View Details">
                        <Visibility />
                      </IconButton>
                      <IconButton size="small" title="Edit Subscription">
                        <Edit />
                      </IconButton>
                      <IconButton size="small" title="Cancel" color="error">
                        <Block />
                      </IconButton>
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

  const renderAnalytics = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Subscription Analytics</Typography>

      {/* Analytics Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CardMembership sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">{analytics.totalSubscriptions.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Total Subscriptions</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <CheckCircle sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h5">{analytics.activeSubscriptions.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Active Subscriptions</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <AttachMoney sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
            <Typography variant="h5">ETB {analytics.monthlyRevenue.toLocaleString()}</Typography>
            <Typography variant="caption" color="text.secondary">Monthly Revenue</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <TrendingUp sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h5">{analytics.conversionRate}%</Typography>
            <Typography variant="caption" color="text.secondary">Conversion Rate</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Revenue Chart Placeholder */}
      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Revenue Overview</Typography>
              <Box sx={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'grey.100', borderRadius: 1 }}>
                <Typography color="text.secondary">Revenue Chart Component</Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Plan Distribution</Typography>
              {plans.map(plan => (
                <Box key={plan.id} sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="body2">{plan.name}</Typography>
                    <Typography variant="body2">{plan.usersCount}</Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={(plan.usersCount / analytics.totalSubscriptions) * 100}
                    sx={{ height: 6 }}
                  />
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Membership & Subscriptions</Typography>

      <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
        <Tab icon={<CardMembership />} label="Plans" />
        <Tab icon={<CardMembership />} label="Subscriptions" />
        <Tab icon={<TrendingUp />} label="Analytics" />
      </Tabs>

      {activeTab === 0 && renderMembershipPlans()}
      {activeTab === 1 && renderActiveSubscriptions()}
      {activeTab === 2 && renderAnalytics()}
    </Box>
  );
};

export default MembershipSubscription;