import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Box,
    Container,
    Typography,
    Avatar,
    Chip,
    IconButton,
    Divider,
    Button,
    useTheme,
    alpha,
    Card,
    CardContent,
    useMediaQuery,
    AppBar,
    Toolbar,
    Dialog,
    DialogContent,
    Fade,
    Backdrop,
    TextField,
    InputAdornment,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText
} from '@mui/material';
import {
    ArrowBack as ArrowBackIcon,
    AccessTime as TimeIcon,
    CalendarToday as CalendarIcon,
    Facebook,
    Twitter,
    LinkedIn,
    Share as ShareIcon,
    ThumbUp as LikeIcon,
    Comment as CommentIcon,
    BookmarkBorder as BookmarkIcon,
    Close as CloseIcon,
    ZoomIn as ZoomIcon,
    Collections as GalleryIcon,
    Send as SendIcon,
    ThumbUpOutlined as LikeBorderIcon
} from '@mui/icons-material';
import { motion, useScroll, useTransform } from 'framer-motion';
import blogService from '../services/blogService';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../context/AuthContext';
import { CircularProgress, Alert } from '@mui/material';
import toast from 'react-hot-toast';

const BlogDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const { language } = useLanguage();
    const { user, isAuthenticated } = useAuth(); // Auth context
    const { scrollY } = useScroll();

    // Dynamic opacity for mobile header
    const headerOpacity = useTransform(scrollY, [0, 200], [0, 1]);
    const [isScrolled, setIsScrolled] = useState(false);
    const [post, setPost] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [selectedImage, setSelectedImage] = useState(null);

    // Engagement State
    const [comments, setComments] = useState([]);
    const [commentText, setCommentText] = useState('');
    const [likesCount, setLikesCount] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [submittingComment, setSubmittingComment] = useState(false);

    useEffect(() => {
        const unsubscribe = scrollY.onChange(v => setIsScrolled(v > 50));
        return () => unsubscribe();
    }, [scrollY]);

    useEffect(() => {
        fetchPost();
        window.scrollTo(0, 0);
    }, [id]);

    // Fetch initial engagement data when post loads
    useEffect(() => {
        if (post) {
            setLikesCount(post.likes_count || 0);
            fetchComments();
            if (isAuthenticated) {
                checkLikeStatus();
            }
        }
    }, [post, isAuthenticated]);

    const fetchPost = async () => {
        try {
            setLoading(true);
            const data = await blogService.getPostById(id);
            setPost(data);
            setError('');
        } catch (err) {
            console.error('Error fetching post:', err);
            setError('Failed to load blog post');
        } finally {
            setLoading(false);
        }
    };

    const fetchComments = async () => {
        try {
            const data = await blogService.getComments(id);
            setComments(data || []);
        } catch (err) {
            console.error('Error fetching comments:', err);
        }
    };

    const checkLikeStatus = async () => {
        try {
            const status = await blogService.checkUserLike(id);
            setIsLiked(status);
        } catch (err) {
            console.error(err);
        }
    };

    const handleLike = async () => {
        if (!isAuthenticated) {
            toast.error('Please login to like this post');
            return;
        }

        // Optimistic update
        const newStatus = !isLiked;
        setIsLiked(newStatus);
        setLikesCount(prev => newStatus ? prev + 1 : prev - 1);

        try {
            await blogService.toggleLike(id);
        } catch (err) {
            // Revert on error
            setIsLiked(!newStatus);
            setLikesCount(prev => newStatus ? prev - 1 : prev + 1);
            toast.error('Failed to update like');
        }
    };

    const handleCommentSubmit = async () => {
        if (!commentText.trim()) return;

        if (!isAuthenticated) {
            toast.error('Please login to comment');
            return;
        }

        setSubmittingComment(true);
        try {
            const newComment = {
                post_id: id,
                user_id: user.id,
                author_name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
                author_avatar: user.user_metadata?.avatar_url,
                content: commentText
            };

            await blogService.submitComment(newComment);
            setCommentText('');
            toast.success('Comment posted!');
            fetchComments(); // Refresh list

            // Increment local comment count if we had one (optional, currently strictly using state)
        } catch (err) {
            console.error(err);
            toast.error('Failed to post comment');
        } finally {
            setSubmittingComment(false);
        }
    };

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
                <CircularProgress size={60} />
            </Box>
        );
    }

    if (error || !post) {
        return (
            <Container sx={{ py: 10, textAlign: 'center' }}>
                {error && <Alert severity="error" sx={{ mb: 3 }}>{error}</Alert>}
                <Typography variant="h4">Post not found</Typography>
                <Button onClick={() => navigate('/blog')} sx={{ mt: 2 }}>Back to Blog</Button>
            </Container>
        );
    }

    // Extract multilingual content
    const title = post.title?.[language] || post.title?.en || 'Untitled';
    const content = post.content?.[language] || post.content?.en || '';

    return (
        <Box sx={{ minHeight: '100vh', bgcolor: 'background.paper', pb: { xs: 8, md: 8 } }}>

            {/* Desktop Navigation Bar */}
            {!isMobile && (
                <Box sx={{
                    position: 'sticky',
                    top: 0,
                    zIndex: 100,
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    backdropFilter: 'blur(10px)',
                    borderBottom: `1px solid ${theme.palette.divider}`
                }}>
                    <Container maxWidth="lg" sx={{ py: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Button
                            startIcon={<ArrowBackIcon />}
                            onClick={() => navigate('/blog')}
                            color="inherit"
                            sx={{ fontWeight: 600 }}
                        >
                            Back to Blog
                        </Button>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button
                                variant="contained"
                                size="small"
                                startIcon={<ShareIcon />}
                                sx={{ borderRadius: 20, ml: 1, textTransform: 'none' }}
                            >
                                Share
                            </Button>
                        </Box>
                    </Container>
                </Box>
            )}

            {/* Mobile Navigation Bar (Floating Back Button) */}
            {isMobile && (
                <AppBar
                    position="fixed"
                    color="transparent"
                    elevation={isScrolled ? 4 : 0}
                    sx={{
                        bgcolor: isScrolled ? 'background.paper' : 'transparent',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <Toolbar sx={{ justifyContent: 'space-between' }}>
                        <IconButton
                            onClick={() => navigate('/blog')}
                            sx={{
                                bgcolor: isScrolled ? 'transparent' : 'rgba(0,0,0,0.3)',
                                color: isScrolled ? 'text.primary' : 'white',
                                '&:hover': { bgcolor: isScrolled ? 'action.hover' : 'rgba(0,0,0,0.5)' }
                            }}
                        >
                            <ArrowBackIcon />
                        </IconButton>
                        {isScrolled && (
                            <Typography variant="subtitle1" fontWeight="bold" noWrap sx={{ maxWidth: '60%', color: 'text.primary' }}>
                                {title}
                            </Typography>
                        )}
                        <IconButton
                            sx={{
                                bgcolor: isScrolled ? 'transparent' : 'rgba(0,0,0,0.3)',
                                color: isScrolled ? 'text.primary' : 'white'
                            }}
                        >
                            <ShareIcon />
                        </IconButton>
                    </Toolbar>
                </AppBar>
            )}

            {/* Hero Section */}
            <Box sx={{ position: 'relative', height: { xs: '350px', md: '500px' }, overflow: 'hidden' }}>
                <Card
                    component={motion.div}
                    initial={{ scale: 1.1 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.8 }}
                    sx={{
                        height: '100%',
                        width: '100%',
                        borderRadius: 0,
                        border: 'none',
                        position: 'relative'
                    }}
                >
                    <Box
                        component="img"
                        src={post.image}
                        alt={post.title}
                        sx={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                    />
                    <Box sx={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'linear-gradient(to bottom, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.6) 60%, rgba(0,0,0,0.9) 100%)'
                    }} />
                </Card>

                <Container maxWidth="md" sx={{
                    position: 'absolute',
                    bottom: 0,
                    left: '50%',
                    transform: 'translateX(-50%)',
                    pb: { xs: 4, md: 8 },
                    color: 'white',
                    zIndex: 2,
                    width: '100%'
                }}>
                    <motion.div
                        initial={{ y: 30, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3, duration: 0.6 }}
                    >
                        <Chip
                            label={post.category}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                color: 'white',
                                fontWeight: 'bold',
                                mb: 2
                            }}
                        />
                        <Typography variant={isMobile ? "h4" : "h3"} component="h1" fontWeight="800" gutterBottom sx={{
                            fontSize: { xs: '1.75rem', md: '3.5rem' },
                            lineHeight: 1.2,
                            textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            mb: 2
                        }}>
                            {title}
                        </Typography>

                        <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 3, opacity: 0.95 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <Avatar src={post.author_avatar} sx={{ width: isMobile ? 32 : 40, height: isMobile ? 32 : 40, border: '2px solid white', mr: 1.5 }} />
                                <Box>
                                    <Typography variant="subtitle2" fontWeight="bold">
                                        {post.author_name}
                                    </Typography>
                                    {!isMobile && (
                                        <Typography variant="caption" sx={{ opacity: 0.8 }}>
                                            {post.author_role}
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                            {!isMobile && <Divider orientation="vertical" flexItem sx={{ bgcolor: 'rgba(255,255,255,0.3)' }} />}
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                                <CalendarIcon fontSize="inherit" sx={{ mr: 1 }} />
                                {new Date(post.published_date).toLocaleDateString()}
                            </Box>
                            <Box sx={{ display: 'flex', alignItems: 'center', fontSize: '0.875rem' }}>
                                <TimeIcon fontSize="inherit" sx={{ mr: 1 }} />
                                {post.read_time}
                            </Box>
                        </Box>
                    </motion.div>
                </Container>
            </Box>

            {/* Content Section */}
            <Container maxWidth="md" sx={{ mt: { xs: 4, md: 6 }, px: { xs: 2, md: 3 } }}>
                <Box component={motion.div}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    sx={{
                        typography: 'body1',
                        fontSize: { xs: '1.05rem', md: '1.2rem' },
                        lineHeight: 1.8,
                        color: 'text.primary',
                        fontFamily: isMobile ? '"Roboto", "Helvetica", "Arial", sans-serif' : 'inherit',
                        '& h3': {
                            fontSize: { xs: '1.4rem', md: '1.8rem' },
                            fontWeight: 700,
                            mt: 4,
                            mb: 2,
                            color: theme.palette.text.primary
                        },
                        '& p': { mb: 2 },
                        '& ul': { mb: 3, pl: 3 },
                        '& li': { mb: 1 },
                        '& blockquote': {
                            borderLeft: `4px solid ${theme.palette.primary.main}`,
                            pl: 3,
                            py: 1,
                            my: 4,
                            bgcolor: alpha(theme.palette.primary.main, 0.05),
                            fontStyle: 'italic',
                            fontSize: '1.25rem',
                            fontWeight: 500,
                            borderRadius: '0 8px 8px 0'
                        }
                    }}
                    dangerouslySetInnerHTML={{ __html: content }}
                />

                {/* Gallery Section */}
                {post.additional_images && post.additional_images.length > 0 && (
                    <Box component={motion.div}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        sx={{ mt: 6, mb: 4 }}
                    >
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                            <GalleryIcon color="primary" sx={{ mr: 1 }} />
                            <Typography variant="h5" fontWeight="bold">
                                Image Gallery
                            </Typography>
                        </Box>

                        <Box sx={{
                            display: 'grid',
                            gridTemplateColumns: {
                                xs: '1fr',
                                sm: 'repeat(2, 1fr)',
                                md: 'repeat(3, 1fr)' // Changed to 3 for better desktop layout
                            },
                            gap: 2
                        }}>
                            {post.additional_images.map((img, index) => (
                                <Box
                                    key={index}
                                    component={motion.div}
                                    whileHover={{ y: -5 }}
                                    onClick={() => setSelectedImage(img)}
                                    sx={{
                                        position: 'relative',
                                        paddingTop: '75%', // 4:3 Aspect Ratio
                                        borderRadius: 2,
                                        overflow: 'hidden',
                                        cursor: 'pointer',
                                        boxShadow: 2,
                                        bgcolor: 'grey.100',
                                        '&:hover .zoom-overlay': { opacity: 1 }
                                    }}
                                >
                                    <Box
                                        component="img"
                                        src={img}
                                        alt={`Gallery image ${index + 1}`}
                                        loading="lazy"
                                        sx={{
                                            position: 'absolute',
                                            top: 0,
                                            left: 0,
                                            width: '100%',
                                            height: '100%',
                                            objectFit: 'cover',
                                            transition: 'transform 0.5s ease',
                                            '&:hover': { transform: 'scale(1.05)' }
                                        }}
                                    />
                                    <Box
                                        className="zoom-overlay"
                                        sx={{
                                            position: 'absolute',
                                            inset: 0,
                                            bgcolor: 'rgba(0,0,0,0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            opacity: 0,
                                            transition: 'opacity 0.3s ease'
                                        }}
                                    >
                                        <ZoomIcon sx={{ color: 'white', fontSize: 32 }} />
                                    </Box>
                                </Box>
                            ))}
                        </Box>
                    </Box>
                )}

                {/* Tags */}
                <Box sx={{ mt: 4, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    {post.tags && post.tags.map((tag, idx) => (
                        <Chip key={idx} label={`#${tag}`} variant="outlined" onClick={() => { }} clickable size={isMobile ? "small" : "medium"} />
                    ))}
                </Box>

                <Divider sx={{ my: 4 }} />

                {/* Engagement Actions (Desktop/Tablet) */}
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 4 }}>
                    <Button
                        variant={isLiked ? "contained" : "outlined"}
                        color="primary"
                        startIcon={isLiked ? <LikeIcon /> : <LikeBorderIcon />}
                        onClick={handleLike}
                        sx={{ borderRadius: 20, px: 3 }}
                    >
                        {likesCount} {likesCount === 1 ? 'Like' : 'Likes'}
                    </Button>
                    <Button
                        variant="outlined"
                        color="inherit"
                        startIcon={<CommentIcon />}
                        sx={{ borderRadius: 20, px: 3 }}
                    >
                        {comments.length} {comments.length === 1 ? 'Comment' : 'Comments'}
                    </Button>
                </Box>

                {/* Author Bio Box */}
                <Card sx={{ bgcolor: alpha(theme.palette.background.default, 0.5), boxShadow: 'none', border: `1px solid ${theme.palette.divider}`, mb: 6 }}>
                    <CardContent sx={{ display: 'flex', alignItems: { xs: 'flex-start', md: 'center' }, gap: 2, flexDirection: 'row' }}>
                        <Avatar src={post.author_avatar} sx={{ width: { xs: 50, md: 80 }, height: { xs: 50, md: 80 } }} />
                        <Box>
                            <Typography variant="h6" fontWeight="bold">{post.author_name}</Typography>
                            <Typography variant="body2" color="text.secondary">
                                {post.author_role} • Regular Contributor
                            </Typography>
                        </Box>
                    </CardContent>
                </Card>

                {/* Comments Section */}
                <Box id="comments-section" sx={{ mb: 10 }}>
                    <Typography variant="h5" fontWeight="bold" sx={{ mb: 3 }}>
                        Comments ({comments.length})
                    </Typography>

                    {/* Comment Input */}
                    <Box sx={{ display: 'flex', gap: 2, mb: 4 }}>
                        <Avatar src={user?.user_metadata?.avatar_url} />
                        <Box sx={{ flexGrow: 1 }}>
                            {isAuthenticated ? (
                                <Box component="form" onSubmit={(e) => { e.preventDefault(); handleCommentSubmit(); }}>
                                    <TextField
                                        fullWidth
                                        multiline
                                        minRows={2}
                                        placeholder="Write a comment..."
                                        value={commentText}
                                        onChange={(e) => setCommentText(e.target.value)}
                                        variant="outlined"
                                        disabled={submittingComment}
                                        sx={{
                                            bgcolor: 'background.paper',
                                            '& .MuiOutlinedInput-root': { borderRadius: 3 }
                                        }}
                                    />
                                    <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                        <Button
                                            type="submit"
                                            variant="contained"
                                            disabled={!commentText.trim() || submittingComment}
                                            endIcon={submittingComment ? <CircularProgress size={20} /> : <SendIcon />}
                                            sx={{ borderRadius: 20 }}
                                        >
                                            Post Comment
                                        </Button>
                                    </Box>
                                </Box>
                            ) : (
                                <Button
                                    variant="outlined"
                                    fullWidth
                                    onClick={() => navigate('/login', { state: { from: `/blog/${id}` } })}
                                    sx={{ py: 2, borderStyle: 'dashed', borderRadius: 3 }}
                                >
                                    Log in to join the conversation
                                </Button>
                            )}
                        </Box>
                    </Box>

                    {/* Comments List */}
                    <List disablePadding>
                        {comments.map((comment) => (
                            <React.Fragment key={comment.id}>
                                <ListItem alignItems="flex-start" sx={{ px: 0 }}>
                                    <ListItemAvatar>
                                        <Avatar src={comment.author_avatar} alt={comment.author_name}>
                                            {comment.author_name?.[0]}
                                        </Avatar>
                                    </ListItemAvatar>
                                    <ListItemText
                                        primary={
                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                <Typography variant="subtitle2" fontWeight="bold">
                                                    {comment.author_name}
                                                </Typography>
                                                <Typography variant="caption" color="text.secondary">
                                                    {new Date(comment.created_at).toLocaleDateString()}
                                                </Typography>
                                            </Box>
                                        }
                                        secondary={
                                            <Typography variant="body2" color="text.primary" sx={{ mt: 0.5 }}>
                                                {comment.content}
                                            </Typography>
                                        }
                                    />
                                </ListItem>
                                <Divider component="li" variant="inset" />
                            </React.Fragment>
                        ))}
                        {comments.length === 0 && (
                            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ py: 4 }}>
                                No comments yet. Be the first to share your thoughts!
                            </Typography>
                        )}
                    </List>
                </Box>

            </Container>

            {/* Lightbox Modal */}
            <Dialog
                open={Boolean(selectedImage)}
                onClose={() => setSelectedImage(null)}
                maxWidth="lg"
                fullWidth
                PaperProps={{
                    style: {
                        backgroundColor: 'transparent',
                        boxShadow: 'none',
                        overflow: 'hidden'
                    }
                }}
                BackdropProps={{
                    style: {
                        backgroundColor: 'rgba(0, 0, 0, 0.9)'
                    }
                }}
            >
                <DialogContent sx={{ position: 'relative', p: 0, textAlign: 'center', height: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <IconButton
                        onClick={() => setSelectedImage(null)}
                        sx={{
                            position: 'absolute',
                            top: 10,
                            right: 10,
                            color: 'white',
                            bgcolor: 'rgba(0,0,0,0.5)',
                            '&:hover': { bgcolor: 'rgba(0,0,0,0.7)' },
                            zIndex: 10
                        }}
                    >
                        <CloseIcon />
                    </IconButton>
                    {selectedImage && (
                        <Box
                            component="img"
                            src={selectedImage}
                            alt="Full screen view"
                            sx={{
                                maxWidth: '100%',
                                maxHeight: '100%',
                                objectFit: 'contain',
                                boxShadow: 5
                            }}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* Mobile Bottom Action Bar */}
            {isMobile && (
                <Box sx={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    bgcolor: 'background.paper',
                    borderTop: `1px solid ${theme.palette.divider}`,
                    px: 3,
                    py: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    zIndex: 1000,
                    boxShadow: '0 -4px 20px rgba(0,0,0,0.05)'
                }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                        <IconButton size="small" color={isLiked ? "primary" : "inherit"} onClick={handleLike}>
                            {isLiked ? <LikeIcon fontSize="small" /> : <LikeBorderIcon fontSize="small" />}
                        </IconButton>
                        <Typography variant="caption" sx={{ alignSelf: 'center', ml: -0.5, mr: 2, fontWeight: 'bold' }}>
                            {likesCount}
                        </Typography>

                        <IconButton
                            size="small"
                            color="inherit"
                            onClick={() => document.getElementById('comments-section')?.scrollIntoView({ behavior: 'smooth' })}
                        >
                            <CommentIcon fontSize="small" />
                        </IconButton>
                        <Typography variant="caption" sx={{ alignSelf: 'center', ml: -0.5, fontWeight: 'bold' }}>
                            {comments.length}
                        </Typography>

                    </Box>
                    <IconButton color="primary">
                        <BookmarkIcon />
                    </IconButton>
                </Box>
            )}
        </Box>
    );
};

export default BlogDetailPage;
