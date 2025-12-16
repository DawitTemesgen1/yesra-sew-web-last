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
    CircularProgress
} from '@mui/material';
import { Send, ArrowBack, Search } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import apiService from '../services/api';
import { formatDistanceToNow } from '../utils/dateUtils';

const ChatPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const { user } = useAuth();
    const { t } = useTranslation();
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

    // Handle navigation from listing detail page OR profile chat list
    useEffect(() => {
        if (!loading && location.state) {
            // Case 1: Coming from profile chat list with conversationId
            if (location.state.conversationId) {
                const existingConv = conversations.find(conv => conv.id === location.state.conversationId);
                if (existingConv) {
                    setSelectedConversation(existingConv);
                } else if (location.state.conversation) {
                    // Use the conversation data passed from profile
                    setSelectedConversation(location.state.conversation);
                }
                navigate(location.pathname, { replace: true, state: {} });
                return;
            }

            // Case 2: Coming from listing detail page with recipientId
            if (location.state.recipientId) {
                // Find existing conversation with this recipient
                const existingConv = conversations.find(conv => {
                    const otherUser = conv.participants?.find(p => p.id !== user?.id);
                    return otherUser?.id === location.state.recipientId;
                });

                if (existingConv) {
                    // Select existing conversation
                    setSelectedConversation(existingConv);
                } else {
                    // Create a new conversation object for display
                    const newConv = {
                        id: `new_${location.state.recipientId}`,
                        participants: [
                            {
                                id: user?.id,
                                fullName: user?.user_metadata?.full_name || 'You',
                                avatarUrl: user?.user_metadata?.avatar_url
                            },
                            {
                                id: location.state.recipientId,
                                fullName: location.state.recipientName,
                                avatarUrl: location.state.recipientAvatar,
                                isOnline: false
                            }
                        ],
                        lastMessage: '',
                        lastMessageAt: null,
                        isNew: true
                    };
                    setSelectedConversation(newConv);
                }

                // Clear navigation state to prevent re-triggering
                navigate(location.pathname, { replace: true, state: {} });
            }
        }
    }, [conversations, location.state, user, navigate, location.pathname, loading]);

    useEffect(() => {
        if (selectedConversation) {
            fetchMessages(selectedConversation.id);
            const interval = setInterval(() => fetchMessages(selectedConversation.id), 5000); // Poll messages every 5s
            return () => clearInterval(interval);
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
        if (!newMessage.trim() || !selectedConversation) return;

        setSending(true);
        try {
            // If this is a new conversation, create it first
            if (selectedConversation.isNew) {
                const otherUser = selectedConversation.participants.find(p => p.id !== user?.id);

                // Create conversation via API
                const newConv = await apiService.chat.createConversation({
                    recipientId: otherUser.id,
                    message: newMessage
                });

                // Update selected conversation with real ID
                setSelectedConversation(newConv);
                setNewMessage('');

                // Refresh conversations list
                await fetchConversations();

                // Fetch messages for the new conversation
                if (newConv.id) {
                    fetchMessages(newConv.id);
                }
            } else {
                // Normal message send for existing conversation
                await apiService.chat.sendMessage(selectedConversation.id, newMessage);
                setNewMessage('');
                fetchMessages(selectedConversation.id);
                fetchConversations(); // Update last message in list
            }
        } catch (error) {
            console.error('Error sending message:', error);
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

    return (
        <Box sx={{ height: '100vh', display: 'flex', bgcolor: 'background.default' }}>
            <Paper sx={{ width: '100%', overflow: 'hidden', display: 'flex', borderRadius: 0 }} elevation={0}>
                {/* Conversations List */}
                <Box
                    sx={{
                        width: isMobile && selectedConversation ? 0 : (isMobile ? '100%' : 350),
                        borderRight: `1px solid ${theme.palette.divider}`,
                        display: isMobile && selectedConversation ? 'none' : 'flex',
                        flexDirection: 'column'
                    }}
                >
                    <Box p={2} borderBottom={`1px solid ${theme.palette.divider}`}>
                        <Typography variant="h6" fontWeight="bold" gutterBottom>
                            Messages
                        </Typography>
                        <TextField
                            fullWidth
                            size="small"
                            placeholder="Search conversations..."
                            InputProps={{
                                startAdornment: <Search color="action" sx={{ mr: 1 }} />
                            }}
                        />
                    </Box>
                    <List sx={{ overflow: 'auto', flexGrow: 1 }}>
                        {conversations.map((conversation) => {
                            const otherUser = getOtherParticipant(conversation);
                            const isSelected = selectedConversation?.id === conversation.id;

                            return (
                                <React.Fragment key={conversation.id}>
                                    <ListItem
                                        button
                                        selected={isSelected}
                                        onClick={() => setSelectedConversation(conversation)}
                                        sx={{
                                            bgcolor: isSelected ? 'action.selected' : 'transparent',
                                            '&:hover': { bgcolor: 'action.hover' }
                                        }}
                                    >
                                        <ListItemAvatar>
                                            <Badge
                                                color="success"
                                                variant="dot"
                                                invisible={!otherUser.isOnline}
                                                overlap="circular"
                                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                            >
                                                <Avatar src={otherUser.avatarUrl} alt={otherUser.fullName}>
                                                    {otherUser.fullName?.charAt(0)}
                                                </Avatar>
                                            </Badge>
                                        </ListItemAvatar>
                                        <ListItemText
                                            primary={
                                                <Box display="flex" justifyContent="space-between">
                                                    <Typography variant="subtitle2" fontWeight="bold" noWrap>
                                                        {otherUser.fullName}
                                                    </Typography>
                                                    {conversation.lastMessageAt && (
                                                        <Typography variant="caption" color="text.secondary">
                                                            {formatDistanceToNow(new Date(conversation.lastMessageAt), { addSuffix: false })}
                                                        </Typography>
                                                    )}
                                                </Box>
                                            }
                                            secondary={
                                                <Typography variant="body2" color="text.secondary" noWrap>
                                                    {conversation.lastMessage}
                                                </Typography>
                                            }
                                        />
                                    </ListItem>
                                    <Divider component="li" />
                                </React.Fragment>
                            );
                        })}
                        {conversations.length === 0 && (
                            <Box p={4} textAlign="center">
                                <Typography color="text.secondary">No conversations yet</Typography>
                            </Box>
                        )}
                    </List>
                </Box>

                {/* Chat Window */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: isMobile && !selectedConversation ? 'none' : 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.default'
                    }}
                >
                    {selectedConversation ? (
                        <>
                            {/* Chat Header */}
                            <Box
                                p={2}
                                bgcolor="background.paper"
                                borderBottom={`1px solid ${theme.palette.divider}`}
                                display="flex"
                                alignItems="center"
                            >
                                {isMobile && (
                                    <IconButton onClick={() => setSelectedConversation(null)} sx={{ mr: 1 }}>
                                        <ArrowBack />
                                    </IconButton>
                                )}
                                <Avatar
                                    src={getOtherParticipant(selectedConversation).avatarUrl}
                                    sx={{ mr: 2 }}
                                />
                                <Box>
                                    <Typography variant="subtitle1" fontWeight="bold">
                                        {getOtherParticipant(selectedConversation).fullName}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {getOtherParticipant(selectedConversation).isOnline ? (t('online') || 'Online') : (t('offline') || 'Offline')}
                                    </Typography>
                                </Box>
                            </Box>

                            {/* Messages Area */}
                            <Box sx={{ flexGrow: 1, overflow: 'auto', p: 2 }}>
                                {messages.map((msg, index) => {
                                    const isMe = msg.senderId === user.id;
                                    return (
                                        <Box
                                            key={msg.id || index}
                                            display="flex"
                                            justifyContent={isMe ? 'flex-end' : 'flex-start'}
                                            mb={2}
                                        >
                                            <Paper
                                                sx={{
                                                    p: 1.5,
                                                    maxWidth: '70%',
                                                    bgcolor: isMe ? 'primary.main' : 'background.paper',
                                                    color: isMe ? 'primary.contrastText' : 'text.primary',
                                                    borderRadius: 2
                                                }}
                                            >
                                                <Typography variant="body1">{msg.content}</Typography>
                                                <Typography
                                                    variant="caption"
                                                    sx={{
                                                        display: 'block',
                                                        textAlign: 'right',
                                                        mt: 0.5,
                                                        opacity: 0.7
                                                    }}
                                                >
                                                    {formatDistanceToNow(new Date(msg.createdAt), { addSuffix: true })}
                                                </Typography>
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
                                p={2}
                                bgcolor="background.paper"
                                borderTop={`1px solid ${theme.palette.divider}`}
                                display="flex"
                                alignItems="center"
                            >
                                <TextField
                                    fullWidth
                                    placeholder={t('typeMessage') || 'Type a message...'}
                                    variant="outlined"
                                    size="small"
                                    value={newMessage}
                                    onChange={(e) => setNewMessage(e.target.value)}
                                    sx={{ mr: 1 }}
                                />
                                <IconButton
                                    type="submit"
                                    color="primary"
                                    disabled={!newMessage.trim() || sending}
                                >
                                    {sending ? <CircularProgress size={24} /> : <Send />}
                                </IconButton>
                            </Box>
                        </>
                    ) : (
                        <Box
                            display="flex"
                            flexDirection="column"
                            justifyContent="center"
                            alignItems="center"
                            height="100%"
                            color="text.secondary"
                        >
                            <Typography variant="h5" gutterBottom>
                                {t('selectConversation') || 'Select a conversation'}
                            </Typography>
                            <Typography>
                                {t('chooseChatToList') || 'Choose a chat from the list to start messaging'}
                            </Typography>
                        </Box>
                    )}
                </Box>
            </Paper>
        </Box>
    );
};

export default ChatPage;
