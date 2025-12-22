import React, { useState, useEffect, useCallback } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, Dialog, DialogTitle, DialogContent,
  DialogActions, Badge, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, Alert
} from '@mui/material';
import {
  Search, Refresh, Visibility, CheckCircle,
  Policy, Security, Report, Flag, ThumbUp, ThumbDown,
  Person, Comment, Image, Article, Link
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const ContentModerationScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm: parentSetSearchTerm, filterStatus, setFilterStatus: parentSetFilterStatus }) => {
  const [reports, setReports] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilterStatus, setLocalFilterStatus] = useState('all');
  const [rulesDialog, setRulesDialog] = useState(false);

  // Use parent props if available, else local state
  const effectiveSearchTerm = searchTerm !== undefined ? searchTerm : localSearchTerm;
  const setEffectiveSearchTerm = parentSetSearchTerm || setLocalSearchTerm;
  const effectiveFilterStatus = filterStatus !== undefined ? filterStatus : localFilterStatus;
  const setEffectiveFilterStatus = parentSetFilterStatus || setLocalFilterStatus;

  // Hardcoded rules for now
  const [moderationRules] = useState([
    {
      id: 1, name: 'No Inappropriate Language', category: 'content', type: 'automatic',
      severity: 'medium', action: 'flag_for_review', status: 'active', matches_count: 45, last_triggered: '2024-01-15 12:15'
    },
    {
      id: 2, name: 'Duplicate Listings Detection', category: 'listings', type: 'automatic',
      severity: 'low', action: 'flag_for_review', status: 'active', matches_count: 12, last_triggered: '2024-01-14 09:30'
    },
    {
      id: 3, name: 'Spam Detection', category: 'content', type: 'automatic',
      severity: 'high', action: 'auto_reject', status: 'active', matches_count: 89, last_triggered: '2024-01-15 14:30'
    }
  ]);

  const fetchReports = useCallback(async () => {
    try {
      setLoading(true);
      const data = await adminService.getReports();
      setReports(data || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      toast.error('Failed to load reports');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  useEffect(() => {
    if (refreshing) fetchReports();
  }, [refreshing, fetchReports]);

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminService.updateReportStatus(id, status);
      toast.success(`Report marked as ${status}`);
      fetchReports();
    } catch (error) {
      toast.error('Failed to update report');
    }
  };

  const handleApprove = (id) => handleUpdateStatus(id, 'resolved');
  const handleReject = (id) => handleUpdateStatus(id, 'rejected');

  const filteredReports = reports.filter(report => {
    const sTerm = effectiveSearchTerm || '';
    // Adapt to flexible schema (some reports might rely on joined data)
    const titleMatch = (report.title || report.content_id || '').toLowerCase().includes(sTerm.toLowerCase());
    const reasonMatch = (report.reason || '').toLowerCase().includes(sTerm.toLowerCase());

    // Status Filter
    const matchesFilter = effectiveFilterStatus === 'all' || report.status === effectiveFilterStatus;

    // Tab Filter
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && report.status === 'pending') ||
      (activeTab === 2 && report.status === 'under_review') ||
      (activeTab === 3 && (report.status === 'resolved' || report.status === 'rejected'));

    return (titleMatch || reasonMatch) && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'under_review': return 'info';
      case 'resolved': return 'success';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'error';
      case 'medium': return 'warning';
      case 'low': return 'success';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'listing': return <Article sx={{ fontSize: 20 }} />;
      case 'comment': return <Comment sx={{ fontSize: 20 }} />;
      case 'user_profile': return <Person sx={{ fontSize: 20 }} />;
      case 'image': return <Image sx={{ fontSize: 20 }} />;
      case 'link': return <Link sx={{ fontSize: 20 }} />;
      default: return <Report sx={{ fontSize: 20 }} />;
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleItemSelect = (id) => {
    setSelectedItems(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const handleBulkAction = (action) => {
    // Stub for bulk action
    toast('Bulk actions coming soon');
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Content Moderation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Policy />} onClick={() => setRulesDialog(true)}>
            Manage Rules
          </Button>
          <Button variant="contained" startIcon={<Security />} onClick={fetchReports}>
            Review Queue
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Report sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {reports.filter(r => r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Pending Reviews</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: '#F44336', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {reports.filter(r => r.severity === 'high' && r.status === 'pending').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">High Priority</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {reports.filter(r => r.status === 'resolved').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Resolved</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Visibility sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{reports.length}</Typography>
              <Typography variant="body2" color="text.secondary">Total Reports</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Reports" />
          <Tab label="Pending" />
          <Tab label="Under Review" />
          <Tab label="Resolved / History" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search reports..."
                value={effectiveSearchTerm}
                onChange={(e) => setEffectiveSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <Search sx={{ mr: 1 }} /> }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth size="small">
                <InputLabel>Status</InputLabel>
                <Select
                  value={effectiveFilterStatus}
                  label="Status"
                  onChange={(e) => setEffectiveFilterStatus(e.target.value)}
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="under_review">Under Review</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="rejected">Rejected</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchReports} disabled={loading}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <Button variant="contained" color="success" onClick={() => handleBulkAction('approve')}>
                    Bulk Action
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Main Table */}
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
                          setSelectedItems(filteredReports.map(report => report.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Content ID/Title</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Reporter</TableCell>
                  <TableCell>Reason</TableCell>
                  <TableCell>Severity</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Reported At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredReports.map((report) => (
                  <TableRow key={report.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(report.id)}
                        onChange={() => handleItemSelect(report.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {report.title || 'Untitled'}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          ID: {report.content_id}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(report.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {report.type?.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{report.reporter || 'System'}</TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {report.reason?.replace('_', ' ')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {report.description}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.severity || 'low'}
                        color={getSeverityColor(report.severity)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={report.status?.replace('_', ' ')}
                        color={getStatusColor(report.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{new Date(report.created_at || Date.now()).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="success" onClick={() => handleApprove(report.id)} disabled={report.status === 'resolved'}>
                          <ThumbUp />
                        </IconButton>
                        <IconButton size="small" color="error" onClick={() => handleReject(report.id)} disabled={report.status === 'rejected'}>
                          <ThumbDown />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredReports.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={9} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">No reports found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Rules Dialog */}
      <Dialog open={rulesDialog} onClose={() => setRulesDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Moderation Rules (Coming Soon)</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>Automated rules engine is under development.</Alert>
          <List>
            {moderationRules.map((rule) => (
              <ListItem key={rule.id} divider>
                <ListItemIcon>
                  <Policy color="primary" />
                </ListItemIcon>
                <ListItemText
                  primary={rule.name}
                  secondary={`${rule.category} • ${rule.type}`}
                />
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRulesDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ContentModerationScreen;

