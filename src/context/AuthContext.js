import React, { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';


const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Get initial session
    const initSession = async () => {
      try {



        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ AuthProvider: Error getting session:", error);
        } else if (session) {


        } else {

        }

        setSession(session);
        setUser(session?.user ?? null);
      } catch (error) {
        console.error('❌ AuthProvider: Create client/session critical error:', error);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {

      if (session) {


      } else {

      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // 3. Expose Native Login Handler (For Mobile App)
    window.handleNativeGoogleLogin = async (token, metaDataStr) => {
      console.log("📱 Native Native Google Login Triggered");
      try {
        const metaData = metaDataStr ? JSON.parse(metaDataStr) : {};
        // Access login function by re-using the logic inside the provider isn't clean directly 
        // because 'login' is defined in the 'value' object below.
        // We will call the internal internal login logic or supabase directly.
        // Better: Use the supabase client directly here for the specific ID Token flow

        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: 'google',
          token: token,
          options: { data: metaData }
        });

        if (error) throw error;

        // Update local state - AuthStateChange should handle it, but being explicit helps
        if (data.session) {
          setSession(data.session);
          setUser(data.session.user);
          return JSON.stringify({ success: true });
        }
      } catch (err) {
        console.error("Native Login Failed:", err);
        return JSON.stringify({ success: false, error: err.message });
      }
    };

    return () => {
      subscription.unsubscribe();
      delete window.handleNativeGoogleLogin;
    };
  }, []);

  const value = {
    user,
    session,
    loading,
    isAuthenticated: !!user,
    // Helper to get fresh user data
    refreshUser: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      return user;
    },
    // Unified Login Function
    login: async ({ email, password, isGoogle, googleToken, isWebOAuth, metaData }) => {
      try {
        setLoading(true);
        let result;

        if (isGoogle && googleToken) {
          // Handle Google Sign In (ID Token flow - Mobile/Native)
          result = await supabase.auth.signInWithIdToken({
            provider: 'google',
            token: googleToken,
            options: {
              data: metaData
            }
          });
        } else if (isWebOAuth) {
          // Handle Standard Web OAuth (Browser)

          const redirectUrl = window.location.origin;


          result = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
              redirectTo: redirectUrl,
              data: metaData
            }
          });

          if (result.error) {
            console.error('OAuth Error:', result.error);
            throw result.error;
          }
          return { success: true };
        } else {
          // Standard Email/Password Login
          result = await supabase.auth.signInWithPassword({
            email,
            password,
          });
        }

        const { data, error } = result;

        if (error) throw error;
        return { success: true, user: data.user, session: data.session };
      } catch (error) {
        console.error("Login Error:", error);
        return { success: false, error: error.message };
      } finally {
        setLoading(false);
      }
    },
    signOut: async () => {
      await supabase.auth.signOut();
    },
    // Alias for backward compatibility
    logout: async () => {
      await supabase.auth.signOut();
    }
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

