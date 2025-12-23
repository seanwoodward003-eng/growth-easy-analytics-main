// app/api/auth/shopify/callback/route.ts
import { NextRequest } from 'next/server';
import { getCurrentUser } from '@/lib/auth';
import { run } from '@/lib/db';
import crypto from 'crypto';

function verifyHMAC(params: URLSearchParams) {
  const hmac = params.get('hmac');
  if (!hmac) return false;
  const message = Array.from(params.entries())
    .filter(([k]) => !['hmac', 'signature'].includes(k))
    .sort()
    .map(([k, v]) => `${k}=${v}`)
    .join('&');
  const digest = crypto.createHmac('sha256', process.env.SHOPIFY_CLIENT_SECRET!).update(message).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(hmac));
}

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!verifyHMAC(params)) {
    return new Response('<script>alert("Invalid signature");window.close();</script>', { status: 400 });
  }

  const code = params.get('code');
  const state = params.get('state');
  if (!code || !state) return new Response('<script>alert("Auth failed");window.close();</script>', { status: 400 });

  const [userIdStr, shop] = state.split('|');
  const userId = parseInt(userIdStr);
  const user = await getCurrentUser();
  if (!user || user.id !== userId) return new Response('Unauthorized', { status: 401 });

  const tokenResp = await fetch(`https://${shop}/admin/oauth/access_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.SHOPIFY_API_KEY,
      client_secret: process.env.SHOPIFY_CLIENT_SECRET,
      code,
    }),
  });

  if (!tokenResp.ok) return new Response('Shopify auth failed', { status: 400 });
  const { access_token } = await tokenResp.json();

  await run('UPDATE users SET shopify_shop = ?, shopify_access_token = ? WHERE id = ?', [shop, access_token, userId]);

  return new Response(
    '<script>alert("Shopify Connected Successfully!");window.close();window.opener.location.reload();</script>'
  );
}