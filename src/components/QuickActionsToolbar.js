// Quick Actions Toolbar Component
import React, { useState, useRef, useEffect } from 'react';
import {
  Box, Button, Typography, SpeedDial, SpeedDialIcon, SpeedDialAction,
  Fab, Tooltip, useTheme, useMediaQuery, IconButton, Collapse
} from '@mui/material';
import {
  Add, Camera, Phone, Message, Share, Favorite, LocationOn,
  Star, Search, Filter, Compare, Bookmark, Report, Help,
  ExpandMore, ExpandLess, Bolt
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

const QuickActionsToolbar = ({ listing, user, onAction }) => {
  const [speedDialOpen, setSpeedDialOpen] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isDesktopExpanded, setIsDesktopExpanded] = useState(true);
  const dragRef = useRef(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const navigate = useNavigate();

  const handleQuickAction = (action) => {
    switch (action) {
      case 'post':
        navigate('/post-ad');
        break;
      case 'scan':
        console.log('Camera feature coming soon!');
        break;
      case 'call':
        if (listing?.phone_number) {
          window.location.href = `tel:${listing.phone_number}`;
        } else {
          console.log('Phone number not available');
        }
        break;
      case 'chat':
        if (listing?.author_id) {
          navigate(`/chat/${listing.author_id}`);
        } else {
          console.log('Chat not available');
        }
        break;
      case 'share':
        if (navigator.share) {
          navigator.share({
            title: listing?.title || 'Check this out!',
            text: listing?.description || 'Found this on YesraSew',
            url: window.location.href
          });
        } else {
          navigator.clipboard.writeText(window.location.href);
          console.log('Link copied to clipboard!');
        }
        break;
      case 'favorite':
        // Toggle favorite logic
        if (onAction) {
          onAction('favorite', listing);
        }
        break;
      case 'location':
        if (listing?.location) {
          window.open(`https://maps.google.com/?q=${encodeURIComponent(listing.location)}`);
        } else {
          console.log('Location not available');
        }
        break;
      case 'review':
        navigate(`/listings/${listing?.id}/review`);
        break;
      case 'search':
        navigate('/search');
        break;
      case 'filter':
        // Open filter dialog
        if (onAction) {
          onAction('filter');
        }
        break;
      case 'compare':
        navigate('/compare');
        break;
      case 'bookmark':
        if (onAction) {
          onAction('bookmark', listing);
        }
        break;
      case 'report':
        if (listing?.id) {
          navigate(`/report/listing/${listing.id}`);
        } else {
          console.log('Report not available');
        }
        break;
      case 'help':
        navigate('/help');
        break;
      default:
        break;
    }
    setSpeedDialOpen(false);
  };

  const quickActions = [
    { icon: <Add />, name: 'Post Ad', action: 'post', color: 'primary' },
    { icon: <Camera />, name: 'Scan QR', action: 'scan', color: 'secondary' },
    { icon: <Phone />, name: 'Call Seller', action: 'call', color: 'success', listingOnly: true },
    { icon: <Message />, name: 'Chat', action: 'chat', color: 'info', listingOnly: true },
    { icon: <Share />, name: 'Share', action: 'share', color: 'default' },
    { icon: <Favorite />, name: 'Save', action: 'favorite', color: 'error', listingOnly: true },
    { icon: <LocationOn />, name: 'Location', action: 'location', color: 'warning', listingOnly: true },
    { icon: <Star />, name: 'Review', action: 'review', color: 'warning', listingOnly: true },
    { icon: <Search />, name: 'Search', action: 'search', color: 'primary' },
    { icon: <Filter />, name: 'Filter', action: 'filter', color: 'secondary' },
    { icon: <Compare />, name: 'Compare', action: 'compare', color: 'info' },
    { icon: <Bookmark />, name: 'Bookmark', action: 'bookmark', color: 'success' },
    { icon: <Report />, name: 'Report', action: 'report', color: 'error', listingOnly: true },
    { icon: <Help />, name: 'Help', action: 'help', color: 'default' }
  ];

  const filteredActions = listing
    ? quickActions.filter(action => !action.listingOnly || action.listingOnly)
    : quickActions.filter(action => !action.listingOnly);

  // Draggable functionality
  const handleMouseDown = (e) => {
    if (isDragging) return;
    setIsDragging(true);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;

    const newX = e.clientX - window.innerWidth + 60; // Position from right edge
    const newY = e.clientY - window.innerHeight + 100; // Position from bottom edge

    // Constrain to screen bounds
    const maxX = 0;
    const maxY = 0;
    const minX = -window.innerWidth + 100;
    const minY = -window.innerHeight + 200;

    setPosition({
      x: Math.max(minX, Math.min(maxX, newX)),
      y: Math.max(minY, Math.min(maxY, newY))
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging]);

  // Mobile Floating Action Button
  if (isMobile) {
    return (
      <Box
        ref={dragRef}
        sx={{
          position: 'fixed',
          bottom: 100,
          right: 20,
          zIndex: 1000,
          cursor: isDragging ? 'grabbing' : 'grab',
          transform: `translate(${position.x}px, ${position.y}px)`,
          transition: isDragging ? 'none' : 'all 0.3s ease',
          '&:hover': {
            transform: `translate(${position.x}px, ${position.y}px) scale(1.02)`
          }
        }}
        onMouseDown={handleMouseDown}
      >
        <SpeedDial
          ariaLabel="Quick actions"
          icon={<SpeedDialIcon icon={<Bolt />} />}
          onClose={() => setSpeedDialOpen(false)}
          onOpen={() => setSpeedDialOpen(true)}
          open={speedDialOpen}
          direction="up"
        >
          {filteredActions.map((action) => (
            <SpeedDialAction
              key={action.name}
              icon={action.icon}
              tooltipTitle={action.name}
              onClick={() => handleQuickAction(action.action)}
              FabProps={{
                sx: {
                  bgcolor: `${action.color}.main`,
                  '&:hover': {
                    bgcolor: `${action.color}.dark`,
                  }
                }
              }}
            />
          ))}
        </SpeedDial>
      </Box>
    );
  }

  // Desktop Toolbar
  return (
    <Box sx={{
      position: isMobile ? 'fixed' : 'sticky',
      bottom: isMobile ? 60 : 'auto',
      top: isMobile ? 'auto' : 80,
      right: isMobile ? 20 : 'auto',
      left: isMobile ? 'auto' : 0,
      width: isMobile ? 'auto' : '100%',
      zIndex: 1000,
      p: 2,
      bgcolor: 'background.paper',
      borderRadius: isMobile ? 2 : 0,
      boxShadow: 3,
      display: 'flex',
      flexDirection: isMobile ? 'column' : 'column',
      gap: 1,
      justifyContent: isMobile ? 'center' : 'space-between'
    }}>
      {/* Desktop Header with Toggle */}
      {!isMobile && (
        <Box sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          pb: 1,
          borderBottom: '1px solid',
          borderColor: 'divider'
        }}>
          <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600 }}>
            Quick Actions
          </Typography>
          <IconButton
            onClick={() => setIsDesktopExpanded(!isDesktopExpanded)}
            size="small"
            sx={{
              transition: 'transform 0.2s ease',
              transform: isDesktopExpanded ? 'rotate(180deg)' : 'rotate(0deg)'
            }}
          >
            <ExpandMore />
          </IconButton>
        </Box>
      )}

      {/* Collapsible Content */}
      <Collapse in={isDesktopExpanded || isMobile} timeout={300}>
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 1,
          justifyContent: isMobile ? 'center' : 'space-between'
        }}>
          {/* Primary Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleQuickAction('post')}
                sx={{ borderRadius: 3 }}
              >
                Post Ad
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                startIcon={<Search />}
                onClick={() => handleQuickAction('search')}
                sx={{ borderRadius: 3 }}
              >
                Search
              </Button>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                variant="outlined"
                startIcon={<Filter />}
                onClick={() => handleQuickAction('filter')}
                sx={{ borderRadius: 3 }}
              >
                Filter
              </Button>
            </motion.div>
          </Box>

          {/* Secondary Actions */}
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {listing && (
              <>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Call Seller">
                    <Button
                      variant="outlined"
                      startIcon={<Phone />}
                      onClick={() => handleQuickAction('call')}
                      sx={{ borderRadius: 3, minWidth: 'auto' }}
                    >
                      Call
                    </Button>
                  </Tooltip>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Chat with Seller">
                    <Button
                      variant="outlined"
                      startIcon={<Message />}
                      onClick={() => handleQuickAction('chat')}
                      sx={{ borderRadius: 3, minWidth: 'auto' }}
                    >
                      Chat
                    </Button>
                  </Tooltip>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Save Listing">
                    <Button
                      variant="outlined"
                      startIcon={<Favorite />}
                      onClick={() => handleQuickAction('favorite')}
                      sx={{ borderRadius: 3, minWidth: 'auto' }}
                    >
                      Save
                    </Button>
                  </Tooltip>
                </motion.div>

                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Tooltip title="Share Listing">
                    <Button
                      variant="outlined"
                      startIcon={<Share />}
                      onClick={() => handleQuickAction('share')}
                      sx={{ borderRadius: 3, minWidth: 'auto' }}
                    >
                      Share
                    </Button>
                  </Tooltip>
                </motion.div>
              </>
            )}

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip title="Compare Items">
                <Button
                  variant="outlined"
                  startIcon={<Compare />}
                  onClick={() => handleQuickAction('compare')}
                  sx={{ borderRadius: 3, minWidth: 'auto' }}
                >
                  Compare
                </Button>
              </Tooltip>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Tooltip title="Get Help">
                <Button
                  variant="outlined"
                  startIcon={<Help />}
                  onClick={() => handleQuickAction('help')}
                  sx={{ borderRadius: 3, minWidth: 'auto' }}
                >
                  Help
                </Button>
              </Tooltip>
            </motion.div>
          </Box>
        </Box>
      </Collapse>
    </Box>
  );
};

// Quick Action Button Component (for individual use)
export const QuickActionButton = ({
  action,
  icon,
  label,
  color = 'primary',
  variant = 'contained',
  size = 'medium',
  onClick,
  ...props
}) => {
  return (
    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Button
        variant={variant}
        color={color}
        size={size}
        startIcon={icon}
        onClick={onClick}
        sx={{ borderRadius: 3, ...props.sx }}
        {...props}
      >
        {label}
      </Button>
    </motion.div>
  );
};

export default QuickActionsToolbar;
