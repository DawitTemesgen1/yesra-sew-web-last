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
  Add, Timeline, PlayArrow, Pause, Stop, Settings, Assessment,
  FilterList, ExpandMore, Warning, Error, Info,
  Schedule, DateRange, CalendarToday, Sync, Loop,
  ArrowForward, ArrowBack, ArrowDownward, SwapVert,
  AccountTree, FlowChart, Schema, Hub, Router,
  Speed, Memory, Storage, DataObject, Code,
  Person, Group, Business, School, Work,
  Email, Message, Phone, Notification,
  Download, Upload, FileCopy
} from '@mui/icons-material';

const WorkflowScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [workflowDialog, setWorkflowDialog] = useState(false);
  const [nodeDialog, setNodeDialog] = useState(false);

  // State for workflow data - will be fetched from Supabase
  const [workflows, setWorkflows] = useState([]);
  const [workflowExecutions, setWorkflowExecutions] = useState([]);
  const [workflowMetrics, setWorkflowMetrics] = useState([]);
  const [nodeTypes, setNodeTypes] = useState([
    { type: 'trigger', name: 'Trigger', description: 'Start workflow based on events', color: '#4CAF50', icon: <PlayArrow /> },
    { type: 'validation', name: 'Validation', description: 'Validate data and conditions', color: '#2196F3', icon: <CheckCircle /> },
    { type: 'action', name: 'Action', description: 'Execute specific actions', color: '#FF9800', icon: <Settings /> },
    { type: 'notification', name: 'Notification', description: 'Send notifications', color: '#9C27B0', icon: <Email /> },
    { type: 'condition', name: 'Condition', description: 'Branch based on conditions', color: '#F44336', icon: <SwapVert /> },
    { type: 'logging', name: 'Logging', description: 'Log events and data', color: '#607D8B', icon: <DataObject /> }
  ]);

  // Fetch workflow data
  useEffect(() => {
    const fetchWorkflowData = async () => {
      try {
        // TODO: Implement actual Supabase queries for workflows
        // For now, set empty arrays
        setWorkflows([]);
        setWorkflowExecutions([]);
        setWorkflowMetrics([]);
      } catch (error) {
        console.error('Error fetching workflow data:', error);
      }
    };
    fetchWorkflowData();
  }, []);

  const filteredWorkflows = workflows.filter(workflow => {
    const matchesSearch = workflow.name.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      workflow.description.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || workflow.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && workflow.category === 'user_management') ||
      (activeTab === 2 && workflow.category === 'content_moderation') ||
      (activeTab === 3 && workflow.category === 'billing');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'success';
      case 'paused': return 'warning';
      case 'inactive': return 'default';
      case 'failed': return 'error';
      case 'completed': return 'success';
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

  const handleItemSelect = (workflowId) => {
    setSelectedItems(prev =>
      prev.includes(workflowId)
        ? prev.filter(id => id !== workflowId)
        : [...prev, workflowId]
    );
  };

  const handleBulkAction = (action) => {
    console.log(`Bulk action: ${action} on workflows:`, selectedItems);
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRunWorkflow = (workflowId) => {
    console.log(`Run workflow: ${workflowId}`);
  };

  const handlePauseWorkflow = (workflowId) => {
    console.log(`Pause workflow: ${workflowId}`);
  };

  const handleStopWorkflow = (workflowId) => {
    console.log(`Stop workflow: ${workflowId}`);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Workflow Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<AccountTree />} onClick={() => setNodeDialog(true)}>
            Node Types
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setWorkflowDialog(true)}>
            Create Workflow
          </Button>
        </Box>
      </Box>

      {/* Failed Workflow Alert */}
      {workflowExecutions.filter(exec => exec.status === 'failed').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{workflowExecutions.filter(exec => exec.status === 'failed').length} workflow executions</strong> have failed. Review and resolve issues.
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Timeline sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">15</Typography>
              <Typography variant="body2" color="text.secondary">Total Workflows</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">12</Typography>
              <Typography variant="body2" color="text.secondary">Active Workflows</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">96.8%</Typography>
              <Typography variant="body2" color="text.secondary">Avg Success Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Speed sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">234</Typography>
              <Typography variant="body2" color="text.secondary">Executions Today</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Workflow Metrics Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Workflow Metrics
          </Typography>
          <Grid container spacing={2}>
            {workflowMetrics.map((metric) => (
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

      {/* Tabs for Workflow Categories */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Workflows" />
          <Tab label="User Management" />
          <Tab label="Content Moderation" />
          <Tab label="Billing" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search workflows..."
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
                  <MenuItem value="paused">Paused</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
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
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('pause')}>
                      Pause Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('stop')}>
                      Stop Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Workflows Table */}
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
                          setSelectedItems(filteredWorkflows.map(workflow => workflow.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Workflow</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Success Rate</TableCell>
                  <TableCell>Duration</TableCell>
                  <TableCell>Last Run</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredWorkflows.map((workflow) => (
                  <TableRow key={workflow.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(workflow.id)}
                        onChange={() => handleItemSelect(workflow.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {workflow.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {workflow.nodes_count} nodes • {workflow.triggers.length} triggers
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.category.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.priority}
                        color={getPriorityColor(workflow.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={workflow.status}
                        color={getStatusColor(workflow.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.success_rate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.avg_duration}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {workflow.last_run.split(' ')[0]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        {workflow.status === 'active' ? (
                          <Tooltip title="Pause Workflow">
                            <IconButton size="small" color="warning" onClick={() => handlePauseWorkflow(workflow.id)}>
                              <Pause />
                            </IconButton>
                          </Tooltip>
                        ) : (
                          <Tooltip title="Run Workflow">
                            <IconButton size="small" color="success" onClick={() => handleRunWorkflow(workflow.id)}>
                              <PlayArrow />
                            </IconButton>
                          </Tooltip>
                        )}
                        <Tooltip title="Stop Workflow">
                          <IconButton size="small" color="error" onClick={() => handleStopWorkflow(workflow.id)}>
                            <Stop />
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

      {/* Workflow Executions Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Recent Executions
          </Typography>
          <List>
            {workflowExecutions.map((execution) => (
              <ListItem key={execution.id} divider>
                <ListItemIcon>
                  {execution.status === 'completed' ? (
                    <CheckCircle sx={{ color: 'success.main' }} />
                  ) : execution.status === 'failed' ? (
                    <Error sx={{ color: 'error.main' }} />
                  ) : (
                    <Sync sx={{ color: 'info.main' }} />
                  )}
                </ListItemIcon>
                <ListItemText
                  primary={execution.workflow_name}
                  secondary={`${execution.execution_id} • Duration: ${execution.duration} • Nodes: ${execution.nodes_successful}/${execution.nodes_executed}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={execution.status}
                      color={getStatusColor(execution.status)}
                      size="small"
                    />
                    {execution.error_count > 0 && (
                      <Chip
                        label={`${execution.error_count} errors`}
                        color="error"
                        size="small"
                      />
                    )}
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Node Types Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Available Node Types
          </Typography>
          <Grid container spacing={2}>
            {nodeTypes.map((nodeType, index) => (
              <Grid item xs={12} sm={6} md={2} key={index}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Box sx={{ color: nodeType.color, mb: 1 }}>
                    {nodeType.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {nodeType.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {nodeType.description}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Create Workflow Dialog */}
      <Dialog open={workflowDialog} onClose={() => setWorkflowDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Create New Workflow</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Design and create a new automated workflow with custom nodes and triggers.
          </Typography>
          {/* Workflow creation form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setWorkflowDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Workflow</Button>
        </DialogActions>
      </Dialog>

      {/* Node Types Dialog */}
      <Dialog open={nodeDialog} onClose={() => setNodeDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Workflow Node Types</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Configure and manage different types of workflow nodes.
          </Typography>
          {/* Node types configuration here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNodeDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkflowScreen;
