import React, { useState, useEffect } from 'react';
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
  Add, Security, Shield, Lock, Key, Password, Warning, Error,
  Block, Person, Devices, Router, Wifi, Email, Phone,
  Timeline, Assessment, FilterList, ExpandMore,
  Verified, Pending, Info, Schedule, History,
  Fingerprint, Face, SecurityUpdate, GppGood, GppBad,
  AdminPanelSettings, Privacy, Cookie, DataObject, LockOpen
} from '@mui/icons-material';
import adminService from '../../services/adminService';


const SecurityScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [policyDialog, setPolicyDialog] = useState(false);
  const [threatDialog, setThreatDialog] = useState(false);

  // State for security data - will be fetched from Supabase
  const [securityEvents, setSecurityEvents] = useState([]);
  const [securityPolicies, setSecurityPolicies] = useState([]);
  const [securityMetrics, setSecurityMetrics] = useState({
    securityScore: '0%',
    failedAttempts: 0,
    blockedIPs: 0,
    incidents: 0
  });
  const [activeThreats, setActiveThreats] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch security data from Supabase
  useEffect(() => {
    const fetchSecurityData = async () => {
      try {
        setLoading(true);

        // Fetch security logs/events
        const events = await adminService.getSecurityLogs();
        setSecurityEvents(events || []);

        // Calculate metrics from events
        const failedAttempts = events?.filter(e => e.type === 'login_attempt' && e.status === 'failed').length || 0;
        const blockedIPs = new Set(events?.filter(e => e.status === 'blocked').map(e => e.ip_address)).size || 0;
        const incidents = events?.filter(e => e.severity === 'high' || e.severity === 'critical').length || 0;

        setSecurityMetrics({
          securityScore: '0%', // TODO: Calculate security score from policies and events
          failedAttempts,
          blockedIPs,
          incidents
        });

        // TODO: Fetch security policies and active threats when tables are ready
        setSecurityPolicies([]);
        setActiveThreats([]);

      } catch (error) {
        console.error('Error fetching security data:', error);
        setSecurityEvents([]);
        setSecurityPolicies([]);
        setActiveThreats([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSecurityData();
  }, []);

  const filteredEvents = securityEvents.filter(event => {
    const matchesSearch = event.type.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      event.description.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || event.severity === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && event.severity === 'high') ||
      (activeTab === 2 && event.severity === 'medium') ||
      (activeTab === 3 && event.severity === 'low');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return 'error';
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      case 'info': return 'info';
      default: return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'blocked': return 'error';
      case 'failed': return 'error';
      case 'success': return 'success';
      case 'resolved': return 'success';
      case 'partial': return 'warning';
      default: return 'default';
    }
  };

  const getEventIcon = (type) => {
    switch (type) {
      case 'login_attempt': return <Person sx={{ fontSize: 20 }} />;
      case 'password_change': return <Password sx={{ fontSize: 20 }} />;
      case 'suspicious_activity': return <Warning sx={{ fontSize: 20 }} />;
      case 'account_locked': return <Lock sx={{ fontSize: 20 }} />;
      case 'data_access': return <DataObject sx={{ fontSize: 20 }} />;
      default: return <Security sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (eventId) => {
    setSelectedItems(prev =>
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleBlockIP = (ipAddress) => {
    
  };

  const handleUnlockAccount = (userId) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Security Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Shield />} onClick={() => setPolicyDialog(true)}>
            Security Policies
          </Button>
          <Button variant="contained" startIcon={<SecurityUpdate />} onClick={() => setThreatDialog(true)}>
            Threat Detection
          </Button>
        </Box>
      </Box>

      {/* Security Alert */}
      {activeThreats.filter(threat => threat.severity === 'critical').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{activeThreats.filter(threat => threat.severity === 'critical').length} critical threats</strong> detected! Immediate action required.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{securityMetrics.securityScore}</Typography>
              <Typography variant="body2" color="text.secondary">Security Score</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Error sx={{ fontSize: 40, color: '#F44336', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{securityMetrics.incidents}</Typography>
              <Typography variant="body2" color="text.secondary">Security Incidents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Block sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{securityMetrics.blockedIPs}</Typography>
              <Typography variant="body2" color="text.secondary">Blocked IPs</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <GppGood sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{securityMetrics.failedAttempts}</Typography>
              <Typography variant="body2" color="text.secondary">Failed Attempts</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Active Threats Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Active Threats
          </Typography>
          <List>
            {activeThreats.map((threat) => (
              <ListItem key={threat.id} divider>
                <ListItemIcon>
                  {threat.severity === 'critical' ? (
                    <Error sx={{ color: 'error.main' }} />
                  ) : threat.severity === 'high' ? (
                    <Warning sx={{ color: 'warning.main' }} />
                  ) : (
                    <Info sx={{ color: 'info.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={threat.type.replace('_', ' ').toUpperCase()}
                  secondary={`${threat.description} • Source: ${threat.source_ip} • Attempts: ${threat.attempts}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={threat.severity}
                      color={getSeverityColor(threat.severity)}
                      size="small"
                    />
                    <Chip
                      label={threat.status}
                      color={getStatusColor(threat.status)}
                      size="small"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Tabs for Event Severity */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Events" />
          <Tab label="High Severity" />
          <Tab label="Medium Severity" />
          <Tab label="Low Severity" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search security events..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Severity</InputLabel>
                <Select
                  value={filterStatus}
                  label="Severity"
                  onChange={(e) => setFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Severity</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                  <MenuItem value="high">High</MenuItem>
                  <MenuItem value="medium">Medium</MenuItem>
                  <MenuItem value="low">Low</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('resolve')}>
                      Mark Resolved
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('investigate')}>
                      Investigate
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Security Events Table */}
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
                          setSelectedItems(filteredEvents.map(event => event.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Event</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredEvents.map((event) => (
                  <TableRow key={event.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(event.id)}
                        onChange={() => handleItemSelect(event.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getEventIcon(event.type)}
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {event.type.replace('_', ' ').toUpperCase()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {event.description}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.user}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.ip_address}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.location}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {event.device}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.severity}
                        color={getSeverityColor(event.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={event.status}
                        color={getStatusColor(event.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {event.timestamp}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {event.type === 'suspicious_activity' && (
                          <Tooltip title="Block IP">
                            <IconButton size="small" color="error" onClick={() => handleBlockIP(event.ip_address)}>
                              <Block />
                            </IconButton>
                          </Tooltip>
                        )}
                        {event.type === 'account_locked' && (
                          <Tooltip title="Unlock Account">
                            <IconButton size="small" color="success" onClick={() => handleUnlockAccount(event.user)}>
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

      {/* Security Policies Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Security Policies
          </Typography>
          <List>
            {securityPolicies.map((policy) => (
              <ListItem key={policy.id} divider>
                <ListItemIcon>
                  {policy.status === 'active' ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : (
                    <Pending sx={{ color: 'warning.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={policy.name}
                  secondary={`${policy.description} • Compliance: ${policy.compliance_rate}% • Violations: ${policy.violations}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={policy.enforcement_level}
                      color={policy.enforcement_level === 'strict' ? 'error' : 'warning'}
                      size="small"
                    />
                    <Chip
                      label={policy.status}
                      color={getStatusColor(policy.status)}
                      size="small"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Security Policies Dialog */}
      <Dialog open={policyDialog} onClose={() => setPolicyDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Security Policies Management</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure and manage security policies and enforcement levels.
          </Typography>
          {/* Security policies management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Threat Detection Dialog */}
      <Dialog open={threatDialog} onClose={() => setThreatDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Threat Detection & Response</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Monitor and respond to security threats in real-time.
          </Typography>
          {/* Threat detection configuration here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setThreatDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SecurityScreen;

