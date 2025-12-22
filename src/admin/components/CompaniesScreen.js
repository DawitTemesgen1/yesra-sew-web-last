import React, { useState, useEffect } from 'react';
import {
  Box, Grid, Card, CardContent, Typography, Table, TableBody,
  TableCell, TableContainer, TableHead, TableRow, Button, Chip,
  TextField, FormControl, InputLabel, Select, MenuItem, IconButton,
  Switch, FormControlLabel, Dialog, DialogTitle, DialogContent,
  DialogActions, Avatar, Badge, Tabs, Tab, Divider, List, ListItem,
  ListItemText, ListItemIcon, ListItemSecondaryAction, Alert,
  LinearProgress, Paper, Stack, Tooltip, Accordion, AccordionSummary,
  AccordionDetails, InputAdornment, Rating, CircularProgress
} from '@mui/material';
import {
  Search, Refresh, Visibility, Edit, Delete, CheckCircle, Cancel,
  Add, Business, LocationOn, Phone, Email, CalendarToday, ExpandMore,
  Star, TrendingUp, Assessment, FilterList, MoreVert,
  Verified, Pending, Error, AdminPanelSettings, SupervisorAccount,
  Group, Work, AssignmentInd, AccountBalance, Storefront, CorporateFare,
  Domain, GpsFixed, Language, Public, Lock, Security, Warning,
  Block, Unblock, Schedule, History, Analytics, AttachFile
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import toast from 'react-hot-toast';

const CompaniesScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [companyDialog, setCompanyDialog] = useState(false);
  const [verificationDialog, setVerificationDialog] = useState(false);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const data = await adminService.getUsers({ account_type: 'company' });
      // Transform data to match UI expectations if necessary
      const transformedData = data.map(user => ({
        id: user.id,
        name: user.company_name || user.full_name || 'Unnamed Company',
        email: user.email,
        phone: user.phone || 'N/A',
        status: user.status || 'active', // Default to active if missing
        business_type: user.business_type || 'N/A',
        registration_number: user.registration_number || 'N/A',
        verification_status: user.verified ? 'verified' : (user.verification_status || 'pending'),
        subscription_plan: user.subscription_plan || 'Basic',
        registration_date: new Date(user.created_at).toLocaleDateString(),
        last_active: new Date(user.last_sign_in_at || user.created_at).toLocaleString(),
        revenue: 'N/A', // Real revenue data might need separate fetch
        rating: user.rating || 0,
        reviews_count: user.reviews_count || 0,
        contact_person: user.full_name || 'N/A',
        contact_position: 'Owner',
        location: user.location || 'N/A',
        description: user.bio || 'No description available',
        website: user.website || '',
        services: user.services || [],
        employees_count: user.employees_count || 0,
        listings_count: 0, // Could fetch count if needed
        documents_count: 0,
        compliance_score: 0,
        membership_tier: user.membership_tier || 'Bronze'
      }));
      setCompanies(transformedData);
    } catch (error) {
      console.error('Error fetching companies:', error);
      toast.error('Failed to load companies');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies();
  }, [refreshing]); // Refetch when parent refreshes

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'pending': return 'warning';
      case 'suspended': return 'error';
      case 'inactive': return 'default';
      default: return 'default';
    }
  };

  const getVerificationColor = (status) => {
    switch (status) {
      case 'verified': return 'success';
      case 'pending': return 'warning';
      case 'rejected': return 'error';
      default: return 'default';
    }
  };

  const getSubscriptionColor = (plan) => {
    switch (plan) {
      case 'Premium': return 'error';
      case 'Professional': return 'warning';
      case 'Basic': return 'info';
      default: return 'default';
    }
  };

  const handleSelectItem = (id) => {
    setSelectedItems(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedItems.length === companies.length) {
      setSelectedItems([]);
    } else {
      setSelectedItems(companies.map(company => company.id));
    }
  };

  const handleViewCompany = (company) => {
    setSelectedCompany(company);
    setCompanyDialog(true);
  };

  const handleVerifyCompany = (company) => {
    setSelectedCompany(company);
    setVerificationDialog(true);
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      company.business_type.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      company.email.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const renderTabContent = () => {
    switch (activeTab) {
      case 0:
        return (
          <TableContainer component={Paper} sx={{ borderRadius: 2, boxShadow: 1 }}>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Switch
                      checked={selectedItems.length === companies.length}
                      onChange={handleSelectAll}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>Company</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Verification</TableCell>
                  <TableCell>Plan</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell align="center">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map((company) => (
                  <TableRow key={company.id} hover>
                    <TableCell padding="checkbox">
                      <Switch
                        checked={selectedItems.includes(company.id)}
                        onChange={() => handleSelectItem(company.id)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <Avatar sx={{ bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={600}>
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {company.registration_number}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.business_type}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.status}
                        color={getStatusColor(company.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.verification_status}
                        color={getVerificationColor(company.verification_status)}
                        size="small"
                        icon={company.verification_status === 'verified' ? <Verified fontSize="small" /> : null}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={company.subscription_plan}
                        color={getSubscriptionColor(company.subscription_plan)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={company.rating} readOnly size="small" precision={0.1} />
                        <Typography variant="caption">({company.reviews_count})</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>
                        {company.revenue}
                      </Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Stack direction="row" spacing={1} justifyContent="center">
                        <Tooltip title="View Details">
                          <IconButton size="small" onClick={() => handleViewCompany(company)}>
                            <Visibility fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small">
                            <Edit fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Verify">
                          <IconButton size="small" onClick={() => handleVerifyCompany(company)}>
                            <CheckCircle fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        );

      case 1:
        return (
          <Grid container spacing={3}>
            {filteredCompanies.map((company) => (
              <Grid item xs={12} sm={6} lg={4} key={company.id}>
                <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
                        <Business />
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" fontWeight={600}>
                          {company.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {company.business_type}
                        </Typography>
                      </Box>
                      <Chip
                        label={company.status}
                        color={getStatusColor(company.status)}
                        size="small"
                      />
                    </Box>

                    <Typography variant="body2" sx={{ mb: 2 }}>
                      {company.description}
                    </Typography>

                    <Box sx={{ mb: 2 }}>
                      <Typography variant="caption" color="text.secondary">
                        Contact: {company.contact_person} ({company.contact_position})
                      </Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <LocationOn fontSize="small" color="action" />
                      <Typography variant="caption">{company.location}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                      <Phone fontSize="small" color="action" />
                      <Typography variant="caption">{company.phone}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <Email fontSize="small" color="action" />
                      <Typography variant="caption">{company.email}</Typography>
                    </Box>

                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Rating value={company.rating} readOnly size="small" precision={0.1} />
                        <Typography variant="caption">({company.reviews_count})</Typography>
                      </Box>
                      <Typography variant="body2" fontWeight={600} color="primary">
                        {company.revenue}
                      </Typography>
                    </Box>
                  </CardContent>
                  <Box sx={{ p: 2, pt: 0 }}>
                    <Stack direction="row" spacing={1}>
                      <Button size="small" variant="outlined" onClick={() => handleViewCompany(company)}>
                        View
                      </Button>
                      <Button size="small" onClick={() => handleVerifyCompany(company)}>
                        Verify
                      </Button>
                    </Stack>
                  </Box>
                </Card>
              </Grid>
            ))}
          </Grid>
        );

      default:
        return null;
    }
  };

  const isLoading = loading || refreshing;

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight={600}>
          Companies Management
        </Typography>
        <Stack direction="row" spacing={2}>
          <Button
            variant="outlined"
            startIcon={<Refresh />}
            onClick={handleRefresh}
            disabled={isLoading}
          >
            Refresh
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
          >
            Add Company
          </Button>
        </Stack>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main' }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {companies.length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Companies
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'success.main' }}>
                  <CheckCircle />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {companies.filter(c => c.verification_status === 'verified').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Verified
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'warning.main' }}>
                  <Pending />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    {companies.filter(c => c.verification_status === 'pending').length}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Pending
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'error.main' }}>
                  <TrendingUp />
                </Avatar>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    ETB {companies.reduce((sum, c) => sum + parseInt(c.revenue.replace(/[^0-9]/g, '') || 0), 0).toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Total Revenue
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Filters */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Search />
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Status</InputLabel>
                <Select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  label="Status"
                >
                  <MenuItem value="all">All Status</MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                  <MenuItem value="suspended">Suspended</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Stack direction="row" spacing={2}>
                <Button
                  variant="outlined"
                  startIcon={<FilterList />}
                  sx={{ flexGrow: 1 }}
                >
                  Advanced Filters
                </Button>
                <Button
                  variant="outlined"
                  startIcon={<Assessment />}
                  sx={{ flexGrow: 1 }}
                >
                  Export Data
                </Button>
              </Stack>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, newValue) => setActiveTab(newValue)}>
          <Tab label="List View" />
          <Tab label="Card View" />
          <Tab label="Analytics" />
        </Tabs>
      </Box>

      {/* Content */}
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        renderTabContent()
      )}

      {/* Company Details Dialog */}
      <Dialog
        open={companyDialog}
        onClose={() => setCompanyDialog(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedCompany && (
          <>
            <DialogTitle>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
                  <Business />
                </Avatar>
                <Box>
                  <Typography variant="h6">{selectedCompany.name}</Typography>
                  <Typography variant="caption" color="text.secondary">
                    {selectedCompany.registration_number}
                  </Typography>
                </Box>
              </Box>
            </DialogTitle>
            <DialogContent>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Company Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Business Type"
                        secondary={selectedCompany.business_type}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Registration Date"
                        secondary={selectedCompany.registration_date}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Subscription Plan"
                        secondary={selectedCompany.subscription_plan}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Membership Tier"
                        secondary={selectedCompany.membership_tier}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" gutterBottom>
                    Contact Information
                  </Typography>
                  <List dense>
                    <ListItem>
                      <ListItemText
                        primary="Contact Person"
                        secondary={`${selectedCompany.contact_person} (${selectedCompany.contact_position})`}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Email"
                        secondary={selectedCompany.email}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Phone"
                        secondary={selectedCompany.phone}
                      />
                    </ListItem>
                    <ListItem>
                      <ListItemText
                        primary="Website"
                        secondary={selectedCompany.website}
                      />
                    </ListItem>
                  </List>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Description
                  </Typography>
                  <Typography variant="body2">
                    {selectedCompany.description}
                  </Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="subtitle2" gutterBottom>
                    Services
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {selectedCompany.services.map((service, index) => (
                      <Chip key={index} label={service} size="small" variant="outlined" />
                    ))}
                  </Stack>
                </Grid>
              </Grid>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setCompanyDialog(false)}>Close</Button>
              <Button variant="outlined">Edit Company</Button>
              <Button variant="contained">Save Changes</Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      {/* Verification Dialog */}
      <Dialog
        open={verificationDialog}
        onClose={() => setVerificationDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        {selectedCompany && (
          <>
            <DialogTitle>Verify Company</DialogTitle>
            <DialogContent>
              <Typography variant="body1" gutterBottom>
                Do you want to verify "{selectedCompany.name}"?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                This action will mark the company as verified and grant them additional privileges.
              </Typography>
              {selectedCompany.verification_status === 'pending' && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  Please review all company documents before verification.
                </Alert>
              )}
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setVerificationDialog(false)}>Cancel</Button>
              <Button variant="contained" color="success">
                Verify Company
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
};

export default CompaniesScreen;

