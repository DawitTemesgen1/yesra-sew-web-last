import React, { useState, useEffect, useRef } from 'react';
import {
    Box,
    Container,
    Grid,
    Paper,
    Typography,
    List,
    ListItem,
    ListItemAvatar,
    ListItemText,
    Avatar,
    TextField,
    IconButton,
    Divider,
    Badge,
    useTheme,
    useMediaQuery,
    CircularProgress, AppBar, Toolbar, InputAdornment, Stack
} from '@mui/material';
import { Send, ArrowBack, Search, MoreVert, Phone, Videocam } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import toast from 'react-hot-toast';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import apiService, { supabase } from '../services/api';
import { formatDistanceToNow } from '../utils/dateUtils';

const ChatPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();
    const { t } = useLanguage();
    const location = useLocation();
    const navigate = useNavigate();

    const [conversations, setConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [sending, setSending] = useState(false);

    const messagesEndRef = useRef(null);

    useEffect(() => {
        fetchConversations();
        const interval = setInterval(fetchConversations, 10000); // Poll every 10s
        return () => clearInterval(interval);
    }, []);

    const { recipientId: paramRecipientId } = useParams();

    useEffect(() => {
        const initChat = async () => {
            if (loading) return;

            const recipientId = paramRecipientId || location.state?.recipientId;

            if (recipientId) {
                // Check if we already have a conversation with this user
                const existingConv = conversations.find(conv => {
                    const otherUser = conv.participants?.find(p => p.id !== user?.id);
                    return otherUser?.id === recipientId;
                });

                if (existingConv) {
                    setSelectedConversation(existingConv);
                } else {
                    // Need to create new conversation placeholder
                    // If we have state data, use it
                    let otherUser = {
                        id: recipientId,
                        fullName: location.state?.recipientName || 'User',
                        avatarUrl: location.state?.recipientAvatar || null,
                        isOnline: false
                    };

                    // If no state data (e.g. direct URL), try to fetch public profile
                    if (!location.state?.recipientName) {
                        try {
                            const { data: profile } = await supabase
                                .from('profiles')
                                .select('full_name, avatar_url')
                                .eq('id', recipientId)
                                .single();
                            if (profile) {
                                otherUser.fullName = profile.full_name || 'User';
                                otherUser.avatarUrl = profile.avatar_url;
                            }
                        } catch (err) {
                            console.log("Could not fetch recipient profile", err);
                        }
                    }

                    const newConv = {
                        id: `new_${recipientId}`,
                        participants: [
                            {
                                id: user?.id,
                                fullName: user?.user_metadata?.full_name || 'You',
                                avatarUrl: user?.user_metadata?.avatar_url
                            },
                            otherUser
                        ],
                        lastMessage: '',
                        lastMessageAt: null,
                        isNew: true
                    };
                    setSelectedConversation(newConv);
                }
                // Clear state if present but dont replace URL if it was param based
                if (location.state?.recipientId) {
                    navigate(location.pathname, { replace: true, state: {} });
                }
            } else if (location.state?.conversationId) {
                const existingConv = conversations.find(conv => conv.id === location.state.conversationId);
                if (existingConv) {
                    setSelectedConversation(existingConv);
                } else if (location.state.conversation) {
                    setSelectedConversation(location.state?.conversation);
                }
                navigate(location.pathname, { replace: true, state: {} });
            }
        };

        initChat();
    }, [conversations, paramRecipientId, location.state, user, loading]);

    useEffect(() => {
        if (selectedConversation && !selectedConversation.isNew) {
            fetchMessages(selectedConversation.id);
            const interval = setInterval(() => fetchMessages(selectedConversation.id), 5000); // Poll messages every 5s
            return () => clearInterval(interval);
        } else if (selectedConversation?.isNew) {
            setMessages([]);
        }
    }, [selectedConversation]);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const fetchConversations = async () => {
        try {
            const data = await apiService.chat.getConversations();
            setConversations(data);
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const fetchMessages = async (conversationId) => {
        try {
            const data = await apiService.chat.getMessages(conversationId);
            setMessages(data);
        } catch (error) {
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        const content = newMessage.trim();
        if (!content || !selectedConversation) return;

        // Optimistic UI Update
        const tempId = 'temp-' + Date.now();
        const optimisticMsg = {
            id: tempId,
            content: content,
            senderId: user.id,
            createdAt: new Date().toISOString(),
            isPending: true
        };

        setMessages(prev => [...prev, optimisticMsg]);
        setNewMessage('');
        setSending(true);

        try {
            // New Conversation Logic
            if (selectedConversation.isNew) {
                const otherUser = selectedConversation.participants.find(p => p.id !== user?.id);
                const newConv = await apiService.chat.createConversation({
                    recipientId: otherUser.id,
                    message: content
                });
                setSelectedConversation(newConv);
                await fetchConversations();
                if (newConv.id) fetchMessages(newConv.id);
            } else {
                // Existing Conversation
                await apiService.chat.sendMessage(selectedConversation.id, content);
                fetchMessages(selectedConversation.id);
                fetchConversations();
            }
        } catch (error) {
            console.error('Error sending message:', error);
            toast.error('Failed to send message');
            setMessages(prev => prev.filter(m => m.id !== tempId)); // Rollback
        } finally {
            setSending(false);
        }
    };

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const getOtherParticipant = (conversation) => {
        if (!conversation || !conversation.participants || conversation.participants.length === 0) {
            return { fullName: 'User', avatarUrl: null, isOnline: false };
        }
        return conversation.participants.find(p => p.id !== user?.id) || conversation.participants[0];
    };

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh" bgcolor="background.default">
                <CircularProgress />
            </Box>
        );
    }

    const handleBack = () => {
        if (selectedConversation) {
            setSelectedConversation(null);
        } else {
            navigate(-1);
        }
    };

    const otherParticipant = selectedConversation ? getOtherParticipant(selectedConversation) : null;

    return (
        <Box sx={{
            height: '100vh',
            bgcolor: isMobile ? 'background.paper' : 'grey.100',
            pt: isMobile ? 0 : 3,
            pb: isMobile ? 0 : 3,
            display: 'flex',
            justifyContent: 'center'
        }}>
            <Container maxWidth="xl" sx={{ height: '100%', px: isMobile ? 0 : 2 }}>
                <Paper
                    elevation={isMobile ? 0 : 4}
                    sx={{
                        height: '100%',
                        borderRadius: isMobile ? 0 : 4,
                        overflow: 'hidden',
                        display: 'flex',
                        bgcolor: 'background.paper',
                        border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`
                    }}
                >
                    {/* Conversations List (Sidebar) */}
                    <Box
                        sx={{
                            width: isMobile && selectedConversation ? 0 : (isMobile ? '100%' : 380),
                            borderRight: `1px solid ${theme.palette.divider}`,
                            display: isMobile && selectedConversation ? 'none' : 'flex',
                            flexDirection: 'column',
                            bgcolor: isMobile ? 'background.paper' : 'grey.50'
                        }}
                    >
                        {/* Sidebar Header */}
                        <Box sx={{ p: 2, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Stack direction="row" alignItems="center" spacing={1} mb={2}>
                                {isMobile && (
                                    <IconButton onClick={() => navigate('/')}>
                                        <ArrowBack />
                                    </IconButton>
                                )}
                                <Typography variant="h6" fontWeight="800">
                                    {t('messages.title') || 'Messages'}
                                </Typography>
                            </Stack>
                            <TextField
                                fullWidth
                                variant="outlined"
                                size="small"
                                placeholder={t('searchPlaceholder') || 'Search users...'}
                                InputProps={{
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <Search color="action" />
                                        </InputAdornment>
                                    ),
                                    sx: { borderRadius: 3, bgcolor: 'grey.100', border: 'none', '& fieldset': { border: 'none' } }
                                }}
                            />
                        </Box>

                        {/* List Items */}
                        <List sx={{ overflowY: 'auto', flexGrow: 1, p: 0 }}>
                            {conversations.map((conversation) => {
                                const other = getOtherParticipant(conversation);
                                const isSelected = selectedConversation?.id === conversation.id;

                                return (
                                    <React.Fragment key={conversation.id}>
                                        <ListItem
                                            button
                                            selected={isSelected}
                                            onClick={() => setSelectedConversation(conversation)}
                                            sx={{
                                                px: 2,
                                                py: 2,
                                                borderLeft: isSelected ? `4px solid ${theme.palette.primary.main}` : '4px solid transparent',
                                                bgcolor: isSelected ? 'action.hover' : 'transparent',
                                                '&:hover': { bgcolor: 'action.hover' }
                                            }}
                                        >
                                            <ListItemAvatar>
                                                <Badge
                                                    color="success"
                                                    variant="dot"
                                                    invisible={!other.isOnline}
                                                    overlap="circular"
                                                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                                >
                                                    <Avatar
                                                        src={other.avatarUrl}
                                                        alt={other.fullName}
                                                        sx={{ width: 50, height: 50, border: `2px solid ${theme.palette.background.paper}` }}
                                                    >
                                                        {other.fullName?.charAt(0)}
                                                    </Avatar>
                                                </Badge>
                                            </ListItemAvatar>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" justifyContent="space-between" alignItems="center">
                                                        <Typography variant="subtitle1" fontWeight={conversation.isUnread ? 700 : 600} noWrap>
                                                            {other.fullName}
                                                        </Typography>
                                                        {conversation.lastMessageAt && (
                                                            <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.7rem' }}>
                                                                {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                }
                                                secondary={
                                                    <Typography variant="body2" color={conversation.isUnread ? 'text.primary' : 'text.secondary'} noWrap sx={{ maxWidth: '200px' }}>
                                                        {conversation.lastMessage || (conversation.isNew ? 'New Conversation' : '')}
                                                    </Typography>
                                                }
                                            />
                                        </ListItem>
                                        <Divider component="li" variant="inset" />
                                    </React.Fragment>
                                );
                            })}
                        </List>
                    </Box>

                    {/* Chat Area */}
                    <Box sx={{
                        flexGrow: 1,
                        display: isMobile && !selectedConversation ? 'none' : 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.paper',
                        position: 'relative'
                    }}>
                        {selectedConversation ? (
                            <>
                                {/* Mobile/Desktop Chat Header */}
                                <AppBar
                                    position={isMobile ? "fixed" : "static"}
                                    elevation={0}
                                    sx={{
                                        bgcolor: 'background.paper',
                                        color: 'text.primary',
                                        borderBottom: `1px solid ${theme.palette.divider}`,
                                        top: 0, right: 0, left: 0,
                                        width: isMobile ? '100%' : 'auto',
                                        zIndex: 1100
                                    }}
                                >
                                    <Toolbar sx={{ px: 2 }}>
                                        <IconButton edge="start" onClick={handleBack} sx={{ mr: 1 }}>
                                            <ArrowBack />
                                        </IconButton>
                                        <Avatar src={otherParticipant.avatarUrl} sx={{ mr: 1.5, width: 40, height: 40 }} />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="subtitle1" fontWeight="700" lineHeight={1.2}>
                                                {otherParticipant.fullName}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary" display="block">
                                                {otherParticipant.isOnline ? 'Online' : 'Offline'}
                                            </Typography>
                                        </Box>
                                        <IconButton color="primary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                            <Phone />
                                        </IconButton>
                                        <IconButton color="primary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                            <Videocam />
                                        </IconButton>
                                        <IconButton>
                                            <MoreVert />
                                        </IconButton>
                                    </Toolbar>
                                </AppBar>
                                {/* Spacer for Fixed AppBar on Mobile */}
                                {isMobile && <Toolbar />}

                                {/* Messages Feed */}
                                <Box sx={{ flexGrow: 1, overflowY: 'auto', p: 2, bgcolor: isMobile ? 'background.default' : '#f8f9fa' }}>
                                    {messages.map((msg, index) => {
                                        const isMe = msg.senderId === user.id;
                                        return (
                                            <Box
                                                key={msg.id || index}
                                                display="flex"
                                                justifyContent={isMe ? 'flex-end' : 'flex-start'}
                                                mb={1.5}
                                            >
                                                {!isMe && (
                                                    <Avatar src={otherParticipant.avatarUrl} sx={{ width: 32, height: 32, mr: 1, mt: 0.5 }} />
                                                )}
                                                <Paper
                                                    elevation={0}
                                                    sx={{
                                                        p: 1.5,
                                                        px: 2,
                                                        maxWidth: '75%',
                                                        bgcolor: isMe ? 'primary.main' : 'white',
                                                        color: isMe ? 'white' : 'text.primary',
                                                        borderRadius: 2.5,
                                                        borderTopRightRadius: isMe ? 0 : 2.5,
                                                        borderTopLeftRadius: !isMe ? 0 : 2.5,
                                                        boxShadow: isMe ? '0 4px 12px rgba(0,0,0,0.1)' : '0 2px 8px rgba(0,0,0,0.05)',
                                                        opacity: msg.isPending ? 0.7 : 1,
                                                        position: 'relative'
                                                    }}
                                                >
                                                    <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: '0.95rem' }}>
                                                        {msg.content}
                                                    </Typography>
                                                    <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={0.5} mt={0.5}>
                                                        {msg.isPending && <CircularProgress size={10} color="inherit" />}
                                                        <Typography variant="caption" sx={{ fontSize: '0.7rem', color: isMe ? 'rgba(255,255,255,0.8)' : 'text.secondary' }}>
                                                            {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                        </Typography>
                                                    </Stack>
                                                </Paper>
                                            </Box>
                                        );
                                    })}
                                    <div ref={messagesEndRef} />
                                </Box>

                                {/* Input Area */}
                                <Box
                                    component="form"
                                    onSubmit={handleSendMessage}
                                    sx={{
                                        p: 2,
                                        bgcolor: 'background.paper',
                                        borderTop: `1px solid ${theme.palette.divider}`,
                                        position: isMobile ? 'fixed' : 'relative',
                                        bottom: 0, left: 0, right: 0,
                                        zIndex: 1100
                                    }}
                                >
                                    <Stack direction="row" alignItems="center" spacing={1}>
                                        <TextField
                                            fullWidth
                                            placeholder={t('chat.placeholder') || 'Type a message...'}
                                            variant="outlined"
                                            size="small"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            multiline
                                            maxRows={3}
                                            sx={{
                                                '& .MuiOutlinedInput-root': {
                                                    borderRadius: 4,
                                                    bgcolor: 'grey.50'
                                                }
                                            }}
                                        />
                                        <IconButton
                                            type="submit"
                                            color="primary"
                                            disabled={!newMessage.trim() || sending}
                                            sx={{
                                                bgcolor: 'primary.main',
                                                color: 'white',
                                                width: 45, height: 45,
                                                '&:hover': { bgcolor: 'primary.dark' },
                                                '&.Mui-disabled': { bgcolor: 'action.disabledBackground' }
                                            }}
                                        >
                                            <Send fontSize="small" />
                                        </IconButton>
                                    </Stack>
                                </Box>
                                {/* Spacer for Fixed Input on Mobile */}
                                {isMobile && <Box sx={{ height: 80 }} />}

                            </>
                        ) : (
                            // Empty State
                            <Box display="flex" flexDirection="column" justifyContent="center" alignItems="center" height="100%" color="text.secondary" p={3} textAlign="center">
                                <Box
                                    component="img"
                                    src="https://illustrations.popsy.co/amber/working-vacation.svg"
                                    sx={{ width: 200, mb: 3, opacity: 0.8 }}
                                />
                                <Typography variant="h5" fontWeight="bold" gutterBottom>
                                    {t('chat.welcomeTitle') || 'Connect with ease'}
                                </Typography>
                                <Typography maxWidth="sm">
                                    {t('chat.welcomeSubtitle') || 'Select a conversation from the left to start messaging. Secure, fast, and professional.'}
                                </Typography>
                            </Box>
                        )}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default ChatPage;
