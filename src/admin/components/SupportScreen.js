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
  Add, Support, Help, ContactSupport, QuestionAnswer, Chat,
  Phone, Email, Message, Assignment, Assessment,
  FilterList, ExpandMore, Warning, Info,
  Timeline, Schedule, PriorityHigh, Star, TrendingUp,
  Person, PersonAdd, PersonRemove, Block, Lock,
  Security, LocationOn, CalendarToday, MoreVert,
  Verified, Pending, AdminPanelSettings, SupervisorAccount,
  Group, Business, School, Work, AssignmentInd,
  Reply, Forward, Archive, Flag, ThumbUp, ThumbDown,
  Send, AttachFile, OpenInNew
} from '@mui/icons-material';
import adminService from '../../services/adminService';


const SupportScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [ticketDialog, setTicketDialog] = useState(false);
  const [replyDialog, setReplyDialog] = useState(false);

  // State for support data - will be fetched from Supabase
  const [supportTickets, setSupportTickets] = useState([]);
  const [supportAgents, setSupportAgents] = useState([]);
  const [supportMetrics, setSupportMetrics] = useState({
    openTickets: 0,
    avgResponseTime: '0 min',
    satisfactionRate: '0/5',
    resolvedToday: 0
  });
  const [knowledgeBase, setKnowledgeBase] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch support data from Supabase
  useEffect(() => {
    const fetchSupportData = async () => {
      try {
        setLoading(true);

        // Fetch support tickets
        const tickets = await adminService.getSupportTickets();
        setSupportTickets(tickets || []);

        // Calculate metrics from tickets
        const openTickets = tickets?.filter(t => t.status === 'open').length || 0;
        const resolvedToday = tickets?.filter(t => {
          const today = new Date().toISOString().split('T')[0];
          return t.status === 'resolved' && t.resolved_at?.startsWith(today);
        }).length || 0;

        setSupportMetrics({
          openTickets,
          avgResponseTime: '0 min', // TODO: Calculate from ticket response times
          satisfactionRate: '0/5', // TODO: Calculate from satisfaction ratings
          resolvedToday
        });

        // TODO: Fetch support agents and knowledge base when tables are ready
        setSupportAgents([]);
        setKnowledgeBase([]);

      } catch (error) {
        console.error('Error fetching support data:', error);
        setSupportTickets([]);
        setSupportAgents([]);
        setKnowledgeBase([]);
      } finally {
        setLoading(false);
      }
    };

    fetchSupportData();
  }, []);

  const filteredTickets = supportTickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      ticket.ticket_number.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && ticket.priority === 'critical') ||
      (activeTab === 2 && ticket.priority === 'high') ||
      (activeTab === 3 && ticket.status === 'open');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'open': return 'error';
      case 'in_progress': return 'warning';
      case 'resolved': return 'success';
      case 'closed': return 'default';
      case 'pending': return 'info';
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

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'technical': return <Help sx={{ fontSize: 20 }} />;
      case 'account': return <Person sx={{ fontSize: 20 }} />;
      case 'billing': return <Assignment sx={{ fontSize: 20 }} />;
      case 'mobile': return <Phone sx={{ fontSize: 20 }} />;
      case 'feature_request': return <Star sx={{ fontSize: 20 }} />;
      default: return <Support sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (ticketId) => {
    setSelectedItems(prev =>
      prev.includes(ticketId)
        ? prev.filter(id => id !== ticketId)
        : [...prev, ticketId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleAssignTicket = (ticketId, agent) => {
    
  };

  const handleReplyTicket = (ticketId) => {
    
    setReplyDialog(true);
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Support Management
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Chat />} onClick={() => setReplyDialog(true)}>
            Quick Reply
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setTicketDialog(true)}>
            Create Ticket
          </Button>
        </Box>
      </Box>

      {/* Critical Alert */}
      {supportTickets.filter(ticket => ticket.priority === 'critical' && ticket.status === 'open').length > 0 && (
        <Alert severity="error" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{supportTickets.filter(ticket => ticket.priority === 'critical' && ticket.status === 'open').length} critical tickets</strong> require immediate attention!
          </Typography>
        </Alert>
      )}

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Support sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{supportMetrics.openTickets}</Typography>
              <Typography variant="body2" color="text.secondary">Open Tickets</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Schedule sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{supportMetrics.avgResponseTime}</Typography>
              <Typography variant="body2" color="text.secondary">Avg Response Time</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Star sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{supportMetrics.satisfactionRate}</Typography>
              <Typography variant="body2" color="text.secondary">Satisfaction Rate</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <CheckCircle sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">{supportMetrics.resolvedToday}</Typography>
              <Typography variant="body2" color="text.secondary">Resolved Today</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>


      {/* Tabs for Ticket Priority */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Tickets" />
          <Tab label="Critical" />
          <Tab label="High Priority" />
          <Tab label="Open" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search tickets..."
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
                  <MenuItem value="open">Open</MenuItem>
                  <MenuItem value="in_progress">In Progress</MenuItem>
                  <MenuItem value="resolved">Resolved</MenuItem>
                  <MenuItem value="closed">Closed</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('assign')}>
                      Assign Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('escalate')}>
                      Escalate Selected
                    </Button>
                    <Button variant="contained" color="error" onClick={() => handleBulkAction('close')}>
                      Close Selected
                    </Button>
                  </>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
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
                          setSelectedItems(filteredTickets.map(ticket => ticket.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Ticket</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Priority</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Created</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredTickets.map((ticket) => (
                  <TableRow key={ticket.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(ticket.id)}
                        onChange={() => handleItemSelect(ticket.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {ticket.ticket_number}
                        </Typography>
                        <Typography variant="body2" sx={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {ticket.subject}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.replies_count} replies
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {ticket.user.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {ticket.user.email}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(ticket.category)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {ticket.category.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.priority}
                        color={getPriorityColor(ticket.priority)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={ticket.status.replace('_', ' ')}
                        color={getStatusColor(ticket.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {ticket.assigned_to.split('@')[0]}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2">
                          {ticket.created_at.split(' ')[0]}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Due: {ticket.due_date}
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
                        <Tooltip title="Reply">
                          <IconButton size="small" color="info" onClick={() => handleReplyTicket(ticket.id)}>
                            <Reply />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Assign">
                          <IconButton size="small" color="success" onClick={() => handleAssignTicket(ticket.id)}>
                            <PersonAdd />
                          </IconButton>
                        </Tooltip>
                        {ticket.satisfaction_rating && (
                          <Tooltip title={`Satisfaction: ${ticket.satisfaction_rating}/5`}>
                            <IconButton size="small" color="warning">
                              <Star />
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

      {/* Support Agents Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Support Agents
          </Typography>
          <Grid container spacing={2}>
            {supportAgents.map((agent) => (
              <Grid item xs={12} md={4} key={agent.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Avatar sx={{ bgcolor: '#2196F3', mr: 1 }}>
                      {agent.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {agent.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {agent.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Chip
                      label={agent.status}
                      color={agent.status === 'online' ? 'success' : agent.status === 'busy' ? 'warning' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary" sx={{ ml: 1 }}>
                      {agent.tickets_assigned} assigned
                    </Typography>
                  </Box>
                  <Typography variant="body2">
                    Response: {agent.response_time_avg} • Rating: {agent.satisfaction_rate}/5
                  </Typography>
                  <Box sx={{ mt: 1 }}>
                    {agent.specialization.map((spec, index) => (
                      <Chip key={index} label={spec} size="small" sx={{ mr: 0.5 }} />
                    ))}
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Knowledge Base Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Knowledge Base
          </Typography>
          <List>
            {knowledgeBase.map((article) => (
              <ListItem key={article.id} divider>
                <ListItemIcon>
                  <Help sx={{ color: '#2196F3' }} />
                </ListItemIcon>
                <ListItemText
                  primary={article.title}
                  secondary={`${article.views} views • ${article.helpful_count} helpful • Updated: ${article.last_updated}`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={article.status}
                      color={article.status === 'published' ? 'success' : 'warning'}
                      size="small"
                    />
                    <Tooltip title="View Article">
                      <IconButton size="small" color="primary">
                        <OpenInNew />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Create Ticket Dialog */}
      <Dialog open={ticketDialog} onClose={() => setTicketDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Support Ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create a new support ticket and assign it to the appropriate team.
          </Typography>
          {/* Create ticket form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTicketDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Ticket</Button>
        </DialogActions>
      </Dialog>

      {/* Reply Dialog */}
      <Dialog open={replyDialog} onClose={() => setReplyDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Reply to Ticket</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Compose and send a reply to the selected support ticket.
          </Typography>
          {/* Reply form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReplyDialog(false)}>Cancel</Button>
          <Button variant="contained" startIcon={<Send />}>Send Reply</Button>
        </DialogActions>
      </Dialog>
    </Box >
  );
};

export default SupportScreen;

