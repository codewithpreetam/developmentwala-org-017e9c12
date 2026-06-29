import { createFileRoute } from '@tanstack/react-router';
import { getCookie, deleteCookie } from '@tanstack/react-start/server';

function errorRedirect(origin: string, message: string) {
  const dest = new URL('/sign-in', origin);
  dest.searchParams.set('error', message);
  return Response.redirect(dest.toString(), 302);
}

export const Route = createFileRoute('/api/auth/linkedin/callback')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const origin = url.origin;
        const code = url.searchParams.get('code');
        const state = url.searchParams.get('state');
        const oauthError = url.searchParams.get('error');

        if (oauthError) {
          return errorRedirect(origin, oauthError);
        }
        if (!code || !state) {
          return errorRedirect(origin, 'Missing code or state');
        }

        const cookieState = getCookie('li_oauth_state');
        const next = getCookie('li_oauth_next') || '/';
        deleteCookie('li_oauth_state', { path: '/' });
        deleteCookie('li_oauth_next', { path: '/' });

        if (!cookieState || cookieState !== state) {
          return errorRedirect(origin, 'Invalid OAuth state');
        }

        const clientId = process.env.LINKEDIN_CLIENT_ID;
        const clientSecret = process.env.LINKEDIN_CLIENT_SECRET;
        if (!clientId || !clientSecret) {
          return errorRedirect(origin, 'LinkedIn is not configured');
        }

        const redirectUri = `${origin}/api/auth/linkedin/callback`;

        // Exchange code for access token
        const tokenRes = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            grant_type: 'authorization_code',
            code,
            redirect_uri: redirectUri,
            client_id: clientId,
            client_secret: clientSecret,
          }).toString(),
        });

        if (!tokenRes.ok) {
          const body = await tokenRes.text();
          console.error('[linkedin] token exchange failed', tokenRes.status, body);
          return errorRedirect(origin, 'LinkedIn token exchange failed');
        }
        const tokenJson = (await tokenRes.json()) as { access_token?: string };
        const accessToken = tokenJson.access_token;
        if (!accessToken) {
          return errorRedirect(origin, 'No access token from LinkedIn');
        }

        // Fetch OIDC userinfo
        const userRes = await fetch('https://api.linkedin.com/v2/userinfo', {
          headers: { Authorization: `Bearer ${accessToken}` },
        });
        if (!userRes.ok) {
          const body = await userRes.text();
          console.error('[linkedin] userinfo failed', userRes.status, body);
          return errorRedirect(origin, 'Could not fetch LinkedIn profile');
        }
        const profile = (await userRes.json()) as {
          sub?: string;
          email?: string;
          email_verified?: boolean;
          given_name?: string;
          family_name?: string;
          name?: string;
          picture?: string;
        };

        if (!profile.email) {
          return errorRedirect(origin, 'LinkedIn account has no email');
        }
        if (profile.email_verified === false) {
          return errorRedirect(origin, 'LinkedIn email address is not verified');
        }

        const { supabaseAdmin } = await import('@/integrations/supabase/client.server');

        // Ensure the auth user exists
        const userMeta = {
          first_name: profile.given_name || '',
          last_name: profile.family_name || '',
          full_name: profile.name || '',
          avatar_url: profile.picture || '',
          provider: 'linkedin',
          linkedin_sub: profile.sub || '',
        };

        const { error: createErr } = await supabaseAdmin.auth.admin.createUser({
          email: profile.email,
          email_confirm: true,
          user_metadata: userMeta,
        });
        // Ignore "already registered" errors
        if (createErr && !/already|exists|registered/i.test(createErr.message)) {
          console.error('[linkedin] createUser failed', createErr);
          return errorRedirect(origin, 'Could not create account');
        }

        // Ensure profile row exists in public.users
        try {
          const { data: existingProfile } = await supabaseAdmin
            .from('users')
            .select('id')
            .ilike('email', profile.email)
            .maybeSingle();
          if (!existingProfile) {
            // Look up auth user id by email
            const { data: list } = await supabaseAdmin.auth.admin.listUsers();
            const authUser = list?.users?.find(
              (u) => u.email?.toLowerCase() === profile.email!.toLowerCase(),
            );
            if (authUser) {
              await supabaseAdmin.from('users').insert({
                id: authUser.id,
                email: profile.email,
                user_id: profile.email,
                first_name: userMeta.first_name,
                last_name: userMeta.last_name,
                role: 'candidate',
                is_active: true,
                profile_image: userMeta.avatar_url || null,
              });
            }
          }
        } catch (err) {
          console.error('[linkedin] profile upsert warning', err);
        }

        // Generate a magic link so the browser establishes a real session
        const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';
        const redirectTo = `${origin}${safeNext}`;

        const { data: linkData, error: linkErr } = await supabaseAdmin.auth.admin.generateLink({
          type: 'magiclink',
          email: profile.email,
          options: { redirectTo },
        });

        if (linkErr || !linkData?.properties?.action_link) {
          console.error('[linkedin] generateLink failed', linkErr);
          return errorRedirect(origin, 'Could not start session');
        }

        return Response.redirect(linkData.properties.action_link, 302);
      },
    },
  },
});
