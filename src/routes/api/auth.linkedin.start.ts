import { createFileRoute } from '@tanstack/react-router';
import { setCookie } from '@tanstack/react-start/server';

function randomState() {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

export const Route = createFileRoute('/api/auth/linkedin/start')({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const next = url.searchParams.get('next') || '/';
        const safeNext = next.startsWith('/') && !next.startsWith('//') ? next : '/';

        const clientId = process.env.LINKEDIN_CLIENT_ID;
        if (!clientId) {
          return new Response('LinkedIn is not configured', { status: 500 });
        }

        const state = randomState();
        const redirectUri = `${url.origin}/api/auth/linkedin/callback`;

        setCookie('li_oauth_state', state, {
          httpOnly: true,
          secure: url.protocol === 'https:',
          sameSite: 'lax',
          path: '/',
          maxAge: 600,
        });
        setCookie('li_oauth_next', safeNext, {
          httpOnly: true,
          secure: url.protocol === 'https:',
          sameSite: 'lax',
          path: '/',
          maxAge: 600,
        });

        const authorize = new URL('https://www.linkedin.com/oauth/v2/authorization');
        authorize.searchParams.set('response_type', 'code');
        authorize.searchParams.set('client_id', clientId);
        authorize.searchParams.set('redirect_uri', redirectUri);
        authorize.searchParams.set('state', state);
        authorize.searchParams.set('scope', 'openid profile email');

        return Response.redirect(authorize.toString(), 302);
      },
    },
  },
});
