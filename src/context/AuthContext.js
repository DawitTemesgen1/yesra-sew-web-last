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
        console.log("🔐 AuthProvider: Initializing session...");
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("❌ AuthProvider: Error getting session:", error);
        } else if (session) {
          console.log("✅ AuthProvider: Session found for user:", session.user.email);
          console.log("   -> User Role:", session.user.role);
          console.log("   -> User ID:", session.user.id);
        } else {
          console.log("ℹ️ AuthProvider: No active session found.");
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
      console.log(`🔔 Auth State Changed: [${_event}]`);
      if (session) {
        console.log("   -> New User:", session.user.email);
      } else {
        console.log("   -> User signed out or session expired.");
      }
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
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
