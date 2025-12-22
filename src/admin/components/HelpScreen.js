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
  Add, Help, Support, QuestionAnswer, Book, Description,
  FilterList, ExpandMore, Warning, Error, Info,
  Timeline, Schedule, DateRange, CalendarToday,
  PlayArrow, Download, FileDownload,
  Email, Phone, Message, Chat,
  Person, Group, Business, Work,
  Settings, MoreVert, Star, ThumbUp, ThumbDown,
  OpenInNew, Link,
  Assessment, TrendingUp, TrendingDown,
  Feedback, RateReview, ContactSupport,
  MenuBook, Lightbulb, TipsAndUpdates,
  Bookmark, BookmarkBorder, Share,
  Search as SearchIcon, FilterList as FilterIcon
} from '@mui/icons-material';

const HelpScreen = ({ t, handleRefresh, refreshing, searchTerm, setSearchTerm, filterStatus, setFilterStatus }) => {
  const [selectedItems, setSelectedItems] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [articleDialog, setArticleDialog] = useState(false);
  const [videoDialog, setVideoDialog] = useState(false);

  const helpArticles = [
    {
      id: 1,
      title: 'Getting Started with Yesra Sew',
      content: 'Complete guide to getting started with the Yesra Sew platform',
      category: 'getting_started',
      status: 'published',
      author: 'admin@yesrasew.com',
      views: 12345,
      helpful_count: 89,
      not_helpful_count: 5,
      last_updated: '2024-01-15',
      reading_time: '5 min',
      difficulty: 'beginner',
      tags: ['basics', 'tutorial', 'guide'],
      featured: true
    },
    {
      id: 2,
      title: 'How to Create Property Listings',
      content: 'Step-by-step guide to creating and managing property listings',
      category: 'property_management',
      status: 'published',
      author: 'content_team@yesrasew.com',
      views: 8765,
      helpful_count: 234,
      not_helpful_count: 12,
      last_updated: '2024-01-14',
      reading_time: '8 min',
      difficulty: 'intermediate',
      tags: ['properties', 'listings', 'tutorial'],
      featured: false
    },
    {
      id: 3,
      title: 'Premium Membership Benefits',
      content: 'Understanding the benefits and features of premium membership',
      category: 'membership',
      status: 'published',
      author: 'marketing_team@yesrasew.com',
      views: 5678,
      helpful_count: 156,
      not_helpful_count: 8,
      last_updated: '2024-01-12',
      reading_time: '6 min',
      difficulty: 'beginner',
      tags: ['membership', 'premium', 'features'],
      featured: true
    },
    {
      id: 4,
      title: 'Mobile App Installation Guide',
      content: 'How to install and set up the Yesra Sew mobile application',
      category: 'mobile',
      status: 'draft',
      author: 'mobile_team@yesrasew.com',
      views: 2345,
      helpful_count: 67,
      not_helpful_count: 3,
      last_updated: '2024-01-10',
      reading_time: '4 min',
      difficulty: 'beginner',
      tags: ['mobile', 'app', 'installation'],
      featured: false
    },
    {
      id: 5,
      title: 'Troubleshooting Common Issues',
      content: 'Solutions to common problems and issues users may encounter',
      category: 'troubleshooting',
      status: 'published',
      author: 'support_team@yesrasew.com',
      views: 9876,
      helpful_count: 345,
      not_helpful_count: 23,
      last_updated: '2024-01-08',
      reading_time: '10 min',
      difficulty: 'intermediate',
      tags: ['troubleshooting', 'issues', 'solutions'],
      featured: false
    }
  ];

  const videoTutorials = [
    {
      id: 1,
      title: 'Platform Overview',
      description: 'Complete overview of the Yesra Sew platform features',
      category: 'getting_started',
      duration: '12:30',
      views: 5678,
      thumbnail: '/videos/thumbnails/platform-overview.jpg',
      video_url: 'https://videos.yesrasew.com/platform-overview',
      status: 'published',
      published_at: '2024-01-15',
      presenter: 'John Doe',
      difficulty: 'beginner',
      tags: ['overview', 'features', 'tutorial']
    },
    {
      id: 2,
      title: 'Creating Your First Listing',
      description: 'Step-by-step video guide to creating property listings',
      category: 'property_management',
      duration: '8:45',
      views: 3456,
      thumbnail: '/videos/thumbnails/first-listing.jpg',
      video_url: 'https://videos.yesrasew.com/first-listing',
      status: 'published',
      published_at: '2024-01-14',
      presenter: 'Jane Smith',
      difficulty: 'beginner',
      tags: ['listing', 'tutorial', 'properties']
    },
    {
      id: 3,
      title: 'Advanced Search Techniques',
      description: 'Learn advanced search and filtering techniques',
      category: 'search',
      duration: '6:20',
      views: 2345,
      thumbnail: '/videos/thumbnails/advanced-search.jpg',
      video_url: 'https://videos.yesrasew.com/advanced-search',
      status: 'published',
      published_at: '2024-01-12',
      presenter: 'Mike Johnson',
      difficulty: 'intermediate',
      tags: ['search', 'advanced', 'techniques']
    }
  ];

  const faqItems = [
    {
      id: 1,
      question: 'How do I create a property listing?',
      answer: 'To create a property listing, click on the "Add Property" button in your dashboard. Fill in all required information including property details, photos, and contact information. Once complete, submit for review.',
      category: 'property_management',
      views: 1234,
      helpful_count: 89,
      last_updated: '2024-01-15',
      priority: 'high'
    },
    {
      id: 2,
      question: 'What are the benefits of premium membership?',
      answer: 'Premium membership includes unlimited property listings, featured placement, advanced analytics, priority support, and access to exclusive features. Premium members also get reduced commission rates.',
      category: 'membership',
      views: 987,
      helpful_count: 67,
      last_updated: '2024-01-14',
      priority: 'medium'
    },
    {
      id: 3,
      question: 'How do I reset my password?',
      answer: 'Click on "Forgot Password" on the login page. Enter your registered email address and we will send you a password reset link. Follow the instructions in the email to create a new password.',
      category: 'account',
      views: 654,
      helpful_count: 45,
      last_updated: '2024-01-12',
      priority: 'high'
    },
    {
      id: 4,
      question: 'What payment methods are accepted?',
      answer: 'We accept credit/debit cards, bank transfers, and mobile money payments. All payments are processed securely through our payment partners.',
      category: 'billing',
      views: 432,
      helpful_count: 34,
      last_updated: '2024-01-10',
      priority: 'medium'
    }
  ];

  const helpMetrics = [
    {
      id: 1,
      metric: 'Total Articles',
      value: 156,
      change: '+12',
      trend: 'up',
      status: 'good'
    },
    {
      id: 2,
      metric: 'Video Tutorials',
      value: 23,
      change: '+3',
      trend: 'up',
      status: 'good'
    },
    {
      id: 3,
      metric: 'Helpful Rating',
      value: '87.5%',
      change: '+2.1%',
      trend: 'up',
      status: 'good'
    },
    {
      id: 4,
      metric: 'Support Tickets Reduced',
      value: '23%',
      change: '+5%',
      trend: 'up',
      status: 'excellent'
    }
  ];

  const categories = [
    {
      name: 'Getting Started',
      icon: <Lightbulb />,
      article_count: 15,
      video_count: 5,
      color: '#4CAF50'
    },
    {
      name: 'Property Management',
      icon: <Business />,
      article_count: 23,
      video_count: 8,
      color: '#2196F3'
    },
    {
      name: 'Membership',
      icon: <Star />,
      article_count: 12,
      video_count: 3,
      color: '#FF9800'
    },
    {
      name: 'Mobile App',
      icon: <Phone />,
      article_count: 8,
      video_count: 4,
      color: '#9C27B0'
    },
    {
      name: 'Troubleshooting',
      icon: <Settings />,
      article_count: 18,
      video_count: 6,
      color: '#F44336'
    },
    {
      name: 'Billing',
      icon: <Assessment />,
      article_count: 10,
      video_count: 2,
      color: '#607D8B'
    }
  ];

  const filteredArticles = helpArticles.filter(article => {
    const matchesSearch = article.title.toLowerCase().includes((searchTerm || '').toLowerCase()) ||
      article.description.toLowerCase().includes((searchTerm || '').toLowerCase());
    const matchesFilter = filterStatus === 'all' || article.status === filterStatus;
    const matchesTab = activeTab === 0 ||
      (activeTab === 1 && article.featured) ||
      (activeTab === 2 && article.category === 'getting_started') ||
      (activeTab === 3 && article.category === 'property_management');
    return matchesSearch && matchesFilter && matchesTab;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'published': return 'success';
      case 'draft': return 'warning';
      case 'archived': return 'default';
      default: return 'default';
    }
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'beginner': return 'success';
      case 'intermediate': return 'warning';
      case 'advanced': return 'error';
      default: return 'default';
    }
  };

  const getCategoryIcon = (category) => {
    const categoryData = categories.find(cat => cat.name.toLowerCase().replace(' ', '_') === category);
    return categoryData ? categoryData.icon : <Description />;
  };

  const handleItemSelect = (articleId) => {
    setSelectedItems(prev =>
      prev.includes(articleId)
        ? prev.filter(id => id !== articleId)
        : [...prev, articleId]
    );
  };

  const handleBulkAction = (action) => {
    
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleRateArticle = (articleId, rating) => {
    
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" fontWeight="bold">
          Help & Documentation
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button variant="outlined" startIcon={<PlayArrow />} onClick={() => setVideoDialog(true)}>
            Video Tutorials
          </Button>
          <Button variant="contained" startIcon={<Add />} onClick={() => setArticleDialog(true)}>
            Create Article
          </Button>
        </Box>
      </Box>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <Book sx={{ fontSize: 40, color: '#2196F3', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">156</Typography>
              <Typography variant="body2" color="text.secondary">Total Articles</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PlayArrow sx={{ fontSize: 40, color: '#4CAF50', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">23</Typography>
              <Typography variant="body2" color="text.secondary">Video Tutorials</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <ThumbUp sx={{ fontSize: 40, color: '#FF9800', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">87.5%</Typography>
              <Typography variant="body2" color="text.secondary">Helpful Rating</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingDown sx={{ fontSize: 40, color: '#9C27B0', mb: 1 }} />
              <Typography variant="h5" fontWeight="bold">23%</Typography>
              <Typography variant="body2" color="text.secondary">Tickets Reduced</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Help Metrics Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Help Center Metrics
          </Typography>
          <Grid container spacing={2}>
            {helpMetrics.map((metric) => (
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
                      color={metric.status === 'excellent' ? 'success' : metric.status === 'good' ? 'info' : 'warning'}
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

      {/* Categories Section */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Help Categories
          </Typography>
          <Grid container spacing={2}>
            {categories.map((category, index) => (
              <Grid item xs={12} sm={6} md={2} key={index}>
                <Paper variant="outlined" sx={{ p: 2, textAlign: 'center', cursor: 'pointer' }}>
                  <Box sx={{ color: category.color, mb: 1 }}>
                    {category.icon}
                  </Box>
                  <Typography variant="h6" fontWeight="bold">
                    {category.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {category.article_count} articles • {category.video_count} videos
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* Tabs for Content Types */}
      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} variant="scrollable">
          <Tab label="All Articles" />
          <Tab label="Featured" />
          <Tab label="Getting Started" />
          <Tab label="Property Management" />
        </Tabs>
      </Card>

      {/* Filters and Search */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                placeholder="Search help articles..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{ startAdornment: <SearchIcon sx={{ mr: 1 }} /> }}
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
                  <MenuItem value="published">Published</MenuItem>
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
                    <Button variant="contained" color="success" onClick={() => handleBulkAction('publish')}>
                      Publish Selected
                    </Button>
                    <Button variant="contained" color="warning" onClick={() => handleBulkAction('feature')}>
                      Feature Selected
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

      {/* Help Articles Table */}
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
                          setSelectedItems(filteredArticles.map(article => article.id));
                        } else {
                          setSelectedItems([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Article</TableCell>
                  <TableCell>Category</TableCell>
                  <TableCell>Difficulty</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Views</TableCell>
                  <TableCell>Helpful</TableCell>
                  <TableCell>Last Updated</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredArticles.map((article) => (
                  <TableRow key={article.id}>
                    <TableCell padding="checkbox">
                      <input
                        type="checkbox"
                        checked={selectedItems.includes(article.id)}
                        onChange={() => handleItemSelect(article.id)}
                      />
                    </TableCell>
                    <TableCell>
                      <Box>
                        <Typography variant="body2" fontWeight="medium">
                          {article.title}
                          {article.featured && <Star sx={{ fontSize: 16, color: 'gold', ml: 1 }} />}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {article.reading_time} read • by {article.author.split('@')[0]}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {getCategoryIcon(article.category)}
                        <Typography variant="body2" sx={{ textTransform: 'capitalize' }}>
                          {article.category.replace('_', ' ')}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.difficulty}
                        color={getDifficultyColor(article.difficulty)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={article.status}
                        color={getStatusColor(article.status)}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {article.views.toLocaleString()}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Typography variant="body2">
                          {article.helpful_count}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          /{article.helpful_count + article.not_helpful_count}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">
                        {article.last_updated}
                      </Typography>
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1 }}>
                        <Tooltip title="View Article">
                          <IconButton size="small" color="primary">
                            <OpenInNew />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Edit">
                          <IconButton size="small" color="info">
                            <Edit />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Helpful">
                          <IconButton size="small" color="success" onClick={() => handleRateArticle(article.id, 'helpful')}>
                            <ThumbUp />
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

      {/* Video Tutorials Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Video Tutorials
          </Typography>
          <Grid container spacing={2}>
            {videoTutorials.map((video) => (
              <Grid item xs={12} md={4} key={video.id}>
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <PlayArrow sx={{ fontSize: 40, color: '#4CAF50', mr: 1 }} />
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {video.title}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {video.duration} • {video.views.toLocaleString()} views
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" color="text.secondary">
                    {video.description}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                    <Chip
                      label={video.difficulty}
                      color={getDifficultyColor(video.difficulty)}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                      {video.presenter}
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <Card sx={{ mt: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight="bold" gutterBottom>
            Frequently Asked Questions
          </Typography>
          {faqItems.map((faq) => (
            <Accordion key={faq.id}>
              <AccordionSummary expandIcon={<ExpandMore />}>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <QuestionAnswer sx={{ mr: 1, color: '#2196F3' }} />
                  <Typography variant="h6" fontWeight="medium">
                    {faq.question}
                  </Typography>
                  <Box sx={{ ml: 'auto', display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Chip
                      label={faq.priority}
                      color={faq.priority === 'high' ? 'error' : 'default'}
                      size="small"
                    />
                    <Typography variant="caption" color="text.secondary">
                      {faq.views} views
                    </Typography>
                  </Box>
                </Box>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" color="text.secondary">
                  {faq.answer}
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    Helpful: {faq.helpful_count} • Updated: {faq.last_updated}
                  </Typography>
                </Box>
              </AccordionDetails>
            </Accordion>
          ))}
        </CardContent>
      </Card>

      {/* Create Article Dialog */}
      <Dialog open={articleDialog} onClose={() => setArticleDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create Help Article</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Create a new help article with rich content and multimedia support.
          </Typography>
          {/* Create article form fields here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setArticleDialog(false)}>Cancel</Button>
          <Button variant="contained">Create Article</Button>
        </DialogActions>
      </Dialog>

      {/* Video Tutorials Dialog */}
      <Dialog open={videoDialog} onClose={() => setVideoDialog(false)} maxWidth="lg" fullWidth>
        <DialogTitle>Video Tutorials</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary">
            Manage video tutorials, transcripts, and learning resources.
          </Typography>
          {/* Video tutorials management here */}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setVideoDialog(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default HelpScreen;

