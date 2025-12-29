import React, { useState, useEffect } from 'react';
import {
    Box,
    Container,
    Typography,
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
    Button,
    MenuItem,
    TextField,
    Grid,
    Card,
    CardContent,
    Alert,
    CircularProgress
} from '@mui/material';
import {
    Visibility as ViewIcon,
    Delete as DeleteIcon,
    Close as CloseIcon,
    Email as EmailIcon,
    MarkEmailRead as ReadIcon
} from '@mui/icons-material';
import blogService from '../../services/blogService';

const AdminContactMessages = () => {
    const [messages, setMessages] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [openDialog, setOpenDialog] = useState(false);
    const [currentMessage, setCurrentMessage] = useState(null);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchMessages();
        fetchStats();
    }, []);

    const fetchMessages = async () => {
        try {
            setLoading(true);
            const data = await blogService.getAllContactMessages();
            setMessages(data);
        } catch (err) {
            setError('Failed to fetch messages: ' + err.message);
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

    const handleViewMessage = (message) => {
        setCurrentMessage(message);
        setOpenDialog(true);

        // Mark as read if unread
        if (message.status === 'unread') {
            handleStatusChange(message.id, 'read');
        }
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setCurrentMessage(null);
    };

    const handleStatusChange = async (id, status) => {
        try {
            await blogService.updateMessageStatus(id, status);
            setSuccess('Message status updated!');
            fetchMessages();
            fetchStats();
        } catch (err) {
            setError('Failed to update status: ' + err.message);
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this message?')) {
            try {
                await blogService.deleteMessage(id);
                setSuccess('Message deleted successfully!');
                fetchMessages();
                fetchStats();
                handleCloseDialog();
            } catch (err) {
                setError('Failed to delete message: ' + err.message);
            }
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'unread': return 'error';
            case 'read': return 'warning';
            case 'replied': return 'success';
            case 'archived': return 'default';
            default: return 'default';
        }
    };

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Typography variant="h4" fontWeight="bold" gutterBottom>
                Contact Messages
            </Typography>

            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>{success}</Alert>}

            {/* Statistics Cards */}
            {stats && (
                <Grid container spacing={3} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Total Messages</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.totalMessages}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Unread</Typography>
                                <Typography variant="h4" fontWeight="bold" color="error.main">{stats.unreadMessages}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                    <Grid item xs={12} sm={6} md={3}>
                        <Card>
                            <CardContent>
                                <Typography color="text.secondary" gutterBottom>Newsletter Subscribers</Typography>
                                <Typography variant="h4" fontWeight="bold">{stats.totalSubscribers}</Typography>
                            </CardContent>
                        </Card>
                    </Grid>
                </Grid>
            )}

            {/* Messages Table */}
            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Email</TableCell>
                            <TableCell>Subject</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Date</TableCell>
                            <TableCell align="right">Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    <CircularProgress />
                                </TableCell>
                            </TableRow>
                        ) : messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center">
                                    No messages found
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((message) => (
                                <TableRow
                                    key={message.id}
                                    sx={{
                                        bgcolor: message.status === 'unread' ? 'action.hover' : 'inherit',
                                        fontWeight: message.status === 'unread' ? 'bold' : 'normal'
                                    }}
                                >
                                    <TableCell>{message.name}</TableCell>
                                    <TableCell>{message.email}</TableCell>
                                    <TableCell>{message.subject}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={message.status}
                                            color={getStatusColor(message.status)}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell>
                                        {new Date(message.created_at).toLocaleDateString()}
                                    </TableCell>
                                    <TableCell align="right">
                                        <IconButton
                                            size="small"
                                            color="primary"
                                            onClick={() => handleViewMessage(message)}
                                        >
                                            <ViewIcon />
                                        </IconButton>
                                        <IconButton
                                            size="small"
                                            color="error"
                                            onClick={() => handleDelete(message.id)}
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

            {/* View Message Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    Message Details
                    <IconButton
                        onClick={handleCloseDialog}
                        sx={{ position: 'absolute', right: 8, top: 8 }}
                    >
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    {currentMessage && (
                        <Box>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">From:</Typography>
                                    <Typography variant="body1" fontWeight="bold">{currentMessage.name}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Email:</Typography>
                                    <Typography variant="body1">{currentMessage.email}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Subject:</Typography>
                                    <Typography variant="body1" fontWeight="bold">{currentMessage.subject}</Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Message:</Typography>
                                    <Paper sx={{ p: 2, mt: 1, bgcolor: 'background.default' }}>
                                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                                            {currentMessage.message}
                                        </Typography>
                                    </Paper>
                                </Grid>
                                <Grid item xs={12}>
                                    <Typography variant="subtitle2" color="text.secondary">Date:</Typography>
                                    <Typography variant="body2">
                                        {new Date(currentMessage.created_at).toLocaleString()}
                                    </Typography>
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        select
                                        label="Status"
                                        value={currentMessage.status}
                                        onChange={(e) => handleStatusChange(currentMessage.id, e.target.value)}
                                        size="small"
                                    >
                                        <MenuItem value="unread">Unread</MenuItem>
                                        <MenuItem value="read">Read</MenuItem>
                                        <MenuItem value="replied">Replied</MenuItem>
                                        <MenuItem value="archived">Archived</MenuItem>
                                    </TextField>
                                </Grid>
                            </Grid>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button
                        startIcon={<EmailIcon />}
                        href={`mailto:${currentMessage?.email}?subject=Re: ${currentMessage?.subject}`}
                        target="_blank"
                    >
                        Reply via Email
                    </Button>
                    <Button onClick={handleCloseDialog}>Close</Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
};

export default AdminContactMessages;
