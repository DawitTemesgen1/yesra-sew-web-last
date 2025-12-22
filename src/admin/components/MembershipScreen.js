import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert,
  LinearProgress, Paper, Stack, Tooltip
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, CardMembership, Star, Diamond, WorkspacePremium, People,
  TrendingUp, Payments, CreditCard, Receipt, Schedule,
  Upgrade, ArrowDownward, Block, Verified, Pending, NotInterested,
  Settings, History, Assessment, Loyalty, GiftCard, LocalOffer
} from '@mui/icons-material';

const MembershipScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [planDialog, setPlanDialog] = useState(false);
  const [memberDialog, setMemberDialog] = useState(false);

  const membershipPlans = [
    {
      id: 1,
      name: 'Basic',
      type: 'free',
      price: 0,
      duration: 'lifetime',
      features: ['Browse listings', 'Basic search', 'Contact sellers'],
      limits: { listings: 5, messages: 50, views: 100 },
      status: 'active',
      member_count: 1250,
      revenue: 0,
      color: '#4CAF50'
    },
    {
      id: 2,
      name: 'Premium',
      type: 'paid',
      price: 29.99,
      duration: 'monthly',
      features: ['Everything in Basic', 'Unlimited listings', 'Priority support', 'Advanced search', 'Featured listings'],
      limits: { listings: -1, messages: 500, views: 1000 },
      status: 'active',
      member_count: 450,
      revenue: 13495.50,
      color: '#2196F3'
    },
    {
      id: 3,
      name: 'Professional',
      type: 'paid',
      price: 79.99,
      duration: 'monthly',
      features: ['Everything in Premium', 'Analytics dashboard', 'Bulk operations', 'API access', 'Custom branding'],
      limits: { listings: -1, messages: -1, views: -1 },
      status: 'active',
      member_count: 125,
      revenue: 9998.75,
      color: '#FF9800'
    },
    {
      id: 4,
      name: 'Enterprise',
      type: 'paid',
      price: 199.99,
      duration: 'monthly',
      features: ['Everything in Professional', 'Dedicated support', 'Custom integrations', 'White label', 'SLA guarantee'],
      limits: { listings: -1, messages: -1, views: -1 },
      status: 'active',
      member_count: 25,
      revenue: 4999.75,
      color: '#9C27B0'
    },
    {
      id: 5,
      name: 'Trial',
      type: 'trial',
      price: 0,
      duration: '14 days',
      features: ['Premium features', 'Full access', 'No credit card required'],
      limits: { listings: 10, messages: 100, views: 500 },
      status: 'active',
      member_count: 89,
      revenue: 0,
      color: '#F44336'
    }
  ];

  const members = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@email.com',
      plan: 'Premium',
      status: 'active',
      joined_at: '2024-01-01',
      expires_at: '2024-02-01',
      auto_renew: true,
      total_spent: 29.99,
      last_payment: '2024-01-01',
      payment_method: 'credit_card',
      usage: { listings: 12, messages: 67, views: 234 }
    },
    {
      id: 2,
      name: 'Sarah Wilson',
      email: 'sarah.wilson@email.com',
      plan: 'Professional',
      status: 'active',
      joined_at: '2023-12-15',
      expires_at: '2024-01-15',
      auto_renew: true,
      total_spent: 239.97,
      last_payment: '2024-01-01',
      payment_method: 'paypal',
      usage: { listings: 45, messages: 234, views: 1567 }
    },
    {
      id: 3,
      name: 'Mike Johnson',
      email: 'mike.johnson@email.com',
      plan: 'Basic',
      status: 'active',
      joined_at: '2023-11-20',
      expires_at: null,
      auto_renew: false,
      total_spent: 0,
      last_payment: null,
      payment_method: null,
      usage: { listings: 3, messages: 12, views: 45 }
    },
    {
      id: 4,
      name: 'Emily Brown',
      email: 'emily.brown@email.com',
      plan: 'Trial',
      status: 'trial',
      joined_at: '2024-01-10',
      expires_at: '2024-01-24',
      auto_renew: false,
      total_spent: 0,
      last_payment: null,
      payment_method: null,
      usage: { listings: 8, messages: 34, views: 123 }
    },
    {
      id: 5,
      name: 'David Lee',
      email: 'david.lee@email.com',
      plan: 'Enterprise',
      status: 'expired',
      joined_at: '2023-10-01',
      expires_at: '2024-01-01',
      auto_renew: false,
      total_spent: 1999.90,
      last_payment: '2023-12-01',
      payment_method: 'credit_card',
      usage: { listings: 156, messages: 892, views: 4567 }
    }
  ];

  const transactions = [
    {
      id: 1,
      member: 'John Doe',
      plan: 'Premium',
      amount: 29.99,
      type: 'subscription',
      status: 'completed',
      payment_method: 'credit_card',
      transaction_id: 'TXN-1234',
      created_at: '2024-01-01 00:00'
    },
    {
      id: 2,
      member: 'Sarah Wilson',
      plan: 'Professional',
      amount: 79.99,
      type: 'subscription',
      status: 'completed',
      payment_method: 'paypal',
      transaction_id: 'TXN-1235',
      created_at: '2024-01-01 00:15'
    },
    {
      id: 3,
      member: 'David Lee',
      plan: 'Enterprise',
      amount: 199.99,
      type: 'subscription',
      status: 'failed',
      payment_method: 'credit_card',
      transaction_id: 'TXN-1236',
      created_at: '2024-01-01 01:00'
    },
    {
      id: 4,
      member: 'Emily Brown',
      plan: 'Trial',
      amount: 0,
      type: 'trial_start',
      status: 'completed',
      payment_method: null,
    }
  ];

  const filteredMembers = members.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      member.email.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || member.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && member.plan === 'Basic') ||
      (activeTab === 2 && member.plan === 'Premium') ||
      (activeTab === 3 && member.plan === 'Professional') ||
      (activeTab === 4 && member.plan === 'Enterprise') ||
      (activeTab === 5 && member.plan === 'Trial');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'info';
      case 'expired': return 'error';
      case 'cancelled': return 'warning';
      default: return 'default';
    }
  };

  const getPlanIcon = (plan) => {
    switch (plan) {
      case 'Basic': return <CardMembership sx={{ fontSize: 20 }} />;
      case 'Premium': return <Star sx={{ fontSize: 20 }} />;
      case 'Professional': return <Diamond sx={{ fontSize: 20 }} />;
      case 'Enterprise': return <WorkspacePremium sx={{ fontSize: 20 }} />;
      case 'Trial': return <Pending sx={{ fontSize: 20 }} />;
      default: return <CardMembership sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (memberId) => {
    setSelectedItems(prev =>
      prev.includes(memberId)
        ? prev.filter(id => id !== memberId)
        : [...prev, memberId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleUpgrade = (memberId) => {
    
  };

  const handleDowngrade = (memberId) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Membership Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Settings />} onClick={() => setPlanDialog(true)}>
            Manage Plans
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setMemberDialog(true)}>
            Add Member
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">1,939</Typography>
              <Typography variant="body2" color="text.secondary">Total Members</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">28.5%</Typography>
              <Typography variant="body2" color="text.secondary">Premium Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Payments sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">$28,493</Typography>
              <Typography variant="body2" color="text.secondary">Monthly Revenue</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Loyalty sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">89</Typography>
              <Typography variant="body2" color="text.secondary">Trial Users</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Membership Plans Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Membership Plans Overview
          </Typography>
          <Grid container spacing={2}>
            {membershipPlans.map((plan) => (
              <Grid item xs={12} sm={6} md={2.4} key={plan.id}>
                <Paper variant="outlined" sx={{ p: 2, borderLeft: `4px solid ${plan.color}` }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getPlanIcon(plan.name)}
                    <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                      {plan.name}
                    </Typography>
                  </Box>
                  <Typography variant="h5" color={plan.color} fontWeight="bold">
                    {plan.price === 0 ? 'Free' : `$${plan.price}`}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {plan.duration}
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2">
                      {plan.member_count} members
                    </Typography>
                    {plan.revenue > 0 && (
                      <Typography variant="caption" color="success.main">
                        ${plan.revenue.toLocaleString()}/mo
                      </Typography>
                    )}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Plans */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Members" />
          <Tab label="Basic" />
          <Tab label="Premium" />
          <Tab label="Professional" />
          <Tab label="Enterprise" />
          <Tab label="Trial" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search members..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  label="Status"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="trial">Trial</MenuItem>
                  <MenuItem value="expired">Expired</MenuItem>
                  <MenuItem value="cancelled">Cancelled</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={refreshing}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <>
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('upgrade')}>
                      Upgrade Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('downgrade')}>
                      Downgrade Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('cancel')}>
                      Cancel Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Members Table */}
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
                          setSelectedItems(filteredMembers.map(member => member.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Member</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Auto Renew</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMembers.map((member) => (
                  <TableRow key={member.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(member.id)}
                        onChange={() => handleItemSelect(member.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {member.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getPlanIcon(member.plan)}
                        <Typography variant="body2">
                          {member.plan}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={member.status}
                        color={getStatusColor(member.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {member.usage.listings} listings
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {member.usage.messages} msgs • {member.usage.views} views
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" color="success.main">
                        ${member.total_spent.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={member.auto_renew}
                        size="small"
                        disabled={member.plan === 'Basic'}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {member.expires_at || 'Never'}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Member">
                          <IconButton size="small" color="success">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Upgrade">
                          <IconButton size="small" color="info" onClick={() => handleUpgrade(member.id)}>
                            <Upgrade />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Downgrade">
                          <IconButton size="small" color="warning" onClick={() => handleDowngrade(member.id)}>
                            <ArrowDownward />
                          </IconButton>
                        </Tooltip>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Recent Transactions */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Transactions
          </Typography>
          <List>
            {transactions.slice(0, 5).map((transaction) => (
              <ListItem key={transaction.id} divider>
                <ListItemIcon>
                  <Receipt />
                </ListItemIcon>
                <ListItemText
                  primary={`${transaction.member} - ${transaction.plan}`}
                  secondary={`${transaction.amount > 0 ? '$' + transaction.amount : 'Free'} • ${transaction.type} • ${transaction.created_at}`}
                />
                <ListItemSecondaryAction>
                  <Chip
                    label={transaction.status}
                    color={transaction.status === 'completed' ? 'success' : 'error'}
                    size="small"
                  />
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Add Member Dialog */}
      <Dialog open={memberDialog} onClose={() => setMemberDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Member</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Add a new member to the platform and assign a membership plan.
          </Typography>
          {/* Add member form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMemberDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Member</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Plans Dialog */}
      <Dialog open={planDialog} onClose={() => setPlanDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Manage Membership Plans</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure membership plans, pricing, and features.
          </Typography>
          {/* Plans management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPlanDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MembershipScreen;

