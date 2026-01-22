import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert,
  LinearProgress, Paper, Stack, Tooltip, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, People, Person, PersonAdd, PersonRemove, Block, Lock,
  Security, Email, Phone, LocationOn, CalendarToday, ExpandMore,
  Star, TrendingUp, Assessment, FilterList, MoreVert,
  Verified, Pending, Error, AdminPanelSettings, SupervisorAccount,
  Group, Business, School, Work, AssignmentInd
} from '@mui/icons-material';

import adminService from '../../services/adminService';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from '../../utils/dateUtils';
import UserDetailDialog from './UserDetailDialog';
import { useAdminAuth } from '../../context/AdminAuthContext';

const UserManagementScreen = ({ t, handleRefresh: propHandleRefresh, refreshing: propRefreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const navigate = useNavigate();
  const { adminUser } = useAdminAuth();
  const isOwner = adminUser?.user_metadata?.role === 'owner' || adminUser?.user_metadata?.role === 'super_admin';
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [userDialog, setUserDialog] = useState(false);
  const [roleDialog, setRoleDialog] = useState(false);
  const [userDetailOpen, setUserDetailOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState(null);

  // State for dynamic data from Supabase
  const [userStats, setUserStats] = useState({
    totalUsers: 0,
    growthRate: 0,
    verifiedRate: 0,
    profileCompletion: 0
  });
  const [userActivity, setUserActivity] = useState([]);
  const [userRoles, setUserRoles] = useState([]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers();
      // Map database fields to UI fields if necessary, or use directly
      const mappedUsers = data.map(u => ({
        ...u,
        name: u.full_name || 'Unknown',
        role: u.role || 'user',
        status: u.is_active ? 'active' : 'suspended',
        verification_status: u.verified ? 'verified' : 'pending',
        joined_at: u.created_at ? new Date(u.created_at).toLocaleDateString() : 'N/A',
        listings_count: 0, // TODO: Fetch with JOIN or separate query
      }));
      setUsers(mappedUsers);
    } catch (error) {
      console.error('Failed to fetch users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchUsers();
  }, [propRefreshing]);

  const handleRefresh = () => {
    if (propHandleRefresh) propHandleRefresh();
    fetchUsers();
  };

  // Fetch user stats and activity
  const fetchUserStats = async () => {
    try {
      const { count: totalUsers } = await adminService.getUsers({ limit: 999999 }).then(users => ({ count: users.length }));
      const { count: verifiedUsers } = await adminService.getUsers({ limit: 999999 }).then(users => ({ count: users.filter(u => u.verified).length }));

      setUserStats({
        totalUsers: totalUsers || 0,
        growthRate: 0, // TODO: Calculate from historical data
        verifiedRate: totalUsers > 0 ? ((verifiedUsers / totalUsers) * 100).toFixed(1) : 0,
        profileCompletion: 0 // TODO: Calculate based on filled fields
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
    }
  };

  React.useEffect(() => {
    fetchUserStats();
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      user.email.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      user.role.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || user.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && user.role === 'admin') ||
      (activeTab === 2 && user.role === 'moderator') ||
      (activeTab === 3 && user.role === 'premium_user') ||
      (activeTab === 4 && user.role === 'user');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'error';
      case 'pending': return 'warning';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getRoleIcon = (role) => {
    switch (role) {
      case 'admin': return <AdminPanelSettings sx={{ fontSize: 20 }} />;
      case 'moderator': return <SupervisorAccount sx={{ fontSize: 20 }} />;
      case 'premium_user': return <Star sx={{ fontSize: 20 }} />;
      case 'user': return <Person sx={{ fontSize: 20 }} />;
      default: return <Person sx={{ fontSize: 20 }} />;
    }
  };

  const getVerificationIcon = (status) => {
    switch (status) {
      case 'verified': return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'pending': return <Pending sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'rejected': return <Error sx={{ fontSize: 20, color: 'error.main' }} />;
      default: return <Pending sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (userId) => {
    setSelectedItems(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    );
  };

  const handleBulkAction = (action) => {

  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleSuspendUser = async (userId) => {
    if (window.confirm('Are you sure you want to suspend this user?')) {
      try {
        await adminService.updateUserStatus(userId, { is_active: false });
        toast.success('User suspended successfully');
        fetchUsers();
      } catch (error) {
        toast.error('Failed to suspend user');
      }
    }
  };

  const handleActivateUser = async (userId) => {
    try {
      await adminService.updateUserStatus(userId, { is_active: true });
      toast.success('User activated successfully');
      fetchUsers();
    } catch (error) {
      toast.error('Failed to activate user');
    }
  };

  const handleVerifyUser = async (userId, newStatus) => {
    try {
      await adminService.updateUserStatus(userId, { verified: newStatus });
      toast.success(newStatus ? 'User verified successfully' : 'User unverified successfully');
      fetchUsers();
    } catch (error) {
      console.error(error);
      toast.error(error.message || 'Failed to update verification status');
    }
  };

  const handleViewProfile = (userId) => {
    setSelectedUserId(userId);
    setUserDetailOpen(true);
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        // Note: adminService might not have deleteUser, assume it does or use updateUserStatus to soft delete
        // For now, let's assume we just suspend/deactivate as "delete" is dangerous
        await adminService.updateUserStatus(userId, { is_active: false });
        toast.success('User deactivated (soft delete)');
        fetchUsers();
      } catch (error) {
        console.error(error);
        toast.error(error.message || 'Failed to delete user');
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          User Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AssignmentInd />} onClick={() => setRoleDialog(true)}>
            Manage Roles
          </Button>
          <Button variant="contained" startIcon={<PersonAdd />} onClick={() => setUserDialog(true)}>
            Add User
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <People sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{userStats.totalUsers.toLocaleString()}</Typography>
              <Typography variant="body2" color="text.secondary">Total Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUp sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{userStats.growthRate}%</Typography>
              <Typography variant="body2" color="text.secondary">Growth Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Verified sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{userStats.verifiedRate}%</Typography>
              <Typography variant="body2" color="text.secondary">Verified Users</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Assessment sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{userStats.profileCompletion}%</Typography>
              <Typography variant="body2" color="text.secondary">Profile Completion</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* User Activity Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Activity Overview
          </Typography>
          <Grid container spacing={2}>
            {userActivity.length === 0 && (
              <Grid item xs={12}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 2 }}>
                  No activity data available
                </Typography>
              </Grid>
            )}
            {userActivity.map((activity) => (
              <Grid item xs={12} sm={6} md={3} key={activity.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {activity.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {activity.metric}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={activity.change}
                      color={activity.trend === 'up' ? 'success' : 'error'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {activity.date_range}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for User Roles */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Users" />
          <Tab label="Admins" />
          <Tab label="Moderators" />
          <Tab label="Premium Users" />
          <Tab label="Regular Users" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search users..."
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
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={propRefreshing}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('suspend')}>
                      Suspend
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('delete')}>
                      Delete
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Users Table */}
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
                          setSelectedItems(filteredUsers.map(user => user.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Joined</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(user.id)}
                        onChange={() => handleItemSelect(user.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar>{user.name.charAt(0)}</Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {user.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getRoleIcon(user.role)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {user.role.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={user.status}
                        color={getStatusColor(user.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Tooltip title={user.verified ? "Verified" : "Unverified"}>
                          {user.verified ? <Verified color="primary" fontSize="small" /> : <Security color="disabled" fontSize="small" />}
                        </Tooltip>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {user.verified ? 'Verified' : 'Unverified'}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationOn sx={{ fontSize: 16, color: 'text.secondary' }} />
                        <Typography variant="body2">
                          {user.location}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {user.joined_at}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Profile">
                          <IconButton size="small" color="primary" onClick={() => handleViewProfile(user.id)}>
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title={user.status === 'active' ? "Suspend User" : "Activate User"}>
                          <IconButton
                            size="small"
                            color={user.status === 'active' ? "warning" : "success"}
                            onClick={() => user.status === 'active' ? handleSuspendUser(user.id) : handleActivateUser(user.id)}
                          >
                            {user.status === 'active' ? <Block /> : <CheckCircle />}
                          </IconButton>
                        </Tooltip>

                        <Tooltip title={user.verified ? "Unverify User" : "Verify User"}>
                          <IconButton
                            size="small"
                            color={user.verified ? "default" : "success"}
                            onClick={() => handleVerifyUser(user.id, !user.verified)}
                          >
                            {user.verified ? <Security /> : <Verified />}
                          </IconButton>
                        </Tooltip>
                        {isOwner && (
                          <Tooltip title="Change Role">
                            <IconButton
                              size="small"
                              color="secondary"
                              onClick={() => {
                                setSelectedUserId(user.id);
                                setRoleDialog(true);
                              }}
                            >
                              <AdminPanelSettings />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Delete User">
                          <IconButton size="small" color="error" onClick={() => handleDeleteUser(user.id)}>
                            <Delete />
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

      {/* Add User Dialog */}
      <Dialog open={userDialog} onClose={() => setUserDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New User</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create a new user account with specific roles and permissions.
          </Typography>
          {/* Add user form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUserDialog(false)}>Cancel</Button>
          <Button variant="contained">Create User</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Roles Dialog */}
      <Dialog open={roleDialog} onClose={() => setRoleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage User Roles</DialogTitle>
        <DialogContent>
          <Box sx={{ minWidth: 400, pt: 2 }}>
            <Typography gutterBottom>
              Select a new role for the user.
            </Typography>
            <FormControl fullWidth sx={{ mt: 2 }}>
              <InputLabel>Role</InputLabel>
              <Select
                value={users.find(u => u.id === selectedUserId)?.role || 'user'}
                label="Role"
                onChange={(e) => {
                  const newRole = e.target.value;
                  if (window.confirm(`Are you sure you want to promote this user to ${newRole}? This grants significant privileges.`)) {
                    adminService.updateUserRole(selectedUserId, newRole)
                      .then(() => {
                        toast.success(`Role updated to ${newRole}`);
                        setRoleDialog(false);
                        fetchUsers();
                      })
                      .catch(err => {
                        toast.error(err.message || 'Failed to update role');
                      });
                  }
                }}
              >
                <MenuItem value="user">User</MenuItem>
                <MenuItem value="premium_user">Premium User</MenuItem>
                <MenuItem value="moderator">Moderator</MenuItem>
                <MenuItem value="admin">Admin</MenuItem>
                {isOwner && <MenuItem value="owner">Owner</MenuItem>}
                {/* Only Owner can create other owners if needed, but let's restrict to Admin for now */}
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRoleDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* User Detail Dialog */}
      <UserDetailDialog
        open={userDetailOpen}
        onClose={() => {
          setUserDetailOpen(false);
          setSelectedUserId(null);
        }}
        userId={selectedUserId}
        onUpdate={() => {
          fetchUsers();
        }}
      />
    </Box>
  );
};

export default UserManagementScreen;

