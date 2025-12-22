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
  Add, Api, Sync, Link, Settings, Assessment,
  FilterList, ExpandMore, Warning, Error, Info,
  Timeline, Schedule, DateRange, CalendarToday,
  Cloud, CloudUpload, CloudDownload, Storage,
  Security, Lock, Key, Password,
  Code, DataObject, Hub, Router, Wifi,
  Phone, Email, Message, Notifications,
  Business, Group, Person, Payments,
  Download, Upload, FileCopy, Save, MoreVert,
  Connect, Disconnect, Check, Close,
  PlayArrow, Stop, Pause, Speed, Memory,
  AssessmentOutlined, TrendingUp, TrendingDown
} from '@mui/icons-material';

const IntegrationScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [integrationDialog, setIntegrationDialog] = useState(false);
  const [configDialog, setConfigDialog] = useState(false);

  const integrations = [
    {
      id: 1,
      name: 'Google Analytics',
      type: 'analytics',
      category: 'marketing',
      status: 'active',
      priority: 'high',
      description: 'Track website traffic and user behavior',
      provider: 'Google',
      version: 'v4',
      created_at: '2024-01-01',
      updated_at: '2024-01-15',
      last_sync: '2024-01-15 14:30:00',
      sync_frequency: 'hourly',
      data_points: 12345,
      error_count: 0,
      config: {
        tracking_id: 'GA-123456789',
        api_key: 'configured',
        webhook_url: 'https://api.google.com/analytics'
      },
      features: ['traffic_tracking', 'conversion_tracking', 'custom_events']
    },
    {
      id: 2,
      name: 'Stripe Payment Gateway',
      type: 'payment',
      category: 'billing',
      status: 'active',
      priority: 'critical',
      description: 'Process online payments and subscriptions',
      provider: 'Stripe',
      version: 'v2',
      created_at: '2023-12-15',
      updated_at: '2024-01-14',
      last_sync: '2024-01-15 12:15:00',
      sync_frequency: 'real_time',
      data_points: 5678,
      error_count: 1,
      config: {
        api_key: 'configured',
        webhook_secret: 'configured',
        sandbox_mode: false
      },
      features: ['payments', 'subscriptions', 'refunds', 'webhooks']
    },
    {
      id: 3,
      name: 'SendGrid Email Service',
      type: 'communication',
      category: 'marketing',
      status: 'active',
      priority: 'medium',
      description: 'Send transactional and marketing emails',
      provider: 'SendGrid',
      version: 'v3',
      created_at: '2023-11-20',
      updated_at: '2024-01-10',
      last_sync: '2024-01-15 16:20:00',
      sync_frequency: 'on_demand',
      data_points: 23456,
      error_count: 0,
      config: {
        api_key: 'configured',
        from_email: 'noreply@yesrasew.com',
        templates: 'configured'
      },
      features: ['email_sending', 'templates', 'analytics', 'bounce_handling']
    },
    {
      id: 4,
      name: 'AWS S3 Storage',
      type: 'storage',
      category: 'infrastructure',
      status: 'active',
      priority: 'critical',
      description: 'Cloud storage for files and media',
      provider: 'Amazon Web Services',
      version: 'v1',
      created_at: '2023-10-01',
      updated_at: '2024-01-08',
      last_sync: '2024-01-15 18:45:00',
      sync_frequency: 'continuous',
      data_points: 89012,
      error_count: 0,
      config: {
        access_key: 'configured',
        bucket_name: 'yesrasew-storage',
        region: 'us-east-1'
      },
      features: ['file_storage', 'cdn', 'backup', 'versioning']
    },
    {
      id: 5,
      name: 'Twilio SMS Gateway',
      type: 'communication',
      category: 'support',
      status: 'inactive',
      priority: 'medium',
      description: 'Send SMS notifications and alerts',
      provider: 'Twilio',
      version: 'v2',
      created_at: '2023-09-15',
      updated_at: '2024-01-05',
      last_sync: '2024-01-10 09:30:00',
      sync_frequency: 'on_demand',
      data_points: 3456,
      error_count: 3,
      config: {
        account_sid: 'configured',
        auth_token: 'configured',
        phone_number: 'configured'
      },
      features: ['sms_sending', 'mms', 'phone_verification']
    }
  ];

  const webhooks = [
    {
      id: 1,
      name: 'User Registration Webhook',
      endpoint: 'https://api.yesrasew.com/webhooks/user-registration',
      event_type: 'user.created',
      status: 'active',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer token123'
      },
      payload_template: '{"user_id": "{{user_id}}", "email": "{{email}}"}',
      retry_count: 3,
      timeout: 30,
      success_rate: 98.5,
      last_triggered: '2024-01-15 14:30:00',
      total_calls: 1234
    },
    {
      id: 2,
      name: 'Payment Confirmation Webhook',
      endpoint: 'https://billing.yesrasew.com/webhooks/payment',
      event_type: 'payment.completed',
      status: 'active',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Signature': '{{signature}}'
      },
      payload_template: '{"payment_id": "{{payment_id}}", "amount": "{{amount}}"}',
      retry_count: 5,
      timeout: 60,
      success_rate: 99.2,
      last_triggered: '2024-01-15 12:15:00',
      total_calls: 567
    },
    {
      id: 3,
      name: 'Property Listing Webhook',
      endpoint: 'https://crm.yesrasew.com/webhooks/listing',
      event_type: 'listing.created',
      status: 'failed',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      payload_template: '{"listing_id": "{{listing_id}}", "title": "{{title}}"}',
      retry_count: 3,
      timeout: 30,
      success_rate: 85.3,
      last_triggered: '2024-01-14 16:45:00',
      total_calls: 234
    }
  ];

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      service: 'Google Analytics',
      key_type: 'api_key',
      permissions: ['read', 'write'],
      usage_count: 12345,
      last_used: '2024-01-15 14:30:00',
      expires_at: '2024-12-31',
      status: 'active',
      created_by: 'admin@yesrasew.com'
    },
    {
      id: 2,
      name: 'Stripe Secret Key',
      service: 'Stripe Payment Gateway',
      key_type: 'secret_key',
      permissions: ['read', 'write'],
      usage_count: 5678,
      last_used: '2024-01-15 12:15:00',
      expires_at: '2025-01-01',
      status: 'active',
      created_by: 'billing_team@yesrasew.com'
    },
    {
      id: 3,
      name: 'SendGrid API Key',
      service: 'SendGrid Email Service',
      key_type: 'api_key',
      permissions: ['read', 'write'],
      usage_count: 23456,
      last_used: '2024-01-15 16:20:00',
      expires_at: '2024-06-30',
      status: 'active',
      created_by: 'marketing_team@yesrasew.com'
    }
  ];

  const integrationMetrics = [
    {
      id: 1,
      metric: 'Active Integrations',
      value: 4,
      change: '+1',
      trend: 'up',
      status: 'good'
    },
    {
      id: 2,
      metric: 'Total API Calls Today',
      value: 45678,
      change: '+15.2%',
      trend: 'up',
      status: 'good'
    },
    {
      id: 3,
      metric: 'Success Rate',
      value: '97.8%',
      change: '+0.5%',
      trend: 'up',
      status: 'good'
    },
    {
      id: 4,
      metric: 'Failed Webhooks',
      value: 3,
      change: '-2',
      trend: 'down',
      status: 'warning'
    }
  ];

  const filteredIntegrations = integrations.filter(integration => {
    const matchesSearch = integration.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      integration.provider.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || integration.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && integration.category === 'marketing') ||
      (activeTab === 2 && integration.category === 'billing') ||
      (activeTab === 3 && integration.category === 'infrastructure');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'inactive': return 'default';
      case 'failed': return 'error';
      case 'pending': return 'warning';
      default: return 'default';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'info';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'analytics': return <Assessment sx={{ fontSize: 20 }} />;
      case 'payment': return <Payments sx={{ fontSize: 20 }} />;
      case 'communication': return <Message sx={{ fontSize: 20 }} />;
      case 'storage': return <Cloud sx={{ fontSize: 20 }} />;
      case 'crm': return <Business sx={{ fontSize: 20 }} />;
      default: return <Hub sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (integrationId) => {
    setSelectedItems(prev =>
      prev.includes(integrationId)
        ? prev.filter(id => id !== integrationId)
        : [...prev, integrationId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleTestIntegration = (integrationId) => {
    
  };

  const handleSyncIntegration = (integrationId) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Integration Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Code />} onClick={() => setConfigDialog(true)}>
            API Keys
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setIntegrationDialog(true)}>
            Add Integration
          </Button>
        </Box>
      </Box>

      {/* Failed Integration Alert */}
      {integrations.filter(integration => integration.status === 'failed').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{integrations.filter(integration => integration.status === 'failed').length} integrations</strong> have failed. Review and resolve issues.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Hub sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">4</Typography>
              <Typography variant="body2" color="text.secondary">Active Integrations</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Api sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">45,678</Typography>
              <Typography variant="body2" color="text.secondary">API Calls Today</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">97.8%</Typography>
              <Typography variant="body2" color="text.secondary">Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Sync sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">3</Typography>
              <Typography variant="body2" color="text.secondary">Failed Webhooks</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Integration Metrics Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Integration Metrics
          </Typography>
          <Grid container spacing={2}>
            {integrationMetrics.map((metric) => (
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

      {/* Tabs for Integration Categories */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Integrations" />
          <Tab label="Marketing" />
          <Tab label="Billing" />
          <Tab label="Infrastructure" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search integrations..."
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
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('test')}>
                      Test Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('sync')}>
                      Sync Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('disable')}>
                      Disable Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Integrations Table */}
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
                          setSelectedItems(filteredIntegrations.map(integration => integration.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Integration</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Provider</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Data Points</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredIntegrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(integration.id)}
                        onChange={() => handleItemSelect(integration.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {integration.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {integration.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(integration.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {integration.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {integration.provider}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        v{integration.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={integration.priority}
                        color={getPriorityColor(integration.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={integration.status}
                        color={getStatusColor(integration.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {integration.last_sync.split(' ')[0]}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {integration.sync_frequency}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {integration.data_points.toLocaleString()}
                      </Typography>
                      {integration.error_count > 0 && (
                        <Typography variant="caption" color="error">
                          {integration.error_count} errors
                        </Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Test Connection">
                          <IconButton size="small" color="success" onClick={() => handleTestIntegration(integration.id)}>
                            <PlayArrow />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Sync Now">
                          <IconButton size="small" color="info" onClick={() => handleSyncIntegration(integration.id)}>
                            <Sync />
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

      {/* Webhooks Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Webhook Configurations
          </Typography>
          <List>
            {webhooks.map((webhook) => (
              <ListItem key={webhook.id} divider>
                <ListItemIcon>
                  {webhook.status === 'active' ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : (
                    <Error sx={{ color: 'error.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={webhook.name}
                  secondary={`${webhook.event_type} • ${webhook.method} • Success: ${webhook.success_rate}%`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={webhook.status}
                      color={getStatusColor(webhook.status)}
                      size="small"
                    />
                    <Tooltip title="View Details">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* API Keys Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            API Keys Management
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Key Name</TableCell>
                  <TableCell>Service</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiKeys.map((apiKey) => (
                  <TableRow key={apiKey.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {apiKey.name}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {apiKey.service}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={apiKey.key_type.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {apiKey.usage_count.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {apiKey.last_used.split(' ')[0]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={apiKey.status}
                        color={getStatusColor(apiKey.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Regenerate Key">
                          <IconButton size="small" color="warning">
                            <Refresh />
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

      {/* Add Integration Dialog */}
      <Dialog open={integrationDialog} onClose={() => setIntegrationDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add New Integration</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure and connect a new third-party service integration.
          </Typography>
          {/* Add integration form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setIntegrationDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Integration</Button>
        </DialogActions>
      </Dialog>

      {/* API Keys Dialog */}
      <Dialog open={configDialog} onClose={() => setConfigDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>API Keys Management</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Manage API keys for all integrated services and third-party applications.
          </Typography>
          {/* API keys management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfigDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationScreen;

