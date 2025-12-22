import toast from 'react-hot-toast';
import { supabase } from '../lib/supabaseClient';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000'; // Fallback for local dev

// Re-export supabase for backward compatibility if needed within this file
export { supabase };

// DIAGNOSTIC: Immediate Connection Check
(async () => {
  try {

    const start = Date.now();
    const { data, error } = await supabase.from('listings').select('count', { count: 'exact', head: true }).limit(1);
    const duration = Date.now() - start;

    if (error) {
      console.error("❌ DIAGNOSTIC: Connection FAILED!", error);
      console.error("  -> Possible causes: Invalid credentials, Row Level Security blocking generic select, or Network firewall.");
    } else {
      console.log(`✅ DIAGNOSTIC: Connection OK (${duration}ms)`);
    }
  } catch (err) {
    console.error("❌ DIAGNOSTIC: Network Error or Crash:", err);
  }
})();

class ApiService {
  constructor() {
    this.token = localStorage.getItem('accessToken');
  }

  // --- Helper to Format Phone for Ethiopia (251...) ---
  _formatPhone(phone) {
    let p = phone.replace(/\D/g, '');
    if (p.startsWith('09')) {
      return '251' + p.substring(1);
    }
    if (p.startsWith('9') && p.length === 9) {
      return '251' + p;
    }
    if (p.startsWith('251')) {
      return p;
    }
    return p;
  }

