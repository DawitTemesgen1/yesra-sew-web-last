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
  Add, Backup, Restore, Download, Upload, Schedule, CloudUpload,
  CloudDownload, Storage, History, Assessment,
  FilterList, ExpandMore, Warning, Error, Info,
  Settings, SystemUpdate, Security, DataObject, Save,
  Folder, FolderOpen, Archive, FileCopy, Sync, PlayArrow
} from '@mui/icons-material';
import adminService from '../../services/adminService';


const BackupScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [backupDialog, setBackupDialog] = useState(false);
  const [restoreDialog, setRestoreDialog] = useState(false);

  // State for backup data - will be fetched from Supabase
  const [backupJobs, setBackupJobs] = useState([]);
  const [restoreOperations, setRestoreOperations] = useState([]);
  const [backupStorage, setBackupStorage] = useState([]);
  const [backupMetrics, setBackupMetrics] = useState({
    totalStorage: '0 GB',
    successRate: '0%',
    avgTime: '0m',
    restoreSuccess: '0%'
  });
  const [loading, setLoading] = useState(true);

  // Fetch backup data from Supabase
  useEffect(() => {
    const fetchBackupData = async () => {
      try {
        setLoading(true);

        // Fetch backup history
        const backups = await adminService.getBackupHistory();
        setBackupJobs(backups || []);

        // Calculate metrics from backups
        const completedBackups = backups?.filter(b => b.status === 'completed') || [];
        const totalSize = completedBackups.reduce((sum, b) => sum + (b.file_size || 0), 0);
        const successRate = backups?.length > 0
          ? ((completedBackups.length / backups.length) * 100).toFixed(1)
          : 0;

        setBackupMetrics({
          totalStorage: `${(totalSize / (1024 * 1024 * 1024)).toFixed(1)} GB`,
          successRate: `${successRate}%`,
          avgTime: '0m', // TODO: Calculate from backup durations
          restoreSuccess: '0%' // TODO: Calculate from restore operations
        });

        // TODO: Fetch restore operations and storage info when ready
        setRestoreOperations([]);
        setBackupStorage([]);

      } catch (error) {
        console.error('Error fetching backup data:', error);
        setBackupJobs([]);
        setRestoreOperations([]);
        setBackupStorage([]);
      } finally {
        setLoading(false);
      }
    };

    fetchBackupData();
  }, []);

  const filteredBackups = backupJobs.filter(backup => {
    const matchesSearch = backup.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      backup.type.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || backup.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && backup.type === 'full') ||
      (activeTab === 2 && backup.type === 'incremental') ||
      (activeTab === 3 && backup.type === 'database');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed': return 'success';
      case 'running': return 'info';
      case 'scheduled': return 'warning';
      case 'failed': return 'error';
      case 'cancelled': return 'default';
      default: return 'default';
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'full': return <Storage sx={{ fontSize: 20 }} />;
      case 'incremental': return <Sync sx={{ fontSize: 20 }} />;
      case 'database': return <DataObject sx={{ fontSize: 20 }} />;
      case 'files': return <Folder sx={{ fontSize: 20 }} />;
      case 'config': return <Settings sx={{ fontSize: 20 }} />;
      default: return <Backup sx={{ fontSize: 20 }} />;
    }
  };

  const getLocationIcon = (location) => {
    switch (location) {
      case 'cloud_storage': return <CloudUpload sx={{ fontSize: 20 }} />;
      case 'local_storage': return <FolderOpen sx={{ fontSize: 20 }} />;
      default: return <Storage sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (backupId) => {
    setSelectedItems(prev =>
      prev.includes(backupId)
        ? prev.filter(id => id !== backupId)
        : [...prev, backupId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on backups:`, selectedItems);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRunBackup = (backupId) => {
    console.log(`Run backup: ${backupId}`);
  };

  const handleRestoreBackup = (backupId) => {
    console.log(`Restore backup: ${backupId}`);
  };

  const handleDownloadBackup = (backupId) => {
    console.log(`Download backup: ${backupId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Backup & Recovery
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Restore />} onClick={() => setRestoreDialog(true)}>
            Restore Data
          </Button>
          <Button variant="contained" startIcon={<Backup />} onClick={() => setBackupDialog(true)}>
            Create Backup
          </Button>
        </Box>
      </Box>

      {/* Backup Alert */}
      {backupJobs.filter(backup => backup.status === 'failed').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{backupJobs.filter(backup => backup.status === 'failed').length} backup jobs</strong> have failed. Review and resolve issues.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Storage sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{backupMetrics.totalStorage}</Typography>
              <Typography variant="body2" color="text.secondary">Total Storage Used</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{backupMetrics.successRate}</Typography>
              <Typography variant="body2" color="text.secondary">Backup Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <History sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{backupMetrics.avgTime}</Typography>
              <Typography variant="body2" color="text.secondary">Avg Backup Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Restore sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{backupMetrics.restoreSuccess}</Typography>
              <Typography variant="body2" color="text.secondary">Restore Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Tabs for Backup Types */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Backups" />
          <Tab label="Full Backups" />
          <Tab label="Incremental" />
          <Tab label="Database" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search backups..."
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
                  <MenuItem value="completed">Completed</MenuItem>
                  <MenuItem value="running">Running</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('run')}>
                      Run Selected
                    </Button>
                    <Button variant="contained" color="info" onClick={() => handleBulkAction('download')}>
                      Download Selected
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

      {/* Backup Jobs Table */}
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
                          setSelectedItems(filteredBackups.map(backup => backup.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Backup Job</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Size</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Next Run</TableCell>
                  <TableCell>Location</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredBackups.map((backup) => (
                  <TableRow key={backup.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(backup.id)}
                        onChange={() => handleItemSelect(backup.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {backup.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {backup.frequency} • Retention: {backup.retention_days} days
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTypeIcon(backup.type)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {backup.type}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Chip
                          label={backup.status}
                          color={getStatusColor(backup.status)}
                          size="small"
                        />
                        {backup.status === 'running' && (
                          <LinearProgress
                            variant="indeterminate"
                            sx={{ width: 50, height: 6 }}
                          />
                        )}
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {backup.size_gb} GB
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {backup.duration}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {backup.next_run}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getLocationIcon(backup.location)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {backup.location.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {backup.status !== 'running' && (
                          <Tooltip title="Run Backup">
                            <IconButton size="small" color="success" onClick={() => handleRunBackup(backup.id)}>
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        {backup.status === 'completed' && (
                          <Tooltip title="Restore">
                            <IconButton size="small" color="info" onClick={() => handleRestoreBackup(backup.id)}>
                              <Restore />
                            </IconButton>
                          </Tooltip>
                        )}
                        {backup.status === 'completed' && (
                          <Tooltip title="Download">
                            <IconButton size="small" color="warning" onClick={() => handleDownloadBackup(backup.id)}>
                              <Download />
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

      {/* Restore Operations Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Restore Operations
          </Typography>
          <List>
            {restoreOperations.map((restore) => (
              <ListItem key={restore.id} divider>
                <ListItemIcon>
                  {restore.status === 'completed' ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : restore.status === 'failed' ? (
                    <Error sx={{ color: 'error.main' }} />
                  ) : (
                    <Sync sx={{ color: 'info.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={restore.backup_name}
                  secondary={`Initiated by ${restore.initiated_by} • Target: ${restore.target_location} • Size: ${restore.size_restored_gb} GB`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={restore.status}
                      color={getStatusColor(restore.status)}
                      size="small"
                    />
                    <Chip
                      label={restore.verification_status}
                      color={restore.verification_status === 'verified' ? 'success' : 'error'}
                      size="small"
                    />
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Storage Locations Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Backup Storage Locations
          </Typography>
          <Grid container spacing={2}>
            {backupStorage.map((storage) => (
              <Grid item xs={12} md={4} key={storage.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    {storage.type === 'cloud' ? (
                      <CloudUpload sx={{ mr: 1, color: '#2196F3' }} />
                    ) : (
                      <FolderOpen sx={{ mr: 1, color: '#4CAF50' }} />
                    )}
                    <Typography variant="h6" fontWeight="bold">
                      {storage.location}
                    </Typography>
                  </Box>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="body2">
                      {storage.used_capacity_gb} GB / {storage.total_capacity_gb} GB used
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(storage.used_capacity_gb / storage.total_capacity_gb) * 100}
                      sx={{ mt: 0.5 }}
                    />
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {storage.backup_count} backups • {storage.encryption_enabled ? 'Encrypted' : 'Not Encrypted'}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Create Backup Dialog */}
      <Dialog open={backupDialog} onClose={() => setBackupDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create New Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure and create a new backup job with custom settings.
          </Typography>
          {/* Create backup form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setBackupDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Backup</Button>
        </DialogActions>
      </Dialog>

      {/* Restore Data Dialog */}
      <Dialog open={restoreDialog} onClose={() => setRestoreDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Restore Data from Backup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Select a backup to restore data from and configure restore options.
          </Typography>
          {/* Restore configuration here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRestoreDialog(false)}>Cancel</Button>
          <Button variant="contained">Start Restore</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default BackupScreen;
