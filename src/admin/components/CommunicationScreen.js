import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert, CircularProgress
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete,
  Add, Email, Send, Schedule,
  Campaign, Notifications,
  Sms, Mail
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const CommunicationScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm: parentSetSearchTerm, filterStatus, setFilterStatus: parentSetFilterStatus }) => {
  const [communications, setCommunications] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [composeDialog, setComposeDialog] = useState(false);
  const [templateDialog, setTemplateDialog] = useState(false);

  // Local state for filters if not provided by parent
  const [localSearchTerm, setLocalSearchTerm] = useState('');
  const [localFilterStatus, setLocalFilterStatus] = useState('all');

  const effectiveSearchTerm = searchTerm !== undefined ? searchTerm : localSearchTerm;
  const setEffectiveSearchTerm = parentSetSearchTerm || setLocalSearchTerm;
  const effectiveFilterStatus = filterStatus !== undefined ? filterStatus : localFilterStatus;
  const setEffectiveFilterStatus = parentSetFilterStatus || setLocalFilterStatus;

  const fetchData = async () => {
    try {
      setLoading(true);
      const [commsData, templatesData] = await Promise.all([
        adminService.getCommunications(),
        adminService.getCommunicationTemplates()
      ]);
      setCommunications(commsData || []);
      setTemplates(templatesData || []);
    } catch (error) {
      console.error('Error fetching communication data:', error);
      toast.error('Failed to load communication data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    if (refreshing) fetchData();
  }, [refreshing]);

  const filteredCommunications = communications.filter(comm => {
    const sTerm = effectiveSearchTerm || '';
    const subjectMatch = (comm.subject || '').toLowerCase().includes(sTerm.toLowerCase());
    const recipientMatch = (comm.recipient || '').toLowerCase().includes(sTerm.toLowerCase());

    // Status Filter
    const matchesFilter = effectiveFilterStatus === 'all' || comm.status === effectiveFilterStatus;

    // Tab Filter (0: All, 1: Email, 2: SMS, 3: Notification)
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && comm.type === 'email') ||
      (activeTab === 2 && comm.type === 'sms') ||
      (activeTab === 3 && comm.type === 'notification');

    return (subjectMatch || recipientMatch) && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'sent': return 'success';
      case 'scheduled': return 'warning';
      case 'draft': return 'info';
      case 'failed': return 'error';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'email': return <Email sx={{ fontSize: 20 }} />;
      case 'sms': return <Sms sx={{ fontSize: 20 }} />;
      case 'notification': return <Notifications sx={{ fontSize: 20 }} />;
      default: return <Mail sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (commId) => {
    setSelectedItems(prev => prev.includes(commId) ? prev.filter(id => id !== commId) : [...prev, commId]);
  };

  const handleBulkAction = async (action) => {
    // Placeholder for bulk actions
    if (action === 'delete') {
      if (!window.confirm('Are you sure?')) return;
      // Implement bulk delete loop
      try {
        for (const id of selectedItems) {
          await adminService.deleteCommunication(id);
        }
        toast.success('Deleted selected');
        fetchData();
        setSelectedItems([]);
      } catch (e) {
        toast.error('Failed to delete some items');
      }
    } else {
      toast('Bulk action not implemented yet');
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Communication Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Add />} onClick={() => setTemplateDialog(true)}>
            Manage Templates
          </Button>
          <Button variant="contained" startIcon={<Send />} onClick={() => setComposeDialog(true)}>
            Compose Message
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Email sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">
                {communications.filter(c => c.status === 'sent').length}
              </Typography>
              <Typography variant="body2" color="text.secondary">Total Sent</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Campaign sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{templates.length}</Typography>
              <Typography variant="body2" color="text.secondary">Active Templates</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Search & Filter */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                size="small"
                placeholder="Search subject or recipient..."
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
                  <MenuItem value="sent">Sent</MenuItem>
                  <MenuItem value="scheduled">Scheduled</MenuItem>
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="failed">Failed</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={fetchData} disabled={loading}>
                  Refresh
                </Button>
                {selectedItems.length > 0 && (
                  <Button variant="contained" color="error" onClick={() => handleBulkAction('delete')}>
                    Delete Selected
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Communications" />
          <Tab label="Email" />
          <Tab label="SMS" />
          <Tab label="Notifications" />
        </Tabs>
      </Card>

      {/* Communications Table */}
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
                          setSelectedItems(filteredCommunications.map(comm => comm.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Subject</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Recipient</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Sent At</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCommunications.map((comm) => (
                  <TableRow key={comm.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(comm.id)}
                        onChange={() => handleItemSelect(comm.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {comm.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {comm.category}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(comm.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {comm.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>{comm.recipient}</TableCell>
                    <TableCell>
                      <Chip
                        label={comm.status}
                        color={getStatusColor(comm.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {comm.scheduled ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Schedule sx={{ fontSize: 16, color: 'warning.main' }} />
                          <Typography variant="body2">{new Date(comm.sent_at).toLocaleDateString()}</Typography>
                        </Box>
                      ) : (
                        <Typography variant="body2">{comm.sent_at ? new Date(comm.sent_at).toLocaleDateString() : '-'}</Typography>
                      )}
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color="primary">
                          <Visibility />
                        </IconButton>
                        <IconButton size="small" color="error">
                          <Delete />
                        </IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredCommunications.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} align="center">
                      <Typography sx={{ py: 3 }} color="text.secondary">No communications found</Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Templates Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Communication Templates
          </Typography>
          <List>
            {templates.map((template) => (
              <ListItem key={template.id} divider>
                <ListItemIcon>
                  {getTypeIcon(template.type)}
                </ListItemIcon>
                <ListItemText
                  primary={template.name}
                  secondary={`${template.category || 'General'} • ${template.status}`}
                />
                <ListItemSecondaryAction>
                  <IconButton size="small" color="success">
                    <Edit />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
            {templates.length === 0 && (
              <Typography color="text.secondary" sx={{ p: 2, textAlign: 'center' }}>No templates found</Typography>
            )}
          </List>
        </CardContent>
      </Card>

      {/* Compose Message Dialog */}
      <Dialog open={composeDialog} onClose={() => setComposeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Compose New Message (Coming Soon)</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Messaging functionality is being connected to the backend notification service.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>

      {/* Template Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Manage Templates (Coming Soon)</DialogTitle>
        <DialogContent>
          <Alert severity="info" sx={{ mt: 2 }}>
            Template editor is under construction.
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationScreen;

