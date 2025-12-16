// Real-time Notifications Component
import React, { useState, useEffect } from 'react';
import {
  Badge, IconButton, Popover, List, ListItem, ListItemText,
  Typography, Box, Button, Chip, Divider
} from '@mui/material';
import {
  Notifications, Favorite, Search, Chat, Star
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import apiService from '../services/api';
import toast from 'react-hot-toast';

const RealTimeNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);

  useEffect(() => {
    fetchNotifications();
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await apiService.getNotifications();
      setNotifications(response.data || []);
      setUnreadCount(response.data?.filter(n => !n.is_read).length || 0);
    } catch (error) {
    }
  };

  const markAsRead = async (notificationId) => {
    try {
      await apiService.markNotificationAsRead(notificationId);
      fetchNotifications();
    } catch (error) {
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'listing': return <Favorite color="error" />;
      case 'chat': return <Chat color="primary" />;
      case 'search': return <Search color="action" />;
      case 'system': return <Star color="warning" />;
      default: return <Notifications />;
    }
  };

  const formatTime = (date) => {
    const now = new Date();
    const notificationTime = new Date(date);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <>
      <IconButton
        onClick={(e) => setAnchorEl(e.currentTarget)}
        sx={{ position: 'relative' }}
      >
        <Badge badgeContent={unreadCount} color="error" max={99}>
          <Notifications />
        </Badge>
      </IconButton>

      <Popover
        open={Boolean(anchorEl)}
        anchorEl={anchorEl}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: { width: 360, maxHeight: 500 }
        }}
      >
        <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
          <Typography variant="h6">Notifications</Typography>
          {unreadCount > 0 && (
            <Chip
              label={`${unreadCount} new`}
              color="primary"
              size="small"
              sx={{ ml: 1 }}
            />
          )}
        </Box>

        <List sx={{ maxHeight: 400, overflow: 'auto' }}>
          {notifications.length === 0 ? (
            <ListItem>
              <ListItemText
                primary="No notifications"
                secondary="You're all caught up!"
              />
            </ListItem>
          ) : (
            notifications.map((notification, index) => (
              <motion.div
                key={notification.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <ListItem
                  onClick={() => markAsRead(notification.id)}
                  sx={{
                    cursor: 'pointer',
                    bgcolor: notification.is_read ? 'transparent' : 'action.hover',
                    '&:hover': { bgcolor: 'action.selected' }
                  }}
                >
                  <Box sx={{ mr: 2 }}>
                    {getNotificationIcon(notification.type)}
                  </Box>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <Box>
                        <Typography variant="body2" color="text.secondary">
                          {notification.message}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(notification.created_at)}
                        </Typography>
                      </Box>
                    }
                  />
                </ListItem>
                {index < notifications.length - 1 && <Divider />}
              </motion.div>
            ))
          )}
        </List>

        {notifications.length > 0 && (
          <Box sx={{ p: 2, borderTop: 1, borderColor: 'divider' }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={async () => {
                try {
                  await apiService.markAllNotificationsAsRead();
                  fetchNotifications();
                  toast.success('All notifications marked as read');
                } catch (error) {
                }
              }}
            >
              Mark All as Read
            </Button>
          </Box>
        )}
      </Popover>
    </>
  );
};

export default RealTimeNotifications;
