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
import { AnimatePresence } from 'framer-motion';
import CookieConsent from './components/CookieConsent';
import NotFoundPage from './pages/NotFoundPage';
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

    // Initialize GA4 (Placeholder)
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            // Example: ReactGA.initialize('G-XXXXXXXXXX');
            // ReactGA.pageview(window.location.pathname + window.location.search);
        }
    }, [location]);

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
            {!hideNavFooter && <Navbar activeTab={activeTab} setActiveTab={setActiveTab} />}
            <Box component="main" sx={{ flexGrow: 1 }}>{children}</Box>
            {!hideNavFooter && <Footer />}
            <CookieConsent />
        </Box>
    );
};




const RedirectHandler = () => {
    React.useEffect(() => {
        if (process.env.NODE_ENV === 'production') {
            const { hostname, protocol, pathname, search, hash } = window.location;
            const targetDomain = 'www.yesrasewsolution.com';

            // 1. Enforce HTTPS
            if (protocol !== 'https:' && hostname !== 'localhost') {
                window.location.href = `https://${hostname}${pathname}${search}${hash}`;
                return;
            }

            // 2. Enforce WWW for yesrasewsolution.com
            // If we are on the root domain (non-www), redirect to www
            if (hostname === 'yesrasewsolution.com') {
                window.location.href = `https://${targetDomain}${pathname}${search}${hash}`;
                return;
            }
        }
    }, []);
    return null;
};

// Prefetch critical pages for instant navigation
const prefetchRoutes = () => {
    const criticalRoutes = [
        () => import('./pages/CarsPage'),
        () => import('./pages/HomesPage'),
        () => import('./pages/JobsPage'),
        () => import('./pages/TendersPage'),
        () => import('./pages/ListingsPage')
    ];

    criticalRoutes.forEach(promise => {
        try {
            promise();
        } catch (e) {
            // Ignore prefetch errors
        }
    });
};

const AnimatedRoutes = () => {
    const location = useLocation();

    // Trigger prefetch on first load
    React.useEffect(() => {
        const timer = setTimeout(() => {
            prefetchRoutes();
        }, 2000); // Start prefetching 2s after app load
        return () => clearTimeout(timer);
    }, []);

    return (
        <AnimatePresence mode="wait">
            <Routes location={location} key={location.pathname}>
                <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
                <Route path="/tenders" element={<ProtectedRoute><TendersPage /></ProtectedRoute>} />
                <Route path="/jobs" element={<ProtectedRoute><JobsPage /></ProtectedRoute>} />
                <Route path="/homes" element={<ProtectedRoute><HomesPage /></ProtectedRoute>} />
                <Route path="/cars" element={<ProtectedRoute><CarsPage /></ProtectedRoute>} />
                <Route path="/listings" element={<ProtectedRoute><ListingsPage /></ProtectedRoute>} />
                <Route path="/listings/:id" element={<ProtectedRoute><ListingDetailPage /></ProtectedRoute>} />
                <Route path="/login" element={<EnhancedAuthPage />} />
                <Route path="/register" element={<EnhancedAuthPage />} />
                <Route path="/auth" element={<EnhancedAuthPage />} />
                {/* Redirect /dashboard to /profile */}
                <Route path="/dashboard" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
                <Route path="/post-ad" element={<ProtectedRoute><PostAdPage /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/chat/:recipientId" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
                <Route path="/admin-login" element={<AdminLoginPage />} />
                <Route path="/admin-panel" element={<AdminProtectedRoute><AdminDashboard /></AdminProtectedRoute>} />
                <Route path="/search" element={<ProtectedRoute><SearchPage /></ProtectedRoute>} />
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
                <Route path="/pricing" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                <Route path="/pricing/jobs" element={<ProtectedRoute><JobsTendersPricingPage category="jobs" /></ProtectedRoute>} />
                <Route path="/pricing/tenders" element={<ProtectedRoute><JobsTendersPricingPage category="tenders" /></ProtectedRoute>} />
                <Route path="/pricing/homes" element={<ProtectedRoute><HomesCarsPricingPage category="homes" /></ProtectedRoute>} />
                <Route path="/pricing/cars" element={<ProtectedRoute><HomesCarsPricingPage category="cars" /></ProtectedRoute>} />
                <Route path="/membership-plans" element={<ProtectedRoute><PricingPage /></ProtectedRoute>} />
                <Route path="/checkout" element={<ProtectedRoute><CheckoutPage /></ProtectedRoute>} />

                {/* Dynamic Pages (Privacy, Terms, etc.) - Must be last */}
                <Route path="/:slug" element={<ProtectedRoute><DynamicPage /></ProtectedRoute>} />
                <Route path="*" element={<NotFoundPage />} />
            </Routes>
        </AnimatePresence>
    );
};

function App() {
    // App Root with Providers
    return (
        <HelmetProvider>
            <RedirectHandler />
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
                                                <AnimatedRoutes />
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
