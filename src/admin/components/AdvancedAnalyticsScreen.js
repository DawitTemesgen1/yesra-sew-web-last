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
  Add, Assessment, BarChart, PieChart, Timeline, TrendingUp,
  TrendingDown, FilterList, ExpandMore, Warning, Error, Info,
  DateRange, CalendarToday, Schedule, Analytics, DataUsage,
  People, AttachMoney, ShoppingCart, LocalOffer, Star,
  Speed, Memory, Battery, Wifi, Signal, Storage,
  Download, FileDownload, Print, Share, Email,
  Settings, MoreVert, Report, Dashboard, Insights
} from '@mui/icons-material';

const AdvancedAnalyticsScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [reportDialog, setReportDialog] = useState(false);
  const [insightDialog, setInsightDialog] = useState(false);

  // State for all analytics data - will be fetched from Supabase
  const [analyticsMetrics, setAnalyticsMetrics] = useState([]);
  const [userBehavior, setUserBehavior] = useState([]);
  const [contentAnalytics, setContentAnalytics] = useState([]);
  const [conversionFunnel, setConversionFunnel] = useState([]);
  const [revenueAnalytics, setRevenueAnalytics] = useState([]);
  const [aiInsights, setAiInsights] = useState([]);

  // Fetch analytics data from Supabase
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        // TODO: Implement actual Supabase queries
        // For now, set empty arrays
        setAnalyticsMetrics([]);
        setUserBehavior([]);
        setContentAnalytics([]);
        setConversionFunnel([]);
        setRevenueAnalytics([]);
        setAiInsights([]);
      } catch (error) {
        console.error('Error fetching analytics:', error);
      }
    };
    fetchAnalyticsData();
  }, []);

  const filteredMetrics = analyticsMetrics.filter(metric => {
    const matchesSearch = metric.metric.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      metric.category.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || metric.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && metric.category === 'user_engagement') ||
      (activeTab === 2 && metric.category === 'business') ||
      (activeTab === 3 && metric.category === 'performance');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'excellent': return 'success';
      case 'good': return 'success';
      case 'warning': return 'warning';
      case 'critical': return 'error';
      default: return 'default';
    }
  };

  const getTrendIcon = (trend) => {
    switch (trend) {
      case 'up': return <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'down': return <TrendingDown sx={{ fontSize: 20, color: 'error.main' }} />;
      default: return <Timeline sx={{ fontSize: 20 }} />;
    }
  };

  const getInsightIcon = (type) => {
    switch (type) {
      case 'opportunity': return <TrendingUp sx={{ fontSize: 20, color: 'success.main' }} />;
      case 'warning': return <Warning sx={{ fontSize: 20, color: 'warning.main' }} />;
      case 'success': return <CheckCircle sx={{ fontSize: 20, color: 'success.main' }} />;
      default: return <Info sx={{ fontSize: 20 }} />;
    }
  };

  const handleItemSelect = (metricId) => {
    setSelectedItems(prev =>
      prev.includes(metricId)
        ? prev.filter(id => id !== metricId)
        : [...prev, metricId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleExportReport = (format) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Advanced Analytics
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<Insights />} onClick={() => setInsightDialog(true)}>
            AI Insights
          </Button>
          <Button variant="contained" startIcon={<Report />} onClick={() => setReportDialog(true)}>
            Generate Report
          </Button>
        </Box>
      </Box>

      {/* AI Insights Alert */}
      {aiInsights.filter(insight => insight.impact === 'high').length > 0 && (
        <Alert severity="warning" sx={{ mb: 3 }}>
          <Typography variant="body2">
            <strong>{aiInsights.filter(insight => insight.impact === 'high').length} high-impact insights</strong> require attention.
          </Typography>
        </Alert>
      )}

      {/* Key Metrics Overview */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Key Performance Metrics
          </Typography>
          <Grid container spacing={2}>
            {analyticsMetrics.slice(0, 6).map((metric) => (
              <Grid item xs={12} sm={6} md={2} key={metric.id}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center' }}>
                  <Typography variant="h6" fontWeight="bold">
                    {metric.value}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {metric.metric}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mt: 1 }}>
                    {getTrendIcon(metric.trend)}
                    <Typography variant="caption" sx={{ ml: 0.5 }}>
                      {metric.change > 0 ? '+' : ''}{metric.change}%
                    </Typography>
                  </Box>
                  <Chip
                    label={metric.status}
                    color={getStatusColor(metric.status)}
                    size="small"
                    sx={{ mt: 1 }}
                  />
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Categories */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Metrics" />
          <Tab label="User Engagement" />
          <Tab label="Business" />
          <Tab label="Performance" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search metrics..."
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
                  <MenuItem value="excellent">Excellent</MenuItem>
                  <MenuItem value="good">Good</MenuItem>
                  <MenuItem value="warning">Warning</MenuItem>
                  <MenuItem value="critical">Critical</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={5}>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="outlined" startIcon={<Refresh />} onClick={handleRefresh} disabled={refreshing}>
                  Refresh
                </Button>
                <Button variant="contained" color="success" onClick={() => handleExportReport('pdf')}>
                  <FileDownload sx={{ mr: 1 }} />PDF
                </Button>
                <Button variant="contained" color="info" onClick={() => handleExportReport('excel')}>
                  <FileDownload sx={{ mr: 1 }} />Excel
                </Button>
                {selectedItems.length > 0 && (
                  <Button variant="contained" color="warning" onClick={() => handleBulkAction('export')}>
                    Export Selected
                  </Button>
                )}
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Detailed Metrics Table */}
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
                          setSelectedItems(filteredMetrics.map(metric => metric.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Metric</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Current Value</TableCell>
                  <TableCell>Change</TableCell>
                  <TableCell>Target</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Period</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredMetrics.map((metric) => (
                  <TableRow key={metric.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(metric.id)}
                        onChange={() => handleItemSelect(metric.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {metric.metric}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={metric.category.replace('_', ' ')}
                        size="small"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2" fontWeight="bold">
                        {metric.value}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getTrendIcon(metric.trend)}
                        <Typography variant="body2">
                          {metric.change > 0 ? '+' : ''}{metric.change}%
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {metric.target}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={metric.status}
                        color={getStatusColor(metric.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {metric.period}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Details">
                          <IconButton size="small" color="primary">
                            <Visibility />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Export">
                          <IconButton size="small" color="info">
                            <Download />
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

      {/* User Behavior Analytics */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            User Behavior Analytics
          </Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>User Segment</TableCell>
                  <TableCell>Total Users</TableCell>
                  <TableCell>Avg Session</TableCell>
                  <TableCell>Bounce Rate</TableCell>
                  <TableCell>Conversion Rate</TableCell>
                  <TableCell>Retention Rate</TableCell>
                  <TableCell>Revenue/User</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {userBehavior.map((segment) => (
                  <TableRow key={segment.id}>
                    <TableCell>
                      <Typography variant="body2" fontWeight="medium">
                        {segment.user_segment}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.total_users.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.avg_session_duration}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.bounce_rate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.conversion_rate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.retention_rate}%
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {segment.revenue_per_user}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      {/* Conversion Funnel */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Conversion Funnel Analysis
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
            {conversionFunnel.map((stage, index) => (
              <Box key={stage.id} sx={{ textAlign: 'center', flex: 1 }}>
                <Paper
                  variant="outlined"
                  sx={{
                    p: 2,
                    backgroundColor: '#f5f5f5',
                    position: 'relative',
                    mx: index > 0 ? -1 : 0
                  }}
                >
                  <Typography variant="h6" fontWeight="bold">
                    {stage.users.toLocaleString()}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stage.stage}
                  </Typography>
                  <Typography variant="body2" color="primary">
                    {stage.percentage}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {stage.dropoff_rate > 0 && `-${stage.dropoff_rate}%`}
                  </Typography>
                </Paper>
              </Box>
            ))}
          </Box>
        </CardContent>
      </Card>

      {/* Revenue Analytics */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Revenue Analytics
          </Typography>
          <Grid container spacing={2}>
            {revenueAnalytics.map((revenue) => (
              <Grid item xs={12} md={3} key={revenue.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Typography variant="h6" fontWeight="bold">
                    {revenue.current_month}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {revenue.revenue_stream}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <TrendingUp sx={{ fontSize: 16, color: 'success.main', mr: 0.5 }} />
                    <Typography variant="body2" color="success.main">
                      +{revenue.growth}%
                    </Typography>
                  </Box>
                  <Typography variant="caption" color="text.secondary">
                    {revenue.contribution}% of total
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* AI Insights Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            AI-Powered Insights
          </Typography>
          <List>
            {aiInsights.map((insight) => (
              <ListItem key={insight.id} divider>
                <ListItemIcon>
                  {getInsightIcon(insight.type)}
                </ListItemIcon>
                <ListItemText
                  primary={insight.title}
                  secondary={`${insight.description} • Confidence: ${(insight.confidence * 100).toFixed(0)}%`}
                />
                <ListItemSecondaryAction>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={insight.impact}
                      color={insight.impact === 'high' ? 'error' : insight.impact === 'medium' ? 'warning' : 'success'}
                      size="small"
                    />
                    <Tooltip title="View Actions">
                      <IconButton size="small" color="primary">
                        <Visibility />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      {/* Generate Report Dialog */}
      <Dialog open={reportDialog} onClose={() => setReportDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Generate Analytics Report</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create a comprehensive analytics report with custom metrics and insights.
          </Typography>
          {/* Report generation form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReportDialog(false)}>Cancel</Button>
          <Button variant="contained">Generate Report</Button>
        </DialogActions>
      </Dialog>

      {/* AI Insights Dialog */}
      <Dialog open={insightDialog} onClose={() => setInsightDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>AI-Powered Insights</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Advanced AI-driven insights and recommendations for platform optimization.
          </Typography>
          {/* AI insights details here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInsightDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AdvancedAnalyticsScreen;

