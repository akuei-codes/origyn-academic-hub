// supabase/functions/cas-auth/index.ts
//
// Princeton CAS Authentication Edge Function
// Deploy this to your Supabase project:
//   supabase functions deploy cas-auth
//
// This function:
// 1. Redirects users to Princeton CAS login
// 2. Validates the CAS ticket on callback
// 3. Creates/signs in the user in Supabase Auth
// 4. Redirects back to the app with session tokens

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const CAS_BASE_URL = 'https://fed.princeton.edu/cas'

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  const url = new URL(req.url)
  const redirect = url.searchParams.get('redirect') || ''
  const ticket = url.searchParams.get('ticket')

  // The service URL is this function itself
  const serviceUrl = `${url.origin}${url.pathname}?redirect=${encodeURIComponent(redirect)}`

  // Step 1: If no ticket, redirect to CAS login
  if (!ticket) {
    const casLoginUrl = `${CAS_BASE_URL}/login?service=${encodeURIComponent(serviceUrl)}`
    return Response.redirect(casLoginUrl, 302)
  }

  // Step 2: Validate the CAS ticket
  const validateUrl = `${CAS_BASE_URL}/validate?ticket=${ticket}&service=${encodeURIComponent(serviceUrl)}`
  const validateResponse = await fetch(validateUrl)
  const validateText = await validateResponse.text()
  const lines = validateText.trim().split('\n')

  if (lines[0] !== 'yes' || !lines[1]) {
    return new Response('CAS validation failed', {
      status: 401,
      headers: corsHeaders,
    })
  }

  const netId = lines[1].trim()
  const email = `${netId}@princeton.edu`

  // Step 3: Create or sign in the user using Supabase Admin
  const supabaseAdmin = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  // Check if user exists
  const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === email)

  let userId: string

  if (existingUser) {
    userId = existingUser.id
  } else {
    // Create new user
    const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { net_id: netId, full_name: netId },
    })
    if (createError) {
      return new Response(`Failed to create user: ${createError.message}`, {
        status: 500,
        headers: corsHeaders,
      })
    }
    userId = newUser.user.id

    // Check if professor (on allowlist)
    const { data: allowed } = await supabaseAdmin
      .from('professor_allowlist')
      .select('id')
      .eq('net_id', netId)
      .eq('is_active', true)
      .maybeSingle()

    const role = allowed ? 'professor' : 'student'
    await supabaseAdmin.from('user_roles').insert({ user_id: userId, role })
  }

  // Step 4: Generate a session for the user
  // Use signInWithPassword won't work without password.
  // Instead, generate a magic link token or use admin generateLink
  const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
    type: 'magiclink',
    email,
  })

  if (linkError || !linkData) {
    return new Response(`Failed to generate session: ${linkError?.message}`, {
      status: 500,
      headers: corsHeaders,
    })
  }

  // Extract the token from the generated link
  const actionLink = new URL(linkData.properties.action_link)
  const token_hash = actionLink.searchParams.get('token') || actionLink.hash

  // Verify the OTP to get a session
  const { data: sessionData, error: sessionError } = await supabaseAdmin.auth.verifyOtp({
    token_hash: linkData.properties.hashed_token,
    type: 'magiclink',
  })

  if (sessionError || !sessionData.session) {
    return new Response(`Failed to create session: ${sessionError?.message}`, {
      status: 500,
      headers: corsHeaders,
    })
  }

  // Step 5: Redirect back to the app with session tokens
  const redirectUrl = new URL(redirect || 'http://localhost:5173/auth/callback')
  redirectUrl.hash = `access_token=${sessionData.session.access_token}&refresh_token=${sessionData.session.refresh_token}&type=cas`

  return Response.redirect(redirectUrl.toString(), 302)
})
