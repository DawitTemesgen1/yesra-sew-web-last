import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import {
    Box, Typography, IconButton, Avatar, Badge, Drawer, List, ListItem,
    ListItemIcon, ListItemText, alpha, useTheme, useMediaQuery, Fab,
    AppBar, Toolbar, Container, Button, LinearProgress, Menu, MenuItem, Divider, Tooltip
} from '@mui/material';
import {
    Menu as MenuIcon, Dashboard, Assignment, Home, DirectionsCar, Work,
    Category, TrendingUp, Settings, Email, Payments, Security,
    CardMembership, BarChart, Gavel, Smartphone, People, Backup, Api,
    Support, PlayArrow, Notifications, AccountCircle, Logout, Close,
    CheckCircle, AccessTime, LightMode, DarkMode, ChevronRight,
    RateReview, History, VerifiedUser, Webhook, HelpOutline, Add
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';

// Import ALL screen components
import AdminHomepage from './components/AdminHomepage';
import TenderScreen from './components/TenderScreen';
import HomeScreen from './components/HomeScreen';
import CarsScreen from './components/CarsScreen';
import JobsScreen from './components/JobsScreen';
import HomepageManagementScreen from './components/HomepageManagementScreen';
import CategoriesScreen from './components/CategoriesScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import SystemSettingsScreen from './components/SystemSettingsScreen';
import FinancialScreen from './components/FinancialScreen';
import CommunicationScreen from './components/CommunicationScreen';
import ContentModerationScreen from './components/ContentModerationScreen';
import MembershipScreen from './components/MembershipScreen';
import LegalComplianceScreen from './components/LegalComplianceScreen';
import MobileAppScreen from './components/MobileAppScreen';
import ReportsScreen from './components/ReportsScreen';
import UserManagementScreen from './components/UserManagementScreen';
import SecurityScreen from './components/SecurityScreen';
import BackupScreen from './components/BackupScreen';
import ApiManagementScreen from './components/ApiManagementScreen';
import SupportScreen from './components/SupportScreen';
import AdvancedAnalyticsScreen from './components/AdvancedAnalyticsScreen';
import WorkflowScreen from './components/WorkflowScreen';
import NotificationScreen from './components/NotificationScreen';
import IntegrationScreen from './components/IntegrationScreen';
import HelpScreen from './components/HelpScreen';

import apiService from '../services/api';

// Admin-only styled components with inline styles
const AdminContainer = styled(Box)(({ theme }) => ({
    display: 'flex',
    minHeight: '100vh',
    bgcolor: 'background.default',
    // Admin-specific styling
    '& .MuiCard-root': {
        margin: '8px',
        borderRadius: '12px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    },
    '& .MuiButton-root': {
        borderRadius: '8px',
        textTransform: 'none',
        fontWeight: '500',
        padding: '8px 16px',
    },
    '& .MuiContainer-root': {
        paddingLeft: '16px',
        paddingRight: '16px',
        maxWidth: '100%',
    },
    // Mobile-specific admin styles
    '@media (max-width: 767px)': {
        '& .MuiCard-root': {
            margin: '4px',
            borderRadius: '8px',
        },
        '& .MuiButton-root': {
            padding: '6px 12px',
            fontSize: '0.875rem',
        },
        '& .MuiContainer-root': {
            paddingLeft: '8px',
            paddingRight: '8px',
        },
    }
}));

// Extended icon mapping
const iconMap = {
    Dashboard, Assignment, Home, DirectionsCar, Work, Category, TrendingUp,
    Settings, Email, Payments, Security, CardMembership, BarChart, Gavel,
    Smartphone, People, Backup, Api, Support, PlayArrow, RateReview, History,
    VerifiedUser, Webhook, HelpOutline
};

// Complete menu configuration with all 26 features
const MENU_CONFIG = [
    { id: 0, label: 'Dashboard', icon: 'Dashboard', gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: '#667eea' },
    { id: 1, label: 'Tenders', icon: 'Gavel', gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', color: '#f093fb' },
    { id: 2, label: 'Homes', icon: 'Home', gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: '#4facfe' },
    { id: 3, label: 'Cars', icon: 'DirectionsCar', gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: '#43e97b' },
    { id: 4, label: 'Jobs', icon: 'Work', gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: '#fa709a' },
    { id: 5, label: 'Homepage', icon: 'TrendingUp', gradient: 'linear-gradient(135deg, #ffa751 0%, #ffe259 100%)', color: '#ffa751' },
    { id: 6, label: 'Categories', icon: 'Category', gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)', color: '#30cfd0' },
    { id: 7, label: 'Analytics', icon: 'BarChart', gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', color: '#a8edea' },
    { id: 8, label: 'Settings', icon: 'Settings', gradient: 'linear-gradient(135deg, #434343 0%, #000000 100%)', color: '#434343' },
    { id: 9, label: 'Financial', icon: 'Payments', gradient: 'linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)', color: '#ff9a56' },
    { id: 10, label: 'Communication', icon: 'Email', gradient: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)', color: '#f6d365' },
    { id: 11, label: 'Moderation', icon: 'RateReview', gradient: 'linear-gradient(135deg, #fa8bff 0%, #2bd2ff 100%)', color: '#fa8bff' },
    { id: 12, label: 'Membership', icon: 'CardMembership', gradient: 'linear-gradient(135deg, #ff6a00 0%, #ee0979 100%)', color: '#ff6a00' },
    { id: 13, label: 'Legal', icon: 'VerifiedUser', gradient: 'linear-gradient(135deg, #3f2b96 0%, #a8c0ff 100%)', color: '#3f2b96' },
    { id: 14, label: 'Mobile App', icon: 'Smartphone', gradient: 'linear-gradient(135deg, #89f7fe 0%, #66a6ff 100%)', color: '#89f7fe' },
    { id: 15, label: 'Reports', icon: 'Assignment', gradient: 'linear-gradient(135deg, #fdbb2d 0%, #22c1c3 100%)', color: '#fdbb2d' },
    { id: 16, label: 'Users', icon: 'People', gradient: 'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', color: '#ffecd2' },
    { id: 17, label: 'Security', icon: 'Security', gradient: 'linear-gradient(135deg, #ff0844 0%, #ffb199 100%)', color: '#ff0844' },
    { id: 18, label: 'Backup', icon: 'Backup', gradient: 'linear-gradient(135deg, #d299c2 0%, #fef9d7 100%)', color: '#d299c2' },
    { id: 19, label: 'API', icon: 'Api', gradient: 'linear-gradient(135deg, #209cff 0%, #68e0cf 100%)', color: '#209cff' },
    { id: 20, label: 'Support', icon: 'Support', gradient: 'linear-gradient(135deg, #b490ca 0%, #5ee7df 100%)', color: '#b490ca' },
    { id: 21, label: 'Adv Analytics', icon: 'TrendingUp', gradient: 'linear-gradient(135deg, #f5576c 0%, #f093fb 100%)', color: '#f5576c' },
    { id: 22, label: 'Workflow', icon: 'PlayArrow', gradient: 'linear-gradient(135deg, #4481eb 0%, #04befe 100%)', color: '#4481eb' },
    { id: 23, label: 'Notifications', icon: 'Notifications', gradient: 'linear-gradient(135deg, #fc6767 0%, #ec008c 100%)', color: '#fc6767' },
    { id: 24, label: 'Integration', icon: 'Webhook', gradient: 'linear-gradient(135deg, #0ba360 0%, #3cba92 100%)', color: '#0ba360' },
    { id: 25, label: 'Help', icon: 'HelpOutline', gradient: 'linear-gradient(135deg, #ee9ca7 0%, #ffdde1 100%)', color: '#ee9ca7' }
];

const AdminDashboardMobile = () => {
    const { t } = useTranslation();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [activeTab, setActiveTab] = useState(0);
    const [drawerOpen, setDrawerOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);
    const [notificationAnchor, setNotificationAnchor] = useState(null);
    const [profileAnchor, setProfileAnchor] = useState(null);
    const [themeMode, setThemeMode] = useState('light');
    const [stats, setStats] = useState({ totalListings: 0, pendingReview: 0, approvedListings: 0, rejectedListings: 0, totalUsers: 0, activeUsers: 0, revenue: 0 });
    const [listings, setListings] = useState([]);
    const [users, setUsers] = useState([]);
    const [tenders, setTenders] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [dashboardRes, listingsRes, usersRes] = await Promise.all([
                    apiService.getDashboardStats(),
                    apiService.getAdminListings({ limit: 1000 }),
                    apiService.getAdminUsers({ limit: 1000 })
                ]);

                if (dashboardRes.success) {
                    const { overview } = dashboardRes.data;
                    setStats({
                        totalListings: overview.total_listings,
                        pendingReview: overview.pending_listings,
                        approvedListings: overview.active_listings,
                        rejectedListings: 0,
                        totalUsers: overview.total_users,
                        activeUsers: overview.total_users,
                        revenue: overview.total_revenue
                    });
                }

                if (listingsRes.success) {
                    setListings(listingsRes.data.listings);
                }

                if (usersRes.success) {
                    setUsers(usersRes.data.users);
                }

                setTenders([]);
            } catch (err) {
                console.error('Error:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // Scroll handler
    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 300);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const currentMenuItem = MENU_CONFIG.find(item => item.id === activeTab) || MENU_CONFIG[0];

    const handleTabChange = (tabId) => {
        setActiveTab(tabId);
        if (isMobile) setDrawerOpen(false);
    };

    const renderActiveScreen = () => {
        const props = { t, handleRefresh: () => { }, refreshing: loading, stats, listings, users, tenders };
        switch (activeTab) {
            case 0: return <AdminHomepage {...props} />;
            case 1: return <TenderScreen {...props} />;
            case 2: return <HomeScreen {...props} homes={listings.filter(l => l.category === 'home')} />;
            case 3: return <CarsScreen {...props} cars={listings.filter(l => l.category === 'car')} />;
            case 4: return <JobsScreen {...props} jobs={listings.filter(l => l.category === 'job')} />;
            case 5: return <HomepageManagementScreen {...props} />;
            case 6: return <CategoriesScreen {...props} />;
            case 7: return <AnalyticsScreen {...props} />;
            case 8: return <SystemSettingsScreen {...props} />;
            case 9: return <FinancialScreen {...props} />;
            case 10: return <CommunicationScreen {...props} />;
            case 11: return <ContentModerationScreen {...props} />;
            case 12: return <MembershipScreen {...props} />;
            case 13: return <LegalComplianceScreen {...props} />;
            case 14: return <MobileAppScreen {...props} />;
            case 15: return <ReportsScreen {...props} />;
            case 16: return <UserManagementScreen {...props} />;
            case 17: return <SecurityScreen {...props} />;
            case 18: return <BackupScreen {...props} />;
            case 19: return <ApiManagementScreen {...props} />;
            case 20: return <SupportScreen {...props} />;
            case 21: return <AdvancedAnalyticsScreen {...props} />;
            case 22: return <WorkflowScreen {...props} />;
            case 23: return <NotificationScreen {...props} />;
            case 24: return <IntegrationScreen {...props} />;
            case 25: return <HelpScreen {...props} />;
            default: return <AdminHomepage {...props} />;
        }
    };

    return (
        <AdminContainer>
            {/* Drawer */}
            <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)} sx={{ '& .MuiDrawer-paper': { width: isMobile ? '85%' : 320, maxWidth: 320, background: theme.palette.mode === 'dark' ? 'linear-gradient(180deg, #1a1a2e 0%, #16213e 100%)' : 'linear-gradient(180deg, #ffffff 0%, #f8f9fa 100%)', borderRight: 'none', boxShadow: '4px 0 24px rgba(0,0,0,0.12)' } }}>
                {/* Header */}
                <Box sx={{ p: 3, background: 'linear-gradient(135deg, #B58E2A 0%, #D4AF37 100%)', color: 'white', position: 'relative', overflow: 'hidden' }}>
                    <Box sx={{ position: 'absolute', top: -50, right: -50, width: 150, height: 150, borderRadius: '50%', background: 'rgba(255,255,255,0.1)' }} />
                    <Box sx={{ position: 'relative', zIndex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                            <Typography variant="h5" sx={{ fontWeight: 700 }}>YesraSew</Typography>
                            <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: 'white' }}><Close /></IconButton>
                        </Box>
                        <Typography variant="caption" sx={{ opacity: 0.9, display: 'block', mb: 2 }}>Admin Dashboard</Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                            <Avatar sx={{ width: 48, height: 48, border: '3px solid rgba(255,255,255,0.3)', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>A</Avatar>
                            <Box>
                                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>Admin User</Typography>
                                <Typography variant="caption" sx={{ opacity: 0.85 }}>admin@yesrasew.com</Typography>
                            </Box>
                        </Box>
                    </Box>
                </Box>
                {/* Menu */}
                <List sx={{ px: 2, py: 2, maxHeight: 'calc(100vh - 200px)', overflow: 'auto' }}>
                    {MENU_CONFIG.map(item => {
                        const IconComponent = iconMap[item.icon] || Dashboard;
                        const isActive = activeTab === item.id;
                        return (
                            <ListItem key={item.id} button selected={isActive} onClick={() => handleTabChange(item.id)} sx={{ borderRadius: 3, mb: 1, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', position: 'relative', overflow: 'hidden', ...(isActive && { background: item.gradient, color: 'white', boxShadow: `0 4px 12px ${alpha(item.color, 0.4)}`, transform: 'translateX(4px)', '& .MuiListItemIcon-root': { color: 'white' } }), '&:hover': { background: isActive ? item.gradient : alpha(item.color, 0.1), transform: 'translateX(4px)' } }}>
                                <ListItemIcon sx={{ minWidth: 40 }}><IconComponent /></ListItemIcon>
                                <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.9rem', fontWeight: isActive ? 600 : 500 }} />
                                {isActive && <ChevronRight sx={{ opacity: 0.7 }} />}
                            </ListItem>
                        );
                    })}
                </List>
                {/* Logout */}
                <Box sx={{ flexGrow: 1 }} />
                <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    <Button fullWidth variant="outlined" startIcon={<Logout />} sx={{ borderRadius: 3, borderColor: theme.palette.divider, color: theme.palette.text.secondary, '&:hover': { borderColor: theme.palette.error.main, color: theme.palette.error.main, bgcolor: alpha(theme.palette.error.main, 0.05) } }}>Logout</Button>
                </Box>
            </Drawer>
            {/* Main */}
            <Box component="main" sx={{ flexGrow: 1, width: '100%' }}>
                {/* AppBar */}
                <AppBar position="fixed" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}`, backdropFilter: 'blur(20px)', background: theme.palette.mode === 'dark' ? 'rgba(26, 26, 46, 0.8)' : 'rgba(255, 255, 255, 0.8)' }}>
                    <Toolbar sx={{ gap: 2 }}>
                        <IconButton edge="start" onClick={() => setDrawerOpen(true)} sx={{ mr: 1, background: currentMenuItem.gradient, color: 'white', '&:hover': { background: currentMenuItem.gradient, transform: 'scale(1.05)' } }}><MenuIcon /></IconButton>
                        <Box sx={{ flexGrow: 1 }}><Typography variant="h6" sx={{ fontWeight: 600, color: 'text.primary', fontSize: { xs: '1rem', sm: '1.25rem' } }}>{currentMenuItem.label}</Typography></Box>
                        <Tooltip title="Toggle theme"><IconButton onClick={() => setThemeMode(prev => prev === 'light' ? 'dark' : 'light')} sx={{ color: 'text.primary' }}>{themeMode === 'light' ? <DarkMode /> : <LightMode />}</IconButton></Tooltip>
                        <Tooltip title="Notifications"><IconButton onClick={e => setNotificationAnchor(e.currentTarget)} sx={{ color: 'text.primary' }}><Badge badgeContent={5} color="error"><Notifications /></Badge></IconButton></Tooltip>
                        <Tooltip title="Profile"><IconButton onClick={e => setProfileAnchor(e.currentTarget)} sx={{ p: 0.5 }}><Avatar sx={{ width: 36, height: 36, background: currentMenuItem.gradient }}>A</Avatar></IconButton></Tooltip>
                    </Toolbar>
                    {loading && <LinearProgress sx={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 3, background: alpha(currentMenuItem.color, 0.1), '& .MuiLinearProgress-bar': { background: currentMenuItem.gradient } }} />}
                </AppBar>
                {/* Content */}
                <Container maxWidth="xl" sx={{ mt: { xs: 8, sm: 9 }, mb: 4, px: { xs: 2, sm: 3, md: 4 } }}>
                    {renderActiveScreen()}
                </Container>
            </Box>
            {/* Notifications Menu */}
            <Menu anchorEl={notificationAnchor} open={Boolean(notificationAnchor)} onClose={() => setNotificationAnchor(null)} PaperProps={{ sx: { mt: 1.5, width: 360, maxWidth: '90vw', borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="h6" sx={{ fontWeight: 600 }}>Notifications</Typography>
                    <Typography variant="caption" color="text.secondary">You have 5 unread</Typography>
                </Box>
                {[{ icon: CheckCircle, color: 'success', title: 'Tender approved', time: '2min' }, { icon: AccessTime, color: 'warning', title: '5 pending review', time: '1hr' }, { icon: People, color: 'info', title: '10 new users', time: '3hr' }].map((n, i) => (
                    <MenuItem key={i} sx={{ py: 2, gap: 2 }}>
                        <Avatar sx={{ bgcolor: `${n.color}.main` }}><n.icon /></Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{n.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{n.time}</Typography>
                        </Box>
                    </MenuItem>
                ))}
                <Box sx={{ p: 1 }}><Button fullWidth sx={{ borderRadius: 2 }}>View All</Button></Box>
            </Menu>
            {/* Profile Menu */}
            <Menu anchorEl={profileAnchor} open={Boolean(profileAnchor)} onClose={() => setProfileAnchor(null)} PaperProps={{ sx: { mt: 1.5, width: 240, borderRadius: 3, boxShadow: '0 8px 32px rgba(0,0,0,0.12)' } }}>
                <Box sx={{ p: 2, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>Admin User</Typography>
                    <Typography variant="caption" color="text.secondary">admin@yesrasew.com</Typography>
                </Box>
                <List sx={{ p: 1 }}>
                    {[{ icon: AccountCircle, label: 'Profile' }, { icon: Settings, label: 'Settings' }].map((item, idx) => (
                        <MenuItem key={idx} sx={{ borderRadius: 2, gap: 1 }}><item.icon fontSize="small" />{item.label}</MenuItem>
                    ))}
                    <Divider sx={{ my: 1 }} />
                    <MenuItem sx={{ borderRadius: 2, gap: 1, color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.1) } }}><Logout fontSize="small" />Logout</MenuItem>
                </List>
            </Menu>
            {/* FAB */}
            {showScrollTop && (
                <Fab onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} sx={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: currentMenuItem.gradient, color: 'white', boxShadow: `0 8px 24px ${alpha(currentMenuItem.color, 0.4)}`, '&:hover': { background: currentMenuItem.gradient, transform: 'scale(1.1) rotate(10deg)' }, transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)' }}>
                    <Add />
                </Fab>
            )}
        </AdminContainer>
    );
};

export default AdminDashboardMobile;
