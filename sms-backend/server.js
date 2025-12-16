// const express = require('express');
// const cors = require('cors');
// const axios = require('axios');
// const { createClient } = require('@supabase/supabase-js');
// require('dotenv').config({ path: '../.env' });

// const app = express();
// const PORT = 8001;

// app.use(cors());
// app.use(express.json());

// const supabase = createClient(
//     process.env.REACT_APP_SUPABASE_URL,
//     process.env.REACT_APP_SUPABASE_SERVICE_ROLE_KEY || process.env.REACT_APP_SUPABASE_ANON_KEY
// );

// function formatPhone(phone) {
//     // Remove all non-digit characters except leading +
//     let cleaned = phone.trim().replace(/[^\d+]/g, '');

//     // Remove + if present, we'll add it back later
//     cleaned = cleaned.replace(/\+/g, '');

//     // Handle different formats
//     if (cleaned.startsWith('2510')) {
//         // +2510912345678 → remove the extra 0 → +251912345678
//         cleaned = '251' + cleaned.substring(4);
//     } else if (cleaned.startsWith('251')) {
//         // 251912345678 → keep as is
//         // Already correct
//     } else if (cleaned.startsWith('0') && cleaned.length === 10) {
//         // 0912345678 → +251912345678
//         cleaned = '251' + cleaned.substring(1);
//     } else if (cleaned.startsWith('9') && cleaned.length === 9) {
//         // 912345678 → +251912345678
//         cleaned = '251' + cleaned;
//     } else if (cleaned.startsWith('7') && cleaned.length === 9) {
//         // 712345678 → +251712345678 (for other Ethiopian carriers)
//         cleaned = '251' + cleaned;
//     }

//     // Always return with + prefix
//     return '+' + cleaned;
// }

// async function sendSMS(phone, otp, purpose) {
//     try {
//         const messages = {
//             registration: `Welcome to YesraSew! Your verification code: ${otp}.`,
//             verification: `Your YesraSew verification code: ${otp}.`,
//             password_reset: `Your YesraSew password reset code: ${otp}.`,
//         };

//         const payload = {
//             token: process.env.GEEZ_SMS_API_KEY,
//             phone: phone.replace('+', ''),
//             msg: messages[purpose] || messages.verification,
//         };

//         console.log('📤 Sending SMS Payload:', JSON.stringify({ ...payload, token: '***HIDDEN***' }, null, 2));

//         const response = await axios.post('https://api.geezsms.com/api/v1/sms/send', payload);

//         console.log('✅ SMS Response:', response.data);
//         return { success: true, data: response.data };
//     } catch (error) {
//         console.error('❌ SMS Failed!');
//         if (error.response) {
//             console.error('Status:', error.response.status);
//             console.error('Data:', JSON.stringify(error.response.data, null, 2));
//         } else if (error.request) {
//             console.error('No response received. Request:', error.request);
//         } else {
//             console.error('Error Message:', error.message);
//         }
//         return { success: false, error: error.message };
//     }
// }

// app.post('/api/auth/phone/register', async (req, res) => {
//     try {
//         const { phone, password, firstName, lastName, accountType, companyName } = req.body;
//         const formattedPhone = formatPhone(phone);

//         // Check if user already exists
//         const { data: existingUser } = await supabase
//             .from('profiles')
//             .select('id')
//             .eq('phone', formattedPhone)
//             .maybeSingle();

//         if (existingUser) {
//             return res.status(400).json({ success: false, message: 'Phone number already registered' });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         const smsResult = await sendSMS(formattedPhone, otp, 'registration');

//         const { error } = await supabase.from('otps').insert({
//             phone: formattedPhone,
//             otp: otp,
//             purpose: 'registration',
//             expires_at: new Date(Date.now() + 600000).toISOString(),
//             used: false
//         });

//         if (error) {
//             console.error('❌ Database Insert Error:', error);
//             throw error;
//         }

//         res.json({
//             success: true,
//             message: 'OTP sent successfully',
//             data: {
//                 dev_otp: otp,
//                 sms_sent: smsResult.success
//             }
//         });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/phone/verify-otp', async (req, res) => {
//     try {
//         const { phone, otp, password, firstName, lastName, accountType, companyName } = req.body;
//         const formattedPhone = formatPhone(phone);

//         const { data: otpRecord, error: otpError } = await supabase
//             .from('otps')
//             .select('*')
//             .eq('phone', formattedPhone)
//             .eq('otp', otp)
//             .eq('used', false)
//             .gt('expires_at', new Date().toISOString())
//             .single();

//         if (otpError || !otpRecord) {
//             return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//         }

//         await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

//         const email = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`;

//         // Check if user exists
//         const { data: existingUsers } = await supabase.auth.admin.listUsers();
//         const existingUser = existingUsers.users.find(u => u.email === email);

