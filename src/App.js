import React, { useState, useMemo, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { CustomThemeProvider } from './contexts/ThemeContext';
import { Box } from '@mui/material';
import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFnsV3';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { AdminAuthProvider } from './context/AdminAuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';
import AdminProtectedRoute from './components/AdminProtectedRoute';
import RouteLoader from './components/RouteLoader';
import ScrollToTop from './components/ScrollToTop';
import './i18n/config';
import { HelmetProvider } from 'react-helmet-async';
// Core Data & State
import { QueryClientProvider } from 'react-query';
import { queryClient } from './lib/react-query';

// Direct Imports for Core Pages (HomePage kept for fast LCP)
import HomePage from './pages/HomePage';

// Lazy Load Content Pages (Split Bundles)
const ListingsPage = React.lazy(() => import('./pages/ListingsPage'));
const ListingDetailPage = React.lazy(() => import('./pages/ListingDetailPage'));
const PostAdPage = React.lazy(() => import('./pages/PostAdPage'));
const ProfilePage = React.lazy(() => import('./pages/ProfilePage'));
const UpgradePlanPage = React.lazy(() => import('./pages/UpgradePlanPage'));
const TendersPage = React.lazy(() => import('./pages/TendersPage'));
const JobsPage = React.lazy(() => import('./pages/JobsPage'));
const HomesPage = React.lazy(() => import('./pages/HomesPage'));
const CarsPage = React.lazy(() => import('./pages/CarsPage'));

// Lazy Load Secondary Pages
const EnhancedAuthPage = React.lazy(() => import('./pages/EnhancedAuthPage'));
const ChatPage = React.lazy(() => import('./pages/ChatPage'));
const AdminLoginPage = React.lazy(() => import('./pages/AdminLoginPage'));
const AdminDashboard = React.lazy(() => import('./admin/AdminDashboard'));
const PostTemplateScreen = React.lazy(() => import('./admin/components/PostTemplateScreen'));
const PricingPage = React.lazy(() => import('./pages/PricingPage'));
const JobsTendersPricingPage = React.lazy(() => import('./pages/JobsTendersPricingPage'));
const HomesCarsPricingPage = React.lazy(() => import('./pages/HomesCarsPricingPage'));
const SearchPage = React.lazy(() => import('./pages/SearchPage'));
const PaymentCallbackPage = React.lazy(() => import('./pages/PaymentCallbackPage'));
const CheckoutPage = React.lazy(() => import('./pages/CheckoutPage'));
const DynamicPage = React.lazy(() => import('./pages/DynamicPage'));
const TermsOfService = React.lazy(() => import('./pages/TermsOfService'));
const PrivacyPolicy = React.lazy(() => import('./pages/PrivacyPolicy'));
const AboutUs = React.lazy(() => import('./pages/AboutUs'));


const Layout = ({ children }) => {
    const location = useLocation();
    const [activeTab, setActiveTab] = useState(0);
    const isAuthPage = location.pathname === '/auth' || location.pathname === '/login' || location.pathname === '/register';
    const isProfilePage = location.pathname === '/profile';
    const isAdminPage = location.pathname.startsWith('/admin-panel') || location.pathname === '/admin-login';
    const isChatPage = location.pathname === '/chat';
    const hideNavFooter = isAuthPage || isProfilePage || isAdminPage || isChatPage;

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!hideNavFooter && <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />}
            <Box component="main" sx={{ flexGrow: 1 }}>{children}</Box>
            {!hideNavFooter && <Footer />}
        </Box>
    );
};




function App() {
    // App Root with Providers
    return (
        <HelmetProvider>
            <QueryClientProvider client={queryClient}>
                <LanguageProvider>
                    <CustomThemeProvider>
                        <LocalizationProvider dateAdapter={AdapterDateFns}>
                            <Toaster position="top-center" />
                            <AdminAuthProvider>
                                <AuthProvider>
                                    <Router>
                                        <Layout>
                                            <ScrollToTop />
                                            <Suspense fallback={<RouteLoader />}>
                                                <Routes>
                                                    <Route path="/" element={<HomePage />} />
                                                    <Route path="/tenders" element={<TendersPage />} />
                                                    <Route path="/jobs" element={<JobsPage />} />
                                                    <Route path="/homes" element={<HomesPage />} />
                                                    <Route path="/cars" element={<CarsPage />} />
                                                    <Route path="/listings" element={<ListingsPage />} />
                                                    <Route path="/listings/:id" element={<ListingDetailPage />} />
                                                    <Route path="/login" element={<EnhancedAuthPage />} />
                                                    <Route path="/register" element={<EnhancedAuthPage />} />
                                                    <Route path="/auth" element={<EnhancedAuthPage />} />
                                                    {/* Redirect /dashboard to /profile */}
                                                    <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                                                    <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                                                    <Route path="/post-ad" element={<ProtectedRoute><PostAdPage /></ProtectedRoute>} />
                                                    <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                                                    <Route path="/admin-login" element={<AdminLoginPage />} />
                                                    <Route path="/admin-panel" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                                                    <Route path="/search" element={<SearchPage />} />
                                                    <Route path="/payment/success" element={<PaymentCallbackPage />} />
                                                    <Route path="/payment/cancel" element={<PaymentCallbackPage />} />
                                                    <Route path="/payment/error" element={<PaymentCallbackPage />} />
                                                    <Route path="/admin-panel/post-template/:categoryId" element={<AdminProtectedRoute><PostTemplateScreen /></AdminProtectedRoute>} />

                                                    {/* Legal & Info Pages */}
                                                    <Route path="/terms" element={<TermsOfService />} />
                                                    <Route path="/privacy" element={<PrivacyPolicy />} />
                                                    <Route path="/about" element={<AboutUs />} />

                                                    {/* Membership & Pricing */}
                                                    <Route path="/upgrade-plan" element={<ProtectedRoute><UpgradePlanPage /></ProtectedRoute>} />
                                                    <Route path="/pricing" element={<PricingPage />} />
                                                    <Route path="/pricing/jobs" element={<JobsTendersPricingPage category="jobs" />} />
                                                    <Route path="/pricing/tenders" element={<JobsTendersPricingPage category="tenders" />} />
                                                    <Route path="/pricing/homes" element={<HomesCarsPricingPage category="homes" />} />
                                                    <Route path="/pricing/cars" element={<HomesCarsPricingPage category="cars" />} />
                                                    <Route path="/membership-plans" element={<PricingPage />} />
                                                    <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                                                    {/* Dynamic Pages (Privacy, Terms, etc.) - Must be last */}
                                                    <Route path="/:slug" element={<DynamicPage />} />
                                                </Routes>
                                            </Suspense>
                                        </Layout>
                                    </Router>
                                </AuthProvider>
                            </AdminAuthProvider>
                        </LocalizationProvider>
                    </CustomThemeProvider>
                </LanguageProvider>
            </QueryClientProvider>
        </HelmetProvider>
    );
}

export default App;
