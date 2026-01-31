
import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Dialog, DialogTitle, DialogContent,
  DialogActions, Tabs, Tab, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert, CircularProgress,
  Stack, Checkbox, FormControlLabel, FormGroup, Divider, Tooltip
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete,
  Add, Email, Send, Schedule,
  Campaign, Notifications,
  Sms, Mail, Groups, FilterList, NoteAdd, ContentCopy
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
  const [plans, setPlans] = useState([]);

  // Campaign Form State
  const [campaignForm, setCampaignForm] = useState({
    subject: '',
    message: '',
    targetType: 'all', // all, filtered
    filterPlan: [],
    filterRegMethod: 'all', // all, email, phone
    testEmail: ''
  });
  const [sending, setSending] = useState(false);

  // Template Form State
  const [activeTemplate, setActiveTemplate] = useState(null); // null = list mode, object = edit mode
  const [templateForm, setTemplateForm] = useState({ name: '', subject: '', body: '', type: 'email' });

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
      const [commsData, templatesData, plansData] = await Promise.all([
        adminService.getCommunications(),
        adminService.getCommunicationTemplates(),
        adminService.getMembershipPlans()
      ]);
      setCommunications(commsData || []);
      setTemplates(templatesData || []);
      setPlans(plansData || []);
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
    if (action === 'delete') {
      if (!window.confirm('Are you sure?')) return;
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

  const handleSendCampaign = async (isTest = false) => {
    if (!campaignForm.subject || !campaignForm.message) {
      toast.error('Please provide subject and message');
      return;
    }

    if (isTest && !campaignForm.testEmail) {
      toast.error('Please provide a test email');
      return;
    }

    try {
      setSending(true);
      const payload = {
        subject: campaignForm.subject,
        message: campaignForm.message,
        isTest,
        testEmail: campaignForm.testEmail,
        filters: {
          targetType: campaignForm.targetType,
          plans: campaignForm.filterPlan,
          regMethod: campaignForm.filterRegMethod
        }
      };

      const result = await adminService.sendBulkEmail(payload);

      if (result.success) {
        toast.success(isTest ? 'Test email sent' : `Campaign sent to ${result.count} users`);
        if (!isTest) {
          setComposeDialog(false);
          fetchData();
          // Reset form
          setCampaignForm(prev => ({ ...prev, subject: '', message: '' }));
        }
      } else {
        throw new Error(result.error || 'Failed to send');
      }

    } catch (error) {
      console.error('Campaign error:', error);
      toast.error('Failed to send campaign: ' + error.message);
    } finally {
      setSending(false);
    }
  };

  const handleSaveTemplate = async () => {
    try {
      if (!templateForm.name || !templateForm.subject) return toast.error('Name and Subject required');

      if (activeTemplate?.id) {
        await adminService.updateCommunicationTemplate(activeTemplate.id, templateForm);
        toast.success('Template updated');
      } else {
        await adminService.createCommunicationTemplate(templateForm);
        toast.success('Template created');
      }
      const newData = await adminService.getCommunicationTemplates();
      setTemplates(newData);
      setActiveTemplate(null); // back to list
      setTemplateForm({ name: '', subject: '', body: '', type: 'email' });
    } catch (error) {
      toast.error('Failed to save template');
    }
  };

  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Delete this template?')) return;
    try {
      await adminService.deleteCommunicationTemplate(id);
      setTemplates(prev => prev.filter(t => t.id !== id));
      toast.success('Deleted');
    } catch (e) { toast.error('Error deleting'); }
  };

  const loadTemplateIntoCampaign = (templateId) => {
    const tmpl = templates.find(t => t.id === templateId);
    if (tmpl) {
      setCampaignForm(prev => ({
        ...prev,
        subject: tmpl.subject,
        message: tmpl.body
      }));
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Communication Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<NoteAdd />} onClick={() => { setActiveTemplate(null); setTemplateDialog(true); }}>
            Manage Templates
          </Button>
          <Button variant="contained" startIcon={<Send />} onClick={() => setComposeDialog(true)}>
            New Campaign
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

      {/* Campaign Dialog */}
      <Dialog open={composeDialog} onClose={() => setComposeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Email Campaign</DialogTitle>
        <DialogContent dividers>
          <Grid container spacing={3}>
            {/* Target Audience Section */}
            <Grid item xs={12} md={4} sx={{ borderRight: { md: '1px solid #eee' } }}>
              <Typography variant="subtitle2" sx={{ mb: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
                <Groups fontSize="small" /> TARGET AUDIENCE
              </Typography>

              <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                <InputLabel>Who to send to?</InputLabel>
                <Select
                  value={campaignForm.targetType}
                  label="Who to send to?"
                  onChange={(e) => setCampaignForm({ ...campaignForm, targetType: e.target.value })}
                >
                  <MenuItem value="all">All Users</MenuItem>
                  <MenuItem value="filtered">Filter Users</MenuItem>
                </Select>
              </FormControl>

              {campaignForm.targetType === 'filtered' && (
                <Box sx={{ pl: 1, borderLeft: '2px solid #eee' }}>
                  <Typography variant="caption" fontWeight="bold">Membership Plan</Typography>
                  <FormGroup>
                    {plans.map(plan => (
                      <FormControlLabel
                        key={plan.id}
                        control={
                          <Checkbox
                            size="small"
                            checked={campaignForm.filterPlan.includes(plan.id)}
                            onChange={(e) => {
                              const newPlans = e.target.checked
                                ? [...campaignForm.filterPlan, plan.id]
                                : campaignForm.filterPlan.filter(id => id !== plan.id);
                              setCampaignForm({ ...campaignForm, filterPlan: newPlans });
                            }}
                          />
                        }
                        label={<Typography variant="caption">{plan.name}</Typography>}
                      />
                    ))}
                  </FormGroup>

                  <Divider sx={{ my: 1 }} />

                  <Typography variant="caption" fontWeight="bold">Registration Method</Typography>
                  <FormControl fullWidth size="small" sx={{ mt: 1 }}>
                    <Select
                      value={campaignForm.filterRegMethod}
                      onChange={(e) => setCampaignForm({ ...campaignForm, filterRegMethod: e.target.value })}
                    >
                      <MenuItem value="all">Any Method</MenuItem>
                      <MenuItem value="email">Email Only</MenuItem>
                      <MenuItem value="phone">Phone Only</MenuItem>
                    </Select>
                  </FormControl>
                </Box>
              )}
            </Grid>

            {/* Content Section */}
            <Grid item xs={12} md={8}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="subtitle2">CAMPAIGN CONTENT</Typography>
                <FormControl size="small" sx={{ width: 180 }}>
                  <InputLabel>Load Template</InputLabel>
                  <Select
                    label="Load Template"
                    value=""
                    onChange={(e) => loadTemplateIntoCampaign(e.target.value)}
                  >
                    {templates.map(t => (
                      <MenuItem key={t.id} value={t.id}>{t.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>

              <TextField
                fullWidth
                label="Email Subject"
                value={campaignForm.subject}
                onChange={(e) => setCampaignForm({ ...campaignForm, subject: e.target.value })}
                sx={{ mb: 2 }}
              />

              <TextField
                fullWidth
                label="Email Message (HTML allowed)"
                multiline
                rows={8}
                value={campaignForm.message}
                onChange={(e) => setCampaignForm({ ...campaignForm, message: e.target.value })}
                sx={{ mb: 2 }}
                helperText="You can use {{name}} as a placeholder for the user's name."
              />

              <Box sx={{ bgcolor: '#f5f5f5', p: 2, borderRadius: 2 }}>
                <Typography variant="caption" fontWeight="bold" gutterBottom>Test Email</Typography>
                <Stack direction="row" spacing={1}>
                  <TextField
                    size="small"
                    fullWidth
                    placeholder="Enter email for testing..."
                    value={campaignForm.testEmail}
                    onChange={(e) => setCampaignForm({ ...campaignForm, testEmail: e.target.value })}
                  />
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleSendCampaign(true)}
                    disabled={sending}
                  >
                    {sending ? <CircularProgress size={20} /> : 'Test'}
                  </Button>
                </Stack>
              </Box>
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComposeDialog(false)} disabled={sending}>Cancel</Button>
          <Button
            onClick={() => handleSendCampaign(false)}
            variant="contained"
            endIcon={sending ? <CircularProgress size={16} color="inherit" /> : <Send />}
            disabled={sending}
          >
            Send Campaign
          </Button>
        </DialogActions>
      </Dialog>

      {/* Template Management Dialog */}
      <Dialog open={templateDialog} onClose={() => setTemplateDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant="h6">{activeTemplate ? 'Edit Template' : (activeTemplate === null && templateForm.name ? 'New Template' : 'Manage Templates')}</Typography>
            {activeTemplate === null && !templateForm.name && (
              <Button startIcon={<Add />} size="small" onClick={() => setTemplateForm({ name: 'New Template', subject: '', body: '', type: 'email' })}>
                New Template
              </Button>
            )}
            {(activeTemplate || templateForm.name) && (
              <Button size="small" onClick={() => { setActiveTemplate(null); setTemplateForm({ name: '', subject: '', body: '', type: 'email' }); }}>
                Back to List
              </Button>
            )}
          </Box>
        </DialogTitle>
        <DialogContent dividers>
          {/* List View */}
          {activeTemplate === null && !templateForm.name && (
            <List>
              {templates.map(tmpl => (
                <ListItem key={tmpl.id} divider>
                  <ListItemText primary={tmpl.name} secondary={tmpl.subject} />
                  <ListItemSecondaryAction>
                    <Tooltip title="Edit">
                      <IconButton onClick={() => { setActiveTemplate(tmpl); setTemplateForm(tmpl); }}>
                        <Edit />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Delete">
                      <IconButton color="error" onClick={() => handleDeleteTemplate(tmpl.id)}>
                        <Delete />
                      </IconButton>
                    </Tooltip>
                  </ListItemSecondaryAction>
                </ListItem>
              ))}
              {templates.length === 0 && <Typography align="center" color="text.secondary" py={4}>No templates found. Create one to get started.</Typography>}
            </List>
          )}

          {/* Edit/Create View */}
          {(activeTemplate || templateForm.name) && (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="Template Name"
                fullWidth
                value={templateForm.name}
                onChange={(e) => setTemplateForm({ ...templateForm, name: e.target.value })}
              />
              <TextField
                label="Email Subject"
                fullWidth
                value={templateForm.subject}
                onChange={(e) => setTemplateForm({ ...templateForm, subject: e.target.value })}
              />
              <TextField
                label="Content (HTML support)"
                multiline
                rows={8}
                fullWidth
                value={templateForm.body}
                onChange={(e) => setTemplateForm({ ...templateForm, body: e.target.value })}
                helperText="Supports HTML. Use {{name}} for dynamic names."
              />
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTemplateDialog(false)}>Close</Button>
          {(activeTemplate || templateForm.name) && (
            <Button variant="contained" onClick={handleSaveTemplate}>Save Template</Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CommunicationScreen;
