import React, { useState } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert,
  Checkbox,
  LinearProgress, Paper, Stack, Tooltip, Accordion, AccordionSummary,
  AccordionDetails
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, Notifications, Email, Sms, Phone, Message,
  Send, Schedule, DateRange, CalendarToday, FilterList,
  ExpandMore, Warning, Error, Info, PriorityHigh,
  People, Person, Group, Business, School, Work,
  Settings, MoreVert, Campaign, MarkEmailRead, MarkEmailUnread,
  VolumeUp, VolumeOff, VolumeDown, Push, MailOutline
} from '@mui/icons-material';

const NotificationScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [notificationDialog, setNotificationDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);

  const notifications = [
    {
      id: 1,
      title: 'Welcome to Yesra Sew!',
      message: 'Thank you for joining our platform. Start exploring amazing properties today.',
      type: 'email',
      category: 'welcome',
      priority: 'medium',
      status: 'sent',
      recipients: 1234,
      sent_at: '2024-01-15 14:30:00',
      scheduled_at: '2024-01-15 14:30:00',
      created_by: 'system@yesrasew.com',
      template_id: 1,
      open_rate: 45.6,
      click_rate: 12.3,
      bounce_rate: 2.1
    }
  ];

  const channels = [
    {
      id: 1,
      name: 'Email',
      type: 'email',
      status: 'active',
      provider: 'SendGrid',
      daily_limit: 10000,
      daily_sent: 5678,
      success_rate: 98.5,
      avg_delivery_time: '2.3s',
      cost_per_message: 0.01
    }
  ];

  const notificationMetrics = [
    {
      id: 1,
      metric: 'Total Sent Today',
      value: 45678,
      change: '+12.5%',
      trend: 'up',
      status: 'good'
    }
  ];

  const userPreferences = [
    {
      id: 1,
      user_segment: 'All Users',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      listing_updates: true,
      payment_reminders: true,
      system_updates: true,
      user_count: 15678
    }
  ];

  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      notification.message.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || notification.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && notification.type === 'email') ||
      (activeTab === 2 && notification.type === 'push') ||
      (activeTab === 3 && notification.type === 'sms');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'delivered': return 'success';
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Email sx={{ fontSize: 20 }} />;
      case 'push': return <Notifications sx={{ fontSize: 20 }} />;
      case 'sms': return <Sms sx={{ fontSize: 20 }} />;
      case 'in_app': return <Message sx={{ fontSize: 20 }} />;
      default: return <MailOutline sx={{ fontSize: 20 }} />;
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const handleItemSelect = (notificationId) => {
    setSelectedItems(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === filteredNotifications.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(filteredNotifications.map(n => n.id));
    }
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on notifications:`, selectedItems);
  };

  const handleSendNotification = (notificationId) => {
    console.log(`Send notification: ${notificationId}`);
  };

  const handleScheduleNotification = (notificationId) => {
    console.log(`Schedule notification: ${notificationId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Notification Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Campaign />} onClick={() => setTemplateDialog(true)}>
            Templates
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setNotificationDialog(true)}>
            Send Notification
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        {notificationMetrics.map((metric) => (
          <Grid item xs={12} sm={6} md={3} key={metric.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h5" fontWeight="bold">{metric.value}</Typography>
                <Typography variant="body2" color="text.secondary">{metric.metric}</Typography>
                <Chip
                  size="small"
                  label={metric.change}
                  color={metric.status === 'good' ? 'success' : metric.status === 'warning' ? 'warning' : 'error'}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="All Notifications" />
          <Tab label="Email" />
          <Tab label="Push" />
          <Tab label="SMS" />
        </Tabs>
      </Box>

      {/* Search and Filters */}
      <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap' }}>
        <TextField
          placeholder="Search notifications..."
          value={searchTerm || ''}
          onChange={(e) => setSearchTerm(e.target.value)}
          size="small"
          sx={{ minWidth: 300 }}
          InputProps={{
            startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />
          }}
        />
        <FormControl size="small" sx={{ minWidth: 150 }}>
          <InputLabel>Status</InputLabel>
          <Select
            value={filterStatus || 'all'}
            onChange={(e) => setFilterStatus(e.target.value)}
            label="Status"
          >
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="sent">Sent</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="scheduled">Scheduled</MenuItem>
            <MenuItem value="failed">Failed</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Notifications Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell padding="checkbox">
                <Checkbox
                  indeterminate={selectedItems.length > 0 && selectedItems.length < filteredNotifications.length}
                  checked={selectedItems.length === filteredNotifications.length}
                  onChange={handleSelectAll}
                />
              </TableCell>
              <TableCell>Title</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Recipients</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Sent At</TableCell>
              <TableCell>Performance</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredNotifications.map((notification) => (
              <TableRow key={notification.id}>
                <TableCell padding="checkbox">
                  <Checkbox
                    checked={selectedItems.includes(notification.id)}
                    onChange={() => handleItemSelect(notification.id)}
                  />
                </TableCell>
                <TableCell>
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      {notification.title}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {notification.message.substring(0, 50)}...
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {getTypeIcon(notification.type)}
                    <Typography variant="body2">{notification.type}</Typography>
                  </Box>
                </TableCell>
                <TableCell>{notification.recipients.toLocaleString()}</TableCell>
                <TableCell>
                  <Chip
                    size="small"
                    label={notification.status}
                    color={getStatusColor(notification.status)}
                  />
                </TableCell>
                <TableCell>{notification.sent_at}</TableCell>
                <TableCell>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Typography variant="caption" color="text.secondary">
                      Open: {notification.open_rate}%
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Click: {notification.click_rate}%
                    </Typography>
                  </Box>
                </TableCell>
                <TableCell>
                  <IconButton size="small">
                    <Visibility />
                  </IconButton>
                  <IconButton size="small">
                    <Edit />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Bulk Actions */}
      {selectedItems.length > 0 && (
        <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
          <Button variant="contained" color="success" onClick={() => handleBulkAction('send')}>
            Send Selected
          </Button>
          <Button variant="contained" color="warning" onClick={() => handleBulkAction('schedule')}>
            Schedule Selected
          </Button>
          <Button variant="contained" color="error" onClick={() => handleBulkAction('delete')}>
            Delete Selected
          </Button>
        </Box>
      )}

      {/* Send Notification Dialog */}
      <Dialog open={notificationDialog} onClose={() => setNotificationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send New Notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create and send a new notification to selected user segments.
          </Typography>
          {/* Notification form here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button variant="contained">Send Notification</Button>
        </DialogActions>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Notification Templates</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Manage and create notification templates for different communication channels.
          </Typography>
          {/* Templates management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default NotificationScreen;
