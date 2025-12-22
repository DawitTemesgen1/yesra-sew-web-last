import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { Block } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const BlockUserDialog = ({ open, onClose, userId, userName, onBlocked }) => {
    const [reason, setReason] = useState('');
    const [loading, setLoading] = useState(false);

    const handleBlock = async () => {
        setLoading(true);
        try {
            await apiService.blockUser(userId, reason);
            toast.success(`🚫 ${userName || 'User'} has been blocked`);
            if (onBlocked) onBlocked();
            onClose();
            setReason('');
        } catch (error) {
            if (error.message.includes('already blocked')) {
                toast.error('This user is already blocked');
            } else {
                toast.error(error.message || 'Failed to block user');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Block color="error" />
                    <Typography variant="h6">Block User</Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Alert severity="warning" sx={{ mb: 3 }}>
                        Blocking <strong>{userName || 'this user'}</strong> will prevent them from:
                        <ul style={{ marginTop: 8, marginBottom: 0 }}>
                            <li>Sending you messages</li>
                            <li>Viewing your contact information</li>
                            <li>Commenting on your listings</li>
                        </ul>
                    </Alert>

                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        label="Reason (optional)"
                        placeholder="Why are you blocking this user?"
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        variant="outlined"
                    />

                    <Typography variant="caption" color="text.secondary" sx={{ mt: 2, display: 'block' }}>
                        You can unblock this user anytime from your profile settings.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleBlock}
                    variant="contained"
                    color="error"
                    disabled={loading}
                    startIcon={<Block />}
                >
                    {loading ? 'Blocking...' : 'Block User'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default BlockUserDialog;

