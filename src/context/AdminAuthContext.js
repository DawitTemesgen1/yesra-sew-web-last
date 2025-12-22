import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';

const AdminAuthContext = createContext();

export const AdminAuthProvider = ({ children }) => {
    const [adminUser, setAdminUser] = useState(null);
    const [adminSession, setAdminSession] = useState(null);
    const [loading, setLoading] = useState(true);

    // Helper to check if a user has admin role (Retries 3 times)
    const verifyAdminRole = async (userId, userMetadata = null) => {
        // 1. Check user_metadata first (if provided) - it's faster and no DB query
        if (userMetadata?.role === 'admin' || userMetadata?.role === 'super_admin') {
            
            return true;
        }

        // 2. Performance Optimization: If metadata exists and it is NOT admin, 
        // we can be 95% sure they are not admin. For standard users, we skip the DB check
        // unless they are specifically hitting an admin route (which can be checked elsewhere)
        // or we have a forced check.
        if (userMetadata && userMetadata.role && !['admin', 'super_admin'].includes(userMetadata.role)) {
            
            return false;
        }

        // 3. Cache for session-level persistence of "not admin" state to prevent repeat DB hits
        const cacheKey = `is_not_admin_${userId}`;
        if (sessionStorage.getItem(cacheKey)) {
            return false;
        }

        const fetchRoleWithTimeout = async () => {
            // TIMEOUT PROTECTION: logic to ensure we don't hang forever on the database query
            const profilePromise = supabase
                .from('profiles')
                .select('role')
                .eq('id', userId)
                .maybeSingle();

            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error('Profile check DB timeout')), 4000)
            );

            const { data: profile, error } = await Promise.race([profilePromise, timeoutPromise]);

            if (error) {
                // If permission denied (403/401), likely RLS issue, but effectively 'not admin' for now
                if (error.code === 'PGRST301' || error.code === '42501') {
                    console.warn("⚠️ AdminAuthContext: RLS Permission denied reading profile role.");
                    return { role: 'user' };
                }
                throw error;
            }
            return profile;
        };

        const start = Date.now();
        

        // For non-admin metadata users, only try ONCE to avoid hanging the app
        const maxAttempts = (userMetadata && !userMetadata.role) ? 1 : 2;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
            try {
                const profile = await fetchRoleWithTimeout();

                const duration = Date.now() - start;
                

                if (profile?.role === 'admin' || profile?.role === 'super_admin') {
                    return true;
                }

                // If they are not admin, cache it for this session to avoid re-checking
                
                sessionStorage.setItem(cacheKey, 'true');
                return false;

            } catch (err) {
                console.warn(`⚠️ Admin check attempt ${attempt + 1} failed:`, err.message);
                if (attempt < maxAttempts - 1) {
                    await new Promise(r => setTimeout(r, 1000));
                }
            }
        }

        return false;
    };

    useEffect(() => {
        let mounted = true;

        const initializeAuth = async () => {
            
            try {
                // 1. Get current session
                const { data: { session }, error } = await supabase.auth.getSession();

                // Handle session fetch errors (e.g. network/hangs)
                if (error) {
                    console.warn("⚠️ AdminAuthContext: Session fetch error:", error);
                    if (mounted) setLoading(false);
                    return;
                }

                if (session?.user) {
                    // 2. If user exists, verify role
                    const isAdmin = await verifyAdminRole(session.user.id, session.user.user_metadata);
                    if (mounted) {
                        if (isAdmin) {
                            setAdminUser(session.user);
                            setAdminSession(session);
                        } else {
                            // User is logged in but NOT admin. 
                            // We do NOT sign them out globally (to avoid disrupting main app),
                            // but we do not set admin state.
                            setAdminUser(null);
                            setAdminSession(null);
                        }
                    }
                }
            } catch (err) {
                console.error("❌ AdminAuthContext: Initialization error:", err);
            } finally {
                // Always finish loading
                if (mounted) setLoading(false);
            }
        };

        // Safety timeout to prevent infinite loading state
        const safetyTimeout = setTimeout(() => {
            if (mounted && loading) {
                console.warn("⚠️ AdminAuthContext: Initialization timed out. Forcing loading=false.");
                setLoading(false);
            }
        }, 10000); // Increased to 10s for better reliability on slow connections

        initializeAuth();

        // 3. Listen for Auth Changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (!mounted) return;
            

            if (event === 'SIGNED_OUT') {
                setAdminUser(null);
                setAdminSession(null);
                return;
            }

            if (session?.user) {
                // Re-verify on sign-in or token refresh
                // This is critical to ensure we don't trust stale local state
                const isAdmin = await verifyAdminRole(session.user.id, session.user.user_metadata);
                if (mounted) {
                    if (isAdmin) {
                        setAdminUser(session.user);
                        setAdminSession(session);
                    } else {
                        setAdminUser(null);
                        setAdminSession(null);
                    }
                }
            }
        });

        // 4. Auto-refresh session every 5 minutes to prevent logout
        const refreshInterval = setInterval(async () => {
            if (!mounted) return;
            try {
                const { data: { session }, error } = await supabase.auth.getSession();
                if (error) {
                    console.warn('Session refresh error:', error);
                    return;
                }

                if (session) {
                    // Refresh the session
                    await supabase.auth.refreshSession();
                    
                }
            } catch (error) {
                console.error('Error refreshing session:', error);
            }
        }, 5 * 60 * 1000); // Every 5 minutes

        return () => {
            mounted = false;
            clearTimeout(safetyTimeout);
            clearInterval(refreshInterval);
            subscription.unsubscribe();
        };
    }, []);

    // --- Actions ---

    const signIn = async (email, password) => {
        try {
            

            // 1. Perform Login
            // We await this directly. If network is slow, it will wait.
            // Browser defaults or Supabase defaults handle 60s+ timeouts usually.
            const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password
            });

            if (error) throw error;

            if (!data?.user) throw new Error("No user returned from login");

            // 2. Verify Role Explicitly
            const isAdmin = await verifyAdminRole(data.user.id, data.user.user_metadata);

            if (!isAdmin) {
                console.warn("⚠️ AdminAuthContext: Login successful, but user is NOT admin.");
                await supabase.auth.signOut(); // Force signout if they tried to login to ADMIN portal
                throw new Error('Access denied. You do not have admin permissions.');
            }

            // SELF-HEALING: If we verified they are admin (likely via DB), ensure metadata is in sync
            // This ensures future page reloads are fast and resilient to RLS issues
            if (data.user?.user_metadata?.role !== 'admin' && data.user?.user_metadata?.role !== 'super_admin') {
                
                const { error: updateError } = await supabase.auth.updateUser({
                    data: { role: 'admin' }
                });
                if (updateError) console.warn("Failed to sync role to metadata:", updateError);
            }

            // 3. Update State
            setAdminSession(data.session);
            setAdminUser(data.user);

            return data;
        } catch (error) {
            console.error("Admin Login Error:", error);
            throw error;
        }
    };

    const signOut = async () => {
        try {
            await supabase.auth.signOut();
        } catch (error) {
            console.error("Admin Logout Error:", error);
        } finally {
            setAdminUser(null);
            setAdminSession(null);
        }
    };

    const value = {
        adminUser,
        adminSession,
        loading,
        signIn,
        signOut,
        supabase
    };

    return (
        <AdminAuthContext.Provider value={value}>
            {children}
        </AdminAuthContext.Provider>
    );
};

export const useAdminAuth = () => {
    const context = useContext(AdminAuthContext);
    if (context === undefined) {
        throw new Error('useAdminAuth must be used within an AdminAuthProvider');
    }
    return context;
};

export default AdminAuthContext;