//         let userId;

//         if (existingUser) {
//             console.log('👤 User exists, updating password and metadata...');
//             userId = existingUser.id;
//             const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
//                 password: password,
//                 email_confirm: true,
//                 user_metadata: {
//                     phone: formattedPhone,
//                     first_name: firstName,
//                     last_name: lastName,
//                     account_type: accountType,
//                     company_name: companyName
//                 }
//             });
//             if (updateError) throw updateError;
//         } else {
//             console.log('👤 Creating new user...');
//             const { data: authData, error: authError } = await supabase.auth.admin.createUser({
//                 email: email,
//                 password: password,
//                 email_confirm: true,
//                 user_metadata: {
//                     phone: formattedPhone,
//                     first_name: firstName,
//                     last_name: lastName,
//                     account_type: accountType,
//                     company_name: companyName
//                 }
//             });
//             if (authError) throw authError;
//             userId = authData.user.id;
//         }

//         await supabase.from('profiles').upsert({
//             id: userId,
//             phone: formattedPhone,
//             email: email,
//             first_name: firstName,
//             last_name: lastName,
//             account_type: accountType,
//             company_name: companyName,
//             is_verified: true
//         });

//         const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
//             email: email,
//             password: password
//         });

//         if (signInError) throw signInError;

//         res.json({
//             success: true,
//             user: session.user,
//             session: session.session
//         });
//     } catch (error) {
//         console.error('❌ Verify Error:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/phone/reset-password', async (req, res) => {
//     try {
//         const { phone } = req.body;
//         const formattedPhone = formatPhone(phone);

//         // Check if user exists
//         const { data: existingUser, error: profileError } = await supabase
//             .from('profiles')
//             .select('id')
//             .eq('phone', formattedPhone)
//             .maybeSingle();

//         if (!existingUser || profileError) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();
//         await sendSMS(formattedPhone, otp, 'password_reset');

//         await supabase.from('otps').insert({
//             phone: formattedPhone,
//             otp: otp,
//             purpose: 'password_reset',
//             expires_at: new Date(Date.now() + 600000).toISOString(),
//             used: false
//         });

//         res.json({ success: true, message: 'OTP sent', data: { dev_otp: otp } });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/phone/verify-reset-otp', async (req, res) => {
//     try {
//         const { phone, otp, newPassword } = req.body;
//         const formattedPhone = formatPhone(phone);

//         // Verify OTP
//         const { data: otpRecord, error: otpError } = await supabase
//             .from('otps')
//             .select('*')
//             .eq('phone', formattedPhone)
//             .eq('otp', otp)
//             .eq('used', false)
//             .eq('purpose', 'password_reset')
//             .gt('expires_at', new Date().toISOString())
//             .single();

//         if (otpError || !otpRecord) {
//             return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//         }

//         // Mark OTP as used
//         await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

//         // Get user by phone
//         const { data: profile } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('phone', formattedPhone)
//             .single();

//         if (!profile) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         // Update password only (don't touch metadata)
//         const email = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`;
//         const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
//             password: newPassword
//         });

//         if (updateError) throw updateError;

//         // Sign in with new password
//         const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
//             email: email,
//             password: newPassword
//         });

//         if (signInError) throw signInError;

//         res.json({
//             success: true,
//             message: 'Password reset successful',
//             user: session.user,
//             session: session.session
//         });
//     } catch (error) {
//         console.error('❌ Reset Verify Error:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// // Email Auth Endpoints
// app.post('/api/auth/email/register', async (req, res) => {
//     try {
//         const { email, password, firstName, lastName, accountType, companyName } = req.body;

//         // Check if user already exists
//         const { data: existingUser } = await supabase
//             .from('profiles')
//             .select('id')
//             .eq('email', email)
//             .maybeSingle();

//         if (existingUser) {
//             return res.status(400).json({ success: false, message: 'Email already registered' });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         // Store OTP in database
//         const { error } = await supabase.from('otps').insert({
//             phone: email, // Reuse phone column for email
//             otp: otp,
//             purpose: 'email_registration',
//             expires_at: new Date(Date.now() + 600000).toISOString(),
//             used: false
//         });

//         if (error) {
//             console.error('❌ Database Insert Error:', error);
//             throw error;
//         }

//         // TODO: Send email with OTP (for now just return it)
//         console.log(`📧 Email OTP for ${email}: ${otp}`);

//         res.json({
//             success: true,
//             message: 'OTP sent to your email',
//             data: {
//                 dev_otp: otp // For development
//             }
//         });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/email/verify-otp', async (req, res) => {
//     try {
//         const { email, otp, password, firstName, lastName, accountType, companyName } = req.body;

