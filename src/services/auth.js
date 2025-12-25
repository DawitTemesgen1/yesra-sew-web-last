// src/services/auth.js
import { supabase } from '../lib/supabase'

class AuthService {
  // Format Ethiopian phone
  static formatEthiopianPhone(phone) {
    if (!phone) return ''

    let cleaned = phone.replace(/\D/g, '')

    if (cleaned.startsWith('0') && cleaned.length === 10) {
      return '+251' + cleaned.substring(1)
    } else if (cleaned.startsWith('9') && cleaned.length === 9) {
      return '+251' + cleaned
    } else if (cleaned.startsWith('251') && cleaned.length === 12) {
      return '+' + cleaned
    }

    return cleaned.startsWith('+') ? cleaned : '+' + cleaned
  }

  // Check if Ethiopian phone
  static isEthiopianPhone(phone) {
    const formatted = this.formatEthiopianPhone(phone)
    return /^\+2519[0-9]{8}$/.test(formatted)
  }

  // ============ PHONE REGISTRATION ============
  static async registerWithPhone({ phone, password, firstName, lastName, accountType, companyName }) {
    try {
      const formattedPhone = this.formatEthiopianPhone(phone)

      if (!this.isEthiopianPhone(formattedPhone)) {
        throw new Error('Invalid Ethiopian phone number')
      }

      // Create user with temporary email
      const tempEmail = `${formattedPhone.replace('+', '')}@yesrasew.phone`

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
            is_ethiopian_phone: true,
            email_auto_confirm: true
          }
        }
      })

      if (authError) {
        if (authError.message.includes('already registered')) {
          throw new Error('Phone number already registered')
        }
        throw authError
      }

      // Send OTP via Edge Function
      const { data: otpData, error: otpError } = await supabase.functions.invoke('send-ethiopian-sms', {
        body: {
          phone: formattedPhone,
          userId: authData.user.id,
          purpose: 'registration'
        }
      })

      if (otpError) throw otpError

      return {
        success: true,
        message: 'Registration successful. OTP sent to your phone.',
        userId: authData.user.id,
        phone: formattedPhone,
        requiresVerification: true,
        devOtp: otpData.otp // For development/testing
      }

    } catch (error) {
      console.error('Phone registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  // ============ VERIFY PHONE OTP ============
  static async verifyPhoneOTP(phone, otp) {
    try {
      const formattedPhone = this.formatEthiopianPhone(phone)

      // Call database function to verify OTP
      const { data, error } = await supabase.rpc('verify_ethiopian_otp', {
        p_phone: formattedPhone,
        p_otp: otp,
        p_purpose: 'registration'
      })

      if (error) throw error
      if (!data.success) throw new Error(data.message)

      // Get session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      if (sessionError) throw sessionError

      // Get user profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', formattedPhone)
        .single()

      return {
        success: true,
        message: 'Phone verified successfully!',
        user: { ...profile, ...session?.user },
        session: session
      }

    } catch (error) {
      console.error('OTP verification error:', error)
      return {
        success: false,
        error: error.message || 'Verification failed'
      }
    }
  }

  // ============ PHONE LOGIN ============
  static async loginWithPhone(phone, password) {
    try {
      const formattedPhone = this.formatEthiopianPhone(phone)

      // Find user by phone
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('phone', formattedPhone)
        .single()

      if (!profile) {
        throw new Error('Invalid phone or password')
      }

      // Check if verified
      if (!profile.is_verified) {
        // Send verification OTP
        const { data: otpData } = await supabase.functions.invoke('send-ethiopian-sms', {
          body: {
            phone: formattedPhone,
            userId: profile.id,
            purpose: 'verification'
          }
        })

        return {
          success: false,
          requiresVerification: true,
          message: 'Phone not verified. New OTP sent.',
          devOtp: otpData.otp
        }
      }

      // Get user's email from auth
      const { data: { users }, error: usersError } = await supabase.auth.admin.listUsers()
      if (usersError) throw usersError

      const authUser = users.find(u => u.id === profile.id)
      if (!authUser) throw new Error('User not found in auth')

      // Login with email
      const { data, error } = await supabase.auth.signInWithPassword({
        email: authUser.email,
        password: password
      })

      if (error) throw error

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', profile.id)

      return {
        success: true,
        user: { ...profile, ...data.user },
        session: data.session
      }

    } catch (error) {
      console.error('Phone login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // ============ EMAIL REGISTRATION ============
  static async registerWithEmail({ email, password, firstName, lastName, accountType, companyName }) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            account_type: accountType || 'individual',
            company_name: accountType === 'company' ? companyName : null
          },
          emailRedirectTo: 'https://www.yesrasewsolution.com/verify-email'
        }
      })

      if (error) {
        if (error.message.includes('already registered')) {
          throw new Error('Email already registered')
        }
        throw error
      }

      return {
        success: true,
        message: data.session ? 'Registration successful!' : 'Please check your email to verify',
        user: data.user,
        session: data.session
      }

    } catch (error) {
      console.error('Email registration error:', error)
      return {
        success: false,
        error: error.message || 'Registration failed'
      }
    }
  }

  // ============ EMAIL LOGIN ============
  static async loginWithEmail(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
      })

      if (error) {
        if (error.message.includes('Invalid login credentials')) {
          throw new Error('Invalid email or password')
        }
        if (error.message.includes('Email not confirmed')) {
          throw new Error('Please verify your email first')
        }
        throw error
      }

      // Update last login
      await supabase
        .from('profiles')
        .update({ last_login: new Date().toISOString() })
        .eq('id', data.user.id)

      return {
        success: true,
        user: data.user,
        session: data.session
      }

    } catch (error) {
      console.error('Email login error:', error)
      return {
        success: false,
        error: error.message || 'Login failed'
      }
    }
  }

  // ============ GOOGLE OAUTH ============
  static async signInWithGoogle() {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: 'https://www.yesrasewsolution.com/auth/callback'
        }
      })

      if (error) throw error

      return { success: true, data }

    } catch (error) {
      console.error('Google sign-in error:', error)
      return { success: false, error: error.message }
    }
  }

  // ============ PASSWORD RESET ============
  static async sendPasswordResetOTP(identifier) {
    try {
      if (this.isEthiopianPhone(identifier)) {
        // Ethiopian phone - use SMS
        const formattedPhone = this.formatEthiopianPhone(identifier)

        const { data: profile } = await supabase
          .from('profiles')
          .select('id')
          .eq('phone', formattedPhone)
          .single()

        if (!profile) {
          // For security, don't reveal if user exists
          return {
            success: true,
            message: 'If registered, you will receive a reset code'
          }
        }

        const { data: otpData } = await supabase.functions.invoke('send-ethiopian-sms', {
          body: {
            phone: formattedPhone,
            userId: profile.id,
            purpose: 'password_reset'
          }
        })

        return {
          success: true,
          message: 'Password reset code sent',
          devOtp: otpData.otp
        }

      } else {
        // Email - use Supabase built-in
        const { error } = await supabase.auth.resetPasswordForEmail(identifier, {
          redirectTo: 'https://www.yesrasewsolution.com/reset-password'
        })

        if (error) console.error('Reset email error:', error)

        return {
          success: true,
          message: 'If registered, you will receive a reset email'
        }
      }

    } catch (error) {
      console.error('Password reset error:', error)
      return {
        success: true, // Always success for security
        message: 'If registered, you will receive a reset code'
      }
    }
  }

  static async resetPasswordWithOTP(phone, otp, newPassword) {
    try {
      const formattedPhone = this.formatEthiopianPhone(phone)

      // Verify OTP
      const { data: verifyResult } = await supabase.rpc('verify_ethiopian_otp', {
        p_phone: formattedPhone,
        p_otp: otp,
        p_purpose: 'password_reset'
      })

      if (!verifyResult.success) {
        throw new Error(verifyResult.message)
      }

      // Update password
      const { error } = await supabase.auth.admin.updateUserById(
        verifyResult.user_id,
        { password: newPassword }
      )

      if (error) throw error

      return {
        success: true,
        message: 'Password reset successful'
      }

    } catch (error) {
      console.error('Reset password error:', error)
      return {
        success: false,
        error: error.message || 'Password reset failed'
      }
    }
  }

  // ============ SESSION MANAGEMENT ============
  static async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession()

      if (error) throw error

      return {
        success: true,
        session: session,
        user: session?.user
      }

    } catch (error) {
      console.error('Get session error:', error)
      return { success: false, error: error.message }
    }
  }

  static async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) throw error

      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        return {
          success: true,
          user: { ...user, ...profile }
        }
      }

      return { success: false, error: 'No user found' }

    } catch (error) {
      console.error('Get user error:', error)
      return { success: false, error: error.message }
    }
  }

  static async signOut() {
    try {
      await supabase.auth.signOut()
      return { success: true }
    } catch (error) {
      console.error('Sign out error:', error)
      return { success: true } // Always succeed
    }
  }

  // ============ CHECK AUTH STATUS ============
  static isAuthenticated() {
    const session = supabase.auth.getSession()
    return !!session
  }

  static isEmail(input) {
    return input && input.includes('@') && input.includes('.')
  }

  static isPhone(input) {
    return input && input.replace(/\D/g, '').length >= 9
  }
}

export default AuthService
