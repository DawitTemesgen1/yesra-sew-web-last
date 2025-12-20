import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    TextField,
    FormControl,
    FormLabel,
    RadioGroup,
    FormControlLabel,
    Radio,
    Typography,
    Box,
    Alert
} from '@mui/material';
import { Flag, Block } from '@mui/icons-material';
import toast from 'react-hot-toast';
import apiService from '../services/api';

const ReportDialog = ({ open, onClose, type = 'listing', targetId, targetName }) => {
    const [reason, setReason] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);

    const reportReasons = {
        listing: [
            { value: 'spam', label: 'Spam or misleading' },
            { value: 'inappropriate', label: 'Inappropriate content' },
            { value: 'scam', label: 'Scam or fraud' },
            { value: 'duplicate', label: 'Duplicate listing' },
            { value: 'wrong_category', label: 'Wrong category' },
            { value: 'other', label: 'Other' }
        ],
        user: [
            { value: 'harassment', label: 'Harassment or bullying' },
            { value: 'spam', label: 'Spam messages' },
            { value: 'scam', label: 'Scam or fraud' },
            { value: 'inappropriate', label: 'Inappropriate behavior' },
            { value: 'impersonation', label: 'Impersonation' },
            { value: 'other', label: 'Other' }
        ]
    };

    const handleSubmit = async () => {
        if (!reason) {
            toast.error('Please select a reason');
            return;
        }

        setLoading(true);
        try {
            if (type === 'listing') {
                await apiService.reportListing(targetId, reason, description);
                toast.success('✅ Listing reported successfully. Our team will review it.');
            } else {
                await apiService.reportUser(targetId, reason, description);
                toast.success('✅ User reported successfully. Our team will review it.');
            }
            onClose();
            setReason('');
            setDescription('');
        } catch (error) {
            toast.error(error.message || 'Failed to submit report');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>
                <Box display="flex" alignItems="center" gap={1}>
                    <Flag color="error" />
                    <Typography variant="h6">
                        Report {type === 'listing' ? 'Listing' : 'User'}
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent>
                <Box sx={{ pt: 1 }}>
                    <Alert severity="info" sx={{ mb: 3 }}>
                        Help us keep Yesra Sew safe. Your report will be reviewed by our team.
                    </Alert>

                    {targetName && (
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                            Reporting: <strong>{targetName}</strong>
                        </Typography>
                    )}

                    <FormControl component="fieldset" fullWidth sx={{ mb: 3 }}>
                        <FormLabel component="legend" sx={{ mb: 1 }}>
                            Reason for report *
                        </FormLabel>
                        <RadioGroup value={reason} onChange={(e) => setReason(e.target.value)}>
                            {reportReasons[type].map((option) => (
                                <FormControlLabel
                                    key={option.value}
                                    value={option.value}
                                    control={<Radio />}
                                    label={option.label}
                                />
                            ))}
                        </RadioGroup>
                    </FormControl>

                    <TextField
                        fullWidth
                        multiline
                        rows={4}
                        label="Additional details (optional)"
                        placeholder="Please provide any additional information that might help us review this report..."
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        variant="outlined"
                    />
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2 }}>
                <Button onClick={onClose} disabled={loading}>
                    Cancel
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading || !reason}
                    startIcon={<Flag />}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ReportDialog;
