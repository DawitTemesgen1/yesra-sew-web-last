import { supabase } from './api';
// Removed new createClient to share session/auth state




const supabaseAuthService = {
  // ============ PHONE REGISTRATION ============
  async registerWithPhone({ phone, password, firstName, lastName, accountType, companyName }) {
    try {
      const formattedPhone = this._formatPhone(phone);

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('id')
        .eq('phone', formattedPhone)
        .maybeSingle();

      if (existingUser) {
        throw new Error('Phone number already registered');
      }

      const tempEmail = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`;

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: tempEmail,
        password: password,
        options: {
          data: {
            phone: formattedPhone,
            first_name: firstName,
            last_name: lastName,
            account_type: accountType || 'individual',
            company_name: accountType === 'company' ? companyName : null,
            is_ethiopian_phone: true
          }
        }
      });

      if (authError) throw authError;

      // SMS: Use original send-ethiopian-sms
      const { data: otpData, error: otpError } = await supabase.functions.invoke('send-ethiopian-sms', {
        body: {
          phone: formattedPhone,
          userId: authData.user.id,
          purpose: 'registration'
        }
      });

      if (otpError) throw otpError;

      return {
        success: true,
        message: 'Verification code sent',
        devOtp: otpData?.otp,
        tempData: { phone: formattedPhone, password, firstName, lastName, accountType, companyName }
      };
    } catch (error) {
      console.error('Phone registration error:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ VERIFY PHONE OTP ============
  async verifyPhoneOtp(phone, otp, registrationData = {}) {
    try {
      const formattedPhone = this._formatPhone(phone);

      // SMS: Use original RPC verification
      const { data, error } = await supabase.rpc('verify_ethiopian_otp', {
        p_phone: formattedPhone,
        p_otp: otp,
        p_purpose: 'registration'
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.message);

      const tempEmail = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`;

      const { data: sessionData, error: signInError } = await supabase.auth.signInWithPassword({
        email: tempEmail,
        password: registrationData.password
      });

      if (signInError) throw signInError;

      return {
        success: true,
        user: sessionData.user,
        session: sessionData.session
      };
    } catch (error) {
      console.error('OTP verification error:', error);
      return { success: false, error: error.message };
    }
  },

  // ============ HELPER: RETRY LOGIC ============
  async _retryOperation(operation, maxRetries = 3) {
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation();
      } catch (error) {
        const isNetworkError = error.message.includes('fetch') || error.message.includes('network') || error.message.includes('connection');
        if (i === maxRetries - 1 || !isNetworkError) throw error;
        // Wait 1s, 2s, 4s...
        await new Promise(r => setTimeout(r, 1000 * Math.pow(2, i)));
      }
    }
  },

  // ============ PHONE LOGIN ============
  async loginWithPhone(phone, password) {
    return this._retryOperation(async () => {
      try {
        const formattedPhone = this._formatPhone(phone);
        const email = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`;

        const { data: profile } = await Promise.race([
          supabase
            .from('profiles')
            .select('is_verified')
            .eq('phone', formattedPhone)
            .single(),
          new Promise((resolve) => setTimeout(() => resolve({ data: null, error: 'Timeout' }), 10000))
        ]);

        if (profile && !profile.is_verified) {
          // ... existing SMS logic ...
          // SMS: Use original send-ethiopian-sms
          const { data: otpData } = await supabase.functions.invoke('send-ethiopian-sms', {
            body: {
              phone: formattedPhone,
              purpose: 'verification'
            }
          });

          return {
            success: false,
            requiresVerification: true,
            message: 'Phone not verified. New OTP sent.',
            devOtp: otpData?.otp
          };
        }

        const { data, error } = await supabase.auth.signInWithPassword({
          email: email,
          password: password
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };
      } catch (error) {
        console.error('❌ Login Error:', error);
        if (error.message.includes('connection') || error.message.includes('fetch')) {
          // Aggressively clear potentionally corrupted session on network fail
          console.warn("Network error during login, clearing local storage artifacts...");
          localStorage.removeItem('sb-ncknykhbbralsfejdaiq-auth-token');
        }
        throw error;
      }
    }).catch(err => {
      return { success: false, error: err.message || "Connection failed, please try again." };
    });
  },

  // ... (reset password methods remain unchanged) ...

  // ============ EMAIL LOGIN ============
  async loginWithEmail(email, password) {
    return this._retryOperation(async () => {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });

        if (error) throw error;

        return { success: true, user: data.user, session: data.session };
      } catch (error) {
        console.error('Email login error:', error);
        if (error.message.includes('connection') || error.message.includes('fetch')) {
          localStorage.removeItem('sb-ncknykhbbralsfejdaiq-auth-token');
        }
        throw error;
      }
    }).catch(err => {
      return { success: false, error: err.message || "Connection failed, please try again." };
    });
  },

  // ============ EMAIL REGISTRATION ============
  // Implement using NEW email-auth function
  async registerWithEmail({ email, password, firstName, lastName, accountType, companyName }) {
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (profile) return { success: false, error: 'Email already registered.' };

      const { data: otpData, error: otpError } = await supabase.functions.invoke('email-auth', {
        body: {
          action: 'send_email_otp',
          email: email,
          purpose: 'registration',
          firstName: firstName
        }
      });

      if (otpError) throw otpError;
      if (!otpData.success) throw new Error(otpData.error);

      return {
        success: true,
        message: 'Verification code sent to your email',
        devOtp: otpData.otp,
        tempData: { email, password, firstName, lastName, accountType, companyName }
      };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async verifyEmailOtp(email, otp, regData) {
    try {
      const { data, error } = await supabase.functions.invoke('email-auth', {
        body: {
          action: 'verify_registration',
          email: email,
          otp: otp,
          userData: regData
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      const { data: sessionData } = await supabase.auth.signInWithPassword({
        email: email,
        password: regData.password
      });

      return { success: true, message: 'Account created', session: sessionData?.session };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ EMAIL PASSWORD RESET ============
  // Implement using NEW email-auth function
  async sendPasswordResetEmail(email) {
    try {
      const { data: profile } = await supabase.from('profiles').select('id').eq('email', email).maybeSingle();
      if (!profile) return { success: false, error: 'Email not registered.' };

      const { data: otpData, error: otpError } = await supabase.functions.invoke('email-auth', {
        body: {
          action: 'send_email_otp',
          email: email,
          purpose: 'password_reset'
        }
      });

      if (otpError) throw otpError;
      if (!otpData.success) throw new Error(otpData.error);

      return { success: true, message: 'Reset code sent to your email', devOtp: otpData.otp };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  async verifyEmailPasswordResetOtp(email, otp, newPassword) {
    try {
      const { data, error } = await supabase.functions.invoke('email-auth', {
        body: {
          action: 'verify_reset',
          email: email,
          otp: otp,
          newPassword: newPassword
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error);

      await supabase.auth.signInWithPassword({ email, password: newPassword });
      return { success: true, message: 'Password reset successful' };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ GOOGLE OAUTH ============
  async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/auth/callback` }
      });
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // ============ SESSION MANAGEMENT ============
  async getSession() {
    const { data: { session }, error } = await supabase.auth.getSession();
    return { success: !error, session };
  },

  async getUser() {
    const { data: { user }, error } = await supabase.auth.getUser();
    return { success: !error, user };
  },

  async signOut() {
    const { error } = await supabase.auth.signOut();
    return { success: !error };
  },

  // ============ HELPER FUNCTIONS ============
  _formatPhone(phone) {
    let cleaned = phone.trim().replace(/[^\d+]/g, '');
    cleaned = cleaned.replace(/\+/g, '');

    if (cleaned.startsWith('2510')) {
      cleaned = '251' + cleaned.substring(4);
    } else if (cleaned.startsWith('251')) {
      // 251912345678
    } else if (cleaned.startsWith('0') && cleaned.length === 10) {
      cleaned = '251' + cleaned.substring(1);
    } else if (cleaned.startsWith('9') && cleaned.length === 9) {
      cleaned = '251' + cleaned;
    } else if (cleaned.startsWith('7') && cleaned.length === 9) {
      cleaned = '251' + cleaned;
    }

    return '+' + cleaned;
  }
};

export default supabaseAuthService;
