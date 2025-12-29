import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    IconButton,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Grid,
    MenuItem,
    Tabs,
    Tab,
    Alert,
    CircularProgress,
    Switch,
    FormControlLabel
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    DragIndicator as DragIcon
} from '@mui/icons-material';
import blogService from '../../services/blogService';

const AdminFAQManagement = () => {
    const [faqs, setFaqs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentFAQ, setCurrentFAQ] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        question: { en: '', am: '', om: '', ti: '' },
        answer: { en: '', am: '', om: '', ti: '' },
        category: 'account',
        display_order: 0,
        is_active: true
    });

    useEffect(() => {
        fetchFAQs();
    }, []);

    const fetchFAQs = async () => {
        try {
            setLoading(true);
            const data = await blogService.getAllFAQs();
            setFaqs(data);
        } catch (err) {
            setError('Failed to fetch FAQs: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (faq = null) => {
        if (faq) {
            setCurrentFAQ(faq);
            setFormData({
                question: faq.question || { en: '', am: '', om: '', ti: '' },
                answer: faq.answer || { en: '', am: '', om: '', ti: '' },
                category: faq.category || 'account',
                display_order: faq.display_order || 0,
                is_active: faq.is_active !== undefined ? faq.is_active : true
            });
        } else {
            setCurrentFAQ(null);
            setFormData({
                question: { en: '', am: '', om: '', ti: '' },
                answer: { en: '', am: '', om: '', ti: '' },
                category: 'account',
                display_order: faqs.length,
                is_active: true
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentFAQ(null);
        setError('');
    };

    const handleChange = (field, value, lang = null) => {
        if (lang) {
            setFormData(prev => ({
                ...prev,
                [field]: { ...prev[field], [lang]: value }
            }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    const handleSubmit = async () => {
        try {
            setError('');
            if (currentFAQ) {
                await blogService.updateFAQ(currentFAQ.id, formData);
                setSuccess('FAQ updated successfully!');
            } else {
                await blogService.createFAQ(formData);
                setSuccess('FAQ created successfully!');
            }
            handleCloseDialog();
            fetchFAQs();
        } catch (err) {
            setError('Failed to save FAQ: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this FAQ?')) {
            try {
                await blogService.deleteFAQ(id);
                setSuccess('FAQ deleted successfully!');
                fetchFAQs();
            } catch (err) {
                setError('Failed to delete FAQ: ' + err.message);
            }
        }
    };

    const handleToggleActive = async (faq) => {
        try {
            await blogService.updateFAQ(faq.id, { is_active: !faq.is_active });
            setSuccess('FAQ status updated!');
            fetchFAQs();
        } catch (err) {
            setError('Failed to update status: ' + err.message);
        }
    };

    const getCategoryLabel = (category) => {
        const labels = {
            account: 'Account Management',
            posting: 'Posting & Listings',
            payment: 'Payment & Pricing',
            technical: 'Technical Support'
        };
        return labels[category] || category;
    };

    const getCategoryColor = (category) => {
        const colors = {
            account: 'primary',
            posting: 'success',
            payment: 'warning',
            technical: 'error'
        };
        return colors[category] || 'default';
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    FAQ Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Add New FAQ
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* FAQs Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell width={50}>Order</TableCell>
                            <TableCell>Question (EN)</TableCell>
                            <TableCell>Category</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : faqs.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    No FAQs found. Click "Add New FAQ" to create one.
                                </TableCell>
                            </TableRow>
                        ) : (
                            faqs.map((faq) => (
                                <TableRow key={faq.id}>
                                    <TableCell>
                                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                            <DragIcon sx={{ color: 'text.secondary', mr: 1 }} />
                                            {faq.display_order}
                                        </Box>
                                    </TableCell>
                                    <TableCell>{faq.question?.en || 'Untitled'}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={getCategoryLabel(faq.category)}
                                            color={getCategoryColor(faq.category)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Switch
                                            checked={faq.is_active}
                                            onChange={() => handleToggleActive(faq)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleOpenDialog(faq)}
                                        >
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(faq.id)}
                                        >
                                            <DeleteIcon />
                                        </IconButton>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentFAQ ? 'Edit FAQ' : 'Add New FAQ'}
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)} sx={{ mb: 3 }}>
                        <Tab label="English" />
                        <Tab label="Amharic" />
                        <Tab label="Oromo" />
                        <Tab label="Tigrinya" />
                        <Tab label="Settings" />
                    </Tabs>

                    {/* Language Tabs */}
                    {['en', 'am', 'om', 'ti'].map((lang, index) => (
                        <Box key={lang} hidden={activeTab !== index}>
                            <TextField
                                fullWidth
                                label="Question"
                                value={formData.question[lang]}
                                onChange={(e) => handleChange('question', e.target.value, lang)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Answer"
                                value={formData.answer[lang]}
                                onChange={(e) => handleChange('answer', e.target.value, lang)}
                                margin="normal"
                                multiline
                                rows={6}
                                required
                            />
                        </Box>
                    ))}

                    {/* Settings Tab */}
                    <Box hidden={activeTab !== 4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Category"
                                    value={formData.category}
                                    onChange={(e) => handleChange('category', e.target.value)}
                                    margin="normal"
                                    required
                                >
                                    <MenuItem value="account">Account Management</MenuItem>
                                    <MenuItem value="posting">Posting & Listings</MenuItem>
                                    <MenuItem value="payment">Payment & Pricing</MenuItem>
                                    <MenuItem value="technical">Technical Support</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    type="number"
                                    label="Display Order"
                                    value={formData.display_order}
                                    onChange={(e) => handleChange('display_order', parseInt(e.target.value))}
                                    margin="normal"
                                    helperText="Lower numbers appear first"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <FormControlLabel
                                    control={
                                        <Switch
                                            checked={formData.is_active}
                                            onChange={(e) => handleChange('is_active', e.target.checked)}
                                        />
                                    }
                                    label="Active (visible to users)"
                                />
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {currentFAQ ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminFAQManagement;
