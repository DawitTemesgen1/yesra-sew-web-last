import React, { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Button, TextField, Select,
  MenuItem, Dialog, DialogTitle, DialogContent, DialogActions,
  Chip, Avatar, IconButton, Grid, Switch, FormControlLabel,
  Accordion, AccordionSummary, AccordionDetails, List, ListItem,
  ListItemText, ListItemIcon, Divider
} from '@mui/material';
import {
  Business, LocationOn, Phone, Email, Person, Edit, Delete,
  Add, Search, Refresh, VerifiedUser, Star, ExpandMore,
  Work, Category, AttachMoney, TrendingUp
} from '@mui/icons-material';

const CompanyManagement = () => {
  const [companies, setCompanies] = useState([
    { 
      id: 1, 
      name: 'Tech Solutions PLC', 
      email: 'info@techsolutions.com', 
      phone: '+251911000000',
      location: 'Addis Ababa, Bole',
      category: 'Technology',
      verified: true,
      status: 'active',
      listings: 12,
      rating: 4.8,
      revenue: 2500000,
      employees: 45,
      joined: '2024-01-01'
    },
    { 
      id: 2, 
      name: 'Real Estate Ethiopia', 
      email: 'contact@realestate.et', 
      phone: '+251922000000',
      location: 'Addis Ababa, Mekane Yesus',
      category: 'Real Estate',
      verified: false,
      status: 'pending',
      listings: 8,
      rating: 4.2,
      revenue: 1800000,
      employees: 15,
      joined: '2024-01-05'
    },
    { 
      id: 3, 
      name: 'Ethio Motors', 
      email: 'sales@ethiomotors.com', 
      phone: '+251933000000',
      location: 'Addis Ababa, CMC',
      category: 'Automotive',
      verified: true,
      status: 'active',
      listings: 25,
      rating: 4.6,
      revenue: 3200000,
      employees: 30,
      joined: '2024-01-03'
    }
  ]);

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterCategory, setFilterCategory] = useState('all');

  const getStatusColor = (status) => {
    const colors = {
      active: 'success',
      pending: 'warning',
      suspended: 'error'
    };
    return colors[status] || 'default';
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         company.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || company.status === filterStatus;
    const matchesCategory = filterCategory === 'all' || company.category === filterCategory;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  return (
    <Box>
      <Typography variant="h6" gutterBottom>Company Management</Typography>
      
      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Business sx={{ fontSize: 32, color: 'primary.main', mb: 1 }} />
            <Typography variant="h5">{companies.length}</Typography>
            <Typography variant="caption" color="text.secondary">Total Companies</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <VerifiedUser sx={{ fontSize: 32, color: 'success.main', mb: 1 }} />
            <Typography variant="h5">{companies.filter(c => c.verified).length}</Typography>
            <Typography variant="caption" color="text.secondary">Verified</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <AttachMoney sx={{ fontSize: 32, color: 'info.main', mb: 1 }} />
            <Typography variant="h5">ETB {(companies.reduce((sum, c) => sum + c.revenue, 0) / 1000000).toFixed(1)}M</Typography>
            <Typography variant="caption" color="text.secondary">Total Revenue</Typography>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card sx={{ textAlign: 'center', py: 2 }}>
            <Work sx={{ fontSize: 32, color: 'warning.main', mb: 1 }} />
            <Typography variant="h5">{companies.reduce((sum, c) => sum + c.employees, 0)}</Typography>
            <Typography variant="caption" color="text.secondary">Total Employees</Typography>
          </Card>
        </Grid>
      </Grid>

      {/* Search and Filter */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            placeholder="Search companies..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            InputProps={{ startAdornment: <Search /> }}
          />
        </Grid>
        <Grid item xs={12} md={3}>
          <Select fullWidth value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <MenuItem value="all">All Status</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="suspended">Suspended</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={3}>
          <Select fullWidth value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
            <MenuItem value="all">All Categories</MenuItem>
            <MenuItem value="Technology">Technology</MenuItem>
            <MenuItem value="Real Estate">Real Estate</MenuItem>
            <MenuItem value="Automotive">Automotive</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} md={2}>
          <Button variant="contained" fullWidth startIcon={<Add />}>Add Company</Button>
        </Grid>
      </Grid>

      {/* Companies Table */}
      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Company</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Listings</TableCell>
                  <TableCell>Revenue</TableCell>
                  <TableCell>Rating</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredCompanies.map(company => (
                  <TableRow key={company.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ mr: 2, bgcolor: 'primary.main' }}>
                          <Business />
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight="medium">
                            {company.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {company.email}
                          </Typography>
                          <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                            <LocationOn fontSize="12" />
                            <Typography variant="caption">{company.location}</Typography>
                          </Box>
                          {company.verified && (
                            <Chip size="small" label="Verified" color="success" sx={{ mt: 0.5 }} />
                          )}
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip size="small" label={company.category} />
                    </TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        label={company.status}
                        color={getStatusColor(company.status)}
                      />
                    </TableCell>
                    <TableCell>{company.listings}</TableCell>
                    <TableCell>ETB {company.revenue.toLocaleString()}</TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Star sx={{ fontSize: 16, color: 'warning.main', mr: 0.5 }} />
                        <Typography variant="body2">{company.rating}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <IconButton size="small"><Edit /></IconButton>
                      <IconButton size="small" color="error"><Delete /></IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  );
};

export default CompanyManagement;

