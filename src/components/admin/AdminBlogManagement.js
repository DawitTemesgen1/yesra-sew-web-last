import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
    Button,
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
    Card,
    CardContent,
    Alert,
    CircularProgress,
    Avatar
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Visibility as ViewIcon,
    Close as CloseIcon,
    CloudUpload as UploadIcon,
    Image as ImageIcon
} from '@mui/icons-material';
import blogService from '../../services/blogService';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../contexts/LanguageContext';

const AdminBlogManagement = () => {
    const { language } = useLanguage();
    const [posts, setPosts] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentPost, setCurrentPost] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [formData, setFormData] = useState({
        title: { en: '', am: '', om: '', ti: '' },
        excerpt: { en: '', am: '', om: '', ti: '' },
        content: { en: '', am: '', om: '', ti: '' },
        image: '',
        additional_images: [],
        category: '',
        author_name: '',
        author_role: '',
        author_avatar: '',
        read_time: '5 min read',
        tags: [],
        status: 'draft'
    });
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadingAvatar, setUploadingAvatar] = useState(false);
    const [uploadingAdditional, setUploadingAdditional] = useState(false);

    // Optimized image upload with compression
    const uploadImage = async (file, folder = 'blog-images') => {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;

        const { data, error } = await supabase.storage
            .from('public-assets')
            .upload(filePath, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        const { data: { publicUrl } } = supabase.storage
            .from('public-assets')
            .getPublicUrl(filePath);

        return publicUrl;
    };

    const handleImageUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            setError('Image size should be less than 5MB');
            return;
        }

        try {
            setUploading(true);
            setUploadProgress(0);
            setError('');

            const publicUrl = await uploadImage(file);

            setFormData(prev => ({ ...prev, image: publicUrl }));
            setSuccess('Image uploaded successfully!');
            setUploadProgress(100);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload image: ' + err.message);
        } finally {
            setUploading(false);
            setTimeout(() => setUploadProgress(0), 2000);
        }
    };

    const handleAvatarUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.startsWith('image/')) {
            setError('Please upload an image file');
            return;
        }

        if (file.size > 2 * 1024 * 1024) {
            setError('Avatar size should be less than 2MB');
            return;
        }

        try {
            setUploadingAvatar(true);
            setError('');

            const publicUrl = await uploadImage(file, 'avatars');

            setFormData(prev => ({ ...prev, author_avatar: publicUrl }));
            setSuccess('Avatar uploaded successfully!');
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload avatar: ' + err.message);
        } finally {
            setUploadingAvatar(false);
        }
    };

    const handleAdditionalImagesUpload = async (event) => {
        const files = Array.from(event.target.files);
        if (files.length === 0) return;

        // Validate all files
        for (const file of files) {
            if (!file.type.startsWith('image/')) {
                setError('All files must be images');
                return;
            }
            if (file.size > 5 * 1024 * 1024) {
                setError('Each image should be less than 5MB');
                return;
            }
        }

        try {
            setUploadingAdditional(true);
            setError('');

            // Upload all images in parallel for speed
            const uploadPromises = files.map(file => uploadImage(file, 'blog-images/additional'));
            const urls = await Promise.all(uploadPromises);

            setFormData(prev => ({
                ...prev,
                additional_images: [...(prev.additional_images || []), ...urls]
            }));
            setSuccess(`${files.length} image(s) uploaded successfully!`);
        } catch (err) {
            console.error('Upload error:', err);
            setError('Failed to upload images: ' + err.message);
        } finally {
            setUploadingAdditional(false);
        }
    };

    const removeAdditionalImage = (index) => {
        setFormData(prev => ({
            ...prev,
            additional_images: prev.additional_images.filter((_, i) => i !== index)
        }));
    };

    useEffect(() => {
        fetchPosts();
        fetchStats();
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const data = await blogService.getAllPosts();
            setPosts(data);
        } catch (err) {
            setError('Failed to fetch blog posts: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const data = await blogService.getBlogStats();
            setStats(data);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    };

    const handleOpenDialog = (post = null) => {
        if (post) {
            setCurrentPost(post);
            setFormData({
                title: post.title || { en: '', am: '', om: '', ti: '' },
                excerpt: post.excerpt || { en: '', am: '', om: '', ti: '' },
                content: post.content || { en: '', am: '', om: '', ti: '' },
                image: post.image || '',
                additional_images: post.additional_images || [],
                category: post.category || '',
                author_name: post.author_name || '',
                author_role: post.author_role || '',
                author_avatar: post.author_avatar || '',
                read_time: post.read_time || '5 min read',
                tags: post.tags || [],
                status: post.status || 'draft'
            });
        } else {
            setCurrentPost(null);
            setFormData({
                title: { en: '', am: '', om: '', ti: '' },
                excerpt: { en: '', am: '', om: '', ti: '' },
                content: { en: '', am: '', om: '', ti: '' },
                image: '',
                additional_images: [],
                category: '',
                author_name: '',
                author_role: '',
                author_avatar: '',
                read_time: '5 min read',
                tags: [],
                status: 'draft'
            });
        }
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentPost(null);
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
            if (currentPost) {
                await blogService.updatePost(currentPost.id, formData);
                setSuccess('Blog post updated successfully!');
            } else {
                await blogService.createPost(formData);
                setSuccess('Blog post created successfully!');
            }
            handleCloseDialog();
            fetchPosts();
            fetchStats();
        } catch (err) {
            setError('Failed to save blog post: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this blog post?')) {
            try {
                await blogService.deletePost(id);
                setSuccess('Blog post deleted successfully!');
                fetchPosts();
                fetchStats();
            } catch (err) {
                setError('Failed to delete blog post: ' + err.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'published': return 'success';
            case 'draft': return 'warning';
            case 'archived': return 'default';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
                <Typography variant="h4" fontWeight="bold">
                    Blog Management
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                >
                    Create New Post
                </Button>
            </Box>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Posts</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.totalPosts}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Published</Typography>
                                <Typography variant="h4" fontWeight="bold" color="success.main">{stats.publishedPosts}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Drafts</Typography>
                                <Typography variant="h4" fontWeight="bold" color="warning.main">{stats.draftPosts}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Views</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.totalViews}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Posts Grid */}
            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress size={60} />
                </Box>
            ) : posts.length === 0 ? (
                <Paper sx={{ p: 8, textAlign: 'center' }}>
                    <Typography variant="h6" color="text.secondary">
                        No blog posts found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Click "Create New Post" to add your first blog post
                    </Typography>
                </Paper>
            ) : (
                <Grid container spacing={3}>
                    {posts.map((post) => (
                        <Grid item xs={12} sm={6} md={4} key={post.id}>
                            <Card
                                sx={{
                                    height: '100%',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    transition: 'all 0.3s ease',
                                    '&:hover': {
                                        transform: 'translateY(-4px)',
                                        boxShadow: 6
                                    }
                                }}
                            >
                                {/* Featured Image */}
                                {post.image && (
                                    <Box
                                        component="img"
                                        src={post.image}
                                        alt={post.title?.en || 'Blog post'}
                                        sx={{
                                            width: '100%',
                                            height: 200,
                                            objectFit: 'cover',
                                            bgcolor: 'grey.200'
                                        }}
                                    />
                                )}

                                <CardContent sx={{ flexGrow: 1, pb: 1 }}>
                                    {/* Category & Status */}
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                                        <Chip
                                            label={post.category}
                                            size="small"
                                            color="primary"
                                            variant="outlined"
                                        />
                                        <Chip
                                            label={post.status}
                                            color={getStatusColor(post.status)}
                                            size="small"
                                        />
                                    </Box>

                                    {/* Title */}
                                    <Typography
                                        variant="h6"
                                        fontWeight="bold"
                                        gutterBottom
                                        sx={{
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            display: '-webkit-box',
                                            WebkitLineClamp: 2,
                                            WebkitBoxOrient: 'vertical',
                                            minHeight: '3.6em'
                                        }}
                                    >
                                        {post.title?.en || 'Untitled'}
                                    </Typography>

                                    {/* Author & Date */}
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                        {post.author_avatar && (
                                            <Avatar
                                                src={post.author_avatar}
                                                sx={{ width: 24, height: 24 }}
                                            />
                                        )}
                                        <Typography variant="body2" color="text.secondary">
                                            {post.author_name}
                                        </Typography>
                                    </Box>

                                    <Typography variant="caption" color="text.secondary">
                                        {new Date(post.published_date).toLocaleDateString()} • {post.views || 0} views
                                    </Typography>

                                    {/* Additional Images Indicator */}
                                    {post.additional_images && post.additional_images.length > 0 && (
                                        <Box sx={{ mt: 1 }}>
                                            <Chip
                                                icon={<ImageIcon />}
                                                label={`+${post.additional_images.length} images`}
                                                size="small"
                                                variant="outlined"
                                                color="secondary"
                                            />
                                        </Box>
                                    )}
                                </CardContent>

                                {/* Actions */}
                                <Box sx={{ p: 2, pt: 0, display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                                    <IconButton
                                        size="small"
                                        color="primary"
                                        onClick={() => handleOpenDialog(post)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                        onClick={() => handleDelete(post.id)}
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </Box>
                            </Card>
                        </Grid>
                    ))}
                </Grid>
            )}

            {/* Create/Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentPost ? 'Edit Blog Post' : 'Create New Blog Post'}
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
                                label="Title"
                                value={formData.title[lang]}
                                onChange={(e) => handleChange('title', e.target.value, lang)}
                                margin="normal"
                                required
                            />
                            <TextField
                                fullWidth
                                label="Excerpt"
                                value={formData.excerpt[lang]}
                                onChange={(e) => handleChange('excerpt', e.target.value, lang)}
                                margin="normal"
                                multiline
                                rows={2}
                                required
                            />
                            <TextField
                                fullWidth
                                label="Content"
                                value={formData.content[lang]}
                                onChange={(e) => handleChange('content', e.target.value, lang)}
                                margin="normal"
                                multiline
                                rows={10}
                                required
                            />
                        </Box>
                    ))}

                    {/* Settings Tab */}
                    <Box hidden={activeTab !== 4}>
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold">
                                    Featured Image
                                </Typography>

                                {/* Image Preview */}
                                {formData.image && (
                                    <Box sx={{ mb: 2, position: 'relative' }}>
                                        <img
                                            src={formData.image}
                                            alt="Preview"
                                            style={{
                                                width: '100%',
                                                maxHeight: '300px',
                                                objectFit: 'cover',
                                                borderRadius: '8px'
                                            }}
                                        />
                                        <IconButton
                                            size="small"
                                            onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                                            sx={{
                                                position: 'absolute',
                                                top: 8,
                                                right: 8,
                                                bgcolor: 'error.main',
                                                color: 'white',
                                                '&:hover': { bgcolor: 'error.dark' }
                                            }}
                                        >
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Box>
                                )}

                                {/* Upload Button */}
                                <Button
                                    variant="contained"
                                    component="label"
                                    startIcon={uploading ? <CircularProgress size={20} color="inherit" /> : <UploadIcon />}
                                    disabled={uploading}
                                    fullWidth
                                    sx={{ mb: 2 }}
                                >
                                    {uploading ? `Uploading... ${uploadProgress}%` : 'Upload Image'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                    />
                                </Button>

                                {/* Manual URL Input (Optional) */}
                                <TextField
                                    fullWidth
                                    label="Or Enter Image URL Manually"
                                    value={formData.image}
                                    onChange={(e) => handleChange('image', e.target.value)}
                                    margin="normal"
                                    helperText="Upload an image or paste URL (max 5MB)"
                                    InputProps={{
                                        startAdornment: <ImageIcon sx={{ mr: 1, color: 'text.secondary' }} />
                                    }}
                                />
                            </Grid>
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
                                    <MenuItem value="Career Advice">Career Advice</MenuItem>
                                    <MenuItem value="Business">Business</MenuItem>
                                    <MenuItem value="Real Estate">Real Estate</MenuItem>
                                    <MenuItem value="Automotive">Automotive</MenuItem>
                                    <MenuItem value="Technology">Technology</MenuItem>
                                    <MenuItem value="Construction">Construction</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    select
                                    label="Status"
                                    value={formData.status}
                                    onChange={(e) => handleChange('status', e.target.value)}
                                    margin="normal"
                                    required
                                >
                                    <MenuItem value="draft">Draft</MenuItem>
                                    <MenuItem value="published">Published</MenuItem>
                                    <MenuItem value="archived">Archived</MenuItem>
                                </TextField>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Author Name"
                                    value={formData.author_name}
                                    onChange={(e) => handleChange('author_name', e.target.value)}
                                    margin="normal"
                                    required
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Author Role"
                                    value={formData.author_role}
                                    onChange={(e) => handleChange('author_role', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <Typography variant="subtitle2" gutterBottom>
                                    Author Avatar
                                </Typography>
                                {formData.author_avatar && (
                                    <Box sx={{ mb: 1 }}>
                                        <img
                                            src={formData.author_avatar}
                                            alt="Avatar"
                                            style={{
                                                width: '80px',
                                                height: '80px',
                                                objectFit: 'cover',
                                                borderRadius: '50%'
                                            }}
                                        />
                                    </Box>
                                )}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={uploadingAvatar ? <CircularProgress size={16} /> : <UploadIcon />}
                                    disabled={uploadingAvatar}
                                    size="small"
                                    sx={{ mb: 1 }}
                                >
                                    {uploadingAvatar ? 'Uploading...' : 'Upload Avatar'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        onChange={handleAvatarUpload}
                                    />
                                </Button>
                                <TextField
                                    fullWidth
                                    label="Or Enter Avatar URL"
                                    value={formData.author_avatar}
                                    onChange={(e) => handleChange('author_avatar', e.target.value)}
                                    size="small"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    label="Read Time"
                                    value={formData.read_time}
                                    onChange={(e) => handleChange('read_time', e.target.value)}
                                    margin="normal"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    label="Tags (comma separated)"
                                    value={formData.tags.join(', ')}
                                    onChange={(e) => handleChange('tags', e.target.value.split(',').map(t => t.trim()))}
                                    margin="normal"
                                    helperText="Enter tags separated by commas"
                                />
                            </Grid>

                            {/* Additional Images Section */}
                            <Grid item xs={12}>
                                <Typography variant="subtitle1" gutterBottom fontWeight="bold" sx={{ mt: 2 }}>
                                    Additional Images (Gallery)
                                </Typography>

                                {/* Preview Grid */}
                                {formData.additional_images && formData.additional_images.length > 0 && (
                                    <Grid container spacing={2} sx={{ mb: 2 }}>
                                        {formData.additional_images.map((url, index) => (
                                            <Grid item xs={6} sm={4} md={3} key={index}>
                                                <Box sx={{ position: 'relative' }}>
                                                    <img
                                                        src={url}
                                                        alt={`Additional ${index + 1}`}
                                                        style={{
                                                            width: '100%',
                                                            height: '120px',
                                                            objectFit: 'cover',
                                                            borderRadius: '8px'
                                                        }}
                                                    />
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => removeAdditionalImage(index)}
                                                        sx={{
                                                            position: 'absolute',
                                                            top: 4,
                                                            right: 4,
                                                            bgcolor: 'error.main',
                                                            color: 'white',
                                                            '&:hover': { bgcolor: 'error.dark' },
                                                            width: 24,
                                                            height: 24
                                                        }}
                                                    >
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Box>
                                            </Grid>
                                        ))}
                                    </Grid>
                                )}

                                {/* Upload Button */}
                                <Button
                                    variant="outlined"
                                    component="label"
                                    startIcon={uploadingAdditional ? <CircularProgress size={20} /> : <UploadIcon />}
                                    disabled={uploadingAdditional}
                                    fullWidth
                                >
                                    {uploadingAdditional ? 'Uploading...' : 'Upload Additional Images (Multiple)'}
                                    <input
                                        type="file"
                                        hidden
                                        accept="image/*"
                                        multiple
                                        onChange={handleAdditionalImagesUpload}
                                    />
                                </Button>
                                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                                    Select multiple images to create a gallery. Max 5MB per image.
                                </Typography>
                            </Grid>
                        </Grid>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Cancel</Button>
                    <Button onClick={handleSubmit} variant="contained">
                        {currentPost ? 'Update' : 'Create'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Container >
    );
};

export default AdminBlogManagement;