//         const { data: otpRecord, error: otpError } = await supabase
//             .from('otps')
//             .select('*')
//             .eq('phone', email) // Reusing phone column
//             .eq('otp', otp)
//             .eq('used', false)
//             .eq('purpose', 'email_registration')
//             .gt('expires_at', new Date().toISOString())
//             .single();

//         if (otpError || !otpRecord) {
//             return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//         }

//         await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

//         // Check if user exists
//         const { data: existingUsers } = await supabase.auth.admin.listUsers();
//         const existingUser = existingUsers.users.find(u => u.email === email);

//         let userId;

//         if (existingUser) {
//             console.log('👤 User exists, updating...');
//             userId = existingUser.id;
//             const { error: updateError } = await supabase.auth.admin.updateUserById(userId, {
//                 password: password,
//                 email_confirm: true,
//                 user_metadata: {
//                     first_name: firstName,
//                     last_name: lastName,
//                     account_type: accountType,
//                     company_name: companyName
//                 }
//             });
//             if (updateError) throw updateError;
//         } else {
//             console.log('👤 Creating new user...');
//             const { data: authData, error: authError } = await supabase.auth.admin.createUser({
//                 email: email,
//                 password: password,
//                 email_confirm: true,
//                 user_metadata: {
//                     first_name: firstName,
//                     last_name: lastName,
//                     account_type: accountType,
//                     company_name: companyName
//                 }
//             });
//             if (authError) throw authError;
//             userId = authData.user.id;
//         }

//         await supabase.from('profiles').upsert({
//             id: userId,
//             email: email,
//             first_name: firstName,
//             last_name: lastName,
//             account_type: accountType,
//             company_name: companyName,
//             is_verified: true
//         });

//         const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
//             email: email,
//             password: password
//         });

//         if (signInError) throw signInError;

//         res.json({
//             success: true,
//             user: session.user,
//             session: session.session
//         });
//     } catch (error) {
//         console.error('❌ Email Verify Error:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/email/reset-password', async (req, res) => {
//     try {
//         const { email } = req.body;

//         // Check if user exists
//         const { data: existingUser, error: profileError } = await supabase
//             .from('profiles')
//             .select('id')
//             .eq('email', email)
//             .maybeSingle();

//         if (!existingUser || profileError) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         const { error: insertError } = await supabase.from('otps').insert({
//             phone: email, // Reuse phone column
//             otp: otp,
//             purpose: 'email_password_reset',
//             expires_at: new Date(Date.now() + 600000).toISOString(),
//             used: false
//         });

//         if (insertError) {
//             console.error('❌ Database Insert Error:', insertError);
//             throw insertError;
//         }

//         // TODO: Send email with OTP
//         console.log(`📧 Password Reset OTP for ${email}: ${otp}`);

//         res.json({ success: true, message: 'OTP sent to your email', data: { dev_otp: otp } });
//     } catch (error) {
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.post('/api/auth/email/verify-reset-otp', async (req, res) => {
//     try {
//         const { email, otp, newPassword } = req.body;

//         // Verify OTP
//         const { data: otpRecord, error: otpError } = await supabase
//             .from('otps')
//             .select('*')
//             .eq('phone', email) // Reusing phone column
//             .eq('otp', otp)
//             .eq('used', false)
//             .eq('purpose', 'email_password_reset')
//             .gt('expires_at', new Date().toISOString())
//             .single();

//         if (otpError || !otpRecord) {
//             return res.status(400).json({ success: false, message: 'Invalid or expired OTP' });
//         }

//         await supabase.from('otps').update({ used: true }).eq('id', otpRecord.id);

//         // Get user by email
//         const { data: profile } = await supabase
//             .from('profiles')
//             .select('*')
//             .eq('email', email)
//             .single();

//         if (!profile) {
//             return res.status(400).json({ success: false, message: 'User not found' });
//         }

//         // Update password only
//         const { error: updateError } = await supabase.auth.admin.updateUserById(profile.id, {
//             password: newPassword
//         });

//         if (updateError) throw updateError;

//         // Sign in with new password
//         const { data: session, error: signInError } = await supabase.auth.signInWithPassword({
//             email: email,
//             password: newPassword
//         });

//         if (signInError) throw signInError;

//         res.json({
//             success: true,
//             message: 'Password reset successful',
//             user: session.user,
//             session: session.session
//         });
//     } catch (error) {
//         console.error('❌ Email Reset Verify Error:', error);
//         res.status(400).json({ success: false, message: error.message });
//     }
// });

// app.get('/health', (req, res) => {
//     res.json({ status: 'OK', message: 'SMS Backend Running' });
// });

// app.listen(PORT, () => {
//     console.log(`🚀 SMS Backend running on http://localhost:${PORT}`);
//     console.log(`✅ GeezSMS API Key: ${process.env.GEEZ_SMS_API_KEY ? 'Configured' : 'Missing'}`);
// });
