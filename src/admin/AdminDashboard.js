import React, { useState, useEffect, useMemo, useCallback, Suspense } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Box, Typography, CircularProgress, Alert, ThemeProvider
} from '@mui/material';

// Import admin theme
import adminTheme, { adminDarkTheme } from './theme/adminTheme';

// Import layout components
import ResponsiveAdminLayout from './ResponsiveAdminLayout';

// Import constants and utilities
import { MENU_ITEMS } from './constants/menuItems';

// Import services
import adminService from '../services/adminService';

import lazyWithRetry from '../utils/lazyWithRetry';

// Lazy Load Screen Components with Auto-Retry
const AdminHomepage = lazyWithRetry(() => import('./components/AdminHomepage'));
const TenderScreen = lazyWithRetry(() => import('./components/TenderScreen'));
const HomeScreen = lazyWithRetry(() => import('./components/HomeScreen'));
const CarsScreen = lazyWithRetry(() => import('./components/CarsScreen'));
const JobsScreen = lazyWithRetry(() => import('./components/JobsScreen'));
const CategoriesScreen = lazyWithRetry(() => import('./components/CategoriesScreen'));
const CompaniesScreen = lazyWithRetry(() => import('./components/CompaniesScreen'));
const AnalyticsScreen = lazyWithRetry(() => import('./components/AnalyticsScreen'));
const SystemSettingsScreen = lazyWithRetry(() => import('./components/SystemSettingsScreen'));
const FinancialScreen = lazyWithRetry(() => import('./components/FinancialScreen'));

// Secondary Screens
const HomepageManagementScreen = lazyWithRetry(() => import('./components/HomepageManagementScreen'));
const CommunicationScreen = lazyWithRetry(() => import('./components/CommunicationScreen'));
const ContentModerationScreen = lazyWithRetry(() => import('./components/ContentModerationScreen'));
const MembershipScreen = lazyWithRetry(() => import('./components/MembershipScreen'));
const LegalComplianceScreen = lazyWithRetry(() => import('./components/LegalComplianceScreen'));
const MobileAppScreen = lazyWithRetry(() => import('./components/MobileAppScreen'));
const ReportsScreen = lazyWithRetry(() => import('./components/ReportsScreen'));
const UserManagementScreen = lazyWithRetry(() => import('./components/UserManagementScreen'));
const SecurityScreen = lazyWithRetry(() => import('./components/SecurityScreen'));
const BackupScreen = lazyWithRetry(() => import('./components/BackupScreen'));
const ApiManagementScreen = lazyWithRetry(() => import('./components/ApiManagementScreen'));
const SupportScreen = lazyWithRetry(() => import('./components/SupportScreen'));
const AdvancedAnalyticsScreen = lazyWithRetry(() => import('./components/AdvancedAnalyticsScreen'));
const WorkflowScreen = lazyWithRetry(() => import('./components/WorkflowScreen'));
const NotificationScreen = lazyWithRetry(() => import('./components/NotificationScreen'));
const IntegrationScreen = lazyWithRetry(() => import('./components/IntegrationScreen'));
const HelpScreen = lazyWithRetry(() => import('./components/HelpScreen'));

// NEW: Payment & Membership Screens
const PaymentIntegrationScreen = lazyWithRetry(() => import('./components/PaymentIntegrationScreen'));
const MembershipPlansScreen = lazyWithRetry(() => import('./components/MembershipPlansScreen'));
const PagesManagementScreen = lazyWithRetry(() => import('./components/PagesManagementScreen'));
const PostTemplateScreen = lazyWithRetry(() => import('./components/PostTemplateScreen'));
const EmailSettingsPage = lazyWithRetry(() => import('./components/EmailSettingsPage'));

