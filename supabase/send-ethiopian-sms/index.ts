  }

try {
  const { action, phone, otp, ...data } = await req.json()

  // Initialize Supabase Admin Client
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL') ?? '',
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
  )

  // Format Phone
  const formattedPhone = formatEthiopianPhone(phone)

  // ================== ACTION: SEND OTP ==================
  if (action === 'send') {
    const purpose = data.purpose || 'verification'

    // Generate 4-digit OTP
    const generatedOtp = Math.floor(1000 + Math.random() * 9000).toString()

    // Send SMS via Geez SMS
    const smsResult = await sendGeezSMS(formattedPhone, generatedOtp, purpose)

    // Store OTP in database
    const { error: dbError } = await supabaseAdmin
      .from('otps')
      .insert({
        phone: formattedPhone,
        otp: generatedOtp,
        purpose: purpose,
        expires_at: new Date(Date.now() + 600000).toISOString(), // 10 mins
        used: false
      })

    if (dbError) throw dbError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'OTP sent successfully',
        // Return OTP in dev mode or if SMS failed (for testing)
        devOtp: (!smsResult.success || purpose === 'test') ? generatedOtp : undefined,
        smsSent: smsResult.success
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }

  // ================== ACTION: VERIFY OTP ==================
  if (action === 'verify') {
    if (!otp) throw new Error('OTP is required')

    // Verify OTP
    const { data: otpRecord, error: otpError } = await supabaseAdmin
      .from('otps')
      .select('*')
      .eq('phone', formattedPhone)
      .eq('otp', otp)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    if (otpError || !otpRecord) {
      return new Response(
        JSON.stringify({ success: false, message: 'Invalid or expired OTP' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Mark OTP as used
    await supabaseAdmin
      .from('otps')
      .update({ used: true })
      .eq('id', otpRecord.id)

    // Use provided password or generate temp one for session creation
    const finalPassword = data.password || (crypto.randomUUID() + 'A1!')
    const email = `phone_${formattedPhone.replace('+', '')}@yesrasew.com`

    // Check if user exists
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
    const existingUser = existingUsers.users.find(u => u.user_metadata?.phone === formattedPhone || u.email === email)

    let userId

    if (existingUser) {
      userId = existingUser.id

      // Update user password to final password
      await supabaseAdmin.auth.admin.updateUserById(userId, {
        password: finalPassword,
        email_confirm: true,
        user_metadata: { ...existingUser.user_metadata, ...data } // Update metadata if provided
      })

    } else {
      // Create new user
      const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
        email: email,
        password: finalPassword,
        email_confirm: true,
        user_metadata: {
          phone: formattedPhone,
          account_type: data.accountType || 'individual',
          first_name: data.firstName,
          last_name: data.lastName,
          company_name: data.companyName
        }
      })

      if (createError) throw createError
      userId = newUser.user.id

      // Create Profile (if not created by trigger)
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .upsert({
          id: userId,
          phone: formattedPhone,
          email: email,
          first_name: data.firstName,
          last_name: data.lastName,
          account_type: data.accountType || 'individual',
          company_name: data.companyName,
          is_verified: true,
          updated_at: new Date().toISOString()
        })

      if (profileError) console.error('Profile creation error:', profileError)
    }

    // Sign In to get Session
    const { data: signInData, error: signInError } = await supabaseAdmin.auth.signInWithPassword({
      email: email,
      password: finalPassword
    })

    if (signInError) throw signInError

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Phone verified successfully',
        session: signInData.session,
        user: signInData.user
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    )
  }

  throw new Error('Invalid action')

} catch (error) {
  return new Response(
    JSON.stringify({ success: false, error: error.message }),
    { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
  )
}
})

function formatEthiopianPhone(phone: string): string {
  let cleaned = phone.replace(/\D/g, '')
  if (cleaned.startsWith('0') && cleaned.length === 10) return '+251' + cleaned.substring(1)
  if (cleaned.startsWith('9') && cleaned.length === 9) return '+251' + cleaned
  if (cleaned.startsWith('251') && cleaned.length === 12) return '+' + cleaned
  return phone.startsWith('+') ? phone : '+' + phone
}

async function sendGeezSMS(phone: string, otp: string, purpose: string): Promise<any> {
  try {
    const apiKey = Deno.env.get('GEEZ_SMS_API_KEY')
    const senderId = Deno.env.get('GEEZ_SMS_SENDER_ID') || 'YesraSew'

    if (!apiKey) return { success: false, error: 'API key not configured' }

    const messages = {
      registration: `Welcome to YesraSew! Your verification code: ${otp}.`,
      verification: `Your YesraSew verification code: ${otp}.`,
      password_reset: `Your YesraSew password reset code: ${otp}.`,
      login: `Your YesraSew login code: ${otp}.`
    }

    const message = messages[purpose as keyof typeof messages] || messages.verification

    const response = await fetch('https://api.geezsms.com/api/v1/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        api_key: apiKey,
        sender_id: senderId,
        message: message,
        to: phone.replace('+', '')
      })
    })

    const data = await response.json()
    return { success: true, data } // Assume success if no throw, GeezSMS API might vary
  } catch (error) {
    console.error('Geez SMS error:', error)
    return { success: false, error: error.message }
  }
}