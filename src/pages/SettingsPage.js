import React, { useState } from 'react';
import {
    Container, Typography, Box, Paper, List, ListItem, ListItemIcon, ListItemText,
    ListItemSecondaryAction, Switch, Divider, Button, Dialog, DialogTitle,
    DialogContent, DialogActions, TextField, useTheme, useMediaQuery, IconButton
} from '@mui/material';
import {
    Notifications, Lock, Language, DarkMode, Delete, Help, Info,
    ChevronRight, Security, Email, Phone
} from '@mui/icons-material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const navigate = useNavigate();
    const { t } = useTranslation();

    const [notifications, setNotifications] = useState({
        email: true,
        push: true,
        marketing: false
    });

    const [darkMode, setDarkMode] = useState(false);
    const [language, setLanguage] = useState('English');
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

    const handleToggle = (key) => {
        setNotifications({ ...notifications, [key]: !notifications[key] });
    };

    const SettingSection = ({ title, children }) => (
        <Box sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="bold" gutterBottom color="primary" sx={{ mb: 2 }}>
                {title}
            </Typography>
            <Paper variant="outlined" sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <List disablePadding>
                    {children}
                </List>
            </Paper>
        </Box>
    );

    return (
        <Box sx={{ bgcolor: 'background.default', minHeight: '100vh', pb: 8 }}>
            <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 6 }}>
                <Container maxWidth="lg">
                    <Typography variant={isMobile ? "h4" : "h3"} fontWeight="bold" gutterBottom>
                        {t('settings') || 'Settings'}
                    </Typography>
                    <Typography variant="body1" sx={{ opacity: 0.9 }}>
                        {t('manageAppPreferences') || 'Manage your app preferences and account security'}
                    </Typography>
                </Container>
            </Box>

            <Container maxWidth="md" sx={{ mt: -4 }}>
                <Paper sx={{ p: { xs: 2, md: 4 }, borderRadius: 4 }}>

                    <SettingSection title={t('accountSecurity') || 'Account Security'}>
                        <ListItem button onClick={() => navigate('/change-password')}>
                            <ListItemIcon><Lock color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('changePassword') || 'Change Password'}
                                secondary={t('updatePasswordSecurely') || 'Update your password securely'}
                            />
                            <ChevronRight color="action" />
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon><Security color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('twoFactorAuth') || 'Two-Factor Authentication'}
                                secondary={t('addExtraSecurity') || 'Add an extra layer of security'}
                            />
                            <Switch edge="end" />
                        </ListItem>
                    </SettingSection>

                    <SettingSection title={t('notifications') || 'Notifications'}>
                        <ListItem>
                            <ListItemIcon><Email color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('emailNotifications') || 'Email Notifications'}
                                secondary={t('receiveUpdatesEmail') || 'Receive updates via email'}
                            />
                            <Switch
                                edge="end"
                                checked={notifications.email}
                                onChange={() => handleToggle('email')}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon><Notifications color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('pushNotifications') || 'Push Notifications'}
                                secondary={t('receiveUpdatesDevice') || 'Receive updates on your device'}
                            />
                            <Switch
                                edge="end"
                                checked={notifications.push}
                                onChange={() => handleToggle('push')}
                            />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon><Info color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('marketingEmails') || 'Marketing Emails'}
                                secondary={t('receiveOffersPromotions') || 'Receive offers and promotions'}
                            />
                            <Switch
                                edge="end"
                                checked={notifications.marketing}
                                onChange={() => handleToggle('marketing')}
                            />
                        </ListItem>
                    </SettingSection>

                    <SettingSection title={t('preferences') || 'Preferences'}>
                        <ListItem button>
                            <ListItemIcon><Language color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('language') || 'Language'}
                                secondary={language}
                            />
                            <ChevronRight color="action" />
                        </ListItem>
                        <Divider />
                        <ListItem>
                            <ListItemIcon><DarkMode color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('darkMode') || 'Dark Mode'}
                                secondary={t('toggleDarkTheme') || 'Toggle dark theme'}
                            />
                            <Switch
                                edge="end"
                                checked={darkMode}
                                onChange={() => setDarkMode(!darkMode)}
                            />
                        </ListItem>
                    </SettingSection>

                    <SettingSection title={t('supportAbout') || 'Support & About'}>
                        <ListItem button>
                            <ListItemIcon><Help color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('helpCenter') || 'Help Center'}
                                secondary={t('faqsSupport') || 'FAQs and support'}
                            />
                            <ChevronRight color="action" />
                        </ListItem>
                        <Divider />
                        <ListItem button>
                            <ListItemIcon><Info color="primary" /></ListItemIcon>
                            <ListItemText
                                primary={t('aboutYesraSew') || 'About YesraSew'}
                                secondary="Version 1.0.0"
                            />
                            <ChevronRight color="action" />
                        </ListItem>
                    </SettingSection>

                    <Box sx={{ mt: 4, pt: 4, borderTop: `1px solid ${theme.palette.divider}` }}>
                        <Button
                            variant="outlined"
                            color="error"
                            startIcon={<Delete />}
                            onClick={() => setDeleteDialogOpen(true)}
                            sx={{ borderRadius: 2 }}
                        >
                            {t('deleteAccount') || 'Delete Account'}
                        </Button>
                    </Box>

                </Paper>
            </Container>

            {/* Delete Account Dialog */}
            <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
                <DialogTitle sx={{ color: 'error.main' }}>{t('deleteAccount') || 'Delete Account'}?</DialogTitle>
                <DialogContent>
                    <Typography>
                        {t('deleteAccountWarning') || 'Are you sure you want to delete your account? This action cannot be undone.'}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialogOpen(false)}>{t('cancel') || 'Cancel'}</Button>
                    <Button color="error" variant="contained" onClick={() => setDeleteDialogOpen(false)}>
                        {t('delete') || 'Delete'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default SettingsPage;

