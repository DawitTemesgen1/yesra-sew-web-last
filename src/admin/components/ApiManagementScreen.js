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
  Add, Api, Code, Key, Security, Settings, Assessment,
  FilterList, ExpandMore, Warning, Error, Info,
  Timeline, DataObject, Cloud, Sync, Lock, LockOpen,
  Https, Public, Private, Group, Person, Business,
  Speed, Memory, Storage, Schedule, History,
  FileCopy, Download, Upload, Share, Monitor, Smartphone
} from '@mui/icons-material';

const ApiManagementScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [keyDialog, setKeyDialog] = useState(false);
  const [endpointDialog, setEndpointDialog] = useState(false);

  const apiKeys = [
    {
      id: 1,
      name: 'Production API Key',
      key: 'ak_live_1234567890abcdef1234567890abcdef',
      type: 'production',
      status: 'active',
      created_at: '2024-01-01',
      expires_at: '2024-12-31',
      last_used: '2024-01-15 14:30:25',
      usage_count: 15420,
      rate_limit: 1000,
      permissions: ['read', 'write'],
      allowed_ips: ['192.168.1.0/24'],
      created_by: 'admin@yesrasew.com'
    },
    {
      id: 2,
      name: 'Development API Key',
      key: 'ak_test_0987654321fedcba0987654321fedcba',
      type: 'development',
      status: 'active',
      created_at: '2024-01-05',
      expires_at: '2024-06-30',
      last_used: '2024-01-15 12:15:10',
      usage_count: 890,
      rate_limit: 100,
      permissions: ['read'],
      allowed_ips: ['127.0.0.1'],
      created_by: 'developer@yesrasew.com'
    },
    {
      id: 3,
      name: 'Mobile App API Key',
      key: 'ak_mobile_56789012345678905678901234567890',
      type: 'mobile',
      status: 'active',
      created_at: '2023-12-15',
      expires_at: '2024-12-15',
      last_used: '2024-01-15 16:20:45',
      usage_count: 23456,
      rate_limit: 500,
      permissions: ['read', 'write'],
      allowed_ips: ['*'],
      created_by: 'admin@yesrasew.com'
    },
    {
      id: 4,
      name: 'Partner Integration Key',
      key: 'ak_partner_abcdef1234567890abcdef12345678',
      type: 'partner',
      status: 'suspended',
      created_at: '2023-11-01',
      expires_at: '2024-11-01',
      last_used: '2024-01-10 09:30:15',
      usage_count: 4567,
      rate_limit: 200,
      permissions: ['read'],
      allowed_ips: ['203.0.113.0/24'],
      created_by: 'admin@yesrasew.com'
    },
    {
      id: 5,
      name: 'Analytics API Key',
      key: 'ak_analytics_1234567890abcdef1234567890abcd',
      type: 'analytics',
      status: 'expired',
      created_at: '2023-06-01',
      expires_at: '2024-01-01',
      last_used: '2023-12-31 23:59:59',
      usage_count: 1234,
      rate_limit: 50,
      permissions: ['read'],
      allowed_ips: ['*'],
      created_by: 'admin@yesrasew.com'
    }
  ];

  const apiEndpoints = [
    {
      id: 1,
      path: '/api/v1/listings',
      method: 'GET',
      status: 'active',
      description: 'Retrieve all listings with optional filters',
      version: 'v1',
      authentication: 'required',
      rate_limit: 1000,
      response_time_ms: 125,
      success_rate: 99.5,
      daily_calls: 4567,
      parameters: ['page', 'limit', 'category', 'location']
    },
    {
      id: 2,
      path: '/api/v1/listings',
      method: 'POST',
      status: 'active',
      description: 'Create a new listing',
      version: 'v1',
      authentication: 'required',
      rate_limit: 100,
      response_time_ms: 250,
      success_rate: 98.2,
      daily_calls: 234,
      parameters: ['title', 'description', 'category', 'price']
    },
    {
      id: 3,
      path: '/api/v1/users',
      method: 'GET',
      status: 'active',
      description: 'Get user profile information',
      version: 'v1',
      authentication: 'required',
      rate_limit: 500,
      response_time_ms: 95,
      success_rate: 99.8,
      daily_calls: 789,
      parameters: ['user_id', 'include_profile']
    },
    {
      id: 4,
      path: '/api/v1/search',
      method: 'GET',
      status: 'active',
      description: 'Search listings with advanced filters',
      version: 'v1',
      authentication: 'optional',
      rate_limit: 2000,
      response_time_ms: 180,
      success_rate: 99.1,
      daily_calls: 12345,
      parameters: ['query', 'category', 'location', 'price_range']
    },
    {
      id: 5,
      path: '/api/v1/analytics',
      method: 'GET',
      status: 'deprecated',
      description: 'Get platform analytics (deprecated)',
      version: 'v1',
      authentication: 'required',
      rate_limit: 50,
      response_time_ms: 450,
      success_rate: 95.2,
      daily_calls: 12,
      parameters: ['date_range', 'metrics']
    }
  ];

  const apiUsage = [
    {
      id: 1,
      metric: 'Total API Calls',
      value: '45,678',
      change: '+15.2%',
      trend: 'up',
      date_range: 'Last 30 days'
    },
    {
      id: 2,
      metric: 'Average Response Time',
      value: '156 ms',
      change: '-8.5%',
      trend: 'down',
      date_range: 'Last 30 days'
    },
    {
      id: 3,
      metric: 'Success Rate',
      value: '98.9%',
      change: '+0.3%',
      trend: 'up',
      date_range: 'Last 30 days'
    },
    {
      id: 4,
      metric: 'Active API Keys',
      value: 12,
      change: '+2',
      trend: 'up',
      date_range: 'Current'
    }
  ];

  const apiLogs = [
    {
      id: 1,
      timestamp: '2024-01-15 14:30:25',
      method: 'GET',
      endpoint: '/api/v1/listings',
      status_code: 200,
      response_time_ms: 125,
      api_key: 'ak_live_1234567890abcdef',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (compatible; MyApp/1.0)',
      request_size_bytes: 1024,
      response_size_bytes: 8192
    },
    {
      id: 2,
      timestamp: '2024-01-15 14:28:15',
      method: 'POST',
      endpoint: '/api/v1/listings',
      status_code: 201,
      response_time_ms: 250,
      api_key: 'ak_live_1234567890abcdef',
      ip_address: '192.168.1.101',
      user_agent: 'curl/7.68.0',
      request_size_bytes: 2048,
      response_size_bytes: 512
    },
    {
      id: 3,
      timestamp: '2024-01-15 14:25:45',
      method: 'GET',
      endpoint: '/api/v1/search',
      status_code: 200,
      response_time_ms: 180,
      api_key: 'ak_mobile_5678901234567890',
      ip_address: '203.0.113.45',
      user_agent: 'MyApp/2.0 (Android)',
      request_size_bytes: 512,
      response_size_bytes: 16384
    },
    {
      id: 4,
      timestamp: '2024-01-15 14:22:30',
      method: 'GET',
      endpoint: '/api/v1/users',
      status_code: 401,
      response_time_ms: 45,
      api_key: 'invalid_key',
      ip_address: '198.51.100.22',
      user_agent: 'Python/3.8 requests/2.25.1',
      request_size_bytes: 256,
      response_size_bytes: 128
    },
    {
      id: 5,
      timestamp: '2024-01-15 14:20:12',
      method: 'DELETE',
      endpoint: '/api/v1/listings/12345',
      status_code: 204,
      response_time_ms: 95,
      api_key: 'ak_live_1234567890abcdef',
      ip_address: '192.168.1.100',
      user_agent: 'Mozilla/5.0 (compatible; AdminPanel/1.0)',
      request_size_bytes: 64,
      response_size_bytes: 0
    }
  ];

  const filteredKeys = apiKeys.filter(key => {
    const matchesSearch = key.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      key.type.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || key.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && key.type === 'production') ||
      (activeTab === 2 && key.type === 'development') ||
      (activeTab === 3 && key.type === 'mobile');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'suspended': return 'warning';
      case 'expired': return 'error';
      case 'deprecated': return 'default';
      default: return 'default';
    }
  };

  const getMethodColor = (method) => {
    switch (method) {
      case 'GET': return 'success';
      case 'POST': return 'info';
      case 'PUT': return 'warning';
      case 'DELETE': return 'error';
      default: return 'default';
    }
  };

  const getKeyIcon = (type) => {
    switch (type) {
      case 'production': return <Business sx={{ fontSize: 20 }} />;
      case 'development': return <Code sx={{ fontSize: 20 }} />;
      case 'mobile': return <Smartphone sx={{ fontSize: 20 }} />;
      case 'partner': return <Group sx={{ fontSize: 20 }} />;
      case 'analytics': return <Assessment sx={{ fontSize: 20 }} />;
      default: return <Key sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (keyId) => {
    setSelectedItems(prev =>
      prev.includes(keyId)
        ? prev.filter(id => id !== keyId)
        : [...prev, keyId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRegenerateKey = (keyId) => {
    
  };

  const handleSuspendKey = (keyId) => {
    
  };

  const handleActivateKey = (keyId) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          API Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Code />} onClick={() => setEndpointDialog(true)}>
            Manage Endpoints
          </Button>
          <Button variant="contained" startIcon={<Key />} onClick={() => setKeyDialog(true)}>
            Generate API Key
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Api sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">45,678</Typography>
              <Typography variant="body2" color="text.secondary">Total API Calls</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">156 ms</Typography>
              <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">98.9%</Typography>
              <Typography variant="body2" color="text.secondary">Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Key sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">12</Typography>
              <Typography variant="body2" color="text.secondary">Active Keys</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* API Usage Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            API Usage Overview
          </Typography>
          <Grid container spacing={2}>
            {apiUsage.map((usage) => (
              <Grid item xs={12} sm={6} md={3} key={usage.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {usage.value}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {usage.metric}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={usage.change}
                      color={usage.trend === 'up' ? 'success' : 'error'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {usage.date_range}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Key Types */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Keys" />
          <Tab label="Production" />
          <Tab label="Development" />
          <Tab label="Mobile" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search API keys..."
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
                  <MenuItem value="expired">Expired</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('activate')}>
                      Activate Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('suspend')}>
                      Suspend Selected
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

      {/* API Keys Table */}
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
                          setSelectedItems(filteredKeys.map(key => key.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>API Key</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Usage</TableCell>
                  <TableCell>Rate Limit</TableCell>
                  <TableCell>Expires</TableCell>
                  <TableCell>Last Used</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredKeys.map((key) => (
                  <TableRow key={key.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(key.id)}
                        onChange={() => handleItemSelect(key.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {key.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontFamily: 'monospace' }}>
                          {key.key.substring(0, 20)}...
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getKeyIcon(key.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {key.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={key.status}
                        color={getStatusColor(key.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {key.usage_count.toLocaleString()}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          calls
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {key.rate_limit}/hour
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {key.expires_at}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {key.last_used}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Regenerate Key">
                          <IconButton size="small" color="warning" onClick={() => handleRegenerateKey(key.id)}>
                            <Sync />
                          </IconButton>
                        </Tooltip>
                        {key.status === 'active' ? (
                          <Tooltip title="Suspend Key">
                            <IconButton size="small" color="warning" onClick={() => handleSuspendKey(key.id)}>
                              <Lock />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Activate Key">
                            <IconButton size="small" color="success" onClick={() => handleActivateKey(key.id)}>
                              <LockOpen />
                            </IconButton>
                          </Tooltip>
                        )}
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* API Endpoints Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            API Endpoints
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Daily Calls</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiEndpoints.map((endpoint) => (
                  <TableRow key={endpoint.id}>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {endpoint.path}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {endpoint.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={endpoint.method}
                        color={getMethodColor(endpoint.method)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={endpoint.status}
                        color={getStatusColor(endpoint.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {endpoint.response_time_ms} ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {endpoint.success_rate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {endpoint.daily_calls.toLocaleString()}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* API Logs Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent API Logs
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Method</TableCell>
                  <TableCell>Endpoint</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Response Time</TableCell>
                  <TableCell>API Key</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {apiLogs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>
                      <Typography variant="body2">
                        {log.timestamp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.method}
                        color={getMethodColor(log.method)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.endpoint}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={log.status_code}
                        color={log.status_code >= 200 && log.status_code < 300 ? 'success' : 'error'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.response_time_ms} ms
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                        {log.api_key.substring(0, 12)}...
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {log.ip_address}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Generate API Key Dialog */}
      <Dialog open={keyDialog} onClose={() => setKeyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate New API Key</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create a new API key with custom permissions and restrictions.
          </Typography>
          {/* Generate API key form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setKeyDialog(false)}>Cancel</Button>
          <Button variant="contained">Generate Key</Button>
        </DialogActions>
      </Dialog>

      {/* Manage Endpoints Dialog */}
      <Dialog open={endpointDialog} onClose={() => setEndpointDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Manage API Endpoints</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure and manage API endpoints, methods, and access controls.
          </Typography>
          {/* Endpoint management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEndpointDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ApiManagementScreen;

