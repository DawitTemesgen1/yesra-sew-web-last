// Gmail SMTP Email Service
// This service handles sending emails via Gmail SMTP for OTP, password reset, and notifications

import nodemailer from 'nodemailer';
import { supabase } from './api';

class EmailService {
  constructor() {
    this.transporter = null;
    this.isConfigured = false;
  }

  /**
   * Initialize Gmail SMTP transporter with settings from database
   */
  async initialize() {
    try {
      // Get SMTP settings from admin settings
      const { data: settings, error } = await supabase
        .from('admin_settings')
        .select('*')
        .eq('key', 'smtp_config')
        .single();

      if (error || !settings) {
        console.warn('Gmail SMTP not configured in admin settings');
        return false;
      }

      const config = settings.value;

      // Create transporter
      this.transporter = nodemailer.createTransporter({
        host: config.host || 'smtp.gmail.com',
        port: config.port || 587,
        secure: config.port === 465, // true for 465, false for other ports
        auth: {
          user: config.username,
          pass: config.password, // App password for Gmail
        },
      });

      // Verify connection
      await this.transporter.verify();
      this.isConfigured = true;
      return true;
    } catch (error) {
      console.error('❌ Gmail SMTP configuration error:', error);
      this.isConfigured = false;
      return false;
    }
  }

  /**
   * Send email OTP for registration
   */
  async sendRegistrationOTP(email, otp, firstName) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"Yesra Sew Solution" <${this.transporter.options.auth.user}>`,
      to: email,
      subject: 'Welcome to Yesra Sew Solution - Verify Your Email',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #1E3A8A; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #1E3A8A; letter-spacing: 5px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Yesra Sew Solution!</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              <p>Thank you for registering with Yesra Sew Solution. To complete your registration, please verify your email address using the OTP code below:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
              </div>
              
              <p>If you didn't create an account with Yesra Sew Solution, please ignore this email.</p>
              
              <p>Best regards,<br>The Yesra Sew Solution Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Yesra Sew Solution. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send registration OTP email:', error);
      throw error;
    }
  }

  /**
   * Send password reset OTP
   */
  async sendPasswordResetOTP(email, otp, firstName) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"Yesra Sew Solution" <${this.transporter.options.auth.user}>`,
      to: email,
      subject: 'Yesra Sew Solution - Password Reset Code',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #DC2626; padding: 20px; text-align: center; margin: 20px 0; border-radius: 8px; }
            .otp-code { font-size: 32px; font-weight: bold; color: #DC2626; letter-spacing: 5px; }
            .warning { background: #FEF2F2; border-left: 4px solid #DC2626; padding: 15px; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔒 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              <p>We received a request to reset your Yesra Sew Solution account password. Use the code below to reset your password:</p>
              
              <div class="otp-box">
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; color: #666;">This code expires in 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong><br>
                If you didn't request a password reset, please ignore this email and ensure your account is secure.
              </div>
              
              <p>Best regards,<br>The Yesra Sew Solution Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Yesra Sew Solution. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send password reset OTP email:', error);
      throw error;
    }
  }

  /**
   * Send general notification email
   */
  async sendNotification(email, subject, message, firstName) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"Yesra Sew Solution" <${this.transporter.options.auth.user}>`,
      to: email,
      subject: subject,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #1E3A8A 0%, #3B82F6 50%, #FFD700 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .footer { text-align: center; margin-top: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Yesra Sew Solution</h1>
            </div>
            <div class="content">
              <p>Hello ${firstName || 'there'},</p>
              ${message}
              <p>Best regards,<br>The Yesra Sew Solution Team</p>
            </div>
            <div class="footer">
              <p>© ${new Date().getFullYear()} Yesra Sew Solution. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send notification email:', error);
      throw error;
    }
  }

  /**
   * Test email configuration
   */
  async testConfiguration(testEmail) {
    if (!this.isConfigured) {
      await this.initialize();
    }

    if (!this.isConfigured) {
      throw new Error('Email service not configured');
    }

    const mailOptions = {
      from: `"Yesra Sew Solution" <${this.transporter.options.auth.user}>`,
      to: testEmail,
      subject: 'Yesra Sew Solution - Email Configuration Test',
      html: `
        <h2>✅ Email Configuration Successful!</h2>
        <p>This is a test email to confirm that your Gmail SMTP configuration is working correctly.</p>
        <p>Timestamp: ${new Date().toISOString()}</p>
      `,
    };

    try {
      const info = await this.transporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      console.error('❌ Failed to send test email:', error);
      throw error;
    }
  }
}

// Export singleton instance
const emailService = new EmailService();
export default emailService;

