import React, { useState } from 'react';
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
    },
    {
      id: 2,
      title: 'Property Listing Approved',
      message: 'Your property listing has been approved and is now live on our platform.',
      type: 'push',
      category: 'listing',
      priority: 'high',
      status: 'pending',
      recipients: 567,
      sent_at: null,
      scheduled_at: '2024-01-16 09:00:00',
      created_by: 'moderation_team@yesrasew.com',
      template_id: 2,
      open_rate: null,
      click_rate: null,
      bounce_rate: null
    },
    {
      id: 3,
      title: 'Payment Successful',
      message: 'Your premium subscription payment has been processed successfully.',
      type: 'sms',
      category: 'billing',
      priority: 'high',
      status: 'sent',
      recipients: 234,
      sent_at: '2024-01-15 12:15:00',
      scheduled_at: '2024-01-15 12:15:00',
      created_by: 'billing_system@yesrasew.com',
      template_id: 3,
      open_rate: null,
      click_rate: null,
      bounce_rate: 1.2
    },
    {
      id: 4,
      title: 'System Maintenance',
      message: 'Platform will undergo scheduled maintenance on January 20, 2024.',
      type: 'email',
      category: 'system',
      priority: 'high',
      status: 'scheduled',
      recipients: 15678,
      sent_at: null,
      scheduled_at: '2024-01-19 18:00:00',
      created_by: 'admin@yesrasew.com',
      template_id: 4,
      open_rate: null,
      click_rate: null,
      bounce_rate: null
    },
    {
      id: 5,
      title: 'New Property Matching Your Search',
      message: 'We found new properties that match your search criteria. Check them out!',
      type: 'push',
      category: 'marketing',
      priority: 'low',
      status: 'failed',
      recipients: 890,
      sent_at: '2024-01-14 16:45:00',
      scheduled_at: '2024-01-14 16:45:00',
      created_by: 'marketing_team@yesrasew.com',
      template_id: 5,
      open_rate: null,
      click_rate: null,
      bounce_rate: 8.9
    }
  ];

  const notificationTemplates = [
    {
      id: 1,
      name: 'Welcome Email',
      type: 'email',
      category: 'welcome',
      subject: 'Welcome to Yesra Sew!',
      content: 'Thank you for joining our platform. Start exploring amazing properties today.',
      variables: ['user_name', 'signup_date'],
      status: 'active',
      usage_count: 1234,
      last_used: '2024-01-15',
      created_at: '2024-01-01',
      updated_at: '2024-01-10'
    },
    {
      id: 2,
      name: 'Listing Approval',
      type: 'push',
      category: 'listing',
      subject: 'Property Listing Approved',
      content: 'Your property listing has been approved and is now live.',
      variables: ['property_title', 'listing_id'],
      status: 'active',
      usage_count: 567,
      last_used: '2024-01-15',
      created_at: '2023-12-15',
      updated_at: '2024-01-05'
    },
    {
      id: 3,
      name: 'Payment Confirmation',
      type: 'sms',
      category: 'billing',
      subject: 'Payment Successful',
      content: 'Your payment of ${{amount}} has been processed successfully.',
      variables: ['amount', 'payment_date'],
      status: 'active',
      usage_count: 890,
      last_used: '2024-01-15',
      created_at: '2023-11-20',
      updated_at: '2024-01-08'
    },
    {
      id: 4,
      name: 'Maintenance Notice',
      type: 'email',
      category: 'system',
      subject: 'System Maintenance',
      content: 'Platform maintenance scheduled for {{date}} from {{start_time}} to {{end_time}}.',
      variables: ['date', 'start_time', 'end_time'],
      status: 'active',
      usage_count: 12,
      last_used: '2024-01-10',
      created_at: '2023-10-01',
      updated_at: '2024-01-12'
    }
  ];

  const notificationChannels = [
    {
      id: 1,
      name: 'Email',
      type: 'email',
      status: 'active',
      provider: 'SendGrid',
      daily_limit: 10000,
      daily_sent: 3456,
      success_rate: 98.5,
      avg_delivery_time: '2.5s',
      cost_per_message: 0.01,
      settings: {
        api_key: 'configured',
        bounce_handling: 'enabled',
        tracking: 'enabled'
      }
    },
    {
      id: 2,
      name: 'Push Notifications',
      type: 'push',
      status: 'active',
      provider: 'Firebase Cloud Messaging',
      daily_limit: 50000,
      daily_sent: 12345,
      success_rate: 96.2,
      avg_delivery_time: '1.2s',
      cost_per_message: 0,
      settings: {
        api_key: 'configured',
        badge_count: 'enabled',
        sound: 'enabled'
      }
    },
    {
      id: 3,
      name: 'SMS',
      type: 'sms',
      status: 'active',
      provider: 'Twilio',
      daily_limit: 5000,
      daily_sent: 789,
      success_rate: 95.8,
      avg_delivery_time: '5.8s',
      cost_per_message: 0.05,
      settings: {
        api_key: 'configured',
        phone_number: 'configured',
        alpha_sender: 'enabled'
      }
    },
    {
      id: 4,
      name: 'In-App Notifications',
      type: 'in_app',
      status: 'active',
      provider: 'Internal',
      daily_limit: 'unlimited',
      daily_sent: 23456,
      success_rate: 99.9,
      avg_delivery_time: '0.1s',
      cost_per_message: 0,
      settings: {
        real_time: 'enabled',
        batching: 'enabled',
        expiration: '30 days'
      }
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
    },
    {
      id: 2,
      metric: 'Avg Delivery Rate',
      value: '97.2%',
      change: '+0.8%',
      trend: 'up',
      status: 'good'
    },
    {
      id: 3,
      metric: 'Open Rate (Email)',
      value: '45.6%',
      change: '-2.1%',
      trend: 'down',
      status: 'warning'
    },
    {
      id: 4,
      metric: 'Click Rate',
      value: '12.3%',
      change: '+1.5%',
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
    },
    {
      id: 2,
      user_segment: 'Premium Users',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: true,
      marketing_emails: true,
      listing_updates: true,
      payment_reminders: true,
      system_updates: true,
      user_count: 1234
    },
    {
      id: 3,
      user_segment: 'Property Owners',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      listing_updates: true,
      payment_reminders: true,
      system_updates: false,
      user_count: 3456
    },
    {
      id: 4,
      user_segment: 'New Users',
      email_notifications: true,
      push_notifications: true,
      sms_notifications: false,
      marketing_emails: false,
      listing_updates: true,
      payment_reminders: false,
      system_updates: true,
      user_count: 2345
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
      case 'pending': return 'warning';
      case 'scheduled': return 'info';
      case 'failed': return 'error';
      case 'draft': return 'default';
      default: return 'default';
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

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Email sx={{ fontSize: 20 }} />;
      case 'push': return <Notifications sx={{ fontSize: 20 }} />;
      case 'sms': return <Sms sx={{ fontSize: 20 }} />;
      case 'in_app': return <Message sx={{ fontSize: 20 }} />;
      default: return <Notifications sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (notificationId) => {
    setSelectedItems(prev =>
      prev.includes(notificationId)
        ? prev.filter(id => id !== notificationId)
        : [...prev, notificationId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on notifications:`, selectedItems);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
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

      {/* Failed Notification Alert */}
      {notifications.filter(notification => notification.status === 'failed').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{notifications.filter(notification => notification.status === 'failed').length} notifications</strong> have failed to send. Review and resolve issues.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Send sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">45,678</Typography>
              <Typography variant="body2" color="text.secondary">Sent Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">97.2%</Typography>
              <Typography variant="body2" color="text.secondary">Delivery Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <MarkEmailRead sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">45.6%</Typography>
              <Typography variant="body2" color="text.secondary">Open Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Campaign sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">12.3%</Typography>
              <Typography variant="body2" color="text.secondary">Click Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Notification Metrics Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Notification Metrics
          </Typography>
          <Grid container spacing={2}>
            {notificationMetrics.map((metric) => (
              <Grid item xs={12} sm={6} md={3} key={metric.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {metric.metric}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={metric.change}
                      color={metric.trend === 'up' ? 'success' : 'error'}
                      size="small"
                    />
                    <Chip
                      label={metric.status}
                      color={metric.status === 'good' ? 'success' : 'warning'}
                      size="small"
                      sx={{ ml: 1 }}
                    />
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Notification Types */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Notifications" />
          <Tab label="Email" />
          <Tab label="Push" />
          <Tab label="SMS" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
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
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('send')}>
                      Send Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('schedule')}>
                      Schedule Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('delete')}>
                      Delete Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Notifications Table */}
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
                          setSelectedItems(filteredNotifications.map(notification => notification.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Notification</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Recipients</TableCell>
                  <TableCell>Scheduled</TableCell>
                  <TableCell>Performance</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredNotifications.map((notification) => (
                  <TableRow key={notification.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(notification.id)}
                        onChange={() => handleItemSelect(notification.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {notification.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {notification.message}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(notification.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {notification.type.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.category}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.priority}
                        color={getPriorityColor(notification.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={notification.status}
                        color={getStatusColor(notification.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {notification.recipients.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {notification.scheduled_at.split(' ')[0]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      {notification.open_rate && (
                        <Box>
                          <Typography variant="caption" color="text.secondary">
                            Open: {notification.open_rate}%
                          </Typography>
                          <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                            Click: {notification.click_rate}%
                          </Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {notification.status === 'pending' && (
                          <Tooltip title="Send Now">
                            <IconButton size="small" color="success" onClick={() => handleSendNotification(notification.id)}>
                              <Send />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Schedule">
                          <IconButton size="small" color="info" onClick={() => handleScheduleNotification(notification.id)}>
                            <Schedule />
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

      {/* Notification Channels Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Notification Channels
          </Typography>
          <Grid container spacing={2}>
            {notificationChannels.map((channel) => (
              <Grid item xs={12} md={3} key={channel.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {getTypeIcon(channel.type)}
                    <Typography variant="h6" fontWeight="bold" sx={{ ml: 1 }}>
                      {channel.name}
                    </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={channel.status}
                      color={channel.status === 'active' ? 'success' : 'error'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {channel.provider}
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    {channel.daily_sent.toLocaleString()} / {channel.daily_limit.toLocaleString()} sent
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Success: {channel.success_rate}% • {channel.avg_delivery_time}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Notification Templates
          </Typography>
          <List>
            {notificationTemplates.map((template) => (
              <ListItem key={template.id} divider>
                <ListItemIcon>
                  {getTypeIcon(template.type)}
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  secondary={`${template.type} • Used ${template.usage_count} times • Last: ${template.last_used}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={template.status}
                      color={template.status === 'active' ? 'success' : 'default'}
                      size="small"
                    />
                    <Tooltip title="Edit Template">
                      <IconButton size="small" color="primary">
                        <Edit />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* User Preferences Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Notification Preferences
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Segment</TableCell>
                  <TableCell>Email</TableCell>
                  <TableCell>Push</TableCell>
                  <TableCell>SMS</TableCell>
                  <TableCell>Marketing</TableCell>
                  <TableCell>Users</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userPreferences.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {segment.user_segment}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Switch checked={segment.email_notifications} size="small" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={segment.push_notifications} size="small" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={segment.sms_notifications} size="small" />
                    </TableCell>
                    <TableCell>
                      <Switch checked={segment.marketing_emails} size="small" />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.user_count.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Send Notification Dialog */}
      <Dialog open={notificationDialog} onClose={() => setNotificationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Send Notification</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create and send a new notification to users or user segments.
          </Typography>
          {/* Send notification form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNotificationDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />}>Send Notification</Button>
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