const AdminDashboard = () => {
  const { t } = useTranslation();
  // Theme State
  const [mode, setMode] = useState('light');
  const theme = useMemo(() => mode === 'light' ? adminTheme : adminDarkTheme, [mode]);

  const toggleTheme = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  }, []);

  const [activeTab, setActiveTab] = useState(0);
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [selectedItems, setSelectedItems] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Data States
  const [stats, setStats] = useState({
    totalListings: 0, pendingReview: 0, approvedListings: 0, rejectedListings: 0,
    totalUsers: 0, activeUsers: 0, revenue: 0
  });
  const [listings, setListings] = useState([]);
  const [users, setUsers] = useState([]);
  const [tenders, setTenders] = useState([]);
  const [financialData, setFinancialData] = useState({ transactions: [] });
  const [analyticsData, setAnalyticsData] = useState({});
  const [systemSettings, setSystemSettings] = useState({});

  // Fetch Data Based on Active Tab (Optimized for performance)
  const fetchDataForTab = useCallback(async (tabIndex, forceRefresh = false) => {
    setLoading(true);
    setError(null);
    try {
      // Only fetch data specific to the active tab to reduce initial load time
      if (tabIndex === 0) { // Dashboard - fetch minimal stats
        const data = await adminService.getDashboardStats({ forceRefresh });
        setStats(data.stats);
        setListings(data.listings || []);
        setUsers(data.users || []);
        setTenders(data.tenders || []);
        setFinancialData(data.financial || {});
        setAnalyticsData(data.analytics || {});
        setSystemSettings(data.settings || {});
      } else if (tabIndex === 1) { // Tenders
        // Always fetch fresh tenders to ensure search/filter works or just standard fresh data
        const tenderData = await adminService.getListings({ category: 'tenders', limit: 50 });
        setTenders(tenderData);

      } else if (tabIndex === 2) { // Homes
        const homeData = await adminService.getListings({ category: 'home', limit: 50 });
        setListings(homeData);
      } else if (tabIndex === 3) { // Cars
        const carData = await adminService.getListings({ category: 'car', limit: 50 });
        setListings(carData);
      } else if (tabIndex === 4) { // Jobs
        const jobData = await adminService.getListings({ category: 'job', limit: 50 });
        setListings(jobData);
      } else if (tabIndex === 17) { // Users
        const allUsers = await adminService.getUsers({ limit: 100 });
        setUsers(allUsers);
      } else if (tabIndex === 9) { // Settings
        const settings = await adminService.getSystemSettings();
        setSystemSettings(settings);
      }
      // Other tabs will fetch data on-demand within their components

    } catch (err) {
      console.error('Error fetching data for tab:', err);
      setError('Failed to load data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  }, []); // Remove dependencies to prevent infinite loops

  useEffect(() => {
    fetchDataForTab(activeTab);
  }, [fetchDataForTab, activeTab]);

  const handleRefresh = () => {
    fetchDataForTab(activeTab, true);
  };

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchTerm('');
    setFilterStatus('all');
    setSelectedItems([]);
  };

  const handleSearch = (term) => setSearchTerm(term);
  const handleFilter = (status) => setFilterStatus(status);
  const handleItemSelect = (itemId) => {
    setSelectedItems(prev => prev.includes(itemId) ? prev.filter(id => id !== itemId) : [...prev, itemId]);
  };
  const handleBulkAction = (action) => console.log(`Bulk action: ${action}`, selectedItems);
  const handleDialogOpen = () => setDialogOpen(true);
  const handleDialogClose = () => setDialogOpen(false);

  // Filter Logic (Simple client-side for now)
  const filteredTenders = useMemo(() => {
    if (!tenders) return [];
    return tenders.filter(t =>
      (t.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        t.description?.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filterStatus === 'all' || t.status === filterStatus)
    );
  }, [tenders, searchTerm, filterStatus]);

  const commonProps = {
    t, handleRefresh, refreshing: loading,
    searchTerm, setSearchTerm: handleSearch,
    filterStatus, setFilterStatus: handleFilter,
    selectedItems, setSelectedItems: handleItemSelect,
    onBulkAction: handleBulkAction,
    onDialogOpen: handleDialogOpen, dialogOpen, onDialogClose: handleDialogClose,
    stats, listings, users, tenders, financialData, analyticsData, systemSettings
  };

  const renderActiveScreen = () => {
    switch (activeTab) {
      case 0: return <AdminHomepage {...commonProps} listings={listings.slice(0, 5)} users={users.slice(0, 5)} />;
      case 1: return <TenderScreen {...commonProps} tenders={filteredTenders} />;
      case 2: return <HomeScreen {...commonProps} homes={listings} />;
      case 3: return <CarsScreen {...commonProps} cars={listings} />;
      case 4: return <JobsScreen {...commonProps} jobs={listings} />;
      case 5: return <HomepageManagementScreen {...commonProps} />;
      case 6: return <CategoriesScreen {...commonProps} />;
      case 7: return <CompaniesScreen {...commonProps} />;
      case 8: return <AnalyticsScreen {...commonProps} />;
      case 9: return <SystemSettingsScreen {...commonProps} onSettingsChange={setSystemSettings} />;
      case 10: return <FinancialScreen {...commonProps} />;
      case 11: return <CommunicationScreen {...commonProps} />;
      case 12: return <ContentModerationScreen {...commonProps} />;
      case 13: return <MembershipScreen {...commonProps} />;
      case 14: return <LegalComplianceScreen {...commonProps} />;
      case 15: return <MobileAppScreen {...commonProps} />;
      case 16: return <ReportsScreen {...commonProps} />;
      case 17: return <UserManagementScreen {...commonProps} />;
      case 18: return <SecurityScreen {...commonProps} />;
      case 19: return <BackupScreen {...commonProps} />;
      case 20: return <ApiManagementScreen {...commonProps} />;
      case 21: return <SupportScreen {...commonProps} />;
      case 22: return <AdvancedAnalyticsScreen {...commonProps} />;
      case 23: return <WorkflowScreen {...commonProps} />;
      case 24: return <NotificationScreen {...commonProps} />;
      case 25: return <IntegrationScreen {...commonProps} />;
      case 26: return <HelpScreen {...commonProps} />;
      case 27: return <PaymentIntegrationScreen {...commonProps} />;
      case 28: return <MembershipPlansScreen {...commonProps} />;
      case 29: return <PagesManagementScreen {...commonProps} />;
      case 30: return <PostTemplateScreen {...commonProps} />;
      case 31: return <EmailSettingsPage {...commonProps} />;
      default: return <Box p={3}><Typography>{t('featureUnderDevelopment')}</Typography></Box>;
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <ResponsiveAdminLayout
        activeTab={activeTab}
        setActiveTab={handleTabChange}
        drawerOpen={drawerOpen}
        setDrawerOpen={setDrawerOpen}
        menuItems={MENU_ITEMS}
        t={t}
        mode={mode}
        toggleTheme={toggleTheme}
      >
        <Box sx={{ minHeight: '400px' }}>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

          <Suspense fallback={
            <Box display="flex" flexDirection="column" gap={2} justifyContent="center" alignItems="center" minHeight="60vh">
              <CircularProgress size={40} />
              <Typography variant="body2" color="text.secondary">Loading Dashboard Screen...</Typography>
            </Box>
          }>
            {renderActiveScreen()}
          </Suspense>
        </Box>
      </ResponsiveAdminLayout>
    </ThemeProvider>
  );
};

export default AdminDashboard;
