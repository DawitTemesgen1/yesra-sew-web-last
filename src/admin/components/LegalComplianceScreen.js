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
  Add, Gavel, Policy, Security, Warning, Info, ExpandMore,
  FileCopy, Description, Assignment, LibraryBooks, Bookmark,
  Verified, Pending, Error, Schedule, History, Assessment,
  Shield, Cookie, DataObject, Language, Public,
  Domain, Copyright, Trademark, Patent, AccountBalance
} from '@mui/icons-material';

const LegalComplianceScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [policyDialog, setPolicyDialog] = useState(false);
  const [complianceDialog, setComplianceDialog] = useState(false);

  const legalDocuments = [
    {
      id: 1,
      title: 'Terms of Service',
      type: 'terms',
      category: 'user_agreement',
      version: '2.1.0',
      status: 'active',
      last_updated: '2024-01-15',
      effective_date: '2024-01-01',
      required_acceptance: true,
      acceptance_rate: 98.5,
      priority: 'high',
      file_url: '/legal/terms-of-service-v2.1.0.pdf'
    },
    {
      id: 2,
      title: 'Privacy Policy',
      type: 'privacy',
      category: 'data_protection',
      version: '3.2.1',
      status: 'active',
      last_updated: '2024-01-10',
      effective_date: '2024-01-01',
      required_acceptance: true,
      acceptance_rate: 96.2,
      priority: 'high',
      file_url: '/legal/privacy-policy-v3.2.1.pdf'
    },
    {
      id: 3,
      title: 'Cookie Policy',
      type: 'cookies',
      category: 'data_protection',
      version: '1.5.0',
      status: 'active',
      last_updated: '2024-01-08',
      effective_date: '2024-01-01',
      required_acceptance: false,
      acceptance_rate: 89.7,
      priority: 'medium',
      file_url: '/legal/cookie-policy-v1.5.0.pdf'
    },
    {
      id: 4,
      title: 'GDPR Compliance',
      type: 'gdpr',
      category: 'regulation',
      version: '1.0.0',
      status: 'active',
      last_updated: '2024-01-05',
      effective_date: '2024-01-01',
      required_acceptance: true,
      acceptance_rate: 94.1,
      priority: 'high',
      file_url: '/legal/gdpr-compliance-v1.0.0.pdf'
    },
    {
      id: 5,
      title: 'User Content Guidelines',
      type: 'guidelines',
      category: 'content_policy',
      version: '1.3.0',
      status: 'draft',
      last_updated: '2024-01-12',
      effective_date: null,
      required_acceptance: false,
      acceptance_rate: 0,
      priority: 'medium',
      file_url: '/legal/content-guidelines-v1.3.0.pdf'
    }
  ];

  const complianceChecks = [
    {
      id: 1,
      name: 'GDPR Compliance',
      category: 'data_protection',
      status: 'compliant',
      last_check: '2024-01-15',
      next_check: '2024-02-15',
      issues: 0,
      severity: 'high',
      automated: true,
      description: 'EU General Data Protection Regulation compliance'
    },
    {
      id: 2,
      name: 'CCPA Compliance',
      category: 'data_protection',
      status: 'compliant',
      last_check: '2024-01-14',
      next_check: '2024-02-14',
      issues: 0,
      severity: 'high',
      automated: true,
      description: 'California Consumer Privacy Act compliance'
    },
    {
      id: 3,
      name: 'Accessibility Standards',
      category: 'accessibility',
      status: 'warning',
      last_check: '2024-01-13',
      next_check: '2024-01-20',
      issues: 3,
      severity: 'medium',
      automated: false,
      description: 'WCAG 2.1 AA accessibility standards'
    },
    {
      id: 4,
      name: 'Payment Security (PCI DSS)',
      category: 'payment',
      status: 'compliant',
      last_check: '2024-01-12',
      next_check: '2024-02-12',
      issues: 0,
      severity: 'high',
      automated: true,
      description: 'Payment Card Industry Data Security Standard'
    },
    {
      id: 5,
      name: 'Data Retention Policy',
      category: 'data_management',
      status: 'non_compliant',
      last_check: '2024-01-11',
      next_check: '2024-01-18',
      issues: 5,
      severity: 'medium',
      automated: false,
      description: 'Data retention and deletion policies'
    }
  ];

  const regulatoryFrameworks = [
    {
      id: 1,
      name: 'General Data Protection Regulation (GDPR)',
      jurisdiction: 'European Union',
      type: 'data_protection',
      status: 'active',
      implementation_date: '2024-01-01',
      last_review: '2024-01-15',
      next_review: '2024-07-01',
      compliance_score: 98,
      requirements: 15,
      implemented: 14
    },
    {
      id: 2,
      name: 'California Consumer Privacy Act (CCPA)',
      jurisdiction: 'California, USA',
      type: 'data_protection',
      status: 'active',
      implementation_date: '2024-01-01',
      last_review: '2024-01-14',
      next_review: '2024-04-01',
      compliance_score: 95,
      requirements: 12,
      implemented: 11
    },
    {
      id: 3,
      name: 'Payment Card Industry Data Security Standard (PCI DSS)',
      jurisdiction: 'Global',
      type: 'payment_security',
      status: 'active',
      implementation_date: '2023-12-01',
      last_review: '2024-01-12',
      next_review: '2024-04-12',
      compliance_score: 100,
    }
  ];

  const filteredDocuments = legalDocuments.filter(doc => {
    const matchesSearch = doc.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      doc.category.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || doc.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && (doc.category === 'user_agreement' || doc.type === 'terms')) ||
      (activeTab === 2 && (doc.category === 'data_protection' || doc.type === 'privacy')) ||
      (activeTab === 3 && (doc.category === 'regulation' || doc.type === 'gdpr')) ||
      (activeTab === 4 && doc.category === 'content_policy');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'error';
      case 'compliant': return 'success';
      case 'warning': return 'warning';
      case 'non_compliant': return 'error';
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
      case 'terms': return <Gavel sx={{ fontSize: 20 }} />;
      case 'privacy': return <Security sx={{ fontSize: 20 }} />;
      case 'cookies': return <Cookie sx={{ fontSize: 20 }} />;
      case 'gdpr': return <Shield sx={{ fontSize: 20 }} />;
      case 'guidelines': return <LibraryBooks sx={{ fontSize: 20 }} />;
      default: return <Description sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (docId) => {
    setSelectedItems(prev =>
      prev.includes(docId)
        ? prev.filter(id => id !== docId)
        : [...prev, docId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on documents:`, selectedItems);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Legal Compliance
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Assessment />} onClick={() => setComplianceDialog(true)}>
            Run Compliance Check
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setPolicyDialog(true)}>
            Add Legal Document
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Policy sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">5</Typography>
              <Typography variant="body2" color="text.secondary">Legal Documents</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">95.2%</Typography>
              <Typography variant="body2" color="text.secondary">Overall Compliance</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Warning sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">8</Typography>
              <Typography variant="body2" color="text.secondary">Issues Found</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Security sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">3</Typography>
              <Typography variant="body2" color="text.secondary">Regulatory Frameworks</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Compliance Alert */}
      {complianceChecks.filter(check => check.status === 'non_compliant').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{complianceChecks.filter(check => check.status === 'non_compliant').length} compliance issues</strong> require immediate attention. Click "Run Compliance Check" for details.
          </Typography>
        </Alert>
      )}

      {/* Tabs for Document Categories */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Documents" />
          <Tab label="User Agreements" />
          <Tab label="Data Protection" />
          <Tab label="Regulations" />
          <Tab label="Content Policy" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search legal documents..."
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
                  <MenuItem value="draft">Draft</MenuItem>
                  <MenuItem value="archived">Archived</MenuItem>
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
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('archive')}>
                      Archive Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Legal Documents Table */}
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
                          setSelectedItems(filteredDocuments.map(doc => doc.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Document</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Version</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Acceptance Rate</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredDocuments.map((doc) => (
                  <TableRow key={doc.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(doc.id)}
                        onChange={() => handleItemSelect(doc.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {doc.title}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {doc.category.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(doc.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {doc.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        v{doc.version}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.status}
                        color={getStatusColor(doc.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {doc.acceptance_rate}%
                        </Typography>
                        {doc.required_acceptance && (
                          <Typography variant="caption" color="text.secondary">
                            Required
                          </Typography>
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={doc.priority}
                        color={getPriorityColor(doc.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>{doc.last_updated}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Document">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit Document">
                          <IconButton size="small" color="success">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Download">
                          <IconButton size="small" color="info">
                            <FileCopy />
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

      {/* Compliance Checks Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Compliance Checks
          </Typography>
          <List>
            {complianceChecks.map((check) => (
              <ListItem key={check.id} divider>
                <ListItemIcon>
                  {check.status === 'compliant' ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : check.status === 'warning' ? (
                    <Warning sx={{ color: 'warning.main' }} />
                  ) : (
                    <Error sx={{ color: 'error.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={check.name}
                  secondary={`${check.description} • Last: ${check.last_check} • Next: ${check.next_check}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    {check.issues > 0 && (
                      <Badge badgeContent={check.issues} color="error">
                        <Info />
                      </Badge>
                    )}
                    <Chip
                      label={check.status.replace('_', ' ')}
                      color={getStatusColor(check.status)}
                      size="small"
                    />
                    <Switch
                      checked={check.automated}
                      size="small"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Regulatory Frameworks Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Regulatory Frameworks
          </Typography>
          <Grid container spacing={2}>
            {regulatoryFrameworks.map((framework) => (
              <Grid item xs={12} md={4} key={framework.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Public sx={{ mr: 1, color: '#2196F3' }} />
                    <Typography variant="h6" fontWeight="bold">
                      {framework.name}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom>
                    {framework.jurisdiction}
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      Compliance Score: {framework.compliance_score}%
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={framework.compliance_score}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {framework.implemented}/{framework.requirements} requirements implemented
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Add Legal Document Dialog */}
      <Dialog open={policyDialog} onClose={() => setPolicyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Add Legal Document</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Add a new legal document to the platform compliance framework.
          </Typography>
          {/* Add legal document form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPolicyDialog(false)}>Cancel</Button>
          <Button variant="contained">Add Document</Button>
        </DialogActions>
      </Dialog>

      {/* Compliance Check Dialog */}
      <Dialog open={complianceDialog} onClose={() => setComplianceDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Run Compliance Check</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Run automated compliance checks against regulatory frameworks and internal policies.
          </Typography>
          {/* Compliance check configuration here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setComplianceDialog(false)}>Cancel</Button>
          <Button variant="contained">Run Check</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default LegalComplianceScreen;