  // --- Helper: Save Session ---
  async _persistSession(data) {
    if (data?.session) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      const fullUser = { ...data.user, ...profile };
      localStorage.setItem('accessToken', data.session.access_token);
      localStorage.setItem('user', JSON.stringify(fullUser));
    }
  }

  // ============================================================
  // AUTHENTICATION
  // ============================================================
  get auth() {
    return {
      // --- 1. Email Registration ---
      registerEmail: async ({ email, password, firstName, lastName, account_type, company_name }) => {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              first_name: firstName,
              last_name: lastName,
              full_name: `${firstName} ${lastName}`,
              account_type: account_type,
              company_name: company_name
            }
          }
        });

        if (error) throw error;
        return { user: data.user, session: data.session, requiresConfirmation: !data.session };
      },

      // --- 2. Email Login ---
      loginEmail: async ({ email, password }) => {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        await this._persistSession(data);
        return { user: data.user, session: data.session };
      },

      // --- 3. Phone Login ---
      loginPhone: async ({ phone, password }) => {
        const cleanPhone = this._formatPhone(phone);

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/phone/login`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: cleanPhone,
              password: password
            })
          });

          const result = await response.json();

          // SECURITY: Validate response structure
          if (!response.ok) {
            throw new Error(result.message || 'Login failed');
          }

          if (result.success) {
            // Validate user data exists
            if (!result.user || !result.user.id) {
              throw new Error('Invalid user data received');
            }

            // Validate phone matches
            if (result.user.phone !== cleanPhone) {
              throw new Error('Phone number mismatch in response');
            }

            // Store session
            localStorage.setItem('accessToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            return { user: result.user, session: { access_token: result.token } };
          } else {
            throw new Error(result.message || 'Login failed');
          }

        } catch (error) {
          console.error('❌ Phone login error:', error);
          throw new Error("Invalid Phone Number or Password");
        }
      },

      // --- 4. Send SMS OTP (Clean Implementation) ---
      sendPhoneOtp: async (phone) => {
        const cleanPhone = this._formatPhone(phone);

        try {
          const response = await fetch(`${API_BASE_URL}/api/sms/send`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: cleanPhone
            })
          });

          const result = await response.json();

          if (result.success && result.devOtp) {
            // Show OTP in toast
            toast(`🔢 OTP: ${result.devOtp}`, { duration: 10000 });
            return { success: true, devOtp: result.devOtp };
          } else {
            throw new Error(result.message || 'Failed to send OTP');
          }

        } catch (error) {
          console.error('❌ Send OTP error:', error);

          // Fallback - 4-digit OTP
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          toast(`🔢 FALLBACK OTP: ${code}`, { duration: 10000 });

          return {
            success: true,
            message: 'OTP generated (fallback mode)',
            devOtp: code
          };
        }
      },

      // --- 5. Verify OTP & Create User ---
      verifyPhoneRegistration: async ({ phone, otp, password, userData }) => {
        const cleanPhone = this._formatPhone(phone);

        // For development, accept any 4-digit code
        if (!/^\d{4}$/.test(otp)) {
          throw new Error("Invalid verification code");
        }

        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/phone/register`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              phone: cleanPhone,
              password: password,
              firstName: userData.firstName,
              lastName: userData.lastName,
              accountType: userData.accountType,
              companyName: userData.companyName
            })
          });

          const result = await response.json();

          if (result.success) {
            // Store session
            localStorage.setItem('accessToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            return { user: result.user, session: { access_token: result.token } };
          } else {
            throw new Error(result.message || 'Registration failed');
          }

        } catch (error) {
          console.error('❌ Phone registration error:', error);
          throw error;
        }
      },

      // --- 7. Google OAuth ---
      loginWithGoogle: async (token) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/google`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              token: token
            })
          });

          const result = await response.json();

          if (result.success) {
            // Store session
            localStorage.setItem('accessToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            return { user: result.user, session: { access_token: result.token } };
          } else {
            throw new Error(result.message || 'Google login failed');
          }

        } catch (error) {
          console.error('❌ Google login error:', error);
          throw error;
        }
      },

      // --- 8. Email OTP ---
      sendEmailOtp: async (email) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/email/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email
            })
          });

          const result = await response.json();

          if (result.success && result.devOtp) {
            // Show OTP in toast
            toast(`📧 Email OTP: ${result.devOtp}`, { duration: 10000 });
            return { success: true, devOtp: result.devOtp };
          } else if (result.success) {
            return { success: true };
          } else {
            throw new Error(result.message || 'Failed to send email OTP');
          }

        } catch (error) {
          console.error('❌ Send email OTP error:', error);

          // Fallback - 4-digit OTP
          const code = Math.floor(1000 + Math.random() * 9000).toString();
          toast(`📧 FALLBACK EMAIL OTP: ${code}`, { duration: 10000 });

          return {
            success: true,
            message: 'OTP generated (fallback mode)',
            devOtp: code
          };
        }
      },

      verifyEmailRegistration: async ({ email, otp, firstName, lastName, accountType, companyName }) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/email/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              email: email,
              otp: otp,
              firstName: firstName,
              lastName: lastName,
              accountType: accountType,
              companyName: companyName
            })
          });

          const result = await response.json();

          if (result.success) {
            // Store session
            localStorage.setItem('accessToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            return { user: result.user, session: { access_token: result.token } };
          } else {
            throw new Error(result.message || 'Email verification failed');
          }

        } catch (error) {
          console.error('❌ Email verification error:', error);
          throw error;
        }
      },

      // --- Forgot Password Flow ---
      sendPasswordResetOtp: async (email) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          });

          const result = await response.json();

          if (result.success && result.devOtp) {
            // Show OTP in toast for development
            toast(`🔐 Reset Code: ${result.devOtp}`, { duration: 15000 });
            return { success: true, devOtp: result.devOtp };
          } else if (result.success) {
            return { success: true };
          } else {
            throw new Error(result.message || 'Failed to send reset code');
          }

        } catch (error) {
          console.error('❌ Send password reset OTP error:', error);
          throw error;
        }
      },

      verifyPasswordResetOtp: async (email, otp) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp })
          });

          const result = await response.json();

          if (result.success) {
            return { success: true, resetToken: result.resetToken };
          } else {
            throw new Error(result.message || 'Invalid or expired code');
          }

        } catch (error) {
          console.error('❌ Verify password reset OTP error:', error);
          throw error;
        }
      },

      resetPassword: async (email, newPassword, resetToken) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password/reset`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, newPassword, resetToken })
          });

          const result = await response.json();

          if (result.success) {
            return { success: true, message: result.message };
          } else {
            throw new Error(result.message || 'Failed to reset password');
          }

        } catch (error) {
          console.error('❌ Password reset error:', error);
          throw error;
        }
      },

      // --- Phone Forgot Password Flow ---
      sendPhonePasswordResetOtp: async (phone) => {
        // Use helper if available, otherwise basic clean
        const cleanPhone = apiService.auth._formatPhone ? apiService.auth._formatPhone(phone) : phone.replace(/\D/g, '');
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password-phone/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: cleanPhone })
          });

          const result = await response.json();

          if (result.success && result.devOtp) {
            // Show OTP in toast for development
            toast(`🔐 Reset Code: ${result.devOtp}`, { duration: 15000 });
            return { success: true, devOtp: result.devOtp };
          } else if (result.success) {
            return { success: true };
          } else {
            throw new Error(result.message || 'Failed to send reset code');
          }

        } catch (error) {
          console.error('❌ Send phone reset OTP error:', error);
          throw error;
        }
      },

      verifyPhonePasswordResetOtp: async (phone, otp) => {
        const cleanPhone = apiService.auth._formatPhone ? apiService.auth._formatPhone(phone) : phone.replace(/\D/g, '');
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password-phone/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: cleanPhone, otp })
          });

          const result = await response.json();

          if (result.success) {
            return { success: true, resetToken: result.resetToken };
          } else {
            throw new Error(result.message || 'Invalid or expired code');
          }

        } catch (error) {
          console.error('❌ Verify phone reset OTP error:', error);
          throw error;
        }
      },

      resetPhonePassword: async (phone, newPassword, resetToken) => {
        const cleanPhone = apiService.auth._formatPhone ? apiService.auth._formatPhone(phone) : phone.replace(/\D/g, '');
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password-phone/reset`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ phone: cleanPhone, newPassword, resetToken })
          });

          const result = await response.json();

          if (result.success) {
            return { success: true, message: result.message };
          } else {
            throw new Error(result.message || 'Failed to reset password');
          }

        } catch (error) {
          console.error('❌ Reset phone password error:', error);
          throw error;
        }
      },

      // --- Passwordless Login (Email OTP) ---
      sendLoginOtp: async (email) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login/send-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email })
          });

          const result = await response.json();

          if (result.success && result.devOtp) {
            // Show OTP in toast for development
            toast(`🔑 Login Code: ${result.devOtp}`, { duration: 15000 });
            return { success: true, devOtp: result.devOtp };
          } else if (result.success) {
            return { success: true };
          } else {
            throw new Error(result.message || 'Failed to send login code');
          }

        } catch (error) {
          console.error('❌ Send login OTP error:', error);
          throw error;
        }
      },

      verifyLoginOtp: async (email, otp) => {
        try {
          const response = await fetch(`${API_BASE_URL}/api/auth/login/verify-otp`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, otp })
          });

          const result = await response.json();

          if (result.success) {
            // Store session
            localStorage.setItem('accessToken', result.token);
            localStorage.setItem('user', JSON.stringify(result.user));

            return { user: result.user, session: { access_token: result.token } };
          } else {
            throw new Error(result.message || 'Invalid or expired code');
          }

        } catch (error) {
          console.error('❌ Verify login OTP error:', error);
          throw error;
        }
      },

      logout: async () => {
        await supabase.auth.signOut();
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
      }
    };
  }

  // --- Wrapper for public listing fetch (OPTIMIZED) ---
  async getListings(params) {
    try {
      const optimizedListingService = (await import('./optimized-listing-service')).default;
      const result = await optimizedListingService.getListings(params);
      return result.listings ? result : { listings: result };
    } catch (error) {
      console.error('ApiService getListings error:', error);
      return { listings: [] };
    }
  }

  // --- Dashboard functions ---
  async getDashboardData() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Use listing service to get listings
      const listingService = (await import('./listing-service')).default;
      const { listings } = await listingService.getUserListings();

      // Get profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      const fullUser = { ...user, ...(profile || {}) };

      return {
        user: {
          name: fullUser.full_name || fullUser.email || 'User',
          email: fullUser.email,
          phone: fullUser.phone,
          location: fullUser.location || '',
          memberSince: fullUser.created_at,
          verified: fullUser.is_verified || false,
          avatar: fullUser.avatar_url,
          rating: fullUser.rating || 0,
          totalReviews: fullUser.reviews_count || 0
        },
        stats: {
          totalPosts: listings.length,
          activePosts: listings.filter(l => l.status === 'approved' || l.status === 'active').length,
          totalViews: listings.reduce((sum, l) => sum + (l.views || l.view_count || 0), 0),
          responseRate: fullUser.response_rate || 100 // Placeholder
        },
        listings: listings
      };
    } catch (error) {
      console.error('Dashboard data error:', error);
      // Return empty structure to prevent crash
      return {
        user: { name: 'User', email: '', avatar: '', memberSince: new Date().toISOString() },
        stats: { totalPosts: 0, activePosts: 0, totalViews: 0, responseRate: 0 },
        listings: []
      };
    }
  }

  async getNotifications() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Notifications error:', error);
      return [];
    }
  }

  async deleteListing(listingId) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.deleteListing(listingId);
    } catch (error) {
      console.error('Delete listing error:', error);
      throw error;
    }
  }

  // --- Public Data Methods ---
  async getCategories() {
    // 1. Optimized Cache Check
    if (window._categoryCache && window._categoryCache.length > 0) {
      return { success: true, categories: window._categoryCache, data: { categories: window._categoryCache } };
    }

    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true });

      if (error) throw error;

      // Store in memory
      window._categoryCache = data || [];

      return { success: true, categories: data, data: { categories: data } };
    } catch (error) {
      console.error('Error fetching categories:', error);
      return { success: false, categories: window._categoryCache || [], data: { categories: window._categoryCache || [] } };
    }
  }

  async getMarketStats() {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.getMarketStats();
    } catch (error) {
      console.error('Error in apiService.getMarketStats:', error);
      return { jobs: 0, homes: 0, cars: 0 };
    }
  }

  // --- Mocks & Data Helpers ---
  get listings() {
    return {
      getAll: async (filters) => {
        const listingService = (await import('./listing-service')).default;
        // Transform API format to service format if needed, but usually they match
        const result = await listingService.getListings(filters);
        // Ensure consistent return format { data: { listings: ... } } for useApi hooks
        return {
          data: { listings: result.listings || [] },
          listings: result.listings || []
        };
      },
      getById: async (id) => {
        const listingService = (await import('./listing-service')).default;
        const result = await listingService.getListingById(id);
        return {
          data: { listing: result.listing },
          listing: result.listing
        };
      },
      create: async (data) => {
        const listingService = (await import('./listing-service')).default;
        const result = await listingService.createListing(data);
        return {
          data: { listing: result.listing },
          success: result.success
        };
      },
      delete: async (id) => {
        const listingService = (await import('./listing-service')).default;
        return await listingService.deleteListing(id);
      },
      toggleFavorite: async (id) => {
        const listingService = (await import('./listing-service')).default;
        const result = await listingService.toggleFavorite(id);
        return {
          data: { is_favorited: result.favorited },
          favorited: result.favorited
        };
      }
    };
  }

  get users() {
    return {
      getProfile: async () => {
        try {
          const userService = (await import('./user-service')).default;
          const result = await userService.getProfile();
          return { data: { user: result }, user: result };
        } catch (error) {
          console.error('Error getting profile:', error);
          return null;
        }
      },
      updateProfile: async (updates) => {
        try {
          const userService = (await import('./user-service')).default;
          const result = await userService.updateProfile(updates);
          return { data: { user: result }, user: result };
        } catch (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      },
      getFavorites: async (params) => {
        try {
          const userService = (await import('./user-service')).default;
          const result = await userService.getFavorites(params);
          return { data: { listings: result }, listings: result };
        } catch (error) {
          console.error('Error getting favorites:', error);
          return { data: { listings: [] }, listings: [] };
        }
      },
      getNotifications: async (params) => {
        try {
          const notifs = await apiService.getNotifications();
          return { data: { notifications: notifs }, notifications: notifs };
        } catch (err) { return { data: { notifications: [] }, notifications: [] }; }
      },
      getReviews: async () => ({ data: { reviews: [] }, reviews: [] })
    };
  }

  get categories() {
    return {
      getAll: async (params) => {
        // Use this.getCategories() which is defined in this class (ApiService)
        const result = await this.getCategories(params);
        return {
          data: { categories: result.categories || [] },
          categories: result.categories || []
        };
      },
      getTree: async () => {
        // Fallback to getAll for now if tree is not implemented
        const result = await this.getCategories();
        return {
          data: { categories: result.categories || [] }
        };
      }
    };
  }

  get admin() {
    return {
      getDashboardStats: async () => {
        const adminService = (await import('./adminService')).default;
        return await adminService.getDashboardStats(); // It returns { stats: ..., listings: ... }
      },
      getPendingListings: async () => {
        const adminService = (await import('./adminService')).default;
        const listings = await adminService.getListings({ status: 'pending' });
        return { listings };
      },
      getAllUsers: async () => {
        const adminService = (await import('./adminService')).default;
        const users = await adminService.getUsers();
        return { users };
      },
      // Map other admin methods required by hooks
      getDashboard: async () => {
        const adminService = (await import('./adminService')).default;
        return { data: await adminService.getDashboardStats() };
      },
      getUsers: async (params) => {
        const adminService = (await import('./adminService')).default;
        const users = await adminService.getUsers(params);
        return { data: { users } };
      },
      getListings: async (params) => {
        const adminService = (await import('./adminService')).default;
        const listings = await adminService.getListings(params);
        return { data: { listings } };
      },
      getTransactions: async (params) => {
        const adminService = (await import('./adminService')).default;
        const transactions = await adminService.getAllTransactions(params);
        return { data: { transactions } };
      },
      getReports: async (params) => {
        const adminService = (await import('./adminService')).default;
        const reports = await adminService.getReports(params);
        return { data: { reports } };
      },
      updateUserStatus: async (id, data) => {
        const adminService = (await import('./adminService')).default;
        return await adminService.updateUserStatus(id, data);
      },
      updateListingStatus: async (id, data) => {
        const adminService = (await import('./adminService')).default;
        return await adminService.updateListingStatus(id, data.status, data.is_premium);
      }
    };
  }

  get chat() {
    return {
      createConversation: async ({ recipientId, message }) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          // Create or get existing conversation
          const { data: conversation, error: convError } = await supabase
            .rpc('create_or_get_conversation', {
              p_user1_id: user.id,
              p_user2_id: recipientId
            });

          if (convError) throw convError;

          // Send first message
          if (message) {
            const { error: msgError } = await supabase
              .from('messages')
              .insert({
                conversation_id: conversation.id,
                sender_id: user.id,
                content: message
              });

            if (msgError) throw msgError;
          }

          return conversation;
        } catch (error) {
          console.error('Error creating conversation:', error);
          throw error;
        }
      },

      getConversations: async () => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return [];

          // Get conversations where user is a participant
          const { data: participantData, error: partError } = await supabase
            .from('conversation_participants')
            .select('conversation_id')
            .eq('user_id', user.id);

          if (partError) throw partError;
          if (!participantData || participantData.length === 0) return [];

          const conversationIds = participantData.map(p => p.conversation_id);

          // Get conversation details
          const { data: conversations, error: convError } = await supabase
            .from('conversations')
            .select('*')
            .in('id', conversationIds)
            .order('updated_at', { ascending: false });

          if (convError) throw convError;

          // For each conversation, get participants with their profiles
          const enrichedConversations = await Promise.all(
            (conversations || []).map(async (conv) => {
              const { data: participants } = await supabase
                .from('conversation_participants')
                .select(`
                  user_id,
                  profiles(id, full_name, avatar_url)
                `)
                .eq('conversation_id', conv.id);

              return {
                id: conv.id,
                participants: (participants || []).map(p => ({
                  id: p.profiles?.id || p.user_id,
                  fullName: p.profiles?.full_name || 'User',
                  avatarUrl: p.profiles?.avatar_url,
                  isOnline: false
                })),
                lastMessage: '',
                lastMessageAt: conv.updated_at
              };
            })
          );

          return enrichedConversations;
        } catch (error) {
          console.error('Error fetching conversations:', error);
          return [];
        }
      },

      getMessages: async (conversationId) => {
        try {
          const { data, error } = await supabase
            .from('messages')
            .select('*')
            .eq('conversation_id', conversationId)
            .order('created_at', { ascending: true });

          if (error) throw error;

          return (data || []).map(msg => ({
            id: msg.id,
            senderId: msg.sender_id,
            content: msg.content,
            createdAt: msg.created_at
          }));
        } catch (error) {
          console.error('Error fetching messages:', error);
          return [];
        }
      },

      sendMessage: async (conversationId, content) => {
        try {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) throw new Error('Not authenticated');

          const { data, error } = await supabase
            .from('messages')
            .insert({
              conversation_id: conversationId,
              sender_id: user.id,
              content
            })
            .select()
            .single();

          if (error) throw error;

          // Update conversation timestamp
          await supabase
            .from('conversations')
            .update({ updated_at: new Date().toISOString() })
            .eq('id', conversationId);

          return data;
        } catch (error) {
          console.error('Error sending message:', error);
          throw error;
        }
      }
    };
  }



  // Listing methods - delegate to listing-service
  async getListings(filters = {}) {
    try {
      const { supabase } = await import('./listing-service');
      const listingService = (await import('./listing-service')).default;
      return await listingService.getListings(filters);
    } catch (error) {
      console.error('Error in getListings:', error);
      return { success: false, listings: [], error: error.message };
    }
  }

  async getListingById(id) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.getListingById(id);
    } catch (error) {
      console.error('Error in getListingById:', error);
      return { success: false, listing: null, error: error.message };
    }
  }

  async createListing(data) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.createListing(data);
    } catch (error) {
      console.error('Error in createListing:', error);
      return { success: false, error: error.message };
    }
  }

  async updateListing(id, updates) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.updateListing(id, updates);
    } catch (error) {
      console.error('Error in updateListing:', error);
      return { success: false, error: error.message };
    }
  }

  async getUserListings() {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.getUserListings();
    } catch (error) {
      console.error('Error in getUserListings:', error);
      return { success: false, listings: [], error: error.message };
    }
  }

  async toggleFavorite(listingId) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.toggleFavorite(listingId);
    } catch (error) {
      console.error('Error in toggleFavorite:', error);
      throw error;
    }
  }

  async getListingComments(listingId) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.getListingComments(listingId);
    } catch (error) {
      console.error('Error in getListingComments:', error);
      return [];
    }
  }

  async addListingComment(listingId, comment) {
    try {
      const listingService = (await import('./listing-service')).default;
      return await listingService.addListingComment(listingId, comment);
    } catch (error) {
      console.error('Error in addListingComment:', error);
      throw error;
    }
  }

  async startConversation(sellerId) {
    // Placeholder for chat functionality

    return { success: true };
  }

  // ============================================================
  // SAFETY FEATURES - Reports & Blocking
  // ============================================================

  /**
   * Report a listing for inappropriate content
   */
  async reportListing(listingId, reason, description = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to report');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id, // Explicitly pass the ID
          reported_listing_id: listingId,
          report_type: 'listing',
          target_type: 'listing', // Sync with generic schema
          target_id: listingId,    // Sync with generic schema
          reason,
          description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reporting listing:', error);
      throw error;
    }
  }

  /**
   * Report a user for inappropriate behavior
   */
  async reportUser(userId, reason, description = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to report');

      const { data, error } = await supabase
        .from('reports')
        .insert({
          reporter_id: user.id,
          reported_user_id: userId,
          report_type: 'user',
          target_type: 'user', // Sync with generic schema
          target_id: userId,    // Sync with generic schema
          reason,
          description,
          status: 'pending'
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error reporting user:', error);
      throw error;
    }
  }

  /**
   * Block a user
   */
  async blockUser(userId, reason = '') {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to block users');

      const { data, error } = await supabase
        .from('blocked_users')
        .insert({
          blocker_id: user.id,
          blocked_id: userId,
          reason
        })
        .select()
        .single();

      if (error) {
        if (error.code === '23505') { // Unique constraint violation
          throw new Error('User is already blocked');
        }
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error blocking user:', error);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Must be logged in to unblock users');

      const { error } = await supabase
        .from('blocked_users')
        .delete()
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId);

      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error('Error unblocking user:', error);
      throw error;
    }
  }

  /**
   * Get list of blocked users
   */
  async getBlockedUsers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('blocked_users')
        .select(`
          *,
          blocked:blocked_id (
            id,
            email,
            full_name,
            avatar_url
          )
        `)
        .eq('blocker_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting blocked users:', error);
      return [];
    }
  }

  /**
   * Check if a user is blocked
   */
  async isUserBlocked(userId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return false;

      const { data, error } = await supabase
        .from('blocked_users')
        .select('id')
        .eq('blocker_id', user.id)
        .eq('blocked_id', userId)
        .maybeSingle();

      if (error) throw error;
      return !!data;
    } catch (error) {
      console.error('Error checking if user is blocked:', error);
      return false;
    }
  }

  /**
   * Get user's reports (for viewing their own reports)
   */
  async getMyReports() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return [];

      const { data, error } = await supabase
        .from('reports')
        .select(`
          *,
          reported_user:reported_user_id (
            id,
            email,
            full_name
          ),
          reported_listing:reported_listing_id (
            id,
            title
          )
        `)
        .eq('reporter_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error getting reports:', error);
      return [];
    }
  }


  // Aliases
  async register(d) { return this.auth.registerEmail(d); }
  async login(d) { return this.auth.loginEmail(d); }
  async logout() { return this.auth.logout(); }
  async getCurrentUser() { return this.users.getProfile(); }
}

const apiService = new ApiService();

export { apiService };
export const auth = apiService.auth;
export const listings = apiService.listings;
export const users = apiService.users;
export const adminService = apiService.admin;
export default apiService;

