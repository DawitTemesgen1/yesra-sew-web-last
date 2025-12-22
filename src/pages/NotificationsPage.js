import React, { useState, useEffect } from 'react';
import {
    Container,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    IconButton,
    Paper,
    Box,
    Button,
    Divider,
    CircularProgress
} from '@mui/material';
import {
    Notifications as NotificationsIcon,
    CheckCircle,
    Delete,
    Message,
    LocalOffer,
    Info
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../context/AuthContext';
import adminService from '../services/adminService';
import { formatDistanceToNow } from 'date-fns';

const NotificationsPage = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { user } = useAuth();
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchNotifications();
        } else {
            setLoading(false);
        }
    }, [user]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            const data = await adminService.getUserNotifications(user.id);
            setNotifications(data || []);
        } catch (error) {
            console.error('Error fetching notifications:', error);
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAllRead = async () => {
        try {
            await adminService.markAllNotificationsAsRead(user.id);
            setNotifications(notifications.map(n => ({ ...n, is_read: true })));
        } catch (error) {
            console.error('Error marking all as read:', error);
        }
    };

    const handleNotificationClick = async (notification) => {
        if (!notification.is_read) {
            try {
                await adminService.markNotificationAsRead(notification.id);
                setNotifications(notifications.map(n =>
                    n.id === notification.id ? { ...n, is_read: true } : n
                ));
            } catch (error) {
                console.error('Error marking notification as read:', error);
            }
        }

        // Navigate based on type or action_url
        if (notification.action_url) {
            navigate(notification.action_url);
        } else {
            switch (notification.type) {
                case 'message':
                    navigate('/chat');
                    break;
                case 'listing_approved':
                case 'listing_rejected':
                    if (notification.reference_id) {
                        navigate(`/listings/${notification.reference_id}`);
                    }
                    break;
                default:
                    break;
            }
        }
    };

    const getIcon = (type) => {
        switch (type) {
            case 'message':
                return <Message color="primary" />;
            case 'listing_approved':
                return <CheckCircle color="success" />;
            case 'listing_rejected':
                return <Info color="error" />;
            case 'promotion':
                return <LocalOffer color="secondary" />;
            default:
                return <NotificationsIcon color="action" />;
        }
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
                <Typography variant="h4" fontWeight="bold">
                    {t('notifications') || 'Notifications'}
                </Typography>
                {notifications.some(n => !n.is_read) && (
                    <Button onClick={handleMarkAllRead} startIcon={<CheckCircle />}>
                        {t('markAllAsRead') || 'Mark all as read'}
                    </Button>
                )}
            </Box>

            {!user ? (
                <Paper elevation={0} variant="outlined">
                    <Box p={4} textAlign="center">
                        <Typography color="text.secondary">
                            {t('pleaseLoginToViewNotifications') || 'Please login to view notifications'}
                        </Typography>
                        <Button variant="contained" onClick={() => navigate('/auth')} sx={{ mt: 2 }}>
                            {t('login') || 'Login'}
                        </Button>
                    </Box>
                </Paper>
            ) : (
                <Paper elevation={0} variant="outlined">
                    <List>
                        {notifications.length === 0 ? (
                            <Box p={4} textAlign="center">
                                <Typography color="text.secondary">{t('noNotifications') || 'No notifications yet'}</Typography>
                            </Box>
                        ) : (
                            notifications.map((notification, index) => (
                                <React.Fragment key={notification.id}>
                                    {index > 0 && <Divider />}
                                    <ListItem
                                        button
                                        onClick={() => handleNotificationClick(notification)}
                                        sx={{
                                            bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                                            transition: 'background-color 0.3s'
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Avatar sx={{ bgcolor: 'background.paper' }}>
                                                {getIcon(notification.type)}
                                            </Avatar>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Typography variant="subtitle1" fontWeight={notification.is_read ? 'normal' : 'bold'}>
                                                    {notification.title}
                                                </Typography>
                                            }
                                            secondary={
                                                <Box>
                                                    <Typography variant="body2" color="text.secondary" component="span">
                                                        {notification.message}
                                                    </Typography>
                                                    <Typography variant="caption" display="block" color="text.disabled" mt={0.5}>
                                                        {formatDistanceToNow(new Date(notification.created_at), { addSuffix: true })}
                                                    </Typography>
                                                </Box>
                                            }
                                        />
                                    </ListItem>
                                </React.Fragment>
                            ))
                        )}
                    </List>
                </Paper>
            )}
        </Container>
    );
};

export default NotificationsPage;

