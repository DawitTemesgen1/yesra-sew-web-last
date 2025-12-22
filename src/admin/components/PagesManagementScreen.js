import React, { useState, useEffect } from 'react';
import {
    Box, Grid, Card, CardContent, Typography, Button, TextField,
    Dialog, DialogTitle, DialogContent, DialogActions, Switch,
    FormControlLabel, Chip, IconButton, List, ListItem, ListItemText,
    ListItemSecondaryAction, Alert, Divider, MenuItem, Select,
    FormControl, InputLabel, Tabs, Tab, Accordion, AccordionSummary,
    AccordionDetails, Paper, Stack
} from '@mui/material';
import {
    Add, Edit, Delete, Visibility, DragIndicator, Public,
    Menu as MenuIcon, Refresh, Article, Code, ExpandMore,
    Home, DirectionsCar, Work, Assignment, Star, Settings
} from '@mui/icons-material';
import adminService from '../../services/adminService';
import pagesService from '../../services/pagesService';
import toast from 'react-hot-toast';

const PagesManagementScreen = ({ t }) => {
    const [pages, setPages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState(0);
    const [pageDialog, setPageDialog] = useState(false);
    const [sectionDialog, setSectionDialog] = useState(false);
    const [selectedPage, setSelectedPage] = useState(null);
    const [selectedSection, setSelectedSection] = useState(null);
    const [formData, setFormData] = useState({
        slug: '',
        title: '',
        meta_description: '',
        sections: [],
        meta_keywords: [],
        is_published: false,
        is_public: true,
        show_in_menu: false,
        menu_order: 0
    });
    const [sectionFormData, setSectionFormData] = useState({
        type: 'hero',
        content: {}
    });

    // Predefined page templates for common pages
    const pageTemplates = [
        {
            slug: 'home',
            title: 'Home Page',
            icon: <Home />,
            description: 'Main landing page with hero, features, and categories'
        },
        {
            slug: 'tenders',
            title: 'Tenders Page',
            icon: <Assignment />,
            description: 'Browse and search tender listings'
        },
        {
            slug: 'homes',
            title: 'Homes Page',
            icon: <Home />,
            description: 'Browse and search home listings'
        },
        {
            slug: 'cars',
            title: 'Cars Page',
            icon: <DirectionsCar />,
            description: 'Browse and search car listings'
        },
        {
            slug: 'jobs',
            title: 'Jobs Page',
            icon: <Work />,
            description: 'Browse and search job listings'
        },
        {
            slug: 'pricing',
            title: 'Pricing Page',
            icon: <Star />,
            description: 'Membership plans and pricing'
        }
    ];

    useEffect(() => {
        fetchPages();
    }, []);

    const fetchPages = async () => {
        try {
            setLoading(true);
            const data = await adminService.getPages();
            setPages(data || []);
        } catch (error) {
            console.error('Error fetching pages:', error);
            toast.error('Failed to load pages');
        } finally {
            setLoading(false);
        }
    };

    const handleCreatePage = (template = null) => {
        setSelectedPage(null);
        if (template) {
            setFormData({
                slug: template.slug,
                title: template.title,
                meta_description: template.description,
                sections: getDefaultSections(template.slug),
                meta_keywords: [],
                is_published: false,
                is_public: true,
                show_in_menu: true,
                menu_order: 0
            });
        } else {
            setFormData({
                slug: '',
                title: '',
                meta_description: '',
                sections: [],
                meta_keywords: [],
                is_published: false,
                is_public: true,
                show_in_menu: false,
                menu_order: 0
            });
        }
        setPageDialog(true);
    };

    const getDefaultSections = (slug) => {
        const sections = {
            home: [
                { id: '1', type: 'hero', content: { title: 'Welcome to YesraSew', subtitle: 'Ethiopia\'s Premier Marketplace', backgroundImage: '', ctaText: 'Get Started', ctaLink: '/register' } },
                { id: '2', type: 'features', content: { title: 'Why Choose Us', features: [] } },
                { id: '3', type: 'stats', content: { stats: [{ label: 'Active Users', value: '10,000+' }] } }
            ],
            tenders: [
                { id: '1', type: 'hero', content: { title: 'Browse Tenders', subtitle: 'Find the latest tender opportunities', backgroundImage: '' } },
                { id: '2', type: 'content', content: { html: '<p>Search and filter tenders...</p>' } }
            ],
            homes: [
                { id: '1', type: 'hero', content: { title: 'Find Your Dream Home', subtitle: 'Browse thousands of properties', backgroundImage: '' } }
            ],
            cars: [
                { id: '1', type: 'hero', content: { title: 'Buy or Sell Cars', subtitle: 'Best deals on vehicles', backgroundImage: '' } }
            ],
            jobs: [
                { id: '1', type: 'hero', content: { title: 'Find Your Next Job', subtitle: 'Thousands of opportunities', backgroundImage: '' } }
            ],
            pricing: [
                { id: '1', type: 'pricing', content: { title: 'Choose Your Plan', subtitle: 'Select the perfect plan for your needs' } }
            ]
        };
        return sections[slug] || [];
    };

    const handleEditPage = (page) => {
        setSelectedPage(page);
        setFormData({
            ...page,
            sections: page.sections || [],
            meta_keywords: page.meta_keywords || []
        });
        setPageDialog(true);
    };

    const handleSavePage = async () => {
        try {
            if (selectedPage) {
                await adminService.updatePage(selectedPage.id, formData);
                toast.success('Page updated successfully');
            } else {
                await adminService.createPage(formData);
                toast.success('Page created successfully');
            }
            setPageDialog(false);
            fetchPages();
        } catch (error) {
            toast.error('Failed to save page');
        }
    };

    const handleDeletePage = async (pageId) => {
        if (!window.confirm('Are you sure you want to delete this page?')) {
            return;
        }

        try {
            await adminService.deletePage(pageId);
            toast.success('Page deleted successfully');
            fetchPages();
        } catch (error) {
            toast.error('Failed to delete page');
        }
    };

    const handleTogglePublished = async (page) => {
        try {
            await adminService.updatePage(page.id, {
                is_published: !page.is_published
            });
            toast.success(`Page ${!page.is_published ? 'published' : 'unpublished'}`);
            fetchPages();
        } catch (error) {
            toast.error('Failed to update page');
        }
    };

    const handleToggleMenu = async (page) => {
        try {
            await adminService.updatePage(page.id, {
                show_in_menu: !page.show_in_menu
            });
            toast.success(`Page ${!page.show_in_menu ? 'added to' : 'removed from'} menu`);
            fetchPages();
        } catch (error) {
            toast.error('Failed to update page');
        }
    };

    const handleAddSection = () => {
        const templates = pagesService.getSectionTemplates();
        setSectionFormData({
            type: 'hero',
            content: templates[0].defaultContent
        });
        setSelectedSection(null);
        setSectionDialog(true);
    };

    const handleEditSection = (section) => {
        setSelectedSection(section);
        setSectionFormData({
            type: section.type,
            content: section.content
        });
        setSectionDialog(true);
    };

    const handleSaveSection = () => {
        if (selectedSection) {
            // Update existing section
            const updatedSections = formData.sections.map(s =>
                s.id === selectedSection.id ? { ...s, ...sectionFormData } : s
            );
            setFormData({ ...formData, sections: updatedSections });
        } else {
            // Add new section
            const newSection = {
                id: Date.now().toString(),
                ...sectionFormData
            };
            setFormData({
                ...formData,
                sections: [...formData.sections, newSection]
            });
        }
        setSectionDialog(false);
    };

    const handleDeleteSection = (sectionId) => {
        setFormData({
            ...formData,
            sections: formData.sections.filter(s => s.id !== sectionId)
        });
    };

    const handleSectionTypeChange = (type) => {
        const templates = pagesService.getSectionTemplates();
        const template = templates.find(t => t.type === type);
        setSectionFormData({
            type,
            content: template?.defaultContent || {}
        });
    };

    const sectionTemplates = pagesService.getSectionTemplates();

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h4" fontWeight="bold">
                    Pages Management
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                    <Button variant="outlined" startIcon={<Refresh />} onClick={fetchPages}>
                        Refresh
                    </Button>
                    <Button variant="contained" startIcon={<Add />} onClick={() => handleCreatePage()}>
                        Create Custom Page
                    </Button>
                </Box>
            </Box>

            {/* Info Alert */}
            <Alert severity="info" sx={{ mb: 3 }}>
                <Typography variant="body2">
                    Manage all public pages including Home, Tenders, Cars, Jobs, and Pricing. Customize content, layout, and SEO settings.
                </Typography>
            </Alert>

            {/* Tabs */}
            <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                <Tab label="All Pages" />
                <Tab label="Page Templates" />
            </Tabs>

            {/* All Pages Tab */}
            {activeTab === 0 && (
                <Grid container spacing={3}>
                    {pages.map((page) => (
                        <Grid item xs={12} md={6} key={page.id}>
                            <Card>
                                <CardContent>
                                    {/* Page Header */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                        <Box>
                                            <Typography variant="h6" fontWeight="bold">
                                                {page.title}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                /{page.slug}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ display: 'flex', gap: 0.5 }}>
                                            {page.is_published && (
                                                <Chip label="Published" color="success" size="small" />
                                            )}
                                            {page.show_in_menu && (
                                                <Chip icon={<MenuIcon />} label="In Menu" size="small" />
                                            )}
                                        </Box>
                                    </Box>

                                    {/* Meta Description */}
                                    {page.meta_description && (
                                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                            {page.meta_description}
                                        </Typography>
                                    )}

                                    <Divider sx={{ my: 2 }} />

                                    {/* Sections Count */}
                                    <Box sx={{ mb: 2 }}>
                                        <Typography variant="body2">
                                            <strong>{(page.sections || []).length}</strong> sections
                                        </Typography>
                                    </Box>

                                    {/* Toggles */}
                                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={page.is_published}
                                                    onChange={() => handleTogglePublished(page)}
                                                    size="small"
                                                />
                                            }
                                            label="Published"
                                        />
                                        <FormControlLabel
                                            control={
                                                <Switch
                                                    checked={page.show_in_menu}
                                                    onChange={() => handleToggleMenu(page)}
                                                    size="small"
                                                />
                                            }
                                            label="Show in Menu"
                                        />
                                    </Box>

                                    {/* Actions */}
                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Edit />}
                                            onClick={() => handleEditPage(page)}
                                            fullWidth
                                        >
                                            Edit
                                        </Button>
                                        <Button
                                            variant="outlined"
                                            startIcon={<Visibility />}
                                            href={`/${page.slug}`}
                                            target="_blank"
                                        >
                                            View
                                        </Button>
                                        <IconButton
                                            color="error"
                                            onClick={() => handleDeletePage(page.id)}
                                        >
                                            <Delete />
                                        </IconButton>
                                    </Box>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Page Templates Tab */}
            {activeTab === 1 && (
                <Grid container spacing={3}>
                    {pageTemplates.map((template) => (
                        <Grid item xs={12} md={4} key={template.slug}>
                            <Card>
                                <CardContent>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                                        {template.icon}
                                        <Typography variant="h6" fontWeight="bold">
                                            {template.title}
                                        </Typography>
                                    </Box>
                                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                                        {template.description}
                                    </Typography>
                                    <Button
                                        variant="contained"
                                        fullWidth
                                        startIcon={<Add />}
                                        onClick={() => handleCreatePage(template)}
                                    >
                                        Create from Template
                                    </Button>
                                </CardContent>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Page Dialog */}
            <Dialog open={pageDialog} onClose={() => setPageDialog(false)} maxWidth="md" fullWidth>
                <DialogTitle>
                    {selectedPage ? 'Edit Page' : 'Create New Page'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Basic Info */}
                        <TextField
                            label="Page Title"
                            value={formData.title}
                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            fullWidth
                            required
                        />
                        <TextField
                            label="URL Slug"
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            fullWidth
                            required
                            helperText="URL-friendly identifier (e.g., 'about-us')"
                        />
                        <TextField
                            label="Meta Description"
                            value={formData.meta_description}
                            onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                            fullWidth
                            multiline
                            rows={2}
                            helperText="SEO description for search engines"
                        />

                        {/* Sections */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                <Typography variant="subtitle2">
                                    Page Sections
                                </Typography>
                                <Button
                                    size="small"
                                    startIcon={<Add />}
                                    onClick={handleAddSection}
                                >
                                    Add Section
                                </Button>
                            </Box>
                            <List>
                                {formData.sections.map((section, index) => (
                                    <ListItem key={section.id} sx={{ bgcolor: 'grey.50', mb: 1, borderRadius: 1 }}>
                                        <DragIndicator sx={{ mr: 1, color: 'text.secondary' }} />
                                        <ListItemText
                                            primary={sectionTemplates.find(t => t.type === section.type)?.name || section.type}
                                            secondary={`Section ${index + 1}`}
                                        />
                                        <ListItemSecondaryAction>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleEditSection(section)}
                                                sx={{ mr: 1 }}
                                            >
                                                <Edit />
                                            </IconButton>
                                            <IconButton
                                                edge="end"
                                                onClick={() => handleDeleteSection(section.id)}
                                            >
                                                <Delete />
                                            </IconButton>
                                        </ListItemSecondaryAction>
                                    </ListItem>
                                ))}
                                {formData.sections.length === 0 && (
                                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                        No sections added yet
                                    </Typography>
                                )}
                            </List>
                        </Box>

                        {/* Settings */}
                        <Typography variant="subtitle2" sx={{ mt: 2 }}>
                            Page Settings
                        </Typography>
                        <Grid container spacing={2}>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_published}
                                            onChange={(e) => setFormData({ ...formData, is_published: e.target.checked })}
                                        />
                                    }
                                    label="Published"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.show_in_menu}
                                            onChange={(e) => setFormData({ ...formData, show_in_menu: e.target.checked })}
                                        />
                                    }
                                    label="Show in Menu"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_public}
                                            onChange={(e) => setFormData({ ...formData, is_public: e.target.checked })}
                                        />
                                    }
                                    label="Public (No Login Required)"
                                />
                            </Grid>
                            <Grid item xs={6}>
                                <TextField
                                    label="Menu Order"
                                    type="number"
                                    value={formData.menu_order}
                                    onChange={(e) => setFormData({ ...formData, menu_order: parseInt(e.target.value) })}
                                    fullWidth
                                    size="small"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setPageDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSavePage}>
                        {selectedPage ? 'Update Page' : 'Create Page'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Add/Edit Section Dialog */}
            <Dialog open={sectionDialog} onClose={() => setSectionDialog(false)} maxWidth="sm" fullWidth>
                <DialogTitle>{selectedSection ? 'Edit Section' : 'Add Section'}</DialogTitle>
                <DialogContent>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        <FormControl fullWidth>
                            <InputLabel>Section Type</InputLabel>
                            <Select
                                value={sectionFormData.type}
                                label="Section Type"
                                onChange={(e) => handleSectionTypeChange(e.target.value)}
                            >
                                {sectionTemplates.map((template) => (
                                    <MenuItem key={template.type} value={template.type}>
                                        {template.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                        <Alert severity="info">
                            <Typography variant="body2">
                                {sectionTemplates.find(t => t.type === sectionFormData.type)?.description}
                            </Typography>
                        </Alert>

                        {/* Section Content Editor */}
                        <TextField
                            label="Section Content (JSON)"
                            value={JSON.stringify(sectionFormData.content, null, 2)}
                            onChange={(e) => {
                                try {
                                    const content = JSON.parse(e.target.value);
                                    setSectionFormData({ ...sectionFormData, content });
                                } catch (err) {
                                    // Invalid JSON, ignore
                                }
                            }}
                            multiline
                            rows={10}
                            fullWidth
                            helperText="Edit section content as JSON"
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setSectionDialog(false)}>Cancel</Button>
                    <Button variant="contained" onClick={handleSaveSection}>
                        {selectedSection ? 'Update Section' : 'Add Section'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default PagesManagementScreen;

